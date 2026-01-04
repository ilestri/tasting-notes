import { createError, getHeader, getRequestURL } from 'h3'

export default defineEventHandler((event) => {
  const method = event.node.req.method?.toUpperCase() || 'GET'
  if (method === 'GET' || method === 'HEAD' || method === 'OPTIONS') return

  const url = getRequestURL(event)
  if (!url.pathname.startsWith('/api')) return

  const token = process.env.ADMIN_TOKEN
  if (!token) {
    throw createError({ statusCode: 500, statusMessage: 'ADMIN_TOKEN not configured' })
  }

  const authHeader = getHeader(event, 'authorization') || ''
  const match = authHeader.match(/^Bearer\s+(.+)$/i)
  if (!match || match[1] !== token) {
    throw createError({ statusCode: 401, statusMessage: 'Unauthorized' })
  }
})
