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

export interface AdminSuggestionsResponse {
  terms: {
    nose: string[]
    palate: string[]
    finish: string[]
    color: string[]
  }
  tags: string[]
}
