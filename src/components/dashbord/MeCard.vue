<template>
   <div class="meCard">
      <div class="box box-widget widget-user">
        <div class="widget-user-header" v-bind:class=" this.data.man?'bg-aqua-active1': 'bg-aqua-active2' ">
          <h3 class="widget-user-username">{{this.data.name}}</h3>
          <h5 class="widget-user-desc">{{this.data.dept}}  {{this.data.positoin}}</h5>
        </div>
        <div class="widget-user-image">
          <img class="img-circle" :src="this.data.picture" alt="User Avatar">
        </div>
        <div class="box-footer"/>
        <div>
            <div class="col-sm-4">
              <div class="description-block">
                <el-badge :value="this.data.action1" :hidden="this.data.action1 == 0?true:false">
                  <el-button @click="handlerClick('danger')" title="安全隐患" :type="this.data.action1 > 0?'primary':''" icon="el-icon-view" circle></el-button>
                </el-badge>
              </div>
            </div>
            <div class="col-sm-4">
              <div class="description-block">
                <el-badge :value="this.data.action2"  :hidden="this.data.action2 == 0?true:false">
                  <el-button @click="handlerClick('message')" title="消息" :type="this.data.action2 > 0?'primary':''" icon="el-icon-message" circle></el-button>
                </el-badge>
              </div>
            </div>
            <div class="col-sm-4">
               <div class="description-block">
                <el-badge :value="this.data.action3" :hidden="this.data.action3 == 0?true:false">
                  <el-button @click="handlerClick('design')" title="设计改动" :type="this.data.action3 > 0?'primary':''" icon="el-icon-edit" circle></el-button>
                </el-badge>
              </div>
            </div>
          </div> 

        </div>
    </div>
</template>

<script>
export default {
  name: "",
  props: {
      data: {
        type: Object,
        default() {
          //默认数据，没有数剧的情况下启用
          return {
            id:-1,
            name: "X X",
            dept: "",
            position:"",
            picture: "",
            action1:0,
            action2:0,
            action3:0,
            man:true
          };
        }
      }
  },
  data() {
    return {
      //id:this.data.id
    };
  },
  methods: {
    handlerClick(action){
      //alert(action);
      this.$emit('cardClick', {action:action,id:this.data.id})
    }
  },

  mounted() {

  }
};
</script>

<style scoped>

.meCard {
  padding: 2px 2px 2px 2px;
}
.box {
    border-radius: 3px;
    background: #ffffff;
    width: 100%;
    box-shadow: 0 1px 1px rgba(0, 0, 0, 0.1);
}
.box-widget {
    border: none;
    position: relative;
}
.widget-user .widget-user-header {
  color: #fff !important;
    padding: 20px;
    height: 90px;
    border-top-right-radius: 3px;
    border-top-left-radius: 3px;
   
}
.bg-aqua-active1 {
    background-color: #00a7d0 !important;
}
.bg-aqua-active2 {
    background-color: #f39c12 !important;
}
.widget-user .widget-user-username {
    margin-top: 0;
    margin-bottom: 5px;
    font-size: 20px;
    font-weight: 300;
    text-shadow: 0 1px 1px rgba(0, 0, 0, 0.2);
}
.widget-user .widget-user-desc {
    margin-top: 0;
    font-size: 14px;
    font-weight: 100;
}
.widget-user .widget-user-image {
    position: absolute;
    top: 65px;
    left: 50%;
    margin-left: -45px;
}
.img-circle {
    border-radius: 50%;
    border: 3px solid #fff;
}
img {
    vertical-align: middle;
    width: 90px;
    height: 90px;
}
.widget-user .box-footer {
    padding-top: 30px;
}
.box-footer {
    border-top: 1px solid #f4f4f4;
}

.col-sm-4 {
   background: #ffffff;
  float:left;
    width: 33.33333333%;
}
.description-block {
    display: block;
    margin-top: 10px;
    margin-bottom: 10px;
    text-align: center;
}
</style>
