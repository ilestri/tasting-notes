<template>
  <div class="app-shell">
    <header class="top-bar">
      <div class="brand">
        <NuxtLink :to="listLink" class="brand-mark">Tasting Notes</NuxtLink>
        <p>나의 술 이야기</p>
      </div>
      <nav class="nav-links">
        <NuxtLink :to="listLink" class="ghost">목록</NuxtLink>
        <NuxtLink to="/stats" class="ghost">통계</NuxtLink>
        <NuxtLink to="/notes/new" class="primary">새 노트</NuxtLink>
      </nav>
    </header>

    <main class="main-content">
      <slot />
    </main>

    <footer class="footer">
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
    if (value !== undefined) {
      query[key] = value
    }
  }

  return { path: '/', query }
})
</script>
