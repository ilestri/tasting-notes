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
  parseExtraFields,
  parseRating,
} from '~/server/utils/validation'

const parseOptionalNumber = (value: unknown, label: string, integer = false) => {
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

const parseOptionalText = (value: unknown, label: string) => {
  if (value === undefined) return undefined
  if (value === null) return null
  if (typeof value === 'string') {
    const trimmed = value.trim()
    return trimmed.length ? trimmed : null
  }
  badRequest(`Invalid ${label}`)
}

export default defineEventHandler(async (event) => {
  const noteId = getRouterParam(event, 'id')
  if (!noteId) {
    throw createError({ statusCode: 400, statusMessage: 'Missing note id' })
  }

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

  const targetProductId =
    typeof productRecord.id === 'string' && productRecord.id ? productRecord.id : null
  const productKindInput = typeof productRecord.kind === 'string' ? productRecord.kind : undefined
  const productNameInput =
    typeof productRecord.name === 'string' && productRecord.name.trim()
      ? productRecord.name.trim()
      : undefined

  const productExtraSource = productRecord.extraFields ?? productRecord.productExtraFields
  const productExtra =
    productExtraSource === undefined ? null : parseExtraFields(productExtraSource)

  const rating = parseRating(noteRecord.rating)
  const noteExtraSource = noteRecord.extraFields
  const noteExtra = noteExtraSource === undefined ? null : parseExtraFields(noteExtraSource)

  const comment = typeof noteRecord.comment === 'string' ? noteRecord.comment.trim() : null

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
  const attachments = normalizeAttachments(attachmentsInput, { allowUndefined: true })

  const now = new Date().toISOString()

  const result = db.transaction((tx) => {
    const existingNote = tx.select().from(notes).where(eq(notes.id, noteId)).get()
    if (!existingNote) {
      throw createError({ statusCode: 404, statusMessage: 'Note not found' })
    }

    const productIdToUse = targetProductId || existingNote.productId
    const existingProduct = tx.select().from(products).where(eq(products.id, productIdToUse)).get()

    const resolvedKind = productKindInput ?? existingProduct?.kind
    if (!resolvedKind) {
      badRequest('product.kind is required')
    }
    const productKind = assertKind(resolvedKind) as string

    const resolvedName = productNameInput ?? existingProduct?.name
    if (!resolvedName) {
      badRequest('product.name is required')
    }
    const productName = resolvedName as string

    if (existingProduct) {
      const producer = parseOptionalText(productRecord.producer, 'producer')
      const country = parseOptionalText(productRecord.country, 'country')
      const region = parseOptionalText(productRecord.region, 'region')
      const vintage = parseOptionalText(productRecord.vintage, 'vintage')

      tx.update(products)
        .set({
          kind: productKind,
          name: productName,
          producer: producer === undefined ? existingProduct.producer : producer,
          country: country === undefined ? existingProduct.country : country,
          region: region === undefined ? existingProduct.region : region,
          abv:
            productRecord.abv === undefined
              ? existingProduct.abv
              : parseOptionalNumber(productRecord.abv, 'abv'),
          vintage: vintage === undefined ? existingProduct.vintage : vintage,
          age:
            productRecord.age === undefined
              ? existingProduct.age
              : parseOptionalNumber(productRecord.age, 'age', true),
          volumeMl:
            productRecord.volume_ml === undefined
              ? existingProduct.volumeMl
              : parseOptionalNumber(productRecord.volume_ml, 'volume_ml', true),
          extraJson: productExtra ? productExtra.json : existingProduct.extraJson,
          updatedAt: now,
        })
        .where(eq(products.id, productIdToUse))
        .run()
    } else {
      const productInsert: typeof products.$inferInsert = {
        id: productIdToUse,
        kind: productKind,
        name: productName,
        producer: parseOptionalText(productRecord.producer, 'producer') ?? null,
        country: parseOptionalText(productRecord.country, 'country') ?? null,
        region: parseOptionalText(productRecord.region, 'region') ?? null,
        abv: parseOptionalNumber(productRecord.abv, 'abv'),
        vintage: parseOptionalText(productRecord.vintage, 'vintage') ?? null,
        age: parseOptionalNumber(productRecord.age, 'age', true),
        volumeMl: parseOptionalNumber(productRecord.volume_ml, 'volume_ml', true),
        extraJson: productExtra?.json ?? null,
        createdAt: now,
        updatedAt: now,
      }
      tx.insert(products).values(productInsert).run()
    }

    tx.update(notes)
      .set({
        productId: productIdToUse,
        rating,
        comment: comment || null,
        extraJson: noteExtra ? noteExtra.json : existingNote.extraJson,
        updatedAt: now,
      })
      .where(eq(notes.id, noteId))
      .run()

    tx.delete(noteTerms).where(eq(noteTerms.noteId, noteId)).run()

    const termRows = (
      Object.entries(termsByCategory) as Array<[keyof typeof termsByCategory, string[]]>
    ).flatMap(([category, values]) =>
      values.map((value, index) => ({
        id: randomUUID(),
        noteId,
        category,
        value,
        ord: index,
        createdAt: now,
      })),
    )

    if (termRows.length) {
      tx.insert(noteTerms).values(termRows).run()
    }

    tx.delete(noteTags).where(eq(noteTags.noteId, noteId)).run()

    if (tagList.length) {
      tx.insert(tags)
        .values(tagList.map((name) => ({ id: randomUUID(), name })))
        .onConflictDoNothing()
        .run()

      const tagRows = tx.select({ id: tags.id }).from(tags).where(inArray(tags.name, tagList)).all()

      if (tagRows.length) {
        tx.insert(noteTags)
          .values(tagRows.map((tagRow) => ({ noteId, tagId: tagRow.id })))
          .run()
      }
    }

    if (attachments !== undefined) {
      tx.delete(attachmentsTable).where(eq(attachmentsTable.noteId, noteId)).run()
      if (attachments.length) {
        tx.insert(attachmentsTable)
          .values(
            attachments.map((attachment) => ({
              id: randomUUID(),
              noteId,
              kind: attachment.kind,
              urlOrPath: attachment.urlOrPath,
              mime: attachment.mime,
              createdAt: now,
            })),
          )
          .run()
      }
    }

    return { id: noteId }
  })

  return result
})
