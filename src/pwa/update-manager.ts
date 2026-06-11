import { ref } from 'vue'

export const updateAvailable = ref(false)
export const isUpdating = ref(false)

function onUpdateFound(): void {
  updateAvailable.value = true
}

export async function reloadApp(): Promise<void> {
  isUpdating.value = true
  const registration = await navigator.serviceWorker.ready
  if (registration.waiting) {
    registration.waiting.postMessage({ type: 'SKIP_WAITING' })
  }
}

export function dismissUpdate(): void {
  updateAvailable.value = false
}

export function initUpdateManager(): void {
  if (!('serviceWorker' in navigator)) {
    return
  }

  navigator.serviceWorker.addEventListener('controllerchange', () => {
    window.location.reload()
  })

  navigator.serviceWorker.ready.then((registration) => {
    registration.addEventListener('updatefound', () => {
      const newWorker = registration.installing
      if (!newWorker) {
        return
      }

      newWorker.addEventListener('statechange', () => {
        if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
          onUpdateFound()
        }
      })
    })
  })
}

export function checkForUpdates(): Promise<ServiceWorkerRegistration | undefined> {
  if (!('serviceWorker' in navigator)) {
    return Promise.resolve(undefined)
  }
  return navigator.serviceWorker.ready.then((registration) => {
    registration.update()
    return registration
  })
}
