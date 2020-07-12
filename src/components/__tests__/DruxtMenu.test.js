import { createLocalVue, shallowMount } from '@vue/test-utils'
import Vuex from 'vuex'
import mockAxios from 'jest-mock-axios'

import { DruxtRouterStore } from 'druxt-router'

import { DruxtMenu, DruxtMenuComponent, DruxtMenuItemComponent, DruxtMenuStore } from '../..'

jest.mock('axios')

const baseURL = 'https://example.com'

// Setup local vue instance.
const localVue = createLocalVue()
localVue.use(Vuex)
localVue.component('druxt-menu-item', DruxtMenuItemComponent)

let store

const mocks = {
  $route: { path: '/' }
}

const mountComponent = (options = {}) =>
  shallowMount(DruxtMenuComponent, { ...options, store, localVue, mocks })

describe('DruxtMenu', () => {
  beforeEach(() => {
    mockAxios.reset()

    // Setup vuex store.
    store = new Vuex.Store()
    store.$druxtMenu = new DruxtMenu(baseURL, {})
    DruxtMenuStore({ store })
    DruxtRouterStore({ store })
  })

  test('default', async () => {
    const wrapper = mountComponent()

    // Wait for async Axios get requests.
    expect(mockAxios.get).toHaveBeenCalledTimes(1)
    await localVue.nextTick()
    await localVue.nextTick()
    expect(mockAxios.get).toHaveBeenCalledTimes(2)
    await localVue.nextTick()
    await localVue.nextTick()

    // Expect 4 items from the store.
    expect(Object.keys(wrapper.vm.entities).length).toBe(4)

    // Expect 3 items at the root level.
    expect(wrapper.vm.items.length).toBe(3)

    // Expect the last item to have 1 child.
    expect(wrapper.vm.items[2].children.length).toBe(1)

    // Expect trail.
    expect(wrapper.vm.trail).toStrictEqual(['/'])

    const watch = {
      ...DruxtMenuComponent.watch,
      $forceUpdate: jest.fn()
    }
    watch.entities()
    expect(watch.$forceUpdate).toHaveBeenCalled()
  })

  test('depth', async () => {
    const propsData = { depth: 1 }
    const wrapper = mountComponent({ propsData })

    // Wait for async Axios get requests.
    expect(mockAxios.get).toHaveBeenCalledTimes(1)
    await localVue.nextTick()
    await localVue.nextTick()
    expect(mockAxios.get).toHaveBeenCalledTimes(2)
    await localVue.nextTick()
    await localVue.nextTick()

    // Expect 4 items from the store.
    expect(Object.keys(wrapper.vm.entities).length).toBe(4)

    // Expect 3 items at the root level.
    expect(wrapper.vm.items.length).toBe(3)

    // Expect the last item to have no children.
    expect(wrapper.vm.items[2].children.length).toBe(0)

    // Expect trail.
    expect(wrapper.vm.trail).toStrictEqual(['/'])
  })
})
