<template>
  <div class="personDiv">
    <div class="person-name">{{this.person.name}}</div>
    <div class="person-info">
      <span>手机 :</span>
      {{this.person.mobile}}
    </div>
    <div class="person-info">
      <span>邮箱 :</span>
      {{this.person.email}}
    </div>
    <div class="person-info">
      <span>部门 :</span>
      {{this.person.dept}}
    </div>
  </div>
</template>

<script>
export default {
  name: "",
  props: {
    person: {
      type: Object,
      default() {
        //默认数据，没有数剧的情况下启用
        return {
          name: "X X",
          mobile: 13951705671,
          email: "XXXXXXX@163.com",
          dept: "XXXX部"
        };
      }
    }
  },
  data() {
    return {};
  },
  methods: {
    loadView() {}
  },

  mounted() {
    this.loadView();
  }
};
</script>

<style scoped>
.personDiv {
  background: #f2f5f8;
  padding: 5px;
  border-radius: 5px;
  border: #d8dedb solid 1px;
}
.personDiv .person-name {
  font-size: 14px;
  margin-bottom: 6px;
}
.personDiv .person-info {
  margin-bottom: 6px;
  margin-left: 40px;
  font-size: 12px;
}
.personDiv .person-info span {
  color: #ccc;
}
</style>
