<template>
  <Teleport to="body">
    <div v-if="show" class="jot-overlay" @click.self="$emit('close')">
      <div class="jot-modal">
        <div class="jot-header">
          <span class="jot-title">⚡ Quick Jot</span>
          <button class="jot-close" @click="$emit('close')">✕</button>
        </div>

        <textarea
          ref="textareaRef"
          v-model="content"
          class="jot-textarea"
          placeholder="Type anything — a thought, task, idea, reminder..."
          @keydown.meta.enter="save"
          @keydown.ctrl.enter="save"
          @keydown.esc="$emit('close')"
        />

        <div class="jot-footer">
          <span class="jot-hint">⌘ + Enter to save &nbsp;·&nbsp; Esc to discard</span>
          <div class="jot-actions">
            <button class="jot-btn-cancel" @click="$emit('close')">Cancel</button>
            <button class="jot-btn-save" :disabled="!content.trim()" @click="save">Save Jot</button>
          </div>
        </div>
      </div>
    </div>
  </Teleport>
</template>

<script setup>
import { ref, watch, nextTick } from 'vue';
import { useJots } from '../composables/useJots';

const props = defineProps({
  show: Boolean
});

const emit = defineEmits(['close', 'saved']);

const { addJot } = useJots();
const content = ref('');
const textareaRef = ref(null);

watch(() => props.show, async (val) => {
  if (val) {
    content.value = '';
    await nextTick();
    textareaRef.value?.focus();
  }
});

function save() {
  if (!content.value.trim()) return;
  addJot(content.value);
  emit('saved', content.value.trim());
  emit('close');
}
</script>

<style scoped>
.jot-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.6);
  backdrop-filter: blur(4px);
  z-index: 1000;
  display: flex;
  align-items: center;
  justify-content: center;
}

.jot-modal {
  background: #0f172a;
  border: 1px solid rgba(148, 163, 184, 0.2);
  border-radius: 12px;
  width: 520px;
  max-width: 90vw;
  display: flex;
  flex-direction: column;
  gap: 0;
  box-shadow: 0 25px 60px rgba(0, 0, 0, 0.6);
  overflow: hidden;
}

.jot-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 1rem 1.25rem 0.75rem;
  border-bottom: 1px solid rgba(148, 163, 184, 0.1);
}

.jot-title {
  font-size: 0.95rem;
  font-weight: 600;
  color: #f9fafb;
}

.jot-close {
  background: none;
  border: none;
  color: #64748b;
  font-size: 0.9rem;
  cursor: pointer;
  padding: 0.2rem 0.4rem;
  border-radius: 4px;
  transition: color 0.15s;
}

.jot-close:hover {
  color: #f9fafb;
}

.jot-textarea {
  width: 100%;
  min-height: 160px;
  background: transparent;
  border: none;
  outline: none;
  color: #f9fafb;
  font-size: 0.95rem;
  line-height: 1.6;
  padding: 1rem 1.25rem;
  resize: none;
  font-family: inherit;
  box-sizing: border-box;
}

.jot-textarea::placeholder {
  color: #475569;
}

.jot-footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0.75rem 1.25rem;
  border-top: 1px solid rgba(148, 163, 184, 0.1);
  background: rgba(255, 255, 255, 0.02);
}

.jot-hint {
  font-size: 0.75rem;
  color: #475569;
}

.jot-actions {
  display: flex;
  gap: 0.5rem;
}

.jot-btn-cancel {
  background: none;
  border: 1px solid rgba(148, 163, 184, 0.2);
  color: #94a3b8;
  border-radius: 6px;
  padding: 0.4rem 0.9rem;
  font-size: 0.82rem;
  cursor: pointer;
  transition: background 0.15s;
}

.jot-btn-cancel:hover {
  background: rgba(255, 255, 255, 0.05);
  color: #f9fafb;
}

.jot-btn-save {
  background: linear-gradient(135deg, #6366f1, #a855f7);
  border: none;
  color: white;
  border-radius: 6px;
  padding: 0.4rem 0.9rem;
  font-size: 0.82rem;
  font-weight: 600;
  cursor: pointer;
  transition: opacity 0.15s;
}

.jot-btn-save:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}

.jot-btn-save:not(:disabled):hover {
  opacity: 0.85;
}
</style>