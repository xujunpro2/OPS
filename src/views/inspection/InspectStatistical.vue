<template>
	<div class="rootDiv" style="background-color: rgb(240, 242, 245);">
        <inspect-lab-card @handClick="onLabClick"></inspect-lab-card>
        <el-row style="padding-left:20px;padding-right:20px">
            <el-table v-loading="tableLoading"  :data="tableData" style="width: 100%;">
                <el-table-column prop="taskCode" label="任务编号" width="180px" align="center"></el-table-column>
                <el-table-column prop="taskName" label="任务名称" header-align="center"></el-table-column>
                <el-table-column prop="memberNames" label="巡查人员" align="center">
                    <template slot-scope="scope">
                        <span v-html="getMemberNames(scope.row)"></span>
                    </template>
                </el-table-column>
                <el-table-column prop="createTime" label="创建时间" width="140px" align="center">
                    <template slot-scope="scope">
                        {{timestampFormat(scope.row.createTime,'yyyy-MM-dd hh:mm')}}
                    </template>
                </el-table-column>
                <el-table-column prop="sendTime" label="派单时间" width="140px" align="center">
                    <template slot-scope="scope">
                        {{timestampFormat(scope.row.sendTime,'yyyy-MM-dd hh:mm')}}
                    </template>
                </el-table-column>
                <el-table-column prop="assignTime" label="接单时间" width="140px" align="center">
                    <template slot-scope="scope">
                        {{timestampFormat(scope.row.assignTime,'yyyy-MM-dd hh:mm')}}
                    </template>
                </el-table-column>
                <el-table-column prop="completTime" label="完成时间" width="140px" align="center">
                    <template slot-scope="scope">
                        {{timestampFormat(scope.row.completTime,'yyyy-MM-dd hh:mm')}}
                    </template>
                </el-table-column>
                <el-table-column v-if="labelCardType == 'exception'" prop="pointName" label="异常点" align="center">
                </el-table-column>
            </el-table>
        </el-row>
        <el-row :gutter="10">
            <el-col :span="12" style="padding-left:20px;padding-top:10px">
                <inspect-dev-exception-top5></inspect-dev-exception-top5>
            </el-col>
            <el-col :span="12" style="padding-right:20px;padding-top:10px">
                <inspect-position-exception-top5></inspect-position-exception-top5>
            </el-col>
        </el-row>
    </div>
</template>

<script>
import InspectLabCard from './components/InspectLabCard'
import InspectDevExceptionTop5 from './components/InspectDevExceptionTop5'
import InspectPositionExceptionTop5 from './components/InspectPositionExceptionTop5'
import CommonTool from '@/utils/commonTool.js'

export default {
    name: "InspectStatistical",
    components:{InspectLabCard,InspectDevExceptionTop5,InspectPositionExceptionTop5},
	data() {
		return {
            labelCardType:'complete',//默认加载已完成
            tableData:[],
            tableLoading:false,
        };
	},
	methods: {
        onLabClick(type){
            this.labelCardType = type
            this.setTabelData()
        },
        setTabelData()
        {
            this.tableLoading = true;
            this.$store.dispatch('insp/statisticalByType',this.labelCardType).then(data=>{
                // console.info(data);
                this.tableData = data;
                this.tableLoading = false;
            }).catch(()=>{
                this.tableLoading = false;
            })
        },
         //表格时间格式化
        timestampFormat(timestamp,formate){
            if(timestamp)
            {
                return CommonTool.formatData(new Date(timestamp),formate)
            }
            return ''
        },
        //表格人员列多人姓名拼接文本
        getMemberNames(row){
            let memberNames = ''
            let members = row.members;
            //任务创建时是没有指派巡检人员的
            if(members)
            {
                members.forEach(item=>{
                    memberNames += item.memberName+"&emsp;"
                })
            }
            return memberNames;
        },
    },
	mounted() {
        this.setTabelData();
    },
	beforeDestroy() {}
};
</script>

<style scoped>

</style>
