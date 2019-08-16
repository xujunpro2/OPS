<template>
	<div class="rootDiv">
		<el-row>
            <el-col :span="6">
                <x-panel :bindObj="p1">
                    <div style="height:100px;background:#e0e0e0">ddd</div>
                </x-panel>
            </el-col>
		</el-row>
	</div>
</template>

<script>
import XPanel from "@/components/Controls/XPanel";
export default {
    name: "RateCreate",
    components: { XPanel},
	data() {
		return {
            p1:{title:"第一个面板",color:"box box-primary",height:"height:200px"}
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
