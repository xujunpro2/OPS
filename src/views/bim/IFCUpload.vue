<template>
	<div class="rootDiv">
        <el-table v-loading="loading" :data="tableData" tooltip-effect="dark" style="width: 100%">
            <el-table-column prop="ifcName" label="文件名"></el-table-column>
            <el-table-column prop="ifcSizeDesc" label="大小"></el-table-column>
            <el-table-column prop="dirName" label="文件夹"></el-table-column>
            <el-table-column prop="taskStateDesc" label="处理状态"></el-table-column>
            <el-table-column prop="uploadTimeFmt" label="上传时间"></el-table-column>
            <el-table-column prop="ruleId" label="操作" width="230">
                <template slot-scope="scope">
                <el-button @click="onDeleteIfc(scope.row)" type="text" size="small"><span  id="deleteButton">删除</span></el-button>
                </template>
            </el-table-column>
        </el-table>
        <el-row type="flex" justify="end" style="background:#fff">
            <el-pagination background layout="prev, pager, next" :page-size="pageSize" :total="total"
                @current-change="paginChange"></el-pagination>
        </el-row>
        <el-row type="flex" justify="start" style="margin:20px 5px">
            <el-upload class="upload-demo" :action="this.bimServer" 
                ref="upload"
                :auto-upload="false"
                :multiple="false"
                :limit = "1"
                :before-upload="onBeforeUpload"
                :on-success="onUploadSuccess">
                <el-button size="small" style="margin-left: 10px;" @click="onBtnDirClick">{{this.ifc.dirName}}</el-button>
                <el-button slot="trigger" size="small">选择IFC文件</el-button>
                <el-button size="small" type="primary" icon="el-icon-upload" @click="submitUpload" :disabled="this.startTask">开始上传</el-button>
		    </el-upload>
        </el-row>
		<el-row v-show="this.startTask" type="flex" justify="start" >
            <el-col :span="6">
                <el-progress :percentage="this.progress"></el-progress>
            </el-col>
        </el-row>
        <el-row v-show="this.startTask" type="flex" justify="start" style="font-size:12px;color:#606266">
            <el-col :span="6">
                <label>{{this.progressText}}</label>
            </el-col>
        </el-row>

        <el-dialog title="选择文件夹" :visible.sync="dialogVisible"  width="30%" :close-on-click-modal="false">
             <el-row style="margin-top:10px">
                <!--要让tree有纵向滚动条就要包到bimTree的div中-->
                <div id="bimTree" style="height: 300px;">
                    <el-tree ref="dirTree" :data="dirTree" :expand-on-click-node="false" :props="dirTreeProps"></el-tree>
                </div>
            </el-row>
            <span slot="footer" class="dialog-footer">
                <el-button size="small" @click="dialogVisible = false">取 消</el-button>
                <el-button size="small" type="primary" @click="onSelectedDir">确 定</el-button>
            </span>
        </el-dialog>
	</div>
</template>

<script>
import {parseTime} from '@/utils/index';

export default {
	name: "IFCUpload",
	data() {
		return {
            bimServer : this.$store.state.uv.bimServer,
            curUserId:this.$store.state.uv.userId, //当前用户ID
            tableData:[],
            loading:false, //table的loading
            pageSize:Number(this.$store.state.uv.specail.pageSize), //设置都是varchar的，要转数字
            total:0,

            ifc:{
                ifcName:null,
                dirId:-1,
                dirName:"选择文件夹",
                ifcSize:0,
                taskId:null,
                ifcPath:null,
                uploader:-1
            },
            startTask:false,
            progress:30,
            progressText:"ifc文件读取完毕，正在构建模型...",

            dialogVisible:false,
            dirTree:[],
            dirTreeProps: {
                children: "children",
                label: "dirName"
            }
        };
    },
	methods: {
        //手动提交ifc文件上传
        submitUpload() {
            this.$refs.upload.submit();
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
            //检查目录
            if(this.ifc.dirId === -1)
            {
                this.$message.error('请为上传的IFC文件选择一个保存文件夹!');
                return false;
            }
            //客户端直接传字节大小，服务端转kb后保存数据库
            this.ifc.ifcSize = file.size;
            this.ifc.ifcName = file.name;
            return true;
        },
		onUploadSuccess(response, file, fileList) {
            //上传成功后，会返回转换任务的guid，这个是查询进度的凭证
            this.ifc.taskId = response.taskId;
            this.ifc.ifcPath = response.ifcPath;
            this.ifc.uploader = this.$store.state.uv.userId;
            this.$store.dispatch("ifc/addIFC",this.ifc).then(data => {
                this.$notify({
                    title: '任务通知',
                    message: 'IFC文件上传至BIM服务器，加入解析任务处理队列。',
                    type: 'success',
                    position: 'bottom-right',
                    duration: 3000
                });
                return new Promise((resolve, reject) => {
                    resolve();
                });
            })
            .then(()=>{
                //上传成功后，轮询进度
                this.initIFCTabel();
                this.pollingTaskProgress();
            });
        },
        //初始化IFC表格
        initIFCTabel(){
            this.$store.dispatch("ifc/getIFCCount",this.curUserId).then(data => {
                this.total = data;
                return new Promise((resolve, reject) => {
                    resolve();
                });
            })
            .then(()=>{
                this.tabelPagin(1);
            });
        },
        //分页事件
        paginChange(curPage) {
			this.tabelPagin(curPage);
        },
        //分页控件事件,curPage从第一页开始
        tabelPagin(curPage){
            this.loading = true;
            let startIndex = (curPage - 1) * this.pageSize;
            let query = {userId:this.curUserId,startIndex:startIndex,rows:this.pageSize};
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
                    item.taskState === 0?item.taskStateDesc='等待处理':item.taskStateDesc='解析完成'
                });
                this.loading = false;
            })
        },
        //删除ifc上传记录
        onDeleteIfc(row){
            
            this.$confirm("确定删除BIM文件吗?", "提示", {
                confirmButtonText: '确定',
                cancelButtonText: '取消',
                type: 'warning'
            }).then(()=>{
                let ifcId = row.ifcId;
                this.$store.dispatch("ifc/deleteIFC",ifcId).then(()=>{
                    this.initIFCTabel();
                    this.$notify({
                        title: '消息',
                        message: '删除成功',
                        type: 'success',
                        duration:3000
                    });
                });
            });
        },
        //弹出对话框初始化目录树
        initDirTree(){
            this.$store.dispatch("ifc/getIFCDir").then(data => {
                this.dirTree = data;
            });
        },
        //弹出目录树对话框
        onBtnDirClick(){
            this.dialogVisible = true;
        },
        //目录树对话框确定按钮
        onSelectedDir(){
            let selectedNode = this.$refs.dirTree.getCurrentNode();
            if(selectedNode != null)
            {
                this.ifc.dirId = selectedNode.dirId;
                this.ifc.dirName = selectedNode.dirName;
                this.dialogVisible = false;
            }
            else
            {
                this.$message.error('请为IFC文件选择保存目录!');
            }
        },
        //文件上传之后轮询任务执行进度
        pollingTaskProgress(){
            this.startTask = true;
        }
    },
	mounted() {
       this.initIFCTabel();
       this.initDirTree();
    },
	beforeDestroy() {}
};
</script>

<style scoped>

</style>
