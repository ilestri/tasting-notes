<template>
  <div class="c-app-shell">
    <header class="c-top-bar">
      <div class="c-brand">
        <NuxtLink :to="listLink" class="c-brand-mark">Tasting Notes</NuxtLink>
        <p>나의 술 이야기</p>
      </div>
      <nav class="c-nav-links">
        <NuxtLink :to="listLink" class="u-ghost">목록</NuxtLink>
        <NuxtLink to="/stats" class="u-ghost">통계</NuxtLink>
      </nav>
    </header>

    <main class="c-main-content">
      <slot />
    </main>

    <footer class="c-footer">
      <p>푸터자리</p>
    </footer>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useRoute } from 'vue-router'

const route = useRoute()

const listLink = computed(() => {
  const keys = ['q', 'kind', 'tag', 'sort', 'order', 'page', 'pageSize'] as const
  const query: Record<string, string | string[]> = {}

  for (const key of keys) {
    const value = route.query[key]
    if (value === undefined || value === null) continue
    if (Array.isArray(value)) {
      const filtered = value.filter((entry) => entry !== null)
      if (filtered.length) {
        query[key] = filtered
      }
      continue
    }
    query[key] = value
  }

  return { path: '/', query }
})
</script>
