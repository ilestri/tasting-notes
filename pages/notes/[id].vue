<template>
  <section v-if="pending" class="u-loading">불러오는 중...</section>
  <section v-else-if="error" class="u-error">{{ error.message }}</section>
  <section v-else-if="data && data.product" class="page-detail">
    <header class="c-detail-header">
      <div>
        <div class="c-note-meta-row">
          <p class="c-eyebrow">{{ kindLabel(data.product.kind) }}</p>
          <p v-if="data.product.producer" class="u-muted">{{ data.product.producer }}</p>
        </div>
        <h1>{{ data.product.name }}</h1>
      </div>
    </header>

    <section class="c-card">
      <h2>평점/메모</h2>
      <div class="c-rating-layout">
        <div class="c-rating-block">
          <label>평점</label>
          <p>{{ data.note.rating ?? '-' }}</p>
        </div>
        <div class="c-comment-block">
          <label>메모</label>
          <p v-if="data.note.comment" class="c-note-comment">{{ data.note.comment }}</p>
          <p v-else class="u-muted">메모 없음</p>
        </div>
      </div>
    </section>

    <section class="c-card">
      <h2>향/맛/피니시/색</h2>
      <div class="c-terms-grid">
        <TermsList label="Nose" :items="data.terms.nose" />
        <TermsList label="Palate" :items="data.terms.palate" />
        <TermsList label="Finish" :items="data.terms.finish" />
        <TermsList label="Color" :items="data.terms.color" />
      </div>
    </section>

    <section class="c-card c-product-card">
      <div class="c-product-media">
        <img
          v-if="imageAttachment"
          :src="imageAttachment.urlOrPath"
          :alt="data.product?.name ? data.product.name + ' 이미지' : '첨부 이미지'"
        />
        <p v-else class="u-muted">이미지 없음</p>
      </div>
      <div class="c-product-info">
        <h2>제품 정보</h2>
        <div class="c-summary-grid">
          <div>
            <label>국가</label>
            <p>{{ data.product.country || '-' }}</p>
          </div>
          <div>
            <label>지역</label>
            <p>{{ data.product.region || '-' }}</p>
          </div>
          <div>
            <label>도수</label>
            <p>{{ data.product.abv !== null ? `${data.product.abv}%` : '-' }}</p>
          </div>
          <div>
            <label>빈티지</label>
            <p>{{ data.product.vintage || '-' }}</p>
          </div>
          <div>
            <label>숙성</label>
            <p>{{ data.product.age !== null ? `${data.product.age}년` : 'NAS' }}</p>
          </div>
          <div>
            <label>용량</label>
            <p>{{ data.product.volumeMl !== null ? `${data.product.volumeMl}ml` : '-' }}</p>
          </div>
        </div>
        <div class="c-product-tags">
          <h2 class="c-product-tags-title">태그</h2>
          <div v-if="data.tags.length" class="c-chip-list">
            <span v-for="tag in data.tags" :key="tag" class="c-chip">{{ tag }}</span>
          </div>
          <p v-else class="u-muted">태그 없음</p>
        </div>
      </div>
    </section>
  </section>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import { useAsyncData } from 'nuxt/app'
import { kindLabel } from '~/utils/kind'

const route = useRoute()

interface NoteDetailResponse {
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
  terms: {
    nose: string[]
    palate: string[]
    finish: string[]
    color: string[]
  }
  tags: string[]
  attachments: Array<{
    id: string
    noteId: string
    kind: 'image' | 'file'
    urlOrPath: string
    mime: string | null
    createdAt: string
  }>
}

const noteId = computed(() => String(route.params.id || ''))

const fetchNote = () => $fetch<NoteDetailResponse>(`/api/notes/${noteId.value}` as string)

const { data, pending, error } = await useAsyncData<NoteDetailResponse>(
  () => `note-${noteId.value}`,
  fetchNote,
  { watch: [noteId] },
)

const imageAttachment = computed(() => {
  if (!data.value) return null
  return data.value.attachments.find((item) => item.kind === 'image') ?? null
})
</script>
