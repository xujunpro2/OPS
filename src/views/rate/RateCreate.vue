<template>
	<div class="rootDiv">
		<el-upload class="upload-demo" drag action="http://localhost:9999" :multiple="false"
            :on-success="onUploadSuccess">
			<i class="el-icon-upload"></i>
			<div class="el-upload__text">
				将文件拖到此处，或<em>点击上传</em>
			</div>
		</el-upload>
	</div>
</template>

<script>
export default {
	name: "RateCreate",
	data() {
		return {};
	},
	methods: {
		onUploadSuccess(response, file, fileList) {
            //上传成功后，会返回转换任务的guid，这个是查询进度的凭证
            let taskId = response;
            console.info("转换任务GUID："+taskId);
        }
    },
	mounted() {},
	beforeDestroy() {}
};
</script>

<style scoped>

</style>
