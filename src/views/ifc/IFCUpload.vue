<template>
	<div class="rootDiv">
        <el-table v-loading="loading" :data="tableData" tooltip-effect="dark" style="width: 100%">
            <el-table-column prop="ifcName" label="文件名"></el-table-column>
            <el-table-column prop="ifcSizeDesc" label="大小"></el-table-column>
            <el-table-column label="处理状态">
                <template slot-scope="scope">
                    <span>{{ scope.row.taskStateDesc }}</span>
                    <i style="margin-left: 5px" :class="scope.row.taskStateIcon"></i>
                </template>
            </el-table-column>
            <el-table-column prop="uploadTimeFmt" label="上传时间"></el-table-column>
            <el-table-column prop="ruleId" label="操作" width="100">
                <template slot-scope="scope">
                <el-button @click="onDeleteIfc(scope.row)" type="text" ><span  class="redFont">删除</span></el-button>
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
        <!--上传-->
        <el-row type="flex" justify="start">
            <el-upload  :action="this.bimServer" 
                ref="upload"
                :auto-upload="true"
                :multiple="false"
                :headers="token"
                :on-change="onFileChange"
                :before-upload="onBeforeUpload"
                :on-success="onUploadSuccess"
                :on-error="onUploadError">
                <el-button slot="trigger" type="primary" icon="el-icon-upload" >上传IFC文件</el-button>
		    </el-upload>
        </el-row>
        <!-- vue动画效果 -->
        <transition-group name="fade">
            <el-row v-show="this.startTask" key="1" type="flex" justify="start" >
                <el-col :span="6">
                    <el-progress :percentage="this.progress"></el-progress>
                </el-col>
            </el-row>
            <el-row v-show="this.startTask" key="2" type="flex" justify="start" style="font-size:12px;color:#606266">
                <el-col :span="6">
                    <label>{{this.progressText}}</label>
                </el-col>
            </el-row>
        </transition-group>

    </div>
</template>

<script>
import {parseTime} from '@/utils/index';
import bimAxios from '@/utils/requestBim';
import { clearInterval, setInterval } from 'timers';

export default {
	name: "IFCUpload",
	data() {
		return {
            interval:null, //定期轮询对象，在beforeDestroy中释放掉
            bimServer : this.$store.state.uv.bimServer,
            tableData:[],
            loading:false, //table的loading
            pageSizeList:this.$store.state.settings.pageSizeList, //分页列表
            total:0,

            ifc:{
                ifcName:null,
                ifcSize:0,
                taskId:null,
                ifcPath:null,
                uploader:-1
            },
            
            startTask:false,
            progress:0,
            progressText:"当前有其他BIM正在解析,任务等待中...",

            token:{
               Authorization:"bimi"
            }
        };
    },
    computed:{
        pageSize() {
            return this.$store.state.settings.pageSize
        },
    },
	methods: {
        //on-change绑定事件，文件状态改变时的钩子，添加文件、上传成功和上传失败时都会被调用
        onFileChange(file, fileList){
            //只有当前事件源的file状态是ready才表示是选择文件，上传成功是success
            if(file.status === 'ready')
            {
                //判断文件名称是否和列表中的文件名称重名了，如果重名，提示用户确认
                //先不做了，后面再说
            }
        },
        //上传开始前的钩子
        onBeforeUpload(file){
            //文件格式判断
            const isIFC = (file.name.endsWith(".ifc") || file.name.endsWith(".IFC"));
            if (!isIFC) 
            {
                this.$message.error('上传文件只能是 ifc 格式!');
                return false;
            }

            //客户端直接传字节大小，服务端转kb后保存数据库
            this.ifc.ifcSize = file.size;
            //将ifc后缀不要，只要前面的文件名称
            let fileName = file.name;
            this.ifc.ifcName = fileName.substring(0,fileName.indexOf("."));
            return true;
        },
		onUploadSuccess(response, file, fileList) {
            //上传成功后，会返回转换任务的guid，这个是查询进度的凭证
            this.ifc.taskId = response.taskId;
            this.ifc.ifcPath = response.ifcPath;
            this.ifc.uploader = this.$store.state.uv.userId;
            this.$store.dispatch("ifc/addIFC",this.ifc).then(data => {
                // this.$notify({
                //     title: '任务通知',
                //     message: 'IFC文件上传至BIM服务器，加入解析任务处理队列。',
                //     type: 'success',
                //     position: 'bottom-right',
                //     duration: 2000
                // });
                return new Promise((resolve, reject) => {
                    resolve();
                });
            })
            .then(()=>{
                this.$refs.upload.clearFiles();//清除文件列表
                //上传成功后，轮询进度
                this.initIFCTabel();
                this.pollingTaskProgress();
            });
        },
        onUploadError(err, file, fileList){
            this.$notify({
                title: '消息',
                message: '文件上传失败,请检查bim服务器是否运行',
                type: 'error',
                duration:3000
            });
        },
        //初始化IFC表格
        initIFCTabel(){
            this.$store.dispatch("ifc/getIFCCount").then(data => {
                this.total = data;
                return new Promise((resolve, reject) => {
                    resolve();
                });
            })
            .then(()=>{
                this.tabelPagin(1);
            });
        },
        sizeChange(rows){
            this.$store.dispatch('settings/changePageSize',rows);
            this.tabelPagin(1);
        },
        //分页事件
        paginChange(curPage) {
			this.tabelPagin(curPage);
        },
        //分页控件事件,curPage从第一页开始
        tabelPagin(curPage){
            this.loading = true;
            let startIndex = (curPage - 1) * this.pageSize;
            let query = {startIndex:startIndex,rows:this.pageSize};
            this.$store.dispatch("ifc/getIFCPage",query).then(data => {
                this.tableData = data;
                //服务端传来的uploadTime是1970时间戳，这里做格式化
                this.tableData.forEach(item => {
                    //文件大小，自动计算MB或KB，数据库中的是KB
                    if(item.ifcSize > 1024)
                    {
                        let mb = (item.ifcSize / 1024).toFixed(2);
                        item.ifcSizeDesc = mb+"MB";
                    }
                    else
                    {
                        item.ifcSizeDesc = item.ifcSize.toFixed(2) +"KB";
                    }
                    
                    item.uploadTimeFmt = parseTime(item.uploadTime);
                    item.taskState === 0?item.taskStateDesc='等待处理':item.taskStateDesc='解析完成';
                    item.taskState === 0?item.taskStateIcon='el-icon-loading':item.taskStateIcon='el-icon-circle-check';
                });
                this.loading = false;
            }).catch(()=>{
                this.loading = false;
            })
        },
        //删除ifc上传记录
        onDeleteIfc(row){
            this.$confirm("确定删除IFC文件吗?", "提示", {
                confirmButtonText: '确定',
                cancelButtonText: '取消',
                type: 'warning'
            }).then(()=>{
                let ifcId = row.ifcId;
                //删除数据库记录
                this.$store.dispatch("ifc/deleteIFC",ifcId).then(()=>{
                    this.initIFCTabel();
                    this.$notify({
                        title: '消息',
                        message: '删除成功',
                        type: 'success',
                        duration:3000
                    });
                });
                //删除bim服务器上文件，这个不要求一定成功
                let fileName = row.ifcName;
                bimAxios.get("/",{ params: {action:"deleteFile",fileName:fileName} }).then(data=>{

                })
            }).catch(() => {});
        },
     
        //文件上传之后轮询任务执行进度
        pollingTaskProgress(){
            this.startTask = true;
            this.progress = 0,
            this.progressText = "解析任务等待中...",
            this.interval = setInterval(this.polling,1000);
        },

        polling(){
            let taskId = this.ifc.taskId;
            bimAxios.get("/",{ params: {action:"taskProgress",taskId:taskId} }).then(data=>{
                if(data.stateCode === 0 )
                {
                    this.progress = 0;
                    this.progressText = "当前有其他BIM正在解析,任务等待中...";
                }
                else if(data.stateCode === 1 )
                {
                    this.progress = data.progress;
                    this.progressText = data.progressText;
                }
                else if(data.stateCode === 2 )
                {
                    this.progress = 100;
                    this.progressText = "ifc文件转换完成";
                    if(this.interval)
                    {
                        clearInterval(this.interval);
                    }
                    this.initIFCTabel();
                    this.startTask = false;
                    this.$notify({
                        title: '任务通知',
                        message: 'ifc文件处理任务完成。',
                        type: 'success',
                        position: 'bottom-right',
                        duration: 3000
                    });
                    
                }
                else if(data.stateCode === -1 )
                {
                    this.progress = 0;
                    this.progressText = "未查询到该任务...";
                    if(this.interval)
                    {
                        clearInterval(this.interval);
                    }
                    this.startTask = false;
                }
            });
        },

    },
	mounted() {
        this.initIFCTabel();
    },
	beforeDestroy() {
        if(this.interval)
        {
            clearInterval(this.interval);
        }
    }
};
</script>

<style scoped>
.fade-enter-active, .fade-leave-active {
  transition: opacity 1.0s
}
.fade-enter, .fade-leave-active {
  opacity: 0
}
</style>
