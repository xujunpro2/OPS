<template>
	<div class="rootDiv">
        <el-table v-loading="loading" :data="tableData" tooltip-effect="dark" style="width: 100%">
            <el-table-column prop="ifcName" label="文件名"></el-table-column>
            <el-table-column prop="ifcSizeDesc" label="大小"></el-table-column>
            <el-table-column prop="dirName" label="文件夹"></el-table-column>
            <el-table-column label="处理状态">
                <template slot-scope="scope">
                    <span>{{ scope.row.taskStateDesc }}</span>
                    <i style="margin-left: 5px" :class="scope.row.taskStateIcon"></i>
                </template>
            </el-table-column>
            <el-table-column prop="uploadTimeFmt" label="上传时间"></el-table-column>
            <el-table-column prop="ruleId" label="操作" width="100">
                <template slot-scope="scope">
                <el-button @click="onDeleteIfc(scope.row)" type="text" ><span  id="deleteButton">删除</span></el-button>
                </template>
            </el-table-column>
        </el-table>
        <el-row type="flex" justify="end" style="background:#fff">
            <el-pagination background layout="prev, pager, next" :page-size="pageSize" :total="total"
                @current-change="paginChange"></el-pagination>
        </el-row>
        <el-row type="flex" justify="start">
            <el-upload class="upload-demo" :action="this.bimServer" 
                ref="upload"
                :auto-upload="false"
                :multiple="false"
                :on-change="onFileChange"
                :before-upload="onBeforeUpload"
                :on-success="onUploadSuccess">
                <!-- <el-button  style="margin-left: 10px;" @click="onBtnDirClick">{{this.ifc.dirName}}</el-button> -->
                <el-button slot="trigger" type="primary" icon="el-icon-upload" >上传我的文件</el-button>
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

        <el-dialog title="选择文件夹" :visible.sync="dialogVisible"  width="30%" :close-on-click-modal="false">
            <el-row type="flex" justify="end" style="margin-right:5px">
                <el-tooltip class="item" effect="dark" content="新建文件夹" placement="top-start">
                    <el-button type="primary" size="mini" icon="el-icon-folder-add" circle @click="onAddDir(false)"></el-button>
                </el-tooltip>
                <el-tooltip class="item" effect="dark" content="删除文件夹" placement="top-start">
                    <el-button type="primary" size="mini" icon="el-icon-folder-delete" circle @click="onDeleteDir"></el-button>
                </el-tooltip>
                <el-tooltip class="item" effect="dark" content="重命名" placement="top-start">
                    <el-button type="primary" size="mini" icon="el-icon-refresh-left" circle @click="onRenameDir"></el-button>
                </el-tooltip>
            </el-row>
            <el-row style="margin-top:10px">
                <!--要让tree有纵向滚动条就要包到bimTree的div中-->
                <div id="bimTree" tabindex="0" @click="onBlur" style="height: 300px;border:1px solid #f0f0f0">
                    <el-tree ref="dirTree" 
                    node-key="dirId"
                    :data="dirTree" 
                    :expand-on-click-node="false" 
                    :props="dirTreeProps" 
                    :default-expand-all="true"></el-tree>
                </div>
            </el-row>
            <span slot="footer" class="dialog-footer">
                <el-button  @click="onCancelUpload">取 消</el-button>
                <el-button  type="primary" @click="onSubmitUpload">确 定</el-button>
            </span>
        </el-dialog>
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
            progress:0,
            progressText:"当前有其他BIM正在解析,任务等待中...",
           

            dialogVisible:false,
            dirTree:[],
            dirTreeProps: {
                children: "children",
                label: "dirName"
            }
        };
    },
	methods: {
        //on-change绑定事件，文件状态改变时的钩子，添加文件、上传成功和上传失败时都会被调用
        onFileChange(file, fileList){
            //只有当前事件源的file状态是ready才表示是选择文件，上传成功是success
            if(file.status === 'ready')
            {
                this.dialogVisible = true;//显示目录选择对话框，然后在该对话框确定按钮事件里上传文件
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
            //检查目录
            if(this.ifc.dirId === -1)
            {
                this.$message.error('请为上传的IFC文件选择一个文件夹!');
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
                //上传成功后，清除上次选中的目录
                this.ifc.dirId = -1;
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
                    item.taskState === 0?item.taskStateDesc='等待处理':item.taskStateDesc='解析完成';
                    item.taskState === 0?item.taskStateIcon='el-icon-loading':item.taskStateIcon='el-icon-circle-check';
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
                let ifcPath = row.ifcPath;
                let taskId = row.taskId;
                bimAxios.get("/",{ params: {action:"deleteFile",taskId:taskId,ifcPath:ifcPath} }).then(data=>{

                })
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
        //模拟目录树失去焦点,取消tree选中节点，必须用这个函数，不能用setCurrentNode(null)
        onBlur(){
            this.$refs.dirTree.setCurrentKey(null);
        },
        //目录树对话框取消按钮
        onCancelUpload(){
            this.dialogVisible = false;
            this.ifc.dirId=-1;
            this.$refs.upload.clearFiles();
        },
        //目录树对话框确定按钮
        onSubmitUpload(){
            let selectedNode = this.$refs.dirTree.getCurrentNode();
            if(selectedNode != null)
            {
                this.ifc.dirId = selectedNode.dirId;
                this.ifc.dirName = selectedNode.dirName;
                this.dialogVisible = false;
                //手动提交上传
                this.$refs.upload.submit();
            }
            else
            {
                this.$message.error('请为IFC文件选择保存目录!');
            }
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

        //----------------------文件夹的添加、删除、重命名
        onAddDir(){
            let text = "请输入文件夹名称" ;//对话框lable
            let parentId = -1;

            let selectedNode = this.$refs.dirTree.getCurrentNode();
            if(selectedNode != null)
            {
                parentId = selectedNode.dirId;
                text = "创建 ["+selectedNode.dirName+"] 下的子目录"
            }
            this.$prompt(text,'新建文件夹',{
                confirmButtonText: '确定',
                cancelButtonText: '取消',
            }).then(({ value }) =>{
                let dir = {dirName:value,parentId:parentId,dirType:1};//ifc目录的类型是1
                this.$store.dispatch("dir/addDir",dir).then((data)=>{
                    this.$notify({
                        title: '消息',
                        message: '新建文件夹成功。',
                        type: 'success'
                    });
                    this.initDirTree();
                })
            }).catch(() => {
                //取消按钮处理
            })

        },
        onDeleteDir(){
            let selectedNode = this.$refs.dirTree.getCurrentNode();
            if(selectedNode == null)
            {
                this.$message.error('请选择要删除的文件夹!');
                return;
            }
            this.$confirm("确定删除文件夹 ["+selectedNode.dirName+"] 吗?", "提示", {
                confirmButtonText: '确定',
                cancelButtonText: '取消',
                type: 'warning'
            }).then(()=>{
                let dirId = selectedNode.dirId;
                this.$store.dispatch("dir/deleteDir",dirId).then(()=>{
                    this.initDirTree();
                    this.$notify({
                        title: '消息',
                        message: '删除成功',
                        type: 'success',
                        duration:3000
                    });
                });
            });
        },
        onRenameDir(){
            let selectedNode = this.$refs.dirTree.getCurrentNode();
            if(selectedNode == null)
            {
                this.$message.error('请选择要重命名的文件夹!');
                return;
            }
            this.$prompt('请输入文件夹新名称','新建文件夹',{
                confirmButtonText: '确定',
                cancelButtonText: '取消',
                inputValue:selectedNode.dirName  //目录原来名称
            }).then(({ value }) =>{
                let dir = {dirId:selectedNode.dirId,dirName:value};
                this.$store.dispatch("dir/renameDir",dir).then((data)=>{
                    this.$notify({
                        title: '消息',
                        message: '重命名成功',
                        type: 'success'
                    });
                    this.initDirTree();
                })
            }).catch(() => {
                //取消按钮处理
            })
        }

    },
	mounted() {
        this.initIFCTabel();
        this.initDirTree();
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
