import { desc, eq, sql } from 'drizzle-orm'
import { db } from '~/server/db'
import { notes, products } from '~/server/db/schema'

export default defineEventHandler(() => {
  const monthExpr = sql<string>`strftime('%Y-%m', ${notes.createdAt})`

  const byMonth = db
    .select({
      month: monthExpr,
      count: sql<number>`count(${notes.id})`,
      avgRating: sql<number>`avg(${notes.rating})`,
    })
    .from(notes)
    .groupBy(monthExpr)
    .orderBy(desc(monthExpr))
    .all()

  const byKind = db
    .select({
      kind: products.kind,
      count: sql<number>`count(${notes.id})`,
      avgRating: sql<number>`avg(${notes.rating})`,
    })
    .from(products)
    .leftJoin(notes, eq(products.id, notes.productId))
    .groupBy(products.kind)
    .orderBy(products.kind)
    .all()

  return {
    byMonth,
    byKind,
  }
})
