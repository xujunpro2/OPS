<template>
	<div class="rootDiv">
        <el-row :gutter="5" class="full-height">
            <el-col :span="18" class="full-height">
                <camera-box ref="cameraBox"></camera-box>
            </el-col>
            <el-col :span="6" class="full-height">
                <div class="camera-table">
                    <el-table :data="cameraList" height="100%" border>
                        <el-table-column prop="name" label="名称"></el-table-column>
                        <el-table-column label="播放" width="70">
                            <template slot-scope="scope">
                                <el-button @click="play(scope.row.indexCode)" icon="el-icon-caret-right" circle  size="mini"></el-button>
                            </template>
                        </el-table-column>
                    </el-table>
                </div>
                <p/>
                <camera-control @action="controlAction"/>
              
                <camera-view @setView="setView"/>
            </el-col>
        </el-row>
	</div>
</template>

<script>
import axios from 'axios'
import CameraBox from './components/CameraBox'
import CameraControl from './components/CameraControl'
import CameraView from './components/CameraView'
export default {
    name: "VedioLive",
    components:{CameraBox,CameraControl,CameraView},
	data() {
		return {
            cameraList: []
		};
	},
	methods: {
        //播放停止(只能暂停)视频
        play(cameraIndexCode){
            var camera = this.$refs.cameraBox.getCurSelectedCamera();
            if(camera != null)
            {
                var param = {
                        "id" : cameraIndexCode, 
                        "protocol" : "hls" 
                }
                //axios.get('http://115.236.183.190:8821/vediocenter/camera/play',{ params: param }).then
                this.$store.dispatch('camera/getCameraPlayUrl',param).then((json)=>{
                    if(json.code == 0) //视频服务返回的code为0表示OK
                    {
                        var url = json.data.url;
                        this.$refs.cameraBox.play(url,cameraIndexCode);    
                    }
                    else
                    {
                        this.$notify({
                            title: '流媒体服务异常',
                            message: json.msg,
                            type:'error'
                        });
                    }
                })
                    
            }
            else
            {
                this.$alert("请先选中摄像头的待播放区域", "错误", {
                        type: "error"
                });
                
            }
        },
        //初始化摄像头列表
        initCameraTable()
        {
            this.$store.dispatch("camera/getCameraList").then(data=>{
                if(data)
                {
                    this.cameraList = data;
                }
            })
        },
        //变更视图布局
        setView(arg){
            this.$refs.cameraBox.count = arg.count;
        },
        //云台控制
        controlAction(arg){
            var selectedCamera = this.$refs.cameraBox.getCurSelectedCamera();
            if(selectedCamera && selectedCamera.cameraIndexCode)
            {
                var param = {
                    action:arg.action,
                    speed:arg.speed,
                    command:arg.command,
                    cameraIndexCode:selectedCamera.cameraIndexCode
                }
                this.$store.dispatch('camera/cameraControl',param).then(json=>{
                    if(json.code != 0)
                    {
                        this.$notify({
                            title: '流媒体服务异常',
                            message: json.msg,
                            type:'error'
                        });
                    }
                })
                
            }
            else
            {
                this.$alert("请先选中当前为播放状态的摄像头", "错误", {
                    type: "error"
                });
            }
           
        },
   },
	mounted() {
        this.initCameraTable();
        this.$nextTick(()=>{
          
        })
        
    },
	beforeDestroy() {
          
    }
};
</script>

<style scoped>
.camera-table{
    width: 100%;
    overflow: auto;
    /* background: #000; */
    height:  calc(100% - 320px);
}

.full-height{
    height: 100%;
}

.camera-control{
    width:100%;
    height: 150px;
}

.item :hover{
    cursor: pointer;
    background: #409EFF;
}
</style>
