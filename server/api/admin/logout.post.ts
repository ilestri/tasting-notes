import { clearAdminSession } from '~/server/utils/adminAuth'
import type { AdminOkResponse } from '~/types/api'

export default defineEventHandler((event): AdminOkResponse => {
  clearAdminSession(event)
  return { ok: true }
})
