<template>
  <div class="rootDiv">
    <el-row :gutter="8" style="height:340px;width:100%">
      <el-col :span="12" style="height:100%">
        <el-card class="box-card">
          <div slot="header" class="clearfix">
            <span>
              <i class="el-icon-tickets" style="font-size:20px"/> 项目介绍
            </span>
          </div>
         <el-row type="flex" class="row-bg" justify="center">
           
          <project-card/>
          
         </el-row>
        </el-card>
      </el-col>

      <el-col :span="12" style="height:100%">
        <div style="height:100%">
          <el-card class="box-card">
            <div slot="header" class="clearfix">
              <span>
                <i class="el-icon-user" style="font-size:20px"/> 项目成员
              </span>
            </div>
            <el-row :gutter="5" type="flex" justify="center">
              <el-col :span="12">
                <person-card :person="one"></person-card>
              </el-col>
              <el-col :span="12" >
                <person-card :person="two"></person-card>
              </el-col>
            </el-row>
            <el-row :gutter="5" type="flex" justify="center" style="margin-top:20px">
              <el-col :span="12">
                <person-card :person="three"></person-card>
              </el-col>
              <el-col :span="12" >
                <person-card :person="four"></person-card>
              </el-col>
            </el-row>
          </el-card>
        </div>
      </el-col>
    </el-row>
    <!--第二行-->
    <el-row :gutter="8" style="height:330px;width:100%;margin-top:8px">
      <el-col :span="12" style="height:100%">
        <el-card class="box-card">
          <div slot="header" class="clearfix">
            <span>
              <i class="el-icon-folder-add" style="font-size:20px"/> 数据统计
            </span>
          </div>
          <sum-card/>
        </el-card>
      </el-col>
      <el-col :span="12" style="height:100%">
          <el-card class="box-card">
          <div slot="header" class="clearfix">
            <span>
              <i class="el-icon-s-operation" style="font-size:20px"/> 项目动态
            </span>
            <el-button style="float: right; padding: 3px 0" type="text">新增动态</el-button>
          </div>
          
          <!--timeline-->
             <el-timeline>
              <el-timeline-item timestamp="2018/12/15 08:20:00" placement="top" color="#0079d7">
                <div class="timeline-text">机电安装</div>
              </el-timeline-item>
              <el-timeline-item timestamp="2018/02/15 12:00:00" placement="top" color="#0079d7">
                <div class="timeline-text">土建部分施工</div>
              </el-timeline-item>
              <el-timeline-item timestamp="2017/12/18 08:00:00" placement="top" color="#0079d7">
                <div class="timeline-text">机械进场</div>
              </el-timeline-item>
              <el-timeline-item timestamp="2017/12/17 08:00:00" placement="top" color="#0079d7">
                <div class="timeline-text">人员进场</div>
              </el-timeline-item>
            </el-timeline>
          <!---->
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<script>
import PersonCard from "@/components/dashbord/PersonCard";
import ProjectCard from "@/components/dashbord/ProjectCard";
import SumCard from "@/components/dashbord/SumCard";
export default {
  name: "Dashbord",
  components: { PersonCard,ProjectCard,SumCard},
  //component: PersonCard,
  data() {
    return {
      one: {
        name: "赵 杨",
        mobile: 13951705671,
        email: "zhaoyang@163.com",
        dept: "项目管理部"
      },
      two: {
        name: "李 东",
        mobile: 13897703233,
        email: "lidong@163.com",
        dept: "项目管理部"
      },
      three: {
        name: "张 磊",
        mobile: 13951705671,
        email: "zhanglei@163.com",
        dept: "安全质量部"
      },
      four: {
        name: "王洪伟",
        mobile: 13951705671,
        email: "zhaoyang@163.com",
        dept: "项目管理部"
      }
    };
  },

  methods: {
    loadView() {}
  },
  mounted() {
    
  }
};
</script>

<style scoped>


.box-card {
  margin: 3px;
  width: 100%;
  height: 100%;
  background: #ecf0f5;
}

.text {
  font-size: 14px;
}

.item {
  margin-bottom: 6px;
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
.timeline-text{
  /* position: relative; */
  font-size: 14px;
   padding-left: 250px;
}
.timeline-btn{
  position: absolute; 
  right: 10px;
  bottom: 200px;
}
</style>
