<template>
  <div class="cover-uploader">
    <div class="cover-preview">
      <img v-if="coverUrl" :src="coverUrl" alt="Book cover" />
      <span v-else>📘</span>
    </div>

    <label class="upload-btn">
      Upload Cover
      <input type="file" accept="image/*" @change="handleFileChange" />
    </label>

    <button v-if="coverUrl" type="button" class="remove-btn" @click="removeCover">
      Remove Cover
    </button>
  </div>
</template>

<script setup>
defineProps({
  coverUrl: {
    type: String,
    default: '',
  },
})

const emit = defineEmits(['update:coverUrl'])

function handleFileChange(event) {
  const file = event.target.files?.[0]
  if (!file) return

  const reader = new FileReader()

  reader.addEventListener('load', () => {
    emit('update:coverUrl', reader.result)
  })

  reader.readAsDataURL(file)
  event.target.value = ''
}

function removeCover() {
  emit('update:coverUrl', '')
}
</script>

<style scoped>
.cover-uploader {
  display: grid;
  gap: 0.65rem;
  align-content: start;
}

.cover-preview {
  width: 140px;
  height: 200px;
  border-radius: 14px;
  display: grid;
  place-items: center;
  overflow: hidden;
  background: var(--input-bg);
  border: 1px solid var(--border-color);
  font-size: 3rem;
}

.cover-preview img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.upload-btn,
.remove-btn {
  width: 140px;
  border: none;
  border-radius: 10px;
  padding: 0.65rem 0.8rem;
  cursor: pointer;
  text-align: center;
  font-weight: 800;
  font-size: 0.85rem;
  box-sizing: border-box;
}

.upload-btn {
  background: var(--accent);
  color: white;
}

.upload-btn input {
  display: none;
}

.remove-btn {
  background: #dc2626;
  color: white;
}
</style>