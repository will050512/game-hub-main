import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'
import LobbyViewTabs from './LobbyViewTabs.vue'

describe('LobbyViewTabs', () => {
  it('keeps a visible shop entry in the main lobby navigation', () => {
    const wrapper = mount(LobbyViewTabs, {
      props: { modelValue: 'games' },
      global: {
        stubs: {
          KawaiiIcon: { template: '<span />' },
        },
      },
    })

    expect(wrapper.text()).toContain('商店')
  })
})
