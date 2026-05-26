import { ref, watchEffect } from 'vue';

const STORAGE_KEY = 'scholar-jots';

function loadFromStorage() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
  } catch {
    return [];
  }
}

const jots = ref(loadFromStorage());
const unfiledJots = ref([]);
const filedJots = ref([]);

watchEffect(() => {
  unfiledJots.value = jots.value.filter(j => !j.filed);
  filedJots.value = jots.value.filter(j => j.filed);
});

export function useJots() {
  function saveToStorage() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(jots.value));
  }

  function addJot(text) {
    jots.value.unshift({
      id: Date.now(),
      text: text.trim(),
      filed: false,
      createdAt: new Date().toISOString()
    });
    saveToStorage();
  }

  function deleteJot(id) {
    jots.value = jots.value.filter(j => j.id !== id);
    saveToStorage();
  }

  function fileJot(id) {
    const jot = jots.value.find(j => j.id === id);
    if (jot) { jot.filed = true; saveToStorage(); }
  }

  function unfileJot(id) {
    const jot = jots.value.find(j => j.id === id);
    if (jot) { jot.filed = false; saveToStorage(); }
  }

  function refreshJots() {
    jots.value = loadFromStorage();
  }

  return {
    jots,
    unfiledJots,
    filedJots,
    addJot,
    deleteJot,
    fileJot,
    unfileJot,
    refreshJots
  };
}