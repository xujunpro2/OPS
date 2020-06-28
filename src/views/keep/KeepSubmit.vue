<template>
	<div class="rootDiv">
        <el-form :inline="true"  :model="queryForm" label-width="80px">
            <el-form-item label="工号">
                <el-input v-model="queryForm.memberCode" clearable></el-input>
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
                     <el-button @click="onComplete(scope.row)">维保提交</el-button>
                     <el-button @click="onMalfunction(scope.row)" type="danger">故障上报</el-button>
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
                <el-input type="textarea" :rows="4" placeholder="请输入内容" clearable="" v-model="keepContext"></el-input>
            </el-row>
            <span slot="footer" class="dialog-footer">
                <el-button  @click="dialogVisible = false">取 消</el-button>
                <el-button  type="primary" @click="onSubmit">确 定</el-button>
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
                memberCode:null
            },

            //表格
            loading:false,
            tableData:[],

            //维保纪录对话框
            curRow:null, // 当前行
            dialogVisible:false,
            keepContext:null, //维保文字纪录
            uploadedFile:new Map(),//上传成功的图片，key是文件名称，value是服务端的文件名称.用来最终提交  set delete get

            //照片查看对话框
            upload:this.$store.state.settings.server+"upload/keep.action",
            picDialogImageUrl: '',
            picDialogVisible:false,
           
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
        //触发故障报修
        onMalfunction(row){
            this.$alert('后续开发，这里先把流程串起来');
        },
        onQuery(){
            this.loading = true;
            let memberCode = this.queryForm.memberCode
            if(memberCode == null)
            {
                this.$alert("请输入工号!", "提示", {confirmButtonText: "确定",type: "error"});
                return;
            }
            this.$store.dispatch('keep/byMemeber',memberCode).then(data=>{
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
                    return '派单'
                case 2:
                    return '已完成'
                case 3:
                    return '归档'
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
                        if(this.queryForm.memberCode)
                        {
                            this.onQuery();
                        }
                        this.$notify({title: '消息', message: '维保确认提交成功',type: 'success',duration:3000});
                    }
                })
                
            }
        },
    },
	mounted() {
      
    },
	beforeDestroy() {}
};
</script>

<style scoped>
</style>
