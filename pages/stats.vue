<template>
  <div class="page-stats">
    <section class="c-card c-stats-hero">
      <header class="c-section-header">
        <div>
          <h2>통계</h2>
          <p class="u-muted">최근 기록을 기준으로 한 집계입니다.</p>
        </div>
        <p v-if="latestMonthLabel" class="c-stats-badge">최근 {{ latestMonthLabel }}</p>
      </header>

      <div v-if="pending" class="u-loading">불러오는 중...</div>
      <div v-else-if="error" class="u-error">{{ error.message }}</div>
      <div v-else-if="!stats || (!stats.byKind.length && !stats.byMonth.length)" class="u-empty">
        아직 통계가 없습니다.
      </div>
      <div v-else class="c-stats-summary">
        <div class="c-stat-card">
          <p class="c-stat-label">총 노트</p>
          <p class="c-stat-value">{{ totalCount }}<span class="c-stat-unit">건</span></p>
        </div>
        <div class="c-stat-card">
          <p class="c-stat-label">평균 평점</p>
          <p class="c-stat-value">{{ overallAvgRating ?? '-' }}</p>
          <p class="c-stat-sub u-muted">가중 평균</p>
        </div>
        <div class="c-stat-card">
          <p class="c-stat-label">최다 종류</p>
          <p class="c-stat-value">{{ topKindLabel }}</p>
          <p class="c-stat-sub u-muted">{{ topKindCount }}건</p>
        </div>
        <div class="c-stat-card">
          <p class="c-stat-label">최근 월</p>
          <p class="c-stat-value">{{ latestMonthLabel }}</p>
          <p class="c-stat-sub u-muted">{{ latestMonthCount }}건</p>
        </div>
      </div>
    </section>

    <div
      v-if="stats && !pending && !error && (stats.byKind.length || stats.byMonth.length)"
      class="c-stats-panels"
    >
      <section class="c-card">
        <header class="c-panel-header">
          <h3>종류별</h3>
          <span class="c-panel-hint">건수 기준</span>
        </header>
        <ul v-if="sortedByKind.length" class="c-stat-list">
          <li v-for="item in sortedByKind" :key="item.kind" class="c-stat-row">
            <div class="c-stat-row-top">
              <strong>{{ kindLabel(item.kind) }}</strong>
              <div class="c-stat-row-meta">
                <span>{{ item.count }}건</span>
                <span v-if="item.avgRating !== null && item.avgRating !== undefined">
                  · 평균 {{ formatRating(item.avgRating) }}
                </span>
              </div>
            </div>
            <div class="c-stat-bar" :style="{ '--value': kindScale(item.count) }">
              <span class="c-stat-bar-fill"></span>
            </div>
          </li>
        </ul>
        <p v-else class="u-muted">기록이 없습니다.</p>
      </section>

      <section class="c-card">
        <header class="c-panel-header">
          <h3>월별</h3>
          <span class="c-panel-hint">최근 순</span>
        </header>
        <ul v-if="stats.byMonth.length" class="c-stat-list">
          <li v-for="item in stats.byMonth" :key="item.month" class="c-stat-row">
            <div class="c-stat-row-top">
              <strong>{{ formatMonth(item.month) }}</strong>
              <div class="c-stat-row-meta">
                <span>{{ item.count }}건</span>
                <span v-if="item.avgRating !== null && item.avgRating !== undefined">
                  · 평균 {{ formatRating(item.avgRating) }}
                </span>
              </div>
            </div>
            <div class="c-stat-bar" :style="{ '--value': monthScale(item.count) }">
              <span class="c-stat-bar-fill"></span>
            </div>
          </li>
        </ul>
        <p v-else class="u-muted">기록이 없습니다.</p>
      </section>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useAsyncData } from 'nuxt/app'
import { kindLabel } from '~/utils/kind'

interface StatsResponse {
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

const fetchStats = () =>
  ($fetch as unknown as (url: string) => Promise<StatsResponse>)('/api/stats')

const { data: stats, pending, error } = await useAsyncData<StatsResponse>('stats', fetchStats)

const sortedByKind = computed(() => {
  const items = stats.value?.byKind ?? []
  return [...items].filter((item) => item.count > 0).sort((a, b) => b.count - a.count)
})

const totalCount = computed(() => {
  const items = stats.value?.byMonth ?? []
  return items.reduce((sum, item) => sum + item.count, 0)
})

const overallAvgRating = computed(() => {
  const items = stats.value?.byKind ?? []
  let sum = 0
  let count = 0
  for (const item of items) {
    if (item.avgRating === null || item.avgRating === undefined || item.count <= 0) continue
    sum += Number(item.avgRating) * item.count
    count += item.count
  }
  if (!count) return null
  return (sum / count).toFixed(1)
})

const topKind = computed(() => sortedByKind.value[0] ?? null)
const topKindLabel = computed(() => (topKind.value ? kindLabel(topKind.value.kind) : '-'))
const topKindCount = computed(() => topKind.value?.count ?? 0)

const latestMonth = computed(() => stats.value?.byMonth?.[0] ?? null)
const latestMonthLabel = computed(() => formatMonth(latestMonth.value?.month))
const latestMonthCount = computed(() => latestMonth.value?.count ?? 0)

const maxKindCount = computed(() => {
  const counts = sortedByKind.value.map((item) => item.count)
  return counts.length ? Math.max(1, ...counts) : 1
})

const maxMonthCount = computed(() => {
  const counts = stats.value?.byMonth?.map((item) => item.count) ?? []
  return counts.length ? Math.max(1, ...counts) : 1
})

const kindScale = (count: number) => `${Math.round((count / maxKindCount.value) * 100)}%`
const monthScale = (count: number) => `${Math.round((count / maxMonthCount.value) * 100)}%`

const formatMonth = (value?: string | null) => {
  if (!value) return '-'
  return value.replace('-', '.')
}

const formatRating = (value: number) => Number(value).toFixed(1)
</script>
