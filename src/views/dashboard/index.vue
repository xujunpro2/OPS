<template>
  <div class="rootDiv">
    <el-row >
      <el-col :span="24" style="padding:10px">
        <sum-card/>
      </el-col>
    </el-row>
  </div>
</template>

<script>
import SumCard from "@/components/dashbord/SumCard";
export default {
  name: "Dashbord",
  components: {SumCard},
  //component: PersonCard,
  data() {
    return {
     
    };
  },

  methods: {
    
  },
  mounted() {
    
  }
};
</script>

<style scoped>

</style>
