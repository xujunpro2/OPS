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
	data() {
		return {
            debug:true,
            modelId: -1,
			loadedBims: new Map(), //已加载的bim，key是guid，value是model id
			ifcNameCache: new Map(), //bim名称缓存,key是guid,value是ifc名称
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
            //设置移动构件
            //viewer.setHoldProductIds(this.viewConfig.moveIds);
			//直接先启动帧刷新，这样才能默认加载多个bim
			viewer.start();
			
			viewer.on("error", error => {
				if (error.message === "bim file not found") {
					this.$message.error(
						"无法访问模型，请检查data目录!"
					);
				} else {
					console.error(error.message);
				}
			});
			viewer.on("onprogress", data => {
				let guid = data.tag;
				let name = guid;
                let progress = Math.floor((data.loaded / data.total) * 100);
				this.loading.progressDatas.forEach(item => {
					if (item.guid === data.tag) {
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
				if (this.loading.waitCount == 0) {
                    
                   	viewer.zoomTo(5960400);
                    viewer.setCameraTarget(5960400);
                    viewer.setCameraPosition([9142.7451171875, 13734.3369140625, 77463.421875]);
                    viewer.manualRefresh();
                    this.addPlugins();

                    setTimeout(() => {
                        let flashPlugin = viewerHelper.getViewer().getPlugin("flash");
                        flashPlugin.addProds([5960400]);
                    }, 5000);
				}

				this.modelId = model.id;
				let guid = model.tag;
				//加入map缓存
				this.loadedBims.set(guid, model.id);
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
					var guid = viewer.getProductTag(id);
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
		loadBim(guids) {
			this.loading.downloadingCount = this.loading.waitCount =
				guids.length;
			this.loading.progressDatas.length = 0;
			this.loading.progressStep = 0;
			for (var i = 0; i < guids.length; i++) {
				let guid = guids[i];
				let bimiFile = guid + ".bimi";
				//预防中文，但发现C#还是有几率出现最后一个字乱码，所以现在bimi文件都是taskId当文件名
				let url = this.getDownloadUrl(bimiFile);
				let viewer = viewerHelper.getViewer();
				if (viewer) {
					this.loading.progressDatas.push({
						guid: guid,
						progress: 0,
						name: guid
					});
					viewer.load(url, guid);
				}
			}
        },
        //根据是否使用nignx动态生成bimi文件下载的url
        getDownloadUrl(bimiFile){
            return "bim/"+bimiFile;
        },
		//卸载模型是一个个的卸载
		unloadBim(guid) {
			//结构面板remove数据
			let name = guid;
			this.$refs.spatialPanel.remove(name);
			//属性面板remove数据
			this.$refs.propertiesPanel.remove(guid);

			let modelId = this.loadedBims.get(guid);
			//modelId从0开始
			if (modelId != -1) {
				let viewer = viewerHelper.getViewer();
				if (viewer) {
					viewer.stop(modelId);
					viewer.unload(modelId);
					this.loadedBims.delete(guid);
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
                
				let flashPlugin = new FlashPlugin();
                viewer.addPlugin(flashPlugin);

				let tipPlugin = new TipPlugin();
                viewer.addPlugin(tipPlugin);

                let labelPlugin = new LabelPlugin();
                viewer.addPlugin(labelPlugin);	
			}
        },
        onThumbnailClick(canvasId){
            console.info('canvasId:'+canvasId)
            let viewer = viewerHelper.getViewer();
            if(canvasId == 11)
            {
                 viewer.setCameraPosition([26561.6171875, 16810.826171875, 67974.0859375]);
                viewer.flyTo(5860067);
               
            }
            if(canvasId == 15)
            {
                 viewer.setCameraPosition([8959.3310546875, 13750.8017578125, 77533.171875]);
               	viewer.flyTo(5960400);
               
            }
            if(canvasId == 25)
            {
                viewer.setCameraPosition([46677.80078125, 9083.9072265625, 65250.125]);
               	viewer.flyTo(7638397);
            }
             if(canvasId == 9)
            {
                 viewer.setCameraPosition([35883.828125, 14765.751953125, 67174.75]);
               	viewer.flyTo(3015605);
  
               
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
        this.loadBim(["生产车间场景"]); 
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
    
	}
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
	width: 230px;
}
</style>
