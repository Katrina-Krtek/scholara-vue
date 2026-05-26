<template>
  <div class="theme-switcher">
    <button
      v-for="(theme, key) in themes"
      :key="key"
      class="theme-btn"
      :class="{ active: currentTheme === key }"
      :title="theme.label"
      @click="setTheme(key)"
    >
      {{ theme.label }}
    </button>
  </div>
</template>

<script setup>
import { useTheme } from '../composables/useTheme';
const { currentTheme, themes, setTheme } = useTheme();
</script>

<style scoped>
.theme-switcher {
  display: flex;
  gap: 0.4rem;
  flex-wrap: wrap;
}
.theme-btn {
  padding: 0.3rem 0.7rem;
  border-radius: 6px;
  border: 1px solid var(--border-color);
  background: var(--btn-bg);
  color: var(--text-secondary);
  font-size: 0.75rem;
  cursor: pointer;
  transition: all 0.15s;
}
.theme-btn:hover {
  background: var(--btn-hover);
  color: var(--text-primary);
}
.theme-btn.active {
  background: var(--accent-soft);
  color: var(--accent-text);
  border-color: var(--accent);
  font-weight: 600;
}
</style>