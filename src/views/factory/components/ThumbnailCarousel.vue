<template>
    <div class="rootDiv">
        <el-carousel :interval="4000" type="card" height="140px">
            <el-carousel-item label="焦化监控">
                <img src="thumbnail/thumbnail1.png" class="thumbnail" @click="goHim(11)"></img>
            </el-carousel-item>
            <el-carousel-item label="炼钢监控">
                <img src="thumbnail/thumbnail2.png" class="thumbnail" @click="goHim(25)"></img>
            </el-carousel-item>
            <el-carousel-item label="动力监控">
                <img src="thumbnail/thumbnail3.png" class="thumbnail" @click="goHim(15)"></img>
            </el-carousel-item>
            <el-carousel-item label="机修监控">
                <img src="thumbnail/thumbnail4.png" class="thumbnail" @click="goHim(9)"></img>
            </el-carousel-item>
        </el-carousel>
    </div>
</template>

<script>

export default {
	name: "thumbnail",
	data() {
		return {
   
        };
	},

	methods: {
        
        goHim(canvasId){
            this.$emit('toHim',canvasId);
        }
        
	},
	mounted() {
      
    },
    beforeDestroy(){
        
    }
};
</script>
    
<style scoped>
    .thumbnail{
        width:100%;
        /* height: 200px; */
    }
</style>
