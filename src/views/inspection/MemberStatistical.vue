<template>
	<div class="rootDiv">
        <el-form :inline="true"  :model="queryForm" label-width="100px">
            <el-form-item label="巡查人员">
                <el-select v-model="queryForm.memberId"  placeholder="请选择" style="width: 100%;">
                    <el-option v-for="item in memberOptions" :key="item.memberId" :label="item.memberName"
                        :value="item.memberId"></el-option>
                </el-select>
            </el-form-item>
            <el-form-item label="派单日期">
                 <el-date-picker v-model="queryForm.sendTime" type="daterange" range-separator="至"
                    start-placeholder="开始日期" end-placeholder="结束日期">
                </el-date-picker>
            </el-form-item>
            <el-form-item>
                <el-button type="primary" @click="onQuery" icon="el-icon-search">查询</el-button>
            </el-form-item>
        </el-form>
        <member-lab-card ref="labCard"></member-lab-card>
        <!--巡检任务分页表格-->
        <el-table v-loading="loading" border :data="tableData" style="width: 100%;">
            <el-table-column prop="taskCode" label="任务编号" width="180px" align="center"></el-table-column>
			<el-table-column prop="taskName" label="任务名称" header-align="center"></el-table-column>
            <el-table-column prop="taskState" label="状态" width="100px" align="center">
                 <template slot-scope="scope">
                    <span v-if="scope.row.taskState==-1" style="color:#F56C6C">已过期</span>
                    <span v-if="scope.row.taskState==0">创建</span>
                    <span v-if="scope.row.taskState==1">已派单</span>
                    <span v-if="scope.row.taskState==2">进行中</span>
                    <span v-if="scope.row.taskState==3">已完成 </span>
                </template>
            </el-table-column>
            
            <el-table-column prop="createTime" label="创建时间" align="center">
                <template slot-scope="scope">
                    {{timestampFormat(scope.row.createTime,'yyyy-MM-dd hh:mm')}}
                </template>
            </el-table-column>
            <el-table-column prop="sendTime" label="派单时间" align="center">
                <template slot-scope="scope">
                    {{timestampFormat(scope.row.sendTime,'yyyy-MM-dd hh:mm')}}
                </template>
            </el-table-column>
            <el-table-column prop="assignTime" label="接单时间"  align="center">
                <template slot-scope="scope">
                    {{timestampFormat(scope.row.assignTime,'yyyy-MM-dd hh:mm')}}
                </template>
            </el-table-column>
            <el-table-column prop="completTime" label="完成时间"  align="center">
                <template slot-scope="scope">
                    {{timestampFormat(scope.row.completTime,'yyyy-MM-dd hh:mm')}}
                </template>
            </el-table-column>
            <el-table-column prop="exceptionPointCont" label="异常点" align="center">
            </el-table-column>
        </el-table>

        <el-row type="flex" justify="end" style="background:#fff">
            <el-pagination background layout="total, sizes, prev, pager, next" 
                :page-sizes="pageSizeList"
                :page-size="pageSize"  
                :total="total"
                @size-change="sizeChange"
                @current-change="paginChange">
            </el-pagination>
        </el-row>
    </div>
</template>

<script>
import CommonTool from '@/utils/commonTool.js'
import MemberLabCard from './components/MemberLabCard'
export default {
    name: "MemberStatistical",
    components:{MemberLabCard},
	data() {
		return {
            queryForm:{
                memberId:null,
                sendTime:[],
            },
            query:null,//查询参数，这里因为queryForm.sendTime需要处理，统一在query()中生产该对象
            memberOptions:[],

             //表格
            loading:false,
            tableData:[],
            pageSizeList:this.$store.state.settings.pageSizeList, //分页列表
            total:0,
        };
    },
     computed:{
        pageSize() {
            return this.$store.state.settings.pageSize
        },
    },
	methods: {
        initMemberOptions(){
            this.memberOptions.length = 0;
            this.$store.dispatch('system/allMember','inspect').then(data=>{
                data.forEach(item=>{
                    this.memberOptions.push({memberId:item.memberId,memberName:item.memberName})
                })
            })
        },
        onQuery(){
            this.initTable();
            this.$refs.labCard.setLabCardValues(this.query)
        },

        sizeChange(rows){
            this.$store.dispatch('settings/changePageSize',rows);
            this.tabelPagin(1);
        },
        //分页事件
        paginChange(curPage) {
			this.tabelPagin(curPage);
        },
         //分页控件事件,curPage从第一页开始
        tabelPagin(curPage){
             //分页
            let startIndex = (curPage - 1) * this.pageSize;
            this.query.startIndex = startIndex;
            this.query.rows = this.pageSize;
            this.$store.dispatch("insp/taskByMemberPage",this.query).then(data => {
                this.tableData = data;
                this.loading = false;
            }).catch(()=>{
                this.loading = false;
            })
        },
        //初始化Table
        initTable(){
            this.loading = true;
            //入库时间范围
            let sendBegin = null;
            let start = this.queryForm.sendTime[0]
            if(start)
            {
                sendBegin = start.getTime();
            }
            let sendEnd = null;
            let end = this.queryForm.sendTime[1]
            if(end)
            {
                sendEnd = end.getTime();
            }
            this.query = {
                memberId:this.queryForm.memberId,
                sendBegin:sendBegin,
                sendEnd:sendEnd
            }
            
            this.$store.dispatch("insp/taskCountByMember",this.query).then(data => {
                this.total = data;
                this.tabelPagin(1);
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

    },
	mounted() {
        this.initMemberOptions();
    },
	beforeDestroy() {}
};
</script>

<style scoped>
</style>
