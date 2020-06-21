<template>
    <div class="rootDiv">
        <el-form :inline="true" :model="queryForm" label-width="80px">
            <el-form-item label="工号">
                <el-input v-model="queryForm.memberCode" clearable></el-input>
            </el-form-item>
            <el-form-item label="姓名">
                <el-input v-model="queryForm.memberName" placeholder="支持模糊查询" clearable></el-input>
            </el-form-item>
            <el-form-item label="性别">
                <el-select v-model="queryForm.memberSex" placeholder="请选择" style="width: 100%;">
                    <el-option v-for="item in querySexOptions" :key="item.value" :label="item.label"
                        :value="item.value"></el-option>
                </el-select>
            </el-form-item>
            <el-form-item label="工种">
                <el-select v-model="queryForm.memberType" filterable placeholder="请选择" style="width: 100%;">
                    <el-option v-for="item in queryMemberTypeOptions" :key="item.value" :label="item.label"
                        :value="item.value"></el-option>
                </el-select>
            </el-form-item>
            <el-button icon="el-icon-search" style="margin-right:10px" type="primary" @click="query()">查询
            </el-button>

            <el-button icon="el-icon-circle-plus-outline" style="margin-right:10px" type="primary" @click="onAdd()">新建
            </el-button>


        </el-form>
        <el-table v-loading="loading" border :data="tableData" tooltip-effect="dark" style="width: 100%">
            <el-table-column prop="memberCode" label="工号"></el-table-column>
            <el-table-column prop="memberName" label="姓名"></el-table-column>
            <el-table-column prop="memberSex" label="性别">
                <template slot-scope="scope">
                    <span v-if="scope.row.memberSex == 0">女</span>
                    <span v-if="scope.row.memberSex == 1">男</span>
                </template>
            </el-table-column>
            <el-table-column prop="memberBirthday" label="生日">
                <template slot-scope="scope">
                    {{getBirthdayStr(scope.row.memberBirthday)}}
                </template>
            </el-table-column>
            <el-table-column prop="memberPhone" label="电话"></el-table-column>
            <el-table-column prop="memberTypeName" label="工种"></el-table-column>
            <el-table-column label="操作" width="200">
                <template slot-scope="scope">
                    <el-button @click="onDelete(scope.row)" type="danger">删除</el-button>
                    <el-button @click="onUpdate(scope.row)">修改</el-button>
                </template>
            </el-table-column>
        </el-table>
        <el-row type="flex" justify="end" style="background:#fff">
            <el-pagination background layout="total, sizes, prev, pager, next" :page-sizes="pageSizeList"
                :page-size="pageSize" :total="total" @size-change="sizeChange" @current-change="paginChange">
            </el-pagination>
        </el-row>


        <!--人员表单对话框-->
        <el-dialog title="运维人员信息" :visible.sync="dialogVisible" @open="onDialogOpen" width="400px"
            :close-on-click-modal="false">
            <el-form ref="form" :model="memberForm" :rules="memberFormRules" label-width="60px">
                <el-row>
                    <el-form-item label="工号" prop="memberCode">
                        <el-input v-model="memberForm.memberCode"></el-input>
                    </el-form-item>
                    <el-form-item label="姓名" prop="memberName">
                        <el-input v-model="memberForm.memberName"></el-input>
                    </el-form-item>
                    <el-form-item label="性别">
                        <el-select v-model="memberForm.memberSex" placeholder="请选择" style="width:100%">
                            <el-option v-for="item in sexOptions" :key="item.value" :label="item.label"
                                :value="item.value"></el-option>
                        </el-select>
                    </el-form-item>
                    <el-form-item label="生日">
                        <el-date-picker v-model="memberForm.memberBirthday" type="date" placeholder="选择日期"
                            style="width:100%">
                        </el-date-picker>
                    </el-form-item>
                    <el-form-item label="电话" prop="memberPhone">
                        <el-input v-model="memberForm.memberPhone"></el-input>
                    </el-form-item>
                    <el-form-item label="工种">
                        <el-select v-model="memberForm.memberType" placeholder="请选择" style="width:100%">
                            <el-option v-for="item in memberTypeOptions" :key="item.value" :label="item.label"
                                :value="item.value"></el-option>
                        </el-select>
                    </el-form-item>
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
import CommonTool from '@/utils/commonTool.js'
export default {
    name: "Member",
    data() {
        return {
            queryForm:{
                memberCode:null,
                memberName:null,
                memberType:null,
                memberSex:null,
            },
            querySexOptions:[{value:null,label:'全部'},{value:1,label:'男'},{value:0,label:'女'}],
            queryMemberTypeOptions:[],

            //表格
            tableData:[],
            loading:false,
            pageSizeList:this.$store.state.settings.pageSizeList, //分页列表
            total:0,

            //对话框
            curRow:null, //当前选中的行
            dialogVisible:false,
            memberForm:{
                memberId:null,
                memberCode:null,
                memberName:null,
                memberType:null,
                memberSex:null,
                memberBirthday:null,
                memberPhone:null,
            },
            memberFormRules:{
                memberCode: [
                    { required: true, message: '请输入工号', trigger: 'blur' }
                ],
                memberName: [
                    { required: true, message: '请输入姓名', trigger: 'blur' }
                ],
                memberPhone: [
                    { required: true, message: '请输入电话', trigger: 'blur' }
                ],
            },
            sexOptions:[{value:1,label:'男'},{value:0,label:'女'}],
            memberTypeOptions:[],

        }
    },
    computed:{
        pageSize() {
            return this.$store.state.settings.pageSize
        },
    },
    methods: {
        query(){
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
            //初始化参数
            this.$store.dispatch("system/memberCount",this.queryForm).then(data => {
                this.total = data;
                this.tabelPagin(1);
            })
        },
        //分页控件事件,curPage从第一页开始
        tabelPagin(curPage){
            //分页
            let startIndex = (curPage - 1) * this.pageSize;
            this.queryForm.startIndex = startIndex;
            this.queryForm.rows = this.pageSize;
            this.$store.dispatch("system/memberPage",this.queryForm).then(data => {
                this.tableData = data;
                this.loading = false;
            }).catch(()=>{
                this.loading = false;
            })
        },

        onDialogOpen(){
            //清除之前验证消息，否则会保留
            if(this.$refs.form)
            {
                this.$refs.form.clearValidate();
            }
            if(this.curRow)
            {
                for(let key in this.memberForm)
                {
                    this.memberForm[key] = this.curRow[key];
                    //日期处理成date
                    this.memberForm.memberBirthday = new Date(this.memberForm.memberBirthday);
                }
            }
            else
            {
                for(let key in this.memberForm)
                {
                    this.memberForm[key] = null;
                }
            }
        },
        onAdd(){
            this.curRow = null;
            this.dialogVisible = true;
        },
       
        onUpdate(row){
            this.curRow = row;
            this.dialogVisible = true;
        },
        onDelete(row){},
        onSubmit(){
            this.$refs.form.validate(valid=>{
                if(valid)
                {
                    this.dialogVisible = false;
                    if(this.curRow)
                    {
                        let memberBirthday = this.memberForm.memberBirthday.getTime();
                        this.memberForm.memberBirthday = memberBirthday;
                        this.$store.dispatch('system/updateMember',this.memberForm).then(data=>{
                            this.$notify({title: '消息',message: '修改成功',type: 'success',duration:3000});
                            this.initTable();
                        })
                    }
                    else
                    {
                        let memberBirthday = this.memberForm.memberBirthday.getTime();
                        this.memberForm.memberBirthday = memberBirthday;
                        this.$store.dispatch('system/addMember',this.memberForm).then(data=>{
                            this.$notify({title: '消息',message: '添加成功',type: 'success',duration:3000});
                            this.initTable();
                        })
                    }
                }
            });
            
        },
        initMemberTypeOptions(){
            this.$store.dispatch('system/getDictionary','memberType').then(data=>{
                if(data)
                {
                    this.queryMemberTypeOptions.push({value:null,label:'全部'})
                    for(let key in data)
                    {
                       this.queryMemberTypeOptions.push({value:key,label:data[key]})
                       this.memberTypeOptions.push({value:key,label:data[key]})
                    }
                }
            })
        },
        getBirthdayStr(birthday){
            let time = new Date(birthday);
            return CommonTool.formatData(time,'yyyy-MM-dd')
        },
  },
  mounted() {
      this.initMemberTypeOptions();
      this.query();
  },
  beforeDestroy() {}
};
</script>

<style scoped>

</style>
