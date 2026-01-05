export interface NoteSummary {
  id: string
  productId: string
  rating: number | null
  comment: string | null
  createdAt: string
  updatedAt: string
}

export interface ProductSummary {
  id: string
  kind: string
  name: string
  producer: string | null
  country: string | null
  region: string | null
  abv: number | null
  vintage: string | null
  age: number | null
  volumeMl: number | null
  createdAt: string
  updatedAt: string
}

export interface NotesListItem {
  note: NoteSummary
  product: ProductSummary
  tags: string[]
}

export interface NotesListResponse {
  items: NotesListItem[]
  total: number
  page: number
  pageSize: number
}

export interface TagCount {
  name: string
  count: number
}

export type TagsResponse = TagCount[]

export interface NoteDetailResponse {
  note: NoteSummary
  product: ProductSummary
  terms: {
    nose: string[]
    palate: string[]
    finish: string[]
    color: string[]
  }
  tags: string[]
  attachments: Array<{
    id: string
    noteId: string
    kind: 'image' | 'file'
    urlOrPath: string
    mime: string | null
    createdAt: string
  }>
}

export interface StatsResponse {
  byKind: Array<{
    kind: string
    count: number
    avgRating: number | null
  }>
  byMonth: Array<{
    month: string
    count: number
    avgRating: number | null
  }>
}

export interface AdminSuggestionsResponse {
  terms: {
    nose: string[]
    palate: string[]
    finish: string[]
    color: string[]
  }
  tags: string[]
}

export interface AdminAttachmentInput {
  kind: 'image' | 'file'
  url_or_path: string
  mime: string | null
}

export interface AdminNotePayload {
  product: {
    id?: string
    kind: string
    name: string
    producer: string | null
    country: string | null
    region: string | null
    abv: number | null
    vintage: string | null
    age: number | null
    volume_ml: number | null
  }
  note: {
    rating: number | null
    comment: string | null
  }
  terms: {
    nose: string[]
    palate: string[]
    finish: string[]
    color: string[]
  }
  tags: string[]
  attachments: AdminAttachmentInput[]
}

export interface AdminNoteCreateResponse {
  id: string
}

export interface AdminOkResponse {
  ok: true
}

export interface AdminDeleteResponse {
  success: true
}
