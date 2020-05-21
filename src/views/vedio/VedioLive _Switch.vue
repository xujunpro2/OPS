<template>
	<div class="rootDiv">
        <el-row :gutter="5" class="full-height">
            <el-col :span="18" class="full-height">
                <camera-box ref="cameraBox"></camera-box>
            </el-col>
            <el-col :span="6" class="full-height">
                <div class="camera-table">
                    <el-table :data="cameraList" height="100%" border>
                        <el-table-column prop="cameraName" label="名称"></el-table-column>
                        <el-table-column label="播放" width="70">
                            <template slot-scope="scope">
                            <el-switch
                                :data-cameraIndexCode="scope.row.cameraIndexCode"
                                v-model="scope.row.playing"
                                @change = "switchChange($event,scope.row.cameraIndexCode)"> <!-- switch控件带自定义参数，$event必须这样写，传过去的是true/false状态，后面可以自由定义 -->
                                </el-switch>
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
        switchChange(curState,cameraIndexCode){
            //开状态，播放
            if(curState)
            {
                var camera = this.$refs.cameraBox.getCurSelectedCamera();
                if(camera != null)
                {
                    var param = {
                        "id" : cameraIndexCode, 
                        "stream" : 1,
                        "protocol" : "hls" 
                    }
                    //axios.get('http://115.236.183.190:8821/vediocenter/camera/play',{ params: param }).then
                    this.$store.dispatch('camera/getCameraPlayUrl',param).then((json)=>{
                        if(json.data.code == 1)
                        {
                            //恢复switch停用状态
                            this.cameraList.forEach(item=>{
                                if(item.cameraIndexCode == cameraIndexCode)
                                {
                                    item.playing = false;
                                }
                            })
                            this.$alert("视频流媒体服务器无法连接", "错误", {
                                type: "error"
                            });
                            return;
                        }
                        var url = json.data.url;
                        //var url = json.data.data.url;
                        //如果当前播放器正在播放，那么先获得当前的cameraIndexCode，然后将switch控件设false状态
                        var curCameraIndexCode = camera.cameraIndexCode;
                        if(curCameraIndexCode)
                        {
                            //找到对应的switch控件
                             this.cameraList.forEach(item=>{
                                if(item.cameraIndexCode == curCameraIndexCode)
                                {
                                    item.playing = false;
                                }
                            })
                        }
                        //播放新的视频
                        this.$refs.cameraBox.play(url,cameraIndexCode);
                        
                    })
                    
                }
                else
                {
                    this.$alert("请先选中摄像头的待播放区域", "错误", {
                        type: "error"
                    });
                    //还原switch状态
                    this.cameraList.forEach(item=>{
                        if(item.cameraIndexCode == cameraIndexCode)
                        {
                            item.playing = false;
                        }
                    })
                }
            }
            //关状态，暂停
            else
            {
                this.$refs.cameraBox.pause(cameraIndexCode)
            }
        },
        //初始化摄像头列表
        initCameraTable()
        {
            this.$store.dispatch("camera/getCameraList").then(data=>{
                if(data)
                {
                    //给switch控件加个绑定值，否则没法用
                    data.forEach(element => {
                        element.playing = false;
                    });
                    this.cameraList = data;
                }
            })
        },
        //变更视图布局
        setView(arg){
            this.$refs.cameraBox.count = arg.count;
            //摄像头列表的所有switch恢复
            this.cameraList.forEach(item=>{
                item.playing = false;
            })
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
                    console.info(json);
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
