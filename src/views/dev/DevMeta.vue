<template>
	<div class="rootDiv">
		<el-row :gutter="5" style="height:100%">
			<el-col :span="12" style="height:100%">
				<el-card class="box-card" style="height:100%" :body-style="fullCardBody">
					<div slot="header" class="clearfix">
						<span class="cardTitie">设备类型</span>
						<el-button  style="float: right;" @click="onAddType">新增</el-button>
					</div>
					<el-table :data="typeList" height="90%"  style="width: 100%">
						<el-table-column prop="devTypeId" label="类型编码"></el-table-column>
						<el-table-column prop="devTypeName" label="类型名称"></el-table-column>
                        <el-table-column label="操作" width="160">
                            <template slot-scope="scope">
                                <el-button @click="onDeleteType(scope.row)" type="danger" icon="el-icon-delete" circle></el-button>
                                <el-button @click="onUpdateType(scope.row)" icon="el-icon-edit" circle ></el-button>
                            </template>
                        </el-table-column>
					</el-table>
				</el-card>
                
                
			</el-col>

			<el-col :span="12" style="height:100%">
               <el-card class="box-card" style="height:100%;" :body-style="fullCardBody">
					<div slot="header" class="clearfix">
						<span class="cardTitie">设备区域</span>
						<el-button style="float: right;" @click="onAddSpace">新增</el-button>
					</div>
					    <el-table :data="spaceTree" height="90%"  style="width: 100%;" row-key="spaceId"  :default-expand-all="true"
                                :tree-props="{children: 'children'}">
                            <el-table-column prop="spaceId" label="区域编码"></el-table-column>
						    <el-table-column prop="spaceName" label="区域名称"></el-table-column>
                            <el-table-column label="操作" width="160">
                                <template slot-scope="scope">
                                    <el-button @click="onDeleteSpace(scope.row)" type="danger" icon="el-icon-delete" circle></el-button>
                                    <el-button @click="onUpdateSpace(scope.row)" icon="el-icon-edit" circle ></el-button>
                                </template>
                            </el-table-column>
					    </el-table>
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

       

	</div>
</template>

<script>


export default {
	name: "DevMeta",
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
            fullCardBody: { height: "100%", overflow: "auto" },
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

    },
	mounted() {
        this.initTypeTabel();
        this.initSpace();
    },
	beforeDestroy() {
       
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
</style>
