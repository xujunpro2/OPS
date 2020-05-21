<template>
	<div :class="className" :style="{height:height,width:width}" />
</template>

<script>
import echarts from "echarts";
require("echarts/theme/macarons"); // echarts theme

const animationDuration = 6000;

export default {
	props: {
		className: {
			type: String,
			default: "chart"
		},
		width: {
			type: String,
			default: "100%"
		},
		height: {
			type: String,
			default: "350px"
		}
	},
	data() {
		return {
			chart: null
		};
	},
	mounted() {
		this.$nextTick(() => {
			this.initChart();
		});
	},
	beforeDestroy() {
		if (!this.chart) {
			return;
		}
		this.chart.dispose();
		this.chart = null;
	},
	methods: {
		initChart() {
			this.chart = echarts.init(this.$el, "macarons");

			var option = {
                title:{
                    show:true,
                    text:'当月区域入侵统计',
                    left:'center'
                },
				tooltip: {
					trigger: "axis",
					axisPointer: {
						// 坐标轴指示器，坐标轴触发有效
						type: "shadow" // 默认为直线，可选为：'line' | 'shadow'
					}
				},
				grid: {
					left: 10,
					right: 15,
					bottom: 20,
					top: 30,
					containLabel: true
				},
				xAxis: [
					{
                        type: "category",
                        boundaryGap:true,
						data: [],
						axisTick: {
							alignWithLabel: true
						}
					}
				],
				yAxis: [
					{
                        type: "value",
                        min:0,//最小值为0
                        minInterval: 1,//刻度保证是整数
						axisTick: {
							show: false
						}
					}
                ],
                legend: {
                    left:'right',
					data: ["误报次数", "告警次数"],
                },
				series: [
					{
						name: "误报次数",
                        type: "bar",
                        barMaxWidth:'40',
						stack: "vistors",
						barWidth: "60%",
						data: [79, 52, 200, 334, 390, 330, 220],
						animationDuration
					},
					{
						name: "告警次数",
						type: "bar",
						stack: "vistors",
						barWidth: "60%",
						data: [80, 52, 200, 334, 390, 330, 220],
						animationDuration
					}
				]
            };
            
            

            this.$store.dispatch('camera/monthArea').then(data=>{
               
                option.xAxis[0].data = data.areaNames;
                option.series[0].data = data.exceptionCount;
                option.series[1].data = data.alarmCount;
                this.chart.setOption(option);
            })
		}
	}
};
</script>
