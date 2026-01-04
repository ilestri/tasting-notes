import { createError, getRouterParam } from 'h3'
import { eq } from 'drizzle-orm'
import { db } from '~/server/db'
import { notes } from '~/server/db/schema'

export default defineEventHandler((event) => {
  const id = getRouterParam(event, 'id')
  if (!id) {
    throw createError({ statusCode: 400, statusMessage: 'Missing note id' })
  }

  const result = db.delete(notes).where(eq(notes.id, id)).run()

  if (result.changes === 0) {
    throw createError({ statusCode: 404, statusMessage: 'Note not found' })
  }

  return { success: true }
})
