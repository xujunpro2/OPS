<template>
    <el-row>
      <el-col :span="6">
        <div class="part" :style="{'background':this.items[0].color}"> <!--动态设置css-->
          <div class="part-name">{{this.items[0].name}}</div>
          <div class="part-count">{{this.items[0].count}}</div>
          <div class="part-icon"><i :class="items[0].icon"></i></div><!--动态设置class-->
        </div>
      </el-col>

    <el-col :span="6">
    <div class="part" :style="{'background':this.items[1].color}" > <!--动态设置css-->
      <div class="part-name">{{this.items[1].name}}</div>
      <div class="part-count">{{this.items[1].count}}</div>
      <div class="part-icon"><i :class="items[1].icon"></i></div><!--动态设置class-->
    </div>
    </el-col>

<el-col :span="6">
    <div class="part" :style="{'background':this.items[2].color}" > <!--动态设置css-->
      <div class="part-name">{{this.items[2].name}}</div>
      <div class="part-count">{{this.items[2].count}}</div>
      <div class="part-icon"><i :class="items[2].icon"></i></div><!--动态设置class-->
    </div>
    </el-col>

  <el-col :span="6">
    <div class="part" :style="{'background':this.items[3].color}" > <!--动态设置css-->
      <div class="part-name">{{this.items[3].name}}</div>
      <div class="part-count">{{this.items[3].count}}</div>
      <div class="part-icon"><i :class="items[3].icon"></i></div><!--动态设置class-->
    </div>
    </el-col>

 </el-row>

</template>

<script>
export default {
  name: "sum-card",
  props: {},
  data() {
    return {
      items:[
        {name:"模型",count:"7",color:"#666633",icon:"el-icon-menu"},
        {name:"问题",count:"2",color:"#cc6600",icon:"el-icon-warning-outline"},
        {name:"隐患",count:"3",color:"#cc9933",icon:"el-icon-thumb"},
        {name:"人员",count:"4",color:"#009999",icon:"el-icon-s-custom"}
      ]
    };
  },
  methods: {
    loadView() {}
  },

  mounted() {
    this.loadView();
  }
};
</script>

<style scoped>
.part {
  width: 90%;
  height: 80px;
  border-radius: 5px;
}
.part .part-name {
  font-size: 14px;
  font-weight: 500;
  color: #fff;
  padding-top: 8px;
  margin-left: 14px;
}
.part .part-count {
  font-size: 18px;
  font-weight: 500;
  color: #fff;
  margin-top: 2px;
  margin-left: 50%;
}
.part .part-icon {
  margin-top: 5px;
  margin-left: 80%;
}
.part .part-icon i{
  color:#fff;font-size:20px
}
</style>
