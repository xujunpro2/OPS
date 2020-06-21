<template>
    <div class="rootDiv">
        <el-row type="flex" justify="end" style="margin:20px 10px">
            <el-input clearable v-model="queryName" placeholder="请等待后续开发" prefix-icon="el-icon-search"
                style="width:200px" @input="onInputTextChange"></el-input>&emsp;
            <el-button icon="el-icon-circle-plus-outline" type="primary" @click="onAddUser()">添加
            </el-button>
        </el-row>
        <el-row style="margin-top:-10px">
            <el-table v-loading="loading" :data="tableData" tooltip-effect="dark" style="width: 100%">
                <el-table-column prop="username" label="用户名"></el-table-column>
                <el-table-column prop="realname" label="真实姓名"></el-table-column>
                <el-table-column prop="email" label="邮箱"></el-table-column>
                <el-table-column prop="mobile" label="电话"></el-table-column>
                <el-table-column prop="ruleName" label="角色"></el-table-column>
                <el-table-column label="操作" width="180">
                    <template slot-scope="scope">
                        <el-button @click="onDeleteUser(scope.row)" type="danger">删除</el-button>
                        <el-button @click="onUpdateUser(scope.row)">修改</el-button>
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
                @current-change="paginChange"></el-pagination>
        </el-row>
        <!--表单对话框-->
        <el-dialog title="用户编辑" :visible.sync="dialogVisible" @open="onDialogOpen" width="40%"
            :close-on-click-modal="false">
            <el-form ref="form" :model="userForm" :rules="userFormRules" label-width="80px">
                <el-row>
                    <el-col :span="12">
                        <el-form-item label="用户名" prop="username">
                            <el-input v-model="userForm.username" :disabled="this.nameDisabled"></el-input>
                        </el-form-item>
                        <el-form-item label="密码" prop="password">
                            <el-input v-model="userForm.password"></el-input>
                        </el-form-item>
                        <el-form-item label="真实姓名" prop="realname">
                            <el-input v-model="userForm.realname"></el-input>
                        </el-form-item>
                    </el-col>

                    <el-col :span="12">
                        <el-form-item label="手机">
                            <el-input v-model="userForm.mobile"></el-input>
                        </el-form-item>
                        <el-form-item label="邮箱">
                            <el-input v-model="userForm.email"></el-input>
                        </el-form-item>
                        <el-form-item label="角色" prop="ruleId">
                            <el-select v-model="userForm.ruleId" placeholder="请选择">
                                <el-option v-for="item in ruleOptionList" :key="item.ruleId" :label="item.ruleName"
                                    :value="item.ruleId">
                                </el-option>
                            </el-select>
                        </el-form-item>
                    </el-col>
                </el-row>
            </el-form>

            <span slot="footer" class="dialog-footer">
                <el-button @click="dialogVisible = false">取 消</el-button>
                <el-button type="primary" @click="onSubmit">确 定</el-button>
            </span>
        </el-dialog>
    </div>
</template>

<script>
import md5 from 'js-md5';
export default {
	name: "UserList",
	data() {
		return {
			queryName: "",
			tableData: [],
            pageSizeList:this.$store.state.settings.pageSizeList, //分页列表
            total:0,
            loading:true, //table的loading
            dialogVisible:false,
            nameDisabled:false,
            userForm: {
                userId: -1,
                username: '',
                password: '',
                realname: '',
                mobile: '',
                email:'',
                ruleId:''
            },
            ruleOptionList:[], //角色select控件数据
            userFormRules:{
                username: [
                    { required: true, message: '请输入用户名', trigger: 'blur' }
                ],
                password: [
                    { required: true, message: '请输入密码', trigger: 'blur' }
                ],
                realname: [
                    { required: true, message: '请输入真实姓名', trigger: 'blur' }
                ],
                ruleId: [
                    { type: 'number' , required: true, message: '请选择角色', trigger: 'change' }
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
		onAddUser() {
            this.dialogVisible = true;
            this.nameDisabled = false;
            this.userForm.userId = -1;
            this.userForm.username = "";
            this.userForm.password = "";
            this.userForm.realname = "";
            this.userForm.mobile = "";
            this.userForm.email = "";
            this.userForm.ruleId = "";
		},
		onUpdateUser(row) {
            this.dialogVisible = true;
            this.nameDisabled = true;
            this.userForm.userId = row.userId;
            this.userForm.username = row.username;
            this.userForm.password = row.password;
            this.userForm.realname = row.realname;
            this.userForm.mobile = row.mobile;
            this.userForm.email = row.email;
            this.userForm.ruleId = row.ruleId;
        },
        onDeleteUser(row) 
        {
            //如果是当前登陆用户，不允许删除
            let curUserId = this.$store.state.uv.userId;
            if(row.userId === curUserId)
            {
                this.$alert('该用户是当前登陆用户，不能删除!', '错误', {
                    confirmButtonText: '确定',
                    type:"error"
                });
                return;
            }
            this.$confirm("确定删除用户吗?", "提示", {
                confirmButtonText: '确定',
                cancelButtonText: '取消',
                type: 'warning'
            }).then(()=>{
                this.$store.dispatch("uv/deleteUser",row.userId).then(()=>{
                    this.initUserTabel();
                    this.$notify({
                        title: '消息',
                        message: '用户删除成功',
                        type: 'success',
                        duration:3000
                    });
                })
            }).catch(() => {});
            
        },
	
        onInputTextChange(text){
            console.info(text);
        },
        sizeChange(rows){
            this.$store.dispatch('settings/changePageSize',rows);
            this.tabelPagin(1);
        },
		paginChange(curPage) {
			this.tabelPagin(curPage);
        },
        //根据当前部门，初始化用户表格
        initUserTabel(){
            this.$store.dispatch("uv/count").then(data => {
                this.total = data;
                this.tabelPagin(1);
            })
            
        },
        //curPage从第一页开始
        tabelPagin(curPage){
            this.loading = true;
            let startIndex = (curPage - 1) * this.pageSize;
            let query = {startIndex:startIndex,rows:this.pageSize};
                this.$store.dispatch("uv/page",query).then(data => {
                    this.tableData = data;
                    this.loading = false;
            })
        },
        onDialogOpen(){
            //清除之前验证消息，否则会保留
            if(this.$refs.form)
            {
                this.$refs.form.clearValidate();
            }
        },
        onSubmit(){
            this.$refs.form.validate(valid=>{
                if(valid)
                {
                    this.dialogVisible = false;
                    let user = this.userForm;
                    user.md5 = md5(user.password);//md5加密
                    //修改
                    if(this.userForm.userId !== -1)
                    {
                        this.$store.dispatch("uv/setUser",user).then(data=>{
                            this.initUserTabel();
                            this.$notify({
                                title: '消息',
                                message: '用户信息修改成功',
                                type: 'success',
                                duration:3000
                            });
                        });
                    }
                    //新建
                    else
                    {
                        this.$store.dispatch("uv/addUser",user).then(data=>{
                            this.initUserTabel();
                            this.$notify({
                                title: '消息',
                                message: '用户添加成功',
                                type: 'success',
                                duration:3000
                            });
                        });
                    }
                }
            })
        },
        
	},
	mounted() {
		this.initUserTabel();
        //加载系统角色
        this.$store.dispatch("uv/getRules").then(data => {
            this.ruleOptionList.length = 0;
            data.forEach(item=>{
                let option = {ruleId:item.ruleId,ruleName:item.ruleName};
                this.ruleOptionList.push(option);
            });
        });
	},
	beforeDestroy() {}
};
</script>

<style scoped>
</style>
