import { index, integer, primaryKey, real, sqliteTable, text } from 'drizzle-orm/sqlite-core'

export const products = sqliteTable('products', {
  id: text('id').primaryKey(),
  kind: text('kind').notNull(),
  name: text('name').notNull(),
  producer: text('producer'),
  country: text('country'),
  region: text('region'),
  abv: real('abv'),
  vintage: text('vintage'),
  age: integer('age'),
  volumeMl: integer('volume_ml'),
  extraJson: text('extra_json'),
  createdAt: text('created_at').notNull(),
  updatedAt: text('updated_at').notNull(),
})

export const notes = sqliteTable(
  'notes',
  {
    id: text('id').primaryKey(),
    productId: text('product_id')
      .notNull()
      .references(() => products.id, { onDelete: 'restrict' }),
    rating: real('rating'),
    comment: text('comment'),
    extraJson: text('extra_json'),
    createdAt: text('created_at').notNull(),
    updatedAt: text('updated_at').notNull(),
  },
  (table) => ({
    productIdx: index('idx_notes_product_id').on(table.productId),
    updatedAtIdx: index('idx_notes_updated_at').on(table.updatedAt),
    ratingIdx: index('idx_notes_rating').on(table.rating),
  }),
)

export const noteTerms = sqliteTable(
  'note_terms',
  {
    id: text('id').primaryKey(),
    noteId: text('note_id')
      .notNull()
      .references(() => notes.id, { onDelete: 'cascade' }),
    category: text('category').notNull(),
    value: text('value').notNull(),
    ord: integer('ord').notNull(),
    createdAt: text('created_at').notNull(),
  },
  (table) => ({
    noteCategoryIdx: index('idx_note_terms_note_id_category').on(table.noteId, table.category),
  }),
)

export const tags = sqliteTable(
  'tags',
  {
    id: text('id').primaryKey(),
    name: text('name').notNull().unique(),
  },
  (table) => ({
    nameIdx: index('idx_tags_name').on(table.name),
  }),
)

export const noteTags = sqliteTable(
  'note_tags',
  {
    noteId: text('note_id')
      .notNull()
      .references(() => notes.id, { onDelete: 'cascade' }),
    tagId: text('tag_id')
      .notNull()
      .references(() => tags.id, { onDelete: 'cascade' }),
  },
  (table) => ({
    pk: primaryKey({ columns: [table.noteId, table.tagId] }),
  }),
)

export const attachments = sqliteTable('attachments', {
  id: text('id').primaryKey(),
  noteId: text('note_id')
    .notNull()
    .references(() => notes.id, { onDelete: 'cascade' }),
  kind: text('kind').notNull(),
  urlOrPath: text('url_or_path').notNull(),
  mime: text('mime'),
  createdAt: text('created_at').notNull(),
})
