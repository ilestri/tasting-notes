import { db } from '~/server/db'
import { noteTerms, tags } from '~/server/db/schema'
import type { AdminSuggestionsResponse } from '~/types/api'

export default defineEventHandler((): AdminSuggestionsResponse => {
  const termRows = db
    .selectDistinct({ category: noteTerms.category, value: noteTerms.value })
    .from(noteTerms)
    .orderBy(noteTerms.category, noteTerms.value)
    .all()

  const tagRows = db.select({ name: tags.name }).from(tags).orderBy(tags.name).all()

  const terms = {
    nose: [] as string[],
    palate: [] as string[],
    finish: [] as string[],
    color: [] as string[],
  }

  termRows.forEach((row) => {
    if (row.category in terms) {
      terms[row.category as keyof typeof terms].push(row.value)
    }
  })

  return {
    terms,
    tags: tagRows.map((row) => row.name),
  }
})
