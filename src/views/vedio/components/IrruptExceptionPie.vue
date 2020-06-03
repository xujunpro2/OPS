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
			default: "265px"
		}
	},
	data() {
		return {
			chart: null
		};
	},
	
	methods: {
		initChart() {
			this.chart = echarts.init(this.$el, "macarons");
            var option = {
                title:{
                    show:true,
                    text:'昨日入侵统计'
                },
				grid: {
					top: 120
				},
				tooltip: {
					trigger: "item",
					formatter: "{b} : {c}次 ({d}%)"
                },
                label:{
                    formatter:"{b}:{c}({d}%)"
                },
				legend: {
					left: "center",
					bottom: "10",
					data: ["误报", "入侵"]
				},
				series: [
					{
						type: "pie",
						radius: [0, '50%'],
						data: [
							{ value: 0, name: "误报",itemStyle:{color:"#409EFF"} },
							{ value: 0, name: "入侵",itemStyle:{color:"#F56C6C"} },
						],
						animationEasing: "cubicInOut",
						animationDuration: 2600
					}
				]
            }

            this.$store.dispatch('camera/yesterdayEvents').then(data=>{
                var successCount = 0;
                var exceptionCount = 0;
                if(data)
                {
                    successCount = data.successCount;
                    exceptionCount = data.exceptionCount;
                   
                }
                option.series[0].data=
                [
                    { value: exceptionCount, name: "误报",itemStyle:{color:"#409EFF"} },
					{ value: successCount, name: "入侵",itemStyle:{color:"#F56C6C"} },
                ]
                this.chart.setOption(option);
            })


			// this.chart.setOption({
                
			// });
		}
    },
    mounted() {
		this.$nextTick(() => {
			this.initChart();
		});
	},
	beforeDestroy() {
		if (this.chart) {
			this.chart.dispose();
			this.chart = null;
		}
	}
};
</script>
