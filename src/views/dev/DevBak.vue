<template>
    <div class="rootDiv">
        <el-form :inline="true" ref="queryForm" :model="queryForm" label-width="80px">
            <el-form-item label="设备名称">
                <el-input v-model="queryForm.devName" placeholder="支持模糊查询" clearable></el-input>
            </el-form-item>
            <el-form-item label="入库时间">
                <el-date-picker
                    v-model="queryForm.createTime"
                    type="datetimerange"
                    range-separator="至"
                    start-placeholder="开始日期"
                    end-placeholder="结束日期">
                </el-date-picker>
            </el-form-item>
            <el-form-item label="设备类型">
                <el-select v-model="queryForm.devType" filterable  placeholder="请选择" style="width: 100%;">
                    <el-option v-for="item in queryTypeOptions" :key="item.devTypeId" :label="item.devTypeName"
                        :value="item.devTypeId"></el-option>
                </el-select>
            </el-form-item>
            
            <el-form-item>
                <el-button type="primary" @click="onQuery" icon="el-icon-search">查询</el-button>
            </el-form-item>
            <el-form-item>
                 <el-button type="primary" icon="el-icon-circle-plus-outline" @click="onAdd">新增</el-button>
            </el-form-item>
        </el-form>

        <el-table v-loading="loading" border :data="tableData" tooltip-effect="dark" style="width: 100%">
            <el-table-column prop="devName" label="名称"></el-table-column>
			<el-table-column prop="devCode" label="编码"></el-table-column>
			<el-table-column prop="devTypeName" label="类型"></el-table-column>
            <el-table-column prop="warranty" label="质保年限"></el-table-column>
            <el-table-column prop="manufacturer" label="生产厂家"></el-table-column>
            <el-table-column prop="phone" label="维修电话"></el-table-column>
            <el-table-column prop="createTime" label="入库时间">
                <template slot-scope="scope">
                    {{getCreateTimeStr(scope.row.createTime)}}
                </template>
            </el-table-column>
            <el-table-column label="操作" width="240">
                <template slot-scope="scope">
                    <el-button @click="onDelete(scope.row)" type="danger">删除</el-button>
                    <el-button @click="onUpdate(scope.row)">修改</el-button>
                    <el-button @click="onUsed(scope.row)">投用</el-button>
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

        <!--设备表单对话框-->
        <el-dialog title="设备信息" :visible.sync="devDialogVisible" @open="onDevDialogOpen" width="700px" :close-on-click-modal="false">
			<el-form ref="form" :model="devForm" :rules="devFormRules"  label-width="80px" >
                <el-row>
                    <el-col :span="12">
                        <el-form-item label="设备编码" prop="devCode">
                            <el-input v-model="devForm.devCode"></el-input>
                        </el-form-item>
                        <el-form-item label="设备类型" >
                            <el-select v-model="devForm.devType" placeholder="请选择" style="width:100%">
                                <el-option
                                v-for="item in typeOptions"
                                :key="item.devTypeId"
                                :label="item.devTypeName"
                                :value="item.devTypeId">
                                </el-option>
                            </el-select>
                        </el-form-item>
                        <el-form-item label="生产厂家" >
                            <el-input v-model="devForm.manufacturer"></el-input>
                        </el-form-item>
                        <el-form-item label="质保期限" prop="warranty">
                            <el-input v-model.number="devForm.warranty">
                                <template slot="append">年</template>
                            </el-input>
                            <!-- <el-input-number v-model="devForm.warranty":min="1" :max="100" style="width:120px"></el-input-number>&nbsp;年 -->
                        </el-form-item>
                    </el-col>
                    <el-col :span="12">
                        <el-form-item label="设备名称" prop="devName">
                            <el-input v-model="devForm.devName"></el-input>
                        </el-form-item>
                         <el-form-item label="报修电话" >
                            <el-input v-model="devForm.phone"></el-input>
                        </el-form-item>
                        <el-form-item label="额定功率">
                            <el-input v-model="devForm.power">
                                <template slot="append">KW</template>
                            </el-input>
                            <!-- <el-input-number v-model="devForm.power" :min="0" :max="4000" style="width:120px"></el-input-number>&nbsp;KW -->
                        </el-form-item>
                        <el-form-item label="额定电压">
                            <el-input v-model="devForm.voltage">
                                <template slot="append">&nbsp;V</template>
                            </el-input>
                            <!-- <el-input-number v-model="devForm.voltage" :min="0" :max="400" style="width:120px"></el-input-number>&nbsp;V -->
                        </el-form-item>
                    </el-col>
                </el-row>
			</el-form>
			<span slot="footer" class="dialog-footer">
				<el-button @click="devDialogVisible = false">取 消</el-button>
				<el-button type="primary" @click="onSubmitDev">确 定</el-button>
			</span>
		</el-dialog>

        <!--替换设备对话框-->
        <el-dialog title="替换设备" :visible.sync="usedDialogVisible" @open="onUsedDialogOpen"  width="700px" :close-on-click-modal="false">
             <el-table highlight-current-row @current-change="onRowSelectedChange" v-loading="usedLoading" border :data="usedTable" height="400px" tooltip-effect="dark" style="width: 100%">
                <el-table-column prop="devName" label="名称"></el-table-column>
				<el-table-column prop="devCode" label="编码"></el-table-column>
				<el-table-column prop="devTypeName" label="类型"></el-table-column>
                <el-table-column prop="spaceName" label="所属区域"></el-table-column>
            </el-table>
            <el-row type="flex" justify="end" style="background:#fff">
                <el-pagination background layout="total, prev, pager, next" 
                    :page-size="50"  
                    :total="usedTotal"
                    @current-change="usedPaginChange">
                </el-pagination>
            </el-row>
            <span slot="footer" class="dialog-footer">
				<el-button @click="usedDialogVisible = false">取 消</el-button>
				<el-button type="primary" @click="onSubmitUsedBak">确 定</el-button>
			</span>
        </el-dialog>
    </div>
</template>

<script>
import CommonTool from '@/utils/commonTool.js'
export default {
	name: "DevBak",
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

            //设备操作
            curRow:null, //设备表格上当前选中的行
            typeOptions: [],//设备类型
            devDialogVisible:false,//设备对话框
            devForm:{
                devId:null,
                devCode:null,
                devName:null,
                devType:null,
                manufacturer:null,
                warranty:null, //质保期 以年为单位 
                phone:null,
                power:null, //额定功率 KW
                voltage:null, //额定电压 V
            },
            devFormRules:{
                devCode: [
                    { required: true, message: '请输入设备编码', trigger: 'blur' }
                ],
                devName: [
                    { required: true, message: '请输入设备名称', trigger: 'blur' }
                ],
                warranty:[
                    {type:'number',min:1, message: '请输入大于0的整数', trigger: 'blur'}
                ],
            },

            //替换设备
            usedDialogVisible:false,
            usedQuery:null, //查询参数
            usedLoading:false,
            usedTable:[],
            usedTotal:0,
            changeDev:null,//需要更换的设备
        };
    },
    computed:{
        pageSize() {
            return this.$store.state.settings.pageSize
        },
    },
	methods: {
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
                devName:this.queryForm.devName,
                devType:this.queryForm.devType,
                createStart:createStart,
                createEnd:createEnd,
            }
            this.$store.dispatch("dev/getDevBakCount",this.query).then(data => {
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
            this.$store.dispatch("dev/getDevBakPage",this.query).then(data => {
                this.tableData = data;
                this.loading = false;
            }).catch(()=>{
                this.loading = false;
            })
        },

        getCreateTimeStr(createTime){
            let time = new Date(createTime);
            return CommonTool.formatData(time,'yyyy-MM-dd hh:mm:ss')
        },

        onDevDialogOpen(){
            //清除之前验证消息，否则会保留
            if(this.$refs.form)
            {
                this.$refs.form.clearValidate();
            }
            if(this.curRow)
            {
                for(let key in this.devForm)
                {
                    this.devForm[key] = this.curRow[key];
                }
            }
            else
            {
                for(let key in this.devForm)
                {
                    this.devForm[key] = null;
                }
            }
        },
        onAdd(){
            //设置devTable清除选中状态，处理用户选中了row，但点击的是新建按钮的情况
            this.curRow = null;
            this.devDialogVisible = true;
        },
        onUpdate(row){
            this.curRow = row;
            this.devDialogVisible = true;
        },
        onDelete(row){
            this.$confirm("确定删除该备件吗?", "提示", {
                confirmButtonText: '确定',
                cancelButtonText: '取消',
                type: 'warning'
            }).then(()=>{
                let devId = row.devId;
                this.$store.dispatch('dev/deleteBak',devId).then(data=>{
                    if(data == 1)
                    {
                        this.$notify({title: '消息',message: '删除成功',type: 'success',duration:3000});
                        this.initTable();
                    }
                })
            })
            .catch(()=>{})
        },
         //设备对话框提交确定
        onSubmitDev(){
            this.$refs.form.validate(valid=>{
                if(valid)
                {
                    this.devDialogVisible = false;
                    let dev = {
                        devId:this.devForm.devId,
                        devName : this.devForm.devName,
                        devCode : this.devForm.devCode,
                        devType : this.devForm.devType,
                        manufacturer :this.devForm.manufacturer,
                        warranty:Number(this.devForm.warranty), 
                        phone:this.devForm.phone,
                        power:this.devForm.power, //额定功率 KW
                        voltage:this.devForm.voltage, //额定电压 V
                    }
                    if(this.curRow)
                    {
                        this.$store.dispatch('dev/updateBak',dev).then(data=>{
                            if(data == 1)
                            {
                                this.$notify({title: '消息',message: '修改成功',type: 'success',duration:3000});
                                this.initTable();
                            }
                        })
                    }
                    else
                    {
                        this.$store.dispatch('dev/addBak',dev).then(data=>{
                            if(data == 1)
                            {
                                this.$notify({title: '消息',message: '添加成功',type: 'success',duration:3000});
                                this.initTable();
                            }
                        })
                    }
                    //设置curRow为null，这样投用操作就不冲突了
                    this.curRow = null;
                }
            })
            
        },
        //投用
        onUsed(row){
            this.curRow = row;
            this.usedDialogVisible = true;
            this.usedQuery = {
                startIndex:0,
                rows:50,
                spaceId:null,
                devCode:null,
                devType:row.devType,
            }
            this.initUsedTable();
        },
        //替换对话框打开后，先设置替换设备为null，避免前一次的选择保留
        onUsedDialogOpen(){
            this.changeDev = null;
        },
        initUsedTable(){
            this.usedLoading = true;
            this.$store.dispatch("dev/getDevCount",this.usedQuery).then(data => {
                this.usedTotal = data;
                this.usedPaginChange(1);
            }).catch(()=>{
                this.usedLoading = false;
            })
        },
        usedPaginChange(curPage){
            this.usedLoading = true;
            this.usedQuery.startIndex = (curPage - 1) * 50;
            this.$store.dispatch("dev/getDevPage",this.usedQuery).then(data => {
                this.usedTable = data;
                this.usedLoading = false;
            }).catch(()=>{
                this.usedLoading = false;
            })
        },
        onRowSelectedChange(curRow,oldRow){
            if(curRow)
            {
                this.changeDev = curRow;
            }
        },
        onSubmitUsedBak(){
            //changeDev是被替换的  curRow是备件
            if(this.changeDev && this.curRow)
            {
                this.$confirm("确定替换该备件吗?", "提示", {
                    confirmButtonText: '确定',
                    cancelButtonText: '取消',
                    type: 'warning'
                }).then(()=>{
                    let devId = this.changeDev.devId;
                    let bakId = this.curRow.devId;
                    let param = {
                        devId:devId,
                        bakId:bakId,
                    }
                    this.usedDialogVisible = false;
                    this.$store.dispatch('dev/bakChange',param).then(data=>{
                        if(data)
                        {
                            this.$notify({title: '消息',message: '备件投用成功',type: 'success',duration:3000});
                            this.initTable();
                        }
                    })
                    this.changeDev = null;
                    this.curRow = null;
                })
                .catch(()=>{})
            }
            else
            {
                this.$alert("请选择需要替换的设备!", "提示", {confirmButtonText: "确定",type: "info"});
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
</style>
