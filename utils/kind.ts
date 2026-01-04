export const KIND_OPTIONS = [
  { value: 'whisky', label: '위스키' },
  { value: 'wine', label: '와인' },
  { value: 'sake', label: '사케' },
  { value: 'makgeolli', label: '막걸리' },
  { value: 'etc', label: '기타' },
] as const

const KIND_LABELS: Record<string, string> = KIND_OPTIONS.reduce(
  (acc, option) => {
    acc[option.value] = option.label
    return acc
  },
  {} as Record<string, string>,
)

export const kindLabel = (value: string) => KIND_LABELS[value] ?? value
