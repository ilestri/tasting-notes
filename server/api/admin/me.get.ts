import { createError } from 'h3'
import { hasAdminSession } from '~/server/utils/adminAuth'

export default defineEventHandler((event) => {
  if (!hasAdminSession(event)) {
    throw createError({ statusCode: 401, statusMessage: 'Unauthorized' })
  }
  return { ok: true }
})
