<template>
    <a-tabs hideAdd :activeKey="menu.key" type="editable-card" @edit="onTabEdit" @change="onTabChange" :tabBarStyle="{margin: 0}">
        <a-tab-pane v-for="pane in activePanes" :tab="pane.title" :key="pane.key" :closable="pane.closable"></a-tab-pane>
        <a-row type="flex" justify="center" align="middle" slot="tabBarExtraContent">
            <a-dropdown placement="bottomRight" @getPopupContainer="()=>document.body">
                <a-button icon="down" style="margin: 4px 0;"></a-button>
                <a-menu slot="overlay" @click="onTabClose">
                    <a-menu-item key="left">
                        <a-icon type="left"/>
                        关闭左侧
                    </a-menu-item>
                    <a-menu-item key="right">
                        <a-icon type="right"/>
                        关闭右侧
                    </a-menu-item>
                    <a-menu-item key="other">
                        <a-icon type="close"/>
                        关闭其他
                    </a-menu-item>
                    <a-menu-item key="all">
                        <a-icon type="close-circle"/>
                        关闭所有
                    </a-menu-item>
                </a-menu>
            </a-dropdown>
        </a-row>
    </a-tabs>
</template>

<script>
    import {mapActions, mapGetters} from "vuex";

    export default {
        name: "MultiTab",
        props:{
            defaultActivePane: {
                type: Object,
                default: ()=>{
                    return {
                        key: 'dash',
                        title: '首页',
                        routeName: 'dash',
                        closable: false
                    }
                }
            },
        },
        data() {
            return {
                activePanes: []
            }
        },
        created() {
            this.setDefaultActivePane(this.defaultActivePane);
            if (this.menu.key&&this.getTabIndex(this.menu.key) < 0) {
                this.activePanes.push(this.menu)
            }
        },
        watch: {
            'menu.key'(key) {
                if (this.getTabIndex(key) < 0) {
                    this.activePanes.push(this.menu)
                }
            },
            defaultActivePane:{
                handler(pane){
                    this.setDefaultActivePane(pane)
                },
                deep: true
            },
            activePanes:{
                handler(value){
                    this.$emit('change',value)
                },
                deep: true
            }
        },
        computed: {
            ...mapGetters(["menu"]),
        },
        methods: {
            ...mapActions(['ToggleMenu']),
            setDefaultActivePane(pane){
                this.activePanes[0]=pane;
            },
            getTabIndex(key) {
                return this.activePanes.map(item => {
                    return item.key;
                }).findIndex((item) => {
                    return item === key
                });
            },
            onTabEdit(targetKey, action) {
                this[action](targetKey);
            },
            remove(key) {
                const index = this.getTabIndex(key)
                this.activePanes.splice(index, 1);
                this.ToggleMenu(this.activePanes[index - 1]);
            },
            onTabClose(e) {
                const index = this.getTabIndex(this.menu.key)
                switch (e.key) {
                    case 'left':
                        if (index > 1) {
                            this.activePanes.splice(1, index - 1)
                        }
                        break;
                    case 'right':
                        this.activePanes.splice(index + 1, this.activePanes.length - 1);
                        break;
                    case 'other':
                        this.activePanes = [this.activePanes[0], this.activePanes[index]];
                        this.ToggleMenu(this.activePanes[index]);
                        break;
                    case 'all':
                        this.activePanes = [this.activePanes[0]];
                        this.ToggleMenu(this.activePanes[0]);
                        break;
                    default:
                        break;
                }
            },
            onTabChange(activeKey) {
                this.ToggleMenu(this.activePanes[this.getTabIndex(activeKey)]);
            },
        }
    }
</script>

<style scoped>

</style>
