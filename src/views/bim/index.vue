<template>
  <div class="bimDiv">
    <canvas id="bim"></canvas>

    <div v-show="bimLoaded" class="tabDiv">
       <el-tabs v-model="activeTab" type="card" @tab-click="onTabClick">
        <el-tab-pane label="构件树" name="bimTree">
            <bim-tree :jsonFile="this.jsonFile"></bim-tree>
        </el-tab-pane>
        <el-tab-pane label="进度模拟" name="rate">
          <rate></rate>
        </el-tab-pane>
        <el-tab-pane label="质量隐患" name="quality">
           <quality></quality>
        </el-tab-pane>
        <el-tab-pane label="安全隐患" name="safety">
          <safety></safety>
        </el-tab-pane>
       </el-tabs> 
       <el-row type="flex" justify="end" style="padding:5px;">
         <el-checkbox v-model="xRay" @change="onChkRayChanged">启用半透明模式</el-checkbox>
       </el-row> 
    </div>
  </div>
</template>

<script>

import { xViewer, xState } from "@/assets/js/bim/bim";
import { Loading } from "element-ui";
import viewerHelper from "@/utils/viewHelper";
// import BimTree from "../components/bim/MeCard";
import BimTree from "@/components/bim/BimTree";
import Rate from "@/components/bim/Rate";
import Quality from "@/components/bim/Quality";
import Safety from "@/components/bim/Safety";

export default {
  name: "Bim",
  components: { BimTree ,Rate,Quality,Safety},
  data() {
    return {
      jsonFile:"qiandaohu.json",
      activeTab:"bimTree",
      xRay:false,
      bimId: -1,
      bimLoaded: false
    };
  },
  methods: {
    loadView() {
      this.bimId = -1;
      let viewer = new xViewer("bim");
      viewerHelper.setViewer(viewer);
      let loadingInstance = Loading.service({
        target: ".bimDiv",
        text: "正在加载BIM文件"
      });
      viewer.load("qiandaohu.bimx");
      viewer.on("loaded", model => {
        loadingInstance.close();
        this.bimLoaded = true;
        this.bimId = model.id;
        viewer.setCameraPosition([-35005.26953125, -80231.4375, 90642.9296875]);
        viewer.start();
      });
      viewer.on("error", arg => {
        console.error(arg.message);
      });
      viewer.on("dblclick", args => {
        var id = args.id;
        if (id) {
          viewer.resetStates();
          viewer.zoomTo(id);
          viewer.setCameraTarget(id);
          //viewer.setState(xState.HIGHLIGHTED, [id]);
        }
      });
    },
    onTabClick(){
      let viewer = viewerHelper.getViewer();
      if(viewer)
      {
        viewer.resetStates();
      }
    },
    onChkRayChanged(){
      let viewer = viewerHelper.getViewer();
      if(viewer)
      {
        if(this.xRay)
        {
          viewer.renderingMode = "x-ray";
        }
        else
        {
          viewer.renderingMode = "normal";
        }
      }
    }
  },
  mounted() {
    this.loadView();
  },
  beforeDestroy() {
    if (this.bimId != -1) {
      let viewer = viewerHelper.getViewer();
      if (viewer) {
        viewer.unload(this.bimId);
      }
    }
  }
};
</script>

<style scoped>
.bimDiv {
  width: 100%;
  height: 100%;
  overflow: hidden;
}
#bim {
  width: 100%;
  height: 100%;
  margin: 0;
  padding: 0;
  overflow: hidden;
}
.tabDiv {
    position: absolute;
    right: 20px;
    top: 70px;
    width: 340px;
    height: 580px;
    background: #fff;
  }


</style>
