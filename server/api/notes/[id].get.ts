import { createError, getRouterParam } from 'h3'
import { eq } from 'drizzle-orm'
import { db } from '~/server/db'
import { attachments, noteTags, noteTerms, notes, products, tags } from '~/server/db/schema'
import type { NoteDetailResponse } from '~/types/api'

export default defineEventHandler((event): NoteDetailResponse => {
  const id = getRouterParam(event, 'id')
  if (!id) {
    throw createError({ statusCode: 400, statusMessage: 'Missing note id' })
  }

  const row = db
    .select({
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
    .where(eq(notes.id, id))
    .get()

  if (!row) {
    throw createError({ statusCode: 404, statusMessage: 'Note not found' })
  }

  const termRows = db.select().from(noteTerms).where(eq(noteTerms.noteId, id)).all()
  const tagRows = db
    .select({ name: tags.name })
    .from(noteTags)
    .innerJoin(tags, eq(noteTags.tagId, tags.id))
    .where(eq(noteTags.noteId, id))
    .all()

  const attachmentRows = db.select().from(attachments).where(eq(attachments.noteId, id)).all()

  const terms = {
    nose: [] as string[],
    palate: [] as string[],
    finish: [] as string[],
    color: [] as string[],
  }

  termRows
    .sort((a, b) => a.ord - b.ord)
    .forEach((term) => {
      if (term.category in terms) {
        terms[term.category as keyof typeof terms].push(term.value)
      }
    })

  return {
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
    terms,
    tags: tagRows.map((tag) => tag.name),
    attachments: attachmentRows.map((row) => ({
      id: row.id,
      noteId: row.noteId,
      kind: row.kind as 'image' | 'file',
      urlOrPath: row.urlOrPath,
      mime: row.mime,
      createdAt: row.createdAt,
    })),
  }
})
