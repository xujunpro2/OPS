<template>
    <div>
        <label class="title">本月巡检设备异常排名前五</label>
        <el-table v-loading="loading" :data="tableData" style="width: 100%;padding-top: 15px;margin-top:5px">
            <el-table-column width="70"  label="名次" prop="sn"></el-table-column>
            <el-table-column  label="设备名称" prop="devName" align="center"></el-table-column>
            <el-table-column  label="设备编码" prop="devCode" align="center"></el-table-column>
            <el-table-column  label="异常次数" align="center">
                <template slot-scope="scope">
                <el-progress :percentage="scope.row.countPercent" :show-text="false"></el-progress>
                </template>
            </el-table-column>
            <el-table-column width="40" prop="exceptionCount" align="center">
            </el-table-column>
        </el-table>
    </div>
    
</template>

<script>
export default {
	name: "InspectDevExceptionTop5",
	data() {
		return {
            loading:false,
            tableData:[
                // {sn:'第一名',cameraName:'金水牌口摄像头',cameraIndexCode:'dce03e98c2aa44169a8c9694d40139b6',countPercent:50,count:2},
                // {sn:'第二名',cameraName:'金水牌口摄像头',cameraIndexCode:'dce03e98c2aa44169a8c9694d40139b6',countPercent:50,count:2},
                // {sn:'第三名',cameraName:'金水牌口摄像头',cameraIndexCode:'dce03e98c2aa44169a8c9694d40139b6',countPercent:50,count:2},
                // {sn:'第四名',cameraName:'金水牌口摄像头',cameraIndexCode:'dce03e98c2aa44169a8c9694d40139b6',countPercent:50,count:2},
                // {sn:'第五名',cameraName:'金水牌口摄像头',cameraIndexCode:'dce03e98c2aa44169a8c9694d40139b6',countPercent:50,count:2}
            ]
        };
	},
	methods: {
        getTop5(){
            this.loading = true
            this.$store.dispatch('insp/devExceptionTop5').then(data=>{
                this.tableData = data;
                this.loading = false;
            }).catch(()=>{
                this.loading = false;
            })
        }
    },
	mounted() {
        this.getTop5();
    },
	beforeDestroy() {}
};
</script>

<style scoped>
.title{
    color:#0e91d0;
    font-size: 18px;
    font-weight: 400;
}
</style>
