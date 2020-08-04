<template>
	<div class="rootDiv">
        <el-form :inline="true"  :model="queryForm" label-width="80px">
            <el-form-item label="巡检人员">
                <el-select v-model="queryForm.memberId"  placeholder="请选择要查询的巡检人员" style="width: 100%;">
                    <el-option v-for="item in memberOptions" :key="item.memberId" :label="item.memberName"
                        :value="item.memberId"></el-option>
                </el-select>
            </el-form-item>
            <el-form-item>
                <el-button type="primary" @click="onQuery" icon="el-icon-search">查询</el-button>
            </el-form-item>
        </el-form>
     
         <!--待接单巡检任务分页表格-->
        <el-table v-loading="loading" border :data="tableData" style="width: 100%;">
            <el-table-column prop="taskCode" label="任务编号" ></el-table-column>
			<el-table-column prop="taskName" label="任务名称" ></el-table-column>
            <el-table-column prop="taskState" label="状态" >
                 <template slot-scope="scope">
                    <span v-if="scope.row.taskState==-1" style="color:#F56C6C">已过期</span>
                    <span v-if="scope.row.taskState==0">创建</span>
                    <span v-if="scope.row.taskState==1">已派单</span>
                    <span v-if="scope.row.taskState==2">进行中</span>
                    <span v-if="scope.row.taskState==3">已完成 </span>
                </template>
            </el-table-column>
            <el-table-column prop="memberNames" label="巡查人员">
                <template slot-scope="scope">
                    <span v-html="getMemberNames(scope.row)"></span>
                </template>
            </el-table-column>
            <el-table-column prop="createTime" label="派单时间" >
                 <template slot-scope="scope">
                    {{timestampFormat(scope.row.createTime,'yyyy-MM-dd hh:mm')}}
                </template>
            </el-table-column>
            <el-table-column label="操作">
                <template slot-scope="scope">
                    <!-- <el-button @click="onDelete(scope.row)" type="danger" icon="el-icon-delete" circle></el-button> -->
                    <el-button v-if="scope.row.taskState == 1" type="text" @click="onReciveTask(scope.row)">接单</el-button>
                    <el-button v-if="scope.row.taskState == 2" type="text" @click="onInput(scope.row)">填报</el-button>
                </template>
            </el-table-column>
        </el-table>

        <!--巡检点记录填报-->
        <el-dialog title="巡检记录填报" :visible.sync="dialogVisible"  width="780px"  :close-on-click-modal="false">
            <el-row :gutter="2">
                <!--检查点流程-->
                <el-col :span="10" style="height: 300px;">
                    <el-steps direction="vertical" process-status="finish" :active="completedIndex" finish-status="success" align-center>
                        <el-step  v-for="point in inspectPoints" :key="point.pointId" :title="point.pointName" :description="point.checkContent"></el-step>
                    </el-steps>
                </el-col>
                <!--巡检记录信息-->
                <el-col :span="14">
                    <el-form :model="recordForm" label-width="100px" >
                        <el-form-item label="检查点状态">
                            <el-switch v-model="recordForm.pass" active-color="#13ce66" inactive-color="#ff4949">
                            </el-switch>
                            <el-button v-show="!recordForm.pass && curPoint.pointType == 0" @click="onBtnExceptionClick" type="danger" icon="el-icon-warning-outline" style="margin-left:40px">设备故障填报</el-button>
                        </el-form-item>
                        <el-form-item label="检查描述">
                            <el-input v-model="recordForm.recordText" type="textarea" placeholder="请输入内容" :rows="4"  maxlength="256" show-word-limit>>
                            </el-input>
                        </el-form-item>
                        <el-form-item label="现场照片">
                            <el-upload ref="pointUpload" :action="inspectUpload" list-type="picture-card" 
                            :on-success="onInspectUploadSuccess" 
                            :on-remove="onInspectUploadRemove"
                            :on-error="onUploadError"
                            :on-preview="handlePictureCardPreview" >
                            <i class="el-icon-plus"></i>
                            </el-upload>
                            <el-dialog :visible.sync="picDialogVisible" :append-to-body="true">
                                <img width="100%" :src="picDialogImageUrl" alt="">
                            </el-dialog>
                        </el-form-item>
                    </el-form>
                </el-col>
            </el-row>
            <span slot="footer" class="dialog-footer">
                <el-button  @click="dialogVisible = false">取 消</el-button>
                <el-button  type="primary" @click="onSubmit">确 定</el-button>
            </span>
        </el-dialog>
        <el-dialog title="异常记录填报" :visible.sync="exceptionDialogVisible"  width="1200px"  :close-on-click-modal="false">
            <!--设备异常填报-->
            <el-row>
                <el-row type="flex" justify="end">
                    <el-button type="primary" icon="el-icon-plus" @click="onAddDevException" 
                    :disabled="curPoint==null ||curPoint.pointType!=0 ||curPoint.devs == null || devExceptionData.length >= curPoint.devs.length">添加</el-button>
                </el-row>
                <el-table :data="devExceptionData" border style="width: 100%;margin-top:5px">
                    <el-table-column label="设备" align="center">
                        <template slot-scope="scope">
                            <el-select v-model="scope.row.devCode"  placeholder="请选择故障设备" style="width: 100%;">
                                <el-option v-for="item in curPoint.devs" :key="item.devId" :label="item.devCode+' '+item.devName"
                                    :value="item.devCode"></el-option>
                            </el-select>
                        </template>
                    </el-table-column>
                    <el-table-column label="故障图片" align="center">
                        <template slot-scope="scope">
                            <el-upload list-type="picture" :action="exceptionUpload" :on-success="(response, file, fileList)=>onExceptionUploadSuccess(response, file, fileList,scope.row)" :on-error="onUploadError"
                            :on-remove="(file, fileList)=>onRemoveUpload(file, fileList,scope.row)">
                                <i class="el-icon-plus"></i>
                            </el-upload>
                        </template>
                    </el-table-column>
                    <el-table-column label="故障描述" header-align="center">
                        <template slot-scope="scope">
                            <el-input v-model="scope.row.exceptionContent" type="textarea" autosize placeholder="必填项" >
                            </el-input>
                        </template>
                    </el-table-column>
                    <el-table-column label="处理方式" width="140px" align="center">
                        <template slot-scope="scope">
                            <el-select v-model="scope.row.excute"  placeholder="请选择故障设备" style="width: 100%;">
                                <el-option v-for="item in excuteOptions" :key="item.excute" :label="item.excuteLabel"
                                    :value="item.excute"></el-option>
                            </el-select>
                        </template>
                    </el-table-column>
                    <el-table-column label="处理情况" header-align="center" width="300px">
                        <template slot-scope="scope">
                            <el-input v-model="scope.row.simpleExcuteContent" type="textarea" autosize placeholder="如果采用简易处理方式，需要填写" >
                            </el-input>
                        </template>
                    </el-table-column>
                    <el-table-column label="操作" width="100px" align="center">
                        <template slot-scope="scope">
                            <el-button type="danger" icon="el-icon-delete" circle @click="onDeleteDevException(scope.row)"></el-button>
                        </template>
                    </el-table-column>
                </el-table>
            </el-row>
            <span slot="footer" class="dialog-footer">
                <el-button  @click="onExceptionCancel">取 消</el-button>
                <el-button  type="primary" @click="onExceptionSubmit">确 定</el-button>
            </span>
        </el-dialog>
    </div>
</template>

<script>
import CommonTool from '@/utils/commonTool.js'
export default {
	name: "InspectRecord",
	data() {
		return {
            queryForm:{
                memberId:null
            },
            //表格
            loading:false,
            tableData:[],
            memberOptions:[],

            //对话框
            curRow:null,
            dialogVisible:false,
            inspectPoints:[],//检查点
            curPointOrder:1,//已完成的检查点的index给控件使用,用pointOrder-1即可
            recordForm:{
                pass:true,//巡检点正常
                recordText:null,//检查描述
            },

            //巡检现场照片查看对话框
            inspectUpload:this.$store.state.settings.server+"upload/inspect.action",
            inspectImage:new Map(),//上传成功的图片，key是文件名称，value是服务端的文件路径.用来最终提交  set delete get
            picDialogImageUrl: '',
            picDialogVisible:false,

            //异常对话框
            exceptionDialogVisible:false,
            //设备异常表格数据
            devExceptionData:[], 
            excuteOptions:[{excute:1,excuteLabel:'简易处理'},{excute:2,excuteLabel:'设备报修'}],
            exceptionUpload:this.$store.state.settings.server+"upload/exception.action",
        };
    },
    computed:{
        completedIndex(){
            return this.curPointOrder - 1
        },
        curPoint(){
            if(this.inspectPoints.length > 0)
            {
                let point = this.inspectPoints[this.curPointOrder -1]
                return point
            }
            return null
        },
    },
	methods: {
        //提交巡检记录
        onSubmit(){
            //如果要申报异常，但没有填写异常数据
            if(!this.recordForm.pass)
            {
                //如果是设备点
                if(this.curPoint.pointType == 0)
                {
                    if(this.devExceptionData.length == 0)
                    {
                        this.$alert("当前检查点状态异常，但没有填写异常设备数据!", "提示", {confirmButtonText: "确定",type: "error"})
                        return
                    }
                }
                //无论是设备还是位置异常，现场情况必须填写
                if(this.recordForm.recordText == null)
                {
                    this.$alert("当前检查点状态异常，但没有填写检查描述!", "提示", {confirmButtonText: "确定",type: "error"})
                    return
                }
            }
            //生成数据对象
            let param = {
                pointOrder:this.curPoint.pointOrder,//当前检查点顺位
                pointCount:this.inspectPoints.length,//检查点数量,用于判断整个巡检任务是否完成
                taskId:this.curRow.taskId,//当前任务ID
                pointId:this.curPoint.pointId,//当前检查点ID
                pointType:this.curPoint.pointType,//当前检查点类型
                recordPass:this.recordForm.pass?1:2, //检查点是否正常 1 正常 2异常
                recordText:this.recordForm.recordText,//检查点情况文字记录
                recordMemberId:this.queryForm.memberId,//填报人
                recordImagePath:this.getImagePathStrFormMap(this.inspectImage), //巡检点图片路径，多个逗号隔开
                exceptionDevs:[],//异常设备
            }
            //如果有异常情况
            if(param.recordPass == 2)
            {
                //如果检查点pointType是设备
                if(this.curPoint.pointType == 0)
                {
                    
                    this.devExceptionData.forEach(item=>{
                        let exception = {
                            exceptionContext:item.exceptionContent,
                            exceptionImagePath:this.getImagePathStrFormMap(item.images),
                            devCode:item.devCode,
                            excute:item.excute,
                            simpleExcuteContent:item.simpleExcuteContent,
                            memberId:this.queryForm.memberId,
                            inspTaskId:this.curRow.taskId,
                            inspTaskPointId:this.curPoint.pointId,
                        }
                        param.exceptionDevs.push(exception)
                    })
                }
               
            }
            //console.info(param);
            this.$store.dispatch('insp/submitTaskPoint',param).then(data=>{
                if(data)
                {
                    this.dialogVisible = false;
                    let pointMessage = "检查点:"+this.curPoint.pointName+" 巡检记录提交成功"
                    this.$notify({title: '消息', message: pointMessage,type: 'success',duration:3000});
                    this.onQuery();
                    //清除当前对话框数据
                    this.recordForm.pass = true
                    this.recordForm.recordText = null
                    this.inspectImage.clear()
                    this.devExceptionData.length = 0;//清空异常设备数据
                    this.$refs.pointUpload.clearFiles()//清空upload控件的图片
                }
            })
        },
        //异常信息确定提交
        onExceptionSubmit(){
            let pointType = this.curPoint.pointType
            //如果是设备异常
            if(pointType == 0)
            {
                let validate = true;
                let devCodes = [];
                //验证每条记录必填项
                this.devExceptionData.forEach(item=>{
                    devCodes.push(item.devCode);
                    //是否选择了设备
                    if(item.devCode == null)
                    {
                        validate = false;
                    }
                    //故障描述
                    if(item.exceptionContent == null || item.exceptionContent.trim()== '')
                    {
                        validate = false;
                    }
                    //如果处理方式是简易处理,判断处理情况
                    if(item.excute == 1)
                    {
                        if(item.simpleExcuteContent == null || item.simpleExcuteContent.trim() == '')
                        {
                            validate = false;
                        }
                    }
                })
                if(!validate)
                {
                    this.$alert("有必填项没有填写,请根据提示要求填写完成!", "提示", {confirmButtonText: "确定",type: "error"})
                    return
                }
                //验证设备是否选择重复了,利用Set来判断
                if((new Set(devCodes)).size != devCodes.length){
                    this.$alert("选择了重复的设备，请检查设备列的选择项是否重复!", "提示", {confirmButtonText: "确定",type: "error"})
                    return
                }
                //验证通过
                this.exceptionDialogVisible = false
            }
            
        },
        //异常信息取消提交,清除当前填报的异常数据，做个二次确认
        onExceptionCancel(){
            this.$confirm("该操作将清除当前填写的所有异常数据，确定继续执行吗?", "提示", {
                confirmButtonText: '确定',
                cancelButtonText: '取消',
                type: 'warning'
            }).then(()=>{
                this.devExceptionData.length = 0;//清空异常设备数据
                this.exceptionDialogVisible = false
            })
            .catch(()=>{})
        },
        //将Map的values形成path拼接字符串
        getImagePathStrFormMap(imageMap){
            if(imageMap.size > 0)
            {
                let pathStr = ''
                let valueIterator = imageMap.values()
                for(let path of valueIterator)
                {
                    pathStr = pathStr+path+","
                }
                return pathStr.substring(0,pathStr.length-1)//去掉最后一个逗号
            }
            return null
        },
        //异常填报取消按钮
        onBtnExceptionClick(){
            this.exceptionDialogVisible = true
        },
        //添加一条设备异常信息
        onAddDevException(){
            let point = this.curPoint;
            //设备
            if(point.pointType == 0)
            {
                this.devExceptionData.push({
                    itemId:this.devExceptionData.length, //给一个虚拟ID，删除的时候可以用
                    devCode:null,
                    excute:1,
                    exceptionContent:null,
                    simpleExcuteContent:null,//如果简易处理，处理情况
                    images:new Map(),
                })
            }
        },
        //删除一条设备异常信息
        onDeleteDevException(row){
            let deleteIndex = -1;
            for(let i = 0;i<this.devExceptionData.length;i++)
            {
                if(this.devExceptionData[i].itemId === row.itemId)
                {
                    deleteIndex = i;
                    break;
                }
            }
            if(deleteIndex != -1)
            {
                this.devExceptionData.splice(deleteIndex,1);
            }
        },
        //巡检照片上传成功
        onInspectUploadSuccess(response, file, fileList){
            let fileName = file.name; //本地名称
            let path = response.data; //response是原始的axios respoonse
            this.inspectImage.set(fileName,path) 
            this.$notify({title: '消息',message: '图片上传成功',type: 'success',duration:3000});
        },
        //巡检照片删除
        onInspectUploadRemove(file, fileList){
            let fileName = file.name;
            let path = this.inspectImage.get(fileName);
            //提交服务端删除文件,不管成功与否前端都先delete
            this.inspectImage.delete(fileName);
            this.$store.dispatch('upload/deletePicture',path).then(data=>{
                if(data)
                {
                    this.$notify({title: '消息',message: '图片删除成功',type: 'success',duration:3000});
                }
            })
        },
       
        
        //每行的设备异常图片上传成功
        onExceptionUploadSuccess(response, file, fileList,row){
            let fileName = file.name; //本地名称
            let path = response.data; //response是原始的axios respoonse
            row.images.set(fileName,path) 
            this.$notify({title: '消息',message: '图片上传成功',type: 'success',duration:3000});
        },
        //每行的设备异常图片删除
        onRemoveUpload(file, fileList,row) {
            let fileName = file.name;
            let path = row.images.get(fileName);
            //提交服务端删除文件,不管成功与否前端都先delete
            row.images.delete(fileName);
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
        
        //填报
        onInput(row){
            this.curRow = row
            let taskId = row.taskId
            this.$store.dispatch('insp/pointsByTask',taskId).then(data=>{
                this.inspectPoints = data
                //计算当前顺位
                this.setCurPointOrder();
                //最后打开对话框
                this.dialogVisible = true
            })
        },
       
        //根据检查点状态设置curPointOrder
        setCurPointOrder(){
            this.curPointOrder = 1
            this.inspectPoints.forEach(point=>{
                if(point.completed == 1)
                {
                    //当前填报点顺位下移
                    if(point.pointOrder<=this.inspectPoints.length)
                    {
                        this.curPointOrder = point.pointOrder + 1;
                    } 
                }
            })
        },
   
        //接单
        onReciveTask(row){
            this.$confirm("确定接单吗?", "提示", {
                confirmButtonText: '确定',
                cancelButtonText: '取消',
                type: 'info'
            }).then(()=>{
                let param = {
                    taskId:row.taskId,
                    memberId:this.queryForm.memberId
                }
                this.$store.dispatch('insp/assignTask',param).then(data=>{
                    if(data == 1)
                    {
                        this.initTable();
                        this.$notify({title: '消息',message: '接单成功',type: 'success',duration:3000});
                    }
                })
            })
            .catch(()=>{})
        },
        
        handlePictureCardPreview(file) {
            this.picDialogImageUrl = file.url;
            this.picDialogVisible = true;
        },
        onUploadSuccess(response, file, fileList){
            let fileName = file.name; //本地名称
            let serverFileName = response.data; //response是原始的axios respoonse
            this.uploadedFile.set(fileName,serverFileName);
            this.$notify({title: '消息',message: '图片上传成功',type: 'success',duration:3000});
        },
        onUploadError(err, file, fileList){
            this.$notify({title: '消息',message: '图片上传失败',type: 'error',duration:3000});
        },
        handleRemove(file, fileList) {
            let fileName = file.name;
            let serverFileName = this.uploadedFile.get(fileName);
            //提交服务端删除文件,不管成功与否前端都先delete
            this.uploadedFile.delete(fileName);
            this.$store.dispatch('upload/deletePicture',serverFileName).then(data=>{
                if(data)
                {
                    this.$notify({title: '消息',message: '图片删除成功',type: 'success',duration:3000});
                }
            })
            
        },

        initTable(){
            this.loading = true;
            this.$store.dispatch("insp/workTask",this.queryForm.memberId).then(data => {
                this.tableData = data;
                this.loading = false;
            }).catch(()=>{
                this.loading = false;
            })
        },
        onQuery(){
            let memberId = this.queryForm.memberId
            if(memberId == null)
            {
                this.$alert("请选择巡检人员!", "提示", {confirmButtonText: "确定",type: "error"});
                return;
            }
            this.initTable();
        },
        //表格时间格式化
        timestampFormat(timestamp,formate){
            return CommonTool.formatData(new Date(timestamp),formate)
        },
        getMemberNames(row){
            let memberNames = ''
            let members = row.members;
            members.forEach(item=>{
                memberNames += item.memberName+"&emsp;"
            })
            return memberNames;
        },
        initMemberOptions(){
            this.$store.dispatch('system/allMember','inspect').then(data=>{
                this.memberOptions = data;
            })
        },
    },
	mounted() {
         this.initMemberOptions();
    },
	beforeDestroy() {}
};
</script>

<style scoped>
  .exceptionImage {
    width: 140px;
    height: 140x;
    display: block;
  }
</style>
