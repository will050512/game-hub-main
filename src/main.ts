import './assets/main.css'
import './styles/kawaii-tokens.css'

import { createApp } from 'vue'
import { createPinia } from 'pinia'

import App from './App.vue'
import router from './router'

const app = createApp(App)
app.use(createPinia())
app.use(router)
app.mount('#app')

import { useDatabase } from './composables/useDatabase'
const { initDatabase } = useDatabase()
initDatabase().catch(() => {})

import { initUpdateManager } from './pwa/update-manager'
import { initOfflineDetector } from './pwa/offline-detector'
import { dismissUpdate } from './pwa/update-manager'

initUpdateManager()
initOfflineDetector()

window.addEventListener('pwa-dismiss-update', () => {
  dismissUpdate()
})
