<template>
  <div class="app-shell">
    <AppSidebar />

    <main class="app-main">
      <header class="app-topbar">
        <div>
          <h1>{{ title }}</h1>
          <p v-if="subtitle">{{ subtitle }}</p>
        </div>

        <button class="width-toggle" @click="toggleFullWidth">
          {{ isFullWidth ? 'Normal width' : 'Full width' }}
        </button>
      </header>

      <section
        class="app-content"
        :class="{ 'full-width': isFullWidth }"
      >
        <slot />
      </section>
    </main>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import AppSidebar from './AppSidebar.vue'

defineProps({
  title: {
    type: String,
    default: ''
  },
  subtitle: {
    type: String,
    default: ''
  },
  bannerKey: {
    type: String,
    default: ''
  },
  defaultIcon: {
    type: String,
    default: '📄'
  }
})

const STORAGE_KEY = 'scholarory_full_width'
const isFullWidth = ref(false)

onMounted(() => {
  isFullWidth.value = localStorage.getItem(STORAGE_KEY) === 'true'
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
  gap: 1rem;
  background: var(--bg-primary);
}

.app-topbar h1 {
  margin: 0;
  font-size: 1.15rem;
}

.app-topbar p {
  margin: 0.2rem 0 0;
  color: var(--text-muted);
  font-size: 0.85rem;
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
  max-width: 1120px;
  margin: 0 auto;
  padding: 1.5rem 2rem 4rem;
  box-sizing: border-box;
}

.app-content.full-width {
  max-width: none;
  margin: 0;
}
</style>