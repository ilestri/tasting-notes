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
          <select v-model="filters.kind">
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
          <select v-model="filters.sort">
            <option value="updatedAt">최근 수정</option>
            <option value="rating">평점</option>
          </select>
        </div>
        <div class="c-field">
          <label>순서</label>
          <select v-model="filters.order">
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
        <button class="u-ghost" :disabled="filters.page <= 1" @click="goToPage(filters.page - 1)">
          이전
        </button>
        <span>{{ filters.page }} / {{ totalPages }}</span>
        <button
          class="u-ghost"
          :disabled="filters.page >= totalPages"
          @click="goToPage(filters.page + 1)"
        >
          다음
        </button>
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
import { computed, reactive, watch } from 'vue'
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
  pageSize: toNumber(query.pageSize as string, 9),
})

const filters = reactive(getFiltersFromQuery(route.query))

const isSameFilters = (next: ReturnType<typeof getFiltersFromQuery>) =>
  filters.q === next.q &&
  filters.kind === next.kind &&
  filters.tag === next.tag &&
  filters.sort === next.sort &&
  filters.order === next.order &&
  filters.page === next.page &&
  filters.pageSize === next.pageSize

watch(
  () => route.query,
  (query) => {
    const next = getFiltersFromQuery(query)
    if (!isSameFilters(next)) {
      Object.assign(filters, next)
    }
  },
)

const normalizeQuery = (query: Record<string, string | string[] | undefined>) => {
  const normalized: Record<string, string> = {}
  for (const [key, value] of Object.entries(query)) {
    if (value === undefined) continue
    if (Array.isArray(value)) {
      if (value[0] !== undefined) normalized[key] = String(value[0])
      continue
    }
    normalized[key] = String(value)
  }
  return normalized
}

const buildQueryFromFilters = () => ({
  q: filters.q || undefined,
  kind: filters.kind || undefined,
  tag: filters.tag || undefined,
  sort: filters.sort,
  order: filters.order,
  page: String(filters.page),
  pageSize: String(filters.pageSize),
})

const isSameQuery = (
  current: Record<string, string>,
  next: Record<string, string>,
) => {
  const currentKeys = Object.keys(current)
  const nextKeys = Object.keys(next)
  if (currentKeys.length !== nextKeys.length) return false
  return currentKeys.every((key) => current[key] === next[key])
}

watch(
  filters,
  () => {
    const nextQuery = buildQueryFromFilters()
    const current = normalizeQuery(route.query as Record<string, string | string[] | undefined>)
    const next = normalizeQuery(nextQuery)
    if (!isSameQuery(current, next)) {
      router.replace({ query: nextQuery })
    }
  },
  { deep: true },
)

const queryPayload = computed(() => ({
  q: filters.q || undefined,
  kind: filters.kind || undefined,
  tag: filters.tag || undefined,
  sort: filters.sort,
  order: filters.order,
  page: filters.page,
  pageSize: filters.pageSize,
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

const applyFilters = () => {
  router.push({
    query: {
      q: filters.q || undefined,
      kind: filters.kind || undefined,
      tag: filters.tag || undefined,
      sort: filters.sort,
      order: filters.order,
      page: '1',
      pageSize: String(filters.pageSize),
    },
  })
}

const goToPage = (page: number) => {
  router.push({
    query: {
      ...route.query,
      page: String(page),
    },
  })
}

const totalPages = computed(() => {
  const total = data.value?.total || 0
  return Math.max(1, Math.ceil(total / filters.pageSize))
})
</script>
