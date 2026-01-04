<template>
  <article class="note-card">
    <header>
      <div>
        <p class="eyebrow">{{ kindLabel(item.product.kind) }}</p>
        <h3>{{ item.product.name }}</h3>
        <p v-if="item.product.producer" class="muted">{{ item.product.producer }}</p>
      </div>
      <div
        v-if="item.note.rating !== null && item.note.rating !== undefined"
        class="rating-badge"
        :aria-label="`평점 ${item.note.rating.toFixed(1)}점`"
      >
        <span class="rating-label">평점</span>
        <span class="rating-value">{{ item.note.rating.toFixed(1) }}</span>
      </div>
    </header>

    <p v-if="item.note.comment" class="note-comment">{{ item.note.comment }}</p>

    <div v-if="item.tags.length" class="chip-list">
      <span v-for="tag in item.tags" :key="tag" class="chip small">{{ tag }}</span>
    </div>

    <NuxtLink class="ghost" :to="`/notes/${item.note.id}`">상세 보기 →</NuxtLink>
  </article>
</template>

<script setup lang="ts">
import { kindLabel } from '~/utils/kind'
defineProps<{
  item: {
    note: {
      id: string
      rating: number | null
      comment: string | null
    }
    product: {
      kind: string
      name: string
      producer: string | null
    }
    tags: string[]
  }
}>()
</script>
