<template>
  <NuxtLink class="note-card" :to="`/notes/${item.note.id}`">
    <header>
      <div>
        <div class="note-meta-row">
          <p class="eyebrow">{{ kindLabel(item.product.kind) }}</p>
          <p v-if="item.product.producer" class="muted">{{ item.product.producer }}</p>
        </div>
        <h3>{{ item.product.name }}</h3>
      </div>
      <div
        v-if="item.note.rating !== null && item.note.rating !== undefined"
        class="rating-badge"
        :style="{ '--rating': item.note.rating }"
        :aria-label="`평점 ${item.note.rating.toFixed(1)}점`"
      >
        <div class="rating-text">
          <span class="rating-value">{{ item.note.rating.toFixed(1) }}</span>
          <span class="rating-unit">점</span>
        </div>
      </div>
    </header>

    <p v-if="item.note.comment" class="note-comment note-comment-clamp">
      {{ item.note.comment }}
    </p>

    <div v-if="visibleTags.length" class="chip-list note-tags">
      <span v-for="tag in visibleTags" :key="tag" class="chip small">{{ tag }}</span>
    </div>
  </NuxtLink>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { kindLabel } from '~/utils/kind'

const MAX_TAGS = 3

const props = defineProps<{
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

const visibleTags = computed(() => props.item.tags.slice(0, MAX_TAGS))
</script>
