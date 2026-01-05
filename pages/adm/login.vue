<template>
  <div class="page-admin-login">
    <section class="c-card c-admin-login-card">
      <header class="c-section-header">
        <h1>관리자 로그인</h1>
        <p class="u-muted">관리자 비밀번호를 입력하세요.</p>
      </header>

      <form class="c-admin-login-form" @submit.prevent="submit">
        <div class="c-field">
          <label>비밀번호</label>
          <input
            v-model="password"
            type="password"
            autocomplete="current-password"
            placeholder="관리자 비밀번호"
          />
        </div>

        <div class="c-admin-form-actions">
          <button class="u-primary" type="submit" :disabled="pending">
            {{ pending ? '확인 중...' : '로그인' }}
          </button>
        </div>
      </form>

      <p v-if="errorMessage" class="u-error">{{ errorMessage }}</p>
    </section>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { navigateTo } from 'nuxt/app'
import { getErrorMessage } from '~/utils/errors'

const password = ref('')
const pending = ref(false)
const errorMessage = ref('')

const submit = async () => {
  errorMessage.value = ''
  if (!password.value.trim()) {
    errorMessage.value = '비밀번호를 입력하세요.'
    return
  }
  pending.value = true
  try {
    await $fetch('/api/admin/login', {
      method: 'POST',
      body: {
        password: password.value,
      },
    })
    await navigateTo('/adm')
  } catch (error) {
    errorMessage.value = getErrorMessage(error, '로그인에 실패했습니다.')
  } finally {
    pending.value = false
  }
}
</script>
