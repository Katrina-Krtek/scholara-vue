<template>
  <aside class="sidebar" :class="{ collapsed: isCollapsed }">
    <button class="collapse-btn" @click="isCollapsed = !isCollapsed">
      {{ isCollapsed ? '☰' : '◀' }}
    </button>

    <RouterLink to="/" class="sidebar-logo">
      <img src="/scholarory-logo.png" alt="Scholarory logo" class="logo-img" />
    </RouterLink>

    <div v-if="!isCollapsed" class="sidebar-search">
      <input v-model="searchQuery" type="text" placeholder="Search Scholarory..." />
    </div>

    <div v-if="!isCollapsed" class="sidebar-actions">
      <button class="action-btn" @click="jotOpen = true">
        <span>⚡</span>
        <span>New Jot</span>
      </button>

      <button class="action-btn">
        <img src="/RoryFace.png" alt="Rory" class="rory-face" />
        <span>Ask Rory</span>
      </button>
    </div>

    <nav class="sidebar-nav">
      <div v-if="!isCollapsed" class="nav-section-label">Main</div>

      <RouterLink to="/" class="nav-item">📊 Dashboard</RouterLink>
      <RouterLink to="/inbox" class="nav-item">📥 Inbox</RouterLink>
      <RouterLink to="/notes" class="nav-item">📓 Notes</RouterLink>
      <RouterLink to="/calendar" class="nav-item">📅 Calendar</RouterLink>

      <div v-if="!isCollapsed" class="nav-section-label">Hubs</div>

      <RouterLink to="/academic" class="nav-item hub-item">🎓 Academic Hub</RouterLink>
      <RouterLink to="/courses" class="nav-item child-item">📚 Courses</RouterLink>
      <RouterLink to="/assignments" class="nav-item child-item">📝 Assignments</RouterLink>

      <RouterLink to="/research" class="nav-item hub-item">🔎 Resource Hub</RouterLink>
      <RouterLink to="/research/books" class="nav-item child-item">📘 Books</RouterLink>
      <RouterLink to="/research/articles" class="nav-item child-item">📰 Articles</RouterLink>
      <RouterLink to="/research/dissertations" class="nav-item child-item">🎓 Dissertations</RouterLink>
      <RouterLink to="/research/thesis" class="nav-item child-item">📄 Thesis</RouterLink>
      <RouterLink to="/research/webpages" class="nav-item child-item">🌐 Webpages</RouterLink>
      <RouterLink to="/research/blogs" class="nav-item child-item">✍️ Blogs</RouterLink>
      <RouterLink to="/research/video-media" class="nav-item child-item">🎥 Video & Media</RouterLink>
      <RouterLink to="/research/communications" class="nav-item child-item">💬 Communications</RouterLink>

      <RouterLink to="/writing" class="nav-item hub-item">✍️ Writing Hub</RouterLink>
    </nav>

    <div class="sidebar-bottom">
      <button class="bottom-btn">⚙️ Settings</button>
      <button class="bottom-btn">❔ Help</button>

      <button
        v-if="!isCollapsed"
        class="fw-btn"
        @click="isFullWidth = !isFullWidth"
        :title="isFullWidth ? 'Exit full width' : 'Full width'"
      >
        <span>{{ isFullWidth ? '⇥⇤ Collapse' : '⇤⇥ Full Width' }}</span>
      </button>

      <div class="user-row">
        <div class="user-avatar">{{ usernameInitial }}</div>
        <span v-if="!isCollapsed" class="user-name">{{ username }}</span>
        <button v-if="!isCollapsed" class="faq-btn">?</button>
      </div>
    </div>

    <JotModal :show="jotOpen" @close="jotOpen = false" @saved="onJotSaved" />
  </aside>
</template>

<script setup>
import { ref, computed } from 'vue'
import JotModal from './JotModal.vue'
import { getStoredUsername } from '@/lib/userPreferences'
import { useFullWidth } from '@/composables/useFullWidth'

const { isFullWidth } = useFullWidth()

const isCollapsed = ref(false)
const searchQuery = ref('')
const jotOpen = ref(false)

const username = getStoredUsername() || 'Student'
const usernameInitial = computed(() => username.charAt(0).toUpperCase())

function onJotSaved(text) {
  console.log('Jot saved:', text)
}
</script>

<style scoped>
.sidebar {
  width: 240px;
  min-height: 100vh;
  background: var(--bg-sidebar);
  border-right: 1px solid var(--sidebar-border);
  display: flex;
  flex-direction: column;
  padding: 1rem 0.75rem;
  gap: 0.75rem;
  transition: width 0.2s ease;
  flex-shrink: 0;
  box-sizing: border-box;
}

.sidebar.collapsed {
  width: 52px;
  padding: 1rem 0.25rem;
  align-items: center;
}

.collapse-btn {
  background: none;
  border: none;
  color: var(--text-muted);
  cursor: pointer;
  font-size: 0.8rem;
  align-self: flex-end;
  padding: 0.25rem 0.5rem;
}

.sidebar.collapsed .collapse-btn {
  align-self: center;
}

.sidebar-logo {
  display: flex;
  align-items: center;
  justify-content: center;
}

.logo-img {
  height: 36px;
  width: auto;
  object-fit: contain;
}

.sidebar-search input {
  width: 100%;
  background: var(--input-bg);
  border: 1px solid var(--border-color);
  border-radius: 6px;
  padding: 0.45rem 0.6rem;
  color: var(--text-primary);
  font-size: 0.85rem;
  outline: none;
  box-sizing: border-box;
}

.sidebar-actions {
  display: flex;
  gap: 0.5rem;
}

.action-btn {
  flex: 1;
  padding: 0.45rem 0.5rem;
  border-radius: 6px;
  border: 1px solid var(--border-color);
  background: var(--btn-bg);
  color: var(--text-primary);
  font-size: 0.8rem;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 0.3rem;
  justify-content: center;
}

.action-btn:hover {
  background: var(--btn-hover);
}

.rory-face {
  width: 18px;
  height: 18px;
  border-radius: 999px;
  object-fit: cover;
}

.sidebar-nav {
  display: flex;
  flex-direction: column;
  gap: 0.2rem;
  flex: 1;
  width: 100%;
  overflow-y: auto;
  padding-right: 0.15rem;
}

.nav-section-label {
  font-size: 0.68rem;
  color: var(--text-muted);
  text-transform: uppercase;
  letter-spacing: 0.05em;
  padding: 0.65rem 0.6rem 0.25rem;
}

.nav-item {
  display: block;
  padding: 0.45rem 0.6rem;
  border-radius: 6px;
  color: var(--text-secondary);
  text-decoration: none;
  font-size: 0.85rem;
  line-height: 1.2;
}

.nav-item:hover,
.nav-item.router-link-active,
.nav-item.router-link-exact-active {
  background: var(--accent-soft);
  color: var(--accent-text);
}

.hub-item {
  font-weight: 600;
  margin-top: 0.25rem;
}

.child-item {
  font-size: 0.8rem;
  padding-left: 1.4rem;
  color: var(--text-muted);
}

.sidebar-bottom {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
  border-top: 1px solid var(--border-color);
  padding-top: 0.75rem;
  width: 100%;
}

.bottom-btn {
  background: none;
  border: none;
  color: var(--text-secondary);
  font-size: 0.85rem;
  text-align: left;
  padding: 0.4rem 0.6rem;
  border-radius: 6px;
  cursor: pointer;
}

.bottom-btn:hover {
  background: var(--btn-hover);
  color: var(--text-primary);
}

.fw-btn {
  background: var(--btn-bg);
  border: 1px solid var(--border-color);
  color: var(--text-secondary);
  border-radius: 6px;
  padding: 0.35rem 0.5rem;
  font-size: 0.75rem;
  cursor: pointer;
}

.fw-btn:hover {
  background: var(--btn-hover);
  color: var(--text-primary);
}

.user-row {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.4rem 0.6rem;
  border-radius: 6px;
  margin-top: 0.25rem;
}

.user-avatar {
  width: 28px;
  height: 28px;
  border-radius: 999px;
  background: linear-gradient(135deg, #6366f1, #a855f7);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.8rem;
  font-weight: 700;
  color: white;
  flex-shrink: 0;
}

.user-name {
  font-size: 0.8rem;
  color: var(--text-secondary);
  flex: 1;
}

.faq-btn {
  width: 20px;
  height: 20px;
  border-radius: 999px;
  border: 1px solid var(--border-color);
  background: none;
  color: var(--text-muted);
  font-size: 0.7rem;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.faq-btn:hover {
  border-color: var(--accent);
  color: var(--accent-text);
}

.sidebar.collapsed .sidebar-search,
.sidebar.collapsed .sidebar-actions,
.sidebar.collapsed .nav-section-label,
.sidebar.collapsed .bottom-btn,
.sidebar.collapsed .fw-btn {
  display: none;
}

.sidebar.collapsed .nav-item {
  text-align: center;
  padding: 0.5rem 0;
  font-size: 0;
}

.sidebar.collapsed .nav-item::first-letter {
  font-size: 1rem;
}

.sidebar.collapsed .child-item {
  padding-left: 0;
}

.sidebar.collapsed .user-row {
  justify-content: center;
  padding: 0.4rem 0;
}
</style>