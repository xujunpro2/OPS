<template>
	<div class="bimDiv">
		<canvas id="bim"></canvas>
        <div class="toolbarDiv">
            <el-tooltip class="item" effect="dark" content="BIM文件" placement="top-start">
                <el-button type="primary"  icon="el-icon-folder-opened" circle></el-button>    
            </el-tooltip>
            <el-tooltip class="item" effect="dark" content="空间结构" placement="top-start">
                <el-button type="primary"  icon="el-icon-office-building" circle></el-button>    
            </el-tooltip>
            <el-tooltip class="item" effect="dark" content="构件属性" placement="top-start">
                <el-button type="primary"  icon="el-icon-setting" circle></el-button>    
            </el-tooltip>
            <el-tooltip class="item" effect="dark" content="构件材质" placement="top-start">
                <el-button type="primary"  icon="el-icon-picture-outline" circle></el-button>    
            </el-tooltip>
             <el-tooltip class="item" effect="dark" content="进度模拟" placement="top-start">
                <el-button type="primary"  icon="el-icon-refresh-left" circle></el-button>    
            </el-tooltip>
            <el-tooltip class="item" effect="dark" content="质量隐患" placement="top-start">
                <el-button type="primary"  icon="el-icon-view" circle></el-button>    
            </el-tooltip>
             <el-tooltip class="item" effect="dark" content="安全隐患" placement="top-start">
                <el-button type="primary"  icon="el-icon-bell" circle></el-button>    
            </el-tooltip>
        </div>
        <!--BIM文件-->
        <div style="clear:both"></div> 
        <div class="bimDirDiv">

        </div>
        <!--空间结构-->
	</div>
</template>

<script>
import { xViewer, xState } from "@/assets/js/bim/bim";
import { Loading } from "element-ui";
import viewerHelper from "@/utils/viewHelper";

export default {
	name: "Bim",
	components: {},
	data() {
		return {
			jsonFile: "qiandaohu.json",
			xRay: false,
            bimId: -1,
            loadingInstance:null,
			bimLoaded: false
		};
	},
	methods: {
        initView(){
            let viewer = new xViewer("bim");
            viewerHelper.setViewer(viewer);
            viewer.on("error",error=>{
                if(error.message === 'bim file not found')
                {
                    this.$message.error('BIM文件不存在，请检查BIM服务器上的文件仓库中是否存在该文件!');
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
			});

			viewer.on("dblclick", args => {
				var id = args.id;
				if (id) {
					viewer.resetStates();
					viewer.zoomTo(id);
					viewer.setCameraTarget(id);
					//viewer.setState(xState.HIGHLIGHTED, [id]);
				}
			});
        },
		loadView(fileName) {
            this.unloadView();
			this.loadingInstance = Loading.service({
				target: ".bimDiv",
				text: "正在加载BIM"
            });
            let url = this.$store.state.uv.bimServer+"/?action=getFile&fileName="+fileName;
            let encodeUrl = encodeURI(url);//预防中文
            let viewer = viewerHelper.getViewer();
            if(viewer)
            {
                viewer.load(encodeUrl);
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
        }
	},
	mounted() {
        this.initView();
		//this.loadView('冷站.bimi');
	},
	beforeDestroy() {
		this.unloadView();
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
    /* background: #e0e0e0; */
    left:50%;
    bottom: 10px;
    margin: 0px 0px 0px -170px;/*50%为自身尺寸的一半*/
    width: 342px;
}
.bimDirDiv{
    position: absolute;
    background: #e0e0e0; 
    top:10px;
    left:10px;
    width:300px;
    height:300px
}
</style>
