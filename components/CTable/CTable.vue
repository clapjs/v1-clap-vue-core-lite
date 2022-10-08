<template>
    <a-table :columns="currentColumns" tableLayout="fixed" :rowKey="rowKey" :dataSource="currentValue" size="small" :pagination="editable?false:currentPagination" :loading="loading" @change="(pagination, filters, sorter)=>$emit('change',pagination, filters, sorter)" :customHeaderRow='customHeaderRow' :customRow='customRow'>
        <template slot="editActions" slot-scope="text, record, index">
            <a-tooltip><template slot="title"> 复制 </template><a-icon type="copy" style="margin-right: 12px" @click="handleCopy(record, index)" /></a-tooltip>
            <a-tooltip><template slot="title"> 增行 </template><a-icon type="plus" style="margin-right: 12px" @click="handleAdd(record, index)" /></a-tooltip>
            <a-tooltip><template slot="title"> 删行 </template><a-icon type="minus"  @click="handleRemove(record, index)" v-if="currentValue.length > 1" /></a-tooltip>
        </template>
        <template v-for="(column,columnIndex) in columns" :slot="column.field + 'Render'+columnIndex" slot-scope="text, record, index">
            <c-widget v-if="editable&&getColumnVisible(column,record)" :value="text" :widget="column.widget" :widget-config="getWidgetConfig(column,record)" :disabled="getColumnDisabled(column,record)" @change="(val)=>handleChange(val,column.field,{text, record, index})"></c-widget>
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
        rowKey:{
            type:String,
            default:()=>{
                return 'key'
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
            let columns=[]
            if(this.mode==='Table'){
                columns=[{
                    title: '行号',
                    align: 'center',
                    width: 60,
                    customRender: (text, record, index) => {
                        return index + 1
                    },
                }];
            }
            if(this.mode==='Tree'){
                columns=[{
                    title: '#',
                    align: 'center',
                    fixed: 'left',
                    width: 60
                }]
            }
            if(this.editable){
                columns=[...columns,{
                    title: '行操作',
                    align: 'center',
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
    methods: {
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
            this.currentValue=value;
            if(this.editable&&this.currentValue.length===0){
                this.currentValue = [{ [this.rowKey]: new Date().getTime() }];
            }
            this.handleInput()
        },
        handleInput() {
            this.$emit('input', JSON.parse(JSON.stringify(this.currentValue)));
        },
        async handleAdd(record, index) {
            if (this.beforeAdd) {
                const {record:rRecord,index:rIndex}=await this.beforeAdd(record, index);
                record=rRecord?rRecord:record;
                index=rIndex?rIndex:index;
            }
            this.currentValue.splice(index + 1, 0, { [this.rowKey]: new Date().getTime() })
            this.handleInput()
            this.$emit('afterAdd',record, index)
        },
        async handleCopy(record, index) {
            if (this.beforeCopy) {
                const {record:rRecord,index:rIndex}=await this.beforeCopy(record, index);
                record=rRecord?rRecord:record;
                index=rIndex?rIndex:index;
            }
            this.currentValue.splice(index + 1, 0, Object.assign(JSON.parse(JSON.stringify(record)), { [this.rowKey]: new Date().getTime() }))
            this.handleInput()
            this.$emit('afterCopy',record, index)
        },
        async handleRemove(record, index) {
            if (this.beforeRemove) {
                const {record:rRecord,index:rIndex}=await this.beforeRemove(record, index);
                record=rRecord?rRecord:record;
                index=rIndex?rIndex:index;
            }
            this.currentValue.splice(index, 1)
            this.handleInput()
            this.$emit('afterRemove',record, index)
        },
        handleChange(value, field, scope) {
            clearTimeout(this.timer)
            this.timer = setTimeout(() => {
                //创建一个定时器，一秒钟执行一次
                this.currentValue[scope.index][field] = value
                this.handleInput()
                this.$emit('change',this.currentValue, value, field, scope)
            }, 100)
        }
    }
}
</script>

<style scoped>

</style>
