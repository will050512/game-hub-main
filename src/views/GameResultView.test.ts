import { mount } from '@vue/test-utils'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { createPinia, setActivePinia } from 'pinia'
import GameResultView from './GameResultView.vue'

vi.mock('vue-router', () => ({
  useRouter: () => ({ replace: vi.fn(), push: vi.fn() }),
  useRoute: () => ({
    query: { score: '1200', kills: '3', time: '90', level: '2', coins: '40' },
  }),
}))

describe('GameResultView', () => {
  beforeEach(() => {
    localStorage.clear()
    setActivePinia(createPinia())
  })

  it('renders results inside a dedicated adaptive scroll region', () => {
    const wrapper = mount(GameResultView, {
      props: { id: 'survivor' },
      global: {
        stubs: {
          KawaiiDecorLayer: true,
          KawaiiIcon: { template: '<span />' },
          KmgButton: { template: '<button><slot /></button>' },
          KmgCurrency: { props: ['amount'], template: '<span>{{ amount }}</span>' },
          KmgBadge: { template: '<span><slot /></span>' },
          BaseCard: { template: '<section><slot /></section>' },
          Transition: false,
          TransitionGroup: { template: '<div><slot /></div>' },
        },
      },
    })

    expect(wrapper.find('.result-scroll').exists()).toBe(true)
    expect(wrapper.find('.score-hero').exists()).toBe(true)
    expect(wrapper.find('.footer').exists()).toBe(true)
  })
})
