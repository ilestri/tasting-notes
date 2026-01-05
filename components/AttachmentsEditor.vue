<template>
  <section class="c-card">
    <header class="c-section-header">
      <h3>첨부 파일</h3>
      <p class="u-muted">이미지 URL 또는 파일 경로를 기록합니다.</p>
    </header>

    <div class="c-field-grid">
      <div v-for="(attachment, index) in attachments" :key="index" class="c-field-row">
        <div class="c-field">
          <label>종류</label>
          <select v-model="attachment.kind" @change="emitChange">
            <option value="image">Image</option>
            <option value="file">File</option>
          </select>
        </div>
        <div class="c-field">
          <label>URL/Path</label>
          <input
            v-model="attachment.url_or_path"
            type="text"
            placeholder="https://... 또는 /path/file"
            @input="emitChange"
          />
          <p v-if="!attachment.url_or_path.trim()" class="u-error">경로를 입력하세요.</p>
        </div>
        <div class="c-field">
          <label>MIME (선택)</label>
          <input
            v-model="attachment.mime"
            type="text"
            placeholder="image/jpeg"
            @input="emitChange"
          />
        </div>
        <button class="u-ghost" type="button" @click="removeAttachment(index)">삭제</button>
      </div>
    </div>

    <button class="u-primary" type="button" @click="addAttachment">+ 첨부 추가</button>
  </section>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { AttachmentForm } from '~/types/noteForm'

const props = defineProps<{
  modelValue: AttachmentForm[]
}>()

const emit = defineEmits<{
  (event: 'update:modelValue', value: AttachmentForm[]): void
}>()

const attachments = computed(() => props.modelValue)

const emitChange = () => {
  emit('update:modelValue', [...attachments.value])
}

const addAttachment = () => {
  emit('update:modelValue', [...attachments.value, { kind: 'image', url_or_path: '', mime: null }])
}

const removeAttachment = (index: number) => {
  emit(
    'update:modelValue',
    attachments.value.filter((_, idx) => idx !== index),
  )
}
</script>
