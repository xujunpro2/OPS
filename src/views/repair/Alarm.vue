<template>
	<div class="rootDiv">
         <el-form :inline="true" ref="queryForm" :model="queryForm" label-width="80px">
             <el-form-item label="告警时间">
                 <el-date-picker v-model="queryForm.createTime" type="datetimerange" range-separator="至"
                     start-placeholder="开始日期" end-placeholder="结束日期">
                 </el-date-picker>
             </el-form-item>
             <el-form-item label="设备类型">
                 <el-select v-model="queryForm.devType" filterable placeholder="请选择" style="width: 100%;">
                     <el-option v-for="item in queryTypeOptions" :key="item.devTypeId" :label="item.devTypeName"
                         :value="item.devTypeId"></el-option>
                 </el-select>
             </el-form-item>

             <el-form-item>
                 <el-button type="primary" @click="onQuery" icon="el-icon-search">查询</el-button>
             </el-form-item>
         </el-form>

        <el-table v-loading="loading" border :data="tableData" tooltip-effect="dark" style="width: 100%">
            <el-table-column prop="createTime" label="告警时间" align="center">
                <template slot-scope="scope">
                    {{getTimeStr(scope.row.createTime)}}
                </template>
            </el-table-column>
			<el-table-column prop="spaceName" label="区域" align="center"></el-table-column>
			<el-table-column prop="devName" label="设备" align="center"></el-table-column>
            <el-table-column prop="alarmType" label="告警类型" align="center">
                <template slot-scope="scope">
                    <span v-if="scope.row.alarmType == 1">运行告警</span>
                    <span v-if="scope.row.alarmType == 2">越限告警</span>
                </template>
            </el-table-column>
            <el-table-column prop="alarmLevel" label="紧急程度" align="center">
                <template slot-scope="scope">
                    <span v-if="scope.row.alarmLevel == 1">紧急</span>
                    <span v-if="scope.row.alarmLevel == 2">重要</span>
                    <span v-if="scope.row.alarmLevel == 3">次要</span>
                    <span v-if="scope.row.alarmLevel == 4">提示</span>
                </template>
            </el-table-column>
            <el-table-column prop="excuteState" label="状态" align="center">
                <template slot-scope="scope">
                    <span v-if="scope.row.excuteState == 1">待确认</span>
                    <span v-if="scope.row.excuteState == 2">已确认</span>
                </template>
            </el-table-column>
            <el-table-column prop="falsePositives" label="派单" align="center">
                <template slot-scope="scope">
                    <span v-if="scope.row.inspTaskId == null">未派单</span>
                    <span v-if="scope.row.inspTaskId != null">已派单</span>
                </template>
            </el-table-column>
            <el-table-column prop="falsePositives" label="巡检结论" align="center">
                <template slot-scope="scope">
                    <span v-if="scope.row.falsePositives == -1">待确认</span>
                    <span v-if="scope.row.falsePositives == 0">确认故障</span>
                    <span v-if="scope.row.falsePositives == 1" class="redFont">误报</span>
                </template>
            </el-table-column>
            <el-table-column label="操作" align="center">
                <template slot-scope="scope">
                    <el-tooltip v-if="scope.row.inspTaskId == null" effect="dark" content="派单" placement="bottom">
                        <el-button icon="el-icon-user" circle @click="onInsp(scope.row)"></el-button>
                    </el-tooltip>
                    <el-tooltip v-if="scope.row.inspTaskId != null" effect="dark" content="处理信息" placement="bottom">
                        <el-button icon="el-icon-view" circle @click="onView(scope.row)"></el-button>
                    </el-tooltip>
                </template>
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

        <!--确认告警对话框-->
        <el-dialog title="巡检任务" :visible.sync="taskDialogVisible"  width="400px" :close-on-click-modal="false">
            <el-form ref="taskForm" :model="taskForm" :rules="taskFormRules"  label-width="80px" >
                <el-form-item label="任务编号"  prop="taskCode">
                    <el-input v-model="taskForm.taskCode" ></el-input>
                </el-form-item>
                <el-form-item label="任务名称"  prop="taskName">
                    <el-input v-model="taskForm.taskName"></el-input>
                </el-form-item>
                <el-form-item label="巡检设备">
                    {{formDevName}}
                </el-form-item>
                <el-form-item label="备注">
                    <el-input v-model="taskForm.remark"></el-input>
                </el-form-item>
            </el-form>
            <!--默认巡检人员-->
            <el-card class="box-card" style="height:100%;margin-top:5px">
				<div slot="header" class="clearfix">
						<span class="cardTitie">巡检人员</span>
						<el-button style="float: right;" icon="el-icon-user" @click="openMemberDialog">设置人员</el-button>
				</div>
                <el-tag v-for="tag in this.members"  :key="tag.memberId">
                        {{tag.memberName}}
                </el-tag>
            </el-card>
            <span slot="footer" class="dialog-footer">
                <el-button  @click="taskDialogVisible = false">取 消</el-button>
                <el-button  type="primary" @click="onTaskSubmit">确 定</el-button>
            </span>
        </el-dialog>

         <!--人员对话框-->
        <select-member-dialog ref="selectMemberDialog" @selected="onMemberDialogSelected" memberType="inspect"></select-member-dialog>

        <el-dialog v-loading="recordLoading" title="设备告警处理信息" :visible.sync="recordDialogVisible"  width="60%"  :close-on-click-modal="false">
             <!--确认信息-->
            <el-row v-if="excuteInfo != null">
                <img v-if="excuteInfo.recordPass == 1" style="float: right;"  src="img/pass.png"></img>
                <img v-if="excuteInfo.recordPass == 2" style="float: right;" src="img/noPass.png"></img>
            </el-row>
            <!--流程-->
            <el-row v-if="excuteInfo != null">
                <el-steps direction="horizontal" process-status="finish"
                    :active="nextStepIndex" finish-status="finish">
                    <el-step :title="excuteInfo.sendOrder">
                        <template slot="description">
                            <span v-html="excuteInfo.sendOrderDesc"></span>
                        </template>
                    </el-step>
                    <el-step v-if="excuteInfo.assginOrder != null" :title="excuteInfo.assginOrder">
                        <template slot="description">
                            <span v-html="excuteInfo.assginOrderDesc"></span>
                        </template>
                    </el-step>
                    <el-step v-if="excuteInfo.taskPoint != null" :title="excuteInfo.taskPoint">
                        <template slot="description">
                            <span v-html="excuteInfo.taskPointDesc"></span>
                        </template>
                    </el-step>
                    <el-step v-if="excuteInfo.exception != null" :title="excuteInfo.exception">
                        <template slot="description">
                            <span v-html="excuteInfo.exceptionDesc"></span>
                        </template>
                    </el-step>
                    <el-step v-if="excuteInfo.repair != null" :title="excuteInfo.repair">
                        <template slot="description">
                            <span v-html="excuteInfo.repairDesc"></span>
                        </template>
                    </el-step>
                </el-steps>
            </el-row>
             <!--异常信息-->
            <el-row v-if="excuteInfo != null && excuteInfo.recordPass ==2" style="margin-top:10px">
                <el-card class="box-card" style="height:100%;margin-top:5px">
                    <div slot="header" class="clearfix">
						<span class="cardTitie">故障信息</span>
				    </div>
                    <el-form label-width="80px" >
                        <el-form-item label="故障描述:" style="margin-bottom: 5px;">
                            {{excuteInfo.exceptionContext}}
                        </el-form-item>
                        <!--如果是简易处理，那么显示处理信息-->
                        <el-form-item v-if="excuteInfo.simpleExcuteContent != null" label="处理方式:" style="margin-bottom: 5px;">
                            {{excuteInfo.simpleExcuteContent}}
                        </el-form-item>
                        <el-form-item v-if="excuteInfo.images != null" label="现场照片:" style="margin-bottom: 5px;">
                            <el-image v-for="(url,index) in excuteInfo.images" :key="index" style="width: 100px; height: 100px;margin:3px" :src="url" :preview-src-list="[url]">
                                <!--图片未加载的占位内容-->
                                <div slot="placeholder" class="image-solt"><i class="el-icon-loading"></i></div>
                                <!--加载失败的内容-->
                                <div slot="error" class="image-solt"><i class="el-icon-picture-outline"></i> </div>
                            </el-image>
                        </el-form-item>
                    </el-form>
                </el-card>
                
            </el-row>
        </el-dialog>
    </div>
</template>

<script>
import CommonTool from '@/utils/commonTool.js'
import SelectMemberDialog from '@/components/Dev/SelectMemberDialog'
export default {
    name: "Alarm",
    components:{SelectMemberDialog},
	data() {
		return {
            queryForm:{
                devName:null,
                createTime:[],//时间范围是一个数组绑定对象
                devType:null,
            },
            query:null,//查询参数，这里因为queryForm.createTime需要处理，统一在query()中生产该对象
            queryTypeOptions:[],

            //表格
            loading:false,
            tableData:[],
            pageSizeList:this.$store.state.settings.pageSizeList, //分页列表
            total:0,

            curRow:null,
            //巡检派单对话框
            taskDialogVisible:false,
            taskForm:{
                alarmId:null,
                taskCode:null,
                taskName:null,
                devCode:null,
                devName:null,
                remark:null//备注
            },
            members:[],//指派人
            taskFormRules:{
                taskCode: [
                    { required: true, message: '请输入任务编号', trigger: 'blur' }
                ],
                taskName: [
                    { required: true, message: '请输入任务名称', trigger: 'blur' }
                ],
            },

            recordDialogVisible:false,
            recordLoading:false,
            excuteInfo:null,
            nextStepIndex:0,//派单
        };
    },
    computed:{
        pageSize() {
            return this.$store.state.settings.pageSize
        },
        formDevName(){
            return " "+this.taskForm.devCode+" "+this.taskForm.devName
        }
    },
	methods: {
        //派单对话框提交
        onTaskSubmit(){
            if(this.members.length == 0)
            {
                this.$alert("请设置巡检人员!", "提示", {confirmButtonText: "确定",type: "danger"});
                return;
            }
            let param = {
                alarmId:this.taskForm.alarmId,
                taskCode:this.taskForm.taskCode,
                taskName:this.taskForm.taskName,
                remark:this.taskForm.remark,
                devCode:this.taskForm.devCode,
                devName:this.taskForm.devName,
                members:this.members
            }
            this.$store.dispatch('alarm/addTask',param).then(data=>{
                if(data)
                {
                    this.initTable();
                    this.$notify({title: '消息',message: '派单成功',type: 'success',duration:3000});
                }
            })
        },
        onInsp(row){
            this.taskDialogVisible = true

            this.taskForm.alarmId = row.alarmId
            this.taskForm.taskCode = 'XJ'+CommonTool.formatData(new Date(),'yyyyMMddhhmmss');
            this.taskForm.taskName = row.devName+"告警确认"
            this.taskForm.devCode = row.devCode
            this.taskForm.devName = row.devName
        },
        onView(row){
            this.recordDialogVisible = true
            this.recordLoading = true
            let alarmId = row.alarmId
            this.$store.dispatch('alarm/excuteInfo',alarmId).then(data=>{
                this.recordLoading = false
                //将data中包含的故障图片url处理一下
                if(data && data.exceptionImagePath && data.exceptionImagePath.trim() != "")
                {
                    let images = [];
                    let pathSubs = data.exceptionImagePath.split(',');
                    pathSubs.forEach(sub=>{
                        let subUrl = this.$store.state.settings.uploadStore+sub
                        images.push(subUrl);
                    })
                    data.images = images;
                }
                this.excuteInfo = data
                this.setExcuteInfo()
            })
        },
        onQuery(){
           this.initTable();
        },
        sizeChange(rows){
            this.$store.dispatch('settings/changePageSize',rows);
            this.tabelPagin(1);
        },
        //分页事件
        paginChange(curPage) {
			this.tabelPagin(curPage);
        },
        //初始化Table
        initTable(){
            this.loading = true;
            //入库时间范围
            let createStart = null;
            let start = this.queryForm.createTime[0]
            if(start)
            {
                createStart = start.getTime();
            }
            let createEnd = null;
            let end = this.queryForm.createTime[1]
            if(end)
            {
                createEnd = end.getTime();
            }
            //初始化参数
            this.query = {
                devType:this.queryForm.devType,
                beginTime:createStart,
                endTime:createEnd,
            }
            this.$store.dispatch("alarm/count",this.query).then(data => {
                this.total = data;
                this.tabelPagin(1);
            })
        },
        //分页控件事件,curPage从第一页开始
        tabelPagin(curPage){
            //分页
            let startIndex = (curPage - 1) * this.pageSize;
            this.query.startIndex = startIndex;
            this.query.rows = this.pageSize;
            this.$store.dispatch("alarm/page",this.query).then(data => {
                this.tableData = data;
                this.loading = false;
            }).catch(()=>{
                this.loading = false;
            })
        },
        //初始化设备类型Options
		initTypeOptions() {
            this.queryTypeOptions.push({devTypeId:null,devTypeName:'全部'});
			this.$store.dispatch("dev/getDevTypeList").then(data => {
                this.typeOptions = data;
				data.forEach(item=>{
                    this.queryTypeOptions.push(item);
                })
			});
        },
        //打开人员选择对话框
        openMemberDialog(){
            this.$refs.selectMemberDialog.dialogVisible = true;
        },
        //人员选择对话框确定完成
        onMemberDialogSelected(members){
            this.members = members
        },
        
        getTimeStr(timestamp){
            if(timestamp)
            {
                let time = new Date(timestamp);
                return CommonTool.formatData(time,'yyyy-MM-dd hh:mm:ss')
            }
            return ''
        },

        setExcuteInfo(){
            if(this.excuteInfo)
            {
                //计算completedIndex
                if(this.excuteInfo.assginOrder)//接单节点
                {
                    this.nextStepIndex = 1
                }
                if(this.excuteInfo.taskPoint)//巡检节点
                {
                    this.nextStepIndex = 2
                }
                if(this.excuteInfo.exception)//故障节点
                {
                    this.nextStepIndex = 3
                }
                if(this.excuteInfo.repair)//检修节点
                {
                    this.nextStepIndex = 4
                }
            }
        },

    },
	mounted() {
        this.initTypeOptions();
        this.initTable();
    },
	beforeDestroy() {}
};
</script>

<style scoped>
.cardTitie {
	margin-left: 10px;
	font-size: 16px;
	font-weight: 500;
	color: #409eff;
	line-height: 30px;
}
.image-solt{
    width: 150px;
    height: 100px;
    text-align: center;
    line-height: 110px; 
    background: #f5f7fa;
    color: #909399;
}
.image-solt i{
    margin-left: -50px;
    font-size: 30px;
}
</style>
