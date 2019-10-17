import echarts from 'echarts'
var SimpleBar = function(rtda,chartDiv,rtdaDom)
{
	//记录下初始div的bounds，当resize的时候，可以通过rtda的canvasToScreen()计算新坐标
	var orgBound = {
		x:Number(rtdaDom.getAttribute('orgX')),
		y:Number(rtdaDom.getAttribute('orgY')),
		width:Number(rtdaDom.getAttribute('orgWidth')),
		height:Number(rtdaDom.getAttribute('orgHeight'))
	};
	var config = this.getConfig(rtdaDom);
	var myChart = echarts.init(chartDiv);	
	var option = {};
	
	
	//echarts默认背景就是透明的
	if(config.backgroundColor != 'transparent')
	{
		option.backgroundColor = config.backgroundColor;
	}
	//显示标题 
	if(config.title)
	{
		option.title = {show:true,text: config.title,left: 'center', textStyle:{color: config.foregroundColor}};
		option.grid =  {left: 5,right:5,top:30, bottom:2,containLabel: true};
	}
	//不显示标题 
	else
	{
		option.title = {show: false};
		option.grid =  {left: 5,right:5,top:10, bottom:2,containLabel: true};
	}
	//X轴
	option.xAxis = this.getXAxis(config);
	//Y轴
	option.yAxis = this.getYAxis(config);
	
	//数据
	option.series = this.getSeries(config);

	myChart.setOption(option);
	
	/**
	 * 获得chart所占的svg img的原始bounds
	 */
	SimpleBar.prototype.getSvgOrgBounds = function()
	{
		return orgBound;
	}
	SimpleBar.prototype.getDiv = function()
	{
		return chartDiv;
	}
	/**
	* 关闭画面的时候,释放图资源
	*/
	SimpleBar.prototype.dispose = function()
	{
		myChart.clear();
		myChart.dispose();
		chartDiv.parentNode.removeChild(chartDiv);
	}
	
	/**
	 * 处理消息总线
	 */
	SimpleBar.prototype.doNotify = function(event,source,paramObj){
		var bindIdArray = config.bindId;
		var recive = true;
		if(bindIdArray.length > 0 )
		{
			var index = bindIdArray.indexOf(source);
			if(index == -1)
			{
				recive = false;
			}
		}
		//事件源对象是可接受的
		if(recive)
		{
			//时间控件触发的变更时间选择时间
			if(event == rtda.RTDA_Event_TimeChanaged)
			{
				var start = new Date(paramObj.start);
				var end = new Date(paramObj.end);
				console.info("SimpleBar收到"+source+"发来事件timechanged:"+start.format("yyyy-MM-dd hh:mm")+"至"+end.format("yyyy-MM-dd hh:mm"));
				this.refreshData(start,end,config.tags);
			}
		}
		
	}
	
	/**
	 * 收到消息查询数据并刷新柱状图
	 */
	SimpleBar.prototype.refreshData = function(start,end,tags)
	{
		var data = option.series[0].data;
		data.length = 0;//清空数据
		var max = 100;
		var min = 20;
		for(var i=0;i<config.bars.length;i++)
		{
			var rand = Math.floor(Math.random()*(max-min+1)+min);
			data.push(rand);
		}
		//echarts一定要通过setOption才能刷新，内部会自动合并option
		myChart.setOption(option);
	}
}

SimpleBar.prototype.getSeries = function(config)
{
	var colors = [];
	for(var i=0;i<config.bars.length;i++)
	{
		colors.push(config.bars[i].color);
	}
	var series = [];
	var barSeries = {};
	barSeries.name='simplebar';//系列名称，用于tooltip的显示，legend 的图例筛选，在 setOption 更新数据和配置项时用于指定对应的系列。
	barSeries.type = 'bar';
	//bar宽度，可设置
	barSeries.barWidth = 30;
	barSeries.itemStyle = {};
	//也可以使用option.colors设置全局调色盘
	barSeries.itemStyle.color = function(params){
		return colors[params.dataIndex];
	};
	
	var data = [];
	barSeries.data = data;
	series.push(barSeries);
	return series;
}

SimpleBar.prototype.getXAxis = function(config)
{
		//根据config.bars的name属性创建x坐标
	var xAxis = {};
	xAxis.data = [];
	for(var i=0;i<config.bars.length;i++)
	{
		xAxis.data.push(config.bars[i].name);
	}
	//X轴文本
	xAxis.axisLabel = {color:config.foregroundColor};
	xAxis.axisLabel.interval = 0;//设置成 0 强制显示所有标签。 1，表示『隔一个标签显示一个标签』，如果值为 2，表示隔两个标签显示一个标签，以此类推。
	
	var axisLine = {};
	axisLine.lineStyle = {color:config.foregroundColor};
	xAxis.axisLine = axisLine;
	
	var axisTick = {};
	axisTick.lineStyle = {color:config.foregroundColor};
	xAxis.axisTick = axisTick;
	return xAxis;
}
SimpleBar.prototype.getYAxis = function(config)
{
	//Y坐标
	var yAxis = {};
	yAxis.type = 'value';
	
	yAxis.axisLabel = {color:config.foregroundColor};
		
	var axisLine = {};
	axisLine.lineStyle = {color:config.foregroundColor};
	yAxis.axisLine = axisLine;
		
	var axisTick = {};
	axisTick.lineStyle = {color:config.foregroundColor};
	yAxis.axisTick = axisTick;
	
	//如果是自定义坐标
	if(!config.axisAutoRange)
	{
		//[lower,upper,interval]
		var range = config.axisCustomeRange; 
		yAxis.min = range[0];
		yAxis.max = range[1];
		yAxis.interval = range[2];
	}
	yAxis.boundaryGap = ['0%', '0%'];//AutoRange起效！设置数据轴留白空间，可以直接设置数值或者相对的百分比，在设置 min 和 max 后无效
	yAxis.splitLine = {show: true,lineStyle:{type:'dashed',opacity:0.6}};
	return yAxis;
}
//通过rtdaDom构建Config对象
SimpleBar.prototype.getConfig =  function(rtdaDom)
{
	var config = new Object();
	//绑定事件图元，如果为空，表示全部接受
	config.bindId = [];
	var bindStr = rtdaDom.getAttribute('bindid');
	if(bindStr == null)
	{
		alert('bindId属性为null，检查画面文件');
		bindStr = '*';
	}
	else if(bindStr != '*' && bindStr.trim() != '')
	{
		var binds = bindStr.split(';');
		for(var i=0;i<binds.length;i++)
		{
			config.bindId.push(binds[i]);
		}
	}
	
	config.id = rtdaDom.getAttribute('id');
	config.backgroundColor = rtdaDom.getAttribute('backgroundcolor');//背景色
	config.foregroundColor = rtdaDom.getAttribute('foregroundcolor');//坐标、图例文字的颜色
	if(rtdaDom.getAttribute('title') !=null && rtdaDom.getAttribute('title') != '')//标题
	{
		config.title = rtdaDom.getAttribute('title');
	}
	//数据轴坐标是否是自动计算的
	if(rtdaDom.getAttribute('axisautorange') == 'true')
	{
		config.axisAutoRange = true;
	}
	else
	{
		config.axisAutoRange = false;
		//数据轴坐标人工指定:[lower,upper,ticksize]
		var range = rtdaDom.getAttribute('axiscustomerange').split(',');
		var numberRange = [];
		for(var i=0;i<range.length;i++)
		{
			numberRange[i] = Number(range[i]);
		}
		config.axisCustomeRange = numberRange;
	}
	//解析子元素rtda:echartsItem
	config.bars = [];//bar定义
	config.tags = [];//柱状图绑定的tag电，抽出去，方便查询的时候传递参数
	var childNodes = rtdaDom.childNodes;
	for(var i = 0; i < childNodes.length; i++) 
	{
		//nodeType ==1 表示是element
		if(childNodes[i].nodeType == 1 && childNodes[i].nodeName == "rtda:echartsitem") 
		{
			var childDom = childNodes[i];
			var bar = new Object();
			bar.bind = childDom.getAttribute('bind');
			config.tags.push(bar.bind);
			bar.name = childDom.getAttribute('name');
			bar.color = childDom.getAttribute('color');
			config.bars.push(bar);
		}
	}
	return config;
}

export default SimpleBar;
