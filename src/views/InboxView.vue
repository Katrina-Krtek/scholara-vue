<template>
  <AppLayout
    title="Inbox"
    :subtitle="`${unfiledJots.length} unprocessed`"
    banner-key="inbox"
    default-icon="📥"
  >
    <template #actions>
      <div style="margin-left:auto">
        <button
          class="action-btn"
          :class="{ active: showFiled }"
          @click="showFiled = !showFiled"
        >
          {{ showFiled ? 'Hide Filed' : 'Show Filed' }}
        </button>
      </div>
    </template>

    <div class="inbox-body">
      <div v-if="unfiledJots.length === 0 && !showFiled" class="empty-state">
        <p class="empty-icon">✅</p>
        <p class="empty-title">Inbox zero!</p>
        <p class="empty-sub">All jots filed. Use ⚡ New Jot to capture something.</p>
      </div>

      <div v-if="unfiledJots.length > 0" class="jots-section">
        <div class="section-label">Unprocessed ({{ unfiledJots.length }})</div>
        <div class="jots-list">
          <div v-for="jot in unfiledJots" :key="jot.id" class="jot-card">
            <div class="jot-text">{{ jot.text }}</div>
            <div class="jot-meta">
              <span class="jot-time">{{ formatDate(jot.createdAt) }}</span>
              <div class="jot-actions">
                <button class="jot-action-btn file-btn" @click="fileJot(jot.id)">📁 File</button>
                <button class="jot-action-btn delete-btn" @click="confirmDelete(jot.id)">🗑 Delete</button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div v-if="showFiled && filedJots.length > 0" class="jots-section">
        <div class="section-label">Filed ({{ filedJots.length }})</div>
        <div class="jots-list">
          <div v-for="jot in filedJots" :key="jot.id" class="jot-card filed">
            <div class="jot-text">{{ jot.text }}</div>
            <div class="jot-meta">
              <span class="jot-time">{{ formatDate(jot.createdAt) }}</span>
              <div class="jot-actions">
                <button class="jot-action-btn unfile-btn" @click="unfileJot(jot.id)">↩ Unfile</button>
                <button class="jot-action-btn delete-btn" @click="confirmDelete(jot.id)">🗑 Delete</button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div v-if="showFiled && filedJots.length === 0" class="empty-sub" style="padding:1rem 0">
        No filed jots yet.
      </div>
    </div>
  </AppLayout>
</template>

<script setup>
import { ref } from 'vue';
import AppLayout from '../components/AppLayout.vue';
import { useJots } from '../composables/useJots';

const { unfiledJots, filedJots, fileJot, unfileJot, deleteJot } = useJots();
const showFiled = ref(false);

function formatDate(iso) {
  return new Date(iso).toLocaleDateString('en-US', {
    month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit'
  });
}

function confirmDelete(id) {
  if (confirm('Delete this jot? This cannot be undone.')) deleteJot(id);
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
.action-btn:hover, .action-btn.active {
  background: var(--accent-soft);
  color: var(--accent-text);
  border-color: var(--accent);
}
.inbox-body { display: flex; flex-direction: column; gap: 2rem; }
.jots-section { display: flex; flex-direction: column; gap: 0.75rem; }
.section-label {
  font-size: 0.72rem;
  font-weight: 600;
  color: var(--text-muted);
  text-transform: uppercase;
  letter-spacing: 0.06em;
}
.jots-list { display: flex; flex-direction: column; gap: 0.5rem; }
.jot-card {
  background: var(--bg-card);
  border: 1px solid var(--border-color);
  border-radius: 10px;
  padding: 1rem 1.25rem;
  display: flex;
  flex-direction: column;
  gap: 0.6rem;
  box-shadow: var(--shadow);
  transition: border-color 0.15s;
}
.jot-card:hover { border-color: var(--accent); }
.jot-card.filed { opacity: 0.6; }
.jot-text { font-size: 0.92rem; color: var(--text-primary); line-height: 1.6; white-space: pre-wrap; }
.jot-meta { display: flex; align-items: center; justify-content: space-between; }
.jot-time { font-size: 0.75rem; color: var(--text-muted); }
.jot-actions { display: flex; gap: 0.4rem; }
.jot-action-btn {
  background: none;
  border: 1px solid var(--border-color);
  border-radius: 5px;
  padding: 0.25rem 0.6rem;
  font-size: 0.75rem;
  cursor: pointer;
  color: var(--text-secondary);
  transition: all 0.15s;
}
.file-btn:hover { background: var(--accent-soft); color: var(--accent-text); border-color: var(--accent); }
.unfile-btn:hover { background: var(--btn-hover); color: var(--text-primary); }
.delete-btn:hover { background: rgba(239,68,68,0.15); color: #ef4444; border-color: rgba(239,68,68,0.3); }
.empty-state { display: flex; flex-direction: column; align-items: center; justify-content: center; height: 50vh; gap: 0.5rem; text-align: center; }
.empty-icon { font-size: 2.5rem; margin: 0; }
.empty-title { font-size: 1.1rem; font-weight: 600; color: var(--text-primary); margin: 0; }
.empty-sub { font-size: 0.85rem; color: var(--text-muted); margin: 0; }
</style>