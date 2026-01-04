export const getErrorMessage = (err: unknown, fallback: string) => {
  if (err && typeof err === 'object') {
    const maybeData = err as { data?: { message?: string } }
    if (maybeData.data?.message) return maybeData.data.message

    const maybeMessage = err as { message?: string }
    if (maybeMessage.message) return maybeMessage.message
  }

  if (err instanceof Error) return err.message

  return fallback
}
