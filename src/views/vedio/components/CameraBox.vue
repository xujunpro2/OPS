<template>
	<div class="rootDiv">
		<camera @onSelected = "cameraSelected" v-if="count == 1"/>
        <div class="grid-four" v-if="count == 4">
            <div class="item"><camera @onSelected = "cameraSelected"></camera></div>
            <div class="item"><camera @onSelected = "cameraSelected"></camera></div>
            <div class="item"><camera @onSelected = "cameraSelected"></camera></div>
            <div class="item"><camera @onSelected = "cameraSelected"></camera></div>
        </div>
         <div class="grid-nine" v-if="count == 9">
            <div class="item"><camera @onSelected = "cameraSelected"></camera></div>
            <div class="item"><camera @onSelected = "cameraSelected"></camera></div>
            <div class="item"><camera @onSelected = "cameraSelected"></camera></div>
            <div class="item"><camera @onSelected = "cameraSelected"></camera></div>
            <div class="item"><camera @onSelected = "cameraSelected"></camera></div>
            <div class="item"><camera @onSelected = "cameraSelected"></camera></div>
            <div class="item"><camera @onSelected = "cameraSelected"></camera></div>
            <div class="item"><camera @onSelected = "cameraSelected"></camera></div>
            <div class="item"><camera @onSelected = "cameraSelected"></camera></div>
        </div>
	</div>
</template>

<script>
import Camera from "./Camera";
export default {
	name: "CameraBox",
	components: { Camera },
	data() {
		return {
            count: 4,
            curSelectCameraId:null,
		};
	},
	methods: {

        play(url,cameraIndexCode){
            var camera = this.getCurSelectedCamera();
            if(camera)
            {
                camera.playVedio(url);
                camera.cameraIndexCode = cameraIndexCode;
            }
        },
        pause(cameraIndexCode){
            var camera = this.findCamera(cameraIndexCode);
            if(camera)
            {
                camera.pauseVedio();
            }
        },
        // change(url){
        //     this.$refs.c1.changeVedio(url)
        // },
        dispose(){
            //this.$refs.c1.disposeVedio();
        },
        //处理Camera组件selected回调
        cameraSelected(arg)
        {
            this.curSelectCameraId = arg.guid;
            //将其他组件的选中状态清除
            this.$children.forEach(component=>{
                if(component.guid && component.guid != this.curSelectCameraId)
                {
                    component.unSelect();
                }
            })
        },
        //获得当前选中的Camera组件
        getCurSelectedCamera(){
            var camera = null;
            this.$children.forEach(component=>{
                if(component.guid && component.guid == this.curSelectCameraId)
                {
                    camera = component;
                }
            })
            return camera;
        },
        //根据index code查找Camera组件
        findCamera(cameraIndexCode){
            var camera = null;
            this.$children.forEach(component=>{
                if(component.cameraIndexCode && component.cameraIndexCode == cameraIndexCode)
                {
                    camera = component;
                }
            })
            return camera;
        },
    },
    watch:{
        //一旦布局发生变动，初始化信息
        count(newValue,oldValue){
            this.curSelectCameraId = null;
        }
    },
	mounted() {
		this.$nextTick(() => {
	
		});
	},
	beforeDestroy() {}
};
</script>

<style scoped>
.fullHeight{
    height: 100%;
}

.grid-four{
   
    width: 100%;
    height: 100%;
    display: grid;
    grid-template-columns: repeat(2, 1fr); /**repeat(2, 1fr) 意思就是 50%,50% */
    grid-auto-rows: minmax(100px, 50%); /*列高 最小100px 最大 50% */
}
.grid-nine{
   
    width: 100%;
    height: 100%;
    display: grid;
    grid-template-columns: repeat(3, 1fr); 
    grid-auto-rows: minmax(100px, 33%); 
}
.item {
    width: 100%;
    height: 100%;
    /* border: 1px solid #e5e4e9; */
}
</style>
