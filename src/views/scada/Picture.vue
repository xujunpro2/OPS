<template>
    <div style="width: 100%;height:100%">
        <!--画面容器DIV-->
        <div id="picDiv" style="width: 100%;height:100%;overflow: hidden; background-color: #f8f8f8;" />
        <!--TimeChooser改为vue控件实现-->
        <el-dialog title="时间范围" :visible.sync="timeChooser"  width="30%">
            <el-date-picker
                v-model="timeChooserValues"
                :type="timeChooserType"
                range-separator="至"
                start-placeholder="开始日期"
                end-placeholder="结束日期">
            </el-date-picker>
            <span slot="footer" class="dialog-footer">
                <el-button  @click="timeChooser = false">取 消</el-button>
                <el-button  type="primary" @click="onTimeChooserSubmit">确 定</el-button>
            </span>
        </el-dialog>
    </div>
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
            timeChooser: false,
            timeChooserType:"daterange",//year/month/date/week/ datetime/datetimerange/daterange
            timeChooserValues: [new Date(2000, 10, 10, 10, 10), new Date(2000, 10, 11, 10, 10)],
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
            this.rtda = new RTDA($('#picDiv')[0],this);
            this.rtda.init();
		},
		loadCanvas() {
			this.rtda.loadSVG(14);
        },
        //给timeChooser widget调用的api
        showTimeChooser(type,values){
            this.timeChooserType = type;
            this.timeChooserValues = values;
            this.timeChooser = true;
        },
        onTimeChooserSubmit(){
            this.rtda.getRtdaWidget().setTimeChooserValues(this.timeChooserValues);
            this.timeChooser = false;
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
