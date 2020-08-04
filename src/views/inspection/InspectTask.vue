<template>
	<div class="rootDiv">
         <el-form :inline="true"  :model="queryForm" label-width="100px">
            <el-form-item label="巡查人员">
                <el-select v-model="queryForm.memberId"  placeholder="请选择" style="width: 100%;">
                    <el-option v-for="item in memberOptions" :key="item.memberId" :label="item.memberName"
                        :value="item.memberId"></el-option>
                </el-select>
            </el-form-item>
            <el-form-item label="派单时间">
                <el-date-picker v-model="queryForm.createTime" type="datetimerange" range-separator="至"
                    start-placeholder="开始时间" end-placeholder="结束时间">
                </el-date-picker>
            </el-form-item>
            <el-form-item label="任务状态">
                <el-select v-model="queryForm.taskState" filterable placeholder="请选择" >
                    <el-option v-for="item in queryStateOptions" :key="item.value" :label="item.label"
                        :value="item.value"></el-option>
                </el-select>
            </el-form-item>

            <el-form-item>
                <el-button type="primary" @click="onQuery" icon="el-icon-search">查询</el-button>
            </el-form-item>
            <el-form-item>
                 <el-button type="primary" icon="el-icon-circle-plus-outline" @click="onAdd">新增</el-button>
            </el-form-item>
        </el-form>

         <!--巡检任务分页表格-->
        <el-table v-loading="loading" border :data="tableData" style="width: 100%;">
            <el-table-column prop="taskCode" label="任务编号" align="center"></el-table-column>
			<el-table-column prop="taskName" label="任务名称" align="center"></el-table-column>
            <el-table-column prop="taskState" label="状态" align="center">
                 <template slot-scope="scope">
                    <span v-if="scope.row.taskState==-1" style="color:#F56C6C">已过期</span>
                    <span v-if="scope.row.taskState==0">创建</span>
                    <span v-if="scope.row.taskState==1">已派单</span>
                    <span v-if="scope.row.taskState==2">进行中</span>
                    <span v-if="scope.row.taskState==3">已完成 </span>
                </template>
            </el-table-column>
            <el-table-column prop="memberNames" label="巡查人员" align="center">
                <template slot-scope="scope">
                    <span v-html="getMemberNames(scope.row)"></span>
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
            <el-table-column prop="assignTime" label="接单时间" align="center">
                <template slot-scope="scope">
                    {{timestampFormat(scope.row.assignTime,'yyyy-MM-dd hh:mm')}}
                </template>
            </el-table-column>
            <el-table-column prop="completTime" label="完成时间" align="center">
                <template slot-scope="scope">
                    {{timestampFormat(scope.row.completTime,'yyyy-MM-dd hh:mm')}}
                </template>
            </el-table-column>
            <el-table-column prop="planId" label="计划任务" align="center">
                <template slot-scope="scope">
                    <span v-if="scope.row.planId != null">是</span>
                    <span v-else>否</span>
                </template>
            </el-table-column>
            <el-table-column label="操作" min-width="160px" align="center">
                <template slot-scope="scope">
                    <el-tooltip effect="dark" content="查看巡检记录" placement="bottom">
                        <el-button @click="onView(scope.row)" icon="el-icon-view" circle ></el-button>
                    </el-tooltip>
                    <!--任务状态任务状态 -1已过期 0创建  1已派单  2进行中 3完成   -->
                    <el-tooltip v-if="scope.row.taskState == 0" effect="dark" content="派单" placement="bottom">
                        <el-button @click="onSendOrder(scope.row)" icon="el-icon-user" circle ></el-button>
                    </el-tooltip>
                    <el-button v-if="scope.row.taskState == 0" @click="onDelete(scope.row)" type="danger" icon="el-icon-delete" circle></el-button>
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

        <!--巡检任务主体对话框-->
        <el-dialog top="5vh" title="巡检任务"  :visible.sync="dialogVisible"   width="1000px" :close-on-click-modal="false">
            <el-form ref="taskForm" :model="taskForm" :rules="taskFormRules"  label-width="80px" >
                <el-row :gutter="10">
                    <el-col :span="12">
                        <el-form-item label="任务编号"  prop="taskCode">
                            <el-input v-model="taskForm.taskCode" style="width:300px"></el-input>
                        </el-form-item>
                        <el-form-item label="备注">
                            <el-input v-model="taskForm.remark" style="width:300px"></el-input>
                        </el-form-item>
                    </el-col>
                    <el-col :span="12">
                        <el-form-item label="任务名称"  prop="taskName">
                            <el-input v-model="taskForm.taskName" style="width:300px"></el-input>
                        </el-form-item>
                    </el-col>
                </el-row>
            </el-form>
            <!--检查点-->
            <el-card class="box-card" style="height:100%">
				<div slot="header" class="clearfix">
						<span class="cardTitie">检查点</span>
						<el-button style="float: right;" icon="el-icon-location-outline" @click="onAddPoint">新增检查点</el-button>
				</div>
				<el-table :data="pointTableData" height="180px"  style="width: 100%">
					<el-table-column align="center" prop="pointOrder" label="检查顺序" width="80"></el-table-column>
					<el-table-column prop="pointName" label="检查点名称"></el-table-column>
                    <el-table-column prop="checkContent" label="检查内容"></el-table-column>
                    <el-table-column align="center" prop="pointType" label="检查类型" width="100">
                        <template slot-scope="scope">
                            {{pointTypeDesc(scope.row.pointType)}}
                        </template>
                    </el-table-column>
                    <el-table-column header-align="center" label="操作" width="200">
                        <template slot-scope="scope">
                            <el-button @click="onDeletePoint(scope.row)" type="danger" icon="el-icon-delete" circle></el-button>
                            <el-button @click="onUpdatePoint(scope.row)" icon="el-icon-edit" circle></el-button>
                            <el-tooltip effect="dark" content="上移" placement="bottom">
                                <el-button @click="onUpPointOrder(scope.row)" icon="el-icon-top" circle ></el-button>
                            </el-tooltip>
                            <el-tooltip effect="dark" content="下移" placement="bottom">
                                <el-button @click="onDownPointOrder(scope.row)" icon="el-icon-bottom" circle ></el-button>
                            </el-tooltip>
                        </template>
                    </el-table-column>
				</el-table>
			</el-card>
            <span slot="footer" class="dialog-footer">
                <el-button  @click="dialogVisible = false">取 消</el-button>
                <el-button  type="primary" @click="onSubmit">确 定</el-button>
            </span>
        </el-dialog>

        <!--检查点对话框-->
        <el-dialog title="检查点" :visible.sync="pointDialogVisible"  width="400px" :close-on-click-modal="false">
            <el-form ref="pointForm" :model="pointForm" :rules="pointFormRules" label-width="100px" >
                <el-form-item label="检查点类型" prop="pointType">
                    <el-select v-model="pointForm.pointType" style="width:100%" placeholder="请选择">
                        <el-option v-for="item in pointTypeOptions" :key="item.value" :label="item.label" :value="item.value"></el-option>
                    </el-select>
                </el-form-item>
                <!--如果是设备检查-->
                <el-form-item v-if="pointForm.pointType == 0" label="设备" >
                    <el-button type="primary"  @click="openSelectDevDialog" icon="el-icon-search">查找</el-button>
                    <div>
                    <el-tag v-for="tag in this.pointForm.devs"  :key="tag.devId">
                        {{tag.devCode+" "+ tag.devName}}
                    </el-tag>
                    </div>
                </el-form-item>
                <!--如果是工程位置检查-->
                <el-form-item v-if="pointForm.pointType == 1" label="工程位置" >
                    <el-select v-model="pointForm.positionId" style="width:100%" placeholder="请选择" @change="onPositionSelectChange">
                        <el-option v-for="item in positionOptions" :key="item.positionId" :label="item.positionName" :value="item.positionId"></el-option>
                    </el-select>
                </el-form-item>
                <el-form-item label="检查点名称" prop="pointName">
                    <el-input v-model="pointForm.pointName"></el-input>
                </el-form-item>
                <el-form-item label="检查内容">
                    <el-input type="textarea" :rows="4" placeholder="请输入内容" v-model="pointForm.checkContent" maxlength="256" show-word-limit></el-input>
                </el-form-item>
            </el-form>
            <span slot="footer" class="dialog-footer">
                <el-button  @click="pointDialogVisible = false">取 消</el-button>
                <el-button  type="primary" @click="onPointSubmit">确 定</el-button>
            </span>
        </el-dialog>

        <!--派单对话框-->
        <el-dialog title="派单" :visible.sync="sendOrderDialogVisible"  width="500px" @open="onSendOrderDialogOpen" :close-on-click-modal="false">
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
                <el-button  @click="sendOrderDialogVisible = false">取 消</el-button>
                <el-button  type="primary" @click="onSendOrderSubmit">确 定</el-button>
            </span>
        </el-dialog>

        <!--选择设备对话框-->
        <select-dev-dialog ref="selectDevDialog" @selected="onDevDialogSelected"></select-dev-dialog>
         <!--选择保养人员对话框-->
        <select-member-dialog ref="selectMemberDialog" @selected="onMemberDialogSelected" memberType="inspect"></select-member-dialog>

        <!--巡检记录详细对话框-->
        <el-dialog top="5vh" title="巡检记录" :visible.sync="recordDialogVisible"  width="780px"  :close-on-click-modal="false">
            <el-row :gutter="2">
                <!--检查点流程-->
                <el-col :span="10" style="height: 300px;">
                    <el-steps direction="vertical" process-status="finish" :active="completedIndex" finish-status="success" align-center>
                        <el-step  v-for="point in inspectPoints" :key="point.pointId" :title="point.pointName" :description="point.checkContent"></el-step>
                    </el-steps>
                </el-col>
                <!--巡检记录信息-->
                <el-col :span="14">
                    <el-card v-for="point in inspectPoints" :key="point.pointId" style="margin-top:3px">
                        <div slot="header" class="clearfix">
                            <span class="cardTitie">{{point.pointName}}</span>
                            <img v-if="point.recordPass == 1" style="float: right;" src="img/pass.png"></img>
                            <img v-if="point.recordPass == 2" style="float: right;" src="img/noPass.png"></img>
                        </div>
                        <el-form v-if="point.completed == 1" label-width="80px" >
                            <el-form-item label="检查描述" style="margin-bottom: 5px;">
                                {{point.recordText}}
                            </el-form-item>
                            <el-form-item label="上报时间" style="margin-bottom: 5px;">
                                 {{timestampFormat(point.completedTime,'yyyy-MM-dd hh:mm')}}
                            </el-form-item>
                            <el-form-item label="上报人" style="margin-bottom: 5px;">
                                {{point.recordMemberName}}
                            </el-form-item>
                            <el-form-item label="现场照片" style="margin-bottom: 5px;">
                                <el-image v-for="(url,index) in point.images" :key="index" style="width: 100px; height: 100px;margin:3px;" :src="url" :preview-src-list="[url]">
                                    <!--图片未加载的占位内容-->
                                    <div slot="placeholder" class="image-solt"><i class="el-icon-loading"></i></div>
                                    <!--加载失败的内容-->
                                    <div slot="error" class="image-solt"><i class="el-icon-picture-outline"></i> </div>
                                </el-image>
                            </el-form-item>
                        </el-form>
                    </el-card>
                </el-col>
            </el-row>
        </el-dialog>
        
    </div>
</template>

<script>
import SelectDevDialog from '@/components/Dev/SelectDevDialog'
import SelectMemberDialog from '@/components/Dev/SelectMemberDialog'
import CommonTool from '@/utils/commonTool.js'
export default {
    name: "InspectTask",
    components:{SelectDevDialog,SelectMemberDialog},
	data() {
		return {
            queryForm:{
                memberId:null,
                createTime:[],
                taskState:null,
            },
            memberOptions:[],
            query:null,//查询参数，这里因为queryForm.createTime需要处理，统一在query()中生产该对象
            queryStateOptions:[//任务状态 -1已过期 0创建  1已派单  2进行中 3完成
                {value:null,label:'全部'},
                {value:0,label:'创建'},
                {value:1,label:'已派单'},
                {value:2,label:'进行中'},
                {value:3,label:'已完成'},
                {value:-1,label:'已过期'}
            ],

            //表格
            loading:false,
            tableData:[],
            pageSizeList:this.$store.state.settings.pageSizeList, //分页列表
            total:0,

            //对话框
            curRow:null,
            dialogVisible:false,
            taskForm:{
                taskId:null,
                taskCode:null,
                taskName:null,
                remark:null,//备注

                points:[],//检查点
            },
            taskFormRules:{
                taskCode: [
                    { required: true, message: '请输入任务编号', trigger: 'blur' }
                ],
                taskName: [
                    { required: true, message: '请输入任务名称', trigger: 'blur' }
                ],
            },
           
            pointTableData:[],//检查点

            //检查点对话框
            curPoint:null,
            pointDialogVisible:false,
            pointForm:{
                pointId:null,
                pointName:null,
                pointOrder:null,
                checkContent:null,
                pointType:null,
                devs:[],
                positionId:null,
            },
            pointFormRules:{
                pointName: [
                    { required: true, message: '请输入检查点名称', trigger: 'blur' }
                ],
                pointType: [
                    { required: true, message: '请选择检查类型', trigger: 'blur' }
                ],
            },
            pointTypeOptions:[ // 检查点类型options
                {label:'设备检查',value:0},
                {label:'工程检查',value:1}
            ],
            positionOptions:[],//工程位置options

            //巡检记录对话框
            recordDialogVisible:false,
            curPointOrder:1,//已完成的检查点的index给控件使用,用pointOrder-1即可
            inspectPoints:[],//检查点

            //派单对话框
            sendOrderDialogVisible:false,
            members:[],//指派人
        };
    },
    computed:{
        pageSize() {
            return this.$store.state.settings.pageSize
        },
        completedIndex(){
            return this.curPointOrder - 1
        },
    },
	methods: {
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
            this.$store.dispatch("insp/taskPage",this.query).then(data => {
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
            let createBegin = null;
            let start = this.queryForm.createTime[0]
            if(start)
            {
                createBegin = start.getTime();
            }
            let createEnd = null;
            let end = this.queryForm.createTime[1]
            if(end)
            {
                createEnd = end.getTime();
            }
            //初始化参数
            this.query = {
                memberId:this.queryForm.memberId,
                beginTime:createBegin,
                endTime:createEnd,
                taskState:this.queryForm.taskState,
            }
            this.$store.dispatch("insp/taskCount",this.query).then(data => {
                this.total = data;
                this.tabelPagin(1);
            })
        },
        onQuery(){
            this.initTable();
        },
        onAdd(){
            this.curRow = null
            this.taskForm.taskId = null
            this.taskForm.taskCode = 'XJ'+CommonTool.formatData(new Date(),'yyyyMMddhhmmss');
            this.taskForm.taskName = null
            this.taskForm.remark = null//备注

            this.taskForm.points = []//检查点
            this.members = []//默认指派人
            this.pointTableData = [] //清空表格

            this.dialogVisible = true;
        },
        onDelete(row){},
        onUpdate(row){},
        //提交
        onSubmit(){
            this.$refs.taskForm.validate(valid=>{
                if(valid)
                {
                    if(this.pointTableData.length == 0)
                    {
                        this.$alert("请设置检查点!", "提示", {confirmButtonText: "确定",type: "danger"});
                        return;
                    }
                   
                    this.dialogVisible = false;
                    let task = {
                        taskId:this.taskForm.taskId,
                        taskCode:this.taskForm.taskCode,
                        taskName:this.taskForm.taskName,
                        remark:this.taskForm.remark,
                        points:this.pointTableData
                    };
                    //修改,没有修改功能
                    if(this.curRow)
                    {
                        
                    }
                    //新建
                    else
                    {
                        this.$store.dispatch('insp/addTask',task).then(data=>{
                            if(data)
                            {
                                this.initTable();
                                this.$notify({title: '消息',message: '添加成功',type: 'success',duration:3000});
                            }
                        })
                    } 
                }
            });
        },
        //新增检查点
        onAddPoint(){
            this.curPoint = null;
            this.pointDialogVisible = true
            this.pointForm.pointId = null;
            this.pointForm.pointName = null;
            this.pointForm.pointOrder = null;
            this.pointForm.checkContent = null;
            this.pointForm.pointType = null;
            this.pointForm.devs = [];
            this.pointForm.positionId = null;
        },
        //删除检查点，只是删除pointTableData的数据
        onDeletePoint(row){
            let pointOrder = row.pointOrder
            let index = -1;
            for(let i=0;i<this.pointTableData.length;i++)
            {
                if(this.pointTableData[i].pointOrder === pointOrder)
                {
                    index = i;
                    break;
                }
            }
           
            if(index != -1)
            {
                this.pointTableData.splice(index,1);
                //修改后面元素的pointOrder
                for(let j = index;j<this.pointTableData.length;j++)
                {
                    this.pointTableData[j].pointOrder--;
                }
            }
            
        },
        //修改检查点
        onUpdatePoint(row){
            this.curPoint = row;
            this.pointDialogVisible = true
            this.pointForm.pointId = row.pointId;
            this.pointForm.pointName = row.pointName;
            this.pointForm.pointOrder = row.pointOrder;
            this.pointForm.checkContent = row.checkContent;
            this.pointForm.pointType = row.pointType;
            this.pointForm.devs = row.devs;
            this.pointForm.positionId = row.positionId;
        },
        //检查点对话框确定
        onPointSubmit(){
            this.$refs.pointForm.validate(valid=>{
                if(valid)
                {
                    this.pointDialogVisible = false;
                    //定义数据对象
                    let record = {
                        pointOrder:this.pointForm.pointOrder, //先用着，如果是新增，这里是null
                        pointName:this.pointForm.pointName,
                        pointType:this.pointForm.pointType,
                        checkContent:this.pointForm.checkContent,
                        positionId:null,
                        devs:[],
                    }
                    //如果是检查设备
                    if(record.pointType === 0)
                    {
                        //要做拷贝，不能引用，因为addPoint的时候会清空this.pointForm.devs
                        this.pointForm.devs.forEach(dev=>{
                            record.devs.push({
                                devId:dev.devId,
                                devCode:dev.devCode,
                                devName:dev.devName,
                            })
                        })
                    }
                    else if(record.pointType === 1)
                    {
                        record.positionId = Number(this.pointForm.positionId)
                    }
                    // add
                    if(this.curPoint == null)
                    {
                        //pointTableData增加一行，最后一起提交
                        record.pointOrder = this.pointTableData.length + 1;
                        this.pointTableData.push(record);
                    }
                    //update
                    else
                    {
                        let index = -1;
                        for(let i=0;i<this.pointTableData.length;i++)
                        {
                            if(this.pointTableData[i].pointOrder == record.pointOrder)
                            {
                                index = i;
                                break;
                            }
                        }
                        if(index != -1)
                        {
                            this.pointTableData.splice(index,1,record);
                        }
                        this.curPoint = null;
                    }
                }
            })
        },
        //检查点顺序上移
        onUpPointOrder(row){
            //根据row获得该行在pointTableData中的index
            let index = row.pointOrder - 1;
            if(index > 0)
            {
                this.pointTableData[index-1].pointOrder ++;
                this.pointTableData[index].pointOrder --;
                this.swapArray(this.pointTableData, index-1, index);
            }
        },
        //检查点顺序下移
        onDownPointOrder(row){
            let index = row.pointOrder - 1;
            if(index < (this.pointTableData.length-1))
            {
                this.pointTableData[index].pointOrder ++;
                this.pointTableData[index+1].pointOrder --;
                this.swapArray(this.pointTableData, index, index+1);
            }
        },
        //数组元素上移下移
        swapArray(arr, index1, index2) {
            arr[index1] = arr.splice(index2, 1, arr[index1])[0];
            //return arr;
        },
        //打开设备选择对话
        openSelectDevDialog(){
            this.$refs.selectDevDialog.dialogVisible = true;
        },
        //设备选择对话框确定完成
        onDevDialogSelected(devs){
            this.pointForm.devs = devs;
            //如果是设备检查类型，使用设备名称作为检查点默认名称
            if(this.pointForm.pointType == 0)
            {
                let devNames = ''
                devs.forEach(dev=>{
                    devNames = devNames+dev.devCode+" "+dev.devName+','
                })
                this.pointForm.pointName = devNames.substring(0,devNames.length-1);
            }
        },
        //工程位置点Select控件选择变化
        onPositionSelectChange(value){
            if(this.pointForm.pointType == 1)
            {
                this.positionOptions.forEach(position=>{
                    if(position.positionId == value)
                    {
                        this.pointForm.pointName = position.positionName;
                    }
                })
                
            }
        },
        //打开人员选择对话框
        openMemberDialog(){
            this.$refs.selectMemberDialog.dialogVisible = true;
        },
        //人员选择对话框确定完成
        onMemberDialogSelected(members){
            this.members = members
        },
        //检查点类型文本
        pointTypeDesc(pointType){
            switch(pointType)
            {
                case 0:
                    return '设备检查'
                case 1:
                    return '工程检查'
                default:
                    return '未知'
            }
        },
        initPostions(){
            this.$store.dispatch('insp/positions').then(data=>{
                this.positionOptions = data;
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
        initMemberOptions(){
            this.memberOptions.length = 0;
            this.memberOptions.push({memberId:null,memberName:'全部'})
            this.$store.dispatch('system/allMember','inspect').then(data=>{
                data.forEach(item=>{
                    this.memberOptions.push({memberId:item.memberId,memberName:item.memberName})
                })
            })
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
        //查看巡检记录
        onView(row){
            let taskId = row.taskId
            this.$store.dispatch('insp/pointsByTask',taskId).then(data=>{
                
                //对数据做处理，主要是图片url
                data.forEach(item=>{
                    item.images = [];
                    if(item.recordImagePath && item.recordImagePath.trim() != "")
                    {
                        let pathSubs = item.recordImagePath.split(',');
                        pathSubs.forEach(sub=>{
                            let subUrl = this.$store.state.settings.uploadStore+sub
                            item.images.push(subUrl);
                        })
                    }
                })
                //console.info(data)
                this.inspectPoints = data
                this.setCurPointOrder()
                this.recordDialogVisible = true
            })
        },
         //根据检查点状态设置curPointOrder
        setCurPointOrder(){
            this.curPointOrder = 1
            this.inspectPoints.forEach(point=>{
                if(point.completed == 1)
                {
                    //当前填报点顺位下移
                    if(point.pointOrder<=this.inspectPoints.length)
                    {
                        this.curPointOrder = point.pointOrder + 1;
                    } 
                }
            })
        },
        //只有没接单的任务才能删除
        onDelete(row){
            this.$confirm("确定删除该巡检任务吗?", "提示", {
                confirmButtonText: '确定',
                cancelButtonText: '取消',
                type: 'warning'
            }).then(()=>{
                this.$store.dispatch('insp/deleteTask',row.taskId).then(data=>{
                    if(data)
                    {
                        this.$notify({title: '消息',message: '删除成功',type: 'success',duration:3000});
                    }
                    else
                    {
                        this.$notify({title: '消息',message: '该巡检任务已被接单，不能删除!',type: 'success',duration:3000});
                    }
                    this.initTable();
                })
            })
            .catch(()=>{})
        },

        //派单按钮
        onSendOrder(row){
            this.curRow = row;
            this.sendOrderDialogVisible = true
            
        },
        onSendOrderDialogOpen(){
            //先清除，否则和上一次冲突
            this.members = [];
            //派单操作需要判断任务类型，如果是计划任务，那么会有默认巡检人员
            if(this.curRow.planId)
            {
                this.$store.dispatch('insp/getMembersByPlan',this.curRow.planId).then(data=>{
                    this.members = data
                })
            }
        },
        //派单提交
        onSendOrderSubmit(){
            let taskId = this.curRow.taskId;
            let param = {
                taskId:taskId,
                members:this.members
            }
            this.$store.dispatch('insp/sendOrder',param).then(data=>{
                if(data)
                {
                    this.sendOrderDialogVisible = false
                    this.initTable();
                    this.$notify({title: '消息',message: '派单成功',type: 'success',duration:3000});
                }
            })
        },
    },
	mounted() {
        this.initMemberOptions();
        this.initPostions();
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
