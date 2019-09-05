<template>
	<x-drag-panel :bindObj="panel">
		<!--要让tree有纵向滚动条就要包到bimTree的div中-->
		<div id="bimTree" style="height:100%;">
			<el-tree
				ref="dirTree"
				:lazy="true"
				:load="loadNode"
				:props="props"
				:expand-on-click-node="false"
				@node-click="handleNodeClick"
			></el-tree>
		</div>
	</x-drag-panel>
</template>

<script>
import XDragPanel from "@/components/Controls/XDragPanel";
export default {
	name: "",
	components: { XDragPanel },
	data() {
		return {
			panel: {
				visiable: false,
				title: "三维模型",
				color: "box box-primary",
				width: "300px",
				height: document.body.clientHeight - 300 + "px",
				top: "50px",
				left: "50px"
				//right:"10px",
				//bottom:"10px"
			},
			dirData: [],
			props: {
				label: "nodeLabel",
				isLeaf: "isLeaf"
			}
		};
    },

	methods: {
		//Tree的load绑定
		loadNode(node, resolve) {
			//root目录
			if (node.level === 0) {
				this.$store.dispatch("dir/rootIFCDirs").then(data => {
					return resolve(data);
				});
			} else {
				let dirId = node.data.nodeId; //获得node绑定的数据对象
				this.$store
					.dispatch("dir/childDirsAndIFCS", dirId)
					.then(data => {
						return resolve(data);
					});
			}
        },
        //向父组件发送事件
        handleNodeClick(data) {
            if(data.isLeaf && data.bindObj)
            {
                let taskId = data.bindObj;
                this.$emit('bimFileChange', {taskId:taskId});
            }
			
		}
	},

	mounted() {}
};
</script>

<style scoped>
</style>
