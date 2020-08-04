<template>
    <div>
        <label class="title">本月巡检工程位置异常排名前五</label>
        <el-table v-loading="loading" :data="tableData" style="width: 100%;padding-top: 15px;margin-top:5px">
            <el-table-column width="70"  label="名次" prop="sn"></el-table-column>
            <el-table-column  label="工程位置" prop="positionName" align="center"></el-table-column>
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
	name: "InspectPositionExceptionTop5",
	data() {
		return {
            loading:false,
            tableData:[]
        };
	},
	methods: {
        getTop5(){
            this.loading = true
            this.$store.dispatch('insp/positionExceptionTop5').then(data=>{
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
