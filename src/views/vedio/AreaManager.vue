<template>
	<div class="rootDiv">
        <el-table :data="areaTree" style="width: 100%;" row-key="areaId"  :default-expand-all="true"
            :tree-props="{children: 'children'}">
            <el-table-column prop="areaName" label="区域" >
            </el-table-column>
            <el-table-column prop="alarmEnable" label="启用入侵报警">
                <template slot-scope="scope">
                    <el-switch
                        v-model="scope.row.alarmEnable"
                        disabled
                        > <!--  @change = "switchChange($event,scope.row.cameraIndexCode)"  switch控件带自定义参数，$event必须这样写，传过去的是true/false状态，后面可以自由定义 -->
                    </el-switch>
                </template>
            </el-table-column>
            <el-table-column label="操作" width="230">
                <template slot-scope="scope">
                    <el-button @click="onUpdateArea(scope.row)" type="text" >修改</el-button>
                    <el-button @click="onDeleteArea(scope.row)" type="text" ><span id="deleteButton">删除</span></el-button>
                </template>
            </el-table-column>
        </el-table>
        <el-row type="flex" justify="end" style="margin:20px 5px">
            <el-button icon="el-icon-circle-plus-outline"  type="primary" @click="onAddArea()">添加</el-button>
        </el-row>
        <el-dialog title="区域编辑" :visible.sync="dialogVisible" @open="onDialogOpen"  width="30%" :close-on-click-modal="false">
            <el-form ref="form" :model="areaForm" :rules="areaFormRules" label-width="80px" >
                <el-form-item label="区域名称" prop="areaName">
                    <el-input v-model="areaForm.areaName"></el-input>
                </el-form-item>
                <el-form-item  label="侵入报警">
                    <el-switch v-model="areaForm.alarmEnable"></el-switch>
                </el-form-item>
                <el-form-item label="上级区域">
                     <el-select v-model="areaForm.parentAreaId" placeholder="请选择">
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
	name: "AreaManager",
	data() {
		return {
            areaTree:[],
            curDataRow:null,
            dialogVisible:false,
            areaForm: {
                areaId:null,
                areaName: null,
                alarmEnable: false,
                parentAreaId: null,
            },
            areaOptionList:[], 
            //表单验证
            areaFormRules:{
                areaName: [
                    { required: true, message: '请输入区域名称', trigger: 'blur' }
                ],
            }
        };
	},
	methods: {
        getAreaTree(){
            this.$store.dispatch('camera/getAreaTree').then(data=>{
                this.areaTree = data;
                //生成部门列表,先清空之前的数据
                this.areaOptionList.length = 0;
                this.areaOptionList.push({areaId:-1,areaName:"无"});//增加一个parentId=-1的处理
                data.forEach(item=>{
                    this.getChildrenArea(item);
                })
            })
        },
         //迭代生成部门select控件的option数据
        getChildrenArea(item){
            let option = {areaId:item.areaId,areaName:item.areaName};
            this.areaOptionList.push(option);
            let children = item.children;
            children.forEach(element => {
                this.getChildrenArea(element);
            });
        },
        onDialogOpen(){
            //清除之前验证消息，否则会保留
            if(this.$refs.form)
            {
                this.$refs.form.clearValidate();
            }
            if(this.curDataRow)
            {
                this.areaForm  = this.curDataRow;
            }
            else
            {
                this.areaForm.areaId = null;
                this.areaForm.areaName= null;
                this.areaForm.alarmEnable =false;
                this.areaForm.parentAreaId = -1;//最后添加的无上级部门的value是-1
            }
        },
        onAddArea(){
            this.curDataRow = null;
            this.dialogVisible = true;
        },
        onUpdateArea(row){
            this.curDataRow = row;
            this.dialogVisible = true;
        },
        onDeleteArea(row){
            //首先判断是否有子部门，有的话不能删除
            if(row.children.length > 0)
            {
                this.$alert("该区域包含子区域，请先删除子区域", "错误", {
                    type: "error"
                });
                return;
            }
            this.$confirm("确定删除该区域吗?", "提示", {
                confirmButtonText: '确定',
                cancelButtonText: '取消',
                type: 'warning'
            }).then(()=>{
                let areaId = row.areaId;
                this.$store.dispatch('camera/deleteArea',areaId).then(data=>{
                    //刷新表格
                    this.getAreaTree();
                    this.$notify({
                        title: '消息',
                        message: '删除成功',
                        type: 'success',
                        duration:3000
                    });
                });
            }).catch(() => {});
        },
        onSubmit(){
            this.$refs.form.validate(valid=>{
                //表单验证通过
                if(valid)
                {
                    //关闭对话框
                    this.dialogVisible = false;
                     //修改
                    if(this.curDataRow)
                    {
                        let area = {
                            areaId:this.areaForm.areaId,
                            areaName:this.areaForm.areaName,
                            alarmEnable:this.areaForm.alarmEnable,
                            parentAreaId:this.areaForm.parentAreaId,
                        }
                        this.$store.dispatch('camera/updateArea',area).then(data=>{
                            //刷新表格
                            this.getAreaTree();
                            this.$notify({
                                title: '消息',
                                message: '修改成功',
                                type: 'success',
                                duration:3000
                            });
                        });
                    }
                    else
                    {
                        this.$store.dispatch('camera/addArea',this.areaForm).then(data=>{
                            //刷新表格
                            this.getAreaTree();
                            this.$notify({
                                title: '消息',
                                message: '添加成功',
                                type: 'success',
                                duration:3000
                            });
                        })
                    }
                }
            })
        },
    },
	mounted() {
        this.getAreaTree();
    },
	beforeDestroy() {}
};
</script>

<style scoped>
</style>
