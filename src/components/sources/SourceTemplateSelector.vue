<template>
  <div class="source-template-selector">
    <label for="source-type">Source type</label>

    <select
      id="source-type"
      :value="modelValue"
      @change="$emit('update:modelValue', $event.target.value)"
    >
      <option
        v-for="option in options"
        :key="option.value"
        :value="option.value"
      >
        {{ option.label }}
      </option>
    </select>
  </div>
</template>

<script setup>
defineProps({
  modelValue: {
    type: String,
    required: true,
  },
  options: {
    type: Array,
    required: true,
  },
})

defineEmits(['update:modelValue'])
</script>

<style scoped>
.source-template-selector {
  display: grid;
  gap: 0.4rem;
}

.source-template-selector label {
  font-size: 0.8rem;
  font-weight: 700;
  color: #475569;
}

.source-template-selector select {
  width: 100%;
  border: 1px solid #cbd5e1;
  border-radius: 0.75rem;
  padding: 0.7rem 0.8rem;
  background: #fff;
  color: #0f172a;
  font: inherit;
}
</style>