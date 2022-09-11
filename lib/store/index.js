import Vue from 'vue'
import Vuex from 'vuex'

import app from './modules/app'
import user from './modules/user'

Vue.use(Vuex);

export default new Vuex.Store({
    modules: {
        clapApp:app,
        clapUser:user,
    },
    state: {

    },
    mutations: {

    },
    actions: {

    },
    getters:{
        layout: state => state.clapApp.layout,
        applications: state => state.clapApp.applications,
        application: state => state.clapApp.application,

        menu: state => state.clapApp.menu,
        theme: state => state.clapApp.theme,
        multiTab: state => state.clapApp.multiTab,
        lang: state => state.clapApp.lang,

        user: state => state.clapUser.user,
        token: state => state.clapUser.token,
        group: state => state.clapUser.group,
        organ: state => state.clapUser.organ,
    }
})
