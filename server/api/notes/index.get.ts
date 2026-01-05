import { getQuery } from 'h3'
import { eq, inArray, sql } from 'drizzle-orm'
import { db } from '~/server/db'
import { noteTags, notes, products, tags } from '~/server/db/schema'
import type { NotesListResponse } from '~/types/api'
import { buildNotesOrderBy, buildNotesWhere, parseNotesQuery } from '~/server/utils/notesQuery'

export default defineEventHandler((event): NotesListResponse => {
  const query = parseNotesQuery(getQuery(event))
  const whereClause = buildNotesWhere(query)
  const orderBy = buildNotesOrderBy(query.sort, query.order)

  const rows = db
    .select({
      totalCount: sql<number>`count(*) over()`,
      noteId: notes.id,
      noteProductId: notes.productId,
      noteRating: notes.rating,
      noteComment: notes.comment,
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
      productCreatedAt: products.createdAt,
      productUpdatedAt: products.updatedAt,
    })
    .from(notes)
    .innerJoin(products, eq(notes.productId, products.id))
    .where(whereClause)
    .orderBy(orderBy)
    .limit(query.pageSize)
    .offset(query.offset)
    .all()

  const tagCounts = db.select({ name: tags.name, count: tags.usageCount }).from(tags).all()
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
      (a, b) => (tagCountMap.get(b) ?? 0) - (tagCountMap.get(a) ?? 0) || a.localeCompare(b),
    )
    tagMap.set(noteId, tagList)
  }

  const items = rows.map((row) => ({
    note: {
      id: row.noteId,
      productId: row.noteProductId,
      rating: row.noteRating,
      comment: row.noteComment,
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
      createdAt: row.productCreatedAt,
      updatedAt: row.productUpdatedAt,
    },
    tags: tagMap.get(row.noteId) || [],
  }))

  return {
    items,
    total: rows[0]?.totalCount ?? 0,
    page: query.page,
    pageSize: query.pageSize,
  }
})
