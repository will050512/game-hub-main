import { mount } from '@vue/test-utils'
import { beforeEach, describe, expect, it } from 'vitest'
import { createPinia, setActivePinia } from 'pinia'
import ShopView from './ShopView.vue'

describe('ShopView', () => {
  beforeEach(() => {
    localStorage.clear()
    setActivePinia(createPinia())
  })

  it('wires header category changes into the active shop filter', async () => {
    const wrapper = mount(ShopView, {
      global: {
        stubs: {
          ShopHeader: {
            props: ['activeCategory'],
            emits: ['update:active-category'],
            template: `
              <header>
                <span class="active-category">{{ activeCategory }}</span>
                <button class="set-offense" @click="$emit('update:active-category', 'offense')">filter</button>
              </header>
            `,
          },
          ShopPurchaseModal: true,
          ShopEmptyState: true,
          ShopSidePanel: true,
          ShopItemCard: true,
          ShopCollectibleCard: true,
        },
      },
    })

    expect(wrapper.find('.active-category').text()).toBe('all')

    await wrapper.find('.set-offense').trigger('click')

    expect(wrapper.find('.active-category').text()).toBe('offense')
  })
})
