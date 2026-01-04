import { getQuery } from 'h3'
import { and, eq, like, sql } from 'drizzle-orm'
import { db } from '~/server/db'
import { notes, products } from '~/server/db/schema'
import { KIND_VALUES, badRequest } from '~/server/utils/validation'

export default defineEventHandler((event) => {
  const query = getQuery(event)
  const q = typeof query.q === 'string' ? query.q.trim() : ''
  const kind = typeof query.kind === 'string' ? query.kind.trim() : ''
  const limit = Math.min(Math.max(Number.parseInt(String(query.limit || '20'), 10) || 20, 1), 100)

  if (kind && !KIND_VALUES.includes(kind as (typeof KIND_VALUES)[number])) {
    badRequest('Invalid kind')
  }

  const conditions = []
  if (q) {
    const qLike = `%${q}%`
    conditions.push(like(products.name, qLike))
  }
  if (kind) {
    conditions.push(eq(products.kind, kind))
  }

  const whereClause = conditions.length ? and(...conditions) : undefined

  const rows = db
    .select({
      id: products.id,
      kind: products.kind,
      name: products.name,
      producer: products.producer,
      country: products.country,
      region: products.region,
      abv: products.abv,
      vintage: products.vintage,
      age: products.age,
      volumeMl: products.volumeMl,
      notesCount: sql<number>`count(${notes.id})`,
    })
    .from(products)
    .leftJoin(notes, eq(products.id, notes.productId))
    .where(whereClause)
    .groupBy(products.id)
    .orderBy(products.name)
    .limit(limit)
    .all()

  return rows.map((row) => ({
    id: row.id,
    kind: row.kind,
    name: row.name,
    producer: row.producer,
    country: row.country,
    region: row.region,
    abv: row.abv,
    vintage: row.vintage,
    age: row.age,
    volumeMl: row.volumeMl,
    notesCount: row.notesCount,
  }))
})
