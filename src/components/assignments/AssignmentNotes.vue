<template>
  <section class="notes-card">
    <h3>Assignment Notes</h3>

    <div class="notes-grid">
      <div class="notes-section">
        <label>Instructor Notes</label>
        <textarea
          :value="instructorNotes"
          class="notes-textarea"
          placeholder="Paste instructor comments, assignment clarifications, or course-specific guidance..."
          @input="$emit('update:instructorNotes', $event.target.value)"
        />
      </div>

      <div class="notes-section">
        <label>Personal Notes</label>
        <textarea
          :value="personalNotes"
          class="notes-textarea"
          placeholder="Write your own planning notes, ideas, reminders, or questions..."
          @input="$emit('update:personalNotes', $event.target.value)"
        />
      </div>
    </div>
  </section>
</template>

<script setup>
defineProps({
  instructorNotes: {
    type: String,
    default: '',
  },
  personalNotes: {
    type: String,
    default: '',
  },
})

defineEmits(['update:instructorNotes', 'update:personalNotes'])
</script>

<style scoped>
.notes-card {
  background: var(--bg-card);
  border: 1px solid var(--border-color);
  border-radius: 18px;
  padding: 1rem;
  box-shadow: var(--shadow);
}

.notes-card h3 {
  margin: 0 0 1rem;
  color: var(--text-primary);
}

.notes-grid {
  display: grid;
  gap: 1rem;
}

.notes-section {
  display: grid;
  gap: 0.4rem;
}

.notes-section label {
  color: var(--text-secondary);
  font-size: 0.85rem;
  font-weight: 800;
}

.notes-textarea {
  width: 100%;
  min-height: 130px;
  resize: vertical;
  box-sizing: border-box;
  background: var(--input-bg);
  border: 1px solid var(--border-color);
  color: var(--text-primary);
  border-radius: 10px;
  padding: 0.75rem;
  font-family: inherit;
}
</style>