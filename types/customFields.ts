export type CustomFieldType = 'string' | 'number' | 'boolean'

export type CustomFieldValue = string | number | boolean

export interface CustomField {
  key: string
  type: CustomFieldType
  value: CustomFieldValue
}
