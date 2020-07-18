import DruxtModule from '..'

const mock = {
  addModule: jest.fn(),
  addPlugin: jest.fn(),
  addTemplate: jest.fn(),
  DruxtModule
}

jest.mock('druxt-schema')

describe('Druxt.js', () => {
  test('Nuxt module', () => {
    expect(() => { mock.DruxtModule() }).toThrow('Druxt settings missing.')

    mock.options = { druxt: {} }
    mock.nuxt = {
      hook: jest.fn(async (hook, callback) => {
        await callback.call(this)
      })
    }

    // Call Druxt module.
    mock.DruxtModule()

    // Expect 8 modules to be added.
    expect(mock.addModule).toHaveBeenCalledTimes(8)

    // Expect the builder hook to be added.
    expect(mock.nuxt.hook).toHaveBeenCalledTimes(1)
  })
})
