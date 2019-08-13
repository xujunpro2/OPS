<template>
   <div id="bimTree" style="height: 500px;">
   <el-tree
        :data="ifcData"
        :props="defaultProps"
        @node-click="handleNodeClick"
        :expand-on-click-node="false"
      ></el-tree>
   </div>
</template>

<script>
import axios from 'axios'; //@/ 指src目录   ./ 表示当前目录下   ../ 表示父级目录下
import { xViewer, xState } from "@/assets/js/bim/bim";
import viewerHelper from "@/utils/viewHelper";
export default {
  name: "BimTree",
  props: {
    jsonFile:{
      type:String
    }
  },
  data() {
    return {
      ifcData: [],
      defaultProps: {
        children: "children",
        label: "name"
      },
    };
  },
  methods: {
    loadIFCData() {
      //axios.get('/user',{params: {id: 12345}}) //带参数可以统一这么写
      if(this.jsonFile != null && this.jsonFile != "")
      {
          axios
            .get(this.jsonFile)
            .then(response => {
              this.ifcData = response.data; //箭头函数可以直接用this指向这个vue
            })
            .catch(error => {
              console.log(error);
            });
      }
    },
    handleNodeClick(data) {
      let viewer = viewerHelper.getViewer();
      if (viewer) {
        viewer.highlightingColour = [255, 173, 33, 255];
        let ifcId = data.id;
        let success = viewer.zoomTo(ifcId);
        if (success) {
          viewer.setCameraTarget(ifcId);
          viewer.resetStates();
          viewer.setState(xState.HIGHLIGHTED, [ifcId]);
          
        }
      }
    },
  },

  mounted() {
    this.loadIFCData();
  }
};
</script>

<style scoped>

</style>
