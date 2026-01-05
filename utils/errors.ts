export const getErrorMessage = (err: unknown, fallback: string) => {
  if (err && typeof err === 'object') {
    const record = err as {
      data?: { statusMessage?: string }
      statusMessage?: string
      message?: string
    }
    return record.data?.statusMessage || record.statusMessage || record.message || fallback
  }
  return fallback
}
