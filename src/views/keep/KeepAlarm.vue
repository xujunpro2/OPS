<template>
	<div class="rootDiv">
        <el-row :gutter="5" style="height:100%">
			<el-col :span="12" style="height:100%">
				<el-card  style="height:100%" :body-style="fullCardBody">
					<div slot="header" class="clearfix">
						<span class="cardTitie">待处理工单</span>
					</div>
					<el-table :data="orderTable" height="90%"  style="width: 100%">
						<el-table-column prop="keepCode" label="工单编号"></el-table-column>
                        <el-table-column prop="keepName" label="工单名称"></el-table-column>
                        <el-table-column prop="createTime" label="创建时间">
                            <template slot-scope="scope">
                                {{timestampFormat(scope.row.createTime,'yyyy-MM-dd hh:mm:ss')}}
                            </template>
                        </el-table-column>
                        <el-table-column prop="deadline" label="完成期限">
                            <template slot-scope="scope">
                                <span :style="{color:getTextColor(scope.row.deadline)}">{{timestampFormat(scope.row.deadline,'yyyy-MM-dd hh:mm:ss')}}</span>
                            </template>
                        </el-table-column>
					</el-table>
				</el-card>
                
                
			</el-col>

			<el-col :span="12" style="height:100%">
               <el-card style="height:100%;" :body-style="fullCardBody">
					<div slot="header" class="clearfix">
						<span class="cardTitie">待保养设备</span>
					</div>
					    <el-table :data="devTable" height="90%"  style="width: 100%;" >
                            <el-table-column prop="devCode" label="设备编码"></el-table-column>
						    <el-table-column prop="devName" label="设备名称"></el-table-column>
                            <el-table-column prop="preKeepTime" label="上次保养时间">
                                <template slot-scope="scope">
                                    {{timestampFormat(scope.row.preKeepTime,'yyyy-MM-dd hh:mm:ss')}}
                                </template>
                            </el-table-column>
                            <el-table-column prop="nextKeepTime" label="下次保养时间">
                                <template slot-scope="scope">
                                    <span :style="{color:getTextColor(scope.row.nextKeepTime)}">{{timestampFormat(scope.row.nextKeepTime,'yyyy-MM-dd hh:mm:ss')}}</span>
                                </template>
                            </el-table-column>
					    </el-table>
				</el-card>
			</el-col>
		</el-row>
    </div>
</template>

<script>
import CommonTool from '@/utils/commonTool.js'
export default {
	name: "Keep",
	data() {
		return {
            orderTable:[],
            devTable:[],
            fullCardBody: { height: "100%", overflow: "auto" },
        };
	},
	methods: {
        //表格时间格式化
        timestampFormat(timestamp,formate){
            return CommonTool.formatData(new Date(timestamp),formate)
        },
        //工单最后期限的文字颜色
        getTextColor(timestamp){
            let oneDay = 24*3600*1000;
            let now = new Date().getTime();
            let space = timestamp - now;
            //超时为红色
            if(space <= 0)
            {
                return '#FF0000 ';
            }
            //一天以内为橙色
            else if(space <= oneDay)
            {
                return '#E6A23C'
            }
            //三天以内为蓝色
            else if(space <= oneDay*3)
            {
                return '#409EFF'
            }
            //正常颜色
            else
            {
                return '#606266'
            }
        },
        //查询派单状态的工单 状态码:1
        getAssignedOrder()
        {
            this.$store.dispatch('keep/byState',1).then(data=>{
                this.orderTable = data;
            })
        },
        //查询3天内维保逾期的设备
        threeDayKeepDevs()
        {
            this.$store.dispatch('keep/threeDay').then(data=>{
                this.devTable = data;
            })
        }
    },
	mounted() {
        this.getAssignedOrder();
        this.threeDayKeepDevs();
    },
	beforeDestroy() {}
};
</script>

<style scoped>
.cardTitie {
	margin-left: 10px;
	font-size: 16px;
	font-weight: 500;
	color: #409eff;
	line-height: 30px;
}
</style>
