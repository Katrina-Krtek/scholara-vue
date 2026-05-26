<template>
  <div class="app-shell">
    <AppSidebar />

    <div class="app-body">
      <!-- Banner + Icon + Title -->
      <PageBanner
        :banner-key="bannerKey"
        :icon-key="bannerKey"
        :default-icon="defaultIcon"
      >
        <template #title>
          <div class="layout-title-area">
            <h1 class="layout-title">{{ title }}</h1>
            <span v-if="subtitle" class="layout-subtitle">{{ subtitle }}</span>
          </div>
        </template>
      </PageBanner>

      <!-- Optional action bar slot (buttons, filters, etc.) -->
      <div v-if="$slots.actions" class="layout-actions">
        <slot name="actions" />
      </div>

      <!-- Main page content -->
      <main :class="['layout-content', { 'full-width': isFullWidth }]">
        <slot />
      </main>
    </div>
  </div>
</template>

<script setup>
import AppSidebar from './AppSidebar.vue';
import PageBanner from './PageBanner.vue';
import { useFullWidth } from '@/composables/useFullWidth'

const { isFullWidth } = useFullWidth()

defineProps({
  title: { type: String, required: true },
  subtitle: { type: String, default: '' },
  bannerKey: { type: String, required: true },
  defaultIcon: { type: String, default: '📄' }
});
</script>

<style scoped>
.app-shell {
  display: flex;
  min-height: 100vh;
  background: var(--bg-primary);
  color: var(--text-primary);
  font-family: 'Inter', sans-serif;
}

.app-body {
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  min-width: 0;
}

.layout-title-area {
  display: flex;
  align-items: baseline;
  gap: 0.75rem;
}

.layout-title {
  font-size: 1.6rem;
  font-weight: 700;
  color: var(--text-primary);
  margin: 0;
}

.layout-subtitle {
  font-size: 0.85rem;
  color: var(--text-muted);
}

.layout-actions {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0.75rem 2rem;
  border-bottom: 1px solid var(--border-color);
  background: var(--bg-primary);
  gap: 0.5rem;
  flex-wrap: wrap;
}

.layout-content {
  flex: 1;
  overflow-y: auto;
  padding: 1.5rem 2rem;
}
</style>