<template>
  <div class="app-shell">
    <header class="top-bar">
      <div class="brand">
        <NuxtLink to="/" class="brand-mark">Tasting Notes</NuxtLink>
        <p>나의 술 이야기</p>
      </div>
      <nav class="nav-links">
        <NuxtLink to="/" class="ghost">노트 목록</NuxtLink>
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
