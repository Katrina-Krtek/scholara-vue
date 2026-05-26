import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import { useTheme } from './composables/useTheme'

useTheme()

const app = createApp(App)

app.use(router)
app.mount('#app')