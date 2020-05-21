<template>
    <div class="videoDiv" :style="{background:bgColor}" @click="onSelected">
        <video
            class="video-js vjs-default-skin"
            style="width: 100%;height: 100%"
            controls
            type="application/x-mpegURL"
            ref="videoRef"
        >
            <source ref="sourceBox" />
        </video>
    </div>
</template>

<script>
import videojs from "video.js";
import "videojs-contrib-hls";

import shortid from 'shortid'

export default {
    name: "Camera",
    props:{
        // id:{type:String,required:true}
    },
	data() {
		return {
            guid:shortid.generate(),
            cameraIndexCode:null,//当前绑定的摄像头index code
            player:null, //初始化
            selected:false,//是否选中
            bgColor:'#fff',//背景色
		};
	},
	methods: {
		playVedio(url) {
            //第一次，构建videojs对象
            if(!this.player)
            {
                this.$refs.sourceBox.src = url;
                this.player = videojs(this.$refs.videoRef, 
                    {
                        controls: true,
                        autoplay: true,
                        preload: 'auto'
                    },()=>{
                        console.info('player ready');
                    }
                );
                // this.player.src(
                //     {
                //     src: url,
                //     type: 'application/x-mpegURL',
                //     withCredentials: true
                //     }
                // )
            }
            //切换视频源
            else
            {
                this.player.src(url);
            }
            
        },
        pauseVedio(){
            if(this.player)
            {
                this.player.pause();
            }
        },
        disposeVedio()
        {
            if(this.player)
            {
                this.player.dispose();
                this.player = null;
            }
        },
        onSelected(){
            this.selected = true;
            this.$emit('onSelected',{guid:this.guid});
        },
        unSelect(){
            this.selected = false;
        }
	
    },
    watch:{
        selected(newValue,oldValue){
            if(this.selected)
            {
                this.bgColor = '#409eff';
            }
            else
            {
                this.bgColor = '#fff';
            }
        }
    },
	mounted() {},
	beforeDestroy() {
		this.disposeVedio();
	}
};
</script>

<style scoped>
    .videoDiv{
        width:100%;
        height: 100%;
        min-width: 100px;
        min-height: 100px;
        padding: 4px;
    }
</style>
