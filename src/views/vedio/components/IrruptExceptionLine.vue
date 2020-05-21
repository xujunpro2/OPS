<template>
	<div :class="className" :style="{height:height,width:width}" />
</template>

<script>
import echarts from "echarts";
require("echarts/theme/macarons"); // echarts theme

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
		},
		autoResize: {
			type: Boolean,
			default: true
		}
	},
	data() {
		return {
			chart: null
		};
	},

	methods: {
		initChart() {
            //根据当前月的天数计算xAxis坐标
            var now=new Date();
            var d = new Date(now.getFullYear(),now.getMonth()+1,0);// 下个月的第0天，由于JavaScript中day的范围为1~31中的值，所以当设为0时，会向前 一天，也即表示上个月的最后一天。
            var days=d.getDate();
            
            var daysAxis = [];
            for(var i=1;i<=days;i++)
            {
                daysAxis.push(i);
            }
            var option = {
                title:{
                    show:true,
                    text:'当月入侵统计',
                    left:'center'
                },
				xAxis: {
					data: daysAxis,
					boundaryGap: false,//刻度标记是否在区间中间
					axisTick: {
						show: true
                    },
				},
				grid: {
					left: 10,
					right: 15,
					bottom: 20,
					top: 30,
					containLabel: true
				},
				tooltip: {
					trigger: "axis",
					axisPointer: {
						type: "cross"
					},
					padding: [5, 10]
				},
				yAxis: {
                    min:0,//最小值为0
                    minInterval: 1,//刻度保证是整数
					axisTick: {
						show: true
					}
				},
				legend: {
                    left:'right',
					data: ["误报次数", "告警次数"],
                },
             
				series: [
					{
						name: "误报次数",
						itemStyle: {
							normal: {
								color: "#FF005A",
								lineStyle: {
									color: "#FF005A",
									width: 2
								}
							}
						},
						smooth: true,
						type: "line",
						data: [0, 0, 0, 0, 0, 0, 0],
						animationDuration: 2800,
						animationEasing: "cubicInOut"
					},
					{
						name: "告警次数",
						smooth: true,
						type: "line",
						itemStyle: {
							normal: {
								color: "#3888fa",
								lineStyle: {
									color: "#3888fa",
									width: 2
								},
								areaStyle: {
									color: "#f3f8ff"
								}
							}
						},
						data: [0, 0, 0, 0, 0, 0, 0],
						animationDuration: 2800,
						animationEasing: "quadraticOut"
					}
				]
			}
            this.chart = echarts.init(this.$el, "macarons");
            this.$store.dispatch('camera/monthEvents').then(data=>{
                option.series[0].data = data.exception;
                option.series[1].data = data.alarm;
                this.chart.setOption(option);
            })
			
		},
		
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
	}
};
</script>
