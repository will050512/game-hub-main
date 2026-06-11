import { ref, computed } from 'vue'
import type { PermanentUpgrade, ShopCollectionItem, ShopPurchaseRecord } from '@/types'
import { permanentUpgrades } from '@/data/upgrades'
import { shopCollectionItems } from '@/data/shopCatalog'
import { useCurrencyStore } from '@/stores/currencyStore'
import { usePlayerStore } from '@/stores/playerStore'
import { useDatabase } from '@/composables/useDatabase'
import type { KawaiiIconId } from '@/data/iconManifest'

export type ShelfKey = 'upgrades' | 'collection'
export type CategoryKey = 'all' | 'offense' | 'defense' | 'utility' | 'economy'
export type CollectionTypeKey = 'all' | 'badge' | 'avatarFrame'

export interface CategoryItem {
  key: string
  label: string
  icon: KawaiiIconId
}

export interface ShelfItem {
  key: ShelfKey
  label: string
  icon: KawaiiIconId
}

export interface CollectionFilter {
  key: CollectionTypeKey
  label: string
  icon: KawaiiIconId
}

export function useShopLogic() {
  const currencyStore = useCurrencyStore()
  const playerStore = usePlayerStore()
  const db = useDatabase()

  const activeShelf = ref<ShelfKey>('upgrades')
  const activeCategory = ref<CategoryKey>('all')
  const activeCollectionType = ref<CollectionTypeKey>('all')
  const showConfirmModal = ref(false)
  const isPurchasing = ref(false)
  const processingCollectionId = ref<string | null>(null)
  const recentPurchases = ref<ShopPurchaseRecord[]>([])
  const selectedUpgrade = ref<PermanentUpgrade | null>(null)

  const shelves: ShelfItem[] = [
    { key: 'upgrades', label: '強化', icon: 'upgrade' },
    { key: 'collection', label: '收藏', icon: 'crown' },
  ]

  const categories: CategoryItem[] = [
    { key: 'all', label: '全部', icon: 'star' },
    { key: 'offense', label: '攻擊', icon: 'action' },
    { key: 'defense', label: '防禦', icon: 'shield' },
    { key: 'utility', label: '輔助', icon: 'sparkle' },
    { key: 'economy', label: '經濟', icon: 'coin' },
  ]

  const collectionFilters: CollectionFilter[] = [
    { key: 'all', label: '全部收藏品', icon: 'star' },
    { key: 'badge', label: '徽章', icon: 'sparkle' },
    { key: 'avatarFrame', label: '頭像框', icon: 'crown' },
  ]

  const currentCategories = computed<CategoryItem[]>(() => {
    return activeShelf.value === 'upgrades' ? categories : collectionFilters
  })

  const filteredUpgrades = computed(() => {
    if (activeCategory.value === 'all') return permanentUpgrades
    return permanentUpgrades.filter((u) => u.category === activeCategory.value)
  })

  const sortedUpgrades = computed(() => {
    return [...filteredUpgrades.value].sort((a, b) => {
      const levelA = playerStore.getUpgradeLevel(a.id)
      const levelB = playerStore.getUpgradeLevel(b.id)
      const maxedA = levelA >= a.maxLevel
      const maxedB = levelB >= b.maxLevel
      const costA = a.costs[levelA] ?? Infinity
      const costB = b.costs[levelB] ?? Infinity
      const canAffordA = !maxedA && currencyStore.balance >= costA
      const canAffordB = !maxedB && currencyStore.balance >= costB
      if (canAffordA && !canAffordB) return -1
      if (!canAffordA && canAffordB) return 1
      if (!maxedA && maxedB) return -1
      if (maxedA && !maxedB) return 1
      return costA - costB
    })
  })

  const filteredCollectionItems = computed(() => {
    if (activeCollectionType.value === 'all') return shopCollectionItems
    return shopCollectionItems.filter((item) => item.type === activeCollectionType.value)
  })

  const sortedCollectionItems = computed(() => {
    return [...filteredCollectionItems.value].sort((a, b) => {
      const ownedA = isCollectionOwned(a)
      const ownedB = isCollectionOwned(b)
      const equippedA = isCollectionEquipped(a)
      const equippedB = isCollectionEquipped(b)
      const canAffordA = !ownedA && currencyStore.balance >= a.cost
      const canAffordB = !ownedB && currencyStore.balance >= b.cost
      if (equippedA && !equippedB) return -1
      if (!equippedA && equippedB) return 1
      if (canAffordA && !canAffordB) return -1
      if (!canAffordA && canAffordB) return 1
      if (!ownedA && ownedB) return -1
      if (ownedA && !ownedB) return 1
      return a.cost - b.cost
    })
  })

  const upgradeNameById = computed(() => {
    return permanentUpgrades.reduce<Record<string, string>>((acc, upgrade) => {
      acc[upgrade.id] = upgrade.name
      return acc
    }, {})
  })

  const collectionNameById = computed(() => {
    return shopCollectionItems.reduce<Record<string, string>>((acc, item) => {
      acc[item.id] = item.name
      return acc
    }, {})
  })

  const affordableUpgradeCount = computed(() => sortedUpgrades.value.filter((u) => canAffordUpgrade(u)).length)
  const affordableCollectionCount = computed(() =>
    sortedCollectionItems.value.filter((item) => !isCollectionOwned(item) && currencyStore.balance >= item.cost).length,
  )
  const totalUpgradeCount = computed(() => sortedUpgrades.value.length)
  const totalCollectionCount = computed(() => sortedCollectionItems.value.length)

  const equippedBadgeName = computed(() => {
    const id = playerStore.collection.equippedBadge
    return id ? (collectionNameById.value[id] ?? id) : '未裝備'
  })

  const equippedFrameName = computed(() => {
    const id = playerStore.collection.equippedAvatarFrame
    return id ? (collectionNameById.value[id] ?? id) : '未裝備'
  })

  const selectedCurrentLevel = computed(() => {
    if (!selectedUpgrade.value) return 0
    return playerStore.getUpgradeLevel(selectedUpgrade.value.id)
  })

  const selectedCost = computed(() => {
    if (!selectedUpgrade.value) return 0
    return selectedUpgrade.value.costs[selectedCurrentLevel.value] ?? 0
  })

  const selectedCanAfford = computed(() => {
    if (!selectedUpgrade.value) return false
    return currencyStore.balance >= selectedCost.value
  })

  const selectedEffectPreview = computed(() => {
    if (!selectedUpgrade.value) return ''
    const upgrade = selectedUpgrade.value
    const effect = upgrade.effects[0]
    if (!effect) return ''
    const currentValue = effect.value * selectedCurrentLevel.value
    const nextValue = effect.value * (selectedCurrentLevel.value + 1)
    if (effect.isMultiplier) {
      const cp = Math.round(currentValue * 100)
      const np = Math.round(nextValue * 100)
      return effect.stat + ': +' + cp + '% → +' + np + '%'
    }
    const cv = currentValue
    const nv = nextValue
    return effect.stat + ': +' + cv + ' → +' + nv
  })

  function canAffordUpgrade(upgrade: PermanentUpgrade): boolean {
    const level = playerStore.getUpgradeLevel(upgrade.id)
    if (level >= upgrade.maxLevel) return false
    return currencyStore.balance >= (upgrade.costs[level] ?? Infinity)
  }

  function isUpgradeMaxed(upgrade: PermanentUpgrade): boolean {
    return playerStore.getUpgradeLevel(upgrade.id) >= upgrade.maxLevel
  }

  function isCollectionOwned(item: ShopCollectionItem): boolean {
    return item.type === 'badge'
      ? playerStore.collection.badges.includes(item.id)
      : playerStore.collection.avatarFrames.includes(item.id)
  }

  function isCollectionEquipped(item: ShopCollectionItem): boolean {
    return item.type === 'badge'
      ? playerStore.collection.equippedBadge === item.id
      : playerStore.collection.equippedAvatarFrame === item.id
  }

  function purchaseLabel(purchase: ShopPurchaseRecord): string {
    if (purchase.itemType === 'upgrade') {
      const id = purchase.upgradeId ?? purchase.itemId
      return upgradeNameById.value[id] ?? id
    }
    return collectionNameById.value[purchase.itemId] ?? purchase.itemId
  }

  function purchaseMeta(purchase: ShopPurchaseRecord): string {
    const amount = purchase.cost.toLocaleString('zh-TW')
    if (purchase.itemType === 'upgrade') return 'Lv.' + purchase.level + ' ' + amount
    return (purchase.itemType === 'badge' ? '徽章' : '頭像框') + ' ' + amount
  }

  function openConfirmModal(upgrade: PermanentUpgrade) {
    if (isUpgradeMaxed(upgrade)) return
    selectedUpgrade.value = upgrade
    showConfirmModal.value = true
  }

  function closeConfirmModal() {
    if (!isPurchasing.value) {
      showConfirmModal.value = false
      selectedUpgrade.value = null
    }
  }

  async function confirmPurchase() {
    if (!selectedUpgrade.value || isPurchasing.value) return
    const upgrade = selectedUpgrade.value
    const cost = selectedCost.value
    const newLevel = selectedCurrentLevel.value + 1
    isPurchasing.value = true
    try {
      const success = await currencyStore.purchase(upgrade.id, cost, newLevel)
      if (success) {
        await playerStore.syncUpgradesFromDb()
        await refreshPurchaseHistory()
      }
    } finally {
      isPurchasing.value = false
      showConfirmModal.value = false
      selectedUpgrade.value = null
    }
  }

  async function purchaseCollectionItem(item: ShopCollectionItem) {
    if (isCollectionOwned(item) || currencyStore.balance < item.cost || processingCollectionId.value) return
    processingCollectionId.value = item.id
    try {
      const success = await db.purchaseCollectionItem(item.type, item.id, item.cost)
      if (success) {
        await currencyStore.loadBalance()
        await playerStore.loadProfile()
        await refreshPurchaseHistory()
      }
    } finally {
      processingCollectionId.value = null
    }
  }

  async function equipCollectionItem(item: ShopCollectionItem) {
    if (!isCollectionOwned(item) || isCollectionEquipped(item) || processingCollectionId.value) return
    processingCollectionId.value = item.id
    try {
      await playerStore.equipItem(item.type, item.id)
    } finally {
      processingCollectionId.value = null
    }
  }

  async function refreshPurchaseHistory() {
    recentPurchases.value = await db.getShopPurchases(8)
  }

  return {
    activeShelf,
    activeCategory,
    activeCollectionType,
    showConfirmModal,
    isPurchasing,
    processingCollectionId,
    recentPurchases,
    selectedUpgrade,
    shelves,
    categories,
    collectionFilters,
    currentCategories,
    sortedUpgrades,
    sortedCollectionItems,
    affordableUpgradeCount,
    affordableCollectionCount,
    totalUpgradeCount,
    totalCollectionCount,
    equippedBadgeName,
    equippedFrameName,
    selectedCurrentLevel,
    selectedCost,
    selectedCanAfford,
    selectedEffectPreview,
    canAffordUpgrade,
    isUpgradeMaxed,
    isCollectionOwned,
    isCollectionEquipped,
    purchaseLabel,
    purchaseMeta,
    openConfirmModal,
    closeConfirmModal,
    confirmPurchase,
    purchaseCollectionItem,
    equipCollectionItem,
    refreshPurchaseHistory,
  }
}
