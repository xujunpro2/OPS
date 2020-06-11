<template>
	<div class="rootDiv">
		<el-row :gutter="5" style="height:100%">
			<el-col :span="8" style="height:100%">
				<el-card class="box-card" style="height:49%" :body-style="fullCardBody">
					<div slot="header" class="clearfix">
						<span class="cardTitie">设备类型</span>
						<el-button type="primary" icon="el-icon-plus" circle style="float: right;" @click="onAddType"></el-button>
					</div>
					<el-table :data="typeList" height="80%"  style="width: 100%">
						<el-table-column prop="devTypeId" label="类型编码"></el-table-column>
						<el-table-column prop="devTypeName" label="类型名称"></el-table-column>
                        <el-table-column label="操作" width="160">
                            <template slot-scope="scope">
                                <el-button @click="onDeleteType(scope.row)" type="danger" >删除</el-button>
                                <el-button @click="onUpdateType(scope.row)">修改</el-button>
                            </template>
                        </el-table-column>
					</el-table>
				</el-card>
                
                <el-card class="box-card" style="height:49%;margin-top:5px" :body-style="fullCardBody">
					<div slot="header" class="clearfix">
						<span class="cardTitie">设备区域</span>
						<el-button type="primary" icon="el-icon-plus" circle style="float: right;" @click="onAddSpace"></el-button>
					</div>
					    <el-table :data="spaceTree" height="80%"  style="width: 100%;" row-key="spaceId"  :default-expand-all="true"
                                :tree-props="{children: 'children'}">
                            <el-table-column prop="spaceId" label="区域编码"></el-table-column>
						    <el-table-column prop="spaceName" label="区域名称"></el-table-column>
                            <el-table-column label="操作" width="160">
                                <template slot-scope="scope">
                                    <el-button @click="onDeleteSpace(scope.row)" type="danger" >删除</el-button>
                                    <el-button @click="onUpdateSpace(scope.row)">修改</el-button>
                                </template>
                            </el-table-column>
					    </el-table>
				</el-card>
			</el-col>

			<el-col :span="16" style="height:99%">
				<el-card class="box-card" style="height:100%" :body-style="fullCardBody">
					<div slot="header" class="clearfix">
						<span class="cardTitie">设备</span>
                        <el-dropdown style="float: right; margin-right:5px"  @command="onImportDev" trigger="click">
                                <el-button type="primary" icon="el-icon-right" circle ></el-button>
                                <el-dropdown-menu slot="dropdown">
                                    <el-dropdown-item command="byIFC">从模型导入</el-dropdown-item>
                                </el-dropdown-menu>
                        </el-dropdown>
					</div>
					    <el-table v-loading="devLoading" :data="devTable"  style="width: 100%;">
                            <el-table-column prop="devName" label="名称"></el-table-column>
                            <el-table-column prop="devCode" label="编码"></el-table-column>
                            <el-table-column prop="devTypeName" label="类型"></el-table-column>
                            <!-- <el-table-column prop="devState" label="状态">
                                <template slot-scope="scope">
                                    <span v-if="scope.row.devState ==  1">在用</span>
                                    <span class="redFont" v-if="scope.row.devState ==  0">报废</span>
                                </template>
                            </el-table-column> -->
                            <el-table-column prop="spaceName" label="空间"></el-table-column>
                            <el-table-column prop="ifc" label="模型"></el-table-column>
                            <el-table-column prop="productId" label="构件ID"></el-table-column>
                            <el-table-column prop="manufacturer" label="制造商"></el-table-column>
                            
					    </el-table>
                        <el-row type="flex" justify="end" style="background:#fff">
                            <el-pagination background layout="total, prev, pager, next" :page-size="pageSize" :total="total"
                                @current-change="paginChange"></el-pagination>
                        </el-row>
                        <!--el-card有bug，body不计算header的高度，这里加个div，保证table超过card body的高度后，能看到分页-->
                        <div style="height:32px"></div>
				</el-card>
			</el-col>
		</el-row>


        <!--设备类型对话框-->
        <el-dialog title="设备类型" :visible.sync="devDialogVisible" @open="onDevDialogOpen"  width="400px" :close-on-click-modal="false">
            <el-form ref="devForm" :model="devForm" :rules="devFormRules" label-width="80px" >
                <el-form-item label="类型编码" prop="typeId">
                    <el-input :disabled="this.curDevRow != null" v-model="devForm.typeId"></el-input>
                </el-form-item>
                <el-form-item  label="类型名称" prop="typeName">
                    <el-input v-model="devForm.typeName"></el-input>
                </el-form-item>
            </el-form>
            <span slot="footer" class="dialog-footer">
                <el-button  @click="devDialogVisible = false">取 消</el-button>
                <el-button  type="primary" @click="onTypeSubmit">确 定</el-button>
            </span>
        </el-dialog>

        <!--设备区域对话框-->
        <el-dialog title="设备区域" :visible.sync="spaceDialogVisible" @open="onSpaceDialogOpen"  width="400px" :close-on-click-modal="false">
            <el-form ref="spaceForm" :model="spaceForm" :rules="spaceFormRules" label-width="80px" >
                <el-form-item label="区域编码" prop="spaceId">
                    <el-input :disabled="this.curSpaceRow != null" v-model="spaceForm.spaceId"></el-input>
                </el-form-item>
                <el-form-item  label="区域名称" prop="spaceName">
                    <el-input v-model="spaceForm.spaceName"></el-input>
                </el-form-item>
                <el-form-item label="上级区域">
                     <el-select filterable="" v-model="spaceForm.parentId" placeholder="请选择">
                        <el-option
                        v-for="item in spaceOptionList"
                        :key="item.spaceId"
                        :label="item.spaceName"
                        :value="item.spaceId">
                        </el-option>
                    </el-select>
                </el-form-item>
            </el-form>
            <span slot="footer" class="dialog-footer">
                <el-button  @click="spaceDialogVisible = false">取 消</el-button>
                <el-button  type="primary" @click="onSpaceSubmit">确 定</el-button>
            </span>
        </el-dialog>

        <!--导入设备数据对话框-->
        <el-dialog title="导入设备数据" :visible.sync="importDialogVisible"   width="400px" :close-on-click-modal="false">
            <el-radio  v-for="item of ifcList" v-model="importIfc" :key="item.ifcName" :label="item.ifcName">{{item.ifcName}}</el-radio>
            <br></br>
            <transition name="fade">
                <el-progress v-show="this.importStarting" :percentage="progress" color="#409eff"></el-progress>
            </transition>
            <span slot="footer" class="dialog-footer">
                <el-button  @click="importDialogVisible = false">取 消</el-button>
                <el-button  type="primary" @click="onImportSubmit">确 定</el-button>
            </span>
        </el-dialog>

	</div>
</template>

<script>


export default {
	name: "Empty",
	data() {
		return {
            //设备类型
            typeList: [],
            curDevRow:null,
            devDialogVisible:false,
            devForm:{
                typeId:null,
                typeName:null,
            },
            devFormRules:{
                typeId: [
                    { required: true, message: '请输入设备类型编码', trigger: 'blur' }
                ],
                typeName: [
                    { required: true, message: '请输入设备类型名称', trigger: 'blur' }
                ]
            },
            //设备空间
            spaceTree:[], 
            curSpaceRow:null,
            spaceDialogVisible:false,
            spaceForm:{
                spaceId:null,
                spaceName:null,
                parentId:null,
            },
            spaceFormRules:{
                spaceId: [
                    { required: true, message: '请输入区域编码', trigger: 'blur' }
                ],
                spaceName: [
                    { required: true, message: '请输入区域名称', trigger: 'blur' }
                ]
            },
            spaceOptionList:[], //区域选择框数据

            //设备表格
            fullCardBody:{height:'100%',overflow: 'auto'},
            devLoading:false,
            devTable:[],
            total:0,
            pageSize:Number(this.$store.state.uv.specail.pageSize), //设置都是varchar的，要转数字

            //导入设备数据对话框
            importDialogVisible:false,
            importIfc:null,
            ifcList:[],
            importStarting:false,//开始导入，进度条出现
            taskId:null,//导入任务ID
            progress:0,//导入进度
            interval:null,//定时器
		};
	},
	methods: {
        initTypeTabel(){
            this.$store.dispatch('dev/getDevTypeList').then(data=>{
                this.typeList = data;
            })
        },
        onDeleteType(row){
            this.$confirm("确定删除该设备类型吗?", "提示", {
                confirmButtonText: '确定',
                cancelButtonText: '取消',
                type: 'warning'
            }).then(()=>{
                this.$store.dispatch('dev/deleteType',row.devTypeId).then(data=>{
                    //刷新表格
                    this.initTypeTabel();
                    this.$notify({title: '消息', message: '删除成功', type: 'success',duration:3000});
                });
            }).catch(() => {});
        },
        onAddType(){
            this.curDevRow = null;
            this.devForm.typeId  = null;
            this.devForm.typeName = null;
            this.devDialogVisible = true;
        },
        onUpdateType(row){
            this.curDevRow = row;
            this.devForm.typeId  = row.devTypeId;
            this.devForm.typeName = row.devTypeName;
            this.devDialogVisible = true;
        },
        onDevDialogOpen(){
            //清除之前验证消息，否则会保留
            if(this.$refs.devForm)
            {
                this.$refs.devForm.clearValidate();
            }
        },
        onTypeSubmit(){
            this.$refs.devForm.validate(valid=>{
                //表单验证通过
                if(valid)
                {
                    this.devDialogVisible = false;
                    if(this.curDevRow)
                    {
                        this.$store.dispatch('dev/updateType',this.devForm).then(data=>{
                            if(data)
                            {
                                this.$notify({title: '消息',message: '修改成功',type: 'success',duration:3000});
                                this.initTypeTabel();
                            }
                        })
                    }
                    else
                    {
                        this.$store.dispatch('dev/addType',this.devForm).then(data=>{
                            if(data)
                            {
                                this.$notify({title: '消息',message: '添加成功',type: 'success',duration:3000});
                                this.initTypeTabel();
                            }
                        })
                    }
                }
            })
        },

        //初始化设备空间TreeTabel
        initSpace(){
            this.$store.dispatch('dev/getSpaceTree').then(data=>{
                this.spaceTree = data;
                this.initSpaceOptions();
            })
        },
        initSpaceOptions(){
            this.$store.dispatch('dev/getSpaceList').then(data=>{
                 //生成部门列表,先清空之前的数据
                this.spaceOptionList.length = 0;
                this.spaceOptionList.push({spaceId:"-1",spaceName:"无"});//增加一个parentId=-1的处理
                data.forEach(item=>{
                    this.spaceOptionList.push({spaceId:item.spaceId,spaceName:item.spaceName});
                })
            })
        },
        onAddSpace(){
            this.curSpaceRow = null;
            this.spaceForm.spaceId  = null;
            this.spaceForm.spaceName = null;
            this.spaceDialogVisible = true;
        },
        onUpdateSpace(row){
            this.curSpaceRow = row;
            this.spaceForm.spaceId  = row.spaceId;
            this.spaceForm.spaceName = row.spaceName;
            this.spaceForm.parentId = row.parentId;
            this.spaceDialogVisible = true;
        },
        onDeleteSpace(row){
            this.$confirm("确定删除该区域吗?", "提示", {
                confirmButtonText: '确定',
                cancelButtonText: '取消',
                type: 'warning'
            }).then(()=>{
                this.$store.dispatch('dev/deleteSpace',row.spaceId).then(data=>{
                    this.$notify({title: '消息', message: '删除成功', type: 'success',duration:3000});
                    this.initSpace();
                });
            }).catch(() => {});
        },
        
        onSpaceDialogOpen(){
            //清除之前验证消息，否则会保留
            if(this.$refs.spaceForm)
            {
                this.$refs.spaceForm.clearValidate();
            }
        },
        onSpaceSubmit(){
            this.$refs.spaceForm.validate(valid=>{
                //表单验证通过
                if(valid)
                {
                    this.spaceDialogVisible = false;
                    if(this.curSpaceRow)
                    {
                        this.$store.dispatch('dev/updateSpace',this.spaceForm).then(data=>{
                            if(data)
                            {
                                this.$notify({title: '消息',message: '修改成功',type: 'success',duration:3000});
                                this.initSpace();
                            }
                        })
                    }
                    else
                    {
                        this.$store.dispatch('dev/addSpace',this.spaceForm).then(data=>{
                            if(data)
                            {
                                this.$notify({title: '消息',message: '添加成功',type: 'success',duration:3000});
                                this.initSpace();
                            }
                        })
                    }
                }
            })
        },

        /**************************************设备*******************************/
        //初始化Dev表格
        initDevTabel(){
            this.$store.dispatch("dev/getDevCount").then(data => {
                this.total = data;
                return new Promise((resolve, reject) => {
                    resolve();
                });
            })
            .then(()=>{
                this.devTabelPagin(1);
            });
        },
        //分页事件
        paginChange(curPage) {
			this.devTabelPagin(curPage);
        },
        //设备分页查询
        devTabelPagin(curPage){
            this.devLoading = true;
            let startIndex = (curPage - 1) * this.pageSize;
            let query = {startIndex:startIndex,rows:this.pageSize};
            this.$store.dispatch("dev/getDevPage",query).then(data => {
                this.devTable = data
                this.devLoading = false
            }).catch(()=>{
                this.devLoading = false;
            })
        },

        /*******************************设备数据导入***************************************** */
        initIfcList(){
            this.$store.dispatch('ifc/getAllIFC').then(data=>{
                this.ifcList = data;
            })
        },
        //导入设备
        onImportDev(command){
            if(command === 'byIFC')
            {
                //对话框初始化
                this.importIfc = null;
                this.importStarting = false;
                this.progress = 0;

                this.importDialogVisible = true;
            }

        },
        //确认从模型导入
        onImportSubmit(){
            if(this.importIfc)
            {
                //确认对话框
                this.$confirm("该操作将覆盖选中模型相关的所有设备数据，确认执行吗?", "提示", {
                    confirmButtonText: '确定',
                    cancelButtonText: '取消',
                    type: 'warning'
                })
                .then(()=>{
                    this.$store.dispatch('dev/importByIFC',this.importIfc).then(data=>{
                        this.pollingTaskProgress(data);
                    })
                })
                .catch(() => {});
            }
            else
            {
                this.$alert("请选择需要导入的模型!", "提示", {
                    confirmButtonText: "确定",
                    type: "info"
                });
            }
        },
        
        //发起导入操作之后轮询任务执行进度
        pollingTaskProgress(taskId){
            this.importStarting = true;
            this.taskId = taskId;
            this.progress = 0,
            this.interval = setInterval(this.polling,1000);
        },
        polling(){
            //防止没有任务触发轮询
            if(this.taskId == null)
            {
                return;
            }
            this.$store.dispatch('dev/getImportProgress',this.taskId).then(data=>{
                if(data == -1)
                {
                     this.$notify({title: '消息',message: '设备数据导入发生错误',type: 'error',duration:3000});
                     this.taskId = null;
                }
                else 
                {
                    this.progress = data;
                    if(data == 100)
                    {
                        //停止轮询
                        if(this.interval)
                        {
                            clearInterval(this.interval);
                        }
                        this.$store.dispatch('dev/deleteImportProgress',this.taskId).then(()=>{
                            this.taskId = null;
                        })
                        setTimeout(() => {
                            this.importDialogVisible = false;
                            this.initDevTabel();
                        }, 500);
                        
                    }
                }
            })
        },
    },
	mounted() {
        this.initTypeTabel();
        this.initSpace();
        this.initDevTabel();
        this.initIfcList();
    },
	beforeDestroy() {
        if(this.interval)
        {
            clearInterval(this.interval);
        }
    }
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
.devRow{
    margin-top: 5px;
    height:calc(100% - 330px);
}
.devTable{
    height:calc(100% - 30px);
}
</style>
