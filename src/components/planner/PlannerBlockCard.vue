<template>
  <div
    class="planner-block-card"
    :class="block.type"
  >
    <div class="block-header">
      <span class="block-icon">
        {{ icon }}
      </span>

      <strong>
        {{ block.title }}
      </strong>
    </div>

    <div class="block-time">
      {{ block.start }} - {{ block.end }}
    </div>

    <div
      v-if="block.course"
      class="block-course"
    >
      {{ block.course }}
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  block: {
    type: Object,
    required: true
  }
})

const icon = computed(() => {
  const icons = {
    study: '📚',
    assignment: '📝',
    reading: '📖',
    writing: '✍️',
    meeting: '👥',
    exercise: '🏋️',
    personal: '☕',
    prayer: '🙏'
  }

  return icons[props.block.type] || '🗓️'
})
</script>

<style scoped>
.planner-block-card {
  background: var(--bg-card);
  border: 1px solid var(--border-color);
  border-left: 4px solid var(--accent);
  border-radius: 12px;
  padding: 0.85rem 1rem;
  box-shadow: var(--shadow);
}

.block-header {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  color: var(--text-primary);
}

.block-icon {
  font-size: 1rem;
}

.block-time {
  margin-top: 0.35rem;
  color: var(--text-secondary);
  font-size: 0.85rem;
}

.block-course {
  margin-top: 0.25rem;
  color: var(--text-muted);
  font-size: 0.8rem;
}

.planner-block-card.reading {
  border-left-color: #14b8a6;
}

.planner-block-card.writing {
  border-left-color: #8b5cf6;
}

.planner-block-card.study {
  border-left-color: #2563eb;
}

.planner-block-card.exercise {
  border-left-color: #22c55e;
}

.planner-block-card.personal {
  border-left-color: #64748b;
}

.planner-block-card.prayer {
  border-left-color: #d4af37;
}

.planner-block-card.assignment {
  border-left-color: #f59e0b;
}

.planner-block-card.meeting {
  border-left-color: #ec4899;
}
</style>