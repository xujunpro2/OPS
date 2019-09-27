<template>
  <div class="rootDiv" style="background:#ecf0f5">
    <!-- <me-card  :data="this.numbers[0]" ></me-card> -->
    <template v-for="(item,index) in numbers">
      <el-row :key="index" v-if="index % 4 == 0" style="background:#ecf0f5">
        <el-col :span="6">
          <me-card
            v-on:cardClick="handCardClick"
            v-if="index<numbers.length-1"
            :data="numbers[index]"
          ></me-card>
        </el-col>
        <el-col :span="6">
          <me-card
            v-on:cardClick="handCardClick"
            v-if="index<numbers.length-1"
            :data="numbers[index+1]"
          ></me-card>
        </el-col>
        <el-col :span="6">
          <me-card
            v-on:cardClick="handCardClick"
            v-if="index<numbers.length-1"
            :data="numbers[index+2]"
          ></me-card>
        </el-col>
        <el-col :span="6">
          <me-card
            v-on:cardClick="handCardClick"
            v-if="index<numbers.length-1"
            :data="numbers[index+3]"
          ></me-card>
        </el-col>
      </el-row>
    </template>
    <hr class="split" >
    <el-row style="margin-top: 8px;margin-left: 10px;">
      <el-form :model="formData" :inline="true" label-suffix=":">
        <el-form-item label="开始时间" class="boldLabel">
          <el-date-picker
            
            v-model="formData.startDay"
            type="date"
            placeholder="选择日期"
            style="width:150px"
          ></el-date-picker>
        </el-form-item>
        <el-form-item label="结束时间" class="boldLabel">
          <el-date-picker
            
            v-model="formData.endDay"
            type="date"
            placeholder="选择日期"
            style="width:150px"
          ></el-date-picker>
        </el-form-item>
        <el-form-item label="主题" class="boldLabel">
          <el-input  v-model="formData.topic" style="width:120px"></el-input>
        </el-form-item>
        <el-form-item label="关键字" class="boldLabel">
          <el-input  v-model="formData.keywords" style="width:120px"></el-input>
        </el-form-item>
        <el-form-item label>
          <div style="width:50px"></div>
        </el-form-item>
        <el-form-item>
          <el-button icon="el-icon-search"  type="primary" @click="handleQuery()">查询</el-button>
        </el-form-item>
        <el-form-item>
          <el-button icon="el-icon-circle-plus-outline"  type="primary" @click="handleAdd()">新增</el-button>
        </el-form-item>
      </el-form>
    </el-row>
    <el-row>
      <el-table :data="tableData" tooltip-effect="dark" style="width: 100%">
        <el-table-column label="序号" width="50" prop="sn"></el-table-column>
        <el-table-column prop="name" label="主题名称"></el-table-column>
        <el-table-column prop="type" label="发布类型" width="110"></el-table-column>
        <el-table-column prop="location" label="发布位置" width="180"></el-table-column>
        <el-table-column prop="top" label="是否置顶" width="100"></el-table-column>
        <el-table-column prop="author" label="作者" width="80"></el-table-column>
        <el-table-column prop="time" label="发布时间" width="140"></el-table-column>
        <el-table-column prop="state" label="状态" width="80"></el-table-column>
        <el-table-column width="130">
          <template slot-scope="scope">
            <el-button @click="handleClick(scope.row,'new')" type="text" >发布</el-button>
            <el-button @click="handleClick(scope.row,'update')" type="text" >修改</el-button>
            <el-button @click="handleClick(scope.row,'delete')" type="text" >删除</el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-row>
    <el-row type="flex" justify="end">
      <el-pagination
        background
        layout="prev, pager, next"
        :page-size="5"
        :total="20"
        @current-change="paginChange"
      ></el-pagination>
    </el-row>

    <el-dialog title="消息" :visible.sync="dialogVisible" @open="handleDialogOpen" width="30%">
      <el-row class="messageRow">
        <span>&emsp;&emsp;{{this.reciveMeesage}}</span>
      </el-row>
      <el-row style="margin-bottom: 20px;">
        <el-col :span="20">
          <el-input  clearable v-model="sendMessage" placeholder="请输入内容"></el-input>
        </el-col>
        <el-col :span="4">
          <el-button  type="primary" style="border-radius: 0px;">发送</el-button>
        </el-col>
      </el-row>
    </el-dialog>
  </div>
</template>

<script>
import MeCard from "@/components/dashbord/MeCard";
export default {
  name: "Bbs",
  components: { MeCard },
  data() {
    return {
      dialogVisible: false,
      reciveMeesage: "",
      sendMessage: "",
      formData: {
        startDay: null,
        endDay: null,
        topic: "",
        keywords: ""
      },
      tableData: [
        {
          sn: 1,
          name: "区长张晓东现场指导内容摘要",
          type: "通知公告",
          location: "外网、微信公众号",
          top: "置顶",
          author: "李薇",
          time: "2019-03-12 18:00",
          state: "已发布"
        },
        {
          sn: 2,
          name: "区长张晓东现场指导内容摘要",
          type: "通知公告",
          location: "外网、微信公众号",
          top: "置顶",
          author: "李薇",
          time: "2019-03-12 18:00",
          state: "已发布"
        },
        {
          sn: 3,
          name: "区长张晓东现场指导内容摘要",
          type: "通知公告",
          location: "外网、微信公众号",
          top: "置顶",
          author: "李薇",
          time: "2019-03-12 18:00",
          state: "已发布"
        },
        {
          sn: 4,
          name: "区长张晓东现场指导内容摘要",
          type: "通知公告",
          location: "外网、微信公众号",
          top: "置顶",
          author: "李薇",
          time: "2019-03-12 18:00",
          state: "已发布"
        },
        {
          sn: 5,
          name: "区长张晓东现场指导内容摘要",
          type: "通知公告",
          location: "外网、微信公众号",
          top: "置顶",
          author: "李薇",
          time: "2019-03-12 18:00",
          state: "已发布"
        }
      ],
      numbers: [
        {
          id: 1,
          name: "李 东",
          dept: "设计部",
          position: "设计师",
          picture: "pictures/user1-128x128.jpg",
          action1: 0,
          action2: 0,
          action3: 1,
          man: true
        },
        {
          id: 2,
          name: "赵 杨",
          dept: "项目部",
          position: "监理员",
          picture: "pictures/user2-128x128.jpg",
          action1: 0,
          action2: 0,
          action3: 0,
          man: true
        },
        {
          id: 3,
          name: "毛 晶晶",
          dept: "项目部",
          position: "建造师",
          picture: "pictures/user3-128x128.jpg",
          action1: 0,
          action2: 0,
          action3: 0,
          man: false
        },
        {
          id: 4,
          name: "王 洪伟",
          dept: "安全部",
          position: "安全员",
          picture: "pictures/user4-128x128.jpg",
          action1: 2,
          action2: 1,
          action3: 0,
          man: true
        }
      ]
    };
  },
  methods: {
    handCardClick(arg) {
      let action = arg.action;
      let id = arg.id;

      if (action == "danger") {
        this.reciveMeesage = "控制室3#楼梯扶手损坏";
      }
      if (action == "message") {
        this.reciveMeesage = "今天下午15:30在302会议室召开周会，请准时参加";
      }
      if (action == "design") {
        this.reciveMeesage = "外墙饰面完成第二版修改";
      }
      this.dialogVisible = true;
    },
    handleQuery() {
      this.$alert("正在开发中", "提示", {
        confirmButtonText: "确定",
        type: "info"
      });
    },
    handleAdd() {
      this.$alert("正在开发中", "提示", {
        confirmButtonText: "确定",
        type: "info"
      });
    },
    handleClick(row, action) {
      this.$alert("正在开发中", "提示", {
        confirmButtonText: "确定",
        type: "info",
        callback: action => {
          console.info(action);
        }
      });
    },
    paginChange(curPage) {
      console.info("当前分页:" + curPage);
    },
    handleDialogOpen() {
      //alert('ss');
    }
  },
  created() {},
  mounted() {},
  beforeDestroy() {}
};
</script>

<style scoped>
.boldLabel {
  font-weight: 700;
}
.split {
  background: #f8f8f8;
  border: none;
  height: 3px;
}
.messageRow {
  padding: 8px;
  color: #fff;
  background: #3c8dbc;
  margin-bottom: 20px;
  border-radius: 5px;
}
</style>
</style>
