<template>
  <section class="template-card">
    <header class="template-header">
      <div>
        <p class="eyebrow">Source template</p>
        <h2>{{ template.label }} Notes</h2>
      </div>
    </header>

    <div class="template-sections">
      <article
        v-for="section in template.sections"
        :key="section.id"
        class="template-section"
      >
        <label :for="section.id">{{ section.title }}</label>

        <textarea
          :id="section.id"
          :value="modelValue[section.id] || ''"
          :placeholder="section.placeholder"
          @input="updateSection(section.id, $event.target.value)"
        />
      </article>
    </div>
  </section>
</template>

<script setup>
const props = defineProps({
  template: {
    type: Object,
    required: true,
  },
  modelValue: {
    type: Object,
    required: true,
  },
})

const emit = defineEmits(['update:modelValue'])

function updateSection(sectionId, value) {
  emit('update:modelValue', {
    ...props.modelValue,
    [sectionId]: value,
  })
}
</script>

<style scoped>
.template-card {
  background: #fff;
  border: 1px solid #e2e8f0;
  border-radius: 1.25rem;
  padding: 1.25rem;
  box-shadow: 0 12px 30px rgba(15, 23, 42, 0.06);
}

.template-header {
  display: flex;
  justify-content: space-between;
  gap: 1rem;
  margin-bottom: 1rem;
}

.eyebrow {
  margin: 0;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  font-size: 0.72rem;
  font-weight: 800;
  color: #64748b;
}

.template-header h2 {
  margin: 0.15rem 0 0;
  color: #0f172a;
}

.template-sections {
  display: grid;
  gap: 1rem;
}

.template-section {
  display: grid;
  gap: 0.45rem;
}

.template-section label {
  font-weight: 800;
  color: #334155;
}

.template-section textarea {
  width: 100%;
  min-height: 140px;
  resize: vertical;
  border: 1px solid #cbd5e1;
  border-radius: 0.9rem;
  padding: 0.85rem;
  font: inherit;
  line-height: 1.5;
  color: #0f172a;
  background: #f8fafc;
}

.template-section textarea:focus {
  outline: 2px solid #d4af37;
  border-color: #d4af37;
  background: #fff;
}
</style>