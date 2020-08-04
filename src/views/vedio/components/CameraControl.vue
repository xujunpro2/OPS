<template>
    <div class="control-box">
        <el-card class="box-card">
            <div slot="header" class="clearfix">
                <span class="card-title">云台控制</span>
            </div>
            <el-row :gutter="5">
                <el-col :span="12">
                    <div class="camera-box">
                        <div class="camera-div">
                            <button @click="stopControl" class="camera-atuo-button">STOP</button>
                            <ul class="camera-direct-ul">
                                <li><a @click="cameraControl('LEFT')"><i class="el-icon-top"></i></a></li>
                                <li><a @click="cameraControl('LEFT_UP')"><i class="el-icon-caret-top"></i></a></li>
                                <li><a @click="cameraControl('UP')"><i class="el-icon-top"></i></a></li>
                                <li><a @click="cameraControl('RIGHT_UP')"><i class="el-icon-caret-top"></i></a></li>
                                <li><a @click="cameraControl('RIGHT')"><i class="el-icon-top"></i></a></li>
                                <li><a @click="cameraControl('RIGHT_DOWN')"><i class="el-icon-caret-top"></i></a></li>
                                <li><a @click="cameraControl('DOWN')"><i class="el-icon-top"></i></a></li>
                                <li><a @click="cameraControl('LEFT_DOWN')"><i class="el-icon-caret-top"></i></a></li>
                            </ul>
                        </div>
                    </div>
                </el-col>
                <el-col :span="12">
                    <el-row>
                        <el-col :span="8">
                            <el-button size="mini" icon="el-icon-minus" circle></el-button>
                        </el-col>
                        <el-col :span="8" style="font-size:12px;line-height: 30px;">变倍</el-button>
                        </el-col>
                        <el-col :span="8">
                            <el-button size="mini" icon="el-icon-plus" circle></el-button>
                        </el-col>
                    </el-row>
                    <el-row>
                        <el-col :span="8">
                            <el-button size="mini" @click="cameraControl('ZOOM_OUT')" icon="el-icon-minus" circle></el-button>
                        </el-col>
                        <el-col :span="8" style="font-size:12px;line-height: 30px;">变焦</el-button>
                        </el-col>
                        <el-col :span="8">
                            <el-button size="mini" @click="cameraControl('ZOOM_IN')" icon="el-icon-plus" circle></el-button>
                        </el-col>
                    </el-row>
                    <el-row>
                        <el-col :span="8">
                            <el-button size="mini" @click="cameraControl('IRIS_REDUCE')" icon="el-icon-minus" circle></el-button>
                        </el-col>
                        <el-col :span="8" style="font-size:12px;line-height: 30px;">光圈</el-button>
                        </el-col>
                        <el-col :span="8">
                            <el-button size="mini"  @click="cameraControl('IRIS_ENLARGE')" icon="el-icon-plus" circle></el-button>
                        </el-col>
                    </el-row>
                    <el-row>
                        <el-col :span="8" style="font-size:12px;line-height: 40px;">云台速度</el-col>
                        <el-col :span="16">
                            <el-slider v-model="speed"></el-slider>
                        </el-col>
                    </el-row>
                </el-col>
            </el-row>
        </el-card>
    </div>
</template>

<script>
export default {
    name: "CameraControl",
	data() {
		return {
            speed:50,
            curCommand:null,//当前命令
		};
	},
	methods: {
        //云台控制会一直运行挺长时间，需要stop
        cameraControl(command)
        {
            this.curCommand = command;
            this.$emit('action',{command:command,action:0,speed:this.speed});
        },
        //停止云台控制
        stopControl(){
            //感觉不需要cmmand
            if(this.curCommand)
            {
                this.$emit('action',{command:this.curCommand,action:1,speed:this.speed});
            }

        }
    },
	mounted() {},
    beforeDestroy() 
    {
		
	}
};
</script>

<style scoped>
.control-box{
    width:100%;
    height: 200px;
}
.card-title{
    font-size: 14px;
    font-weight: 600;
    color:#409EFF;
}
.camera-box {
    width: 130px;
    height: 130px;
    /*margin: 0 auto;*/
    position: relative;
}

.camera-div {
    position: absolute;
    width: 100%;
    height: 100%;
    z-index: 10;
    border: #e3e3e3 solid 5px;
    background: #e3e3e3;
    opacity: 0;
    -webkit-transform: scale(0.1);
    -ms-transform: scale(0.1);
    -moz-transform: scale(0.1);
    transform: scale(0.1);
    pointer-events: none;
    overflow: hidden;


    border-radius: 50%;
    opacity: 1;
    -webkit-transform: scale(1);
    -moz-transform: scale(1);
    -ms-transform: scale(1);
    transform: scale(1);
    pointer-events: auto;
}

.camera-atuo-button {
    position: absolute;
    top: 50%;
    left: 50%;
    z-index: 11;
    margin-top: -27.5px;
    margin-left: -27.5px;
    width: 55px;
    height: 55px;
    border: #e3e3e3 solid 5px;
    border-radius: 50%;
    color: #fff;
    text-align: center;
    font-weight: 600;
    font-size: 12PX;
    cursor: pointer;
    background: #ababb0;
}
.camera-atuo-button:hover {
    background: #409EFF;
}

.camera-direct-ul {
    list-style: none;
    margin: 0;
    padding: 0;
}

.camera-direct-ul li {
    position: absolute;
    overflow: hidden;
    width: 50%;
    height: 50%;
    font-size: 1.5em;
    -webkit-transition: all .3s ease;
    -moz-transition: all .3s ease;
    transition: all .3s ease;
    -webkit-transform-origin: 100% 100%;
    -moz-transform-origin: 100% 100%;
    transform-origin: 100% 100%;
    pointer-events: none;
}

.camera-direct-ul li:first-child {
    -webkit-transform: rotate(-22.5deg) skew(48deg);
    -moz-transform: rotate(-22.5deg) skew(48deg);
    -ms-transform: rotate(-22.5deg) skew(48deg);
    transform: rotate(-22.5deg) skew(48deg);
}

.camera-direct-ul li:nth-child(2) {
    -webkit-transform: rotate(22.5deg) skew(48deg);
    -moz-transform: rotate(22.5deg) skew(48deg);
    -ms-transform: rotate(22.5deg) skew(48deg);
    transform: rotate(22.5deg) skew(48deg);
}

.camera-direct-ul li:nth-child(3) {
    -webkit-transform: rotate(67.5deg) skew(48deg);
    -moz-transform: rotate(67.5deg) skew(48deg);
    -ms-transform: rotate(67.5deg) skew(48deg);
    transform: rotate(67.5deg) skew(48deg);
}

.camera-direct-ul li:nth-child(4) {
    -webkit-transform: rotate(112.5deg) skew(48deg);
    -moz-transform: rotate(112.5deg) skew(48deg);
    -ms-transform: rotate(112.5deg) skew(48deg);
    transform: rotate(112.5deg) skew(48deg);
}

.camera-direct-ul li:nth-child(5) {
    -webkit-transform: rotate(157deg) skew(48deg);
    -moz-transform: rotate(157deg) skew(48deg);
    -ms-transform: rotate(157deg) skew(48deg);
    transform: rotate(157deg) skew(48deg);
}

.camera-direct-ul li:nth-child(6) {
    -webkit-transform: rotate(202.5deg) skew(48deg);
    -moz-transform: rotate(202.5deg) skew(48deg);
    -ms-transform: rotate(202.5deg) skew(48deg);
    transform: rotate(202.5deg) skew(48deg);
}

.camera-direct-ul li:nth-child(7) {
    -webkit-transform: rotate(247.5deg) skew(48deg);
    -moz-transform: rotate(247.5deg) skew(48deg);
    -ms-transform: rotate(247.5deg) skew(48deg);
    transform: rotate(247.5deg) skew(48deg);
}

.camera-direct-ul li:nth-child(8) {
    -webkit-transform: rotate(292.5deg) skew(48deg);
    -moz-transform: rotate(292.5deg) skew(48deg);
    -ms-transform: rotate(292.5deg) skew(48deg);
    transform: rotate(292.5deg) skew(48deg);
}

.camera-direct-ul li a {
    position: absolute;
    right: -50%;
    bottom: -65%;
    display: block;
    width: 150%;
    height: 150%;
    border-radius: 50%;
    background: #ababb0;
    color: #fff;
    text-align: center;
    text-decoration: none;
    font-size: 1.0em;
    line-height: 2;
    -webkit-transform: skew(-48deg) rotate(-67.5deg) scale(1);
    -moz-transform: skew(-48deg) rotate(-67.5deg) scale(1);
    -ms-transform: skew(-48deg) rotate(-67.5deg) scale(1);
    transform: skew(-48deg) rotate(-67.5deg) scale(1);
    -webkit-backface-visibility: hidden;
    backface-visibility: hidden;
    pointer-events: auto;
}

.camera-direct-ul li a:hover {
    background: #409EFF;
}

</style>
