<script setup lang="ts">
interface Props {
  categoryName?: string
}

defineProps<Props>()
</script>

<template>
  <div class="shop-empty-state">
    <div class="empty-icon-wrap">
      <KawaiiIcon name="search" size="xl" class="empty-icon" />
    </div>
    <p class="empty-message">
      <template v-if="categoryName">{{ categoryName }} 類別暂时没有商品</template>
      <template v-else>目前暂时没有商品</template>
    </p>
  </div>
</template>

<style scoped>
.shop-empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 3rem 1rem;
  text-align: center;
}

.empty-icon-wrap {
  display: flex;
  align-items: center;
  justify-content: center;
  animation: kmg-float 3s ease-in-out infinite;
}

.empty-icon {
  font-size: 3rem;
  margin-bottom: 0.75rem;
  opacity: 0.45;
}

.empty-message {
  margin: 0;
  font-size: var(--font-size-sm);
  font-weight: 600;
  color: var(--color-text-dim);
}

@keyframes kmg-float {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-8px); }
}
</style>