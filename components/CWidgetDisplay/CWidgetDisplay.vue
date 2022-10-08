<template>
    <div>
        <span v-if="widget === 'Input' || widget === 'Textarea'" ><a-tooltip placement="top"><template slot="title"><span>{{ value }}</span></template><span>{{ value }}</span></a-tooltip></span>
        <span v-else-if="widget === 'Encrypt'" ><span>{{ value ? '******' : '' }}</span></span>
        <span v-else-if="widget === 'InputNumber'" ><a-tooltip placement="top"><template slot="title"><span>{{ value }}</span></template><span>{{ value ? value : 0 }}</span></a-tooltip></span>
        <span v-else-if="widget === 'Switch'" size="small" ><a-switch :checked="value || false" disabled/></span>
        <span v-else-if="widget === 'Month'" >{{ $clap.moment(value).format('YYYY-MM') }}</span>
        <span v-else-if="widget === 'Date'" >{{ value ? $clap.moment(value).format('YYYY-MM-DD') : '' }}</span>
        <span v-else-if="widget === 'Range'" >{{value[0] && value[1] ? $clap.moment(value[0]).format('YYYY-MM') - $clap.moment(value[1]).format('YYYY-MM') : '' }}</span>
        <span v-else-if="widget === 'Week'" >{{ value }}</span>
        <span v-else-if="widget === 'Time'" >{{ $clap.moment(value).format('h:mm:ss a') }}</span>
        <span v-else-if="widget === 'Radio'"  :style="{ color: range[0]&&range[0].color?range[0].color:'#000' }">{{range[0]&&range[0].name }}</span>
        <span v-else-if="widget === 'Checkbox'" ><span v-for="(tag,index) of range" :key="index" :style="{ color: tag.color?tag.color:'#000' }">{{ tag.name }}</span></span>
        <template v-else-if="widget === 'Select'">
            <span v-if="!widgetConfig.hasOwnProperty('mode')||widgetConfig.mode==='default'"  :style="{ color: range[0]&&range[0].color?range[0].color:'#000' }">{{range[0]&&range[0].name }}</span>
            <span v-else-if="widgetConfig.mode==='multiple'" ><span v-for="(tag,index) of range" :key="index" :style="{ color: tag.color?tag.color:'#000' }">{{ tag.name }}</span></span>
            <span v-else-if="widgetConfig.mode==='tags'" ><a-tag v-for="item of value" :key="item">{{ item }}</a-tag></span>
        </template>
        <span v-else-if="widget === 'PickerColor'" ><a-tag :color="value">{{ value }}</a-tag></span>
        <span v-else-if="widget === 'PickerIcon'" ><c-icon :type="value"></c-icon></span>
        <span v-else-if="widget === 'SingleUpload'" ><a @click.stop="$core.file.fileViewer(value)" v-if="value">预览</a><span v-else>暂无</span></span>
        <span v-else-if="widget === 'MultiUpload'" ><a @click.stop="$core.file.filesViewer(value)" v-if="value.length > 0">预览</a><span v-else>暂无</span></span>
        <c-editor v-else-if="widget === 'RichTextEditor'" :value="value" disabled modal></c-editor>
    </div>
</template>

<script>
export default {
    name: "CWidgetDisplay",
    props:{
        value: {
            type: [String,Number,Array,Boolean,Object]
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
                    placeholder:''
                }
            }
        }
    },
    computed:{
        range(){
            if(this.widget==='Radio'){
                if(this.widgetConfig.range[0]&&this.widgetConfig.range[0].hasOwnProperty('code')){
                    return this.widgetConfig.range.filter(item=>item.code===this.value)
                }else{
                    return this.widgetConfig.range.filter(item=>item===this.value).map(item=>{return {color:undefined,name:item}})
                }
            }else if (this.widget==='Checkbox'){
                if(this.widgetConfig.range[0]&&this.widgetConfig.range[0].hasOwnProperty('code')){
                    return this.widgetConfig.range.filter(item=>this.value.includes(item.code))
                }else{
                    return this.widgetConfig.range.filter(item=>this.value.includes(item)).map(item=>{return {color:undefined,name:item}})
                }
            }
            else{
                return []
            }
        }
    },
    methods:{

    }
}
</script>

<style scoped>

</style>