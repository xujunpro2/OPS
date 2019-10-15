<template>
	<!--时间控件、echarts-->
	<div id="picDiv" style="width: 100%;height:100%;overflow: hidden; background-color: #f8f8f8;" />
</template>

<script>
import $ from "jquery";
import request from "@/utils/request";

import RTDA from "@/assets/js/rtda/rtda";
import RtdaSocket from "@/assets/js/rtda/rtdaWebsocket";

export default {
	name: "Picture",
	data() {
		return {
            rtda:null//画面处理器
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
            this.rtda = new RTDA($('#picDiv')[0]);
            this.rtda.init();
		},
		loadCanvas() {
			this.rtda.loadSVG(41);
		}
	},
	mounted() {
		this.initRtda();
        this.loadCanvas();
    },
    beforeDestroy(){
        //vue是单页面应用，在路由跳转的时候，要手工释放这些资源
        this.rtda.dispose();//释放当前画面资源
        this.rtda.exit();//释放websocket
    }
};
</script>

<style scoped>
</style>
