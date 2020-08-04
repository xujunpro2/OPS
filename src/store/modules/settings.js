import Settings from '@/settings'

const state = {
    title: Settings.title,
    fixedHeader: Settings.fixedHeader,
    tagsView: Settings.tagsView,
    pageSize: Settings.pageSize,
    pageSizeList: Settings.pageSizeList,
    server:Settings.server(),
    uploadStore:Settings.server()+"uploadStore/pictures/",
}

const mutations = {
    //修改state
    CHANGE_SETTING: (state, {key,value}) => {
        if (state.hasOwnProperty(key)) {
            state[key] = value
        }
    }
}

const actions = {
    changeSetting({commit}, data) {
        commit('CHANGE_SETTING', data)
    },
    //分页rows设置发生变化
    changePageSize({commit},rows) {
        commit('CHANGE_SETTING',{key:'pageSize',value:rows})
    },
}

export default {
    namespaced: true,
    state,
    mutations,
    actions
}