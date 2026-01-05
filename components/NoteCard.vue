<template>
  <NuxtLink class="c-note-card" :to="noteLink">
    <header>
      <div>
        <div class="c-note-meta-row">
          <p class="c-eyebrow">{{ kindLabel(item.product.kind) }}</p>
          <p v-if="item.product.producer" class="u-muted">{{ item.product.producer }}</p>
        </div>
        <h3>{{ item.product.name }}</h3>
      </div>
      <div
        v-if="item.note.rating !== null && item.note.rating !== undefined"
        class="c-rating-badge"
        :style="{ '--rating': item.note.rating }"
        :aria-label="`평점 ${item.note.rating.toFixed(1)}점`"
      >
        <div class="c-rating-text">
          <span class="c-rating-value">{{ item.note.rating.toFixed(1) }}</span>
          <span class="c-rating-unit">점</span>
        </div>
      </div>
    </header>

    <p v-if="item.note.comment" class="c-note-comment c-note-comment-clamp">
      {{ item.note.comment }}
    </p>

    <div v-if="visibleTags.length" class="c-chip-list c-note-tags">
      <span v-for="tag in visibleTags" :key="tag" class="c-chip u-small">{{ tag }}</span>
    </div>
  </NuxtLink>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useRoute } from 'vue-router'
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

const route = useRoute()

const noteLink = computed(() => ({
  path: `/notes/${props.item.note.id}`,
  query: route.query,
}))

const visibleTags = computed(() => props.item.tags.slice(0, MAX_TAGS))
</script>
