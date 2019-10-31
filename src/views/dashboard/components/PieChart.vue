<template>
  <div :class="className" :style="{height:height,width:width}" />
</template>

<script>
import echarts from 'echarts'
require('echarts/theme/macarons') // echarts theme


export default {

  props: {
    className: {
      type: String,
      default: 'chart'
    },
    width: {
      type: String,
      default: '100%'
    },
    height: {
      type: String,
      default: '300px'
    }
  },
  data() {
    return {
      chart: null
    }
  },
  mounted() {
    this.$nextTick(() => {
      this.initChart()
    })
  },
  beforeDestroy() {
    if (!this.chart) {
      return
    }
    this.chart.dispose()
    this.chart = null
  },
  methods: {
    initChart() {
      this.chart = echarts.init(this.$el, 'macarons')

      this.chart.setOption({
        grid:{
            top:120
        },
        tooltip: {
          trigger: 'item',
          formatter: '{a} <br/>{b} : {c} ({d}%)'
        },
        legend: {
            left: 'center',
            bottom: '10',
            data: ['甘肃风电', '新疆风电', '海南风电', '江苏风电', '湖北风电','江西风电']
        },
        series: [
          {
            name: '全国风力发电统计',
            type: 'pie',
            roseType: 'radius',
            radius: [15, 90],
            center: ['50%', '38%'],
            data: [
              { value: 320, name: '甘肃风电' },
              { value: 240, name: '新疆风电'},
              { value: 149, name: '海南风电' },
              { value: 100, name: '江苏风电' },
              { value: 59, name: '湖北风电' },
              { value: 35, name: '江西风电' }
            ],
            animationEasing: 'cubicInOut',
            animationDuration: 2600
          }
        ]
      })
    }
  }
}
</script>
