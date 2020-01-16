const folder = {
  state: {
    folders: []
  },
  mutations: {
    INIT_FOLDER(state) {
      state.folders = []
    },
    ADD_FOLDER(state, node) {
      state.folders.push(node)
    }
  },
  actions: {

  },
  getters: {
    folders: state => state.folders
  }
}

export default folder
