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
                        <a-button type="primary" ghost @click="stages.push(defaultValue)">δΈ</a-button>
                    </a-col>
                </a-row>
            </a-col>
            <a-col :span="2">
                <a-button type="danger" ghost @click="currentValue.push([defaultValue])">ζ</a-button>
            </a-col>
            <a-divider v-if="index < currentValue.length - 1">ζ</a-divider>
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
                    { value: '$eq', label: 'η­δΊ' },
                    { value: '$ne', label: 'δΈη­δΊ' },
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
            //ζ·±εΊ¦ηε¬οΌε―ηε¬ε°ε―Ήθ±‘γζ°η»ηεε
            handler() {
                this.setCurrentValue()
            },
            deep: true //true ζ·±εΊ¦ηε¬
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
                stage.symbols = [{ value: '$regex', label: 'εε«ε­η¬¦' }, { value: '$neRegex', label: 'δΈεε«ε­η¬¦' }, { value: '$lRegex', label: 'ε·¦εε«ε­η¬¦' }, { value: '$rRegex', label: 'ε³εε«ε­η¬¦' }, { value: '$lNeRegex', label: 'ε·¦δΈεε«ε­η¬¦' }, { value: '$rNeRegex', label: 'ε³δΈεε«ε­η¬¦' }, ...this.defaultValue.symbols]
            } else if (['Number', 'Month', 'Week', 'Date', 'Time'].includes(stage.widget)) {
                stage.symbols = [{ value: '$gt', label: 'ε€§δΊ' }, { value: '$lt', label: 'ε°δΊ' }, { value: '$gte', label: 'ε€§δΊη­δΊ' }, { value: '$lte', label: 'ε°δΊη­δΊ' }, ...this.defaultValue.symbols]
            } else if (['Radio', 'Checkbox', 'Select', 'SelectRefer'].includes(stage.widget)) {
                if (['Radio', 'Checkbox', 'Select',].includes(stage.widget)){
                    stage.widgetConfig.range=field.idEnum.range
                }
                else{
                    stage.widgetConfig={...stage.widgetConfig,...field.refer?field.refer:field.idRefer}
                }
                stage.symbols = [...this.defaultValue.symbols,{ value: '$in', label: 'η­δΊεΌε' },{ value: '$nin', label: 'δΈη­δΊεΌε'}]
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
