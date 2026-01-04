<template>
  <section class="card lookup">
    <header class="section-header">
      <h3>제품 불러오기</h3>
      <p class="muted">기존 제품을 선택해 폼을 자동 채울 수 있습니다.</p>
    </header>

    <div class="lookup-controls">
      <div class="field">
        <label>검색</label>
        <input v-model="query" type="text" placeholder="제품명으로 검색" @keydown.enter.prevent />
      </div>
      <div class="field">
        <label>종류</label>
        <select v-model="kindFilter">
          <option value="">전체</option>
          <option v-for="option in kindOptions" :key="option.value" :value="option.value">
            {{ option.label }}
          </option>
        </select>
      </div>
      <button class="ghost" type="button" @click="clearSelection">연결 해제</button>
    </div>

    <p v-if="pending" class="muted">검색 중...</p>
    <ul v-else class="lookup-list">
      <li v-for="item in results" :key="item.id">
        <button type="button" @click="selectProduct(item)">
          <strong>{{ item.name }}</strong>
          <span v-if="item.producer">· {{ item.producer }}</span>
          <span class="muted">({{ kindLabel(item.kind) }})</span>
        </button>
      </li>
    </ul>
    <p v-if="!pending && query && !results.length" class="muted">검색 결과가 없습니다.</p>
  </section>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'
import { KIND_OPTIONS, kindLabel } from '~/utils/kind'
interface ProductResult {
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
}

const emit = defineEmits<{
  (event: 'select', value: ProductResult): void
  (event: 'clear'): void
}>()

const query = ref('')
const kindFilter = ref('')
const pending = ref(false)
const results = ref<ProductResult[]>([])
const kindOptions = KIND_OPTIONS
let timer: ReturnType<typeof setTimeout> | null = null

const fetchProducts = async () => {
  if (!query.value.trim()) {
    results.value = []
    return
  }
  pending.value = true
  try {
    const data = await $fetch<ProductResult[]>('/api/products', {
      query: {
        q: query.value.trim(),
        kind: kindFilter.value || undefined,
        limit: 8,
      },
    })
    results.value = data
  } finally {
    pending.value = false
  }
}

watch([query, kindFilter], () => {
  if (timer) clearTimeout(timer)
  timer = setTimeout(fetchProducts, 250)
})

const selectProduct = (item: ProductResult) => {
  emit('select', item)
}

const clearSelection = () => {
  emit('clear')
}
</script>
