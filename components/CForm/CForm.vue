<template>
    <a-form-model ref="form" :model="data" :rules="rules" :label-col="{span: 4}" :wrapper-col="{span: 20}" labelAlign="left">
        <a-row :gutter="12" type="flex" justify="start">
            <a-col :span="column.span?column.span:24" v-for="column of columns" :key="column.field" v-if="getColumnVisible(column)">
                <a-form-model-item  :label="column.name" :prop="column.field">
                    <c-widget :value="data[column.field]" :widget="column.widget" :widget-config="getWidgetConfig(column)" :disabled="getColumnDisabled(column)" @change="(val)=>handleColumnChange(val,column)"/>
                </a-form-model-item>
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
        }
    },
    data(){
      return {
          data:{}
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
            this.data=JSON.parse(JSON.stringify(value));
        },
        getColumnDisabled(column) {
            if(column.hasOwnProperty('disabled')){
                return typeof column.disabled === 'function' ? column.disabled(this.data) : false
            }
            return false;
        },
        getColumnVisible(column) {
            if(column.hasOwnProperty('visible')){
                return typeof column.visible === 'function' ? column.visible(this.data) : true
            }
            return true;
        },
        getWidgetConfig(column) {
            const widgetConfig={...column.widgetConfig};
            widgetConfig.range=widgetConfig.range?widgetConfig.range:[];
            widgetConfig.range= typeof widgetConfig.range === 'function' ? widgetConfig.range(this.data) : widgetConfig.range
            return widgetConfig;
        },
        handleInput() {
            this.$emit('input', this.data);
            this.$emit('change',this.data)
        },
        handleColumnChange(value,column){
            this.data[column.field]=value;
            this.setCurrentValue(this.data)
            this.handleInput();
            column.onChange&&column.onChange(value,this.data);
        }
    }
}
</script>

<style scoped>

</style>