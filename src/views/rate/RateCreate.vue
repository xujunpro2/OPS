<template>
	<div class="rootDiv">
		<x-drag-panel :bindObj="p1">
            <div style="height:300px;background:#e0e0e0">我是内容</div>
        </x-drag-panel>
	</div>
</template>

<script>
import XDragPanel from "@/components/Controls/XDragPanel";
export default {
    name: "RateCreate",
    components: { XDragPanel},
	data() {
		return {
            p1:{
                title:"第一个面板",
                color:"box box-primary",
                width:"300px",
                height:"200px", 
                top:"20px",
                left:"10px",
                //right:"10px",
                //bottom:"10px"
            }
        };
	},
	methods: {
	
    },
	mounted() {},
	beforeDestroy() {}
};
</script>

<style scoped>

</style>
