<template>
  <div class="page-notes">
    <section class="c-card">
      <form class="c-filters-grid" @submit.prevent="applyFilters">
        <div class="c-field">
          <label>검색</label>
          <input v-model="filters.q" type="text" placeholder="제품명, 생산자, 코멘트" />
        </div>
        <div class="c-field">
          <label>종류</label>
          <select v-model="filters.kind" @change="applyFilters">
            <option value="">전체</option>
            <option v-for="option in kindOptions" :key="option.value" :value="option.value">
              {{ option.label }}
            </option>
          </select>
        </div>
        <div class="c-field">
          <label>태그</label>
          <input v-model="filters.tag" type="text" placeholder="#피트 #스모키" list="tag-options" />
          <datalist id="tag-options">
            <option v-for="tag in tagsOptions" :key="tag.name" :value="tag.name"></option>
          </datalist>
        </div>
        <div class="c-field">
          <label>정렬</label>
          <select v-model="filters.sort" @change="applyFilters">
            <option value="updatedAt">최근 수정</option>
            <option value="rating">평점</option>
          </select>
        </div>
        <div class="c-field">
          <label>순서</label>
          <select v-model="filters.order" @change="applyFilters">
            <option value="desc">내림차순</option>
            <option value="asc">오름차순</option>
          </select>
        </div>
      </form>
    </section>

    <section v-if="pending" class="u-loading">불러오는 중...</section>
    <section v-else-if="error" class="u-error">{{ error.message }}</section>
    <section v-else class="c-notes-section">
      <div v-if="!data?.items.length" class="u-empty">아직 노트가 없습니다.</div>
      <div v-else class="c-notes-grid">
        <NoteCard v-for="item in data.items" :key="item.note.id" :item="item" />
      </div>

      <div v-if="data?.total" class="c-pagination">
        <button
          class="u-ghost"
          :disabled="appliedFilters.page <= 1"
          @click="goToPage(appliedFilters.page - 1)"
        >
          이전
        </button>
        <span>{{ appliedFilters.page }} / {{ totalPages }}</span>
        <button
          class="u-ghost"
          :disabled="appliedFilters.page >= totalPages"
          @click="goToPage(appliedFilters.page + 1)"
        >
          다음
        </button>
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
import { computed, onBeforeUnmount, reactive, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useAsyncData } from 'nuxt/app'
import { KIND_OPTIONS } from '~/utils/kind'

const route = useRoute()
const router = useRouter()
const kindOptions = KIND_OPTIONS

const toNumber = (value: string | null | undefined, fallback: number) => {
  const num = Number.parseInt(String(value ?? ''), 10)
  return Number.isNaN(num) ? fallback : num
}

const getFiltersFromQuery = (query: typeof route.query) => ({
  q: (query.q as string) || '',
  kind: (query.kind as string) || '',
  tag: (query.tag as string) || '',
  sort: (query.sort as string) || 'updatedAt',
  order: (query.order as string) || 'desc',
  page: toNumber(query.page as string, 1),
  pageSize: 9,
})

type FiltersState = ReturnType<typeof getFiltersFromQuery>

const filters = reactive<FiltersState>(getFiltersFromQuery(route.query))
const appliedFilters = reactive<FiltersState>(getFiltersFromQuery(route.query))
let syncingFromRoute = false
let debounceTimer: ReturnType<typeof setTimeout> | null = null

watch(
  () => route.query,
  (query) => {
    const next = getFiltersFromQuery(query)
    syncingFromRoute = true
    Object.assign(filters, next)
    Object.assign(appliedFilters, next)
    syncingFromRoute = false
  },
)

const buildQueryFromFilters = (source: FiltersState) => ({
  q: source.q || undefined,
  kind: source.kind || undefined,
  tag: source.tag || undefined,
  sort: source.sort,
  order: source.order,
  page: String(source.page),
})

const queryPayload = computed(() => ({
  q: appliedFilters.q || undefined,
  kind: appliedFilters.kind || undefined,
  tag: appliedFilters.tag || undefined,
  sort: appliedFilters.sort,
  order: appliedFilters.order,
  page: appliedFilters.page,
}))

interface NotesListResponse {
  items: Array<{
    note: {
      id: string
      productId: string
      rating: number | null
      comment: string | null
      createdAt: string
      updatedAt: string
    }
    product: {
      id: string
      kind: string
      name: string
      producer: string | null
      country: string | null
      region: string | null
      abv: number | null
      vintage: string | null
      age: number | null
      volumeMl: number | null
      createdAt: string
      updatedAt: string
    }
    tags: string[]
  }>
  total: number
  page: number
  pageSize: number
}

const fetchNotes = () =>
  $fetch<NotesListResponse>('/api/notes' as string, {
    query: queryPayload.value as Record<string, string | number | undefined>,
  })

const { data, pending, error } = await useAsyncData<NotesListResponse>('notes', fetchNotes, {
  watch: [queryPayload],
})

const { data: tagsData } = await useAsyncData('tags', () => $fetch('/api/tags'))

const tagsOptions = computed(() => tagsData.value || [])

const applyFilters = (options?: { replace?: boolean } | Event) => {
  if (debounceTimer) {
    clearTimeout(debounceTimer)
    debounceTimer = null
  }
  const replace =
    Boolean(options && typeof options === 'object' && 'replace' in options) &&
    Boolean((options as { replace?: boolean }).replace)
  const nextFilters: FiltersState = {
    ...filters,
    page: 1,
  }
  Object.assign(appliedFilters, nextFilters)
  filters.page = 1
  const navigate = replace ? router.replace : router.push
  navigate({
    query: buildQueryFromFilters(nextFilters),
  })
}

const goToPage = (page: number) => {
  if (debounceTimer) {
    clearTimeout(debounceTimer)
    debounceTimer = null
  }
  filters.page = page
  appliedFilters.page = page
  router.push({
    query: buildQueryFromFilters(appliedFilters),
  })
}

const totalPages = computed(() => {
  const total = data.value?.total || 0
  return Math.max(1, Math.ceil(total / 9))
})

const scheduleSearch = () => {
  if (syncingFromRoute) return
  if (debounceTimer) clearTimeout(debounceTimer)
  debounceTimer = setTimeout(() => {
    debounceTimer = null
    if (filters.q === appliedFilters.q && filters.tag === appliedFilters.tag) return
    applyFilters({ replace: true })
  }, 500)
}

watch(() => filters.q, scheduleSearch, { flush: 'sync' })
watch(() => filters.tag, scheduleSearch, { flush: 'sync' })

onBeforeUnmount(() => {
  if (debounceTimer) clearTimeout(debounceTimer)
})
</script>
