<template>
    <div class="bimDiv">
        <canvas id="bim"></canvas>


        <div class="testDiv" v-if="debug">
            <el-button size="mini" round @click="test()">获得测试数据</el-button>
        </div>


        <div v-if="loading.waitCount !== 0" class="loading_bg"></div>
        <div v-if="loading.waitCount !== 0" class="loading">
            <el-steps :active="loading.progressStep" finish-status="success">
                <el-step title="下载轻量化文件"></el-step>
                <el-step title="渲染三维模型"></el-step>
            </el-steps>
            <div v-for="item of loading.progressDatas">
                <span style="font-size:13px">{{item.name}}</span>
                <el-progress :percentage="item.progress" color="#409eff'"></el-progress>
            </div>
            <p></p>
            <div v-if="loading.progressStep === 1">
                <i class="el-icon-loading"></i>
                <span style="font-size:14px">正在渲染三维模型,请稍后...</span>
            </div>
        </div>
    </div>
</template>

<script>

import { BimiViewer, ProductState } from "@/assets/js/bim/bim";
import FlashPlugin from "@/assets/js/bim/plugins/FlashPlugin";
import TipPlugin from "@/assets/js/bim/plugins/TipPlugin";
import PointPlugin from "@/assets/js/bim/plugins/PointPlugin";
import RoamingPlugin from "@/assets/js/bim/plugins/RoamingPlugin";
import LabelPlugin from "@/assets/js/bim/plugins/LabelPlugin";
import NavCube from "@/assets/js/bim/plugins/NavCubePlugin";
import PathPlugin from "@/assets/js/bim/plugins/PathPlugin";
import RectSelectionPlugin from "@/assets/js/bim/plugins/RectSelectionPlugin"
import viewerHelper from "@/utils/viewHelper";

export default {
    name: "bim",
    props: {
        ifc:{
            type:String,
        }
    },
	data() {
		return {
            debug:false,
			loadedBims: new Map(), //已加载的bim，key是模型名称，value是model id
			//加载进度相关的数据和标志位
			loading: {
				downloadingCount: 0, //标志位：正在下载的数量，到0的时候，progressStep前进一步
				progressStep: 0, //标志位：loading步骤
				progressDatas: [], //下载bimi文件的进度条数据
				waitCount: 0 //标志位：loading需要等待处理的bim数量，每个bim完全载入后-1，当到0的时候，销毁loading
            },
        };
	},

	methods: {
		initView() {
            let viewer = new BimiViewer("bim", true);
            viewerHelper.setViewer(viewer);
            //设置面积体积计算
            viewer.enableCalculateAreaOrVolume(false);
			//直接先启动帧刷新，这样才能默认加载多个bim
			viewer.start();
			
			viewer.on("error", error => {
				if (error.message === "bim file not found") {
					this.$message.error(
						"无法访问模型，请检查BIM服务器!"
					);
				} else {
					console.error(error.message);
				}
			});
			viewer.on("onprogress", data => {
                let progress = Math.floor((data.loaded / data.total) * 100);
				this.loading.progressDatas.forEach(item => {
					if (item.name === data.tag) {
						item.progress = Math.floor(
							(data.loaded / data.total) * 100
						);
					}
				});
			});
			viewer.on("ondownloaded", data => {
				//每次bimi文件下载完毕后，判断一下是否全部的bimi文件都下载结束了，如果都结束了，那么就进入到step2
				this.loading.downloadingCount--;
				if (this.loading.downloadingCount == 0) {
					this.loading.progressStep = 1;
				}
			});
			viewer.on("loaded", model => {
				this.loading.waitCount--;
                if (this.loading.waitCount == 0)
                {
                    this.addPlugins();
				}
				//加入map缓存
				this.loadedBims.set(model.tag, model.id);
			});

			viewer.on("dblclick", args => {
                var id = args.id;
				if (id) {
					viewer.resetStates();
					viewer.zoomTo(id);
					viewer.setState(ProductState.HIGHLIGHTED, [id]);
				}
			});

			viewer.on("pick", args => {
                var id = args.id;
                console.info(id);
				if (id) {
					//获得构件所属于的bim
					var ifcName = viewer.getProductTag(id);
					viewer.resetStates();
					viewer.setState(ProductState.HIGHLIGHTED, [id]);
				}
			});
		},
		//关闭页面，释放当前所有的bim模型
		destroyView() {
			if (this.loadedBims.size > 0) {
				let viewer = viewerHelper.getViewer();
				let modelIds = new Array();
				this.loadedBims.forEach((value, key, map) => {
					modelIds.push(value);
				});
				modelIds.forEach(id => {
					viewer.stop(id);
					viewer.unload(id);
				});
				modelIds.length = 0;
				this.loadedBims.clear();
			}
		},
		//加载默认模型的时候可能会一次加载多个bim
		loadBim(ifcNames) {
			this.loading.downloadingCount = this.loading.waitCount =ifcNames.length;
			this.loading.progressDatas.length = 0;
			this.loading.progressStep = 0;
			for (var i = 0; i < ifcNames.length; i++) {
				let ifcName = ifcNames[i];
				let bimiFile = ifcName + ".bimi";
				//预防中文，但发现C#还是有几率出现最后一个字乱码，所以现在bimi文件都是taskId当文件名
				let url = this.getDownloadUrl(bimiFile);
				let viewer = viewerHelper.getViewer();
				if (viewer) {
					this.loading.progressDatas.push({
						progress: 0,
						name: ifcName
                    });
                    //ifcName作为tag传进去,loaded会传出来
					viewer.load(url, ifcName);
				}
			}
        },
        //根据是否使用nignx动态生成bimi文件下载的url
        getDownloadUrl(bimiFile){
            var url;
            if(this.$store.state.uv.nginx)
            {
                url = this.$store.state.uv.nginx+"/"+bimiFile;
            }
            else
            {
                this.$alert("服务端没有配置ngix!", "提示", {
                    confirmButtonText: "确定",
                    type: "danger"
                });
            }
           
            return url;
        },
		//卸载模型是一个个的卸载
		unloadBim(ifcName) {
			let modelId = this.loadedBims.get(ifcName);
			//modelId从0开始
			if (modelId != -1) {
				let viewer = viewerHelper.getViewer();
				if (viewer) {
					viewer.stop(modelId);
					viewer.unload(modelId);
					this.loadedBims.delete(ifcName);
					viewer.manualRefresh();
				}
			}
        },
        //加载bim插件
		addPlugins() {
			let viewer = viewerHelper.getViewer();
            if (viewer) 
            {
                let navCube = new NavCube();
                viewer.addPlugin(navCube);
			}
        },
  
        test()
        {
             //视角当前数据
            var p = viewerHelper.getViewer().getCameraPosition();
            console.info(p);
            //视角初始数据
            var orthogonalCamera = viewerHelper.getViewer().orthogonalCamera;
            console.info(orthogonalCamera);
        }
	},
	mounted() {
        this.initView();
       // this.loadBim(["管线布置场景"]); 
       // this.loadBim(["生产车间场景"]); 
      //this.loadBim(["OneWall"]);
        document.oncontextmenu = function() {
			return false;
        };
    },
    beforeDestroy() {
		this.destroyView();
		document.oncontextmenu = function() {
			return true;
        };
    },
    

};
</script>

<style scoped>
.bimDiv {
	position: relative;
	width: 100%;
	height: 100%;
	overflow: hidden;
}
#bim {
	width: 100%;
	height: 100%;
	margin: 0;
	padding: 0;
	overflow: hidden;
}
.toolbarDiv {
	position: absolute;
    /* background: #ffffff;  */
	left: 50%;
	bottom: 10px;
	margin: 0px 0px 0px -70px; /*50%为自身尺寸的一半*/
	width: 140px;
}
.loading_bg {
	position: absolute;
	left: 0;
	right: 0;
	top: 0;
	bottom: 0;
	background: rgba(255, 255, 255, 0.9);
	z-index: 99;
}
.loading {
	position: absolute;
	/* background-color: #ffff; */
	left: 50%;
	top: 50%;
	margin: -100px 0 0 -140px; /*50%为自身尺寸的一半*/
	width: 280px;
	color: #606266;
	z-index: 100;
}

.testDiv {
    /* background: red; */
	position: absolute;
	/* background: #ffffff; */
	right: 10px;
	top: 10px;
	width: 130px;
}
</style>
