import { watch } from 'vue'
import { useState } from 'nuxt/app'

export const useAdminToken = () => {
  const token = useState<string>('adminToken', () => '')

  if (import.meta.client) {
    if (!token.value) {
      token.value = (localStorage.getItem('adminToken') || '').trim()
    }
    watch(token, (value) => {
      const trimmed = value.trim()
      if (trimmed) {
        localStorage.setItem('adminToken', trimmed)
      } else {
        localStorage.removeItem('adminToken')
      }
    })
  }

  return token
}
