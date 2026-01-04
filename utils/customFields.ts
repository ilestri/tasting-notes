import type { CustomField, CustomFieldType } from '~/types/customFields'

const inferType = (value: unknown): CustomFieldType => {
  if (typeof value === 'number' && !Number.isNaN(value)) return 'number'
  if (typeof value === 'boolean') return 'boolean'
  return 'string'
}

export const fieldsFromMap = (
  extra?: Record<string, string | number | boolean> | null,
): CustomField[] => {
  if (!extra) return []

  return Object.entries(extra)
    .map(([key, value]) => ({
      key,
      type: inferType(value),
      value,
    }))
    .sort((a, b) => a.key.localeCompare(b.key))
}

export const mapFromFields = (fields: CustomField[]) => {
  const entries = fields
    .map((field) => ({
      key: field.key.trim(),
      value: field.value,
    }))
    .filter((field) => field.key.length > 0)

  return Object.fromEntries(entries.map((field) => [field.key, field.value])) as Record<
    string,
    string | number | boolean
  >
}
