import { ref, onMounted } from 'vue'
import { getAssetPath, checkAssetExists } from '@/data/assetManifest'

export function useAssetFallback(assetKey: string, type: 'images' | 'audio' = 'images') {
  const assetSrc = ref<string>('')
  const isLoading = ref(true)
  const hasError = ref(false)

  const loadAsset = async () => {
    isLoading.value = true
    hasError.value = false

    const primaryPath = getAssetPath(assetKey, type)
    assetSrc.value = primaryPath

    if (type === 'images') {
      const exists = await checkAssetExists(primaryPath)
      if (!exists) {
        hasError.value = true
        assetSrc.value = '/images/fallback-thumb.png'
      }
    }

    isLoading.value = false
  }

  onMounted(() => {
    void loadAsset()
  })

  return {
    assetSrc,
    isLoading,
    hasError,
    reload: loadAsset,
  }
}

export function createImageWithFallback(src: string, fallbackSrc: string): Promise<string> {
  return new Promise((resolve) => {
    const img = new Image()
    img.onload = () => resolve(src)
    img.onerror = () => resolve(fallbackSrc)
    img.src = src
  })
}

export function handleImageError(event: Event, fallbackSrc: string = '/images/fallback-thumb.png') {
  const target = event.target as HTMLImageElement
  if (target.src !== fallbackSrc) {
    target.src = fallbackSrc
  }
}
