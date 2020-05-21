<template>
    <div class="view-box">
        <el-card class="box-card">
            <div slot="header" class="clearfix">
                <span class="card-title">视图控制</span>
            </div>
            <el-row :gutter="5" type="flex" justify="center">

                <el-button-group>
                    <el-tooltip class="item" effect="dark" content="截图" placement="top-start">
                        <el-button  icon="el-icon-picture-outline"></el-button>
                    </el-tooltip>
                    <el-tooltip class="item" effect="dark" content="单画面" placement="top-start">
                        <el-button @click="setView(1)"  icon="el-icon-s-platform"></el-button>
                    </el-tooltip>
                    <el-tooltip class="item" effect="dark" content="四画面" placement="top-start">
                        <el-button @click="setView(4)"   icon="el-icon-menu"></el-button>
                    </el-tooltip>
                    <el-tooltip class="item" effect="dark" content="九画面" placement="top-start">
                        <el-button @click="setView(9)"   icon="el-icon-s-grid"></el-button>
                    </el-tooltip>
                </el-button-group>
            </el-row>
        </el-card>
    </div>
</template>

<script>
export default {
    name: "CameraView",
	data() {
		return {
            
		};
	},
	methods: {
		setView(count){
            this.$emit('setView',{count:count})
        }
    },
	mounted() {},
    beforeDestroy() 
    {
		
	}
};
</script>

<style scoped>
.view-box{
    width:100%;
    height: 100px;
}
.card-title{
    font-size: 14px;
    font-weight: 600;
    color:#409EFF;
}

</style>
