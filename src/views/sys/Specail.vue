<template>
    <div class="rootDiv">
        <el-form ref="form" :model="specailForm" :rules="specailRules" :hide-required-asterisk="true"  label-width="80px" size="small" >
            <el-row style="margin-top:10px">
                <el-col :span="6">
                    <el-form-item label="表格分页" prop="pageSize" >
                        <el-input v-model.number="specailForm.pageSize"></el-input>
                    </el-form-item>
                </el-col>

                <el-col :span="6">
                    
                </el-col>
            </el-row>
            <el-row type="flex" justify="end" style="margin:20px 10px">
                <el-button size="small" type="primary" @click="onSave()">保存
                </el-button>
            </el-row>
            
        </el-form>

    </div>
</template>

<script>
export default {
  name: "Specail",
  data() {
    return {
        specailForm: {
            pageSize: Number(this.$store.state.uv.specail.pageSize)
        },
        specailRules:{
            pageSize:[
                { required: true, message: '分页不能为空'},
                { type: 'number', message: '分页必须为数字值'}
            ]
        }
    }
  },
  methods: {
      onSave(){
          this.$refs.form.validate((valid) => {
              if(valid)
              {
                    this.$store.dispatch("uv/setUserSpecail",this.specailForm).then(()=>{
                    this.$notify({
                        title: '消息',
                        message: '用户个性化设置修改成功',
                        type: 'success',
                        duration:3000
                    });
                    //清除验证痕迹
                    this.$refs.form.clearValidate();
                  });
              }
          });
      }
  },
  mounted() {},
  beforeDestroy() {}
};
</script>

<style scoped>

</style>
