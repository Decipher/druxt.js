import 'regenerator-runtime/runtime'
import { createLocalVue, mount } from '@vue/test-utils'

import DruxtModule from '../../src/components/DruxtModule.vue'

// Setup local vue instance.
const localVue = createLocalVue()

let mocks

describe('DruxtModule component', () => {
  beforeEach(() => {
    mocks = {
      $createElement: jest.fn(),
      $fetchState: { pending: false },
      $options: { druxt: {} },
      $nuxt: {
        context: {
          isDev: false,
        },
      },
    }
  })

  test('defaults', async () => {
    mocks.$fetchState.pending = true
    const wrapper = mount(DruxtModule, { localVue, mocks })
    await wrapper.vm.$options.fetch.call(wrapper.vm)

    // Data.
    expect(wrapper.vm.component).toStrictEqual({
      $attrs: {},
      is: 'DruxtWrapper',
      options: [],
      props: {},
      propsData: {},
      settings: {},
      slots: [],
    })

    // Methods.
    const wrapperData = await wrapper.vm.getWrapperData(wrapper.vm.component.is)
    expect(wrapperData).toStrictEqual({ druxt: {}, props: {} })

    expect(wrapper.vm.getModuleComponents()).toStrictEqual([])
    expect(wrapper.vm.getModulePropsData(wrapperData.props)).toStrictEqual({})

    const scopedSlots = wrapper.vm.getScopedSlots()
    expect(Object.keys(scopedSlots)).toStrictEqual([])

    const mock = {
      _init: jest.fn(),
      $options: { components: { test: jest.fn(() => ({ druxt: {}, props: {} })) }
    }}
    expect(await DruxtModule.methods.getWrapperData.call(mock, 'test')).toStrictEqual({ druxt: {}, props: {} })

    // HTML snapshot.
    expect(wrapper.html()).toMatchSnapshot()
  })

  test('defaults - v-model', async () => {
    const Component = {
      template: "<DruxtModule v-model='model' ref='module' />",
      components: { DruxtModule },
      data: () => ({ model: null })
    }
    const wrapper = mount(Component, { localVue, mocks, stubs: ['DruxtDebug'] })

    // Default state.
    expect(wrapper.vm.model).toStrictEqual(null)
    expect(wrapper.vm.$refs.module.component.props.value).toStrictEqual(undefined)
    expect(wrapper.vm.$refs.module.model).toStrictEqual(null)
    expect(wrapper.vm.$refs.module.value).toStrictEqual(null)

    // Change model value.
    await wrapper.setData({ model: { test: true }})

    expect(wrapper.vm.model).toStrictEqual({ test: true })
    expect(wrapper.vm.$refs.module.component.props.value).toStrictEqual({ test: true })
    expect(wrapper.vm.$refs.module.model).toStrictEqual({ test: true })
    expect(wrapper.vm.$refs.module.value).toStrictEqual({ test: true })
  })

  test('error', async () => {
    const CustomModule = {
      name: 'CustomModule',
      extends: DruxtModule,
    }

    let wrapper = mount(CustomModule, {localVue, mocks, stubs: ['DruxtDebug'] })
    await wrapper.vm.$options.fetch.call(wrapper.vm)

    expect(wrapper.vm.component.is).toBe('DruxtWrapper')

    // Simulate error.
    const err = {
      response: {
        status: '500',
        statusText: 'Test error',
        data: {
          errors: [{
            details: 'Test error'
          }]
        }
      }
    }
    wrapper.vm.error(err)

    // Expect the component to be DruxtDebug.
    expect(wrapper.vm.component.is).toBe('DruxtDebug')
    // Expect the component props to match snapshot.
    expect(wrapper.vm.component.props).toMatchSnapshot()

    // Fetch config error.
    CustomModule.druxt = {
      fetchConfig: async () => { throw new Error('Fetch config error') }
    }
    wrapper = mount(CustomModule, {localVue, mocks, stubs: ['DruxtDebug'] })
    await wrapper.vm.$options.fetch.call(wrapper.vm)
    // Expect the component to be DruxtDebug.
    expect(wrapper.vm.component.is).toBe('DruxtDebug')
    // Expect the component props to match snapshot.
    expect(wrapper.vm.component.props).toMatchSnapshot()

    // Fetch data error.
    CustomModule.druxt = {
      fetchData: async () => { throw new Error('Fetch data error') }
    }
    wrapper = mount(CustomModule, {localVue, mocks, stubs: ['DruxtDebug'] })
    await wrapper.vm.$options.fetch.call(wrapper.vm)
    // Expect the component to be DruxtDebug.
    expect(wrapper.vm.component.is).toBe('DruxtDebug')
    // Expect the component props to match snapshot.
    expect(wrapper.vm.component.props).toMatchSnapshot()
  })

  test('error - required props', () => {
    const mock = {
      $createElement: jest.fn(),
      $options: {
        props: {
          test: {
            type: Boolean,
            required: true
          }
        }
      },
      $nuxt: {
        context: {}
      },
      $scopedSlots: {},
    }
    DruxtModule.methods.getScopedSlots.call(mock).default()
    expect(mock.$createElement).toHaveBeenCalledWith(
      'DruxtDebug',
      { props: { summary: 'Missing required props: test.' } }
    )
  })

  test('custom module - no wrapper', async () => {
    const CustomModule = {
      name: 'CustomModule',
      extends: DruxtModule,
      druxt: {
        componentOptions: () => {},
        propsData: () => ({ foo: 'bar' }),
        slots: (h) => ({ default: () => h('div', ['test'] )}),
      }
    }

    const wrapper = mount(CustomModule, { localVue, mocks, stubs: ['DruxtWrapper'] })
    await wrapper.vm.$options.fetch.call(wrapper.vm)

    // Data.
    expect(wrapper.vm.component).toStrictEqual({
      $attrs: { foo: 'bar' },
      is: 'DruxtWrapper',
      options: [],
      props: {},
      propsData: { foo: 'bar' },
      settings: {},
      slots: ['default'],
    })

    // Methods.
    const wrapperData = await wrapper.vm.getWrapperData(wrapper.vm.component.is)
    expect(wrapperData).toStrictEqual({ druxt: {}, props: {} })

    expect(wrapper.vm.getModuleComponents(wrapperData.props)).toStrictEqual([])
    expect(wrapper.vm.getModulePropsData()).toStrictEqual({
      $attrs: { foo: 'bar' },
      props: {},
      propsData: { foo: 'bar' },
    })
    expect(Object.keys(wrapper.vm.getScopedSlots())).toStrictEqual(['default'])

    // HTML snapshot.
    expect(wrapper.html()).toMatchSnapshot()
  })

  test('custom module - wrapper', async () => {
    localVue.component('CustomModuleWrapper', {
      druxt: { foo: 'bar' },
      props: ['foo'],
      render: () => {}
    })

    const CustomModule = {
      name: 'CustomModule',
      extends: DruxtModule,
      druxt: {
        componentOptions: () => ([['wrapper']]),
        async fetchConfig() {},
        async fetchData(settings) {},
        propsData: () => ({ foo: 'bar' }),
        settings: ({}, settings) => ({ ...settings, custom: true }),
        slots: (h) => ({ default: () => h('div', ['test'] )}),
      }
    }

    const wrapper = mount(CustomModule, { localVue, mocks, stubs: ['DruxtWrapper'] })
    await wrapper.vm.$options.fetch.call(wrapper.vm)

    // Data.
    expect(wrapper.vm.component).toStrictEqual({
      $attrs: {},
      is: 'CustomModuleWrapper',
      options: ['CustomModuleWrapper'],
      props: { foo: 'bar' },
      propsData: { foo: 'bar' },
      settings: { foo: 'bar', custom: true },
      slots: ['default'],
    })

    // Methods.
    const wrapperData = await wrapper.vm.getWrapperData(wrapper.vm.component.is)
    expect(wrapperData.druxt).toStrictEqual({ foo: 'bar' })
    expect(Object.keys(wrapperData.props)).toStrictEqual(['foo'])

    expect(wrapper.vm.getModuleComponents()).toStrictEqual([{
      global: true,
      name: 'CustomModuleWrapper',
      parts: ['Wrapper']
    }])
    expect(wrapper.vm.getModulePropsData(wrapperData.props)).toStrictEqual({
      $attrs: {},
      props: { foo: 'bar' },
      propsData: { foo: 'bar' },
    })
    expect(Object.keys(wrapper.vm.getScopedSlots())).toStrictEqual(['default'])

    // v-model
    expect(wrapper.vm.model).toBe(null)
    await wrapper.setData({ model: { test: 'true' } })
    expect(wrapper.vm.model).toStrictEqual({ test: 'true' })

    wrapper.vm.$refs.component.$emit('input', { test: false })
    expect(wrapper.vm.model).toStrictEqual({ test: false })

    // HTML snapshot.
    expect(wrapper.html()).toMatchSnapshot()
  })

  test('dev mode slot', async () => {
    mocks.$nuxt.context.isDev = true
    const wrapper = mount(DruxtModule, { localVue, mocks, stubs: ['DruxtDebug'] })
    await wrapper.vm.$options.fetch.call(wrapper.vm)

    // Default slot.
    await wrapper.setData({ component: {
      ...wrapper.vm.component,
      options: ['Test'],
    } })
    const slot = wrapper.vm.getScopedSlots().default.call(wrapper.vm)
    expect(slot.tag.endsWith('DruxtDebug')).toBe(true)
  })

  test('custom default slot', async () => {
    const customModule = {
      extends: DruxtModule,
      druxt: {}
    }

    const scopedSlots = { default: jest.fn() }
    const wrapper = mount(customModule, { localVue, mocks, scopedSlots })
    await wrapper.vm.$options.fetch.call(wrapper.vm)

    wrapper.vm.getScopedSlots().default.call(wrapper.vm)
    expect(scopedSlots.default).toHaveBeenCalled()

    await wrapper.setProps({ wrapper: true })
    await wrapper.vm.$options.fetch.call(wrapper.vm)
  })
})
