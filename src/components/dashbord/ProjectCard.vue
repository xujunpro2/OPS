<template>
  <div class="projectDiv">
    <div class="projectInfo">项目名称：流量调节阀室与能源回收电站</div>
    <div class="projectInfo">项目简介：请输入项目简介</div>
    <div class="projectInfo">项目经理：赵杨</div>
    <div class="projectInfo">公开项目：否</div>
    <div class="projectInfo">项目图片：</div>
    <div class="projImg">
      <img src="../../assets/icons/proj.png">
    </div>
  </div>
</template>

<script>
export default {
  name: "",
  props: {},
  data() {
    return {};
  },
  methods: {
   
  },

  mounted() {
    
  }
};
</script>

<style scoped>
.projectDiv {
  width: 500px;
  height: 250px;
}
.projectInfo {
  margin-bottom: 6px;
  font-size: 13px;
}

.projImg {
  /* background: #d40000; */
  width: 400px;
  height: 200px;
  position: relative;
  margin-top: -65px;
  margin-left: 130px;
}
.projImg img {
  width: 400px;
  height: 200px;
  object-fit: cover;
}
</style>
