<template>
    <el-card class="box-card" style="height:100%" :body-style="fullCardBody">
        <div slot="header" class="clearfix">
            <span class="cardTitie">基本信息</span>
        </div>
        <el-form class="basicForm"  :model="basicForm" label-width="80px">
            <el-form-item style="margin-bottom: 14px;" label="生产厂家:">{{basicForm.manufacturer}}</el-form-item>
            <el-form-item style="margin-bottom: 14px;" label="设备型号:">{{basicForm.devCode}}</el-form-item>
            <el-form-item style="margin-bottom: 14px;" label="额定功率:">{{basicForm.power}}<span v-if="basicForm.power != null && basicForm.power !='' ">KW</span></el-form-item>
            <el-form-item style="margin-bottom: 14px;" label="额定电压:">{{basicForm.voltage}}<span v-if="basicForm.voltage != null && basicForm.voltage !='' ">V</span></el-form-item>
            <el-form-item style="margin-bottom: 14px;" label="投运时间:">{{getTimeFormatter(basicForm.usedTime)}}</el-form-item>
            <el-form-item style="margin-bottom: 13px;" label="维修电话:">{{basicForm.phone}}</el-form-item>
        </el-form>
    </el-card>

</template>

<script>
import CommonTool from '@/utils/commonTool.js'
export default {
	name: "DevCard",
	data() {
		return {
            fullCardBody: { height: "100%", overflow: "auto" },
            basicForm:{
                manufacturer:'',
                devCode:'',
                power:'',
                voltage:'',
                usedTime:'',
                phone:''
            }
        };
	},
	methods: {
        //设置信息
        setBasicInfo(info){
            this.basicForm.manufacturer = info.manufacturer
            this.basicForm.devCode = info.devCode
            this.basicForm.power = info.power
            this.basicForm.voltage = info.voltage
            this.basicForm.usedTime = info.usedTime
            this.basicForm.phone = info.phone
        },
        getTimeFormatter(time){
            var date = new Date(time);
            var formatStr = CommonTool.formatData(date,'yyyy-MM-dd');
            return formatStr;
        },
    },
	mounted() {},
	beforeDestroy() {}
};
</script>

<style scoped>
.cardTitie {
	margin-left: 10px;
	color: rgba(0, 0, 0, 0.45);
    font-size: 16px;
    font-weight: bold;
	line-height: 30px;
}
.basicForm{
    color: rgba(0, 0, 0, 0.45);
    font-size: 12px;
}
</style>
