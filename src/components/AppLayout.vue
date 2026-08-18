<template>
  <div class="app-shell">
    <AppSidebar />

    <main class="app-main">
      <PageBanner
        v-if="bannerKey"
        :banner-key="bannerKey"
        :icon-key="bannerKey"
        :default-icon="defaultIcon"
      >
        <template #title>
          <div class="page-header-row">
            <div class="page-title-copy">
              <slot name="header">
                <div>
                  <h1>{{ title }}</h1>
                  <p v-if="subtitle">{{ subtitle }}</p>
                </div>
              </slot>
            </div>

            <div class="topbar-actions">
              <slot name="actions" />

              <button class="width-toggle" @click="toggleFullWidth">
                {{ isFullWidth ? 'Normal width' : 'Full width' }}
              </button>
            </div>
          </div>
        </template>
      </PageBanner>

      <header v-else class="app-topbar">
        <div class="topbar-left">
          <slot name="header">
            <div>
              <h1>{{ title }}</h1>
              <p v-if="subtitle">{{ subtitle }}</p>
            </div>
          </slot>
        </div>

        <div class="topbar-actions">
          <slot name="actions" />

          <button class="width-toggle" @click="toggleFullWidth">
            {{ isFullWidth ? 'Normal width' : 'Full width' }}
          </button>
        </div>
      </header>

      <section class="app-content" :class="{ 'full-width': isFullWidth }">
        <UniversalPageCanvas :page-key="canvasPageKey">
          <template #system>
            <slot />
          </template>
        </UniversalPageCanvas>
      </section>
    </main>
  </div>
</template>

<script setup>
import { computed, ref, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import AppSidebar from './AppSidebar.vue'
import PageBanner from './PageBanner.vue'
import UniversalPageCanvas from './universal/UniversalPageCanvas.vue'

const props = defineProps({
  title: {
    type: String,
    default: '',
  },

  subtitle: {
    type: String,
    default: '',
  },

  bannerKey: {
    type: String,
    default: '',
  },

  defaultIcon: {
    type: String,
    default: '📄',
  },

  canvasKey: {
    type: String,
    default: '',
  },
})

const route = useRoute()
const STORAGE_KEY = 'zeyteo_full_width'
const LEGACY_STORAGE_KEY = 'scholarory_full_width'
const isFullWidth = ref(false)

// Canvas identity must be unique per actual page/record. Banner keys are intentionally
// reusable presentation keys (for example every Course Detail uses "course-detail"),
// so they must not be the primary persistence key for page content/layout.
const canvasPageKey = computed(() => {
  if (props.canvasKey) return props.canvasKey
  if (route.name) return `route:${String(route.name)}:${route.path}`
  if (route.path) return `path:${route.path}`
  if (props.bannerKey) return `banner:${props.bannerKey}`
  return `title:${props.title || 'page'}`
})

onMounted(() => {
  const stored = localStorage.getItem(STORAGE_KEY)
  const legacyStored = localStorage.getItem(LEGACY_STORAGE_KEY)
  isFullWidth.value = (stored ?? legacyStored) === 'true'
})

function toggleFullWidth() {
  isFullWidth.value = !isFullWidth.value
  localStorage.setItem(STORAGE_KEY, String(isFullWidth.value))
}
</script>

<style scoped>
.app-shell {
  min-height: 100vh;
  display: flex;
  background: var(--bg-primary);
  color: var(--text-primary);
}

.app-main {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
}

.app-topbar {
  min-height: 64px;
  padding: 1rem 2rem;
  border-bottom: 1px solid var(--border-color);
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 1.25rem;
  background: var(--bg-primary);
}

.page-header-row {
  flex: 1;
  min-width: 0;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1.25rem;
}

.page-title-copy,
.topbar-left {
  min-width: 0;
}

.page-title-copy h1,
.topbar-left h1,
.app-topbar h1 {
  margin: 0;
  font-size: 1.15rem;
}

.page-title-copy p,
.topbar-left p,
.app-topbar p {
  margin: 0.2rem 0 0;
  color: var(--text-muted);
  font-size: 0.85rem;
}

.topbar-actions {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  flex-wrap: wrap;
  gap: 0.5rem;
}

.width-toggle {
  border: 1px solid var(--border-color);
  background: var(--btn-bg);
  color: var(--text-secondary);
  border-radius: 8px;
  padding: 0.45rem 0.7rem;
  cursor: pointer;
  font-size: 0.82rem;
}

.width-toggle:hover {
  color: var(--text-primary);
  border-color: var(--accent);
}

.app-content {
  width: 100%;
  margin: 0;
  padding: 1.5rem 2rem 4rem;
  box-sizing: border-box;
}

.app-content.full-width {
  padding-left: 1rem;
  padding-right: 1rem;
}

.app-content.full-width :deep(.notion-page),
.app-content.full-width :deep(.knowledge-page),
.app-content.full-width :deep(.tag-detail-page),
.app-content.full-width :deep(.graph-page),
.app-content.full-width :deep(.hub-content),
.app-content.full-width :deep(.daily-page) {
  max-width: none;
  width: 100%;
}

@media (max-width: 760px) {
  .app-topbar,
  .page-header-row {
    flex-direction: column;
    align-items: flex-start;
  }

  .topbar-actions {
    justify-content: flex-start;
  }

  .app-content,
  .app-content.full-width {
    padding: 1rem;
  }
}
</style>
