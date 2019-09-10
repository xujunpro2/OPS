<template>
  <el-row>
    <el-table
        :data="tableData"
        @row-click="handleRowClick"
        height="495"
        style="width:100%"
      >
        <el-table-column fixed prop="sn" label width="30"></el-table-column>
        <el-table-column fixed prop="part" label="部位" width="100">
          <template slot-scope="scope">
            <el-button
              @click="handlePartCell(scope.row)"
              type="text"
              
            >{{scope.row.part}}</el-button>
          </template>
        </el-table-column>
        <el-table-column prop="name" label="隐患内容" min-width="110"></el-table-column>
        <el-table-column prop="state" label="状态"></el-table-column>
        <el-table-column prop="date" label="发现时间" min-width="100"></el-table-column>
        <el-table-column width="60">
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
          <el-table
            :header-row-style="{'display': 'none'}"
            :data="itemData"
            border
            style="width: 100%;"
          >
            <el-table-column prop="name" label="日期" align="center" style="width: 50%;"></el-table-column>
            <el-table-column prop="text" label="姓名" align="center" style="width: 50%"></el-table-column>
          </el-table>
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
  name: "Safety",
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
          part: "机房控制室",
          partId: 2911512,
          name: "未设置护栏",
          state: "已处理",
          date: "2019/06/01"
        },
        {
          sn: "2",
          part: "泵房基座",
          partId: 926116,
          name: "未铺设防滑垫",
          state: "处理中",
          date: "2019/06/03"
        },
        {
          sn: "3",
          part: "前室下水井",
          partId: 1012984,
          name: "井盖脱落",
          state: "未处理",
          date: "2019/06/04"
        }
      ],
      itemData: [
        {
          name: "隐患编号",
          text: "JZ20180231"
        },
        {
          name: "隐患状态",
          text: "未处理"
        },
        {
          name: "发起人",
          text: "张三"
        },
        {
          name: "发起时间",
          text: "2019-05-12"
        },
        {
          name: "负责人",
          text: "李四"
        },
        {
          name: "隐患内容",
          text: "未设置护栏"
        },
        {
          name: "详细描述",
          text:
            "机房控制室楼梯栏杆缺失。控制室离地高度4米，走廊长43米，存在人员安全隐患。"
        }
      ]
    };
  },
  methods: {
     handleClick(row) {
      let part = row.part;
      if (part == "机房控制室") {
        this.dangerImg = danger1;
        this.dangerInfo =
          "机房控制室楼梯栏杆缺失。控制室离地高度4米，走廊长43米，存在人员安全隐患。";
      } else if (part == "泵房基座") {
        this.dangerImg = danger2;
        this.dangerInfo =
          "发现泵房基座水泥表面斑驳脱落，起灰很大，初步怀疑水泥标号错误或河沙比例不符合规定。";
      } else if (part == "前室下水井") {
        this.dangerImg = danger3;
        this.dangerInfo =
          "前室下水井盖丢失，地面窨井周围无警告标识牌，附近光照较暗，有跌落的隐患。";
      }
      this.dialogVisible = true;
      this.activeTab = "info"; //tab控件会记忆活动tab
    },
    handlePartCell(row) {
      let id = row.partId;
      let viewer = viewerHelper.getViewer();
      if (viewer) {
        let part = row.part;
        if (part == "机房控制室") {
          viewer.highlightingColour = [0, 255, 0, 255]; //绿色
        }
        if (part == "泵房基座") {
          viewer.highlightingColour = [255, 173, 33, 255]; //黄色
        }
        if (part == "前室下水井") {
          viewer.highlightingColour = [255, 0, 0, 255]; //红色
        }

        viewer.resetStates();
        viewer.zoomTo(id);
        viewer.setCameraTarget(id);
        viewer.setState(xState.HIGHLIGHTED, [id]);
      }
    },
    handleRowClick(row) {},
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
