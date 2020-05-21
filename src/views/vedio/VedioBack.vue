<template>
	<div class="rootDiv">
         <el-form ref="form" :model="queryForm"  label-width="80px">
            <el-row :gutter="10">
                <el-col :span="5">
                    <el-form-item label="摄像头">
                        <el-select v-model="queryForm.cameraIndexCode" filterable placeholder="请选择" style="width: 100%;">
							<el-option
								v-for="item in cameraList"
								:key="item.id"
								:label="item.name"
								:value="item.indexCode"
							></el-option>
						</el-select>
                    </el-form-item>
                </el-col>
                 <el-col :span="7">
                    <el-form-item label="开始时间">
                        <el-date-picker v-model="queryForm.startTime"  type="datetime" placeholder="选择日期" style="width: 100%;"></el-date-picker>
                    </el-form-item>
                </el-col>
                <el-col :span="5">
                    <el-form-item label="结束时间">
                        <el-date-picker v-model="queryForm.endTime"  type="datetime" placeholder="选择日期" style="width: 100%;"></el-date-picker>
                    </el-form-item>
                </el-col>
                <el-col :span="3">
                     <el-row type="flex" justify="end">
                        <el-button icon="el-icon-search" type="primary" :loading="loading" @click="onQuery()">查询</el-button>
                    </el-row>
                </el-col>
            </el-row>
        </el-form>
        <div class="cameraDiv">
            <camera ref="camera"></camera>
        </div>
    </div>
</template>

<script>
import Camera from "./components/Camera";
export default {
    name: "VedioBack",
    components: { Camera },
	data() {
		return {
            queryForm:{
                cameraIndexCode:null,
                startTime:'',
                endTime:'',
            },
            cameraList: [],
            loading:false,
        };
	},
	methods: {
          //初始化摄像头列表
        getCameraList()
        {
            this.$store.dispatch("camera/getCameraList").then(data=>{
                if(data)
                {
                    this.cameraList = data;
                }
            })
        },
        onQuery(){
            var param = {
                beginTime : this.queryForm.startTime.getTime(),
                endTime : this.queryForm.endTime.getTime(),
                cameraIndexCode : this.queryForm.cameraIndexCode,
            }
            this.loading = true;
            this.$store.dispatch("camera/vedioBack",param).then(json=>{
                this.loading = false;
                console.info(json);
                //收到视频url，正常播放
                if(json.code == 0 )
                {
                    let url = json.data.url;
                    if(url)
                    {
                        this.$refs.camera.playVedio(url);
                    }
                }
                //请求视频服务器失败
                if(json.code != 0)
                {
                    this.$notify({
                        title: '流媒体服务异常',
                        message: json.msg,
                        type:'error'
                    });
                }
            }).catch(()=>{
                this.loading = false;
            })
        }
    },
	mounted() {
        this.getCameraList();
    },
	beforeDestroy() {}
};
</script>

<style scoped>
.cameraDiv{
    width: 100%;
    height:  calc(100% - 60px);
}
</style>
