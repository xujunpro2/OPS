<template>
  <el-row>
    <el-table
        :data="tableData"
        @row-click="handleRowClick"
        height="495"
        style="width:100%"
      >
        <el-table-column :fixed="true" prop="sn" label width="30"></el-table-column>
        <el-table-column :fixed="true" prop="part" label="部位" width="100">
           <template slot-scope="scope">
            <el-button @click="handlePartCell(scope.row)" type="text" >{{scope.row.part}}</el-button>
          </template>
        </el-table-column>
        <el-table-column prop="name" label="隐患内容" width="120"></el-table-column>
        <el-table-column prop="state" label="状态" width="60"></el-table-column>
        <el-table-column prop="date" label="发现时间" width="100"></el-table-column>
        <el-table-column width="50">
          <template slot-scope="scope">
            <el-button @click="handleClick(scope.row)" type="text" >详情</el-button>
          </template>
        </el-table-column>
      </el-table>


    <el-dialog title="隐患详情" :visible.sync="dialogVisible" @open="handleDialogOpen" width="30%">
      <el-tabs v-model="activeTab">
        <el-tab-pane label="隐患基本信息" name="info">
          <el-card :body-style="{ padding: '0px' }">
            <img :src="this.dangerImg" class="image">
            <div style="padding: 14px;">
              <span>&emsp;&emsp;{{this.dangerInfo}}</span>
            </div>
          </el-card>
        </el-tab-pane>
        <el-tab-pane label="隐患处理流程" name="flow">
          <el-timeline>
            <el-timeline-item timestamp="2018/12/15 08:20:00" color="#0079d7">
              <div style="float:left;">杜政</div><div style="float:left;padding-left: 50px;">发现隐患</div>
              <div style="clear:both;"/>
            </el-timeline-item>
            <el-timeline-item timestamp="2018/02/16 12:00:00" color="#0079d7">
              <div style="float:left;">马威</div><div style="float:left;padding-left: 50px;">责令处理</div>
              <div style="clear:both;"/>
            </el-timeline-item>
            <el-timeline-item timestamp="2018/12/28 08:00:00" color="#0079d7">
              <div style="float:left;">王璇</div><div style="float:left;padding-left: 50px;">完成整改</div>
              <div style="clear:both;"/>
            </el-timeline-item>
          </el-timeline>
        </el-tab-pane>
      </el-tabs>
    </el-dialog>
  </el-row>
</template>

<script>
//导入assets图片资源
import danger1 from "@/assets/icons/danger.jpg";
import danger2 from "@/assets/icons/danger2.jpg";
import danger3 from "@/assets/icons/danger3.jpg";

import { xViewer, xState } from "@/assets/js/bim/bim";
import viewerHelper from "@/utils/viewHelper";
export default {
  name: "Quality",
  props: {
  },
  data() {
    return {
       dialogVisible: false,
      activeTab: "info",
      dangerImg: danger1,
      dangerInfo: "",
      tableData: [
        {
          sn: "1",
          part: "3#楼梯",
          partId:2911512,
          name: "钢筋质量差",
          state: "逾期",
          date: "2019/06/01"
        },
        {
          sn: "2",
          part: "泵房基座",
          partId:926116,
          name: "水泥搅拌不均",
          state: "完成",
          date: "2019/06/03"
        },
        {
          sn: "3",
          part: "前导流隧洞",
          partId:1012984,
          name: "水泥质量差",
          state: "完成",
          date: "2019/06/04"
        }
      ]
    };
  },
  methods: {
     handleClick(row) {
      let part = row.part;
      if (part == "3#楼梯") {
        this.dangerImg = danger1;
        this.dangerInfo =
          "发现3#楼梯使用超拉的钢筋无法保证建筑的质量安全。钢筋拉长变细，它的性能也发生了根本变化，破坏了钢筋的延伸钢筋拉细性。";
      } else if (part == "泵房基座") {
        this.dangerImg = danger2;
        this.dangerInfo =
          "发现泵房基座水泥表面斑驳脱落，起灰很大，初步怀疑水泥标号错误或河沙比例不符合规定。";
      } else if (part == "前导流隧洞") {
        this.dangerImg = danger3;
        this.dangerInfo =
          "前导流隧洞内部墙壁产生3mm裂缝，圆曲率偏差>2CM，初步怀疑水泥标号错误或河沙比例不符合规定。";
      }
      this.dialogVisible = true;
      this.activeTab =  "info";//tab控件会记忆活动tab
    },
    handlePartCell(row){
      let id = row.partId;
      let viewer = viewerHelper.getViewer();
      if(viewer)
      {
        viewer.highlightingColour = [255, 0, 0, 255];
        viewer.resetStates();
        viewer.zoomTo(id);
        viewer.setCameraTarget(id);
        viewer.setState(xState.HIGHLIGHTED, [id]);
      }
    },
    handleRowClick(row) {
      
    },
    handleDialogOpen() {
      //alert('ss');
    }
  },

  mounted() {
    
  }
};
</script>

<style scoped>
.image {
  width: 100%;
  display: block;
}
</style>
