<template>
    <div class="rootDiv">
        <el-form ref="form" :model="queryForm" label-width="80px">
            <el-row :gutter="10">
                <el-col :span="6">
                    <el-form-item label="监控区域">
                        <el-select v-model="queryForm.areaId" filterable placeholder="请选择" style="width: 100%;">
                            <el-option v-for="item in areaOptionList" :key="item.areaId" :label="item.areaName"
                                :value="item.areaId"></el-option>
                        </el-select>
                    </el-form-item>
                </el-col>
                <el-col :span="5">
                    <el-form-item label="开始时间">
                        <el-date-picker v-model="queryForm.beginTime" type="datetime" placeholder="选择日期"
                            style="width: 100%;"></el-date-picker>
                    </el-form-item>
                </el-col>
                <el-col :span="5">
                    <el-form-item label="结束时间">
                        <el-date-picker v-model="queryForm.endTime" type="datetime" placeholder="选择日期"
                            style="width: 100%;"></el-date-picker>
                    </el-form-item>
                </el-col>
                <el-col :span="4">
                    <el-form-item label="确认状态">
                       <el-select v-model="queryForm.confirm" filterable placeholder="请选择" style="width: 100%;">
                            <el-option v-for="item in confirmOptionList" :key="item.value" :label="item.label"
                                :value="item.value"></el-option>
                        </el-select>
                    </el-form-item>
                </el-col>
                <el-col :span="4">
                    <el-row type="flex" justify="end">
                        <el-button icon="el-icon-search" style="margin-right:10px" type="primary" @click="query()">查询
                        </el-button>
                    </el-row>
                </el-col>
            </el-row>
        </el-form>


        <el-row>
            <el-table border v-loading="loading" :data="tableData" tooltip-effect="dark" style="width: 100%">
                <el-table-column prop="happenTime" label="发生时间" >
                    <template slot-scope="scope">
						{{getTimeFormatter(scope.row.happenTime)}}
					</template>
                </el-table-column>
                <el-table-column prop="areaName" label="监控区域"></el-table-column>
                <el-table-column prop="cameraName" label="摄像头"></el-table-column>
                <el-table-column prop="eventLabel" label="事件类型"></el-table-column>
                <el-table-column prop="confirm" label="确认状态" >
                    <template slot-scope="scope">
                        <el-switch v-model="scope.row.confirm" disabled></el-switch>
                    </template>
                </el-table-column>
                <el-table-column label="操作" width="100">
                    <template slot-scope="scope">
                        <el-button @click="onConfrim(scope.row)" type="text">确认</el-button>
                    </template>
                </el-table-column>
            </el-table>
        </el-row>
        <el-row type="flex" justify="end" style="background:#fff">
            <el-pagination background layout="prev, pager, next" :page-size="pageSize" :total="total"
                 @current-change="paginChange"></el-pagination>
        </el-row>
        <!--确认对话框-->
        <el-dialog title="确认告警" :visible.sync="dialogVisible" @open="onDialogOpen"  width="30%" :close-on-click-modal="false">
            <el-form ref="form" :model="confirmForm" :rules="confirmFormRules"  label-width="80px" label-position="top">
                <el-form-item label="确认内容:" prop="confirmContent">
                    <el-input type="textarea" :rows="5" v-model="confirmForm.confirmContent" placeholder="请输入内容"></el-input>
                </el-form-item>
                <el-form-item label="是否误报:">
                    <el-switch v-model="confirmForm.exception"></el-switch>
                </el-form-item>
                <!--只有已确认的事件，才显示确认时间-->
                <el-form-item v-if="confirmForm.confirmTime != null" label="确认时间:">
                    <el-input disabled v-model="confirmForm.confirmTime"></el-input>
                </el-form-item>
            </el-form>
            <span slot="footer" class="dialog-footer">
                <el-button  @click="dialogVisible = false">取 消</el-button>
                <el-button  type="primary" @click="submitConfirm()">提 交</el-button>
            </span>
        </el-dialog>
    </div>
</template>

<script>
import request from "@/utils/request.js";
import CommonTool from '@/utils/commonTool'
export default {
	name: "InruptAlarm",
	data() {
		return {
			queryForm: {
				areaId: null,
				beginTime: null,
				endTime: null,
				confirm: null,
            },
            confirmOptionList:[],
            areaOptionList: [],
            tableData:[],
            pageSize:Number(this.$store.state.uv.specail.pageSize), //设置都是varchar的，要转数字
            total:0,
            loading:false, //table的loading

            dialogVisible:false,
            curDataRow:null,//表单当前选中行
            confirmForm:{
                confirmContent:null,
                exception:false,//误报
                confirmTime:null,
            },
             //表单验证
            confirmFormRules:{
                confirmContent: [
                    { required: true, message: '请输入确认内容', trigger: 'blur' }
                ]
            }
		};
    },

	methods: {
        initConfirmOptions(){
            this.confirmOptionList.push({label:'全部',value:null})
            this.confirmOptionList.push({label:'未确认',value:0})
            this.confirmOptionList.push({label:'已确认',value:1})
        },
		initAreaOptions() {
			this.$store.dispatch("camera/areaList").then(data => {
                //先增加一个全部选项
                var allOption = {
                    areaId:null,
                    areaName:'全部区域',
                }
                this.areaOptionList.push(allOption);
				data.forEach(item => {
					if (item.alarmEnable) {
						this.areaOptionList.push(item);
					}
				});
			});
        },
        //获得查询表单的数据
        getQueryParam(){
             //不填值就是null
            let begin = null;
            if(this.queryForm.beginTime)
            {
                begin = this.queryForm.beginTime.getTime();
            }
            let end = null;
            if(this.queryForm.endTime)
            {
                end = this.queryForm.endTime.getTime();
            }
            var param = {
                areaId:this.queryForm.areaId,
                beginTime:begin,
                endTime:end,
                confirm:this.queryForm.confirm
            }
            return param
        },
        //初始化Table，先查询count，再查询表格
        initTable(){
            let param = this.getQueryParam();
            this.$store.dispatch('camera/eventPageCount',param).then(data=>{
                this.total = data.count;
                return new Promise((resolve,rejects)=>{
                    resolve()
                })
            }).then(()=>{
                this.tabelPagin(1)
            })
        },
         //curPage从第一页开始
        tabelPagin(curPage){
            this.loading = true;
            let startIndex = (curPage - 1) * this.pageSize;
            let param = this.getQueryParam()
            param.startIndex = startIndex
            param.rows = this.pageSize
  
            this.$store.dispatch("camera/eventPage",param).then(data => {
                this.tableData = data;
                this.loading = false;
            }).catch(()=>{
                this.loading = false;
            })
        },
        //分页
        paginChange(curPage) {
			this.tabelPagin(curPage);
        },
        //讲timestamp转为格式化时间
         //buyDate列格式化显示
        getTimeFormatter(time){
            var date = new Date(time);
            var formatStr = CommonTool.formatData(date,'yyyy-MM-dd hh:mm:ss');
            return formatStr;
        },
		query() {
            this.initTable();
        },
        //打开确认对话框
        onConfrim(row){
            this.curDataRow = row;
            this.dialogVisible = true;
        },
        //打开确认对话框
        onDialogOpen(){
            //清除之前验证消息，否则会保留
            if(this.$refs.form)
            {
                this.$refs.form.clearValidate();
            }
            if(this.curDataRow)
            {
                let eventId = this.curDataRow.eventId
                this.$store.dispatch('camera/eventById',{eventId:eventId}).then(data=>{
                    this.confirmForm.confirmContent = data.confirmContent;
                    this.confirmForm.exception = data.exception;
                    if(data.confirmTime != 0)
                    {
                        var date = new Date(data.confirmTime);
                        var formatStr = CommonTool.formatData(date,'yyyy-MM-dd hh:mm:ss');
                        this.confirmForm.confirmTime = formatStr;
                    }
                    
                })
            }
        },
        submitConfirm(){
             this.$refs.form.validate(valid=>{
                if(valid)
                {
                    this.dialogVisible = false;
                    if(this.curDataRow)
                    {
                        var param = {
                            confirmUser:this.$store.state.uv.userId,
                            confirmContent:this.confirmForm.confirmContent,
                            confirmTime:new Date().getTime(),
                            exception:this.confirmForm.exception,
                            eventId:this.curDataRow.eventId,
                        }
                        this.$store.dispatch('camera/eventConfrim',param).then(data=>{
                             //刷新表格
                            this.initTable();
                            this.$notify({
                                title: '消息',
                                message: '事件确认成功',
                                type: 'success',
                                duration:3000
                            });
                        })
                    }
                    
                }
             })
        },
		mock() {
			var data = {
				method: "OnEventNotify",
				params: {
					events: [
						{
							//事件唯一标识 String
							eventId: "56rt4545672dsw244",
							//事件等级 0-未配置 1-低 2-中 3-高   false
							eventLvl: 1,
							//事件状态  0-瞬时 1-开始 2-停止 3-事件脉冲 4-事件联动结果更新 5-异步图片上传
							status: 1,
							//事件源编号，物理设备是资源编号
							srcIndex: "dce03e98c2aa44169a8c9694d40139b6", //金竹牌摄像头
							eventType: 131588,
							happenTime: "2020-05-17T 15:53:47.000+08:00"
						}
					]
				}
			};

			var json = JSON.stringify(data);
			var encodeJson = encodeURI(json);
			request.post("event/receive.action", json).then(data => {
				console.info(data);
			});
		}
	},
	mounted() {
        this.initAreaOptions();
        this.initConfirmOptions();
	},
	beforeDestroy() {}
};
</script>

<style scoped>
</style>
