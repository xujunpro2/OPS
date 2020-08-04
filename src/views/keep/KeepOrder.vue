<template>
    <div class="rootDiv">
        <el-form :inline="true"  :model="queryForm" label-width="80px">
            <el-form-item label="工单编号">
                <el-input v-model="queryForm.keepCode" placeholder="支持模糊查询" clearable></el-input>
            </el-form-item>
            <el-form-item label="工单名称">
                <el-input v-model="queryForm.keepName" placeholder="支持模糊查询" clearable></el-input>
            </el-form-item>
            <el-form-item label="创建时间">
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
        <!--
        <el-row type="flex" justify="end">
            <el-button :disabled="!this.buttonEnable.canDelete" @click="onDelete()" type="danger">删除</el-button>
            <el-button :disabled="!this.buttonEnable.canArchive" @click="onInfo()" type="primary">归档</el-button>
        </el-row>
        -->
        <el-table v-loading="loading" border :data="tableData" style="width: 100%;margin-top:3px">
            <el-table-column prop="keepCode" label="工单编号" align="center" width="180px"></el-table-column>
			<el-table-column prop="keepName" label="工单名称" header-align="center"></el-table-column>
            <el-table-column prop="keepState" label="工单状态" align="center" width="120px">
                <template slot-scope="scope">
                    {{keepStateStr(scope.row.keepState)}}
                </template>
            </el-table-column>
            <el-table-column prop="timeout" label="是否超时" align="center" width="120px">
                <template slot-scope="scope">
                    <span v-if="scope.row.timeout == 1" style="color:#d40000">超时</span>
                    <span v-else>正常</span>
                </template>
            </el-table-column>
            <el-table-column prop="createTime" label="创建时间" align="center" width="150px">
                <template slot-scope="scope">
                    {{timestampFormat(scope.row.createTime,'yyyy-MM-dd hh:mm')}}
                </template>
            </el-table-column>
            <el-table-column prop="sendTime" label="派单时间" align="center" width="150px">
                <template slot-scope="scope">
                    {{timestampFormat(scope.row.sendTime,'yyyy-MM-dd hh:mm')}}
                </template>
            </el-table-column>
            <el-table-column prop="assignTime" label="接单时间" align="center" width="150px">
                <template slot-scope="scope">
                    {{timestampFormat(scope.row.assignTime,'yyyy-MM-dd hh:mm')}}
                </template>
            </el-table-column>
            <el-table-column prop="deadline" label="完成期限" align="center" width="150px">
                <template slot-scope="scope">
                    {{timestampFormat(scope.row.deadline,'yyyy-MM-dd hh:mm')}}
                </template>
            </el-table-column>
           
            <el-table-column label="操作" header-align="center" min-width="160px">
                <template slot-scope="scope">
                    <el-tooltip effect="dark" content="查看维保记录" placement="bottom">
                        <el-button @click="onInfo(scope.row)" icon="el-icon-view" circle ></el-button>
                    </el-tooltip>
                    <!-- //工单状态 0 创建 1派单 2已完成 3归档 -->
                    <el-tooltip v-if="scope.row.keepState == 0" effect="dark" content="派单" placement="bottom">
                        <el-button @click="onAssign(scope.row)" icon="el-icon-user" circle ></el-button>
                    </el-tooltip>
                    <el-button v-if="scope.row.keepState == 0" @click="onDelete(scope.row)" type="danger" icon="el-icon-delete" circle></el-button>
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

        <el-dialog title="新建工单"  :visible.sync="dialogVisible" @open="onDialogOpen"   width="450px"  :close-on-click-modal="false">
            <select-dev-dialog ref="selectDevDialog" :inner="true" @selected="onDevDialogSelected"></select-dev-dialog>
            <el-form ref="addOrderForm" :model="orderForm" :rules="orderFormRules"  label-width="80px" >
                <el-form-item label="工单编号" prop="keepCode">
                    <el-input v-model="orderForm.keepCode"></el-input>
                </el-form-item>
                <el-form-item label="工单名称" prop="keepName">
                    <el-input v-model="orderForm.keepName"></el-input>
                </el-form-item>
                <el-form-item label="完成时限">
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
                            {{this.infoForm.keepCode}}
                        </el-form-item>
                        <el-form-item label="当前状态:">
                             {{this.infoForm.keepState}}
                        </el-form-item>
                        <el-form-item label="完成时限:">
                            {{timestampFormat(this.infoForm.deadline,'yyyy-MM-dd hh:mm')}}
                        </el-form-item>
                        <el-form-item label="接单时间:">
                            {{timestampFormat(this.infoForm.assignTime,'yyyy-MM-dd hh:mm')}}
                        </el-form-item>
                    </el-col>
                    <el-col :span="12">
                        <el-form-item label="工单名称:">
                            {{this.infoForm.keepName}}
                        </el-form-item>
                        <el-form-item label="创建时间:">
                            {{timestampFormat(this.infoForm.createTime,'yyyy-MM-dd hh:mm')}}
                        </el-form-item>
                        <el-form-item label="派单时间:">
                            {{timestampFormat(this.infoForm.sendTime,'yyyy-MM-dd hh:mm')}}
                        </el-form-item>
                        <el-form-item label="完成时间:">
                            {{timestampFormat(this.infoForm.completeTime,'yyyy-MM-dd hh:mm')}}
                        </el-form-item>
                    </el-col>
                </el-row>
                <el-form-item label="保养设备:">
                    <div>
                    <el-tag v-for="tag in this.infoForm.devList"  :key="tag.devId" >
                        {{tag.devCode+" "+ tag.devName}}
                    </el-tag>
                    </div>
                </el-form-item>
                <el-form-item label="保养人员:">
                    <div>
                    <el-tag v-for="tag in this.infoForm.memberList"  :key="tag.memberId" >
                        {{tag.memberName}}
                    </el-tag>
                    </div>
                </el-form-item>
                <el-form-item v-if="infoForm.keepContext != null &&infoForm.keepContext != ''" label="保养记录:">
                    {{this.infoForm.keepContext}}
                </el-form-item>
                <el-form-item v-if="infoForm.pictureList.length >0" label="现场照片:">
                    <div style="float:left;padding:3px" v-for="(item,index) of infoForm.pictureList" :key="index">
                        <el-image style="width: 150px; height: 100px" :src="item" fit="fill" :preview-src-list="infoForm.pictureList">
                            <!--图片未加载的占位内容-->
                            <div slot="placeholder" class="image-solt"><i class="el-icon-loading"></i></div>
                            <!--加载失败的内容-->
                            <div slot="error" class="image-solt"><i class="el-icon-picture-outline"></i> </div>
                        </el-image>
                    </div>
                </el-form-item>
            </el-form>
        </el-dialog>

        <!--选择保养人员对话框-->
        <select-member-dialog ref="selectMemberDialog" @selected="submitAssign" memberType="repair"></select-member-dialog>
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
                {value:1,label:'已派单'},
                {value:2,label:'已接单'},
                {value:3,label:'已完成'}
            ],

            //表格
            loading:false,
            tableData:[],
            pageSizeList:this.$store.state.settings.pageSizeList, //分页列表
            total:0,

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
                completeTime:null,//完成时间
                sendTime:null,//派单时间
                assignTime:null,//接单时间
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
        
        //表格时间格式化
        timestampFormat(timestamp,formate){
            if(timestamp)
            {
                return CommonTool.formatData(new Date(timestamp),formate)
            }
            return ''
        },
        //表格状态格式化 工单状态 0 创建 1派单 2已完成 3超时 4 归档
        keepStateStr(keepState){
            switch(keepState)
            {
                case 0:
                    return '创建'
                case 1:
                    return '已派单'
                case 2:
                    return '已接单'
                case 3:
                    return '已完成'
                case 4:
                    return '已归档'
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
                // console.info(data);
                if(data)
                {
                    this.infoForm.keepId = data.keepId
                    this.infoForm.keepCode = data.keepCode
                    this.infoForm.keepName = data.keepName
                    this.infoForm.keepState = this.keepStateStr(data.keepState);
                    this.infoForm.deadline = data.deadline
                    this.infoForm.createTime = data.createTime
                    this.infoForm.completeTime = data.completeTime
                    this.infoForm.sendTime = data.sendTime
                    this.infoForm.assignTime = data.assignTime
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
        onDelete(row){
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
       
        onDialogOpen(){
            //清除之前验证消息，否则会保留
            if(this.$refs.addOrderForm)
            {
                this.$refs.addOrderForm.clearValidate();
            }
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
        onAssign(row){
            this.curRow = row
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
                this.$store.dispatch('keep/sendOrder',param).then(data=>{
                    this.onQuery();
                    this.$notify({title: '消息', message: '派单成功',type: 'success',duration:3000});
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
.image-solt{
    width:150px;
    height:100px;
    background-color:#f5f7fa;
    text-align: center;
    line-height: 110px;
}
.image-solt i{
    font-size: 28px;
}
</style>
