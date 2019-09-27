<template>
	<div class="bimDiv">
		<canvas id="bim"></canvas>
        <div class="toolbarDiv">
            <el-tooltip class="item" effect="dark" content="三维模型" placement="top-start">
                <el-button size="medium" type="primary"  icon="el-icon-folder-opened" circle @click="showBimFilesPanel"></el-button>    
            </el-tooltip>
            <el-tooltip class="item" effect="dark" content="空间结构" placement="top-start">
                <el-button size="medium" type="primary"  icon="el-icon-office-building" circle @click="showSpatialPanel"></el-button>    
            </el-tooltip>
            <el-tooltip class="item" effect="dark" content="构件属性" placement="top-start">
                <el-button size="medium" type="primary"  icon="el-icon-picture-outline" circle @click="showPropertiesPanel"></el-button>    
            </el-tooltip>
            <el-tooltip class="item" effect="dark" content="扩展属性" placement="top-start">
                <el-button size="medium" type="primary"  icon="el-icon-picture-outline-round" circle @click="showExtPropertiesPanel"></el-button>    
            </el-tooltip>
             <el-tooltip class="item" effect="dark" content="进度模拟" placement="top-start">
                <el-button size="medium" type="primary"  icon="el-icon-refresh-left" circle></el-button>    
            </el-tooltip>
            <el-tooltip class="item" effect="dark" content="质量隐患" placement="top-start">
                <el-button size="medium" type="primary"  icon="el-icon-view" circle></el-button>    
            </el-tooltip>
            <el-tooltip class="item" effect="dark" content="安全隐患" placement="top-start">
                <el-button size="medium" type="primary"  icon="el-icon-bell" circle @click="test"></el-button>    
            </el-tooltip>
            <el-tooltip class="item" effect="dark" content="设为默认模型" placement="top-start">
                <el-button size="medium" type="primary"  icon="el-icon-s-home" circle @click="setDefaultBim"></el-button>    
            </el-tooltip>
        </div>
        <!--BIM文件-->
        <bim-files ref="filesPanel" @bimFileChange="onBimFileChange"></bim-files>
        <!--空间结构-->
        <bim-spatial ref="spatialPanel"></bim-spatial>
        <!--构件属性-->
        <bim-properties ref="propertiesPanel"></bim-properties>
        <!--构件扩展属性-->
        <bim-ext-properties ref="extPropertiesPanel"></bim-ext-properties>
	</div>
</template>

<script>
import { xViewer, xState } from "@/assets/js/bim/bim"
import FlashPlugin from "@/assets/js/bim/plugins/FlashPlugin"
import TipPlugin from "@/assets/js/bim/plugins/TipPlugin"
import NavCube from "@/assets/js/bim/plugins/NavCube/NavCube"
import { Loading } from "element-ui"
import viewerHelper from "@/utils/viewHelper"
import BimFiles from "@/components/bim/BimFiles"
import BimSpatial from "@/components/bim/BimSpatial"
import BimProperties from "@/components/bim/BimProperties"
import BimExtProperties from "@/components/bim/BimExtProperties"

export default {
	name: "Bim",
	components: {BimFiles,BimSpatial,BimProperties,BimExtProperties},
	data() {
		return {
            curTaskId:this.$store.state.uv.specail.defaultBim, //specail表中的个人默认bim
            bimId: -1,
            loadingInstance:null,
            bimLoaded: false,
            bimGUID:null,
            spatialFile:'',
            propertiesFile:'',
            materialsFile:''
		};
	},
	methods: {
        test(){
            var ids = [42582];

        },
        initView(){
            let viewer = new xViewer("bim",true);
            viewerHelper.setViewer(viewer);
            viewer.on("error",error=>{
                if(error.message === 'bim file not found')
                {
                    this.$message.error('无法访问模型，请检查与BIM服务器的网络连接,以及BIM文件仓库中是否存在该模型!');
                    this.loadingInstance.close();
                }
                else
                {
                    console.error(error.message);
                }
            });
            viewer.on("loaded", model => {
				this.loadingInstance.close();
				this.bimLoaded = true;
				this.bimId = model.id;
				// viewer.setCameraPosition([
				// 	-35005.26953125,
				// 	-80231.4375,
				// 	90642.9296875
				// ]);
                viewer.start();
                this.addPlugins();
                //加载空间结构文件
                this.$refs.spatialPanel.getFile(this.spatialFile);
                //加载构件属性文件
                this.$refs.propertiesPanel.getFile(this.propertiesPanel,this.materialsFile);
			});

			viewer.on("dblclick", args => {
				var id = args.id;
				if (id) {
					viewer.resetStates();
					viewer.zoomTo(id);
					viewer.setCameraTarget(id);
					viewer.setState(xState.HIGHLIGHTED, [id]);
				}
            });
            
            viewer.on("pick",args=>{
                var id = args.id;
				if (id) {
					viewer.resetStates();
                    viewer.setState(xState.HIGHLIGHTED, [id]);
                    this.$refs.propertiesPanel.setCurProperty(id);
                    this.$refs.extPropertiesPanel.setCurProperty(this.bimGUID,id);
				}
            })
        },
		loadView(fileName) {
            this.bimGUID = fileName;//bim的guid
            let bimiFile = fileName+".bimi";
            this.spatialFile =fileName+".tree.json";
            this.propertiesPanel = fileName+".property.json";
            this.materialsFile = fileName+".material.json";
            this.unloadView();
			this.loadingInstance = Loading.service({
				target: ".bimDiv",
				text: "正在加载三维模型"
            });
            //预防中文，但发现C#还是有几率出现最后一个字乱码，所以现在bimi文件都是taskId当文件名
            let url = this.$store.state.uv.bimServer+"/?action=getFile&fileName="+encodeURI(bimiFile);
            let viewer = viewerHelper.getViewer();
            if(viewer)
            {
                viewer.load(url);
            }
        },
        unloadView(){
            if (this.bimId != -1) 
            {
                let viewer = viewerHelper.getViewer();
                if (viewer) 
                {
                    viewer.stop(this.bimId);
                    viewer.unload(this.bimId);
                }
		    }
        },
        //加载bim插件
        addPlugins(){
            let viewer = viewerHelper.getViewer();
            if(viewer)
            {
                let flashPlugin = new FlashPlugin();
                viewer.addPlugin(flashPlugin);
                let tipPlugin = new TipPlugin();
                viewer.addPlugin(tipPlugin);
                let navCube = new NavCube();
                viewer.addPlugin(navCube);
            } 
        },
        //切换bim文件
        onBimFileChange(arg){
            let taskId = arg.taskId;
            //bim不一样才加载
            if(taskId !== this.curTaskId)
            {
                this.loadView(taskId);
                this.curTaskId = taskId;
            }
        },
        //显示bim文件面板
        showBimFilesPanel(){
            this.$refs.filesPanel.panel.visiable = !this.$refs.filesPanel.panel.visiable;
            this.setPanelTop(this.$refs.filesPanel.panel);
        },
        //显示结构树面板
        showSpatialPanel(){
            this.$refs.spatialPanel.panel.visiable = !this.$refs.spatialPanel.panel.visiable;
            this.setPanelTop(this.$refs.spatialPanel.panel);
        },
        //显示构件属性面板
        showPropertiesPanel(){
            this.$refs.propertiesPanel.panel.visiable = !this.$refs.propertiesPanel.panel.visiable;
            this.setPanelTop(this.$refs.propertiesPanel.panel);
        },
        //显示构件扩展属性面板
        showExtPropertiesPanel(){
            this.$refs.extPropertiesPanel.panel.visiable = !this.$refs.extPropertiesPanel.panel.visiable;
            this.setPanelTop(this.$refs.extPropertiesPanel.panel);
        },
        setPanelTop(panel){
            if(panel.visiable)
            {
                this.$refs.spatialPanel.panel.zIndex = 1;
                this.$refs.filesPanel.panel.zIndex = 1;
                this.$refs.propertiesPanel.panel.zIndex = 1;
                panel.zIndex = 2;
            }
        },
        //设置默认模型
        setDefaultBim(){
            if(this.curTaskId && this.curTaskId !== "")
            {
                this.$confirm("确定设置当前模型为默认模型吗?", "提示", {
                    confirmButtonText: '确定',
                    cancelButtonText: '取消'
                }).then(()=>{
                    let specailObj = {defaultBim:this.curTaskId};
                    this.$store.dispatch("uv/setUserSpecail",specailObj).then(()=>{
                        this.$notify({
                            title: '消息',
                            message: '默认模型设置成功。',
                            type: 'success',
                            duration:3000
                        });
                    })
                }).catch(() => {});
            }
        }
	},
	mounted() {
        this.initView();
        //如果设置了默认bim
        if(this.curTaskId && this.curTaskId !=="")
        {
            this.loadView(this.curTaskId);
        }
        document.oncontextmenu = function() {
            return false;
        };
	},
	beforeDestroy() {
        this.unloadView();
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
    /* background: #ffffff; */
    left:50%;
    bottom: 10px;
    margin: 0px 0px 0px -200px;/*50%为自身尺寸的一半*/
    width: 400px;
}

</style>
