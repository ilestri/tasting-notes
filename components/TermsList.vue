<template>
  <div class="terms-list">
    <h4>{{ label }}</h4>
    <div v-if="items.length" class="chip-list">
      <span v-for="item in items" :key="item" class="chip">{{ item }}</span>
    </div>
    <p v-else class="muted">-</p>
  </div>
</template>

<script setup lang="ts">
defineProps<{
  label: string
  items: string[]
}>()
</script>
