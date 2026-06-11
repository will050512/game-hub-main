import { mount } from '@vue/test-utils'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import TutorialOverlay from './TutorialOverlay.vue'

function mountTutorial(instructions: string[]) {
  return mount(TutorialOverlay, {
    props: {
      visible: true,
      instructions,
      autoAdvanceMs: 100,
      animationDuration: 20,
    },
    global: {
      stubs: {
        teleport: true,
        transition: false,
        DoodleCard: { template: '<section><slot /></section>' },
        KawaiiIcon: { template: '<span />' },
      },
    },
  })
}

describe('TutorialOverlay', () => {
  beforeEach(() => {
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('auto-completes a one-step tutorial after the visible step duration', async () => {
    const wrapper = mountTutorial(['Move to survive'])

    await vi.advanceTimersByTimeAsync(100)

    expect(wrapper.emitted('complete')).toHaveLength(1)
  })

  it('keeps the final step visible for a full duration before completing', async () => {
    const wrapper = mountTutorial(['Move', 'Attack'])

    await vi.advanceTimersByTimeAsync(100)
    await vi.advanceTimersByTimeAsync(20)
    await wrapper.vm.$nextTick()

    expect(wrapper.emitted('step-change')).toEqual([[1]])
    expect(wrapper.emitted('complete')).toBeUndefined()

    await vi.advanceTimersByTimeAsync(100)

    expect(wrapper.emitted('complete')).toHaveLength(1)
  })
})
