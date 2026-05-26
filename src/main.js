import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import { useTheme } from './composables/useTheme'

// Apply saved theme before mount
const { } = useTheme();

const app = createApp(App)
app.use(router)
app.mount('#app')