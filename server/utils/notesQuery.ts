import { and, asc, desc, eq, inArray, like, or } from 'drizzle-orm'
import type { SQL } from 'drizzle-orm'
import { db } from '~/server/db'
import { noteTags, notes, products, tags } from '~/server/db/schema'
import { KIND_VALUES, badRequest } from '~/server/utils/validation'

const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value))

export type NotesSort = 'updatedAt' | 'rating'
export type NotesOrder = 'asc' | 'desc'

export interface NotesQueryInput {
  q: string
  kind: string
  tag: string
  sort: NotesSort
  order: NotesOrder
  page: number
  pageSize: number
  offset: number
  tagTerms: string[]
}

export const parseNotesQuery = (query: Record<string, unknown>): NotesQueryInput => {
  const q = typeof query.q === 'string' ? query.q.trim() : ''
  const kind = typeof query.kind === 'string' ? query.kind.trim() : ''
  const tag = typeof query.tag === 'string' ? query.tag.trim() : ''
  const sortRaw = typeof query.sort === 'string' ? query.sort : 'updatedAt'
  const orderRaw = typeof query.order === 'string' ? query.order : 'desc'

  if (!['updatedAt', 'rating'].includes(sortRaw)) {
    badRequest('Invalid sort')
  }

  if (!['asc', 'desc'].includes(orderRaw)) {
    badRequest('Invalid order')
  }

  const sort = (sortRaw === 'rating' ? 'rating' : 'updatedAt') as NotesSort
  const order = (orderRaw === 'asc' ? 'asc' : 'desc') as NotesOrder

  const page = clamp(Number.parseInt(String(query.page || '1'), 10) || 1, 1, 500)
  const pageSize = 9
  const offset = (page - 1) * pageSize

  if (kind && !KIND_VALUES.includes(kind as (typeof KIND_VALUES)[number])) {
    badRequest('Invalid kind')
  }

  const tagTerms = tag
    .split(/[,\s]+/)
    .map((entry) => entry.replace(/^#+/, '').trim())
    .filter(Boolean)

  return { q, kind, tag, sort, order, page, pageSize, offset, tagTerms }
}

export const buildNotesWhere = (input: NotesQueryInput): SQL | undefined => {
  const conditions: SQL[] = []

  if (input.q) {
    const qLike = `%${input.q}%`
    const qCondition = or(
      like(products.name, qLike),
      like(products.producer, qLike),
      like(notes.comment, qLike),
    )
    if (qCondition) {
      conditions.push(qCondition)
    }
  }

  if (input.kind) {
    conditions.push(eq(products.kind, input.kind))
  }

  if (input.tagTerms.length) {
    const tagConditions = input.tagTerms.map((term) => {
      const termLike = `%${term}%`
      const subquery = db
        .select({ noteId: noteTags.noteId })
        .from(noteTags)
        .innerJoin(tags, eq(noteTags.tagId, tags.id))
        .where(like(tags.name, termLike))
      return inArray(notes.id, subquery)
    })
    const tagCondition = and(...tagConditions)
    if (tagCondition) {
      conditions.push(tagCondition)
    }
  }

  return conditions.length ? and(...conditions) : undefined
}

export const buildNotesOrderBy = (sort: NotesSort, order: NotesOrder) => {
  const sortColumn = sort === 'rating' ? notes.rating : notes.updatedAt
  return order === 'asc' ? asc(sortColumn) : desc(sortColumn)
}
