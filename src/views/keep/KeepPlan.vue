<template>
	<div class="rootDiv">
        <el-form :model="queryForm" label-width="80px">
            <el-row :gutter="10">
                <el-col :span="5">
                    <el-form-item label="计划名称">
                         <el-input v-model="queryForm.planName" placeholder="支持模糊查询" clearable></el-input>
                    </el-form-item>
                </el-col>
                
                <el-col :span="5">
                    <el-form-item label="执行周期">
                       <el-select v-model="queryForm.period"  placeholder="请选择" style="width: 100%;">
                            <el-option v-for="item in queryPeriodOptions" :key="item.value" :label="item.label"
                                :value="item.value"></el-option>
                        </el-select>
                    </el-form-item>
                </el-col>

                <el-col :span="5">
                    <el-form-item label="设备类型">
                       <el-select v-model="queryForm.devType" filterable  placeholder="请选择" style="width: 100%;">
                            <el-option v-for="item in queryTypeOptions" :key="item.devTypeId" :label="item.devTypeName"
                                :value="item.devTypeId"></el-option>
                        </el-select>
                    </el-form-item>
                </el-col>

                <el-col :span="4" style="padding-left:20px">
                    <el-button icon="el-icon-search" style="margin-right:10px" type="primary" @click="query()">查询
                    </el-button>
                </el-col>

                <el-col :span="5">
                    <el-row type="flex" justify="end">
                        <el-button icon="el-icon-circle-plus-outline" style="margin-right:10px" type="primary" @click="onAdd()">新建
                        </el-button>
                    </el-row>
                </el-col>
            </el-row>
        </el-form>

        <el-table v-loading="loading" border :data="tableData" tooltip-effect="dark" style="width: 100%">
            <el-table-column prop="planName" label="计划名称"></el-table-column>
            <el-table-column prop="period" label="保养周期">
                <template slot-scope="scope">
                    {{getIntervalText(scope.row.planInterval,scope.row.period)}}
                </template>
            </el-table-column>
            <el-table-column prop="planDesc" label="具体描述"></el-table-column>
            <el-table-column prop="devTypeName" label="设备类型"></el-table-column>
            <el-table-column label="操作" width="200">
                <template slot-scope="scope">
                    <el-button @click="onDelete(scope.row)" type="danger">删除</el-button>
                    <el-button @click="onUpdate(scope.row)">修改</el-button>
                </template>
            </el-table-column>
        </el-table>

        <!--对话框-->
        <el-dialog title="计划编辑" :visible.sync="dialogVisible" @open="onDialogOpen"  width="450px" :close-on-click-modal="false">
            <el-form ref="form" :model="planForm" :rules="planFormRules" label-width="80px" >
                <el-form-item label="计划名称" prop="planName">
                    <el-input v-model="planForm.planName"></el-input>
                </el-form-item>
                <el-form-item label="计划间隔">
                    <el-input-number v-model="planForm.planInterval" :min="1" ></el-input-number>
                </el-form-item>
                <el-form-item label="间隔周期">
                    <el-select v-model="planForm.period"  placeholder="请选择" style="width: 100%;">
                        <el-option v-for="item in periodOptions" :key="item.value" :label="item.label"
                            :value="item.value"></el-option>
                    </el-select>
                </el-form-item>
                <el-form-item label="设备类型">
                    <el-select v-model="planForm.devType"  placeholder="请选择" style="width: 100%;">
                        <el-option v-for="item in typeOptions" :key="item.devTypeId" :label="item.devTypeName"
                            :value="item.devTypeId"></el-option>
                    </el-select>
                </el-form-item>
                <el-form-item label="具体描述">
                    <el-input v-model="planForm.planDesc" type="textarea" :rows="5"></el-input>
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
	name: "KeppPlan",
	data() {
		return {
            queryForm:{
                planName:null,
                period:null,//周期
                devType:null,//设备类型
            },
            queryPeriodOptions:[
                {value:null,label:'全部'},
                {value:1,label:'小时'},
                {value:2,label:'日'},
                {value:3,label:'月'},
                {value:4,label:'季度'},
                {value:5,label:'年'}
            ],
            queryTypeOptions:[],

            //表格
            loading:false,
            tableData:[],

            //对话框
            curRow:null,
            dialogVisible:false,
            planForm:{
                planId:null,
                planName:null,
                planInterval:null,
                period:null,
                planDesc:null,
                devType:null,
            },
            planFormRules:{
                planName: [
                    { required: true, message: '请输入计划名称', trigger: 'blur' }
                ],
            },
            typeOptions:[],
            periodOptions:[
                {value:1,label:'小时'},
                {value:2,label:'日'},
                {value:3,label:'月'},
                {value:4,label:'季度'},
                {value:5,label:'年'}
            ],

        };
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
        query(){
            this.loading = true;
            this.$store.dispatch('keep/queryPlan',this.queryForm).then(data=>{
                this.loading = false;
                this.tableData = data;
            }).catch(()=>{this.loading=false})
        },
        getIntervalText(interval,period){
            let periodText = '';
            switch(period)
            {
                case 1:
                    periodText = '小时'
                    break;
                case 2:
                    periodText = '日'
                    break;
                case 3:
                    periodText = '月'
                    break;
                case 4:
                    periodText = '季度'
                    break;
                case 5:
                    periodText = '年'
                    break;
                default:
                    periodText = '未知'
                    break;
            }
            return interval+" / "+periodText
        },

        onDialogOpen(){
            //清除之前验证消息，否则会保留
            if(this.$refs.form)
            {
                this.$refs.form.clearValidate();
            }
        },
        onDelete(row){
            this.$confirm("确定删除该数据吗?", "提示", {
                confirmButtonText: '确定',
                cancelButtonText: '取消',
                type: 'warning'
            }).then(()=>{
                let planId = row.planId
                this.$store.dispatch('keep/deletePlan',planId).then(()=>{
                    //刷新表格
                    this.query();
                    this.$notify({title: '消息', message: '删除成功',type: 'success',duration:3000});
                })
            })
            .catch(()=>{})
        },
        onAdd(){
            this.curRow = null;
            for(let key in this.planForm)
            {
                this.planForm[key] = null;
            }
            this.dialogVisible = true;
        },
        onUpdate(row){
            this.curRow = row;
            for(let key in this.planForm)
            {
                this.planForm[key] = this.curRow[key];
            }
            this.dialogVisible = true;
        },
        onSubmit(){
            this.$refs.form.validate(valid=>{
                if(valid)
                {
                    this.dialogVisible = false;
                    if(this.curRow)
                    {
                        this.$store.dispatch('keep/updatePlan',this.planForm).then(data=>{
                            if(data == 1)
                            {
                                this.query();
                                this.$notify({title: '消息',message: '修改成功',type: 'success',duration:3000});
                            }
                        })
                    }
                    else
                    {
                        this.$store.dispatch('keep/addPlan',this.planForm).then(data=>{
                            if(data == 1)
                            {
                                  this.query();
                                  this.$notify({title: '消息',message: '添加成功',type: 'success',duration:3000});
                            }
                        })
                    }
                }
            })
        },
    },
	mounted() {
        this.initTypeOptions();
        this.query();//默认查所有的
    },
	beforeDestroy() {}
};
</script>

<style scoped>
</style>
