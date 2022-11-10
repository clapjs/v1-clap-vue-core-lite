<template>
    <div style="padding: 12px">
        <a-row type="flex" justify="center" :gutter="12" v-for="(stages, index) of currentValue" :key="'or' + index" align="bottom">
            <a-col :span="22">
                <a-row :gutter="4" style="margin-top: 6px" type="flex" justify="center" v-for="(stage, cIndex) of stages" :key="'and' + cIndex">
                    <a-col :span="2">
                        <a-icon type="minus" style="margin: 10px" @click="remove(index, cIndex)" v-if="stages.length > 1 || currentValue.length > 1" />
                    </a-col>
                    <a-col :span="8">
                        <c-widget :style="style" v-model="stage.key" widget="Select" :widgetConfig="{mode:'tree',treeData:$clap.helper.listToTree(fields,0)}" @change="val => onChange(val, stage)" />
                    </a-col>
                    <a-col :span="4">
                        <a-select v-model="stage.symbol" :style="style" @change="() => onChange(stage.key, stage)">
                            <a-select-option v-for="symbol in stage.symbols" :value="symbol.value" :key="symbol.value">{{ symbol.label }}</a-select-option>
                        </a-select>
                    </a-col>
                    <a-col :span="8" v-if="stage.key">
                        <c-widget :style="style" v-model="stage.value" :widget="stage.widget" :widgetConfig="stage.widgetConfig"  v-else />
                    </a-col>
                    <a-col :span="2">
                        <a-button type="primary" ghost @click="stages.push(defaultValue)">且</a-button>
                    </a-col>
                </a-row>
            </a-col>
            <a-col :span="2">
                <a-button type="danger" ghost @click="currentValue.push([defaultValue])">或</a-button>
            </a-col>
            <a-divider v-if="index < currentValue.length - 1">或</a-divider>
        </a-row>
    </div>
</template>

<script>
export default {
    name: 'CFilterEditor',
    components: {
        VNodes: {
            functional: true,
            render: (h, ctx) => ctx.props.vnodes
        }
    },
    data() {
        return {
            style: { width: '100%' },
            currentValue: [[{ field: { widget: 'String' }, symbol: '$eq' }]],
            defaultValue: {
                widget: 'Input',
                key: '',
                symbol: '$eq',
                symbols: [
                    { value: '$eq', label: '等于' },
                    { value: '$ne', label: '不等于' },
                ],
                value: ''
            }
        }
    },
    props: {
        value: {
            type: Array,
            default: function () {
                return []
            }
        },
        fields: {
            type: Array,
            default: function () {
                return []
            }
        }
    },
    watch: {
        value: {
            //深度监听，可监听到对象、数组的变化
            handler() {
                this.setCurrentValue()
            },
            deep: true //true 深度监听
        }
    },
    mounted() {
        if (this.value) {
            this.setCurrentValue()
        }
    },
    methods: {
        setCurrentValue() {
            this.currentValue = this.value.length > 0 && this.value[0].length > 0 ? this.value : [[this.defaultValue]]
        },
        handleInput() {
            this.currentValue = JSON.parse(JSON.stringify(this.currentValue))
            this.$emit('input', this.currentValue)
        },
        onChange(key, stage) {
            const field = this.fields.filter(item => item.field === key)[0];
            stage.widget=field.widget;
            stage.widgetConfig={};
            if (['Input', 'Textarea','Editor'].includes(stage.widget)) {
                stage.symbols = [{ value: '$regex', label: '包含字符' }, { value: '$neRegex', label: '不包含字符' }, { value: '$lRegex', label: '左包含字符' }, { value: '$rRegex', label: '右包含字符' }, { value: '$lNeRegex', label: '左不包含字符' }, { value: '$rNeRegex', label: '右不包含字符' }, ...this.defaultValue.symbols]
            } else if (['Number', 'Month', 'Week', 'Date', 'Time'].includes(stage.widget)) {
                stage.symbols = [{ value: '$gt', label: '大于' }, { value: '$lt', label: '小于' }, { value: '$gte', label: '大于等于' }, { value: '$lte', label: '小于等于' }, ...this.defaultValue.symbols]
            } else if (['Radio', 'Checkbox', 'Select', 'SelectRefer'].includes(stage.widget)) {
                if (['Radio', 'Checkbox', 'Select',].includes(stage.widget)){
                    stage.widgetConfig.range=field.idEnum.range
                }
                else{
                    stage.widgetConfig={...stage.widgetConfig,...field.refer?field.refer:field.idRefer}
                }
                stage.symbols = [...this.defaultValue.symbols,{ value: '$in', label: '等于值域' },{ value: '$nin', label: '不等于值域'}]
            } else if (['Switch'].includes(stage.widget)) {
                stage.symbols = [...this.defaultValue.symbols]
            } else {
                stage.symbols = [...this.defaultValue.symbols]
            }
            delete stage.value
            stage.value = ['$in', '$nin'].includes(stage.symbol) ? [] : ''
            this.handleInput()
        },
        onDeselect(value, stage) {
            stage.range.splice(stage.range.indexOf(value), 1)
            this.handleInput()
        },
        remove(indexX, indexY) {
            if (this.currentValue[indexX].length === 1) {
                this.currentValue.splice(indexX, 1)
            } else {
                this.currentValue[indexX].splice(indexY, 1)
            }
        }
    }
}
</script>

<style scoped></style>
