import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'
import InputAffordance from './InputAffordance.vue'

describe('InputAffordance', () => {
  it('uses a compact companion instead of bottom instruction chips', () => {
    const wrapper = mount(InputAffordance, {
      props: {
        inputModes: ['touch', 'keyboard'],
        gameId: 'survivor',
        isJoystickActive: false,
        joystickOrigin: { x: 0, y: 0 },
      },
      global: {
        stubs: {
          KawaiiIcon: { template: '<span />' },
        },
      },
    })

    expect(wrapper.find('.input-companion').exists()).toBe(true)
    expect(wrapper.find('.touch-guide').exists()).toBe(false)
    expect(wrapper.find('.keyboard-hint').exists()).toBe(false)
  })
})
