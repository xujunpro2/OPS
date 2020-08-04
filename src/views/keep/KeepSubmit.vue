<template>
	<div class="rootDiv">
        <el-form :inline="true"  :model="queryForm" label-width="80px">
            <el-form-item label="检修人员">
                <el-select v-model="queryForm.memberId"  placeholder="请选择" style="width: 100%;">
                    <el-option v-for="item in memberOptions" :key="item.memberId" :label="item.memberName"
                        :value="item.memberId"></el-option>
                </el-select>
            </el-form-item>
            <el-form-item>
                <el-button type="primary" @click="onQuery" icon="el-icon-search">查询</el-button>
            </el-form-item>
        </el-form>

        <el-table v-loading="loading" border :data="tableData"  style="width: 100%;margin-top:3px">
            <el-table-column prop="keepCode" label="工单编号"></el-table-column>
			<el-table-column prop="keepName" label="工单名称"></el-table-column>
            <el-table-column prop="createTime" label="创建时间">
                <template slot-scope="scope">
                    {{timestampFormat(scope.row.createTime,'yyyy-MM-dd hh:mm:ss')}}
                </template>
            </el-table-column>
            <el-table-column prop="deadline" label="完成期限">
                <template slot-scope="scope">
                    {{timestampFormat(scope.row.deadline,'yyyy-MM-dd hh:mm:ss')}}
                </template>
            </el-table-column>
            <el-table-column prop="keepState" label="工单状态">
                <template slot-scope="scope">
                    {{keepStateStr(scope.row.keepState)}}
                </template>
            </el-table-column>
            <el-table-column prop="timeout" label="超时标记">
                <template slot-scope="scope">
                    <i v-if="scope.row.timeout == 1" class="el-icon-circle-check" style="color:#d40000"></i>
                </template>
            </el-table-column>
            <el-table-column label="操作" width="230px">
                <template slot-scope="scope">
                     <el-button type="text" v-if="scope.row.keepState == 1" @click="onReciveOrder(scope.row)">接单</el-button>
                     <el-button type="text" v-if="scope.row.keepState == 2" @click="onComplete(scope.row)">维保提交</el-button>
                     <el-button type="text" @click="onException(scope.row)" class="redFont">故障上报</el-button>
                </template>
            </el-table-column>
        </el-table>

         <el-dialog title="维保纪录"  :visible.sync="dialogVisible" @open="onDialogOpen"    width="510px" :close-on-click-modal="false">
            <el-row>
                现场照片
            </el-row>
            <el-row style="margin-top:5px">
                <el-upload ref="elUpload" :action="upload" list-type="picture-card" :on-success="onUploadSuccess" :on-error="onUploadError"
                    :on-preview="handlePictureCardPreview" :on-remove="handleRemove">
                    <i class="el-icon-plus"></i>
                </el-upload>
                <el-dialog :visible.sync="picDialogVisible" :append-to-body="true">
                    <img width="100%" :src="picDialogImageUrl" alt="">
                </el-dialog>
            </el-row>
            <el-row style="margin-top:10px">
                保养纪录
            </el-row>
            <el-row style="margin-top:5px">
                <el-input type="textarea" :rows="4" placeholder="请输入内容"  v-model="keepContext"></el-input>
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
                    :disabled="devs.length == 0 || devExceptionData.length >= devs.length">添加</el-button>
                </el-row>
                <el-table :data="devExceptionData" border style="width: 100%;margin-top:5px">
                    <el-table-column label="设备" align="center">
                        <template slot-scope="scope">
                            <el-select v-model="scope.row.devCode"  placeholder="请选择故障设备" style="width: 100%;">
                                <el-option v-for="item in devs" :key="item.devId" :label="item.devCode+' '+item.devName"
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
                            <el-input v-model="scope.row.exceptionContext" type="textarea" autosize placeholder="必填项" >
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
                <el-button  @click="exceptionDialogVisible = false">取 消</el-button>
                <el-button  type="primary" @click="onExceptionSubmit">确 定</el-button>
            </span>
        </el-dialog>
    </div>
</template>

<script>
import CommonTool from '@/utils/commonTool.js'
export default {
	name: "KeepSubmit",
	data() {
		return {
            queryForm:{
                memberId:null
            },
            memberOptions:[],
            //表格
            loading:false,
            tableData:[],

            //维保纪录对话框
            curRow:null, // 当前行
            dialogVisible:false,
            keepContext:null, //维保文字纪录
            uploadedFile:new Map(),//上传成功的图片，key是文件名称，value是服务端的文件路径.用来最终提交  set delete get

            //照片查看对话框
            upload:this.$store.state.settings.server+"upload/keep.action",
            picDialogImageUrl: '',
            picDialogVisible:false,

            //异常对话框
            exceptionDialogVisible:false,
            devs:[],//工单关联的设备
            //设备异常表格数据
            devExceptionData:[], 
            excuteOptions:[{excute:1,excuteLabel:'简易处理'},{excute:2,excuteLabel:'设备报修'}],
            exceptionUpload:this.$store.state.settings.server+"upload/exception.action",
           
        };
    },
	methods: {
        onDialogOpen(){
            this.uploadedFile.clear();
            //判断一下，dialog第一次弹出后才创建这个组件
            if(this.$refs.elUpload)
            {
                this.$refs.elUpload.clearFiles();//上传控件清空上次的文件列表 
            }
            this.keepContext = null;
        },
        handleRemove(file, fileList) {
            let fileName = file.name;
            let path = this.uploadedFile.get(fileName);
            //提交服务端删除文件,不管成功与否前端都先delete
            this.uploadedFile.delete(fileName);
            this.$store.dispatch('upload/deletePicture',path).then(data=>{
                if(data)
                {
                    this.$notify({title: '消息',message: '图片删除成功',type: 'success',duration:3000});
                }
            })
            
        },
        handlePictureCardPreview(file) {
            this.picDialogImageUrl = file.url;
            this.picDialogVisible = true;
        },
        onUploadSuccess(response, file, fileList){
            let fileName = file.name; //本地名称
            let serverPath = response.data; //response是原始的axios respoonse
            this.uploadedFile.set(fileName,serverPath);
            this.$notify({title: '消息',message: '图片上传成功',type: 'success',duration:3000});
        },
        onUploadError(err, file, fileList){
            this.$notify({title: '消息',message: '图片上传失败',type: 'error',duration:3000});
        },
        onQuery(){
            this.loading = true;
            let memberId = this.queryForm.memberId
            if(memberId == null)
            {
                this.$alert("请选择检修人员!", "提示", {confirmButtonText: "确定",type: "error"});
                return;
            }
            this.$store.dispatch('keep/byMemeber',memberId).then(data=>{
                this.tableData = data;
                this.loading = false;
            }).catch(()=>{
                this.loading = false;
            })
        },
         //表格时间格式化
        timestampFormat(timestamp,formate){
            return CommonTool.formatData(new Date(timestamp),formate)
        },
        //表格状态格式化 工单状态 0 创建 1派单 2已完成 3超时 4 归档
        keepStateStr(keepState){
            switch(keepState)
            {
                case 0:
                    return '创建'
                case 1:
                    return '已派单'
                case 2:
                    return '已接单'
                case 3:
                    return '已完成'
                case 4:
                    return '已归档'
                default:
                    return '未知'
            }
        },
        //提交按钮
        onComplete(row){
            this.curRow = row;
            this.dialogVisible = true;
        },
        //确定提交
        onSubmit(){
            
            if(this.curRow)
            {
                //数据校验 Map size属性
                if(this.uploadedFile.size == 0)
                {
                    this.$alert("请上传保养现场照片!", "提示", {confirmButtonText: "确定",type: "error"});
                    return;
                }
                if(this.keepContext == null || this.keepContext == '')
                {
                    this.$alert("请填写保养记录!", "提示", {confirmButtonText: "确定",type: "error"});
                    return;
                }
                this.dialogVisible = false;
                let pictures = [];
                let valueIterator = this.uploadedFile.values();
                for(let item of valueIterator)
                {
                     pictures.push(item);
                }
        
                let param = {
                    keepId:this.curRow.keepId,
                    keepContext:this.keepContext,
                    pictures:pictures
                }
                this.curRow = null;
                this.$store.dispatch('keep/addComplete',param).then(data=>{
                    if(data)
                    {
                        if(this.queryForm.memberId)
                        {
                            this.onQuery();
                        }
                        this.$notify({title: '消息', message: '维保确认提交成功',type: 'success',duration:3000});
                    }
                })
                
            }
        },
        initMemberOptions(){
            this.$store.dispatch('system/allMember','repair').then(data=>{
                this.memberOptions = data;
            })
        },
         //触发故障报修
        onException(row){
            this.curRow = row
            let keepId = row.keepId
            this.$store.dispatch('keep/devByKeep',keepId).then(data=>{
                this.devs = data
                this.exceptionDialogVisible = true

            })
        },
        //提交设备异常信息
        onExceptionSubmit(){
            if(this.devExceptionData.length == 0)
            {
                this.$alert("填报设备异常需要在表格中填写相关信息!", "提示", {confirmButtonText: "确定",type: "error"})
                return
            }
            let param = [];
            this.devExceptionData.forEach(item=>{
                let exception = {
                    exceptionContext:item.exceptionContext,
                    exceptionImagePath:this.getImagePathStrFormMap(item.images),
                    devCode:item.devCode,
                    excute:item.excute,
                    simpleExcuteContent:item.simpleExcuteContent,
                    memberId:this.queryForm.memberId,//填报人
                    keepId:this.curRow.keepId //工单ID
                }
                param.push(exception)
            })
            console.info(param)
            this.$store.dispatch('keep/addDevException',param).then(data=>{
                if(data)
                {
                    this.$notify({title: '消息', message: '设备故障信息上报成功',type: 'success',duration:3000});
                    this.exceptionDialogVisible = false;
                }
            })
        },
       
        //添加一条设备异常信息
        onAddDevException(){
            this.devExceptionData.push({
                itemId:this.devExceptionData.length, //给一个虚拟ID，删除的时候可以用
                devCode:null,
                excute:1,
                exceptionContext:null,
                simpleExcuteContent:null,//如果简易处理，处理情况
                images:new Map(),
            })
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

        //接单
        onReciveOrder(row){
            this.$confirm("确定接单吗?", "提示", {
                confirmButtonText: '确定',
                cancelButtonText: '取消',
                type: 'info'
            }).then(()=>{
                let param = {
                    keepId:row.keepId,
                    memberId:this.queryForm.memberId
                }
                this.$store.dispatch('keep/assignOrder',param).then(data=>{
                    if(data == 1)
                    {
                        this.onQuery();
                        this.$notify({title: '消息',message: '接单成功',type: 'success',duration:3000});
                    }
                })
            })
            .catch(()=>{})
        },
    },
	mounted() {
        this.initMemberOptions();
    },
	beforeDestroy() {}
};
</script>

<style scoped>
</style>
