<template>
  <div class="c-app-shell">
    <header class="c-top-bar">
      <div class="c-brand">
        <NuxtLink to="/" class="c-brand-mark">Tasting Notes</NuxtLink>
        <p>나의 술 이야기</p>
      </div>
      <nav class="c-nav-links" :class="{ 'is-stats': activeNavIndex === 1 }">
        <NuxtLink to="/" class="u-ghost">목록</NuxtLink>
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

const activeNavIndex = computed(() => (route.path.startsWith('/stats') ? 1 : 0))
</script>
