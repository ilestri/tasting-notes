<template>
  <form class="note-form" @submit.prevent="submit">
    <ProductLookup @select="applyProduct" @clear="clearProduct" />

    <section class="card">
      <header class="section-header">
        <h2>제품 정보</h2>
        <p class="muted">제품 기본 정보를 먼저 기록하세요.</p>
      </header>

      <div class="form-grid">
        <div class="field">
          <label>종류</label>
          <select v-model="state.product.kind">
            <option v-for="option in kindOptions" :key="option.value" :value="option.value">
              {{ option.label }}
            </option>
          </select>
        </div>
        <div class="field">
          <label>이름</label>
          <input v-model="state.product.name" type="text" required placeholder="제품명" />
        </div>
        <div class="field">
          <label>생산자</label>
          <input v-model="state.product.producer" type="text" placeholder="증류소/와이너리" />
        </div>
        <div class="field">
          <label>국가</label>
          <input v-model="state.product.country" type="text" placeholder="국가" />
        </div>
        <div class="field">
          <label>지역</label>
          <input v-model="state.product.region" type="text" placeholder="지역" />
        </div>
        <div class="field">
          <label>도수 (%)</label>
          <input v-model.number="state.product.abv" type="number" step="0.1" min="0" max="100" />
        </div>
        <div class="field">
          <label>빈티지</label>
          <input v-model="state.product.vintage" type="text" placeholder="예: 2019" />
        </div>
        <div class="field">
          <label>숙성 연수</label>
          <input v-model.number="state.product.age" type="number" step="1" min="0" />
        </div>
        <div class="field">
          <label>용량(ml)</label>
          <input v-model.number="state.product.volume_ml" type="number" step="1" min="0" />
        </div>
      </div>
    </section>

    <section class="card">
      <header class="section-header">
        <h2>노트</h2>
        <p class="muted">평점과 인상, 향/맛/피니시를 기록하세요.</p>
      </header>

      <div class="form-grid">
        <div class="field">
          <label>평점 (0~10, 0.5 단위)</label>
          <input v-model.number="state.note.rating" type="number" step="0.5" min="0" max="10" />
        </div>
      </div>

      <div class="field">
        <label>코멘트</label>
        <textarea v-model="state.note.comment" rows="4" placeholder="인상/메모"></textarea>
      </div>

      <div class="terms-grid">
        <TermsEditor v-model="state.terms.nose" label="Nose" placeholder="향 키워드" />
        <TermsEditor v-model="state.terms.palate" label="Palate" placeholder="맛 키워드" />
        <TermsEditor v-model="state.terms.finish" label="Finish" placeholder="피니시 키워드" />
        <TermsEditor v-model="state.terms.color" label="Color" placeholder="색 키워드" />
      </div>
    </section>

    <section class="card">
      <header class="section-header">
        <h2>태그</h2>
        <p class="muted">노트에 사용할 태그를 추가하세요.</p>
      </header>
      <TermsEditor
        v-model="state.tags"
        label="태그"
        placeholder="태그"
        hint="콤마 없이 하나씩 추가"
      />
    </section>

    <AttachmentsEditor v-model="state.attachments" />

    <div class="form-actions">
      <button class="primary" type="submit" :disabled="busy">{{ submitLabel }}</button>
    </div>
    <p v-if="formError" class="error">{{ formError }}</p>
  </form>
</template>

<script setup lang="ts">
import { isProxy, ref, toRaw, watch } from 'vue'
import type { NoteFormModel } from '~/types/noteForm'
import { KIND_OPTIONS } from '~/utils/kind'

const props = withDefaults(
  defineProps<{
    initial: NoteFormModel
    submitLabel?: string
    busy?: boolean
  }>(),
  {
    submitLabel: '저장',
    busy: false,
  },
)

const emit = defineEmits<{
  (event: 'submit', value: NoteFormModel): void
}>()

const kindOptions = KIND_OPTIONS

const formError = ref('')

const cloneValue = <T,>(value: T): T => {
  const rawValue = isProxy(value) ? toRaw(value) : value
  if (typeof structuredClone === 'function') {
    try {
      return structuredClone(rawValue)
    } catch {
      // fallback to JSON clone for non-cloneable proxies during SSR
    }
  }
  return JSON.parse(JSON.stringify(rawValue))
}

const state = ref<NoteFormModel>(cloneValue(props.initial))

watch(
  () => props.initial,
  (value) => {
    state.value = cloneValue(value)
  },
  { deep: true },
)

const submit = () => {
  formError.value = ''
  const productName = state.value.product.name?.trim()
  if (!productName) {
    formError.value = '제품 이름은 필수입니다.'
    return
  }
  const hasEmptyAttachment = state.value.attachments.some((item) => !item.url_or_path.trim())
  if (hasEmptyAttachment) {
    formError.value = '첨부의 URL/Path를 입력하세요.'
    return
  }
  emit('submit', cloneValue(state.value))
}

const applyProduct = (product: {
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
}) => {
  state.value.product.id = product.id
  state.value.product.kind = product.kind
  state.value.product.name = product.name
  state.value.product.producer = product.producer
  state.value.product.country = product.country
  state.value.product.region = product.region
  state.value.product.abv = product.abv
  state.value.product.vintage = product.vintage
  state.value.product.age = product.age
  state.value.product.volume_ml = product.volumeMl
}

const clearProduct = () => {
  state.value.product.id = undefined
}
</script>
