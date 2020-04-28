<template>
	<div class="rootDiv">
		<el-row class="rootDiv">
			<el-col :span="8" style="height:100%">
				<bim ref="bim"></bim>
			</el-col>
			<el-col :span="16" style="height:100%">
				<el-row class="himArea">
					<him ref="him"></him>
				</el-row>
				<el-row class="infoArea">
					<el-col :span="12">
						<thumbnail-carousel @toHim="onToHim"></thumbnail-carousel>
					</el-col>
					<el-col :span="12">
						<alert></alert>
					</el-col>
				</el-row>
			</el-col>
		</el-row>
	</div>
</template>

<script>
import Bim from "./components/Bim";
import Him from "./components/Him";
import ThumbnailCarousel from "./components/ThumbnailCarousel";
import Alert from "./components/Alert";
export default {
	name: "factory",
	components: { Bim, Him, ThumbnailCarousel, Alert },
	data() {
		return {};
	},

	methods: {
		onToHim(canvasId) {
            this.$refs.him.loadCanvas(canvasId);
            this.$refs.bim.onThumbnailClick(canvasId);
		}
	},
	mounted() {},
	beforeDestroy() {}
};
</script>

<style scoped>
.himArea {
    margin: 0;
	height: calc(100% - 180px); /** "+或-" 两边要有空格 不然不生效 */
	border-bottom: 2px #e6e6e6 solid;
}
.infoArea {
	height: 180px;
	/* background-color:red */
}
</style>
