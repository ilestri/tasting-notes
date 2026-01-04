<template>
  <div>
    <section class="token-panel">
      <AdminTokenField />
    </section>

    <NoteForm :initial="form" submit-label="저장" :busy="saving" @submit="handleSubmit" />

    <p v-if="error" class="error">{{ error }}</p>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { navigateTo } from 'nuxt/app'
import { useAdminToken } from '~/composables/useAdminToken'
import type { NoteFormModel } from '~/types/noteForm'
import { mapFromFields } from '~/utils/customFields'
import { getErrorMessage } from '~/utils/errors'

const token = useAdminToken()
const saving = ref(false)
const error = ref('')

const createForm = (): NoteFormModel => ({
  product: {
    kind: 'whisky',
    name: '',
    producer: null,
    country: null,
    region: null,
    abv: null,
    vintage: null,
    age: null,
    volume_ml: null,
    extraFields: [],
  },
  note: {
    rating: null,
    comment: null,
    extraFields: [],
  },
  terms: {
    nose: [],
    palate: [],
    finish: [],
    color: [],
  },
  tags: [],
  attachments: [],
})

const form = ref<NoteFormModel>(createForm())

const handleSubmit = async (payload: NoteFormModel) => {
  error.value = ''
  if (!token.value) {
    error.value = 'ADMIN_TOKEN을 먼저 입력하세요.'
    return
  }
  const authToken = token.value.trim()
  if (!authToken) {
    error.value = 'ADMIN_TOKEN을 확인하세요.'
    return
  }

  saving.value = true
  try {
    const body = {
      product: {
        ...payload.product,
        extraFields: mapFromFields(payload.product.extraFields),
      },
      note: {
        ...payload.note,
        extraFields: mapFromFields(payload.note.extraFields),
      },
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

    const result = await $fetch<{ id: string }>('/api/notes', {
      method: 'POST',
      body,
      headers: {
        Authorization: `Bearer ${authToken}`,
      },
    })

    await navigateTo(`/notes/${result.id}`)
  } catch (err: unknown) {
    error.value = getErrorMessage(err, '저장에 실패했습니다.')
  } finally {
    saving.value = false
  }
}
</script>
