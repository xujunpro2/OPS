<template>
    <el-dialog title="选择人员" :visible.sync="dialogVisible" @open="onDialogOpen" width="1100px"
        :close-on-click-modal="false" :append-to-body="inner">
        <el-form :inline="true" ref="queryForm" :model="queryForm" label-width="80px">
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
            <el-form-item>
                <el-button type="primary" @click="onQuery" icon="el-icon-search">查询</el-button>
            </el-form-item>
        </el-form>

        <el-table ref="table" highlight-current-row @row-click="onRowClick" height="300" v-loading="loading"
            :data="tableData" style="width: 100%;">
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
            <el-table-column prop="memberTypeName" label="工种">
                <template slot-scope="scope">
                    <span v-html="getMemberTypeDescHtml(scope.row)"></span>
                </template>
            </el-table-column>
        </el-table>

        <el-row type="flex" justify="end" style="background:#fff">
            <el-pagination ref="pagination" background layout="total, prev, pager, next" :page-size="pageSize"
                :total="total" @current-change="paginChange"></el-pagination>
        </el-row>
        <span v-for="tag in this.selectedMembers">
            <el-tag :key="tag.memberId" closable @close="onTagClose(tag)">
                {{tag.memberName}}
            </el-tag>
            &nbsp;
        </span>

        <span slot="footer" class="dialog-footer">
            <el-button @click="dialogVisible = false">取 消</el-button>
            <el-button type="primary" @click="onSubmit">确 定</el-button>
        </span>
    </el-dialog>
</template>

<script>
import CommonTool from '@/utils/commonTool.js'
export default {
	name: "SelectMemberDialog",
	data() {
		return {
            queryForm:{
                memberName:null,
                memberType:null,
                memberSex:null,
            },
            querySexOptions:[{value:null,label:'全部'},{value:1,label:'男'},{value:0,label:'女'}],
            queryMemberTypeOptions:[
                {value:null,label:'全部'},
                {label:'巡检人员',value:'inspect'},
                {label:'检修人员',value:'repair'}
            ],

            loading: false,
			tableData: [],
			total: 0,
            pageSize: 10, //设备分页固定50条一页

            selectedMembers:[],//当前选中的所有人员，因为数组直接索引操作，不能触发watch和compute，所以直接通过method触发

            dialogVisible:false,
        };
    },
    props: {
        inner:{
            type:Boolean,
            default:true,
        },
        memberType:{
            type:String,
            default:null,
        }
    },
	methods: {
        onSubmit(){
            this.dialogVisible = false;
            //拷贝一份
            let members = [];
            this.selectedMembers.forEach(item=>{
                members.push({
                    memberId:item.memberId,
                    memberName:item.memberName
                })
            })
            this.$emit('selected',members);
        },
        onDialogOpen(){
            this.selectedMembers.splice(0,this.selectedMembers.length);
        },
        //Tag控件close的时候
        onTagClose(tag){
            //刷新this.selectedDevs
            this.selectedMembers.splice(this.selectedMembers.indexOf(tag),1);
        },
        // row click
        onRowClick(row, column){
            //如果this.selectedMembers没有包含，就add
            let contain = false;
            this.selectedMembers.forEach(item=>{
                if(item.memberId == row.memberId)
                {
                    contain = true;
                }
            })
            if(!contain)
            {
                this.selectedMembers.push({
                    memberId:row.memberId,
                    memberName:row.memberName
                })
            }
        },
        //加入查询条件
        onQuery(){
            this.initTabel();
        },
		//初始化表格
		initTabel() {
            if(this.$refs.table)
            {
                this.$refs.table.setCurrentRow(null);
            }
            this.$store.dispatch("system/memberCount",this.queryForm).then(data => {
                this.total = data;
                this.tabelPagin(1);
            })
		},
		//分页事件
		paginChange(curPage) {
			this.tabelPagin(curPage);
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
        getBirthdayStr(birthday){
            let time = new Date(birthday);
            return CommonTool.formatData(time,'yyyy-MM-dd')
        },
        getMemberTypeDescHtml(row){
            let desc = '';
            if(row.inspect == 1)
            {
                desc +="巡检&emsp;";
            }
            if(row.repair == 1)
            {
                desc +="检修&emsp;";
            }
            return desc;
        },
    },
	mounted() {
        this.queryForm.memberType = this.memberType
        this.$nextTick(()=>{
            this.onQuery();
        })
       
    },
	beforeDestroy() {}
};
</script>

<style scoped>
</style>
