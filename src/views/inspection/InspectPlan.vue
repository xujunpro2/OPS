<template>
	<div class="rootDiv">
        <el-form :inline="true"  :model="queryForm" label-width="100px">
            <el-form-item label="计划名称">
                <el-input v-model="queryForm.planName" placeholder="支持模糊查询" clearable></el-input>
            </el-form-item>
            <el-form-item label="计划执行时间">
                <el-date-picker v-model="queryForm.beginTime" type="datetimerange" range-separator="至"
                    start-placeholder="开始日期" end-placeholder="结束日期">
                </el-date-picker>
            </el-form-item>
            <el-form-item label="计划状态">
                <el-select v-model="queryForm.planState" filterable placeholder="请选择" >
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

        <!--巡检计划分页表格-->
        <el-table v-loading="loading" border :data="tableData" style="width: 100%;">
            <el-table-column prop="planName" label="计划名称"></el-table-column>
			<el-table-column prop="period" label="执行频率">
                <template slot-scope="scope">
                    <span v-if="scope.row.period == 0">单次</span>
                    <span v-if="scope.row.period == 1">日</span>
                    <span v-if="scope.row.period == 2">周</span>
                    <span v-if="scope.row.period == 3">月</span>
                </template>
            </el-table-column>
            <el-table-column prop="beginTime" label="计划开始时间">
                <template slot-scope="scope">
                    {{timestampFormat(scope.row.beginTime,'yyyy-MM-dd hh:mm')}}
                </template>
            </el-table-column>
            <el-table-column prop="endTime" label="计划结束期限">
                <template slot-scope="scope">
                    {{getEndTimeStr(scope.row.endTime)}}
                </template>
            </el-table-column>
            <el-table-column prop="planState" label="状态">
                <template slot-scope="scope">
                    <span v-if="scope.row.planState==0" style="color:#F56C6C">作废</span>
                    <span v-if="scope.row.planState==1">生效</span>
                </template>
            </el-table-column>
           
            <el-table-column label="操作">
                <template slot-scope="scope">
                    <el-button @click="onDelete(scope.row)" type="danger" icon="el-icon-delete" circle></el-button>
                    <el-button @click="onUpdate(scope.row)" icon="el-icon-edit" circle ></el-button>
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

        <!--巡检计划主体对话框-->
        <el-dialog top="5vh" title="巡检计划"  :visible.sync="dialogVisible"   width="1000px" :close-on-click-modal="false">
            <el-form ref="planForm" :model="planForm" :rules="planFormRules"  label-width="80px" >
                <el-row :gutter="10">
                    <el-col :span="12">
                        <el-form-item label="计划名称" style="width:300px" prop="planName">
                            <el-input v-model="planForm.planName"></el-input>
                        </el-form-item>
                        <el-form-item label="开始时间" prop="beginTime">
                            <el-date-picker v-model="planForm.beginTime" type="datetime" placeholder="请选择时间" ></el-date-picker>
                        </el-form-item>
                        <el-form-item label="执行频率">
                            <el-select v-model="planForm.period" style="width:220px">
                                <el-option v-for="item in periodOptions" :key="item.value" :label="item.label"
                                    :value="item.value"></el-option>
                            </el-select>
                        </el-form-item>
                        
                    </el-col>

                    <el-col :span="12">
                        <el-form-item label="计划状态" >
                            <el-switch v-model="planForm.planState" active-color="#13ce66" inactive-color="#ff4949"></el-switch>
                        </el-form-item>
                         <el-form-item label="结束时间" >
                            <el-date-picker v-model="planForm.endTime" type="datetime" placeholder="请选择时间" ></el-date-picker>
                        </el-form-item>
                        <el-form-item v-show="planForm.period != 1" label="生成时间">
                            <el-time-picker format='HH:mm' value-format="HH:mm" v-model="planForm.runHour" placeholder="滚轮上下移动时间"></el-time-picker>
                        </el-form-item>
                    </el-col>
                </el-row>
                <!--日动态行-->
                <el-row v-if="planForm.period == 1" type="flex" justify="center" style="margin-bottom:10px">
                    <el-checkbox-group v-model="dayList">
                        <el-checkbox style="width:50px"  v-for="(item,index) in dayHours" :key="index" :label="item">{{item}}</el-checkbox>
                    </el-checkbox-group>
                </el-row>
                <!--周动态行-->
                <el-row v-if="planForm.period == 2" type="flex" justify="center" style="margin-bottom:10px">
                    <el-checkbox-group v-model="weekList">
                        <el-checkbox   v-for="(item,index) in weekDays" :key="index" :label="item.label">{{item.text}}</el-checkbox>
                    </el-checkbox-group>
                </el-row>
                <!--月动态行-->
                <el-row v-if="planForm.period == 3" type="flex" justify="center" style="margin-bottom:10px">
                    <el-checkbox-group v-model="monthList">
                        <el-checkbox style="width:30px"  v-for="(item,index) in monthDays" :key="index" :label="item"></el-checkbox>
                    </el-checkbox-group>
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
            <!--默认巡检人员-->
            <el-card class="box-card" style="height:100%;margin-top:5px">
				<div slot="header" class="clearfix">
						<span class="cardTitie">巡检人员</span>
						<el-button style="float: right;" icon="el-icon-user" @click="openMemberDialog">设置人员</el-button>
				</div>
                <el-tag v-for="tag in this.planForm.members"  :key="tag.memberId">
                        {{tag.memberName}}
                </el-tag>
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
        <!--选择设备对话框-->
        <select-dev-dialog ref="selectDevDialog" @selected="onDevDialogSelected"></select-dev-dialog>
        <!--选择保养人员对话框-->
        <select-member-dialog ref="selectMemberDialog" @selected="onMemberDialogSelected" memberType="inspect"></select-member-dialog>
    </div>
</template>

<script>
import SelectDevDialog from '@/components/Dev/SelectDevDialog'
import SelectMemberDialog from '@/components/Dev/SelectMemberDialog'
import CommonTool from '@/utils/commonTool.js'
export default {
    name: "InspectPlan",
    components:{SelectDevDialog,SelectMemberDialog},
	data() {
		return {
            queryForm:{
                planName:null,
                beginTime:[],
                planState:null,
            },
            query:null,//查询参数，这里因为queryForm.beginTime需要处理，统一在query()中生产该对象
            queryStateOptions:[
                {value:null,label:'全部'},
                {value:1,label:'生效'},
                {value:0,label:'作废'}
            ],

            //表格
            loading:false,
            tableData:[],
            pageSizeList:this.$store.state.settings.pageSizeList, //分页列表
            total:0,

            //对话框
            curRow:null,
            dialogVisible:false,
            periodOptions:[
                {label:'单次',value:0},
                {label:'日',value:1},
                {label:'周',value:2},
                {label:'月',value:3}
            ],
            planForm:{
                planId:null,
                planName:null,
                period:0,// 计划执行周期 0单次  1日   2周  3月
                interval:null,//针对period的表达式，日：每日几点；周：每周几；月：每月的几号 用逗号隔开
                planState:true,//计划状态 0作废 1 生效
                beginTime:null,//计划开始执行时间
                endTime:null,//计划执行结束时间
                runHour:'09:00',//派单时间
                remark:null,//备注

                points:[],//检查点
                members:[],//默认指派人
            },
            planFormRules:{
                planName: [
                    { required: true, message: '请输入计划名称', trigger: 'blur' }
                ],
                beginTime: [
                    { required: true, message: '请输入开始时间', trigger: 'blur' }
                ],
            },
            dayList:[],//日频率
            dayHours:['00:00','01:00','02:00','03:00','04:00','05:00','06:00','07:00','08:00','09:00','10:00','11:00','12:00',
                      '13:00','14:00','15:00','16:00','17:00','18:00','19:00','20:00','21:00','22:00','23:00'],
            weekList:[],//周频率
            weekDays:[{label:'1',text:'星期一'},{label:'2',text:'星期二'},{label:'3',text:'星期三'},{label:'4',text:'星期四'},
                      {label:'5',text:'星期五'},{label:'6',text:'星期六'},{label:'7',text:'星期日'}],
            monthList:[],//月频率
            monthDays:['1','2','3','4','5','6','7','8','9','10','11','12','13','14','15','16','17','18','19','20','21','22','23',
                       '24','25','26','27','28','29','30','31'],
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
        };
    },
    computed:{
        pageSize() {
            return this.$store.state.settings.pageSize
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
            this.$store.dispatch("insp/planPage",this.query).then(data => {
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
            let excuteBegin = null;
            let start = this.queryForm.beginTime[0]
            if(start)
            {
                excuteBegin = start.getTime();
            }
            let excuteEnd = null;
            let end = this.queryForm.beginTime[1]
            if(end)
            {
                excuteEnd = end.getTime();
            }
            //初始化参数
            this.query = {
                planName:this.queryForm.planName,
                excuteBegin:excuteBegin,
                excuteEnd:excuteEnd,
                planState:this.queryForm.planState,
            }
            this.$store.dispatch("insp/planCount",this.query).then(data => {
                this.total = data;
                this.tabelPagin(1);
            })
        },

        onQuery(){
            this.initTable();
        },
        //新增巡检计划
        onAdd(){
            this.curRow = null
            this.planForm.planId = null
            this.planForm.planName = null
            this.planForm.period = 0// 计划执行周期 0单次  1日   2周  3月
            this.planForm.interval = null//针对period的表达式，日：每日几点；周：每周几；月：每月的几号 用逗号隔开
            this.planForm.planState = true//计划状态 0作废 1 生效
            this.planForm.beginTime = null//计划开始执行时间
            this.planForm.endTime = null//计划执行结束时间
            this.planForm.runHour = '09:00'//执行时间
            this.planForm.remark = null//备注
            this.planForm.points.length = 0//检查点
            this.planForm.members.length = 0//默认指派人
            
            this.pointTableData.length = 0 //清空表格

            //日 周 月 清空
            this.dayList.length = 0
            this.weekList.length = 0
            this.monthList.length = 0

            this.dialogVisible = true;
        },
        onUpdate(row){
            this.curRow = row;
            let planId = row.planId;
            this.$store.dispatch('insp/getPlan',planId).then(data=>{
                this.planForm.planId = planId
                this.planForm.planName = data.planName
                this.planForm.period = data.period// 计划执行周期 0单次  1日   2周  3月
                this.planForm.interval = data.interval//针对period的表达式，日：每日几点；周：每周几；月：每月的几号 用逗号隔开
                this.planForm.planState = data.planState == 1?true:false//计划状态 0作废 1 生效
                this.planForm.beginTime = new Date(data.beginTime)//计划开始执行时间
                if(data.endTime)
                {
                    this.planForm.endTime = new Date(data.endTime)//计划执行结束时间
                }
                else
                {
                    this.planForm.endTime = null
                }
                this.planForm.runHour = data.runHour//执行时间
                this.planForm.remark = data.remark//备注

                //根据period设置周期控件
                switch(data.period)
                {
                    case 1:
                        this.dayList = data.interval.split(',')
                        break;
                    case 2:
                        this.weekList = data.interval.split(',')
                        break;
                    case 3:
                        this.monthList = data.interval.split(',')
                        break;
                    default:
                        break;
                }
                //默认巡检人员
                this.planForm.members = data.members;
                //检查点
                this.pointTableData.length = 0;
                let points = data.points;
                points.forEach(point=>{
                    let record = {
                        pointOrder:point.pointOrder, //先用着，如果是新增，这里是null
                        pointName:point.pointName,
                        pointType:point.pointType,
                        checkContent:point.checkContent,
                        positionId:null,
                        devs:[],
                    }
                    if(point.pointType == 0)
                    {
                        record.devs = point.devs
                    }
                    else if(point.pointType == 1)
                    {
                        record.positionId = point.position.positionId
                    }
                    this.pointTableData.push(record);
                })

                this.dialogVisible = true;
            })
        },
        //删除计划，实际是打标记
        onDelete(row){
            this.$confirm("确定删除该巡检计划吗?", "提示", {
                confirmButtonText: '确定',
                cancelButtonText: '取消',
                type: 'warning'
            }).then(()=>{
                let planId = row.planId;
                this.$store.dispatch('insp/deletePlan',planId).then(data=>{
                    if(data == 1)
                    {
                        this.initTable();
                        this.$notify({title: '消息',message: '删除成功',type: 'success',duration:3000});
                    }
                })
            })
            .catch(()=>{})
        },
        //计划提交
        onSubmit(){
            this.$refs.planForm.validate(valid=>{
                if(valid)
                {
                    this.dialogVisible = false;
                    let plan = {
                        planId:this.planForm.planId,
                        planName:this.planForm.planName,
                        period:this.planForm.period,
                        planState:this.planForm.planState,
                        endTime:null,
                        runHour:null,
                        points:[],
                    };
                    //开始时间
                    let beginTime = this.planForm.beginTime
                    plan.beginTime = beginTime.getTime()
                    if(this.planForm.endTime != null )
                    {
                        plan.endTime = this.planForm.endTime.getTime()
                    }
                    //runHour,日类型为null
                    if(plan.period != 1)
                    {
                        plan.runHour = this.planForm.runHour;
                    }
                    //周期表达式
                    let str = '';
                    switch(plan.period)
                    {
                        case 0: //单次
                            plan.interval = null
                            break;
                        case 1: //日 
                            let dayInterval = this.dayList;
                            dayInterval.forEach(item=>{
                                str = str+item+","
                            })
                            plan.interval = str.substring(0,str.length-1);
                            break;
                        case 2://周
                            let weekInterval = this.weekList;
                            weekInterval.forEach(item=>{
                                str = str+item+","
                            })
                            plan.interval = str.substring(0,str.length-1);
                            break;
                        case 3://月
                            let monthInterval = this.monthList;
                            monthInterval.forEach(item=>{
                                str = str+item+","
                            })
                            plan.interval = str.substring(0,str.length-1);
                            break;
                        default:
                            break;
                    }
                    //巡检人员
                    plan.members = this.planForm.members;
                    //检查点
                    plan.points = this.pointTableData;

                    //修改
                    if(this.curRow)
                    {
                        this.$store.dispatch('insp/updatePlan',plan).then(data=>{
                            if(data)
                            {
                                this.initTable();
                                this.$notify({title: '消息',message: '修改成功',type: 'success',duration:3000});
                            }
                        })
                    }
                    //新建
                    else
                    {
                        this.$store.dispatch('insp/addPlan',plan).then(data=>{
                            if(data)
                            {
                                this.initTable();
                                this.$notify({title: '消息',message: '添加成功',type: 'success',duration:3000});
                            }
                        })
                    } 
                }//end valid
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
            this.pointForm.devs.length = 0;
            this.pointForm.positionId = null;
            this.pointForm.devs.length = 0;//检查点设备初始化
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
                    devNames = devNames+dev.devName+','
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
            this.planForm.members = members
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
            return CommonTool.formatData(new Date(timestamp),formate)
        },
        getEndTimeStr(timestamp)
        {
            if(timestamp)
            {
                return this.timestampFormat(timestamp,'yyyy-MM-dd hh:mm')
            }
            return '无期限';
        }
    },
	mounted() {
        this.initTable();
        this.initPostions();
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
</style>
