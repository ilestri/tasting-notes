<template>
  <div class="c-terms-editor">
    <div class="c-terms-header">
      <h4>{{ label }}</h4>
      <p v-if="hint" class="u-muted">{{ hint }}</p>
    </div>

    <div class="c-terms-input">
      <input v-model="draft" type="text" :placeholder="placeholder" @keydown.enter.prevent="add" />
      <button class="u-ghost" type="button" @click="add">추가</button>
    </div>

    <div v-if="items.length" class="c-chip-list">
      <span v-for="(item, index) in items" :key="item + index" class="c-chip">
        {{ item }}
        <button type="button" @click="remove(index)">×</button>
      </span>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
const props = defineProps<{
  modelValue: string[]
  label: string
  hint?: string
  placeholder?: string
}>()

const emit = defineEmits<{
  (event: 'update:modelValue', value: string[]): void
}>()

const draft = ref('')

const items = computed(() => props.modelValue)

const add = () => {
  const value = draft.value.trim()
  if (!value) return
  if (items.value.includes(value)) {
    draft.value = ''
    return
  }
  emit('update:modelValue', [...items.value, value])
  draft.value = ''
}

const remove = (index: number) => {
  emit(
    'update:modelValue',
    items.value.filter((_, idx) => idx !== index),
  )
}
</script>
