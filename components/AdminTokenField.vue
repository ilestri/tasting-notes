<template>
  <div class="c-token-field">
    <label>ADMIN_TOKEN</label>
    <div class="c-token-input">
      <input
        v-model="token"
        :type="revealed ? 'text' : 'password'"
        placeholder="저장/수정용 토큰"
      />
      <button class="u-ghost" type="button" @click="revealed = !revealed">
        {{ revealed ? '숨기기' : '보기' }}
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useAdminToken } from '~/composables/useAdminToken'

const token = useAdminToken()
const revealed = ref(false)
</script>
