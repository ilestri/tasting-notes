export const parseNumber = (value: string | number, integer = false) => {
  if (typeof value === 'number') {
    if (Number.isNaN(value)) return null
    return integer ? Math.trunc(value) : value
  }
  const trimmed = value.trim()
  if (!trimmed) return null
  const num = Number(trimmed)
  if (Number.isNaN(num)) return null
  return integer ? Math.trunc(num) : num
}
