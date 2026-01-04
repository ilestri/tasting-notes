import { getQuery } from 'h3'
import { and, asc, desc, eq, inArray, like, or, sql } from 'drizzle-orm'
import { db } from '~/server/db'
import { noteTags, notes, products, tags } from '~/server/db/schema'
import { KIND_VALUES, badRequest, parseExtraJson } from '~/server/utils/validation'

const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value))

export default defineEventHandler((event) => {
  const query = getQuery(event)

  const q = typeof query.q === 'string' ? query.q.trim() : ''
  const kind = typeof query.kind === 'string' ? query.kind.trim() : ''
  const tag = typeof query.tag === 'string' ? query.tag.trim() : ''
  const sort = typeof query.sort === 'string' ? query.sort : 'updatedAt'
  const order = typeof query.order === 'string' ? query.order : 'desc'

  const page = clamp(Number.parseInt(String(query.page || '1'), 10) || 1, 1, 500)
  const pageSize = clamp(Number.parseInt(String(query.pageSize || '9'), 10) || 9, 1, 100)
  const offset = (page - 1) * pageSize

  if (kind && !KIND_VALUES.includes(kind as (typeof KIND_VALUES)[number])) {
    badRequest('Invalid kind')
  }

  if (!['updatedAt', 'rating'].includes(sort)) {
    badRequest('Invalid sort')
  }

  if (!['asc', 'desc'].includes(order)) {
    badRequest('Invalid order')
  }

  let tagNoteIds: string[] | null = null
  if (tag) {
    const rows = db
      .select({ noteId: noteTags.noteId })
      .from(noteTags)
      .innerJoin(tags, eq(noteTags.tagId, tags.id))
      .where(eq(tags.name, tag))
      .all()

    tagNoteIds = rows.map((row) => row.noteId)
    if (tagNoteIds.length === 0) {
      return { items: [], total: 0, page, pageSize }
    }
  }

  const conditions = []
  if (q) {
    const qLike = `%${q}%`
    conditions.push(
      or(like(products.name, qLike), like(products.producer, qLike), like(notes.comment, qLike)),
    )
  }
  if (kind) {
    conditions.push(eq(products.kind, kind))
  }
  if (tagNoteIds) {
    conditions.push(inArray(notes.id, tagNoteIds))
  }

  const whereClause = conditions.length ? and(...conditions) : undefined

  const totalRow = db
    .select({ count: sql<number>`count(*)` })
    .from(notes)
    .innerJoin(products, eq(notes.productId, products.id))
    .where(whereClause)
    .get()

  const sortColumn = sort === 'rating' ? notes.rating : notes.updatedAt
  const orderBy = order === 'asc' ? asc(sortColumn) : desc(sortColumn)

  const rows = db
    .select({
      noteId: notes.id,
      noteProductId: notes.productId,
      noteRating: notes.rating,
      noteComment: notes.comment,
      noteExtraJson: notes.extraJson,
      noteCreatedAt: notes.createdAt,
      noteUpdatedAt: notes.updatedAt,
      productId: products.id,
      productKind: products.kind,
      productName: products.name,
      productProducer: products.producer,
      productCountry: products.country,
      productRegion: products.region,
      productAbv: products.abv,
      productVintage: products.vintage,
      productAge: products.age,
      productVolumeMl: products.volumeMl,
      productExtraJson: products.extraJson,
      productCreatedAt: products.createdAt,
      productUpdatedAt: products.updatedAt,
    })
    .from(notes)
    .innerJoin(products, eq(notes.productId, products.id))
    .where(whereClause)
    .orderBy(orderBy)
    .limit(pageSize)
    .offset(offset)
    .all()

  const tagCounts = db
    .select({
      name: tags.name,
      count: sql<number>`count(${noteTags.noteId})`,
    })
    .from(tags)
    .leftJoin(noteTags, eq(noteTags.tagId, tags.id))
    .groupBy(tags.name)
    .all()

  const tagCountMap = new Map(tagCounts.map((row) => [row.name, row.count]))

  const noteIds = rows.map((row) => row.noteId)
  const tagRows = noteIds.length
    ? db
        .select({ noteId: noteTags.noteId, name: tags.name })
        .from(noteTags)
        .innerJoin(tags, eq(noteTags.tagId, tags.id))
        .where(inArray(noteTags.noteId, noteIds))
        .all()
    : []

  const tagMap = new Map<string, string[]>()
  for (const row of tagRows) {
    const current = tagMap.get(row.noteId) || []
    current.push(row.name)
    tagMap.set(row.noteId, current)
  }

  for (const [noteId, tagList] of tagMap) {
    tagList.sort(
      (a, b) =>
        (tagCountMap.get(b) ?? 0) - (tagCountMap.get(a) ?? 0) || a.localeCompare(b),
    )
    tagMap.set(noteId, tagList)
  }

  const items = rows.map((row) => ({
    note: {
      id: row.noteId,
      productId: row.noteProductId,
      rating: row.noteRating,
      comment: row.noteComment,
      extraFields: parseExtraJson(row.noteExtraJson),
      createdAt: row.noteCreatedAt,
      updatedAt: row.noteUpdatedAt,
    },
    product: {
      id: row.productId,
      kind: row.productKind,
      name: row.productName,
      producer: row.productProducer,
      country: row.productCountry,
      region: row.productRegion,
      abv: row.productAbv,
      vintage: row.productVintage,
      age: row.productAge,
      volumeMl: row.productVolumeMl,
      extraFields: parseExtraJson(row.productExtraJson),
      createdAt: row.productCreatedAt,
      updatedAt: row.productUpdatedAt,
    },
    tags: tagMap.get(row.noteId) || [],
  }))

  return {
    items,
    total: totalRow?.count ?? 0,
    page,
    pageSize,
  }
})
