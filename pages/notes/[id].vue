<template>
  <section v-if="pending" class="loading">불러오는 중...</section>
  <section v-else-if="error" class="error">{{ error.message }}</section>
  <section v-else-if="data && data.product" class="detail">
    <header class="detail-header">
      <div>
        <div class="note-meta-row">
          <p class="eyebrow">{{ kindLabel(data.product.kind) }}</p>
          <p v-if="data.product.producer" class="muted">{{ data.product.producer }}</p>
        </div>
        <h1>{{ data.product.name }}</h1>
      </div>
    </header>

    <section class="card">
      <h2>평점/메모</h2>
      <div class="rating-layout">
        <div class="rating-block">
          <label>평점</label>
          <p>{{ data.note.rating ?? '-' }}</p>
        </div>
        <div class="comment-block">
          <label>메모</label>
          <p v-if="data.note.comment" class="note-comment">{{ data.note.comment }}</p>
          <p v-else class="muted">메모 없음</p>
        </div>
      </div>
    </section>

    <section class="card">
      <h2>향/맛/피니시/색</h2>
      <div class="terms-grid">
        <TermsList label="Nose" :items="data.terms.nose" />
        <TermsList label="Palate" :items="data.terms.palate" />
        <TermsList label="Finish" :items="data.terms.finish" />
        <TermsList label="Color" :items="data.terms.color" />
      </div>
    </section>

    <section class="card product-card">
      <div class="product-media">
        <img
          v-if="imageAttachment"
          :src="imageAttachment.urlOrPath"
          :alt="data.product?.name ? data.product.name + ' 이미지' : '첨부 이미지'"
        />
        <p v-else class="muted">이미지 없음</p>
      </div>
      <div class="product-info">
        <h2>제품 정보</h2>
        <div class="summary-grid">
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
        <div class="product-tags">
          <h2 class="product-tags-title">태그</h2>
          <div v-if="data.tags.length" class="chip-list">
            <span v-for="tag in data.tags" :key="tag" class="chip">{{ tag }}</span>
          </div>
          <p v-else class="muted">태그 없음</p>
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

<style scoped>
.product-card {
  display: grid;
  grid-template-columns: minmax(0, 1.4fr) minmax(0, 1fr);
  gap: 1.5rem;
  align-items: start;
}

.product-media {
  border: 1px solid var(--line);
  border-radius: 16px;
  padding: 1rem;
  background: #fff;
  min-height: 320px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.product-media img {
  width: 100%;
  height: auto;
  max-height: 520px;
  object-fit: contain;
}

.product-info .summary-grid {
  margin-top: 1rem;
}

.product-tags {
  margin-top: 1.5rem;
}

.product-tags-title {
  margin: 0 0 0.6rem 0;
}

.rating-layout {
  display: grid;
  grid-template-columns: minmax(0, 160px) minmax(0, 1fr);
  gap: 1.2rem;
  align-items: start;
  margin-top: 1rem;
}

.rating-block {
  border: 1px solid var(--line);
  border-radius: 12px;
  padding: 0.85rem;
  text-align: center;
  background: #fff;
}

.rating-block label {
  display: block;
  font-size: 0.75rem;
  color: var(--muted);
  margin-bottom: 0.35rem;
}

.rating-block p {
  font-size: 1.4rem;
  font-weight: 600;
  margin: 0;
}

.comment-block label {
  display: block;
  font-size: 0.75rem;
  color: var(--muted);
  margin-bottom: 0.35rem;
}

.comment-block .note-comment {
  margin: 0;
}

@media (max-width: 900px) {
  .product-card {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 720px) {
  .rating-layout {
    grid-template-columns: 1fr;
  }
}
</style>
