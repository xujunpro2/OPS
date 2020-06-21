<template>
    <el-dialog title="选择设备" :visible.sync="dialogVisible" @open="onDialogOpen"  width="1100px" :close-on-click-modal="false" :append-to-body="inner">
        <el-form :inline="true" ref="queryForm" :model="queryForm" label-width="80px">
            <el-form-item label="区域划分">
                <el-select v-model="queryForm.spaceId" filterable placeholder="请选择" style="width:150px">
                    <el-option v-for="item in querySpaceOptions" :key="item.spaceId" :label="item.spaceName"
                        :value="item.spaceId"></el-option>
                </el-select>
            </el-form-item>
            <el-form-item label="设备类型">
                <el-select v-model="queryForm.devType" filterable placeholder="请选择" style="width:150px">
                    <el-option v-for="item in queryTypeOptins" :key="item.devTypeId" :label="item.devTypeName"
                        :value="item.devTypeId"></el-option>
                </el-select>
            </el-form-item>
            <el-form-item label="设备编号">
                <el-input v-model="queryForm.devCode" placeholder="支持模糊查询" clearable style="width:150px"></el-input>
            </el-form-item>
            <el-form-item label="设备名称">
                <el-input v-model="queryForm.devName" placeholder="支持模糊查询" clearable style="width:150px"></el-input>
            </el-form-item>
            <el-form-item>
                <el-button type="primary" @click="onQuery" icon="el-icon-search">查询</el-button>
            </el-form-item>
        </el-form>

        <el-table ref="table" highlight-current-row @row-click="onRowClick" height="300"
            v-loading="loading" :data="tableData" style="width: 100%;">
            <el-table-column prop="devCode" label="编码"></el-table-column>
            <el-table-column prop="devName" label="名称"></el-table-column>
            <el-table-column prop="devTypeName" label="类型"></el-table-column>
            <el-table-column prop="spaceName" label="所属区域"></el-table-column>
        </el-table>

        <el-row type="flex" justify="end" style="background:#fff">
            <el-pagination ref="pagination" background layout="total, prev, pager, next" :page-size="pageSize" :total="total"
                @current-change="paginChange"></el-pagination>
        </el-row>
        <span v-for="tag in this.selectedDevs">
            <el-tag  :key="tag.devId" closable @close="onTagClose(tag)">
                {{tag.devCode+" "+ tag.devName}}
            </el-tag>
            &nbsp;
        </span>

        <span slot="footer" class="dialog-footer">
            <el-button  @click="dialogVisible = false">取 消</el-button>
            <el-button  type="primary" @click="onSubmit">确 定</el-button>
        </span>
    </el-dialog>
</template>

<script>
export default {
	name: "SelectDevDialog",
	data() {
		return {
            queryForm:{
                spaceId:null,
                devCode:null,
                devType:null,
                devName:null,
            },
            querySpaceOptions:[],//设备区域选择
            queryTypeOptins:[],//设备类型选择

            loading: false,
			tableData: [],
			total: 0,
            pageSize: 10, //设备分页固定50条一页

            selectedDevs:[],//当前选中的所有设备，因为数组直接索引操作，不能触发watch和compute，所以直接通过method触发

            dialogVisible:false,
        };
    },
    props: {
        inner:{
            type:Boolean,
            default:false,
        }
    },
	methods: {
        onSubmit(){
            this.dialogVisible = false;
            //拷贝一份
            let devs = [];
            this.selectedDevs.forEach(item=>{
                devs.push({
                    devId:item.devId,
                    devCode:item.devCode,
                    devName:item.devName
                })
            })
            this.$emit('selected',devs);
        },
        onDialogOpen(){
            this.selectedDevs.splice(0,this.selectedDevs.length);
        },
        //Tag控件close的时候
        onTagClose(tag){
            //刷新this.selectedDevs
            this.selectedDevs.splice(this.selectedDevs.indexOf(tag),1);
        },
        // row click
        onRowClick(row, column){
            //如果this.selectedDevs没有包含该设备，就add
            let contain = false;
            this.selectedDevs.forEach(item=>{
                if(item.devId == row.devId)
                {
                    contain = true;
                }
            })
            if(!contain)
            {
                this.selectedDevs.push({
                    devId:row.devId,
                    devName:row.devName,
                    devCode:row.devCode
                })
            }
        },
        //加入查询条件
        onQuery(){
            this.initDevTabel();
        },
		//初始化Dev表格
		initDevTabel() {
            if(this.$refs.table)
            {
                this.$refs.table.setCurrentRow(null);
            }
            this.$store.dispatch("dev/getDevCount",this.queryForm)
				.then(data => {
					this.total = data;
					this.tabelPagin(1);
				})
		},
		//分页事件
		paginChange(curPage) {
			this.tabelPagin(curPage);
		},
		//设备分页查询
		tabelPagin(curPage) {
			this.loading = true;
			let startIndex = (curPage - 1) * this.pageSize;
			let query = { 
                startIndex: startIndex, 
                rows: this.pageSize ,
                spaceId:this.queryForm.spaceId,
                devCode:this.queryForm.devCode,
                devName:this.queryForm.devName,
                devType:this.queryForm.devType,
            };
			this.$store.dispatch("dev/getDevPage", query).then(data => {
					this.tableData = data;
                    this.loading = false;
			})
			.catch(() => {
				this.loading = false;
			});
        },

        //初始化设备区域Options
		initSpaceOptions() {
			this.$store.dispatch("dev/getSpaceList").then(data => {
                this.querySpaceOptions.length = 0;
                //查询增加一个null 全部的查询处理
				this.querySpaceOptions.push({ spaceId: null, spaceName: "全部" }); 
				data.forEach(item => {
					this.querySpaceOptions.push({
						spaceId: item.spaceId,
						spaceName: item.spaceName
					});
				});
			});
        },
        //初始化设备类型Options
		initTypeOptions() {
			this.$store.dispatch("dev/getDevTypeList").then(data => {
                this.queryTypeOptins.length = 0;
                this.queryTypeOptins.push({devTypeId:null,devTypeName:'全部'});
				data.forEach(item=>{
                    this.queryTypeOptins.push({
                        devTypeId:item.devTypeId,
                        devTypeName:item.devTypeName
                    })
                })
			});
		},
        
    },
	mounted() {
        this.$nextTick(()=>{
            this.initSpaceOptions();
            this.initTypeOptions();
            this.onQuery();
        })
       
    },
	beforeDestroy() {}
};
</script>

<style scoped>
</style>
