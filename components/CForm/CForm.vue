<template>
    <a-form-model ref="form" :model="currentValue" :rules="rules" labelAlign="left">
        <a-row :gutter="12" type="flex" justify="start">
            <a-col :span="column.span?column.span:24" v-for="column of columns" :key="column.field" v-if="getColumnVisible(column)">
                <a-form-model-item :style="compact?{marginBottom:0}:{}" v-if="column.widget!=='Tabs'"  :label="column.name" :prop="column.field" :label-col="{span:column.hasOwnProperty('labelCol')?column.labelCol:4}" :wrapper-col="{span: column.hasOwnProperty('wrapperCol')?column.wrapperCol:20}">
                    <c-widget :value="currentValue[column.field]" :widget="column.widget" :widget-config="getWidgetConfig(column)" :disabled="getColumnDisabled(column)" @change="(...args)=>handleColumnChange(args[0],column,args)"/>
                </a-form-model-item>
                <a-tabs :default-active-key="0" v-else>
                    <a-button-group slot="tabBarExtraContent" v-if="column.widgetConfig.buttons[0]">
                        <a-button v-for="button of column.widgetConfig.buttons" :key="button.name" type="primary" :icon="button.icon" @click="button.onClick(currentValue)" :disabled="button.disabled">{{ button.name }}</a-button>
                    </a-button-group>
                    <a-tab-pane :key="index" :tab="childColumn.name" v-for="(childColumn,index) of column.widgetConfig.tabs">
                        <c-form :value="currentValue" :columns="childColumn.columns" @change="setCurrentValue"></c-form>
                    </a-tab-pane>
                </a-tabs>
            </a-col>
        </a-row>
    </a-form-model>
</template>

<script>
export default {
    name: "CForm",
    props:{
        value:{
            type:Object,
            default:()=>{
                return {}
            }
        },
        columns:{
            type:Array,
            default:()=>{
                return []
            }
        },
        disabled:{
            type:Boolean,
            default:false
        },
        compact:{
            type:Boolean,
            default:false
        }
    },
    data(){
      return {
          currentValue:{}
      }
    },
    created() {
        this.setCurrentValue(this.value)
    },
    watch: {
        value: {
            async handler(val) {
                this.setCurrentValue(val)
            },
            deep: true
        }
    },
    computed:{
      rules(){
          const rules={};
          for(let column of this.columns){
              if(column.required){
                  rules[column.field] = [{required: true, message: '必填', trigger: ['change', 'blur']}]
              }
          }
          return rules
      }
    },
    methods:{
        resetFields(){
            this.$refs.form.resetFields();
        },
        validate(cb){
            this.$refs.form.validate(cb);
        },
        setCurrentValue(value){
            this.currentValue=JSON.parse(JSON.stringify(value));
            this.handleInput();
        },
        getColumnDisabled(column) {
            if(this.disabled){
                return true
            }
            if(column.hasOwnProperty('disabled')){
                return typeof column.disabled === 'function' ? column.disabled(this.currentValue) : column.disabled
            }
            return false;
        },
        getColumnVisible(column) {
            if(column.hasOwnProperty('visible')){
                return typeof column.visible === 'function' ? column.visible(this.currentValue) : column.visible
            }
            return true;
        },
        getWidgetConfig(column) {
            const widgetConfig={...typeof column.widgetConfig === 'function'?column.widgetConfig():column.widgetConfig};
            widgetConfig.range= typeof widgetConfig.range === 'function' ? widgetConfig.range(this.currentValue) : widgetConfig.range
            widgetConfig.scope= typeof widgetConfig.scope === 'function' ? widgetConfig.scope(this.currentValue) : widgetConfig.scope
            widgetConfig.beforeChange=()=>{
                return widgetConfig.beforeChange ? async (params = this.currentValue) => {await widgetConfig.beforeChange(params)} : true
            }
            return widgetConfig;
        },
        handleInput() {
            const value=JSON.stringify(this.currentValue);
            if(JSON.stringify(this.value)!==value){
                this.$emit('input',JSON.parse(value));
                this.$emit('change',JSON.parse(value))
            }
        },
        handleColumnChange(value,column,args){
            this.currentValue[column.field]=value;
            this.handleInput();
            column.onChange&&column.onChange(value,this.currentValue,args);
        },
    }
}
</script>

<style scoped>

</style>