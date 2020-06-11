<template>
	<div class="rootDiv">
		<el-row class="bimRow" :gutter="10">
			<el-col :span="15" style="height:100%;padding-top:5px;padding-bottom:5px">
                <bim ref="bim"></bim>
            </el-col>
			<el-col :span="5" style="margin-top:5px">
                <dev-card ref="devCard"></dev-card>
            </el-col>
			<el-col :span="4">
				<dev-running-state ref="devState"></dev-running-state>
			</el-col>
		</el-row>
        <!--按钮行 -->
        <el-row style="margin:5px ">
            <!--查询列-->
            <el-col :span="15">
                <el-form :inline="true" ref="queryForm" :model="queryForm" label-width="80px">
                    <el-form-item label="区域划分">
                        <el-select v-model="queryForm.spaceId" filterable placeholder="请选择">
                            <el-option v-for="item in spaceQueryOptions" :key="item.spaceId" :label="item.spaceName"
                                :value="item.spaceId"></el-option>
                        </el-select>
                    </el-form-item>
                    <el-form-item label="设备编号">
                        <el-input v-model="queryForm.devCode" placeholder="支持模糊查询" clearable></el-input>
                    </el-form-item>
                    <el-form-item>
                        <el-button type="primary" @click="onQuery" icon="el-icon-search">查询</el-button>
                    </el-form-item>
                </el-form>
            </el-col>
            <!--操作列-->
            <el-col :span="9">
                <el-row type="flex" justify="end">
                    <el-button type="danger" icon="el-icon-delete" @click="onDelete">删除</el-button>
                    <el-button type="primary" icon="el-icon-circle-plus-outline" @click="onAdd">新增</el-button>
                    <el-button type="primary" icon="el-icon-edit" @click="onUpdate">修改</el-button>
                    <el-button type="primary" icon="el-icon-location-outline" @click="onBinding">绑定构件</el-button>
                    &emsp;
                    <el-dropdown  @command="onImportDev" trigger="click">
                        <el-button type="primary">
                            设备数据导入
                            <i class="el-icon-arrow-down el-icon--right"></i>
                        </el-button>
                        <el-dropdown-menu slot="dropdown">
                            <el-dropdown-item command="byIFC">从模型导入</el-dropdown-item>
                        </el-dropdown-menu>
                    </el-dropdown>
                </el-row>
            </el-col>
        </el-row>
		
        <!--设备Table行 -->
		<el-row class="devTableRow">
			<el-table ref="devTable" highlight-current-row @current-change="onRowSelectedChange" height="100%" v-loading="devLoading" :data="devTable" style="width: 100%;">
				<el-table-column prop="devName" label="名称"></el-table-column>
				<el-table-column prop="devCode" label="编码"></el-table-column>
				<el-table-column prop="devTypeName" label="类型"></el-table-column>
				<!-- <el-table-column prop="devState" label="状态">
					<template slot-scope="scope">
						<span v-if="scope.row.devState ==  1">在用</span>
						<span class="redFont" v-if="scope.row.devState ==  0">报废</span>
					</template>
				</el-table-column> -->
				<el-table-column prop="spaceName" label="所属区域"></el-table-column>
				<!-- <el-table-column prop="ifc" label="模型"></el-table-column>-->
				<el-table-column prop="productId" label="构件ID"></el-table-column>
				<el-table-column prop="preInspectTime" label="上次巡检时间"></el-table-column>
                <el-table-column prop="preRepairTime" label="上次检修时间"></el-table-column>
                <el-table-column  label="下次维保时间"></el-table-column>
                <el-table-column prop="preFaultTime" label="上次故障时间"></el-table-column>
			</el-table>
		</el-row>

		<el-row type="flex" justify="end" style="background:#fff">
			<el-pagination background layout="total, prev, pager, next" :page-size="pageSize" :total="total"
			    @current-change="paginChange"></el-pagination>
		</el-row>

		<!--导入设备数据对话框-->
		<el-dialog title="导入设备数据" :visible.sync="importDialogVisible" width="400px" :close-on-click-modal="false">
			<el-radio v-for="item of ifcList" v-model="importIfc" :key="item.ifcName" :label="item.ifcName">{{item.ifcName}}
			</el-radio>
			<transition name="fade">
				<el-progress v-show="this.importStarting" :percentage="progress" color="#409eff"></el-progress>
			</transition>
			<span slot="footer" class="dialog-footer">
				<el-button @click="importDialogVisible = false">取 消</el-button>
				<el-button type="primary" @click="onImportSubmit">确 定</el-button>
			</span>
		</el-dialog>

        <!--设备表单对话框-->
        <el-dialog title="设备信息" :visible.sync="devDialogVisible" @open="onDevDialogOpen" width="700px" :close-on-click-modal="false">
			<el-form ref="form" :model="devForm" :rules="devFormRules"  label-width="80px" >
                <el-row>
                    <el-col :span="12">
                        <el-form-item label="设备编码" prop="devCode">
                            <el-input v-model="devForm.devCode"></el-input>
                        </el-form-item>
                         <el-form-item label="设备类型" >
                            <el-select v-model="devForm.devType" placeholder="请选择" style="width:100%">
                                <el-option
                                v-for="item in typeOptions"
                                :key="item.devTypeId"
                                :label="item.devTypeName"
                                :value="item.devTypeId">
                                </el-option>
                            </el-select>
                        </el-form-item>
                        <el-form-item label="生产厂家" >
                            <el-input v-model="devForm.manufacturer"></el-input>
                        </el-form-item>
                        <el-form-item label="质保期限" prop="warranty">
                            <el-input v-model.number="devForm.warranty">
                                <template slot="append">年</template>
                            </el-input>
                            <!-- <el-input-number v-model="devForm.warranty":min="1" :max="100" style="width:120px"></el-input-number>&nbsp;年 -->
                        </el-form-item>
                        <el-form-item label="额定电压">
                            <el-input v-model="devForm.voltage">
                                <template slot="append">&nbsp;V</template>
                            </el-input>
                            <!-- <el-input-number v-model="devForm.voltage" :min="0" :max="400" style="width:120px"></el-input-number>&nbsp;V -->
                        </el-form-item>
                    </el-col>
                    <el-col :span="12">
                        <el-form-item label="设备名称" prop="devName">
                            <el-input v-model="devForm.devName"></el-input>
                        </el-form-item>
                        <el-form-item label="所属区域" >
                            <el-select v-model="devForm.spaceId" placeholder="请选择" style="width:100%">
                                <el-option
                                v-for="item in spaceOptions"
                                :key="item.spaceId"
                                :label="item.spaceName"
                                :value="item.spaceId">
                                </el-option>
                            </el-select>
                        </el-form-item>
                        <el-form-item label="投产日期" >
                            <el-date-picker v-model="devForm.usedTime" type="date" style="width:100%" placeholder="选择日期">
                            </el-date-picker>
                        </el-form-item>
                         <el-form-item label="报修电话" >
                            <el-input v-model="devForm.phone"></el-input>
                        </el-form-item>
                        <el-form-item label="额定功率">
                            <el-input v-model="devForm.power">
                                <template slot="append">KW</template>
                            </el-input>
                            <!-- <el-input-number v-model="devForm.power" :min="0" :max="4000" style="width:120px"></el-input-number>&nbsp;KW -->
                        </el-form-item>
                    </el-col>
                </el-row>
			</el-form>
			<span slot="footer" class="dialog-footer">
				<el-button @click="devDialogVisible = false">取 消</el-button>
				<el-button type="primary" @click="onSubmitDev">确 定</el-button>
			</span>
		</el-dialog>
	</div>
</template>

<script>
import Bim from '@/components/Bim';
import DevRunningState from "./components/DevRunningState";
import DevCard from './components/DevCard';
import viewerHelper from "@/utils/viewHelper";
import { BimiViewer, ProductState } from "@/assets/js/bim/bim";

export default {
	name: "DevList",
	components: { Bim,DevRunningState,DevCard },
	data() {
		return {
            queryForm:{
                spaceId:null,
                devCode:null,
            },
            spaceQueryOptions:[],//设备区域查询，需要增加一个全部
           
			
			//设备表格
			fullCardBody: { height: "100%", overflow: "auto" },
			devLoading: false,
			devTable: [],
			total: 0,
            pageSize: 50, //设备分页固定50条一页
            
            //设备操作
            curRow:null, //设备表格上当前选中的行
            typeOptions: [],//设备类型
            spaceOptions: [], //设备区域选择框数据
            devDialogVisible:false,//设备对话框
            devForm:{
                devId:null,
                devCode:null,
                devName:null,
                devType:null,
                spaceId:null,
                manufacturer:null,
                usedTime:null,
                warranty:null, //质保期 以年为单位 
                phone:null,
                power:null, //额定功率 KW
                voltage:null, //额定电压 V
                ifc:null,
                productId:null,
            },
            devFormRules:{
                devCode: [
                    { required: true, message: '请输入设备编码', trigger: 'blur' }
                ],
                devName: [
                    { required: true, message: '请输入设备名称', trigger: 'blur' }
                ],
                warranty:[
                    {type:'number',min:1, message: '请输入大于0的整数', trigger: 'blur'}
                ],
            },

			//导入设备数据对话框
			importDialogVisible: false,
			importIfc: null,
			ifcList: [],
			importStarting: false, //开始导入，进度条出现
			taskId: null, //导入任务ID
			progress: 0, //导入进度
			interval: null //定时器
		};
	},
	methods: {
        //初始化设备类型Options
		initTypeOptions() {
			this.$store.dispatch("dev/getDevTypeList").then(data => {
				this.typeOptions = data;
			});
		},

		//初始化设备区域Options
		initSpaceOptions() {
			this.$store.dispatch("dev/getSpaceList").then(data => {
                //生成列表,先清空之前的数据
                this.spaceOptions.length = 0;
                this.spaceQueryOptions.length = 0;
                
                this.spaceOptions = data;
                //查询增加一个null 全部的查询处理
				this.spaceQueryOptions.push({ spaceId: null, spaceName: "全部" }); 
				data.forEach(item => {
					this.spaceQueryOptions.push({
						spaceId: item.spaceId,
						spaceName: item.spaceName
					});
				});
			});
        },
        
        /************************************设备资产场景的ifc*********************************** */
        initDevBim(){
            this.$store.dispatch('ifc/ifcUsedByUsedKey','dev').then(data=>{
                if(data)
                {
                    var usedIFCNames = data.usedIFC.split(',');
                    if(this.$refs.bim)
                    this.$refs.bim.loadBim(usedIFCNames); 
                }
            })
        },


        /**************************************设备*******************************/
       
        //加入查询条件
        onQuery(){
            this.initDevTabel();
        },
		//初始化Dev表格
		initDevTabel() {
            //当前选中行为null
            this.curRow = null;
            this.$refs.devTable.setCurrentRow(null);
            this.$store
                .dispatch("dev/getDevCount",this.queryForm)
				.then(data => {
					this.total = data;
					return new Promise((resolve, reject) => {
						resolve();
					});
				})
				.then(() => {
					this.devTabelPagin(1);
				});
		},
		//分页事件
		paginChange(curPage) {
			this.devTabelPagin(curPage);
		},
		//设备分页查询
		devTabelPagin(curPage) {
			this.devLoading = true;
			let startIndex = (curPage - 1) * this.pageSize;
			let query = { 
                startIndex: startIndex, 
                rows: this.pageSize ,
                spaceId:this.queryForm.spaceId,
                devCode:this.queryForm.devCode,
            };
			this.$store
				.dispatch("dev/getDevPage", query)
				.then(data => {
					this.devTable = data;
                    this.devLoading = false;
				})
				.catch(() => {
					this.devLoading = false;
				});
        },
        //设备表格行选中事件
        onRowSelectedChange(curRow,oldRow){
            //表格init刷新之后，elementUI默认还会选中这行，从而触发该事件
            if(curRow)
            {
                this.curRow = curRow;
                //设置基本信息
                let usedTime = curRow.usedTime;
                let info = {
                    manufacturer:curRow.manufacturer,
                    devCode:curRow.devCode,
                    power:curRow.power,
                    voltage:curRow.voltage,
                    usedTime:new Date(usedTime),
                    phone:curRow.phone
                }
                this.$refs.devCard.setBasicInfo(info);
                //BIM定位
                let productId = curRow.productId;
                if(productId)
                {
                    if(this.$refs.bim)
                    this.$refs.bim.flyTo(productId);
                }
            }
        },
        onDevDialogOpen(){
            //清除之前验证消息，否则会保留
            if(this.$refs.form)
            {
                this.$refs.form.clearValidate();
            }
            if(this.curRow)
            {
                for(let key in this.devForm)
                {
                    this.devForm[key] = this.curRow[key];
                }
            }
        },
        onAdd(){
            //设置devTable清除选中状态，处理用户选中了row，但点击的是新建按钮的情况
            this.curRow = null;
            this.$refs.devTable.setCurrentRow(null);
            this.devDialogVisible = true;
        },
        onUpdate(){
            this.devDialogVisible = true;
        },
        onDelete(){
            if(this.curRow)
            {
                this.$confirm("确定删除该设备吗?", "提示", {
                    confirmButtonText: '确定',
                    cancelButtonText: '取消',
                    type: 'warning'
                }).then(()=>{
                    let devId = this.curRow.devId;
                    this.$store.dispatch('dev/deleteDev',devId).then(data=>{
                        if(data == 1)
                        {
                            this.$notify({title: '消息',message: '删除成功',type: 'success',duration:3000});
                            this.initDevTabel();
                        }
                    })
                })
                .catch(()=>{})
            }
            else
            {
                this.$alert("请选择需要删除的设备!", "提示", {confirmButtonText: "确定",type: "info"});
            }
        },
        // 绑定构件
        onBinding(){
            if(!this.curRow)
            {
                this.$alert("请选择需要绑定的设备!", "提示", {confirmButtonText: "确定",type: "info"});
                return;
            }
            let pickId = this.$refs.bim.pickId;
            if(!pickId)
            {
                this.$alert("请在BIM模型上选中构件!", "提示", {confirmButtonText: "确定",type: "info"});
                return;
            }
            //都选了
            let param = {
                devId:this.curRow.devId,
                productId:pickId,
                ifc:this.$refs.bim.pickIfc,
            }
             this.$confirm("确定将设备和BIM构件绑定吗?", "提示", {
                    confirmButtonText: '确定',
                    cancelButtonText: '取消',
                    type: 'warning'
                }).then(()=>{
                    this.$store.dispatch('dev/bindProduct',param).then(data=>{
                        if(data == 1)
                        {
                            this.$notify({title: '消息',message: '模型构件绑定成功',type: 'success',duration:3000});
                            this.initDevTabel();
                        }
                    })
                })
                .catch(()=>{})
        },
   
         //设备对话框提交确定
        onSubmitDev(){
            this.$refs.form.validate(valid=>{
                if(valid)
                {
                    this.devDialogVisible = false;
                    //日期改为timestamp
                    let usedTimeStamp = this.devForm.usedTime.getTime();
                    let dev = {
                        devId:this.devForm.devId,
                        devName : this.devForm.devName,
                        devCode : this.devForm.devCode,
                        devType : this.devForm.devType,
                        spaceId : this.devForm.spaceId,
                        manufacturer :this.devForm.manufacturer,
                        usedTime:usedTimeStamp,
                        warranty:Number(this.devForm.warranty), 
                        phone:this.devForm.phone,
                        power:this.devForm.power, //额定功率 KW
                        voltage:this.devForm.voltage, //额定电压 V
                    }
                    if(this.curRow)
                    {
                        this.$store.dispatch('dev/updateDevBasic',dev).then(data=>{
                            if(data == 1)
                            {
                                this.$notify({title: '消息',message: '修改成功',type: 'success',duration:3000});
                                this.initDevTabel();
                            }
                        })
                    }
                    else
                    {
                        this.$store.dispatch('dev/addDevBasic',dev).then(data=>{
                            if(data == 1)
                            {
                                this.$notify({title: '消息',message: '添加成功',type: 'success',duration:3000});
                                this.initDevTabel();
                            }
                        })
                    }
                }
            })
            
        },





		/*******************************设备数据导入***************************************** */
		initIfcList() {
			this.$store.dispatch("ifc/getAllIFC").then(data => {
				this.ifcList = data;
			});
		},
		//导入设备
		onImportDev(command) {
			if (command === "byIFC") {
				//对话框初始化
				this.importIfc = null;
				this.importStarting = false;
				this.progress = 0;
				this.importDialogVisible = true;
			}
		},
		//确认从模型导入
		onImportSubmit() {
			if (this.importIfc) {
				//确认对话框
				this.$confirm(
					"该操作将覆盖选中模型相关的所有设备数据，确认执行吗?",
					"提示",
					{
						confirmButtonText: "确定",
						cancelButtonText: "取消",
						type: "warning"
					}
				)
					.then(() => {
						this.$store
							.dispatch("dev/importByIFC", this.importIfc)
							.then(data => {
								this.pollingTaskProgress(data);
							});
					})
					.catch(() => {});
			} else {
				this.$alert("请选择需要导入的模型!", "提示", {
					confirmButtonText: "确定",
					type: "info"
				});
			}
		},

		//发起导入操作之后轮询任务执行进度
		pollingTaskProgress(taskId) {
			this.importStarting = true;
			this.taskId = taskId;
			(this.progress = 0),
				(this.interval = setInterval(this.polling, 1000));
		},
		polling() {
			//防止没有任务触发轮询
			if (this.taskId == null) {
				return;
			}
			this.$store
				.dispatch("dev/getImportProgress", this.taskId)
				.then(data => {
					if (data == -1) {
						this.$notify({
							title: "消息",
							message: "设备数据导入发生错误",
							type: "error",
							duration: 3000
						});
						this.taskId = null;
					} else {
						this.progress = data;
						if (data == 100) {
							//停止轮询
							if (this.interval) {
								clearInterval(this.interval);
							}
							this.$store
								.dispatch(
									"dev/deleteImportProgress",
									this.taskId
								)
								.then(() => {
									this.taskId = null;
								});
							setTimeout(() => {
								this.importDialogVisible = false;
								this.initDevTabel();
							}, 500);
						}
					}
				});
		}
	},
	mounted() {
        this.initDevBim();
        this.initSpaceOptions();
        this.initTypeOptions();
		this.initDevTabel();
		this.initIfcList();
	},
	beforeDestroy() {
		if (this.interval) {
			clearInterval(this.interval);
		}
	}
};
</script>

<style scoped>
.bimRow {
	height: 50%;
    min-height: 343px;
	background: rgb(240, 242, 245);
}
.devTableRow {
	height: calc(50% - 100px);
}
</style>
