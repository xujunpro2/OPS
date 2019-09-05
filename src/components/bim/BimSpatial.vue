<template>
	<x-drag-panel ref="dragPanel" :bindObj="panel">
		<!--要让tree有纵向滚动条就要包到bimTree的div中-->
		<div id="bimTree" style="height:100%;">
			<el-tree
				:data="spatialData"
				:props="props"
				@node-click="handleNodeClick"
				:expand-on-click-node="false"
			></el-tree>
		</div>
	</x-drag-panel>
</template>

<script>
// import axios from "axios"; //@/ 指src目录   ./ 表示当前目录下   ../ 表示父级目录下
import { xViewer, xState } from "@/assets/js/bim/bim";
import viewerHelper from "@/utils/viewHelper";
import XDragPanel from "@/components/Controls/XDragPanel";
import bimAxios from "@/utils/requestBim";

export default {
	name: "",
	components: { XDragPanel },
	data() {
		return {
            panel:{
                visiable:false,
                title:"空间结构",
                color:"box box-primary",
                width:"300px",
                //height:"300px", 
                height:(document.body.clientHeight -200)+"px", 
                top:"50px",
                right:"50px",
                zIndex:1
            },
			spatialData: [],
			props: {
				children: "children",
				label: "name"
			}
		};
	},
	methods: {
		getFile(spatialFile) {
			if (spatialFile != null && spatialFile !== "") {
                bimAxios.get("/",{ params: {action:"getFile",fileName:spatialFile} }).then(data=>{
                    this.spatialData = data;
                })
                .catch(error => {
                   //bimi文件加载做了message，这里不用处理了
                });
			}
		},
		handleNodeClick(data) {
			let viewer = viewerHelper.getViewer();
			if (viewer) {
				viewer.highlightingColour = [255, 173, 33, 255];
				let ifcId = data.id;
				let success = viewer.zoomTo(ifcId);
				if (success) {
					viewer.setCameraTarget(ifcId);
					viewer.resetStates();
					viewer.setState(xState.HIGHLIGHTED, [ifcId]);
				}
			}
        }
	},

	mounted() {
		
	}
};
</script>

<style scoped>
</style>
