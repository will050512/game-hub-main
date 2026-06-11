<script setup lang="ts">
import { computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useCurrencyStore } from '@/stores/currencyStore'
import { usePlayerStore } from '@/stores/playerStore'
import { useDatabase } from '@/composables/useDatabase'
import { useShopLogic, type ShelfKey } from '@/composables/useShopLogic'
import ShopHeader from '@/components/shop/ShopHeader.vue'
import ShopPurchaseModal from '@/components/shop/ShopPurchaseModal.vue'
import ShopEmptyState from '@/components/shop/ShopEmptyState.vue'
import ShopSidePanel from '@/components/shop/ShopSidePanel.vue'
import ShopItemCard from '@/components/ShopItemCard.vue'
import ShopCollectibleCard from '@/components/ShopCollectibleCard.vue'

const router = useRouter()
const cs = useCurrencyStore()
const ps = usePlayerStore()

const {
  activeShelf, activeCategory, activeCollectionType, showConfirmModal, isPurchasing, processingCollectionId,
  selectedUpgrade, selectedCurrentLevel, selectedCost,
  selectedCanAfford, selectedEffectPreview,
  shelves, currentCategories, sortedUpgrades, sortedCollectionItems, recentPurchases,
  affordableUpgradeCount, affordableCollectionCount,
  totalUpgradeCount, totalCollectionCount,
  equippedBadgeName, equippedFrameName,
  canAffordUpgrade, isCollectionOwned, isCollectionEquipped,
  purchaseLabel, purchaseMeta,
  openConfirmModal, closeConfirmModal, confirmPurchase,
  purchaseCollectionItem, equipCollectionItem, refreshPurchaseHistory,
} = useShopLogic()

const db = useDatabase()
const goBack = () => router.back()
const activeHeaderCategory = computed(() => activeShelf.value === 'upgrades' ? activeCategory.value : activeCollectionType.value)

function setActiveShelf(shelf: ShelfKey) {
  activeShelf.value = shelf
  if (shelf === 'upgrades') {
    activeCollectionType.value = 'all'
  } else {
    activeCategory.value = 'all'
  }
}

function setActiveHeaderCategory(category: string) {
  if (activeShelf.value === 'upgrades') {
    activeCategory.value = category as typeof activeCategory.value
  } else {
    activeCollectionType.value = category as typeof activeCollectionType.value
  }
}

onMounted(async () => {
  await db.initDatabase()
  if (!cs.isLoaded) await cs.loadBalance()
  if (!ps.isLoaded) await ps.loadProfile()
  await refreshPurchaseHistory()
})
</script>

<template>
  <div class="sv">
    <ShopHeader
      :balance="cs.balance" :shelves="shelves" :categories="currentCategories"
      :active-shelf="activeShelf"
      :active-category="activeHeaderCategory"
      @back="goBack"
      @update:active-shelf="(s) => setActiveShelf(s as ShelfKey)"
      @update:active-category="setActiveHeaderCategory"
    />

    <div class="sv-body">
      <div v-if="activeShelf === 'upgrades'" class="sv-grid">
        <ShopItemCard v-for="u in sortedUpgrades" :key="u.id" :upgrade="u"
          :current-level="ps.getUpgradeLevel(u.id)" :can-afford="canAffordUpgrade(u)"
          @purchase="openConfirmModal(u)" />
        <div v-if="sortedUpgrades.length === 0" class="sv-empty"><ShopEmptyState /></div>
      </div>

      <div v-else class="sv-grid sv-coll-grid">
        <ShopCollectibleCard v-for="i in sortedCollectionItems" :key="i.id" :item="i"
          :owned="isCollectionOwned(i)" :equipped="isCollectionEquipped(i)"
          :can-afford="cs.balance >= i.cost && processingCollectionId !== i.id"
          @purchase="purchaseCollectionItem(i)" @equip="equipCollectionItem(i)" />
        <div v-if="sortedCollectionItems.length === 0" class="sv-empty"><ShopEmptyState /></div>
      </div>

      <ShopSidePanel
        :balance="cs.balance" :total-upgrade-level="ps.totalUpgradeLevel"
        :affordable-upgrade-count="affordableUpgradeCount" :total-upgrade-count="totalUpgradeCount"
        :affordable-collection-count="affordableCollectionCount" :total-collection-count="totalCollectionCount"
        :active-shelf="activeShelf"
        :equipped-badge="ps.collection.equippedBadge" :equipped-avatar-frame="ps.collection.equippedAvatarFrame"
        :equipped-badge-name="equippedBadgeName" :equipped-frame-name="equippedFrameName"
        :recent-purchases="recentPurchases" :purchase-label-fn="purchaseLabel" :purchase-meta-fn="purchaseMeta"
      />
    </div>

    <ShopPurchaseModal
      :open="showConfirmModal" :upgrade="selectedUpgrade"
      :current-level="selectedCurrentLevel" :cost="selectedCost"
      :can-afford="selectedCanAfford" :effect-preview="selectedEffectPreview"
      :is-purchasing="isPurchasing" @confirm="confirmPurchase" @cancel="closeConfirmModal"
    />
  </div>
</template>

<style scoped>
.sv { position: relative; min-height: 100%; overflow-y: auto;
  background: linear-gradient(90deg,rgba(255,255,255,.62) 1px,transparent 1px),linear-gradient(180deg,rgba(255,255,255,.62) 1px,transparent 1px),linear-gradient(180deg,#fff9f0 0%,#f4fbff 52%,#fff6fb 100%);
  background-size: 28px 28px,28px 28px,auto; }
.sv-body { display:grid; grid-template-columns:minmax(0,1fr) 280px; gap:20px; padding:10px 0 28px;
  width:min(1180px,calc(100% - 32px)); margin:0 auto; }
.sv-grid { display:grid; grid-template-columns:repeat(auto-fill,minmax(248px,1fr)); gap:16px; align-content:start; margin:0; }
.sv-coll-grid { grid-template-columns:repeat(auto-fill,minmax(230px,1fr)); }
.sv-empty { grid-column:1 / -1; }
@media (max-width:768px) {
  .sv-body { grid-template-columns:1fr; width:min(100% - 20px,1180px); }
  .shop-side-panel { position:static; order:-1; }
  .sv-grid,.sv-coll-grid { grid-template-columns:1fr; }
}
@media (min-width:1200px) { .sv-grid { grid-template-columns:repeat(4,1fr); gap:1.75rem; } }
</style>
