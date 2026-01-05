import { db } from '~/server/db'
import { tags } from '~/server/db/schema'
import type { TagsResponse } from '~/types/api'

export default defineEventHandler((): TagsResponse => {
  const rows = db
    .select({
      name: tags.name,
      count: tags.usageCount,
    })
    .from(tags)
    .orderBy(tags.name)
    .all()

  return rows
})
