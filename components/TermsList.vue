<template>
  <div class="c-terms-list">
    <h4>{{ label }}</h4>
    <div v-if="items.length" class="c-chip-list">
      <span v-for="item in items" :key="item" class="c-chip">{{ item }}</span>
    </div>
    <p v-else class="u-muted">-</p>
  </div>
</template>

<script setup lang="ts">
defineProps<{
  label: string
  items: string[]
}>()
</script>
