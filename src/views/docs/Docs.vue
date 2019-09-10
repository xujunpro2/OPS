<template>
  <div class="rootDiv">
     <el-tabs v-model="activeTab">
        <el-tab-pane label="管理资料" name="doc1">
          <el-button-group>
            <el-button type="primary">施工资料<i class="el-icon-share el-icon--right"></i></el-button>
            <el-button type="primary">质量管理资料<i class="el-icon-sort el-icon--right"></i></el-button>
            <el-button type="primary">监理资料<i class="el-icon-document el-icon--right"></i></el-button>
            <el-button type="primary">巡检资料<i class="el-icon-goods el-icon--right"></i></el-button>
            <el-button type="primary">危险品管理资料<i class="el-icon-bell el-icon--right"></i></el-button>
          </el-button-group>
        </el-tab-pane>
        <el-tab-pane label="建筑资料" name="flow">
          <el-button-group>
            <el-button type="primary">设计图资料<i class="el-icon-picture el-icon--right"></i></el-button>
            <el-button type="primary">砂浆资料<i class="el-icon-rank el-icon--right"></i></el-button>
            <el-button type="primary">供应商资料<i class="el-icon-refresh el-icon--right"></i></el-button>
          </el-button-group>
        </el-tab-pane>
      </el-tabs>

      <el-table
        ref="multipleTable"
        :data="tableData"
        tooltip-effect="dark"
        style="width: 100%"
        @selection-change="handleSelectionChange">
        <el-table-column
          type="selection"
          width="55">
        </el-table-column>
        <el-table-column
          label="序号"
          width="50"
          prop="sn">
        </el-table-column>
        <el-table-column
          prop="name"
          label="资料名称"
          width="320">
        </el-table-column>
        <el-table-column
          prop="part"
          label="适用范围">
        </el-table-column>
        <el-table-column
          prop="user"
          label="上传人"
          width="80">
        </el-table-column>
         <el-table-column
          prop="time"
          label="更新时间"
          width="120">
        </el-table-column>
        <el-table-column width="120">
          <template slot-scope="scope">
            <el-button @click="handleClick(scope.row,'download')" type="text" >下载</el-button>
            <el-button @click="handleClick(scope.row,'delete')" type="text" >删除</el-button>
          </template>
        </el-table-column>
      </el-table>
      <el-row type="flex" justify="end">
        <el-pagination
        background
        layout="prev, pager, next"
        :page-size="9"
        :total="36"
        @current-change="paginChange">
        </el-pagination>
      </el-row>
      

  </div>
</template>

<script>
export default {
  name: "Docs",
  data() {
    return {
       activeTab: "doc1",
        tableData: [{
          sn: 1,
          name: "水性(溶剂性)涂料涂拭施工工艺标准",
          part: '楼板、墙壁、门、窗、坡道、栏杆扶手、楼梯、场地、结构框架、结构柱',
          user:"张三",
          time:"2018/12/01"
        },
        {
          sn: 2,
          name: "混凝土施工工艺标准",
          part: '结构框架、结构柱',
          user:"张三",
          time:"2018/12/01"
        },
        {
          sn: 3,
          name: "保温层施工工艺标准",
          part: '结构框架、结构柱',
          user:"张三",
          time:"2018/12/01"
        },
        {
          sn: 4,
          name: "脚手架搭建和安全网施工工艺标准",
          part: '结构框架、结构柱',
          user:"张三",
          time:"2018/12/01"
        },
        {
          sn: 5,
          name: "混凝土施工工艺标准",
          part: '结构框架、结构柱',
          user:"张三",
          time:"2018/12/01"
        },
        {
          sn: 6,
          name: "混凝土施工工艺标准",
          part: '结构框架、结构柱',
          user:"张三",
          time:"2018/12/01"
        },
        {
          sn: 7,
          name: "混凝土施工工艺标准",
          part: '结构框架、结构柱',
          user:"张三",
          time:"2018/12/01"
        },
        {
          sn: 8,
          name: "混凝土施工工艺标准",
          part: '结构框架、结构柱',
          user:"张三",
          time:"2018/12/01"
        },
        {
          sn: 9,
          name: "混凝土施工工艺标准",
          part: '结构框架、结构柱',
          user:"张三",
          time:"2018/12/01"
        }]
    };
  },
  methods: {
    handleClick(row,cmd) {
      alert(cmd);
    },
    paginChange(curPage){
      console.info("当前分页:"+curPage);
    },
    handleSelectionChange(){
      
    }
  },
  mounted() {
  },
  beforeDestroy() {

  }
};
</script>

<style scoped>


</style>
