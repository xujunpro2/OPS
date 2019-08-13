<template>
   <div  class="rateDiv" style="height:500px">
      <el-calendar style="marggin-top:-50px" v-model="sixMonth">
        <template slot="dateCell" slot-scope="{date}">
          <!-- <div v-if="date.getDate() == 1 && date.getMonth()+1 == 6" class="myDay overDay"> -->
          <div :class="isFeatureDay(date)" @click="onCalendarClick(date)">{{date.getDate()}}</div>
        </template>
      </el-calendar>
      <!-- <el-row type="flex" justify="end" style="margin-right:10px;margin-top:-30px">
       <el-button type="primary" icon="el-icon-edit" size="mini">恢复全貌</el-button>
      </el-row> -->
      <el-table :data="tableData"  height="180" style="width:100%;marggin-top:-10px">
        <el-table-column prop="sn" label width="30"></el-table-column>
        <el-table-column prop="name" label="计划内容" width="110"></el-table-column>
        <el-table-column prop="state" label="状态" width="80"></el-table-column>
        <el-table-column prop="date" label="日期" width="95"></el-table-column>
      </el-table>
    </div>
</template>

<script>
import { xViewer, xState } from "@/assets/js/bim/bim";
import viewerHelper from "@/utils/viewHelper";
export default {
  name: "Rate",
  props: {
  },
  data() {
    return {
        sixMonth:"2019/6/1",
        tableData: [
        {
          sn: "1",
          name: "基础浇筑",
          state: "逾期",
          date: "2019/06/01"
        },
        {
          sn: "2",
          name: "钢筋进场",
          state: "完成",
          date: "2019/06/03"
        },
        {
          sn: "3",
          name: "水泥进场",
          state: "完成",
          date: "2019/06/04"
        },
        {
          sn: "4",
          name: "主体框架",
          state: "未开始",
          date: "2019/06/06"
        }
      ]
    };
  },
  methods: {
        //根据传入日期，生成对应的css给v-bind
    isFeatureDay(date) {
      let month = date.getMonth() + 1;
      let day = date.getDate();

      if (day == 1 && month == 6) {
        return "myDay delayDay";
      } else if ((day == 3 || day == 4) && month == 6) {
        return "myDay overDay";
      } else if (
        (day == 6 || day == 9 || day == 17 || day == 23) &&
        month == 6
      ) {
        return "myDay featureDay";
      }

      return "myDay";
    },
    onCalendarClick(date) {
      let viewer = viewerHelper.getViewer();
      if (viewer == null) {
        return;
      }
      var sn1 = [
        2609590,
        2609522,
        948203,
        2609818,
        2609748,
        948063,
        948133,
        2609976,
        2610204,
        2610134,
        947992,
        952097,
        1357912,
        948290,
        1356819,
        823675,
        1301,
        837021,
        851960,
        40734,
        34733,
        18562,
        18623,
        36291,
        38894,
        37296,
        39451,
        59081,
        206806,
        265746,
        295285,
        324140
      ];

      var sn3 = [
        2609590,
        2609522,
        948203,
        2609818,
        2609748,
        948063,
        948133,
        2609976,
        2610204,
        2610134,
        947992,
        952097,
        1357912,
        948290,
        1356819,
        823675,
        1301,
        837021,
        851960,
        40734,
        34733,
        18562,
        18623,
        36291,
        38894,
        37296,
        39451,
        59081
      ];

      var sn4 = [
        2609590,
        2609522,
        948203,
        2609818,
        2609748,
        948063,
        948133,
        2609976,
        2610204,
        2610134,
        947992,
        952097,
        1357912,
        948290,
        1356819,
        823675,
        1301,
        837021,
        851960,
        40734,
        34733,
        18562,
        18623,
        36291,
        38894
      ];

      var sn6 = [
        2609590,
        2609522,
        948203,
        2609818,
        2609748,
        948063,
        948133,
        2609976,
        2610204,
        2610134,
        947992,
        952097,
        1357912,
        948290,
        1356819,
        823675,
        1301,
        837021,
        851960,
        40734,
        34733,
        18562,
        18623
      ];

      var sn9 = [
        2609590,
        2609522,
        948203,
        2609818,
        2609748,
        948063,
        948133,
        2609976,
        2610204,
        2610134,
        947992,
        952097,
        1357912,
        948290,
        1356819,
        823675,
        1301
      ];

      var sn17 = [
        2609590,
        2609522,
        948203,
        2609818,
        2609748,
        948063,
        948133,
        2609976,
        2610204,
        2610134,
        947992,
        952097
      ];

      var sn23 = [2609590, 2609522, 948203];

      let month = date.getMonth() + 1;
      let day = date.getDate();
      var demoDays = [1, 3, 4, 6, 9, 17, 23];
      if (month == 6) {
        if (demoDays.indexOf(day) > -1) {
          viewer.resetStates();
          if (day == 1) {
            viewer.setState(xState.HIDDEN, sn1);
          } else if (day == 3) {
            viewer.setState(xState.HIDDEN, sn3);
          } else if (day == 4) {
            viewer.setState(xState.HIDDEN, sn4);
          } else if (day == 6) {
            viewer.setState(xState.HIDDEN, sn6);
          } else if (day == 9) {
            viewer.setState(xState.HIDDEN, sn9);
          } else if (day == 17) {
            viewer.setState(xState.HIDDEN, sn17);
          } else if (day == 23) {
            viewer.setState(xState.HIDDEN, sn23);
          }
        }
      }
    }
  },

  mounted() {
   
  }
};
</script>

<style scoped>
  .myDay {
    width: 100%;
    height: 100%;
    text-align: center;
    font-size: 12px;
    line-height: 24px;
  }
  .featureDay {
    background: #7aacff;
  }
  .overDay {
    background: #4dff4d;
  }
  .delayDay {
    background: #ff6f4d;
  }
</style>
