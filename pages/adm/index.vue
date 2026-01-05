<template>
  <div class="page-admin">
    <header class="c-admin-header">
      <div>
        <h1 class="c-admin-title">관리자</h1>
        <p class="u-muted">노트 추가, 수정, 삭제를 관리합니다.</p>
      </div>
      <div class="c-admin-actions">
        <button class="u-ghost" type="button" @click="resetForm">새 노트</button>
        <button class="u-ghost" type="button" @click="logout">로그아웃</button>
      </div>
    </header>

    <div class="c-admin-layout">
      <section class="c-card c-admin-panel">
        <div class="c-admin-panel-header">
          <h2>노트 목록</h2>
          <span class="u-muted">{{ listData?.total ?? 0 }}건</span>
        </div>

        <form class="c-admin-search" @submit.prevent="applySearch">
          <input v-model="search" type="text" placeholder="이름/생산자/코멘트 검색" />
          <button class="u-ghost" type="submit">검색</button>
        </form>

        <section v-if="listPending" class="u-loading">불러오는 중...</section>
        <section v-else-if="listError" class="u-error">{{ listError.message }}</section>
        <ul v-else class="c-admin-list">
          <li v-for="item in listData?.items ?? []" :key="item.note.id">
            <button
              type="button"
              class="c-admin-list-item"
              :class="{ 'is-active': item.note.id === selectedId }"
              @click="selectNote(item.note.id)"
            >
              <span class="c-admin-list-title">{{ item.product.name }}</span>
              <span class="c-admin-list-meta">
                {{ kindLabel(item.product.kind) }}
                <span v-if="item.product.producer">· {{ item.product.producer }}</span>
              </span>
              <span class="c-admin-list-meta">
                평점 {{ item.note.rating !== null ? item.note.rating.toFixed(1) : '-' }}
              </span>
            </button>
          </li>
        </ul>

        <div v-if="listData?.total" class="c-pagination">
          <button class="u-ghost" :disabled="page <= 1" @click="goToPage(page - 1)">이전</button>
          <span>{{ page }} / {{ totalPages }}</span>
          <button class="u-ghost" :disabled="page >= totalPages" @click="goToPage(page + 1)">
            다음
          </button>
        </div>
      </section>

      <section class="c-card c-admin-form">
        <form class="c-admin-form-body" @submit.prevent="saveNote">
          <header class="c-section-header">
            <h2>{{ isEdit ? '노트 수정' : '새 노트' }}</h2>
            <p class="u-muted">제품 정보와 노트를 입력하세요.</p>
          </header>

          <section>
            <h3>제품 정보</h3>
            <div class="c-form-grid">
              <div class="c-field">
                <label>종류</label>
                <select v-model="form.product.kind">
                  <option v-for="option in kindOptions" :key="option.value" :value="option.value">
                    {{ option.label }}
                  </option>
                </select>
              </div>
              <div class="c-field">
                <label>이름</label>
                <input v-model="form.product.name" type="text" required />
              </div>
              <div class="c-field">
                <label>생산자</label>
                <input v-model="form.product.producer" type="text" />
              </div>
              <div class="c-field">
                <label>국가</label>
                <input v-model="form.product.country" type="text" />
              </div>
              <div class="c-field">
                <label>지역</label>
                <input v-model="form.product.region" type="text" />
              </div>
              <div class="c-field">
                <label>도수 (%)</label>
                <input v-model="form.product.abv" type="number" step="0.1" min="0" max="100" />
              </div>
              <div class="c-field">
                <label>빈티지</label>
                <input v-model="form.product.vintage" type="text" />
              </div>
              <div class="c-field">
                <label>숙성 연수</label>
                <input v-model="form.product.age" type="number" step="1" min="0" />
              </div>
              <div class="c-field">
                <label>용량 (ml)</label>
                <input v-model="form.product.volume_ml" type="number" step="1" min="0" />
              </div>
            </div>
          </section>

          <section>
            <h3>평점/메모</h3>
            <div class="c-form-grid">
              <div class="c-field">
                <label>평점 (0~10, 0.5 단위)</label>
                <input v-model="form.note.rating" type="number" step="0.5" min="0" max="10" />
              </div>
            </div>
            <div class="c-field">
              <label>코멘트</label>
              <textarea v-model="form.note.comment" rows="4"></textarea>
            </div>
          </section>

          <section>
            <h3>향/맛/피니시/색</h3>
            <div class="c-terms-grid">
              <TermsEditor v-model="form.terms.nose" label="Nose" placeholder="향 키워드" />
              <TermsEditor v-model="form.terms.palate" label="Palate" placeholder="맛 키워드" />
              <TermsEditor v-model="form.terms.finish" label="Finish" placeholder="피니시 키워드" />
              <TermsEditor v-model="form.terms.color" label="Color" placeholder="색 키워드" />
            </div>
          </section>

          <section>
            <h3>태그</h3>
            <TermsEditor
              v-model="form.tags"
              label="태그"
              placeholder="태그"
              hint="콤마 없이 하나씩 추가"
            />
          </section>

          <section>
            <h3>이미지</h3>
            <div class="c-admin-image">
              <div class="c-admin-image-preview">
                <img
                  v-if="form.imageUrl"
                  :src="form.imageUrl"
                  :alt="form.product.name || '이미지'"
                />
                <p v-else class="u-muted">이미지 없음</p>
              </div>
              <div class="c-field">
                <label>이미지 URL</label>
                <input v-model="form.imageUrl" type="text" placeholder="https://..." />
              </div>
            </div>
          </section>

          <div class="c-admin-form-actions">
            <div class="c-admin-action-group">
              <button
                v-if="isEdit"
                class="u-ghost"
                type="button"
                :disabled="deletePending"
                @click="deleteNote"
              >
                {{ deletePending ? '삭제 중...' : '삭제' }}
              </button>
            </div>
            <button class="u-primary" type="submit" :disabled="saving">
              {{ saving ? '저장 중...' : isEdit ? '업데이트' : '저장' }}
            </button>
          </div>

          <p v-if="formError" class="u-error">{{ formError }}</p>
        </form>
      </section>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, reactive, ref } from 'vue'
import { navigateTo, useAsyncData, useRequestHeaders } from 'nuxt/app'
import { KIND_OPTIONS, kindLabel } from '~/utils/kind'
import { getErrorMessage } from '~/utils/errors'

const kindOptions = KIND_OPTIONS
const search = ref('')
const appliedSearch = ref('')
const page = ref(1)
const selectedId = ref<string | null>(null)
const formError = ref('')
const saving = ref(false)
const deletePending = ref(false)

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

const form = reactive<AdminFormState>(createEmptyForm())

const listQuery = computed(() => ({
  q: appliedSearch.value || undefined,
  page: page.value,
}))

interface NotesListResponse {
  items: Array<{
    note: {
      id: string
      rating: number | null
    }
    product: {
      kind: string
      name: string
      producer: string | null
    }
  }>
  total: number
  page: number
  pageSize: number
}

interface NoteDetailResponse {
  note: {
    id: string
    productId: string
    rating: number | null
    comment: string | null
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
  }
  terms: {
    nose: string[]
    palate: string[]
    finish: string[]
    color: string[]
  }
  tags: string[]
  attachments: Array<{
    kind: string
    urlOrPath: string
  }>
}

const fetchNotes = () =>
  $fetch<NotesListResponse>('/api/notes' as string, {
    query: listQuery.value as Record<string, string | number | undefined>,
  })

const { error: authError } = await useAsyncData('admin-auth', () =>
  $fetch('/api/admin/me', { headers: useRequestHeaders(['cookie']) }),
)

if (authError.value) {
  await navigateTo('/adm/login')
}

const {
  data: listData,
  pending: listPending,
  error: listError,
  refresh: refreshList,
} = await useAsyncData<NotesListResponse>('admin-notes', fetchNotes, {
  watch: [listQuery],
})

const totalPages = computed(() => {
  const total = listData.value?.total || 0
  return Math.max(1, Math.ceil(total / 9))
})

const applySearch = () => {
  appliedSearch.value = search.value.trim()
  page.value = 1
}

const goToPage = (nextPage: number) => {
  page.value = nextPage
}

const isEdit = computed(() => Boolean(form.noteId))

const resetForm = () => {
  Object.assign(form, createEmptyForm())
  selectedId.value = null
  formError.value = ''
}

const parseNumber = (value: string | number, integer = false) => {
  if (typeof value === 'number') {
    if (Number.isNaN(value)) return null
    return integer ? Math.trunc(value) : value
  }
  const trimmed = value.trim()
  if (!trimmed) return null
  const num = Number(trimmed)
  if (Number.isNaN(num)) return null
  return integer ? Math.trunc(num) : num
}

const loadNoteDetail = async (id: string) => {
  formError.value = ''
  try {
    const data = await $fetch<NoteDetailResponse>(`/api/notes/${id}`)
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

const selectNote = async (id: string) => {
  selectedId.value = id
  await loadNoteDetail(id)
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

const confirmDelete = () => {
  if (!import.meta.client) return true
  const confirmFn = (globalThis as { confirm?: (message: string) => boolean }).confirm
  return confirmFn ? confirmFn('정말 삭제할까요?') : true
}

const logout = async () => {
  await $fetch('/api/admin/logout', { method: 'POST' })
  await navigateTo('/adm/login')
}
</script>
