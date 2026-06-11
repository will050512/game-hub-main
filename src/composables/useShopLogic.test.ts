import { beforeEach, describe, expect, it } from 'vitest'
import { createPinia, setActivePinia } from 'pinia'
import { useDatabase } from '@/composables/useDatabase'
import { useCurrencyStore } from '@/stores/currencyStore'
import { usePlayerStore } from '@/stores/playerStore'
import { permanentUpgrades } from '@/data/upgrades'
import { shopCollectionItems } from '@/data/shopCatalog'
import { useShopLogic } from './useShopLogic'

describe('useShopLogic', () => {
  beforeEach(async () => {
    localStorage.clear()
    setActivePinia(createPinia())
    await useDatabase().initDatabase()
  })

  it('purchases an upgrade through the shop flow and refreshes stores/history', async () => {
    const db = useDatabase()
    const currency = useCurrencyStore()
    const player = usePlayerStore()
    await db.addCoins(500, 'shop-test', 'debug')
    await currency.loadBalance()
    await player.loadProfile()

    const shop = useShopLogic()
    const upgrade = permanentUpgrades[0]!

    shop.openConfirmModal(upgrade)
    await shop.confirmPurchase()

    expect(currency.balance).toBe(400)
    expect(player.getUpgradeLevel(upgrade.id)).toBe(1)
    expect(shop.recentPurchases.value[0]?.itemType).toBe('upgrade')
    expect(shop.recentPurchases.value[0]?.upgradeId).toBe(upgrade.id)
  })

  it('purchases and equips a collection item through the shop flow', async () => {
    const db = useDatabase()
    const currency = useCurrencyStore()
    const player = usePlayerStore()
    await db.addCoins(500, 'shop-test', 'debug')
    await currency.loadBalance()
    await player.loadProfile()

    const shop = useShopLogic()
    const item = shopCollectionItems.find((entry) => entry.cost <= 500)!

    await shop.purchaseCollectionItem(item)
    await shop.equipCollectionItem(item)

    expect(currency.balance).toBe(500 - item.cost)
    if (item.type === 'badge') {
      expect(player.collection.badges).toContain(item.id)
      expect(player.collection.equippedBadge).toBe(item.id)
    } else {
      expect(player.collection.avatarFrames).toContain(item.id)
      expect(player.collection.equippedAvatarFrame).toBe(item.id)
    }
    expect(shop.recentPurchases.value[0]?.itemId).toBe(item.id)
  })
})
