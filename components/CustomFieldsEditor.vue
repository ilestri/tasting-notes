<template>
  <section class="card">
    <header class="section-header">
      <h3>{{ title }}</h3>
      <p v-if="description" class="muted">{{ description }}</p>
    </header>

    <div class="field-grid">
      <div v-for="(field, index) in fields" :key="index" class="field-row">
        <div class="field">
          <label>Key</label>
          <input v-model="field.key" type="text" placeholder="ex: peat_ppm" @input="emitChange" />
          <p v-if="duplicateKeys.has(field.key.trim())" class="error">중복 키입니다.</p>
        </div>

        <div class="field">
          <label>Type</label>
          <select v-model="field.type" @change="onTypeChange(field)">
            <option value="string">String</option>
            <option value="number">Number</option>
            <option value="boolean">Boolean</option>
          </select>
        </div>

        <div class="field">
          <label>Value</label>
          <input
            v-if="field.type === 'string'"
            v-model="field.value"
            type="text"
            placeholder="값"
            @input="emitChange"
          />
          <input
            v-else-if="field.type === 'number'"
            v-model.number="field.value"
            type="number"
            step="0.1"
            @input="emitChange"
          />
          <label v-else class="checkbox">
            <input v-model="field.value" type="checkbox" @change="emitChange" />
            <span>True</span>
          </label>
        </div>

        <button class="ghost" type="button" @click="removeField(index)">삭제</button>
      </div>
    </div>

    <button class="primary" type="button" @click="addField">+ 필드 추가</button>
  </section>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { CustomField } from '~/types/customFields'

const props = defineProps<{
  modelValue: CustomField[]
  title: string
  description?: string
}>()

const emit = defineEmits<{
  (event: 'update:modelValue', value: CustomField[]): void
}>()

const fields = computed(() => props.modelValue)

const duplicateKeys = computed(() => {
  const counts: Record<string, number> = {}
  for (const field of fields.value) {
    const key = field.key.trim()
    if (!key) continue
    counts[key] = (counts[key] || 0) + 1
  }
  return new Set(Object.keys(counts).filter((key) => counts[key] > 1))
})

const emitChange = () => {
  emit('update:modelValue', [...fields.value])
}

const addField = () => {
  const next = [
    ...fields.value,
    {
      key: '',
      type: 'string',
      value: '',
    },
  ] as CustomField[]
  emit('update:modelValue', next)
}

const removeField = (index: number) => {
  const next = fields.value.filter((_, idx) => idx !== index)
  emit('update:modelValue', next)
}

const onTypeChange = (field: CustomField) => {
  if (field.type === 'number') {
    field.value = 0
  } else if (field.type === 'boolean') {
    field.value = false
  } else {
    field.value = ''
  }
  emitChange()
}
</script>
