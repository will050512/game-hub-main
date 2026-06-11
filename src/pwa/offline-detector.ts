import { ref } from 'vue'

export const isOnline = ref(navigator.onLine)
export const reconnecting = ref(false)
export const reconnectAttempts = ref(0)

const MAX_RECONNECT_ATTEMPTS = 3
const RECONNECT_DELAY = 2000

function onOnline(): void {
  isOnline.value = true
  reconnecting.value = false
  reconnectAttempts.value = 0

  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.ready.then((registration) => {
      registration.update()
    }).catch(() => {})
  }
}

async function onOffline(): Promise<void> {
  isOnline.value = false
  await attemptReconnect()
}

async function attemptReconnect(): Promise<void> {
  reconnecting.value = true

  while (reconnectAttempts.value < MAX_RECONNECT_ATTEMPTS && !navigator.onLine) {
    reconnectAttempts.value += 1
    await new Promise((resolve) => setTimeout(resolve, RECONNECT_DELAY * reconnectAttempts.value))

    try {
      await fetch('/', { method: 'HEAD', cache: 'no-store', mode: 'no-cors' })
      onOnline()
      return
    }
    catch {
      /* noop */
    }
  }

  reconnecting.value = false
}

export function initOfflineDetector(): void {
  window.addEventListener('online', onOnline)
  window.addEventListener('offline', onOffline)

  if (!navigator.onLine) {
    isOnline.value = false
  }
}
