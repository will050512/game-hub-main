<script setup lang="ts">
interface Props {
  balance: number
  totalUpgradeLevel: number
  affordableUpgradeCount: number
  totalUpgradeCount: number
  affordableCollectionCount: number
  totalCollectionCount: number
  activeShelf: string
  equippedBadge: string | null
  equippedAvatarFrame: string | null
  equippedBadgeName: string
  equippedFrameName: string
  recentPurchases: ShopPurchaseRecord[]
  purchaseLabelFn: (p: ShopPurchaseRecord) => string
  purchaseMetaFn: (p: ShopPurchaseRecord) => string
}

const props = defineProps<Props>()

interface ShopPurchaseRecord {
  id?: number
  itemType: 'upgrade' | 'badge' | 'avatarFrame'
  itemId: string
  upgradeId?: string
  level: number
  cost: number
  purchasedAt: string
}

function purchaseLabel(purchase: ShopPurchaseRecord): string {
  if (purchase.itemType === 'upgrade') {
    const id = purchase.upgradeId ?? purchase.itemId
    return props.purchaseLabelFn(purchase)
  }
  return props.purchaseLabelFn(purchase)
}

function purchaseMeta(purchase: ShopPurchaseRecord): string {
  return props.purchaseMetaFn(purchase)
}

function formatNumber(n: number): string {
  return n.toLocaleString('zh-TW')
}
</script>

<template>
  <aside class="shop-side-panel">
    <div class="side-panel-section">
      <div class="side-panel-label">硬幣餘額</div>
      <div class="side-panel-value accent">
        <KawaiiIcon name="coin" size="sm" />
        {{ formatNumber(balance) }}
      </div>
    </div>

    <div class="side-panel-divider"></div>

    <div class="side-panel-section">
      <div class="side-panel-label">總升級等級</div>
      <div class="side-panel-value">
        <KawaiiIcon name="star" size="sm" />
        {{ totalUpgradeLevel }}
      </div>
    </div>

    <div class="side-panel-divider"></div>

    <div class="side-panel-section">
      <div class="side-panel-label">可購買項目</div>
      <div class="side-panel-value">
        <template v-if="activeShelf === 'upgrades'">
          {{ affordableUpgradeCount }} / {{ totalUpgradeCount }}
        </template>
        <template v-else>
          {{ affordableCollectionCount }} / {{ totalCollectionCount }}
        </template>
      </div>
    </div>

    <div class="side-panel-divider"></div>

    <div class="side-panel-section">
      <div class="side-panel-label">裝備摘要</div>
      <div class="equip-summary">
        <span>徽章: {{ equippedBadgeName }}</span>
        <span>相框: {{ equippedFrameName }}</span>
      </div>
    </div>

    <div class="side-panel-divider"></div>

    <div class="side-panel-section">
      <div class="side-panel-label">最近購買</div>
      <div v-if="recentPurchases.length > 0" class="purchase-list">
        <div
          v-for="purchase in recentPurchases"
          :key="purchase.id ?? `${purchase.upgradeId}-${purchase.purchasedAt}`"
          class="purchase-row"
        >
          <span class="purchase-name">{{ purchaseLabel(purchase) }}</span>
          <span class="purchase-meta">{{ purchaseMeta(purchase) }}</span>
        </div>
      </div>
      <div v-else class="purchase-empty">尚未有購買紀錄</div>
    </div>
  </aside>
</template>

<style scoped>
.shop-side-panel {
  position: sticky;
  top: 88px;
  align-self: start;
  padding: 18px;
  border: 2px solid rgba(68, 52, 61, 0.18);
  border-radius: var(--radius-base);
  background: rgba(255, 255, 255, 0.9);
  box-shadow: 0 14px 34px rgba(52, 39, 47, 0.12);
}

.side-panel-section {
  display: grid;
  gap: 8px;
}

.side-panel-label {
  color: #705d66;
  font-size: 0.78rem;
  font-weight: 800;
}

.side-panel-value {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  color: #32252c;
  font-size: 1.08rem;
  font-weight: 900;
}

.side-panel-value.accent {
  color: #8c5a13;
}

.side-panel-divider {
  height: 1px;
  margin: 14px 0;
  background: rgba(68, 52, 61, 0.12);
}

.purchase-list {
  display: grid;
  gap: 8px;
}

.purchase-row {
  display: grid;
  gap: 2px;
  padding: 9px 10px;
  border: 1px solid rgba(68, 52, 61, 0.12);
  border-radius: var(--radius-base);
  background: rgba(248, 250, 252, 0.75);
}

.purchase-name {
  color: #35272f;
  font-size: 0.86rem;
  font-weight: 800;
}

.purchase-meta {
  color: #725f68;
  font-size: 0.78rem;
  font-weight: 700;
}

.purchase-empty {
  color: #725f68;
  font-size: 0.78rem;
  font-weight: 700;
}

.equip-summary {
  display: grid;
  gap: 6px;
  color: #4b3c44;
  font-size: 0.82rem;
  font-weight: 800;
  line-height: 1.35;
}
</style>