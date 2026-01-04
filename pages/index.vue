<template>
  <div>
    <section class="card filters">
      <form class="filters-grid" @submit.prevent="applyFilters">
        <div class="field">
          <label>검색</label>
          <input v-model="filters.q" type="text" placeholder="제품명, 생산자, 코멘트" />
        </div>
        <div class="field">
          <label>종류</label>
          <select v-model="filters.kind">
            <option value="">전체</option>
            <option v-for="option in kindOptions" :key="option.value" :value="option.value">
              {{ option.label }}
            </option>
          </select>
        </div>
        <div class="field">
          <label>태그</label>
          <input v-model="filters.tag" type="text" placeholder="#peat #smoky" list="tag-options" />
          <datalist id="tag-options">
            <option v-for="tag in tagsOptions" :key="tag.name" :value="tag.name"></option>
          </datalist>
        </div>
        <div class="field">
          <label>정렬</label>
          <select v-model="filters.sort">
            <option value="updatedAt">최근 수정</option>
            <option value="rating">평점</option>
          </select>
        </div>
        <div class="field">
          <label>순서</label>
          <select v-model="filters.order">
            <option value="desc">내림차순</option>
            <option value="asc">오름차순</option>
          </select>
        </div>
      </form>
    </section>

    <section v-if="pending" class="loading">불러오는 중...</section>
    <section v-else-if="error" class="error">{{ error.message }}</section>
    <section v-else class="notes-section">
      <div v-if="!data?.items.length" class="empty">아직 노트가 없습니다.</div>
      <div v-else class="notes-grid">
        <NoteCard v-for="item in data.items" :key="item.note.id" :item="item" />
      </div>

      <div v-if="data?.total" class="pagination">
        <button class="ghost" :disabled="filters.page <= 1" @click="goToPage(filters.page - 1)">
          이전
        </button>
        <span>{{ filters.page }} / {{ totalPages }}</span>
        <button
          class="ghost"
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

const filters = reactive({
  q: (route.query.q as string) || '',
  kind: (route.query.kind as string) || '',
  tag: (route.query.tag as string) || '',
  sort: (route.query.sort as string) || 'updatedAt',
  order: (route.query.order as string) || 'desc',
  page: toNumber(route.query.page as string, 1),
  pageSize: toNumber(route.query.pageSize as string, 9),
})

watch(
  () => route.query,
  (query) => {
    filters.q = (query.q as string) || ''
    filters.kind = (query.kind as string) || ''
    filters.tag = (query.tag as string) || ''
    filters.sort = (query.sort as string) || 'updatedAt'
    filters.order = (query.order as string) || 'desc'
    filters.page = toNumber(query.page as string, 1)
    filters.pageSize = toNumber(query.pageSize as string, 9)
  },
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
