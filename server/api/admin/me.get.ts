import { createError } from 'h3'
import { hasAdminSession } from '~/server/utils/adminAuth'
import type { AdminOkResponse } from '~/types/api'

export default defineEventHandler((event): AdminOkResponse => {
  if (!hasAdminSession(event)) {
    throw createError({ statusCode: 401, statusMessage: 'Unauthorized' })
  }
  return { ok: true }
})
