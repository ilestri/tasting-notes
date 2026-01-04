import { createError } from 'h3'

export const KIND_VALUES = ['whisky', 'wine', 'sake', 'makgeolli', 'etc'] as const
export type KindValue = (typeof KIND_VALUES)[number]

export const TERM_CATEGORIES = ['nose', 'palate', 'finish', 'color'] as const
export type TermCategory = (typeof TERM_CATEGORIES)[number]

export const ATTACHMENT_KINDS = ['image', 'file'] as const
export type AttachmentKind = (typeof ATTACHMENT_KINDS)[number]

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null && !Array.isArray(value)

export const badRequest = (message: string): never => {
  throw createError({ statusCode: 400, statusMessage: message })
}

export const assertKind = (value: unknown) => {
  if (typeof value !== 'string' || !KIND_VALUES.includes(value as KindValue)) {
    badRequest('Invalid kind')
  }
  return value as KindValue
}

export const parseRating = (value: unknown): number | null => {
  if (value === undefined || value === null || value === '') {
    return null
  }
  if (typeof value !== 'number' || Number.isNaN(value)) {
    badRequest('Invalid rating')
  }
  const rating = value as number
  if (rating < 0 || rating > 10) {
    badRequest('Rating out of range')
  }
  if (Math.round(rating * 2) !== rating * 2) {
    badRequest('Rating must be in 0.5 steps')
  }
  return rating
}

export const parseExtraFields = (
  value: unknown,
): { json: string | null; data: Record<string, string | number | boolean> | null } => {
  if (value === undefined || value === null) {
    return { json: null, data: null as Record<string, string | number | boolean> | null }
  }
  if (!isRecord(value)) {
    badRequest('extraFields must be an object')
  }

  const data: Record<string, string | number | boolean> = {}

  for (const [key, rawValue] of Object.entries(value)) {
    if (!key.trim()) {
      badRequest('extraFields key cannot be empty')
    }
    if (
      typeof rawValue === 'string' ||
      typeof rawValue === 'number' ||
      typeof rawValue === 'boolean'
    ) {
      data[key] = rawValue
    } else {
      badRequest('extraFields values must be string, number, or boolean')
    }
  }

  if (Object.keys(data).length === 0) {
    return { json: null, data: {} }
  }

  try {
    return { json: JSON.stringify(data), data }
  } catch {
    badRequest('extraFields could not be serialized')
  }

  return { json: null, data: {} }
}

export const parseExtraJson = (value: string | null): Record<string, string | number | boolean> => {
  if (!value) return {}
  try {
    const parsed = JSON.parse(value)
    if (!isRecord(parsed)) return {}

    const data: Record<string, string | number | boolean> = {}
    for (const [key, rawValue] of Object.entries(parsed)) {
      if (
        typeof rawValue === 'string' ||
        typeof rawValue === 'number' ||
        typeof rawValue === 'boolean'
      ) {
        data[key] = rawValue
      }
    }

    return data
  } catch {
    return {}
  }
}

export const normalizeStringArray = (value: unknown): string[] => {
  if (value === undefined || value === null) return []
  if (!Array.isArray(value)) {
    badRequest('Expected an array of strings')
  }

  const list = (value as unknown[])
    .map((item) => (typeof item === 'string' ? item.trim() : ''))
    .filter((item) => item.length > 0)

  return Array.from(new Set(list))
}

export interface AttachmentInput {
  kind: AttachmentKind
  urlOrPath: string
  mime: string | null
}

export function normalizeAttachments(value: unknown): AttachmentInput[]
export function normalizeAttachments(
  value: unknown,
  opts: { allowUndefined: true },
): AttachmentInput[] | undefined
export function normalizeAttachments(
  value: unknown,
  { allowUndefined = false }: { allowUndefined?: boolean } = {},
): AttachmentInput[] | undefined {
  if (value === undefined) {
    return allowUndefined ? undefined : []
  }
  if (value === null) return []
  if (!Array.isArray(value)) {
    badRequest('attachments must be an array')
  }

  const result: AttachmentInput[] = []

  const items = value as unknown[]
  for (const item of items) {
    if (!isRecord(item)) {
      badRequest('attachments item must be an object')
    }
    const record = item as Record<string, unknown>
    const kind = record.kind
    if (typeof kind !== 'string' || !ATTACHMENT_KINDS.includes(kind as AttachmentKind)) {
      badRequest('Invalid attachment kind')
    }
    const rawPath =
      typeof record.url_or_path === 'string'
        ? record.url_or_path
        : typeof record.urlOrPath === 'string'
          ? record.urlOrPath
          : null
    const trimmed = (rawPath ?? '').trim()
    if (!trimmed) {
      badRequest('attachments url_or_path is required')
    }
    const urlOrPath = trimmed
    const mime =
      record.mime === undefined || record.mime === null
        ? null
        : typeof record.mime === 'string'
          ? record.mime.trim() || null
          : badRequest('Invalid attachment mime')

    result.push({
      kind: kind as AttachmentKind,
      urlOrPath,
      mime,
    })
  }

  return result
}
