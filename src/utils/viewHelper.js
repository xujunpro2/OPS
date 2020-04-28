//记录全局viewer对象
let _viewer = null

export default {
  setViewer (viewer) {
    _viewer = viewer
  },
  getViewer () {
    return _viewer
  }
}
