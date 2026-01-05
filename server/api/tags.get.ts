import { eq, sql } from 'drizzle-orm'
import { db } from '~/server/db'
import { noteTags, tags } from '~/server/db/schema'
import type { TagsResponse } from '~/types/api'

export default defineEventHandler((): TagsResponse => {
  const rows = db
    .select({
      name: tags.name,
      count: sql<number>`count(${noteTags.noteId})`,
    })
    .from(tags)
    .leftJoin(noteTags, eq(noteTags.tagId, tags.id))
    .groupBy(tags.name)
    .orderBy(tags.name)
    .all()

  return rows
})
