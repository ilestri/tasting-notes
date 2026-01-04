<template>
  <div>
    <section class="card stats">
      <header class="section-header">
        <h2>통계</h2>
        <p class="muted">최근 기록을 기준으로 한 집계입니다.</p>
      </header>

      <div v-if="pending" class="loading">불러오는 중...</div>
      <div v-else-if="error" class="error">{{ error.message }}</div>
      <div v-else-if="!stats || (!stats.byKind.length && !stats.byMonth.length)" class="empty">
        아직 통계가 없습니다.
      </div>
      <div v-else class="stats-grid">
        <div>
          <h4>종류별</h4>
          <ul v-if="stats.byKind.length">
            <li v-for="item in stats.byKind" :key="item.kind">
              <strong>{{ kindLabel(item.kind) }}</strong>
              <span>{{ item.count }}건</span>
              <span v-if="item.avgRating !== null && item.avgRating !== undefined">
                · 평균 {{ Number(item.avgRating).toFixed(1) }}
              </span>
            </li>
          </ul>
          <p v-else class="muted">기록이 없습니다.</p>
        </div>
        <div>
          <h4>월별</h4>
          <ul v-if="stats.byMonth.length">
            <li v-for="item in stats.byMonth" :key="item.month">
              <strong>{{ item.month }}</strong>
              <span>{{ item.count }}건</span>
              <span v-if="item.avgRating !== null && item.avgRating !== undefined">
                · 평균 {{ Number(item.avgRating).toFixed(1) }}
              </span>
            </li>
          </ul>
          <p v-else class="muted">기록이 없습니다.</p>
        </div>
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
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
</script>
