import { join } from 'path'

/**
 * The Nuxt.js module function.
 *
 * - Adds the Vue.js components to the Nuxt.js frontend.
 *
 * The module function should not be used directly, but rather installed via yout Nuxt.js configuration file.
 *
 * Options are set on the root level `druxt` Nuxt.js config object.
 *
* @example <caption>nuxt.config.js</caption> @lang js
 * module.exports = {
 *   modules: [
 *     'druxt-breadcrumb'
 *   ],
 *   druxt: {
 *     baseUrl: 'https://example.com'
 *   }
 * }
 *
 * @param {object} moduleOptions - Nuxt.js module options object.
 */
const DruxtBreadcrumbModule = function () {
  // Register components directories.
  this.nuxt.hook('components:dirs', dirs => {
    dirs.push({ path: join(__dirname, 'components') })
    dirs.push({ path: join(__dirname, 'components/blocks') })
  })

  // Nuxt Storybook.
  this.nuxt.hook('storybook:config', ({ stories }) => {
    stories.push('druxt-breadcrumb/dist/components/*.stories.mjs')
  })
}

DruxtBreadcrumbModule.meta = require('../package.json')

export { DruxtBreadcrumbModule }
