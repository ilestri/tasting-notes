<template>
  <section v-if="pending" class="u-loading">불러오는 중...</section>
  <section v-else-if="error" class="u-error">{{ error.message }}</section>
  <section v-else>
    <section class="c-page-header">
      <div>
        <h1>노트 수정</h1>
        <p class="u-muted">기록을 업데이트합니다.</p>
      </div>
    </section>

    <NoteForm
      v-if="form"
      :initial="form"
      submit-label="업데이트"
      :busy="saving"
      @submit="handleSubmit"
    />

    <p v-if="errorMessage" class="u-error">{{ errorMessage }}</p>
  </section>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { useRoute } from 'vue-router'
import { navigateTo, useAsyncData } from 'nuxt/app'
import { useAdminToken } from '~/composables/useAdminToken'
import type { NoteFormModel } from '~/types/noteForm'
import { getErrorMessage } from '~/utils/errors'

const route = useRoute()
const token = useAdminToken()
const saving = ref(false)
const errorMessage = ref('')

interface NoteDetailResponse {
  note: {
    id: string
    productId: string
    rating: number | null
    comment: string | null
    createdAt: string
    updatedAt: string
  }
  product: {
    id: string
    kind: string
    name: string
    producer: string | null
    country: string | null
    region: string | null
    abv: number | null
    vintage: string | null
    age: number | null
    volumeMl: number | null
    createdAt: string
    updatedAt: string
  }
  terms: {
    nose: string[]
    palate: string[]
    finish: string[]
    color: string[]
  }
  tags: string[]
  attachments: Array<{
    id: string
    noteId: string
    kind: 'image' | 'file'
    urlOrPath: string
    mime: string | null
    createdAt: string
  }>
}

const noteId = computed(() => String(route.params.id || ''))

const fetchNote = () => $fetch<NoteDetailResponse>(`/api/notes/${noteId.value}` as string)

const { data, pending, error } = await useAsyncData<NoteDetailResponse>(
  () => `note-${noteId.value}`,
  fetchNote,
  { watch: [noteId] },
)

const form = ref<NoteFormModel | null>(null)

watch(
  data,
  (value) => {
    if (!value) return
    const attachments = Array.isArray(value.attachments)
      ? (value.attachments as Array<{
          kind?: string
          urlOrPath?: string
          mime?: string | null
        }>)
      : []

    form.value = {
      product: {
        id: value.product.id,
        kind: value.product.kind,
        name: value.product.name,
        producer: value.product.producer,
        country: value.product.country,
        region: value.product.region,
        abv: value.product.abv,
        vintage: value.product.vintage,
        age: value.product.age,
        volume_ml: value.product.volumeMl,
      },
      note: {
        rating: value.note.rating,
        comment: value.note.comment,
      },
      terms: {
        nose: value.terms.nose || [],
        palate: value.terms.palate || [],
        finish: value.terms.finish || [],
        color: value.terms.color || [],
      },
      tags: value.tags || [],
      attachments: attachments.map((attachment) => ({
        kind: attachment.kind === 'image' || attachment.kind === 'file' ? attachment.kind : 'file',
        url_or_path: attachment.urlOrPath || '',
        mime: attachment.mime ?? null,
      })),
    }
  },
  { immediate: true },
)

const handleSubmit = async (payload: NoteFormModel) => {
  errorMessage.value = ''
  if (!token.value) {
    errorMessage.value = 'ADMIN_TOKEN을 먼저 입력하세요.'
    return
  }
  const authToken = token.value.trim()
  if (!authToken) {
    errorMessage.value = 'ADMIN_TOKEN을 확인하세요.'
    return
  }
  if (!data.value) return

  saving.value = true
  try {
    const body = {
      product: payload.product,
      note: payload.note,
      terms: payload.terms,
      tags: payload.tags,
      attachments: payload.attachments
        .map((attachment) => ({
          kind: attachment.kind,
          url_or_path: attachment.url_or_path.trim(),
          mime: attachment.mime ? attachment.mime.trim() : null,
        }))
        .filter((attachment) => attachment.url_or_path.length > 0),
    }

    await $fetch(`/api/notes/${data.value.note.id}`, {
      method: 'PUT',
      body,
      headers: {
        Authorization: `Bearer ${authToken}`,
      },
    })

    await navigateTo(`/notes/${data.value.note.id}`)
  } catch (err: unknown) {
    errorMessage.value = getErrorMessage(err, '업데이트에 실패했습니다.')
  } finally {
    saving.value = false
  }
}
</script>
