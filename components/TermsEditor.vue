<template>
  <div class="c-terms-editor">
    <div class="c-terms-header">
      <h4>{{ label }}</h4>
      <p v-if="hint" class="u-muted">{{ hint }}</p>
    </div>

    <div class="c-terms-input">
      <input
        v-model="draft"
        type="text"
        :placeholder="placeholder"
        @keydown.enter.prevent="add"
        @input="onDraftInput"
        @compositionupdate="onDraftCompositionUpdate"
        @compositionend="onDraftCompositionEnd"
      />
      <button class="u-ghost" type="button" @click="add">추가</button>
    </div>

    <div v-if="filteredSuggestions.length" class="c-terms-suggestions">
      <button
        v-for="item in filteredSuggestions"
        :key="item"
        class="c-terms-suggestion"
        type="button"
        @click="addSuggestion(item)"
      >
        {{ item }}
      </button>
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
  suggestions?: string[]
}>()

const emit = defineEmits<{
  (event: 'update:modelValue', value: string[]): void
}>()

const draft = ref('')
const items = computed(() => props.modelValue)
const liveQuery = ref('')

const onDraftInput = (event: Event) => {
  const value = (event.target as { value?: string } | null)?.value ?? ''
  liveQuery.value = value.trim()
}

const onDraftCompositionUpdate = (event: Event) => {
  const value = (event.target as { value?: string } | null)?.value ?? ''
  liveQuery.value = value.trim()
}

const onDraftCompositionEnd = (event: Event) => {
  const value = (event.target as { value?: string } | null)?.value ?? ''
  liveQuery.value = value.trim()
}

const filteredSuggestions = computed(() => {
  const query = liveQuery.value.trim().toLowerCase()
  if (!query) return []
  const candidates = props.suggestions ?? []
  return candidates
    .filter((item) => item.toLowerCase().includes(query))
    .filter((item) => !items.value.includes(item))
    .slice(0, 8)
})

const add = () => {
  const value = draft.value.trim()
  if (!value) return
  if (items.value.includes(value)) {
    draft.value = ''
    liveQuery.value = ''
    return
  }
  emit('update:modelValue', [...items.value, value])
  draft.value = ''
  liveQuery.value = ''
}

const addSuggestion = (value: string) => {
  if (!value) return
  if (items.value.includes(value)) {
    draft.value = ''
    liveQuery.value = ''
    return
  }
  emit('update:modelValue', [...items.value, value])
  draft.value = ''
  liveQuery.value = ''
}

const remove = (index: number) => {
  emit(
    'update:modelValue',
    items.value.filter((_, idx) => idx !== index),
  )
}
</script>
