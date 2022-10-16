<template>
    <a-table :id="id" :columns="currentColumns" tableLayout="fixed" :scroll="scroll" rowKey="_key" defaultExpandAllRows :dataSource="dataSource" size="small" :pagination="editable?false:currentPagination" :loading="loading" @change="(pagination, filters, sorter)=>$emit('change',pagination, filters, sorter)" :customHeaderRow='customHeaderRow' :customRow='customRow'>
        <template slot="sortActions" slot-scope="text, record, index">
            <a-icon type="ordered-list" class="c-drag"/>
        </template>
        <template slot="editActions" slot-scope="text, record, index">
            <a-space>
                <a-tooltip><template slot="title"> 复制 </template><a-button icon="copy" size="small" :disabled="getActionDisabled('copy',record)"  @click="handleCopy(record)" /></a-tooltip>
                <a-tooltip><template slot="title"> 增行 </template><a-button icon="plus" size="small" :disabled="getActionDisabled('add',record)" @click="handleAdd(record)" /></a-tooltip>
                <a-tooltip><template slot="title"> 删行 </template><a-button icon="minus" size="small" :disabled="getActionDisabled('remove',record)"  @click="handleRemove(record)" /></a-tooltip>
                <a-tooltip v-if="mode==='Tree'"><template slot="title"> 增行(子节点) </template><a-button icon="plus-circle" size="small" :disabled="getActionDisabled('addChild',record)"  @click="handleAddChild(record)" /></a-tooltip>
            </a-space>
        </template>
        <template v-for="(column,columnIndex) in columns" :slot="column.field + 'Render'+columnIndex" slot-scope="text, record, index">
            <c-widget v-if="editable&&getColumnVisible(column,record)" :value="text" :widget="column.widget" :widget-config="getWidgetConfig(column,record)" :disabled="getColumnDisabled(column,record)" @change="(val)=>handleChange(val,column.field,record)"></c-widget>
            <c-widget-display v-else-if="!editable&&getColumnVisible(column,record)" :value="text" :widget="column.widget" :widget-config="getWidgetConfig(column,record)" :disabled="getColumnDisabled(column,record)"></c-widget-display>
        </template>
        <template slot="actions" slot-scope="value,record,index">
            <a-dropdown>
                <a-icon type="ellipsis"/>
                <a-menu slot="overlay" @click="({key})=>{$emit('buttonClick',JSON.parse(key).event,JSON.parse(key).record)}">
                    <template v-for="(button,index) of buttons"><a-menu-item :disabled="getButtonDisabled(button.event,record)" :key="JSON.stringify({event:button.event,record})"><a-icon :type="button.icon"></a-icon>{{button.name}}</a-menu-item><a-menu-divider v-if="index<=buttons.length-2"></a-menu-divider></template>
                </a-menu>
            </a-dropdown>
        </template>
    </a-table>
</template>

<script>
import Sortable from 'sortablejs';

import CWidgetDisplay from "../CWidgetDisplay/CWidgetDisplay";
export default {
    name: "CTable",
    components: {CWidgetDisplay},
    props:{
        value: {
            type: [Array],
            default:()=>{
                return []
            }
        },
        mode: {
            type: String,
            default: () => {
                return 'Table'
            }
        },
        buttons:{
            type:Array,
            default:()=>{
                return []
            }
        },
        buttonsDisabled: {
            type: Object,
            default() {
                return {}
            }
        },
        actionsDisabled: {
            type: Object,
            default() {
                return {}
            }
        },
        loading:{
            type:Boolean,
            default(){
                return false
            }
        },
        columns:{
            type:Array,
            default:()=>{
                return []
            }
        },
        editable:{
            type:Boolean,
            default:()=>{
                return false
            }
        },
        pagination: {
            type:Object,
            default:()=>{
                return {
                    showSizeChanger: true,
                    showQuickJumper: true,
                    pageSizeOptions: ['10', '50', '100', '500']
                }
            }
        },
        count:{
            type:Number,
            default:()=>{
                return 0
            }
        },
        scroll:{
            type:[Object],
            default(){
                return {}
            }
        },
        customRow: {
            type: [Function,Boolean],
            default:()=>{
                return false
            }
        },
        customHeaderRow: {
            type: [Function,Boolean],
            default:()=>{
                return false
            }
        },
        beforeAdd: {
            type:[Boolean,Function],
            default:()=>{
                return false
            }
        },
        beforeAddChild: {
            type:[Boolean,Function],
            default:()=>{
                return false
            }
        },
        beforeCopy: {
            type:[Boolean,Function],
            default:()=>{
                return false
            }
        },
        beforeRemove: {
            type:[Boolean,Function],
            default:()=>{
                return false
            }
        },
    },
    data() {
        return {
            id:this.$clap.helper.uuid(),
            currentValue: []
        }
    },
    computed: {
        currentPagination(){
            return {
                total:this.count,
                ...this.pagination
            }
        },
        currentColumns(){
            let columns=[{
                title: '行号',
                align: 'center',
                fixed: 'left',
                width: 100,
                customRender: (text, record, index) => {
                    return index + 1
                },
            }];
            if(this.editable){
                columns=[{
                    align: 'center',
                    fixed: 'left',
                    width: 60,
                    key: 'sortActions',
                    scopedSlots: {customRender: 'sortActions'},
                },...columns,{
                    title: '行操作',
                    align: 'center',
                    width: 150,
                    key: 'editActions',
                    scopedSlots: {customRender: 'editActions'},
                }]
            }
            columns=[...columns,...this.columns.reduce((preColumns,column,index)=>{
                if(!column.hasOwnProperty('visible')||column.visible===true){
                    return [...preColumns,{
                        title: column.name ? column.name : column.field,
                        align: 'center',
                        key: column.field+index,
                        dataIndex: column.field,
                        ellipsis: true,
                        scopedSlots: {customRender: column.field + 'Render'+index}
                    }];
                }else{
                    return preColumns
                }
            },[])]
            if(this.buttons.length>0){
                columns.push({
                    title: '操作',
                    align: 'center',
                    key: 'actions',
                    scopedSlots: {customRender: 'actions'},
                })
            }
            return columns;
        },
        dataSource(){
            const data=JSON.parse(JSON.stringify(this.currentValue))
            if(this.mode==='Tree'){
                return this.$clap.helper.listToTree(data,0,{idKey:'_key',pIdKey:'p_key'})
            }
            return data;
        }
    },
    watch: {
        value: {
            async handler(value) {
                this.setCurrentValue(value)
            },
            deep: true //true 深度监听
        }
    },
    created() {
        this.setCurrentValue(this.value);
    },
    mounted() {
        let sortable = Sortable.create(document.getElementById(this.id).getElementsByClassName('ant-table-tbody')[0],{
            group:'name',
            sort: true,
            handle: ".c-drag",
            dataIdAttr: 'data-row-key',
            onMove: function (/**Event*/evt) {

            },
            onEnd: function (/**Event*/evt) {
                console.log(evt);
            },
        });
        console.log(sortable)
    },
    methods: {
        getActionDisabled(event,record){
            if(this.actionsDisabled.hasOwnProperty(event)){
                return typeof this.actionsDisabled[event]==='function'?this.actionsDisabled[event](record):this.actionsDisabled[event]
            }
            return false
        },
        getButtonDisabled(event,record){
            if(this.buttonsDisabled.hasOwnProperty(event)){
                return typeof this.buttonsDisabled[event]==='function'?this.buttonsDisabled[event](record):this.buttonsDisabled[event]
            }
            return false
        },
        getColumnDisabled(column,record) {
            if(column.hasOwnProperty('disabled')){
                return typeof column.disabled === 'function' ? column.disabled(record) : false
            }
            return false;
        },
        getColumnVisible(column,record) {
            if(column.hasOwnProperty('rowVisible')){
                return typeof column.rowVisible === 'function' ? column.rowVisible(record) : true
            }
            return true;
        },
        getWidgetConfig(column,record) {
            const widgetConfig={...column.widgetConfig};
            widgetConfig.range=widgetConfig.range?widgetConfig.range:[];
            widgetConfig.range= typeof widgetConfig.range === 'function' ? widgetConfig.range(record) : widgetConfig.range
            return widgetConfig;
        },
        setCurrentValue(value) {
            this.currentValue=value.map((item)=>{return this.mode==='Tree'?{...item,_key:item._key?item._key:(item._id?item._id:this.$clap.helper.uuid()),p_key:item.p_key?item.p_key:(item.p_id?item.p_id:0)}:{...item,_key:item._key?item._key:(item._id?item._id:this.$clap.helper.uuid())}});
            if(this.editable&&this.currentValue.length===0){
                this.currentValue = this.mode==='Tree'?[{ _key: this.$clap.helper.uuid(),p_key:0 }]: [{ _key: this.$clap.helper.uuid() }];
            }
            this.handleInput()
        },
        handleInput() {
            this.$emit('input', JSON.parse(JSON.stringify(this.currentValue)));
        },
        async handleAdd(record) {
            let Record=this.mode==='Tree'?{ _key: this.$clap.helper.uuid(),p_key:record.p_key }: { _key: this.$clap.helper.uuid() };
            const index=this.currentValue.findIndex(item=>item._key===record._key)
            if (this.beforeAdd) {
                Record=await this.beforeAdd(Record,{record,index})
            }
            if(!Record)return;
            this.currentValue.splice(index+1, 0, Record)
            this.handleInput()
            this.$emit('add',Record)
        },
        async handleAddChild(record) {
            let Record=this.mode==='Tree'?{ _key: this.$clap.helper.uuid(),p_key:record._key }: { _key: this.$clap.helper.uuid() };
            const index=this.currentValue.findIndex(item=>item._key===record._key)
            if (this.beforeAddChild) {
                Record=await this.beforeAddChild(Record,{record,index})
            }
            if(!Record)return;
            this.currentValue.splice(index+1, 0, Record)
            this.handleInput()
            this.$emit('addChild',Record)
        },
        async handleCopy(record) {
            let Record={...record,_key:this.$clap.helper.uuid()}
            const index=this.currentValue.findIndex(item=>item._key===record._key)
            if (this.beforeCopy) {
                Record=await this.beforeCopy(Record,{record,index})
            }
            if(!Record)return;
            this.currentValue.splice(index + 1, 0, Record)
            this.handleInput()
            this.$emit('copy',record, index)
        },
        async handleRemove(record) {
            if(this.currentValue.length===1){
                this.$message.error('已经是最后一行数据了！');
                return;
            }
            if(this.mode==='Tree'&&this.currentValue.filter(item=>item.p_key===record._key).length>0){
                this.$message.error('请先删除子节点！');
                return;
            }
            let Record=record;
            const index=this.currentValue.findIndex(item=>item._key===record._key)
            if (this.beforeRemove) {
                Record=await this.beforeRemove(record);
            }
            if(!Record)return;
            this.currentValue.splice(index, 1);
            this.handleInput()
            this.$emit('remove',record, index)
        },
        handleChange(value, field, record) {
            clearTimeout(this.timer)
            this.timer = setTimeout(() => {
                //创建一个定时器，一秒钟执行一次
                const index=this.currentValue.findIndex(item=>item._key===record._key)
                this.currentValue[index][field] = value
                this.handleInput()
                this.$emit('change',this.currentValue, value, field, {record,index})
            }, 100)
        }
    }
}
</script>

<style scoped>

</style>
