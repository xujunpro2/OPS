<template>
    <div>
        <label class="title">昨日误报排名</label>
        <el-table :data="tableData" style="width: 100%;padding-top: 15px;">
            <el-table-column width="70"  label="名次" prop="sn"></el-table-column>
            <el-table-column  label="设备名称" prop="cameraName" align="center"></el-table-column>
            <el-table-column  label="设备编号" prop="cameraIndexCode" align="center"></el-table-column>
            <el-table-column  label="误报次数" align="center">
                <template slot-scope="scope">
                <el-progress :percentage="scope.row.countPercent" :show-text="false"></el-progress>
                </template>
            </el-table-column>
            <el-table-column width="20" prop="count">
            </el-table-column>
        </el-table>
    </div>
    
</template>

<script>
export default {
	name: "IrruptExceptionTop5",
	data() {
		return {
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
            this.$store.dispatch('camera/yesterdayTop5').then(data=>{
                this.tableData = data;
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
