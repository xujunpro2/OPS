<template>
    <div class="rootDiv">
        <el-form :inline="true"  :model="queryForm" label-width="80px">
            <el-form-item label="工单编号">
                <el-input v-model="queryForm.keepCode" placeholder="支持模糊查询" clearable></el-input>
            </el-form-item>
            <el-form-item label="工单名称">
                <el-input v-model="queryForm.keepName" placeholder="支持模糊查询" clearable></el-input>
            </el-form-item>
            <el-form-item label="生成时间">
                <el-date-picker v-model="queryForm.createTime" type="datetimerange" range-separator="至"
                    start-placeholder="开始日期" end-placeholder="结束日期">
                </el-date-picker>
            </el-form-item>
            <el-form-item label="工单状态">
                <el-select v-model="queryForm.keepState" filterable placeholder="请选择" >
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
        <el-row type="flex" justify="end">
            <el-button :disabled="!this.buttonEnable.canDelete" @click="onDelete()" type="danger">删除</el-button>
            <el-button :disabled="!this.buttonEnable.canAssign" @click="onAssign()" type="primary">派单</el-button>
            <el-button :disabled="!this.buttonEnable.canTimeout" @click="onTimeout()" type="primary">超时</el-button>
            <el-button :disabled="!this.buttonEnable.canArchive" @click="onInfo()" type="primary">归档</el-button>
        </el-row>
        <el-table v-loading="loading" border :data="tableData" highlight-current-row @current-change="onRowSelectedChange"  style="width: 100%;margin-top:3px">
            <el-table-column prop="keepCode" label="工单编号"></el-table-column>
			<el-table-column prop="keepName" label="工单名称"></el-table-column>
            <el-table-column prop="createTime" label="创建时间">
                <template slot-scope="scope">
                    {{timestampFormat(scope.row.createTime,'yyyy-MM-dd hh:mm:ss')}}
                </template>
            </el-table-column>
            <el-table-column prop="deadline" label="完成期限">
                <template slot-scope="scope">
                    {{timestampFormat(scope.row.deadline,'yyyy-MM-dd hh:mm:ss')}}
                </template>
            </el-table-column>
            <el-table-column prop="keepState" label="工单状态">
                <template slot-scope="scope">
                    {{keepStateStr(scope.row.keepState)}}
                </template>
            </el-table-column>
            <el-table-column prop="timeout" label="超时标记">
                <template slot-scope="scope">
                    <i v-if="scope.row.timeout == 1" class="el-icon-circle-check" style="color:#d40000"></i>
                </template>
            </el-table-column>
            <el-table-column label="">
                <template slot-scope="scope">
                     <el-button @click="onInfo(scope.row)" type="text">详细信息</el-button>
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

        <el-dialog title="新建工单"  :visible.sync="dialogVisible"   width="450px" :close-on-click-modal="false">
            <select-dev-dialog ref="selectDevDialog" :inner="true" @selected="onDevDialogSelected"></select-dev-dialog>
            <el-form ref="addOrderForm" :model="orderForm" :rules="orderFormRules"  label-width="80px" >
                <el-form-item label="工单编号" prop="keepCode">
                    <el-input v-model="orderForm.keepCode"></el-input>
                </el-form-item>
                <el-form-item label="工单名称" prop="keepName">
                    <el-input v-model="orderForm.keepName"></el-input>
                </el-form-item>
                <el-form-item label="完成时限" prop="deadline">
                    <el-date-picker v-model="orderForm.deadline" type="datetime" placeholder="请选择时间" style="width:100%"></el-date-picker>
                </el-form-item>
                <el-form-item label="保养设备">
                    <el-button type="primary"  @click="openSelectDevDialog" icon="el-icon-search">查找</el-button>
                    <div>
                    <el-tag v-for="tag in this.orderForm.devs"  :key="tag.devId">
                        {{tag.devCode+" "+ tag.devName}}
                    </el-tag>
                    </div>
                </el-form-item>
            </el-form>
            <span slot="footer" class="dialog-footer">
                <el-button  @click="dialogVisible = false">取 消</el-button>
                <el-button  type="primary" @click="onSubmit">确 定</el-button>
            </span>
        </el-dialog>
       
        <el-dialog title="工单详情" :visible.sync="infoDialogVisible"  width="650px" :close-on-click-modal="false">
            <el-form ref="form" :model="infoForm"  label-width="80px" >
                <el-row>
                    <el-col :span="12">
                        <el-form-item label="工单编号:">
                            <el-input :readonly="true" v-model="infoForm.keepCode"></el-input>
                        </el-form-item>
                        <el-form-item label="创建时间">
                            <el-input :readonly="true" v-model="infoForm.createTime"></el-input>
                        </el-form-item>
                        <el-form-item label="完成时限">
                            <el-input :readonly="true" v-model="infoForm.deadline"></el-input>
                        </el-form-item>
                    </el-col>
                    <el-col :span="12">
                        <el-form-item label="工单名称">
                            <el-input :readonly="true" v-model="infoForm.keepName"></el-input>
                        </el-form-item>
                        <el-form-item label="当前状态">
                            <el-input :readonly="true" v-model="infoForm.keepState"></el-input>
                        </el-form-item>
                    </el-col>
                </el-row>
                <el-form-item label="保养设备">
                    <div>
                    <el-tag v-for="tag in this.infoForm.devList"  :key="tag.devId" >
                        {{tag.devCode+" "+ tag.devName}}
                    </el-tag>
                    </div>
                </el-form-item>
                <el-form-item label="保养人员">
                    <div>
                    <el-tag v-for="tag in this.infoForm.memberList"  :key="tag.memberId" >
                        {{tag.memberName}}
                    </el-tag>
                    </div>
                </el-form-item>
                <el-form-item v-if="infoForm.keepContext != null &&infoForm.keepContext != ''" label="保养记录">
                    <el-input type="textarea" :rows="4" placeholder="请输入内容" clearable="" v-model="this.infoForm.keepContext"></el-input>
                </el-form-item>
                <el-form-item v-if="infoForm.pictureList.length >0" label="现场照片">
                    <div style="float:left;padding:3px" v-for="(item,index) of infoForm.pictureList" :key="index">
                        <el-image style="width: 150px; height: 100px" :src="item" fit="fill" :preview-src-list="infoForm.pictureList"></el-image>
                    </div>
                </el-form-item>
            </el-form>
        </el-dialog>

        <!--选择保养人员对话框-->
        <select-member-dialog ref="selectMemberDialog" @selected="submitAssign"></select-member-dialog>
    </div>
</template>

<script>
import SelectDevDialog from '@/components/Dev/SelectDevDialog'
import SelectMemberDialog from '@/components/Dev/SelectMemberDialog'
import CommonTool from '@/utils/commonTool.js'
export default {
    name: "Keep",
    components:{SelectDevDialog,SelectMemberDialog},
	data() {
		return {
            queryForm:{
                keepCode:null,
                keepName:null,
                createTime:[],
                keepState:null,
            },
            query:null,//查询参数，这里因为queryForm.createTime需要处理，统一在query()中生产该对象
            queryStateOptions:[
                {value:null,label:'全部'},
                {value:0,label:'创建'},
                {value:1,label:'派单'},
                {value:2,label:'已完成'},
                {value:3,label:'归档'}
            ],

            //表格
            loading:false,
            tableData:[],
            pageSizeList:this.$store.state.settings.pageSizeList, //分页列表
            total:0,
            buttonEnable:{
                canDelete:false,
                canDelete:false, //删除
                canTimeout:false, //超时
                canArchive:false, //归档
                canAssign:false //派单
            },

            //对话框
            curRow:null,
            dialogVisible:false,
            orderForm:{
                keepId:null,
                keepCode:null,
                keepName:null,
                deadline:null,// 最后期限时间
                devs:[],//保养设备
            },
            orderFormRules:{
                keepCode: [
                    { required: true, message: '请输入工单编号', trigger: 'blur' }
                ],
                keepName: [
                    { required: true, message: '请输入工单名称', trigger: 'blur' }
                ],
                deadline: [
                    { required: true, message: '请输入完成时限', trigger: 'blur' }
                ],
            },

            //详细信息对话框
            infoDialogVisible:false,
            infoForm:{
                keepId:null,
                keepCode:null,
                keepName:null,
                keepState:null,
                createTime:null,
                deadline:null,// 最后期限时间
                devList:[],//保养设备
                memberList:[],//保养人员

                keepContext:null,//保养记录
                pictureList:[],//现场照片
            },
        };
    },
    computed:{
        pageSize() {
            return this.$store.state.settings.pageSize
        },
    },
	methods: {
        openBigPicture(pictureName){
            console.info(pictureName);
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
            this.$store.dispatch("keep/keepPage",this.query).then(data => {
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
                keepCode:this.queryForm.keepCode,
                keepName:this.queryForm.keepName,
                createBegin:createBegin,
                createEnd:createEnd,
                keepState:this.queryForm.keepState,
            }
            this.$store.dispatch("keep/keepCount",this.query).then(data => {
                this.total = data;
                this.tabelPagin(1);
            })
        },

        onQuery(){
            this.initTable();
        },
        //row 选中操作
        onRowSelectedChange(curRow,oldRow){
            this.curRow = curRow
            this.dynamicButtons(curRow)
        },
        //动态按钮
        dynamicButtons(curRow){
            this.buttonEnable.canDelete = false;
            this.buttonEnable.canAssign = false;
            this.buttonEnable.canTimeout = false;
            this.buttonEnable.canArchive = false;
            //工单状态 0 创建 1派单 2已完成 3归档
            let keepState = curRow.keepState;
            switch(keepState)
            {
                case 0: 
                    this.buttonEnable.canDelete = true;
                    this.buttonEnable.canAssign = true; 
                    break;
                case 1: 
                    this.buttonEnable.canTimeout = true;
                    break;
                case 2: 
                    this.buttonEnable.canTimeout = true;
                    this.buttonEnable.canArchive = true;
                    break;
                }
                //如果执行过超时标记,那么超时按钮不可用
                if(this.buttonEnable.canTimeout && curRow.timeout == 1)
                {
                    this.buttonEnable.canTimeout = false;
                }
        },
        //表格时间格式化
        timestampFormat(timestamp,formate){
            return CommonTool.formatData(new Date(timestamp),formate)
        },
        //表格状态格式化 工单状态 0 创建 1派单 2已完成 3超时 4 归档
        keepStateStr(keepState){
            switch(keepState)
            {
                case 0:
                    return '创建'
                case 1:
                    return '派单'
                case 2:
                    return '已完成'
                case 3:
                    return '归档'
                default:
                    return '未知'
            }
        },

        /** 操作 */
        onAdd(){
            this.dialogVisible = true;
            this.orderForm.keepId = null;
            this.orderForm.keepCode = 'WB'+CommonTool.formatData(new Date(),'yyyyMMddhhmmss');
            this.orderForm.keepName = null;
            this.orderForm.deadline = null;
            this.orderForm.devs = [];
        },
        //详细信息，工单不提供修改操作
        onInfo(row){
            let keepId = row.keepId;
            this.$store.dispatch('keep/findKeep',keepId).then(data=>{
                this.infoDialogVisible = true;
                console.info(data);
                if(data)
                {
                    this.infoForm.keepId = data.keepId
                    this.infoForm.keepCode = data.keepCode
                    this.infoForm.keepName = data.keepName
                    this.infoForm.keepState = this.keepStateStr(data.keepState);
                    this.infoForm.deadline = CommonTool.formatData(new Date(data.deadline),'yyyy-MM-dd hh:mm:ss')
                    this.infoForm.createTime = CommonTool.formatData(new Date(data.createTime),'yyyy-MM-dd hh:mm:ss')
                    this.infoForm.devList = data.devList
                    this.infoForm.memberList = data.memberList

                    this.infoForm.keepContext = data.keepContext
                    let urls = [];
                    data.pictureList.forEach(item=>{
                        let fullUrl = this.$store.state.settings.server+item.url; //server的最后有/
                        urls.push(fullUrl);
                    })
                    this.infoForm.pictureList = urls;//只要url，这样可以同时对image组件的previewSrcList赋值
                }
            })
        },
        onDelete(){
            let row = this.curRow;
            this.$confirm("确定删除该工单吗?", "提示", {
                confirmButtonText: '确定',
                cancelButtonText: '取消',
                type: 'warning'
            }).then(()=>{
                let keepId = row.keepId
                this.$store.dispatch('keep/deleteKeep',keepId).then(()=>{
                    this.onQuery();
                    this.$notify({title: '消息', message: '删除成功',type: 'success',duration:3000});
                })
            })
            .catch(()=>{})
        },
       

        onSubmit(){
            this.$refs.addOrderForm.validate(valid=>{
                if(valid)
                {
                    if(this.orderForm.devs.length == 0)
                    {
                         this.$alert("请选择保养设备!", "提示", {confirmButtonText: "确定",type: "error"});
                         return;
                    }
                    this.dialogVisible = false;
                    let param = {
                        keepId:this.orderForm.keepId,
                        keepCode:this.orderForm.keepCode,
                        keepName:this.orderForm.keepName,
                        deadline:this.orderForm.deadline.getTime(),
                        devs:this.orderForm.devs
                    }
                    //工单不提供修改操作，只有新增
                    this.$store.dispatch('keep/addKeep',param).then(data=>{
                        if(data == 1)
                        {
                            this.onQuery();
                            this.$notify({title: '消息',message: '添加成功',type: 'success',duration:3000});
                        }
                    })
                }
            });
            
        },
        //打开设备选择对话
        openSelectDevDialog(){
            this.$refs.selectDevDialog.dialogVisible = true;
        },
        //设备选择对话框确定完成
        onDevDialogSelected(devs){
            this.orderForm.devs = devs;
        },
        
        //派单按钮
        onAssign(){
            this.$refs.selectMemberDialog.dialogVisible = true;
        },
        //提交派单
        submitAssign(members){
            if(members.length == 0)
            {
                 this.$alert("没有选择接单人员!", "提示", {confirmButtonText: "确定",type: "error"});
                 return;
            }
            this.$confirm("确定派单吗?", "提示", {
                confirmButtonText: '确定',
                cancelButtonText: '取消',
                type: 'info'
            }).then(()=>{
                let param = {
                    keepId:this.curRow.keepId,
                    members:members
                }
                this.$store.dispatch('keep/assignOrder',param).then(data=>{
                    this.onQuery();
                    this.$notify({title: '消息', message: '派单成功',type: 'success',duration:3000});
                })
            })
            .catch(()=>{ })
        },

       
        //超时按钮
        onTimeout(){
            let row = this.curRow;
            let deadline = row.deadline;
            if(deadline > new Date().getTime())
            {
                this.$alert('未到工单完成期限，暂不能执行超时操作!','提示',{confirmButtonText:'确定',type:'error'});
                return;
            }
            //如果确实超时了,二次确认
            this.$confirm("确定标记超时吗?", "提示", {
                confirmButtonText: '确定',
                cancelButtonText: '取消',
                type: 'info'
            }).then(()=>{
                this.$store.dispatch('keep/timeout',row.keepId).then(data=>{
                    if(data == 1)
                    {
                        this.onQuery();
                        this.$notify({title: '消息', message: '标记超时成功',type: 'success',duration:3000});
                    }
                })
            })
            .catch(()=>{ })
        },
    },
	mounted() {
        this.initTable();
    },
	beforeDestroy() {}
};
</script>

<style scoped>
.thumbnail{
        width:100%;
        /* height: 200px; */
    }
</style>
