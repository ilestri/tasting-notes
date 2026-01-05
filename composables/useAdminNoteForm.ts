import { computed, reactive, ref } from 'vue'
import type { Ref } from 'vue'
import { getErrorMessage } from '~/utils/errors'
import { parseNumber } from '~/utils/number'
import type { NoteDetailResponse } from '~/types/api'

interface AdminFormState {
  noteId: string | null
  productId: string | null
  product: {
    kind: string
    name: string
    producer: string
    country: string
    region: string
    abv: string
    vintage: string
    age: string
    volume_ml: string
  }
  note: {
    rating: string
    comment: string
  }
  terms: {
    nose: string[]
    palate: string[]
    finish: string[]
    color: string[]
  }
  tags: string[]
  imageUrl: string
}

const createEmptyForm = (): AdminFormState => ({
  noteId: null,
  productId: null,
  product: {
    kind: 'whisky',
    name: '',
    producer: '',
    country: '',
    region: '',
    abv: '',
    vintage: '',
    age: '',
    volume_ml: '',
  },
  note: {
    rating: '',
    comment: '',
  },
  terms: {
    nose: [],
    palate: [],
    finish: [],
    color: [],
  },
  tags: [],
  imageUrl: '',
})

interface UseAdminNoteFormOptions {
  selectedId: Ref<string | null>
  refreshList: () => Promise<void>
}

export const useAdminNoteForm = ({ selectedId, refreshList }: UseAdminNoteFormOptions) => {
  const form = reactive<AdminFormState>(createEmptyForm())
  const formError = ref('')
  const saving = ref(false)
  const deletePending = ref(false)
  const isEdit = computed(() => Boolean(form.noteId))

  const resetForm = () => {
    Object.assign(form, createEmptyForm())
    selectedId.value = null
    formError.value = ''
  }

  const loadNoteDetail = async (id: string) => {
    formError.value = ''
    try {
      const data = await $fetch<NoteDetailResponse>(`/api/notes/${id}` as string)
      const next = createEmptyForm()
      next.noteId = data.note.id
      next.productId = data.product.id
      next.product.kind = data.product.kind
      next.product.name = data.product.name
      next.product.producer = data.product.producer ?? ''
      next.product.country = data.product.country ?? ''
      next.product.region = data.product.region ?? ''
      next.product.abv = data.product.abv !== null ? String(data.product.abv) : ''
      next.product.vintage = data.product.vintage ?? ''
      next.product.age = data.product.age !== null ? String(data.product.age) : ''
      next.product.volume_ml = data.product.volumeMl !== null ? String(data.product.volumeMl) : ''
      next.note.rating = data.note.rating !== null ? String(data.note.rating) : ''
      next.note.comment = data.note.comment ?? ''
      next.terms.nose = data.terms.nose ?? []
      next.terms.palate = data.terms.palate ?? []
      next.terms.finish = data.terms.finish ?? []
      next.terms.color = data.terms.color ?? []
      next.tags = data.tags ?? []
      next.imageUrl =
        data.attachments.find((attachment) => attachment.kind === 'image')?.urlOrPath ?? ''

      Object.assign(form, next)
    } catch (error) {
      formError.value = getErrorMessage(error, '노트를 불러오지 못했습니다.')
    }
  }

  const buildPayload = () => ({
    product: {
      id: form.productId ?? undefined,
      kind: form.product.kind,
      name: form.product.name.trim(),
      producer: form.product.producer.trim() || null,
      country: form.product.country.trim() || null,
      region: form.product.region.trim() || null,
      abv: parseNumber(form.product.abv),
      vintage: form.product.vintage.trim() || null,
      age: parseNumber(form.product.age, true),
      volume_ml: parseNumber(form.product.volume_ml, true),
    },
    note: {
      rating: parseNumber(form.note.rating),
      comment: form.note.comment.trim() || null,
    },
    terms: {
      nose: form.terms.nose,
      palate: form.terms.palate,
      finish: form.terms.finish,
      color: form.terms.color,
    },
    tags: form.tags,
    attachments: form.imageUrl.trim()
      ? [
          {
            kind: 'image',
            url_or_path: form.imageUrl.trim(),
            mime: null,
          },
        ]
      : [],
  })

  const saveNote = async () => {
    formError.value = ''
    if (!form.product.name.trim()) {
      formError.value = '제품 이름은 필수입니다.'
      return
    }
    saving.value = true
    try {
      const payload = buildPayload()
      if (form.noteId) {
        await $fetch(`/api/admin/notes/${form.noteId}`, {
          method: 'PUT',
          body: payload,
        })
      } else {
        const result = await $fetch<{ id: string }>('/api/admin/notes', {
          method: 'POST',
          body: payload,
        })
        selectedId.value = result.id
        await loadNoteDetail(result.id)
      }
      await refreshList()
    } catch (error) {
      formError.value = getErrorMessage(error, '저장에 실패했습니다.')
    } finally {
      saving.value = false
    }
  }

  const confirmDelete = () => {
    if (!import.meta.client) return true
    const confirmFn = (globalThis as { confirm?: (message: string) => boolean }).confirm
    return confirmFn ? confirmFn('정말 삭제할까요?') : true
  }

  const deleteNote = async () => {
    if (!form.noteId) return
    if (!confirmDelete()) return
    deletePending.value = true
    formError.value = ''
    try {
      await $fetch(`/api/admin/notes/${form.noteId}`, {
        method: 'DELETE',
      })
      resetForm()
      await refreshList()
    } catch (error) {
      formError.value = getErrorMessage(error, '삭제에 실패했습니다.')
    } finally {
      deletePending.value = false
    }
  }

  return {
    form,
    formError,
    saving,
    deletePending,
    isEdit,
    resetForm,
    loadNoteDetail,
    saveNote,
    deleteNote,
  }
}
