<template>
	<div class="rootDiv">
        <el-form :inline="true" ref="queryForm" :model="queryForm" label-width="80px">
            <el-form-item label="故障时间">
                 <el-date-picker v-model="queryForm.createTime" type="datetimerange" range-separator="至"
                     start-placeholder="开始日期" end-placeholder="结束日期">
                 </el-date-picker>
            </el-form-item>
            <el-form-item label="设备类型">
                 <el-select v-model="queryForm.devType" filterable placeholder="请选择" style="width: 100%;">
                     <el-option v-for="item in queryTypeOptions" :key="item.devTypeId" :label="item.devTypeName"
                         :value="item.devTypeId"></el-option>
                 </el-select>
            </el-form-item>
            <el-form-item label="设备">
                <el-input :readonly="true" v-model="queryForm.devName" >
                    <el-button slot="append" icon="el-icon-search" @click="openSelectDevDialog('query')"></el-button>
                </el-input>
            </el-form-item>
            <el-form-item label="故障来源">
                 <el-select v-model="queryForm.sourceTarget" filterable placeholder="请选择" style="width: 100%;">
                     <el-option v-for="item in sourceTargetOptions" :key="item.value" :label="item.label"
                         :value="item.value"></el-option>
                 </el-select>
            </el-form-item>
            <el-form-item label="处理方式">
                 <el-select v-model="queryForm.excute" filterable placeholder="请选择" style="width: 100%;">
                     <el-option v-for="item in queryExcuteOptions" :key="item.value" :label="item.label"
                         :value="item.value"></el-option>
                 </el-select>
            </el-form-item>

            <el-form-item>
                <el-button type="primary" @click="onQuery" icon="el-icon-search">查询</el-button>
            </el-form-item>
            <el-form-item>
                <el-button type="primary" @click="onAdd" icon="el-icon-circle-plus-outline">人工创建</el-button>
            </el-form-item>
        </el-form>

        <el-table v-loading="loading" border :data="tableData" tooltip-effect="dark" style="width: 100%">
            <el-table-column prop="createTime" label="故障时间" align="center">
                <template slot-scope="scope">
                    {{getTimeStr(scope.row.createTime)}}
                </template>
            </el-table-column>
			<el-table-column prop="spaceName" label="区域" align="center"></el-table-column>
			<el-table-column prop="devName" label="设备" align="center"></el-table-column>
            <el-table-column prop="devCode" label="设备编码" align="center"></el-table-column>
            <el-table-column prop="exceptionContext" label="故障描述" align="center"></el-table-column>
            <el-table-column prop="excute" label="处理方式" align="center">
                <template slot-scope="scope">
                    <span v-if="scope.row.excute == 1">简易处理</span>
                    <span v-if="scope.row.excute == 2">设备报修</span>
                </template>
            </el-table-column>
            <el-table-column prop="sourcTarget" label="故障来源" align="center">
                <template slot-scope="scope">
                    <span v-if="scope.row.sourcTarget == 1">巡检</span>
                    <span v-if="scope.row.sourcTarget == 2">保养</span>
                    <span v-if="scope.row.sourcTarget == 3">人工填报</span>
                </template>
            </el-table-column>
           
            <el-table-column label="操作" align="center">
                <template slot-scope="scope">
                    <el-tooltip  effect="dark" content="详细信息" placement="bottom">
                        <el-button icon="el-icon-view" circle @click="onView(scope.row)"></el-button>
                    </el-tooltip>
                </template>
            </el-table-column>
        </el-table>
        <el-row type="flex" justify="end" style="background:#fff">
            <el-pagination background layout="total, sizes, prev, pager, next" 
                :page-sizes="pageSizeList"
                :page-size="pageSize"  
                :total="total"
                @size-change="sizeChange"
                @current-change="paginChange">
            </el-pagination>
        </el-row>
        <el-dialog title="详细信息" :visible.sync="dialogVisible" @open="onDialogOpen"  width="30%"  :close-on-click-modal="false">
            <el-card v-if="curRow != null" class="box-card" style="height:100%;margin-top:5px">
                <div slot="header" class="clearfix">
					<span class="cardTitie">故障信息</span>
				</div>
                <el-form label-width="80px" >
                    <el-form-item label="故障描述:" style="margin-bottom: 5px;">
                        {{curRow.exceptionContext}}
                    </el-form-item>
                    <!--如果是简易处理，那么显示处理信息-->
                    <el-form-item v-if="curRow.simpleExcuteContent != null" label="简易处理:" style="margin-bottom: 5px;">
                            {{curRow.simpleExcuteContent}}
                    </el-form-item>
                    <!--如果是检修工单，显示检修工单编码和名称-->
                    <el-form-item v-else label="检修工单:" style="margin-bottom: 5px;">
                            显示检修工单编码和名称
                    </el-form-item>

                    <!--如果来源是巡检-->
                    <el-form-item v-if="inspectData != null" label="巡检任务:" style="margin-bottom: 5px;">
                            <span v-html="taskInfo"></span>
                    </el-form-item>
                    <el-form-item v-if="inspectData != null" label="检查点:" style="margin-bottom: 5px;">
                            {{inspectData.pointName}}
                    </el-form-item>
                    <el-form-item v-if="inspectData != null" label="发现人:" style="margin-bottom: 5px;">
                            {{inspectData.memberName}}
                    </el-form-item>
                    <!--如果来源是维保-->
                    <el-form-item v-if="keepData != null" label="维保任务:" style="margin-bottom: 5px;">
                            <span v-html="keepInfo"></span>
                    </el-form-item>
                    <el-form-item v-if="keepData != null" label="发现人:" style="margin-bottom: 5px;">
                            {{keepData.memberName}}
                    </el-form-item>

                    <el-form-item v-if="curRow.images != null" label="现场照片:" style="margin-bottom: 5px;">
                        <el-image v-for="(url,index) in curRow.images" :key="index" style="width: 100px; height: 100px;margin:3px" :src="url" :preview-src-list="[url]">
                            <!--图片未加载的占位内容-->
                            <div slot="placeholder" class="image-solt"><i class="el-icon-loading"></i></div>
                            <!--加载失败的内容-->
                            <div slot="error" class="image-solt"><i class="el-icon-picture-outline"></i> </div>
                        </el-image>
                    </el-form-item>
                </el-form>
            </el-card>
        </el-dialog>

        <!--人工创建设备故障-->
        <el-dialog title="设备故障" :visible.sync="addDialogVisible" @open="onAddDialogOpen"  width="30%"  :close-on-click-modal="false">
            <el-form ref="addForm"  :model="addForm" :rules="addFormRules" label-width="80px">
                <el-form-item label="设备" prop="devCode">
                    <el-input :readonly="true" v-model="addForm.devName" >
                        <el-button slot="append" icon="el-icon-search" @click="openSelectDevDialog('add')"></el-button>
                    </el-input>
                </el-form-item>
                <el-form-item label="故障描述" prop="exceptionContext">
                    <el-input type="textarea" v-model="addForm.exceptionContext" :rows="4" placeholder="请输入内容"  maxlength="256" show-word-limit ></el-input>
                </el-form-item>
                <el-form-item label="发现人" prop="memberName">
                    <el-input :readonly="true" v-model="addForm.memberName" >
                        <el-button slot="append" icon="el-icon-search" @click="openSelectMemberDialog"></el-button>
                    </el-input>
                </el-form-item>
                <el-form-item label="处理方式">
                    <el-select v-model="addForm.excute" filterable placeholder="请选择" >
                        <el-option v-for="item in excuteOptions" :key="item.value" :label="item.label"
                            :value="item.value"></el-option>
                    </el-select>
                </el-form-item>
                <el-form-item v-if="addForm.excute == 1" label="处理描述">
                    <el-input type="textarea" v-model="addForm.simpleExcuteContent" :rows="4" placeholder="请输入内容"  maxlength="256" show-word-limit ></el-input>
                </el-form-item>

                <el-form-item label="现场照片">
                    <el-upload ref="elUpload" list-type="picture-card" :action="exceptionUpload" :on-success="onUploadSuccess" :on-error="onUploadError"
                            :on-remove="onRemoveUpload" :on-preview="handlePictureCardPreview">
                                 <i class="el-icon-plus"></i>
                    </el-upload>
                    <el-dialog :visible.sync="picDialogVisible" :append-to-body="true">
                        <img width="100%" :src="picDialogImageUrl" alt="">
                    </el-dialog>
                </el-form-item>
            </el-form>
            <span slot="footer" class="dialog-footer">
                <el-button  @click="addDialogVisible = false">取 消</el-button>
                <el-button  type="primary" @click="onAddSubmit">确 定</el-button>
            </span>
        </el-dialog>
        <!--选择设备对话框-->
        <select-dev-dialog ref="selectDevDialog" @selected="onDevDialogSelected"></select-dev-dialog>
        <!--选择保养人员对话框-->
        <select-member-dialog ref="selectMemberDialog" @selected="onMemberDialogSelected"></select-member-dialog>
    </div>
</template>

<script>
import CommonTool from '@/utils/commonTool.js'
import SelectDevDialog from '@/components/Dev/SelectDevDialog'
import SelectMemberDialog from '@/components/Dev/SelectMemberDialog'
export default {
    name: "Exception",
    components:{SelectDevDialog,SelectMemberDialog},
	data() {
		return {
            action:'query',//查询和人工创建的设备选择对话框都共用一个，这里用action来标记是那个动作打开对话框
            queryForm:{
                devName:null,
                createTime:[],//时间范围是一个数组绑定对象
                devType:null,
                devCode:null,
                sourceTarget:null,
                excute:null,
            },
            query:null,//查询参数，这里因为queryForm.createTime需要处理，统一在query()中生产该对象
            queryTypeOptions:[],
            queryExcuteOptions:[
                {label:'全部',value:null},
                {label:'简易处理',value:1},
                {label:'设备报修',value:2}
            ],
            sourceTargetOptions:[
                {label:'全部',value:null},
                {label:'巡检',value:1},
                {label:'保养',value:2},
                {label:'人工填报',value:3}
            ],
           

             //表格
            loading:false,
            tableData:[],
            pageSizeList:this.$store.state.settings.pageSizeList, //分页列表
            total:0,

            //查看故障详细信息对话框
            curRow:null,
            inspectData:null,//curRow相关的巡检信息
            keepData:null,//curRow相关的维保信息
            dialogVisible:false,

            //人工创建故障对话框
            addDialogVisible:false,
            addForm:{
                devName:null,
                devCode:null,
                exceptionContext:null,
                exceptionImagePath:null,
                excute:2,
                simpleExcuteContent:null,
                memberId:null,
                memberName:null
            },
            addFormRules:{
                devCode: [
                    { required: true, message: '请选择设备', trigger: 'change' }
                ],
                exceptionContext: [
                    { required: true, message: '请填写故障描述', trigger: 'blur' }
                ],
                memberName: [
                    { required: true, message: '请选择故障发现人', trigger: 'change' }
                ],
            },
            uploadedImages:new Map(),//记录上传图片，以便最后提交的时候保存到数据库中
            excuteOptions:[{label:'简易处理',value:1},{label:'设备报修',value:2}],
            exceptionUpload:this.$store.state.settings.server+"upload/exception.action",

            //预览上传图片
            picDialogVisible:false,
            picDialogImageUrl: '',
        };
    },
     computed:{
        pageSize() {
            return this.$store.state.settings.pageSize
        },
        taskInfo(){
            if(this.inspectData)
            {
                return this.inspectData.taskName+"<span style='color:#409EFF'>&emsp;("+this.inspectData.taskCode+")</span>"
            }
            return ''
        },
        keepInfo(){
            if(this.keepData)
            {
                return this.keepData.keepName+"<span style='color:#409EFF'>&emsp;("+this.keepData.keepCode+")</span>"
            }
            return ''
        },
    },
	methods: {
        //人工创建
        onAdd(){
            this.addDialogVisible = true
        },
        onAddSubmit(){
            this.$refs.addForm.validate(valid=>{
                if(valid)
                {
                    let exception = {
                        exceptionContext:this.addForm.exceptionContext,
                        exceptionImagePath:this.getImagePathStrFormMap(),
                        devCode:this.addForm.devCode,
                        excute:this.addForm.excute,
                        simpleExcuteContent:this.addForm.simpleExcuteContent,
                        memberId:this.addForm.memberId
                    }
                    // console.info(exception)
                    this.$store.dispatch('exception/addException',exception).then(data=>{
                        if(data == 1)
                        {
                            this.addDialogVisible = false
                            this.$notify({title: '消息',message: '新建设备故障成功',type: 'success',duration:3000});
                            this.initTable()
                        }
                    })
                }
            })
        },
        //打开人工创建对话框，初始化数据
        onAddDialogOpen(){
            //清除之前验证消息，否则会保留
            if(this.$refs.addForm)
            {
                this.$refs.addForm.clearValidate();
            }
            this.uploadedImages.clear();
             //判断一下，dialog第一次弹出后才创建这个组件
            if(this.$refs.elUpload)
            {
                this.$refs.elUpload.clearFiles();//上传控件清空上次的文件列表 
            }
            this.addForm.devName = null
            this.addForm.devCode = null
            this.addForm.exceptionContext = null
            this.addForm.exceptionImagePath = null
            this.addForm.excute = 2
            this.addForm.simpleExcuteContent = null
            this.addForm.memberId = null
            this.addForm.memberName = null
        },
        //每行的设备异常图片上传成功
        onUploadSuccess(response, file, fileList){
            let fileName = file.name; //本地名称
            let path = response.data; //response是原始的axios respoonse
            this.uploadedImages.set(fileName,path) 
            this.$notify({title: '消息',message: '图片上传成功',type: 'success',duration:3000});
        },
        //每行的设备异常图片删除
        onRemoveUpload(file, fileList) {
            let fileName = file.name;
            let path = this.uploadedImages.get(fileName);
            //提交服务端删除文件,不管成功与否前端都先delete
            this.uploadedImages.delete(fileName);
            this.$store.dispatch('upload/deletePicture',path).then(data=>{
                if(data)
                {
                    this.$notify({title: '消息',message: '图片删除成功',type: 'success',duration:3000});
                }
            })
        },
        //图片上传失败
        onUploadError(err, file, fileList){
            this.$notify({title: '消息',message: '图片上传失败',type: 'error',duration:3000});
        },
        //预览上传大图片
        handlePictureCardPreview(file) {
            this.picDialogImageUrl = file.url;
            this.picDialogVisible = true;
        },
        //将Map的values形成path拼接字符串
        getImagePathStrFormMap(){
            if(this.uploadedImages.size > 0)
            {
                let pathStr = ''
                let valueIterator = this.uploadedImages.values()
                for(let path of valueIterator)
                {
                    pathStr = pathStr+path+","
                }
                return pathStr.substring(0,pathStr.length-1)//去掉最后一个逗号
            }
            return null
        },


        onView(row){
            this.curRow = row
            //将data中包含的故障图片url处理一下
            if(row.exceptionImagePath && row.exceptionImagePath.trim() != "")
            {
                let images = [];
                let pathSubs = row.exceptionImagePath.split(',');
                pathSubs.forEach(sub=>{
                    let subUrl = this.$store.state.settings.uploadStore+sub
                    images.push(subUrl);
                })
                this.curRow.images = images;
            }
            this.dialogVisible = true;
        },
        onDialogOpen(){
            if(this.curRow)
            {
                let sourcTarget = this.curRow.sourcTarget;
                //巡检发现的
                if(sourcTarget == 1)
                {
                    this.keepData = null
                    let taskId = this.curRow.inspTaskId;
                    let pointId = this.curRow.inspTaskPointId;
                    if(taskId && pointId)
                    {
                        let param = {
                            taskId:taskId,
                            pointId:pointId
                        }
                        this.$store.dispatch('insp/forException',param).then(data=>{
                            this.inspectData = data;
                        })
                    }
                }
                //保养发现的
                else if(sourcTarget == 2)
                {
                    this.inspectData = null
                    let keepId = this.curRow.keepId;
                    if(keepId)
                    {
                        this.$store.dispatch('keep/forException',{keepId:keepId}).then(data=>{
                            this.keepData = data;
                        })
                    }
                }
            }
        },
        onQuery(){
            this.initTable()
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
            //入库时间范围
            let createStart = null;
            let start = this.queryForm.createTime[0]
            if(start)
            {
                createStart = start.getTime();
            }
            let createEnd = null;
            let end = this.queryForm.createTime[1]
            if(end)
            {
                createEnd = end.getTime();
            }
            //初始化参数
            this.query = {
                beginTime:createStart,
                endTime:createEnd,
                devType:this.queryForm.devType,
                devCode:this.queryForm.devCode,
                sourceTarget:this.queryForm.sourceTarget,
                excute:this.queryForm.excute
            }
            this.$store.dispatch("exception/count",this.query).then(data => {
                this.total = data;
                this.tabelPagin(1);
            })
        },
        //分页控件事件,curPage从第一页开始
        tabelPagin(curPage){
            //分页
            let startIndex = (curPage - 1) * this.pageSize;
            this.query.startIndex = startIndex;
            this.query.rows = this.pageSize;
            this.$store.dispatch("exception/page",this.query).then(data => {
                this.tableData = data;
                this.loading = false;
            }).catch(()=>{
                this.loading = false;
            })
        },
        //打开设备选择对话
        openSelectDevDialog(action){
            this.action = action
            this.$refs.selectDevDialog.dialogVisible = true;
        },
         //设备选择对话框确定完成
        onDevDialogSelected(devs){
            if(devs.length > 0)
            {
                let dev = devs[0];
                if(this.action == 'query')
                {
                    this.queryForm.devCode = dev.devCode
                    this.queryForm.devName = dev.devName
                }
                else if(this.action == 'add')
                {
                    this.addForm.devCode = dev.devCode
                    this.addForm.devName = dev.devName
                }
            }
        },
        //打开人员选择对话
        openSelectMemberDialog(){
            this.$refs.selectMemberDialog.dialogVisible = true;
        },
        onMemberDialogSelected(members){
            if(members.length > 0)
            {
                let m = members[0];
                this.addForm.memberId = m.memberId
                this.addForm.memberName = m.memberName
            }
        },
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
        getTimeStr(timestamp){
            if(timestamp)
            {
                let time = new Date(timestamp);
                return CommonTool.formatData(time,'yyyy-MM-dd hh:mm:ss')
            }
            return ''
        },
    },
	mounted() {
        this.initTypeOptions();
        this.initTable();
    },
	beforeDestroy() {}
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
.image-solt{
    width: 150px;
    height: 100px;
    text-align: center;
    line-height: 110px; 
    background: #f5f7fa;
    color: #909399;
}
.image-solt i{
    margin-left: -50px;
    font-size: 30px;
}
</style>
