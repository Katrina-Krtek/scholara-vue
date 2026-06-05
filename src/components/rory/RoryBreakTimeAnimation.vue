<script setup>
import { ref, computed, onMounted, onBeforeUnmount } from 'vue'

import frame1 from '@/assets/rory/animations/break-time/frame1.png'
import frame2 from '@/assets/rory/animations/break-time/frame2.png'
import frame3 from '@/assets/rory/animations/break-time/frame3.png'
import frame4 from '@/assets/rory/animations/break-time/frame4.png'
import frame5 from '@/assets/rory/animations/break-time/frame5.png'
import frame6 from '@/assets/rory/animations/break-time/frame6.png'
import frame7 from '@/assets/rory/animations/break-time/frame7.png'
import frame8 from '@/assets/rory/animations/break-time/frame8.png'

const frames = [frame1, frame2, frame3, frame4, frame5, frame6, frame7, frame8]

const currentFrame = ref(0)
let intervalId = null

const currentImage = computed(() => frames[currentFrame.value])

onMounted(() => {
  intervalId = window.setInterval(() => {
    currentFrame.value = (currentFrame.value + 1) % frames.length
  }, 120)
})

onBeforeUnmount(() => {
  if (intervalId) window.clearInterval(intervalId)
})
</script>

<template>
  <div class="rory-break-animation" aria-label="Rory says it is break time">
    <img :src="currentImage" alt="Rory excited for break time" />
    <p class="break-bubble">Break time!</p>
  </div>
</template>

<style scoped>
.rory-break-animation {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.75rem;
}

.rory-break-animation img {
  width: min(280px, 80vw);
  height: auto;
  object-fit: contain;
  user-select: none;
  pointer-events: none;
}

.break-bubble {
  margin: 0;
  padding: 0.5rem 0.9rem;
  border-radius: 999px;
  background: #0b1f3f;
  color: #f5c84c;
  font-weight: 700;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.18);
}
</style>