<template>
    <div>
        <a-input v-if="widget === 'Input' || widget === 'PickerColor'" :value="currentValue" :placeholder="widgetConfig.placeholder" :disabled="disabled" :size="widgetConfig.size" @change="e => handleChange(e.target.value)" @focus="e => handleFocus(e)" class="fullWidth">
            <c-picker-color v-if="widget === 'PickerColor'" :value="currentValue" :disabled="disabled" @change="val => handleChange(val)" slot="addonBefore" />
        </a-input>
        <a-input-number  v-else-if="widget === 'InputNumber'" :value="currentValue" :min="widgetConfig.min" :max="widgetConfig.max" :disabled="disabled" :size="widgetConfig.size" @change="val => handleChange(val)" @focus="e => handleFocus(e)" class="fullWidth" />
        <a-textarea   v-else-if="widget === 'Textarea'" :value="currentValue" :placeholder="widgetConfig.placeholder" :disabled="disabled" :size="widgetConfig.size" @change="e => handleChange(e.target.value)" @focus="e => handleFocus(e)" class="fullWidth" />
        <a-progress  v-else-if="widget === 'Progress'" :percent="currentValue" :placeholder="widgetConfig.placeholder" :disabled="disabled" :size="widgetConfig.size" @change="e => handleChange(e.target.value)" @focus="e => handleFocus(e)" class="fullWidth" />
        <a-date-picker  v-else-if="widget === 'Date'" format="YYYY-MM-DD HH:mm " :showTime="{ format: 'HH:mm' }" :value="currentValue" :disabled="disabled" :placeholder="widgetConfig.placeholder" :size="widgetConfig.size" @change="val => handleChange(val)" @focus="e => handleFocus(e)" class="fullWidth" />
        <a-month-picker  v-else-if="widget === 'Month'" :value="currentValue" :disabled="disabled" :placeholder="widgetConfig.placeholder" :size="widgetConfig.size" @change="val => handleChange(val)" @focus="e => handleFocus(e)" class="fullWidth" />
        <a-range-picker  v-else-if="widget === 'Range'" :value="currentValue" :disabled="disabled" :size="widgetConfig.size" @change="val => handleChange(val)" @focus="e => handleFocus(e)" class="fullWidth" />
        <a-week-picker  v-else-if="widget === 'Week'" :value="currentValue" :disabled="disabled" :placeholder="widgetConfig.placeholder" :size="widgetConfig.size" @change="val => handleChange(val)" @focus="e => handleFocus(e)" class="fullWidth" />
        <a-time-picker  v-else-if="widget === 'Time'" :value="currentValue" :disabled="disabled" :placeholder="widgetConfig.placeholder" :size="widgetConfig.size" @change="val => handleChange(val)" @focus="e => handleFocus(e)" class="fullWidth" />
        <a-switch v-else-if="widget === 'Switch'" :checked="currentValue" :disabled="disabled" :placeholder="widgetConfig.placeholder" :size="widgetConfig.size" @change="val => handleChange(val)" @focus="e => handleFocus(e)" />
        <a-tree-select v-else-if="widget === 'TreeSelect'"  :value="currentValue" :disabled="disabled" :treeData="widgetConfig.treeData" :placeholder="widgetConfig.placeholder" :size="widgetConfig.size" @change="val => handleChange(val)" @focus="e => handleFocus(e)" treeDefaultExpandAll treeNodeFilterProp="title" :dropdownStyle="{ maxHeight: '400px', overflow: 'auto' }" class="fullWidth" />
        <a-radio-group v-else-if="widget === 'Radio'" :value="currentValue" :disabled="disabled" :size="widgetConfig.size" @change="e => handleChange(e.target.value)" @focus="e => handleFocus(e)">
            <a-radio :value="option.hasOwnProperty('code') ? option.code : option" v-for="option of widgetConfig.range" :key="option.hasOwnProperty('code') ? option.code : option" :disabled="option.hasOwnProperty('disabled')?option.disabled:false">{{ option.hasOwnProperty('name') ? option.name : option }}</a-radio>
        </a-radio-group>
        <a-checkbox-group v-else-if="widget === 'Checkbox'" :value="currentValue" :disabled="disabled" :size="widgetConfig.size" @change="val => handleChange(val)" @focus="e => handleFocus(e)">
            <a-row><a-col :span="widgetConfig.column?24/widgetConfig.column:24"><a-checkbox :value="option.hasOwnProperty('code') ? option.code : option" v-for="option of widgetConfig.range" :key="option.hasOwnProperty('code') ? option.code : option" :disabled="option.hasOwnProperty('disabled')?option.disabled:false">{{ option.hasOwnProperty('name') ? option.name : option }}</a-checkbox></a-col></a-row>
        </a-checkbox-group>
        <template v-else-if="widget === 'Select'">
            <a-select  v-if="!widgetConfig.hasOwnProperty('mode')||widgetConfig.mode==='default'" :value="currentValue" :disabled="disabled" :size="widgetConfig.size" @change="val => handleChange(val)" @focus="e => handleFocus(e)" class="fullWidth">
                <a-select-option :value="option.hasOwnProperty('code') ? option.code : option" v-for="option of widgetConfig.range" :key="option.hasOwnProperty('code') ? option.code : option" :disabled="option.hasOwnProperty('disabled')?option.disabled:false">{{ option.hasOwnProperty('name') ? option.name : option }}</a-select-option>
            </a-select>
            <a-select  v-else-if="widgetConfig.mode==='multiple'" :maxTagCount="2" mode="multiple" :value="currentValue" :disabled="disabled" :size="widgetConfig.size" @change="val => handleChange(val)" @focus="e => handleFocus(e)" class="fullWidth">
                <a-select-option :value="option.hasOwnProperty('code') ? option.code : option" v-for="option of widgetConfig.range" :key="option.hasOwnProperty('code') ? option.code : option" :disabled="option.hasOwnProperty('disabled')?option.disabled:false">{{ option.hasOwnProperty('name') ? option.name : option }}</a-select-option>
            </a-select>
            <a-select  v-else-if="widgetConfig.mode==='tags'" :maxTagCount="2" mode="tags" :value="currentValue" :disabled="disabled" :size="widgetConfig.size" @change="val => handleChange(val)" @focus="e => handleFocus(e)" class="fullWidth">
                <a-select-option :value="option" v-for="option of currentValue" :key="option">{{ option }}</a-select-option>
            </a-select>
        </template>
        <c-upload v-else-if="widget === 'Upload'" :value="currentValue" :disabled="disabled" :placeholder="widgetConfig.placeholder" @change="val => handleChange(val)" @focus="e => handleFocus(e)"></c-upload>
        <c-picker-icon v-else-if="widget === 'PickerIcon'" :value="currentValue" :disabled="disabled" :placeholder="widgetConfig.placeholder" :bg-color="widgetConfig.bgColor" @change="val => handleChange(val)" @focus="e => handleFocus(e)"></c-picker-icon>
        <c-editor v-else-if="widget === 'Editor'" :value="currentValue" :disabled="disabled" :placeholder="widgetConfig.placeholder" @change="val => handleChange(val)" @focus="e => handleFocus(e)" class="fullWidth"></c-editor>
        <c-table v-else-if="widget === 'Table'"  :value="currentValue" :disabled="disabled" :actions-disabled="widgetConfig.actionsDisabled" :buttons="widgetConfig.buttons" :buttons-disabled="widgetConfig.buttonsDisabled" :placeholder="widgetConfig.placeholder" @change="val => handleChange(val)" @focus="e => handleFocus(e)" editable :mode="widgetConfig.mode?widgetConfig.mode:'Table'" :scroll="widgetConfig.scroll" :columns="widgetConfig.columns" class="fullWidth" :before-add="widgetConfig.before?widgetConfig.before['add']:false" :before-copy="widgetConfig.before?widgetConfig.before['copy']:false" :before-remove="widgetConfig.before?widgetConfig.before['remove']:false" @add="widgetConfig.on?widgetConfig.on['add']:()=>{}" @copy="widgetConfig.on?widgetConfig.on['copy']:()=>{}" @remove="widgetConfig.on?widgetConfig.on['remove']:()=>{}"></c-table>
    </div>
</template>

<script>
import CTable from "../CTable/CTable";
export default {
    name: "CWidget",
    components: {CTable},
    props:{
        value: {
            type: [String,Number,Array,Boolean,Object]
        },
        disabled:{
            type:Boolean,
            default:false
        },
        widget: {
            type: String,
            default:'String'
        },
        widgetConfig:{
            type: Object,
            default:()=>{
                return {
                    size:'default',
                    placeholder:'',
                }
            }
        }
    },
    created() {
        this.setCurrentValue(this.value)
    },
    data(){
        return {
            currentValue:''
        }
    },
    watch: {
        value: {
            async handler(val) {
                this.setCurrentValue(val)
            },
            deep: true
        }
    },
    methods:{
        setCurrentValue(value){
            this.currentValue=value;
        },
        handleChange(value){
            this.$emit('input',value);
            this.$emit('change',value)
        },
        handleFocus(e){
            this.$emit('focus',e)
        }
    }
}
</script>

<style scoped>
.fullWidth {
    width: 100%;
}
</style>