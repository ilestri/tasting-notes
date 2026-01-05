import { createError, getRequestURL, sendRedirect } from 'h3'
import { hasAdminSession } from '~/server/utils/adminAuth'

export default defineEventHandler((event) => {
  const url = getRequestURL(event)
  const path = url.pathname

  const isAdminPage = path.startsWith('/adm')
  const isAdminApi = path.startsWith('/api/admin')

  if (!isAdminPage && !isAdminApi) return
  if (path === '/adm/login' || path === '/api/admin/login') return

  if (!hasAdminSession(event)) {
    if (isAdminApi) {
      throw createError({ statusCode: 401, statusMessage: 'Unauthorized' })
    }
    return sendRedirect(event, '/adm/login', 302)
  }
})
