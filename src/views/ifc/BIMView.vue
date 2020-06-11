<template>
	<div class="rootDiv">
        <el-row style="height:100%">
            <el-col :span="8" style="height:100%">
                <el-table height="100%" v-loading="loading" :data="tableData" tooltip-effect="dark" style="width: 100%">
                    <el-table-column prop="ifcName" label="模型"></el-table-column>
                    <el-table-column prop="ifcSizeDesc" label="大小"></el-table-column>
                    <el-table-column label="处理状态">
                        <template slot-scope="scope">
                            <i style="margin-left: 5px" :class="scope.row.taskStateIcon"></i>
                        </template>
                    </el-table-column>
                    <el-table-column prop="ruleId" label="操作" width="140">
                        <template slot-scope="scope">
                            <el-button @click="onPreview(scope.row)" type="text">预览</el-button>
                            <el-button @click="onSetting(scope.row)" type="text">场景设置</el-button>
                        </template>
                    </el-table-column>
                </el-table>
            </el-col>
            <el-col :span="16" style="height:100%">
                <bim ref="bim"></bim>
            </el-col>
        </el-row>
       
         <!--模型场景设置对话框-->
        <el-dialog title="场景设置" :visible.sync="dialogVisible" @open="onDialogOpen"  width="400px" :close-on-click-modal="false">
            <el-checkbox v-for="item of ifcUsed" :key="item.usedKey" v-model="item.checked">{{item.usedName}}</el-checkbox>
            <span slot="footer" class="dialog-footer">
                <el-button  @click="dialogVisible = false">取 消</el-button>
                <el-button  type="primary" @click="onSubmit">确 定</el-button>
            </span>
        </el-dialog>
    </div>
</template>

<script>
import {parseTime} from '@/utils/index';
import Bim from '@/components/Bim';
export default {
    name: "BIMView",
    components:{Bim},
	data() {
		return {
            curPreview:null,//当前预览的ifc，在切换预览的时候，需要unload
            loading:false, //table的loading
            tableData:[],
            dialogVisible:false,
            curIfc:null,//当前选中的ifc名称
            ifcUsed:[],//ifc场景定义
        };
	},
	methods: {
        initTabel(){
            this.loading = true;
            this.$store.dispatch('ifc/getAllIFC').then(data=>{
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
                    //状态2表示轻量化处理完毕
                    item.taskState!= 2?item.taskStateIcon='el-icon-loading':item.taskStateIcon='el-icon-circle-check';
                });
                this.loading = false;
            })
        },
        onPreview(row){
            var ifcName = row.ifcName;
            if(ifcName)
            {
                
                if(this.curPreview)
                {
                    //如果是同一个ifc，那么不能切换，bim会报错
                    if(this.curPreview == ifcName)
                    {
                        return;
                    }
                    //先卸载当前预览的ifc
                    this.$refs.bim.unloadBim(this.curPreview);
                }
                this.$refs.bim.loadBim([ifcName]); 
                this.curPreview = ifcName;
            }
        },
        onSetting(row){
            if(row.taskState == 2)
            {
                this.curIfc = row.ifcName;
                this.dialogVisible = true;
            }
            else
            {
                this.$alert("该模型尚未处理完毕，请稍后再试!", "提示", {
                    confirmButtonText: "确定",
                    type: "info"
                });
            }
        },
       

        //ifc使用场景
        initIfcUsed(){
            this.ifcUsed.length = 0;
            this.$store.dispatch('ifc/ifcUsed').then(data=>{
                data.forEach(item=>{
                    let usedIfcArray = [];
                    if(item.usedIFC && item.usedIFC != "")
                    {
                        usedIfcArray = item.usedIFC.split(',')
                    }
                    let chkItem = {
                        usedKey:item.usedKey,
                        usedName:item.usedName,
                        usedIFC:usedIfcArray,
                        checked:false,
                    }
                    this.ifcUsed.push(chkItem);
                })
            })
        },
        //打开场景设置对话框，先根据当前选中的ifc，判断checkbox是否选中
        onDialogOpen(){
            if(this.curIfc)
            {
                this.ifcUsed.forEach(item=>{
                    let usedIFCArray = item.usedIFC
                    if(usedIFCArray.indexOf(this.curIfc) != -1)
                    {
                        item.checked = true;
                    }
                })
            }
        },
        //提交场景变更
        onSubmit(){
            //参数形式{ifc:'测试模型',settings:{dev:true} }
            let param = {ifc:this.curIfc,settings:{}};
            this.ifcUsed.forEach(item=>{
                param.settings[item.usedKey] = item.checked
            })
            this.$store.dispatch('ifc/updateUsed',param).then(data=>{
                if(data){
                    this.dialogVisible = false;
                    //刷新数据
                    this.initIfcUsed();
                    this.$notify({title: '消息',message: '场景设置成功',type: 'success',duration:3000});
                }
            })
        },
    },
	mounted() {
        this.initTabel();
        this.initIfcUsed();
    },
	beforeDestroy() {}
};
</script>

<style scoped>

</style>
