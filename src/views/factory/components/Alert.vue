<template>
	<div class="rootDiv">
		<el-table :data="tableData" height="170" border style="width: 100%">
			<el-table-column prop="date" label="时间" width="150" ></el-table-column>
			<el-table-column prop="name" label="类型" width="100"></el-table-column>
			<el-table-column prop="address" label="事件"></el-table-column>
		</el-table>
	</div>
</template>

<script>
export default {
	name: "alert",
	data() {
		return {
			tableData: [
				{
					date: "2020/4/28 13:25",
					name: "故障",
					address: "1#炼焦炉点火异常"
				},
				{
					date: "2020/4/28 13:25",
					name: "告警",
					address: "1#炼焦炉点火异常"
				},
				{
					date: "2020/4/28 13:25",
					name: "故障",
					address: "1#炼焦炉点火异常"
				},
				{
					date: "2020/4/28 13:25",
					name: "故障",
					address: "1#炼焦炉点火异常"
				}
			]
		};
	},

	methods: {},
	mounted() {},
	beforeDestroy() {}
};
</script>

<style scoped>
</style>
