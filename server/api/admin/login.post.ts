import { createError, readBody } from 'h3'
import { badRequest } from '~/server/utils/validation'
import { setAdminSession, verifyAdminPassword } from '~/server/utils/adminAuth'
import type { AdminOkResponse } from '~/types/api'

export default defineEventHandler(async (event): Promise<AdminOkResponse> => {
  const body = await readBody(event)
  const password = typeof body?.password === 'string' ? body.password.trim() : ''
  if (!password) {
    badRequest('password is required')
  }

  if (!verifyAdminPassword(password)) {
    throw createError({ statusCode: 401, statusMessage: 'Unauthorized' })
  }

  setAdminSession(event)
  return { ok: true }
})
