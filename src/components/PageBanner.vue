<template>
  <div class="banner-wrapper">
    <!-- Banner Image Area -->
    <div
      class="banner"
      :class="{ 'has-image': imageUrl, 'no-image': !imageUrl }"
      @mouseenter="showControls = true"
      @mouseleave="showControls = false"
    >
      <div
        v-if="imageUrl"
        class="banner-img"
        :style="`background-image: url(${imageUrl}); background-position: center ${position}%`"
        @mousedown="startDrag"
      ></div>

      <div v-if="!imageUrl" class="banner-empty">
        <button class="add-banner-btn" @click="triggerUpload">
          🖼 Add Banner
        </button>
      </div>

      <div v-if="imageUrl && showControls" class="banner-controls">
        <button class="banner-ctrl-btn" @click="triggerUpload">Change</button>
        <button class="banner-ctrl-btn" @mousedown="startDrag">⠿ Reposition</button>
        <button class="banner-ctrl-btn danger" @click="removeBanner">Remove</button>
      </div>
    </div>

    <!-- Page Title Row -->
    <div class="title-row">
      <button class="icon-btn" @click="showEmojiPicker = !showEmojiPicker">
        {{ currentIcon }}
      </button>

      <div v-if="showEmojiPicker" class="emoji-picker">
        <div class="emoji-grid">
          <button
            v-for="emoji in emojiOptions"
            :key="emoji"
            class="emoji-option"
            @click="selectEmoji(emoji)"
          >
            {{ emoji }}
          </button>
        </div>
        <div class="emoji-custom-row">
          <input
            v-model="customEmoji"
            class="emoji-input"
            maxlength="2"
            placeholder="Or type..."
            @keydown.enter="selectEmoji(customEmoji)"
          />
          <button class="emoji-confirm-btn" @click="selectEmoji(customEmoji)">Set</button>
        </div>
      </div>

      <slot name="title" />
    </div>

    <input
      ref="fileInput"
      type="file"
      accept="image/*"
      style="display:none"
      @change="onFileSelected"
    />
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue';

const props = defineProps({
  bannerKey: { type: String, required: true },
  iconKey: { type: String, required: true },
  defaultIcon: { type: String, default: '📄' }
});

const emit = defineEmits(['icon-changed']);

const imageUrl = ref(null);
const position = ref(50);
const showControls = ref(false);
const showEmojiPicker = ref(false);
const currentIcon = ref(props.defaultIcon);
const customEmoji = ref('');
const fileInput = ref(null);

const emojiOptions = [
  '📚','📖','🎓','📝','🔬','🧪','🎨','🏛','💻','🔭',
  '📐','🧮','🌍','🎯','🏆','⚡','🔥','💡','🌱','🎵',
  '📊','📈','🗂','📋','🗓','💼','🏠','⚙️','🔑','✨'
];

// Load saved banner and icon
onMounted(() => {
  const saved = localStorage.getItem(`banner-${props.bannerKey}`);
  if (saved) {
    const parsed = JSON.parse(saved);
    imageUrl.value = parsed.imageUrl;
    position.value = parsed.position ?? 50;
  }
  const savedIcon = localStorage.getItem(`icon-${props.iconKey}`);
  if (savedIcon) currentIcon.value = savedIcon;
});

function saveBanner() {
  localStorage.setItem(`banner-${props.bannerKey}`, JSON.stringify({
    imageUrl: imageUrl.value,
    position: position.value
  }));
}

function triggerUpload() {
  fileInput.value?.click();
}

function onFileSelected(e) {
  const file = e.target.files[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = (ev) => {
    imageUrl.value = ev.target.result;
    position.value = 50;
    saveBanner();
  };
  reader.readAsDataURL(file);
}

function removeBanner() {
  imageUrl.value = null;
  localStorage.removeItem(`banner-${props.bannerKey}`);
}

// Drag to reposition
let isDragging = false;
let startY = 0;
let startPos = 0;

function startDrag(e) {
  isDragging = true;
  startY = e.clientY;
  startPos = position.value;
  document.addEventListener('mousemove', onDrag);
  document.addEventListener('mouseup', stopDrag);
}

function onDrag(e) {
  if (!isDragging) return;
  const delta = ((e.clientY - startY) / 200) * 100;
  position.value = Math.min(100, Math.max(0, startPos + delta));
}

function stopDrag() {
  isDragging = false;
  saveBanner();
  document.removeEventListener('mousemove', onDrag);
  document.removeEventListener('mouseup', stopDrag);
}

onUnmounted(() => {
  document.removeEventListener('mousemove', onDrag);
  document.removeEventListener('mouseup', stopDrag);
});

// Emoji
function selectEmoji(emoji) {
  if (!emoji.trim()) return;
  currentIcon.value = emoji;
  localStorage.setItem(`icon-${props.iconKey}`, emoji);
  emit('icon-changed', emoji);
  showEmojiPicker.value = false;
  customEmoji.value = '';
}
</script>

<style scoped>
.banner-wrapper {
  display: flex;
  flex-direction: column;
  width: 100%;
}

.banner {
  width: 100%;
  position: relative;
}

.banner.has-image {
  height: 180px;
}

.banner.no-image {
  height: 60px;
  display: flex;
  align-items: center;
  padding: 0 2rem;
}

.banner-img {
  width: 100%;
  height: 100%;
  background-size: cover;
  background-repeat: no-repeat;
  cursor: grab;
}

.banner-img:active { cursor: grabbing; }

.banner-empty {
  display: flex;
  align-items: center;
}

.add-banner-btn {
  background: none;
  border: none;
  color: var(--text-muted);
  font-size: 0.82rem;
  cursor: pointer;
  padding: 0.3rem 0.6rem;
  border-radius: 6px;
  opacity: 0;
  transition: opacity 0.15s;
}

.banner:hover .add-banner-btn {
  opacity: 1;
}

.banner-controls {
  position: absolute;
  bottom: 0.75rem;
  right: 1rem;
  display: flex;
  gap: 0.4rem;
}

.banner-ctrl-btn {
  background: rgba(0, 0, 0, 0.55);
  border: none;
  color: white;
  border-radius: 5px;
  padding: 0.3rem 0.65rem;
  font-size: 0.75rem;
  cursor: pointer;
  backdrop-filter: blur(4px);
}

.banner-ctrl-btn:hover { background: rgba(0,0,0,0.75); }
.banner-ctrl-btn.danger:hover { background: rgba(239,68,68,0.75); }

/* Title row */
.title-row {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 1rem 2rem 0;
  position: relative;
}

.icon-btn {
  font-size: 2.2rem;
  background: none;
  border: none;
  cursor: pointer;
  padding: 0.2rem;
  border-radius: 8px;
  line-height: 1;
  margin-top: -1.5rem;
  filter: drop-shadow(0 2px 4px rgba(0,0,0,0.15));
}

.icon-btn:hover { background: var(--btn-hover); }

.emoji-picker {
  position: absolute;
  top: 3rem;
  left: 2rem;
  background: var(--bg-card);
  border: 1px solid var(--border-color);
  border-radius: 12px;
  padding: 0.75rem;
  box-shadow: var(--shadow);
  z-index: 100;
  width: 280px;
}

.emoji-grid {
  display: grid;
  grid-template-columns: repeat(10, 1fr);
  gap: 0.2rem;
  margin-bottom: 0.5rem;
}

.emoji-option {
  background: none;
  border: none;
  font-size: 1.2rem;
  cursor: pointer;
  border-radius: 4px;
  padding: 0.2rem;
  text-align: center;
}

.emoji-option:hover { background: var(--btn-hover); }

.emoji-custom-row {
  display: flex;
  gap: 0.5rem;
  margin-top: 0.5rem;
}

.emoji-input {
  flex: 1;
  background: var(--input-bg);
  border: 1px solid var(--border-color);
  border-radius: 6px;
  padding: 0.35rem 0.5rem;
  color: var(--text-primary);
  font-size: 0.85rem;
  outline: none;
}

.emoji-confirm-btn {
  background: var(--accent-soft);
  border: 1px solid var(--accent);
  color: var(--accent-text);
  border-radius: 6px;
  padding: 0.35rem 0.75rem;
  font-size: 0.82rem;
  cursor: pointer;
  font-weight: 600;
}
</style>