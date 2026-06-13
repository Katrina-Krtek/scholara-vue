<template>
  <AppLayout
    title="Dashboard"
    :subtitle="formattedDate"
    banner-key="dashboard"
    default-icon="🏠"
  >
    <template #actions>
      <div style="display:flex; gap:0.5rem; margin-left:auto;">
        <ThemeSwitcher />
        <button class="action-btn">⚙ Settings</button>
      </div>
    </template>


    <DashboardStatsCards />
    <AcademicCommandCenter />
    <UpcomingAssignmentsWidget />
    <TodaysTasksWidget />


    <!-- Recent Jots Widget -->
    <div class="widget">
      <div class="widget-header">
        <span class="widget-title">⚡ Recent Jots</span>
        <router-link to="/inbox" class="widget-link">View Inbox →</router-link>
      </div>

      <div v-if="unfiledJots.length === 0" class="widget-empty">
        No jots yet — hit ⚡ New Jot to capture something.
      </div>

      <div v-else class="widget-jots">
        <div
          v-for="jot in unfiledJots.slice(0, 3)"
          :key="jot.id"
          class="widget-jot"
        >
          <span class="widget-jot-text">{{ jot.text }}</span>
          <span class="widget-jot-time">{{ formatDate(jot.createdAt) }}</span>
        </div>
      </div>
    </div>
  </AppLayout>
</template>

<script setup>
import AppLayout from '../components/AppLayout.vue'
import ThemeSwitcher from '../components/ThemeSwitcher.vue'
import { useJots } from '../composables/useJots'
import AcademicCommandCenter from '@/components/academic/AcademicCommandCenter.vue'
import UpcomingAssignmentsWidget from '@/components/dashboard/UpcomingAssignmentsWidget.vue'
import DashboardStatsCards from '@/components/dashboard/DashboardStatsCards.vue'
import TodaysTasksWidget from '@/components/dashboard/TodaysTasksWidget.vue'

const { unfiledJots } = useJots()

const formattedDate = new Date().toLocaleDateString('en-US', {
  weekday: 'long',
  month: 'long',
  day: 'numeric',
  year: 'numeric',
})

function formatDate(iso) {
  return new Date(iso).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  })
}
</script>

<style scoped>
.action-btn {
  background: var(--btn-bg);
  border: 1px solid var(--border-color);
  color: var(--text-secondary);
  border-radius: 6px;
  padding: 0.4rem 0.9rem;
  font-size: 0.82rem;
  cursor: pointer;
  transition: background 0.15s;
}

.action-btn:hover {
  background: var(--btn-hover);
  color: var(--text-primary);
}

.widget {
  background: var(--bg-card);
  border: 1px solid var(--border-color);
  border-radius: 12px;
  padding: 1.25rem;
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  max-width: 600px;
  box-shadow: var(--shadow);
}

.widget-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.widget-title {
  font-size: 0.9rem;
  font-weight: 600;
  color: var(--text-primary);
}

.widget-link {
  font-size: 0.78rem;
  color: var(--accent);
  text-decoration: none;
}

.widget-link:hover {
  color: var(--accent-text);
}

.widget-empty {
  font-size: 0.82rem;
  color: var(--text-muted);
  padding: 0.5rem 0;
}

.widget-jots {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.widget-jot {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 1rem;
  padding: 0.6rem 0.75rem;
  background: var(--btn-bg);
  border-radius: 7px;
  border: 1px solid var(--border-color);
}

.widget-jot-text {
  font-size: 0.85rem;
  color: var(--text-secondary);
  flex: 1;
  line-height: 1.5;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.widget-jot-time {
  font-size: 0.72rem;
  color: var(--text-muted);
  flex-shrink: 0;
}
</style>