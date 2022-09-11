<template>
    <a-layout id="basic-layout">
        <a-layout-sider v-model="collapsed" :trigger="null" collapsible>
            <img src="../../assets/logo_white.png" height="64" width="200" v-if="!collapsed"/>
            <img src="../../assets/logo_mini.png" height="64" width="80" v-else/>
            <c-menu mode="inline" :menus="menus" :inlineCollapsed="collapsed" @menuSelect="menuSelect" :selectedKeys="[menu.key]" :openKeys.sync="menu.keyPath" iconPark></c-menu>
        </a-layout-sider>
        <a-layout>
            <a-layout-header style="background: #fff; padding: 0;-webkit-app-region: drag;">
                <a-icon class="trigger" style="-webkit-app-region: no-drag" :type="collapsed ? 'menu-unfold' : 'menu-fold'" @click="() => (collapsed = !collapsed)"/>
                <div style="-webkit-app-region: no-drag"></div>
            </a-layout-header>
            <a-layout-content :style="{ margin: '12px', background: '#fff', minHeight: innerHeight,overflow:'auto'}">
                <router-view/>
            </a-layout-content>
        </a-layout>
    </a-layout>
</template>

<script>
import CMenu from "./components/CMenu"
import {mapGetters, mapActions} from 'vuex'

export default {
    name: "basic",
    components: {CMenu},
    data() {
        return {
            innerHeight:window.innerHeight - 120 +'px',
            collapsed: true,
            menus: [
                {
                    key:'dash',
                    icon:'workbench',
                    title:'工作台',
                    routeName:'dash'
                },
                {
                    key:'package',
                    icon:'application-one',
                    title:'应用包',
                    routeName:'package'
                },
                {
                    key:'task',
                    icon:'list',
                    title:'任务中心',
                    routeName:'task'
                },
                {
                    key:'member',
                    icon:'every-user',
                    title:'成员',
                    routeName:'member'
                },
                {
                    key:'database',
                    icon:'database-setting',
                    title:'数据源',
                    routeName:'database'
                },
                {
                    key:'tpl',
                    icon:'code-download',
                    title:'模板市场',
                    routeName:'tpl'
                },
                {
                    key:'icon',
                    icon:'pic',
                    title:'图标预览',
                    routeName:'icon'
                },
                {
                    key:'setting',
                    icon:'setting',
                    title:'设置',
                    routeName:'setting'
                },
                {
                    key:'market',
                    icon:'app-store',
                    title:'应用市场',
                    routeName:'market',
                    style:{position:'absolute',bottom: '52px'}
                },
                {
                    key:'profile',
                    icon:'user',
                    title:'个人资料',
                    routeName:'profile',
                    style:{position:'absolute',bottom: '12px'}
                },
            ],
        };
    },
    computed: {
        ...mapGetters(["menu","user",'theme']),
    },
    async created() {
        window.onresize = ()=>{
            this.innerHeight =  window.innerHeight - 120 +'px';
        }
    },
    methods: {
        ...mapActions(['ToggleMenu']),
        async menuSelect(menu) {
            const activeMenu = this.$clap.helper.getTreeNode(this.menus, menu.key);
            activeMenu.keyPath = menu.keyPath;
            this.ToggleMenu(activeMenu);
        }
    }
}
</script>

<style scoped lang="less">
#basic-layout {
    height: 100%;
}

#basic-layout .trigger {
    font-size: 18px;
    line-height: 64px;
    padding: 0 24px;
    cursor: pointer;
    transition: color 0.3s;
}

#basic-layout .trigger:hover {
    color: #1890ff;
}
</style>