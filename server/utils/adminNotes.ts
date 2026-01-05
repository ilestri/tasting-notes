import { badRequest } from '~/server/utils/validation'

export const parseOptionalNumber = (value: unknown, label: string, integer = false) => {
  if (value === undefined || value === null || value === '') return null
  if (typeof value === 'string') {
    const trimmed = value.trim()
    if (!trimmed) return null
    const asNumber = Number(trimmed)
    if (Number.isNaN(asNumber)) {
      badRequest(`Invalid ${label}`)
    }
    return integer ? Math.trunc(asNumber) : asNumber
  }
  if (typeof value === 'number' && !Number.isNaN(value)) {
    return integer ? Math.trunc(value) : value
  }
  badRequest(`Invalid ${label}`)
}

export const parseOptionalText = (value: unknown, label: string) => {
  if (value === undefined || value === null) return null
  if (typeof value === 'string') {
    const trimmed = value.trim()
    return trimmed.length ? trimmed : null
  }
  badRequest(`Invalid ${label}`)
}

export const parseRequiredText = (value: unknown, label: string) => {
  if (typeof value !== 'string') {
    badRequest(`Invalid ${label}`)
  }
  const trimmed = (value as string).trim()
  if (!trimmed) {
    badRequest(`Invalid ${label}`)
  }
  return trimmed
}
