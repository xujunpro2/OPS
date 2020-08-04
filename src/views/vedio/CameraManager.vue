<template>
	<div class="rootDiv">
        <el-row style="height:100%;" :gutter="5">
             <el-col :span="5" style=" height:100%; border-right:solid 1px #ebebeb; ">
                <el-tree ref="areaTree" node-key="areaId" highlight-current :data="areaTree" :props="treeProps" 
                    :expand-on-click-node="false" @node-click="onTreeNodeClick"></el-tree>
            </el-col>
            <el-col :span="19">
                <el-row type="flex" justify="end" style="margin:20px 10px">
                    <el-input clearable placeholder="摄像头名称关键字" v-model="queryName" style="width:200px">
                         <el-button slot="append" icon="el-icon-search" @click="initTable()"></el-button>
                    </el-input>
                    &emsp;
                    <el-button icon="el-icon-circle-plus-outline"  type="primary" @click="onAdd()">添加
                    </el-button>
                </el-row>
                <el-row style="margin-top:-10px">
                    <el-table border v-loading="loading" :data="tableData" tooltip-effect="dark" style="width: 100%">
                        <el-table-column prop="indexCode" label="设备编号"></el-table-column>
                        <el-table-column prop="name" label="名称"></el-table-column>
                        <el-table-column prop="typeName" label="类型" width="90"></el-table-column>
                        <el-table-column label="云台控制" width="90">
                            <template slot-scope="scope">
                                <el-switch v-model="scope.row.ptz" disabled></el-switch>
                            </template>
                        </el-table-column>
                        <el-table-column prop="areaName" label="区域" width="150"></el-table-column>
                        <el-table-column label="操作" width="200">
                            <template slot-scope="scope">
                                <el-button @click="onDelete(scope.row)" type="danger" icon="el-icon-delete" circle></el-button>
                                <el-button @click="onUpdate(scope.row)" icon="el-icon-edit" circle ></el-button>
                            </template>
                        </el-table-column>
                    </el-table>
                </el-row>
                <el-row type="flex" justify="end" style="background:#fff">
                    <el-pagination background layout="total, sizes,prev, pager, next"
                        :page-sizes="pageSizeList"
                        :page-size="pageSize" 
                        :total="total"
                        @size-change="sizeChange"
                        @current-change="paginChange">
                    </el-pagination>
                </el-row>
            </el-col>
        </el-row>

        <el-dialog title="摄像头编辑" :visible.sync="dialogVisible" @open="onDialogOpen"  width="30%" :close-on-click-modal="false">
            <el-form ref="form" :model="cameraForm" :rules="cameraFormRules"  label-width="80px" >
                <el-form-item label="编码" prop="cameraIndexCode">
                    <el-input v-model="cameraForm.cameraIndexCode"></el-input>
                </el-form-item>
                <el-form-item label="名称" prop="cameraName">
                    <el-input v-model="cameraForm.cameraName"></el-input>
                </el-form-item>
                
                <el-form-item label="类型">
                    <el-select v-model="cameraForm.cameraType" placeholder="请选择">
                        <el-option
                        v-for="item in cameraTypeOptionList"
                        :key="item.cameraType"
                        :label="item.typeName"
                        :value="item.cameraType">
                        </el-option>
                    </el-select>
                </el-form-item>
                <el-form-item  label="云台控制">
                    <el-switch v-model="cameraForm.ptz"></el-switch>
                </el-form-item>
                <el-form-item label="区域">
                     <el-select v-model="cameraForm.areaId" placeholder="请选择">
                        <el-option
                        v-for="item in areaOptionList"
                        :key="item.areaId"
                        :label="item.areaName"
                        :value="item.areaId">
                        </el-option>
                    </el-select>
                </el-form-item>
            </el-form>
            <span slot="footer" class="dialog-footer">
                <el-button  @click="dialogVisible = false">取 消</el-button>
                <el-button  type="primary" @click="onSubmit">确 定</el-button>
            </span>
        </el-dialog>
    </div>
</template>

<script>

export default {
	name: "CameraManager",
	data() {
		return {
            curAreaId: null, //当前选中的区域
            areaTree: [], //区域Tree数据
            treeProps: {
				children: "children",
				label: "areaName"
            },
            queryName: "",
            tableData:[],
            pageSizeList:this.$store.state.settings.pageSizeList, //分页列表
            total:0,
            loading:true, //table的loading
            dialogVisible:false,
            curDataRow:null,//表单当前选中行
            cameraForm:{
                cameraId:null,
                cameraIndexCode:null,
                cameraName:null,
                cameraType:null,
                ptz:false,
                areaId:null,
            },
            cameraTypeOptionList:[],//摄像头类型select options
            areaOptionList:[],//区域select options
            //表单验证
            cameraFormRules:{
                cameraName: [
                    { required: true, message: '请输入摄像头名称', trigger: 'blur' }
                ],
                cameraIndexCode: [
                    { required: true, message: '请输入摄像头编号', trigger: 'blur' }
                ],
            }
        };
    },
    computed:{
        pageSize() {
            return this.$store.state.settings.pageSize
        },
    },
	methods: {
        //生成区域Tree和查询所有的摄像头列表
        init(){
            this.$store.dispatch('camera/getAreaTree').then(data=>{
                //额外加一个全部区域的node
                var root = {
                    areaId:null,
                    areaName:'全部区域',
                    children:[]
                }
                data.forEach(element => {
                    root.children.push(element);
                });
                //注意，el-tree只接受数组数据
                this.areaTree = [root];
                return new Promise((resolve,rejects)=>{
                    resolve();
                })
            })
            .then( ()=>{
                this.initTable();
            })
        },
        initTable(){
           var param = {
                areaId : this.curAreaId,
                cameraName:this.queryName,
            }
            this.$store.dispatch('camera/cameraPageCount',param).then(data=>{
                this.total = data.count;
                return new Promise((resolve,rejects)=>{
                    resolve()
                })
            }).then(()=>{
                this.tabelPagin(1)
            })
        },
        //区域Tree节点点击，根据areaId查询摄像头
        onTreeNodeClick(data, node){
            this.curAreaId = data.areaId;
            this.initTable();
        },
        //curPage从第一页开始
        tabelPagin(curPage){
            this.loading = true;
            let startIndex = (curPage - 1) * this.pageSize;
            var param = {
                areaId : this.curAreaId,
                cameraName:this.queryName,
                startIndex:startIndex,
                rows:this.pageSize,
            }
            this.$store.dispatch("camera/cameraPage",param).then(data => {
                this.tableData = data;
                this.loading = false;
            }).catch(()=>{
                this.loading = false;
            })
        },
        sizeChange(rows){
            this.$store.dispatch('settings/changePageSize',rows);
            this.tabelPagin(1);
        },
        //分页
        paginChange(curPage) {
			this.tabelPagin(curPage);
        },
        //打开对话框
        onDialogOpen(){
            //清除之前验证消息，否则会保留
            if(this.$refs.form)
            {
                this.$refs.form.clearValidate();
            }
            if(this.curDataRow)
            {
                this.cameraForm.cameraId = this.curDataRow.id;
                this.cameraForm.cameraIndexCode = this.curDataRow.indexCode;
                this.cameraForm.cameraName = this.curDataRow.name;
                this.cameraForm.cameraType = this.curDataRow.type;
                this.cameraForm.ptz = this.curDataRow.ptz;
                this.cameraForm.areaId = this.curDataRow.areaId;
            }
            else
            {
                this.cameraForm.cameraId = null;
                this.cameraForm.cameraIndexCode = null;
                this.cameraForm.cameraName = null;
                this.cameraForm.cameraType = null;
                this.cameraForm.ptz = false;
                this.cameraForm.areaId = null;
                //如果当前在区域Tree上选中了，那么新建摄像头的默认区域就是这个了
                if(this.curAreaId != null)
                {
                    this.cameraForm.areaId = this.curAreaId
                }
            }
           
        },
        //表单提交
        onSubmit(){
             this.$refs.form.validate(valid=>{
                if(valid)
                {
                    this.dialogVisible = false;
                    let temp = this.cameraForm
                    //修改
                    if(this.curDataRow)
                    {
                        this.$store.dispatch('camera/updateCamera',this.cameraForm).then(data=>{
                            //刷新表格
                            this.initTable();
                            this.$notify({title: '消息',message: '修改成功',type: 'success',duration:3000});
                        });
                    }
                    //新建
                    else
                    {
                        this.$store.dispatch('camera/addCamera',this.cameraForm).then(data=>{
                            //刷新表格
                            this.initTable();
                            this.$notify({title: '消息',message: '添加成功',type: 'success',duration:3000});
                        });
                    }
                }
            })
        },
        onAdd(){
            this.curDataRow = null;
            this.dialogVisible =true
        },
        onUpdate(row){
            this.curDataRow = row;
            this.dialogVisible =true
        },
        onDelete(row){
            this.$confirm("确定删除该数据吗?", "提示", {
                confirmButtonText: '确定',
                cancelButtonText: '取消',
                type: 'warning'
            }).then(()=>{
                let cameraId = row.id
                this.$store.dispatch('camera/deleteCamera',cameraId).then(()=>{
                    //刷新表格
                    this.initTable();
                    this.$notify({
                        title: '消息',
                        message: '删除成功',
                        type: 'success',
                        duration:3000
                    });
                })
            })
            .catch(()=>{})
        },
        //初始化表单select options数据
        initFormSelectOptions(){
            this.$store.dispatch('camera/areaList').then((data)=>{
                this.areaOptionList = data;
            })
            this.$store.dispatch('camera/cameraTypes').then((data)=>{
                this.cameraTypeOptionList = data;
            })
        },
    },
	mounted() {
        this.init();
        this.initFormSelectOptions();
    },
	beforeDestroy() {}
};
</script>

<style scoped>
</style>
