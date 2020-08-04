<template>
  <el-row :gutter="40" class="panel-group" style="margin-left:0px;margin-right:0px;">
    <el-col :xs="12" :sm="12" :lg="6" class="card-panel-col">
      <div class="card-panel" @click="handClick('complete')">
        <div class="card-panel-icon-wrapper icon-complete">
          <svg-icon icon-class="inspect_complete" class-name="card-panel-icon" />
        </div>
        <div class="card-panel-description">
          <div class="card-panel-text">
            本月已完成巡检任务
          </div>
          <count-to :start-val="0" :end-val="labeCardValues.complete" :duration="1500" class="card-panel-num" />次
        </div>
      </div>
    </el-col>
  
    <el-col :xs="12" :sm="12" :lg="6" class="card-panel-col">
      <div class="card-panel" @click="handClick('doing')">
        <div class="card-panel-icon-wrapper icon-doing">
          <svg-icon icon-class="inspect_doing" class-name="card-panel-icon" />
        </div>
        <div class="card-panel-description">
          <div class="card-panel-text">
            本月进行中巡检任务
          </div>
          <count-to :start-val="0" :end-val="labeCardValues.doing" :duration="1500" class="card-panel-num" />次
        </div>
      </div>
    </el-col>

    <el-col :xs="12" :sm="12" :lg="6" class="card-panel-col">
      <div class="card-panel" @click="handClick('timeout')">
        <div class="card-panel-icon-wrapper icon-timeout">
          <svg-icon icon-class="inspect_timeout" class-name="card-panel-icon" />
        </div>
        <div class="card-panel-description">
          <div class="card-panel-text">
            本月接单逾期
          </div>
          <count-to :start-val="0" :end-val="labeCardValues.timeout" :duration="1500" class="card-panel-num" />次
        </div>
      </div>
    </el-col>
    <el-col :xs="12" :sm="12" :lg="6" class="card-panel-col">
      <div class="card-panel" @click="handClick('exception')">
        <div class="card-panel-icon-wrapper icon-exception">
          <svg-icon icon-class="inspect_exception" class-name="card-panel-icon" />
        </div>
        <div class="card-panel-description">
          <div class="card-panel-text">
            本月发现异常
          </div>
          <count-to :start-val="0" :end-val="labeCardValues.exception" :duration="1500" class="card-panel-num" />次
        </div>
      </div>
    </el-col>

  </el-row>
</template>

<script>
import CountTo from 'vue-count-to'

export default {
    components: {CountTo},
    data() {
		return {
            labeCardValues:{
                complete:0,
                doing:0,
                timeout:0,
                exception:0
            }
        };
	},
    methods: {
        handClick(type) {
            this.$emit('handClick', type)
        },

        setLabCardValues(){
            this.$store.dispatch('insp/labCardValues').then(data=>{
                //console.info(data);
                this.labeCardValues.complete = data.complete;
                this.labeCardValues.doing = data.doing;
                this.labeCardValues.timeout = data.timeout;
                this.labeCardValues.exception = data.exception;
            })
        },
    },
    mounted() {
        this.setLabCardValues();
    },
	beforeDestroy() {}
}
</script>

<style lang="scss" scoped>
.panel-group {
    min-width: 200px;
    margin-top: 5px;
    
    .card-panel-col {
        margin-bottom: 5px;
    }

  .card-panel {
    height: 108px;
    cursor: pointer;
    font-size: 12px;
    position: relative;
    overflow: hidden;
    color: #666;
    background: #fff;
    box-shadow: 4px 4px 40px rgba(0, 0, 0, .05);
    border-color: rgba(0, 0, 0, .05);

    &:hover {
      .card-panel-icon-wrapper {
        color: #fff;
      }

      .icon-complete {
        background: #34bfa3;
      }

      .icon-timeout {
        background: #E6A23C;
      }

      .icon-doing {
        background: #36a3f7;
      }

      .icon-exception {
        background: #D20000;
      }
    }

    .icon-complete {
      color: #34bfa3;
    }

    .icon-timeout {
      color: #E6A23C;
    }

    .icon-doing {
      color: #36a3f7;
    }

    .icon-exception {
      color: #D20000;
    }

    .card-panel-icon-wrapper {
      float: left;
      margin: 14px 0 0 14px;
      padding: 16px;
      transition: all 0.38s ease-out;
      border-radius: 6px;
    }

    .card-panel-icon {
      float: left;
      font-size: 48px;
    }

    .card-panel-description {
      float: right;
      font-weight: bold;
      margin: 26px;
      margin-left: 0px;

      .card-panel-text {
        line-height: 18px;
        color: rgba(0, 0, 0, 0.45);
        font-size: 16px;
        margin-bottom: 12px;
      }

      .card-panel-num {
        font-size: 20px;
      }
    }
  }
}

@media (max-width:150px) {
  .card-panel-description {
    display: none;
  }

  .card-panel-icon-wrapper {
    float: none !important;
    width: 100%;
    height: 100%;
    margin: 0 !important;

    .svg-icon {
      display: block;
      margin: 14px auto !important;
      float: none !important;
    }
  }
}
</style>
