<template>
	<div class="rootDiv">
		<el-table
			ref="multipleTable"
			:data="tableData"
			tooltip-effect="dark"
			style="width: 100%"
			@selection-change="handleSelectionChange"
		>
			<el-table-column type="selection" width="55"></el-table-column>
			<el-table-column label="序号" width="50" prop="sn"></el-table-column>
			<el-table-column prop="version" label="版本" width="120">
                <template slot-scope="{row}">
                    <el-tag :type="row.version | versionFilter">
                        {{ row.version}}
                    </el-tag>
                </template>
            </el-table-column>
			<el-table-column prop="time" label="更新时间" width="120"></el-table-column>
			<el-table-column prop="part" label="内容"></el-table-column>
			<el-table-column prop="user" label="发布者" width="80"></el-table-column>
		</el-table>
	</div>
</template>

<script>
export default {
	name: "Log",
	filters: {
		versionFilter(version) {
            if(version.indexOf('Release') != -1)
            {
                return "danger";
            }
            else
            {
                return "info";
            }
		}
	},
	data() {
		return {
			activeTab: "doc1",
			tableData: [
				{
					sn: 1,
					version: "0.10 Alpha",
					part:
						"完成画面自适应、各种动画实现、widget控件扩展、潮流线、实时曲线图.",
					user: "xujun",
					time: "2018-10-1"
				},
				{
					sn: 2,
					version: "0.11 Alpha",
					part:
						"完成报表输出，解决图片不能显示的问题，注意报表制作时图片之前不能有整列隐藏，否则row和col不准确。因为anchor是Excel单元格计算row和col，会把隐藏列计算进去的。而html中的table不输出隐藏列。",
					user: "xujun",
					time: "2018-10-18"
				},
				{
					sn: 3,
					version: "0.12 Alpha",
					part: "完成编辑器运行态测试迁移到H5上。",
					user: "xujun",
					time: "2018-10-25"
				},
				{
					sn: 4,
					version: "0.13 Alpha",
					part: "完成H5图元的植入技术性试验。",
					user: "xujun",
					time: "2018-10-30"
				},
				{
					sn: 5,
					version: "0.14 Alpha",
					part:
						"增加了时间范围选择图元，完成消息总线。实现可指定图元联动事件源，只接受指定图元发来的事件。",
					user: "xujun",
					time: "2018-11-05"
				},
				{
					sn: 6,
					version: "0.16 Alpha",
					part:
						"取消了websocket初始检查timer，只保留close断线重连机制。重写了模拟器获得tags数据的方式，解决原来直接使用setTestRunPicture会有异步问题。(SVGPictureComponent.renderCanvas()渲染完毕异步回调事件addGVTTreeRendererListener中才将各个图元的tag集中到AnimationsHandler中)",
					user: "xujun",
					time: "2018-11-15"
				},
				{
					sn: 7,
					version: "0.17 Alpha",
					part:
						"完成了sendAoutCommand和sendEoutCommand这两种控制Action的web实现",
					user: "xujun",
					time: "2018-11-21"
				},
				{
					sn: 8,
					version: "0.20 Alpha",
					part:
						"完成柱状图、风向图、饼图。完成多子图共享时间轴过程图，实现Grid高度自动分配和resize自动计算功能。实现编辑器对echats所见即所得。",
					user: "xujun",
					time: "2018-12-28"
				},
				{
					sn: 9,
					version: "0.21 Alpha",
					part:
						"完成APP端现有成果的全部移植工作。服务端增加断面缓存，保证客户端连接后收到一次断面数据",
					user: "xujun",
					time: "2019-04-02"
				},
				{
					sn: 10,
					version: "1.00 Release",
					part: "完成VUE移植",
					user: "xujun",
					time: "2019-10-31"
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
