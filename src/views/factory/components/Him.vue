<template>
        <div class="rootDiv">
              <div id="picDiv" style="width: 100%;height:500px;overflow: hidden; background-color: #f8f8f8;" />
        </div>
</template>

<script>
import $ from "jquery";
import request from "@/utils/request";

import RTDA from "@/assets/js/rtda/rtda";
import RtdaSocket from "@/assets/js/rtda/rtdaWebsocket";

export default {
	name: "him",
	data() {
		return {
   
        };
	},

	methods: {
        getCanvasList() {
			request.get("canvas/getCanvasList.action").then(data => {
				console.info(data);
				//resolve(data);
			});
		},
		initRtda() {
			//构建画面运行处理对象
            this.rtda = new RTDA($('#picDiv')[0],this);
            this.rtda.init();
		},
		loadCanvas(canvasId) {
			this.rtda.loadSVG(canvasId);
        }
	},
	mounted() {
        this.initRtda();
        this.loadCanvas(25);
    },
    beforeDestroy(){
        this.rtda.dispose();//释放当前画面资源
        this.rtda.exit();//释放websocket
        
    }
};
</script>
    
<style scoped>

</style>
