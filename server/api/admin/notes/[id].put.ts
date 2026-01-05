import { randomUUID } from 'node:crypto'
import { createError, getRouterParam, readBody } from 'h3'
import { eq, inArray } from 'drizzle-orm'
import { db } from '~/server/db'
import {
  attachments as attachmentsTable,
  noteTags,
  noteTerms,
  notes,
  products,
  tags,
} from '~/server/db/schema'
import {
  assertKind,
  badRequest,
  normalizeAttachments,
  normalizeStringArray,
  parseRating,
} from '~/server/utils/validation'
import {
  parseOptionalNumber,
  parseOptionalText,
  parseRequiredText,
} from '~/server/utils/adminNotes'

export default defineEventHandler(async (event) => {
  const noteId = getRouterParam(event, 'id')
  if (!noteId) {
    badRequest('note id is required')
  }
  const resolvedNoteId = noteId!

  const body = await readBody(event)
  if (!body || typeof body !== 'object') {
    badRequest('Request body is required')
  }

  const productInput = (body as Record<string, unknown>).product
  const noteInput = (body as Record<string, unknown>).note
  const termsInput = (body as Record<string, unknown>).terms
  const tagsInput = (body as Record<string, unknown>).tags
  const attachmentsInput = (body as Record<string, unknown>).attachments

  if (!productInput || typeof productInput !== 'object') {
    badRequest('product is required')
  }
  if (!noteInput || typeof noteInput !== 'object') {
    badRequest('note is required')
  }

  const productRecord = productInput as Record<string, unknown>
  const noteRecord = noteInput as Record<string, unknown>

  const productKind = assertKind(productRecord.kind)
  const productName = parseRequiredText(productRecord.name, 'product.name')

  const rating = parseRating(noteRecord.rating)
  const comment = parseOptionalText(noteRecord.comment, 'comment')

  const termsRecord = (termsInput && typeof termsInput === 'object' ? termsInput : {}) as Record<
    string,
    unknown
  >

  const termsByCategory = {
    nose: normalizeStringArray(termsRecord.nose),
    palate: normalizeStringArray(termsRecord.palate),
    finish: normalizeStringArray(termsRecord.finish),
    color: normalizeStringArray(termsRecord.color),
  }

  const tagList = normalizeStringArray(tagsInput)
  const attachments = normalizeAttachments(attachmentsInput)
  const now = new Date().toISOString()

  db.transaction((tx) => {
    const existing = tx
      .select({ productId: notes.productId })
      .from(notes)
      .where(eq(notes.id, resolvedNoteId))
      .get()

    if (!existing) {
      throw createError({ statusCode: 404, statusMessage: 'Note not found' })
    }

    tx.update(products)
      .set({
        kind: productKind,
        name: productName,
        producer: parseOptionalText(productRecord.producer, 'producer'),
        country: parseOptionalText(productRecord.country, 'country'),
        region: parseOptionalText(productRecord.region, 'region'),
        abv: parseOptionalNumber(productRecord.abv, 'abv'),
        vintage: parseOptionalText(productRecord.vintage, 'vintage'),
        age: parseOptionalNumber(productRecord.age, 'age', true),
        volumeMl: parseOptionalNumber(productRecord.volume_ml, 'volume_ml', true),
        updatedAt: now,
      })
      .where(eq(products.id, existing.productId))
      .run()

    tx.update(notes)
      .set({
        rating,
        comment,
        updatedAt: now,
      })
      .where(eq(notes.id, resolvedNoteId))
      .run()

    tx.delete(noteTerms).where(eq(noteTerms.noteId, resolvedNoteId)).run()
    tx.delete(noteTags).where(eq(noteTags.noteId, resolvedNoteId)).run()
    tx.delete(attachmentsTable).where(eq(attachmentsTable.noteId, resolvedNoteId)).run()

    const termRows = (
      Object.entries(termsByCategory) as Array<[keyof typeof termsByCategory, string[]]>
    ).flatMap(([category, values]) =>
      values.map((value, index) => ({
        id: randomUUID(),
        noteId: resolvedNoteId,
        category,
        value,
        ord: index,
        createdAt: now,
      })),
    )

    if (termRows.length) {
      tx.insert(noteTerms).values(termRows).run()
    }

    if (attachments.length) {
      tx.insert(attachmentsTable)
        .values(
          attachments.map((attachment) => ({
            id: randomUUID(),
            noteId: resolvedNoteId,
            kind: attachment.kind,
            urlOrPath: attachment.urlOrPath,
            mime: attachment.mime,
            createdAt: now,
          })),
        )
        .run()
    }

    if (tagList.length) {
      tx.insert(tags)
        .values(tagList.map((name) => ({ id: randomUUID(), name })))
        .onConflictDoNothing()
        .run()

      const tagRows = tx.select({ id: tags.id }).from(tags).where(inArray(tags.name, tagList)).all()

      if (tagRows.length) {
        tx.insert(noteTags)
          .values(tagRows.map((tagRow) => ({ noteId: resolvedNoteId, tagId: tagRow.id })))
          .run()
      }
    }
  })

  return { ok: true }
})
