<template>
	<div class="dashboard-editor-container">
        <el-row :gutter="32">
            <el-col :xs="24" :sm="24" :lg="8">
                <div class="chart-wrapper">
                     <exception-pie />
                </div>
            </el-col>
            <el-col :xs="24" :sm="24" :lg="16">
                <div class="chart-wrapper">
                    <exception-top5 />
                </div>
            </el-col>
        </el-row>
        <el-row style="background:#fff;padding:16px 16px 0;margin-bottom:32px;">
			<exception-month/>
		</el-row>
        <el-row style="background:#fff;padding:16px 16px 0;margin-bottom:32px;">
			<exception-area/>
		</el-row>
    </div>
</template>

<script>
import ExceptionPie from './components/IrruptExceptionPie'
import ExceptionTop5 from './components/IrruptExceptionTop5'
import ExceptionMonth from './components/IrruptExceptionLine'
import ExceptionArea from './components/IrruptExceptionBar'


export default {
	name: "IrruptStatistical",
	data() {
		return {
            
        };
    },
     components: { ExceptionPie,ExceptionTop5,ExceptionMonth,ExceptionArea },
	methods: {},
	mounted() {},
	beforeDestroy() {}
};
</script>

<style lang="scss" scoped>
.dashboard-editor-container {
    overflow:auto;
    width: 100%;
    height: 100%;
	padding: 32px;
	background-color: rgb(240, 242, 245);
    position: relative;

	.github-corner {
		position: absolute;
		top: 0px;
		border: 0;
		right: 0;
	}

	.chart-wrapper {
		background: #fff;
		padding: 16px 16px 0;
		margin-bottom: 32px;
	}
}

@media (max-width: 1024px) {
	.chart-wrapper {
		padding: 8px;
	}
}
</style>

