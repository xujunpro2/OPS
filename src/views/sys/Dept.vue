<template>
    <div class="rootDiv">
        <el-table :data="detpTree" style="width: 100%;" row-key="deptId"  :default-expand-all="true"
            :tree-props="{children: 'children'}">
            <el-table-column prop="deptName" label="部门名称" >
            </el-table-column>
            <el-table-column prop="phone" label="部门电话">
            </el-table-column>
            <el-table-column prop="address" label="部门地址">
            </el-table-column>
            <el-table-column prop="ruleId" label="操作" width="230">
                <template slot-scope="scope">
                <el-button @click="onUpdateDept(scope.row)" type="text" >修改</el-button>
                <el-button @click="onDeleteDept(scope.row)" type="text" ><span id="deleteButton">删除</span></el-button>
                </template>
            </el-table-column>
        </el-table>
        <el-row type="flex" justify="end" style="margin:20px 5px">
            <el-button icon="el-icon-circle-plus-outline"  type="primary" @click="onAddDept()">添加
            </el-button>
        </el-row>
        <el-dialog title="部门编辑" :visible.sync="dialogVisible" @open="onDialogOpen"  width="30%" :close-on-click-modal="false">
            <el-form ref="form" :model="deptForm" :rules="deptFormRules" label-width="80px" >
                <el-form-item label="部门名称" prop="deptName">
                    <el-input v-model="deptForm.deptName"></el-input>
                </el-form-item>
                <el-form-item  label="部门电话">
                    <el-input v-model="deptForm.phone"></el-input>
                </el-form-item>
                <el-form-item label="部门地址">
                    <el-input v-model="deptForm.address"></el-input>
                </el-form-item>
                <el-form-item label="上级部门">
                     <el-select v-model="deptForm.parentId" placeholder="请选择">
                        <el-option
                        v-for="item in deptOptionList"
                        :key="item.deptId"
                        :label="item.deptName"
                        :value="item.deptId">
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
    name:"Dept",
    data(){
        return {
            curDataRow:null,
            dialogVisible:false,
            detpTree:[],
            deptForm: {
                deptName: '',
                phone: '',
                address: '',
                parentId: ''
            },
            deptOptionList:[], 
            //表单验证
            deptFormRules:{
                deptName: [
                    { required: true, message: '请输入部门名称', trigger: 'blur' }
                ],
            }

        }
    },
    mounted(){
        this.setTableData();
    },
    methods:{
        setTableData(){
            this.$store.dispatch("dept/getDeptTree").then(data => {
                 this.detpTree = data;
                //生成部门列表,先清空之前的数据
                
                this.deptOptionList.length = 0;
                this.deptOptionList.push({deptId:-1,deptName:"无"});//增加一个parentId=-1的处理
                data.forEach(item=>{
                    this.getChildrenDept(item);
                })
               
            });
        },
        //迭代生成部门select控件的option数据
        getChildrenDept(dept){
            let option = {deptId:dept.deptId,deptName:dept.deptName};
            this.deptOptionList.push(option);
            let children = dept.children;
            children.forEach(element => {
                this.getChildrenDept(element);
            });
        },
        onAddDept(){
            this.curDataRow = null;
            this.dialogVisible = true;
        },
        onUpdateDept(row){
            this.curDataRow = row;
            this.dialogVisible = true;
        },
        onDeleteDept(row){
            //首先判断是否有子部门，有的话不能删除
            if(row.children.length > 0)
            {
                this.$alert("该部门包含子部门，不能删除", "错误", {
                    type: "error"
                });
                return;
            }
            this.$confirm("确定删除部门吗?", "提示", {
                confirmButtonText: '确定',
                cancelButtonText: '取消',
                type: 'warning'
            }).then(()=>{
                let deptId = row.deptId;
                this.$store.dispatch("dept/deleteDept",deptId).then(()=>{
                    this.setTableData();
                    this.$notify({
                        title: '消息',
                        message: '删除成功',
                        type: 'success',
                        duration:3000
                    });
                });
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
                this.deptForm.deptName = this.curDataRow.deptName;
                this.deptForm.phone = this.curDataRow.phone;
                this.deptForm.address = this.curDataRow.address;
                this.deptForm.parentId = this.curDataRow.parentId;
            }
            else
            {
                this.deptForm.deptName = "";
                this.deptForm.phone = "";
                this.deptForm.address = "";
                this.deptForm.parentId = -1;
            }
        },
        onSubmit(){
            this.$refs.form.validate(valid=>{
                //表单验证通过
                if(valid)
                {
                    this.dialogVisible = false;
                    //修改
                    if(this.curDataRow)
                    {
                        let dept  = {
                            deptId:this.curDataRow.deptId,
                            deptName:this.deptForm.deptName,
                            phone : this.deptForm.phone,
                            address : this.deptForm.address,
                            parentId:this.deptForm.parentId
                        }
                        this.$store.dispatch("dept/updateDept",dept).then(()=>{
                            this.setTableData();
                            this.$notify({
                                title: '消息',
                                message: '部门信息修改成功',
                                type: 'success',
                                duration:3000
                            });
                        });
                    }
                    //新建
                    else
                    {
                         let dept  = {
                            deptName:this.deptForm.deptName,
                            phone : this.deptForm.phone,
                            address : this.deptForm.address,
                            parentId:this.deptForm.parentId
                        }
                        this.$store.dispatch("dept/addDept",dept).then(()=>{
                            this.setTableData();
                            this.$notify({
                                title: '消息',
                                message: '部门添加成功',
                                type: 'success',
                                duration:3000
                            });
                        });
                    }
                }
            })
        }
    }
}
</script>
<style scoped>

</style>


