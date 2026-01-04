export interface ProductForm {
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

export interface NoteFormFields {
  rating: number | null
  comment: string | null
}

export interface NoteFormTerms {
  nose: string[]
  palate: string[]
  finish: string[]
  color: string[]
}

export interface AttachmentForm {
  kind: 'image' | 'file'
  url_or_path: string
  mime: string | null
}

export interface NoteFormModel {
  product: ProductForm
  note: NoteFormFields
  terms: NoteFormTerms
  tags: string[]
  attachments: AttachmentForm[]
}
