import { createError, deleteCookie, getCookie, setCookie } from 'h3'
import { createHmac, timingSafeEqual } from 'node:crypto'

const COOKIE_NAME = 'adm_session'
const SESSION_TTL_MS = 1000 * 60 * 60 * 12

const getAdminPassword = () => {
  const password = process.env.ADMIN_PASSWORD
  if (!password) {
    throw createError({ statusCode: 500, statusMessage: 'ADMIN_PASSWORD not configured' })
  }
  return password
}

const getSessionSecret = () => process.env.ADMIN_SESSION_SECRET || getAdminPassword()

const signPayload = (payload: Record<string, unknown>) => {
  const secret = getSessionSecret()
  const encoded = Buffer.from(JSON.stringify(payload)).toString('base64url')
  const signature = createHmac('sha256', secret).update(encoded).digest('base64url')
  return `${encoded}.${signature}`
}

const verifyPayload = (token: string) => {
  const secret = getSessionSecret()
  const [encoded, signature] = token.split('.')
  if (!encoded || !signature) return null
  const expected = createHmac('sha256', secret).update(encoded).digest('base64url')
  const signatureBuffer = Buffer.from(signature)
  const expectedBuffer = Buffer.from(expected)
  if (signatureBuffer.length !== expectedBuffer.length) return null
  if (!timingSafeEqual(signatureBuffer, expectedBuffer)) return null
  try {
    return JSON.parse(Buffer.from(encoded, 'base64url').toString('utf-8')) as Record<
      string,
      unknown
    >
  } catch {
    return null
  }
}

export const verifyAdminPassword = (input: string) => {
  const password = getAdminPassword()
  const inputBuffer = Buffer.from(input)
  const passwordBuffer = Buffer.from(password)
  if (inputBuffer.length !== passwordBuffer.length) return false
  return timingSafeEqual(inputBuffer, passwordBuffer)
}

export const setAdminSession = (event: Parameters<typeof setCookie>[0]) => {
  const payload = {
    iat: Date.now(),
    exp: Date.now() + SESSION_TTL_MS,
  }
  const token = signPayload(payload)
  setCookie(event, COOKIE_NAME, token, {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    path: '/',
    maxAge: Math.floor(SESSION_TTL_MS / 1000),
  })
}

export const clearAdminSession = (event: Parameters<typeof deleteCookie>[0]) => {
  deleteCookie(event, COOKIE_NAME, { path: '/' })
}

export const hasAdminSession = (event: Parameters<typeof getCookie>[0]) => {
  const token = getCookie(event, COOKIE_NAME)
  if (!token) return false
  const payload = verifyPayload(token)
  if (!payload) return false
  const exp = typeof payload.exp === 'number' ? payload.exp : 0
  return exp > Date.now()
}
