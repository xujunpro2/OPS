<template>
  <div class="rootDiv">
    <el-table :data="tableData" tooltip-effect="dark" style="width: 100%">
      <el-table-column prop="ruleName" label="角色"></el-table-column>
      <el-table-column prop="ruleId" label="操作" width="230">
        <template slot-scope="scope">
          <el-button @click="onUpdateRule(scope.row)" type="text" size="small">修改</el-button>
          <el-button @click="onDeleteRule(scope.row)" type="text" size="small"><span  id="deleteButton">删除</span></el-button>
        </template>
      </el-table-column>
    </el-table>
    <el-row type="flex" justify="end" style="margin:20px 5px">
      <el-button
        icon="el-icon-circle-plus-outline"
        size="small"
        type="primary"
        @click="onAddRule()"
      >添加</el-button>
    </el-row>

    <el-dialog title="角色编辑" :visible.sync="dialogVisible" @opened="onRuleDialogOpened" @closed="onRuleDialogClosed" width="30%" :close-on-click-modal="false">
      <el-row>
        <div>
          <el-input placeholder="请输入内容" v-model="ruleName">
            <template slot="prepend">角色名称</template>
          </el-input>
        </div>
      </el-row>
      <el-row style="margin-top:10px">
        <!--要让tree有纵向滚动条就要包到bimTree的div中-->
        <div id="bimTree" style="height: 300px;">
          <el-tree ref="menuTree" :data="menus" show-checkbox node-key="path" :check-on-click-node="true"
              :expand-on-click-node="false" :props="menusProps"></el-tree>
        </div>
      </el-row>
      <span slot="footer" class="dialog-footer">
          <el-button size="small" @click="dialogVisible = false">取 消</el-button>
          <el-button size="small" type="primary" @click="onSubmit">确 定</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
export default {
  name: "Rule",
  data() {
    return {
        curDataRow:null,
        ruleName: "",
        dialogVisible: false,
        tableData: [],
        menus: [],
        menusProps: {
            children: "children",
            label: "title"
        }
    };
  },
  methods: {
    setTableData(){
        this.$store.dispatch("uv/getRules").then(data => {
            this.tableData = data;
        });
    },
    onAddRule() {
        this.curDataRow = null;
        this.dialogVisible = true;
    },
    onUpdateRule(row) {
        this.curDataRow = row;
        this.dialogVisible = true;
    },
    onDeleteRule(row) {
        //不能删除当前用户的角色
        let myRule = this.$store.state.uv.rule;
        if(myRule.ruleId === row.ruleId)
        {
            this.$alert('不能删除当前用户自己的角色', '错误', {
                confirmButtonText: '确定',
                type:"error"
            });
            return;
        }
        this.$confirm("确定删除角色吗?", "提示", {
            confirmButtonText: '确定',
            cancelButtonText: '取消',
            type: 'warning'
        }).then(()=>{
            let ruleId = row.ruleId;
            this.$store.dispatch("uv/deleteRule",ruleId).then(data=>{
                this.setTableData();
                this.$notify({
                    title: '消息',
                    message: '删除成功',
                    type: 'success',
                    duration:3000
                });
            });
        });
    },
    onSubmit() {
        if(this.ruleName.trim() === "")
        {
            this.$alert("角色名称不能为空", "错误", {
                type: "error"
            });
            return;
        }
        this.dialogVisible = false;
        //获得当前对话框中设置的角色名称和角色菜单配置json
        let routesJson = this.getRoutesJson();
        //修改
        if(this.curDataRow)
        { 
            let ruleInfo = {ruleId:this.curDataRow.ruleId,ruleName:this.ruleName,routes:routesJson};
            this.$store.dispatch("uv/setRule",ruleInfo).then(data=>{
                this.setTableData();
                //如果修改的角色和当前登陆用户角色一致，那么刷新路由，重新生成菜单
                let myRule = this.$store.state.uv.rule;
                if(myRule.ruleId === this.curDataRow.ruleId)
                {
                    this.$store.dispatch('uv/refreshRouter');
                }
                this.$notify({
                    title: '消息',
                    message: '角色信息修改成功',
                    type: 'success',
                    duration:3000
                });
            });
        }
        //新增
        else
        {
            let ruleInfo = {ruleName:this.ruleName,routes:routesJson};
            this.$store.dispatch("uv/addRule",ruleInfo).then(data=>{
                this.setTableData();
                this.$notify({
                    title: '消息',
                    message: '角色添加成功',
                    type: 'success',
                    duration:3000
                });
            })
        }
    },
    onRuleDialogClosed(){
        this.$refs.menuTree.setCheckedKeys([]);
        this.ruleName = "";
    },
    onRuleDialogOpened() {
        if (this.curDataRow) 
        {
            let checkPaths = [];
            this.ruleName = this.curDataRow.ruleName;
            //根据当前角色的routes设置默认选择
            let routesJson = this.curDataRow.routes;
            if (routesJson && routesJson !== "") 
            {
                let routes = JSON.parse(routesJson);
                routes.forEach(element => {
                    if (element.children) 
                    {
                        element.children.forEach(child => {
                            checkPaths.push(child);
                        });
                    } 
                    else 
                    {
                            checkPaths.push(element.path);
                    }
                });
                //default-checked-keys只在第一次初始化tree起作用，所以要每次都设置一下，注意要第一次要在opened事件，tree才定义好
                this.$refs.menuTree.setCheckedKeys(checkPaths);
            }
        }
    },
    //获得设置的菜单配置json
    getRoutesJson() {
        let datas = [];
        //参数设置为true,表示只要叶节点
        let keys = this.$refs.menuTree.getCheckedKeys(true);
        keys.forEach(key => {
            let route = null;
            //先找一级菜单
            this.menus.forEach(menu => {
                if (menu.path === key) 
                {
                    route = new Object();
                    route.path = key;
                    datas.push(route);
                    return false;
                } 
                else if (menu.children) 
                {
                    menu.children.forEach(child => {
                        if (child.path === key) 
                        {
                            //首先要去datas中查询是否已经包含该一级菜单对象了
                            datas.forEach(item => {
                                if (item.path === menu.path) {
                                    route = item;
                                    return false;
                                }
                            });
                            //前面有这样的一级菜单了
                            if (route) 
                            {
                                route.children.push(key);
                                return false;
                            }
                            //第一次push，要创建一级菜单对象
                            else 
                            {
                                route = new Object();
                                route.path = menu.path;
                                route.children = [key];
                                datas.push(route);
                                return false;
                            }
                        }
                    });
                } //end 二级菜单查找
            }); //end 当前菜单遍历比对 
        }); //end keys遍历
        let routesJsonStr = JSON.stringify(datas);
        return routesJsonStr;
    }
  },
  mounted() {
    this.setTableData();
    this.$store.dispatch("uv/getMenus").then(data => {
        this.menus = data;
    });
  },
  beforeDestroy() {}
};
</script>

<style scoped>

</style>
