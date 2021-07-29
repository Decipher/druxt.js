export const state = () => ({
  article: null,
  mode: 'view',
  uuid: null,
})

export const mutations = {
  setActive(state, uuid) {
    state.uuid = uuid
  },

  setMode(state, mode) {
    state.mode = mode
  }
}
