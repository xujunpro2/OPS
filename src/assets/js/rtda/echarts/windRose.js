import echarts from 'echarts'
var WindRose = function(rtda,chartDiv,rtdaDom)
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
	option.title = {show: false};//不显示标题 
	option.tooltip={show: true,trigger:"item"};
	option.legend = this.getLegend(config);
	option.radar = this.getRadar(config);
	//数据
	option.series = this.getSeries(config);

	myChart.setOption(option);
	/**
	 * 获得chart所占的svg img的原始bounds
	 */
	WindRose.prototype.getSvgOrgBounds = function()
	{
		return orgBound;
	}
	WindRose.prototype.getDiv = function()
	{
		return chartDiv;
	}
	/**
	* 关闭画面的时候,释放图资源
	*/
	WindRose.prototype.dispose = function()
	{
		myChart.clear();
		myChart.dispose();
		chartDiv.parentNode.removeChild(chartDiv);
	}
	
	/**
	 * 处理消息总线
	 */
	WindRose.prototype.doNotify = function(event,source,paramObj){
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
				console.info("WindRose收到"+source+"发来事件timechanged:"+start.format("yyyy-MM-dd hh:mm")+"至"+end.format("yyyy-MM-dd hh:mm"));
				this.refreshData(start,end,config.tags);
			}
		}
		
	}
	
	/**
	 * 收到消息查询数据并刷新柱状图
	 */
	WindRose.prototype.refreshData = function(start,end,tags)
	{
		for(var i=0;i<option.series.length;i++)
		{
			var tag = option.series[i].tag;//可以根据tag来区分数据
			option.series[i].data.length = 0;
			
			//模拟16个风向上的数据(2-12级风速)
			var max = 12;
			var min = 2;
			var temp = [];
			for(var j=0;j<16;j++)
			{
				var rand = Math.floor(Math.random()*(max-min+1)+min);
				temp.push(rand);
			}
			option.series[i].data.push(temp);
		}
		
		//echarts一定要通过setOption才能刷新，内部会自动合并option
		myChart.setOption(option);
	}
}
//option.legend设置
WindRose.prototype.getLegend = function(config)
{
	var legend = {show: false};
	if(config.showLegend)
	{
		var seriesNames = [];
		for(var i=0;i<config.items.length;i++)
		{
			seriesNames.push(config.items[i].name);
		}
		legend = {show: true,icon: "circle",left: "center",bottom: '0px',orient: "horizontal",textStyle: {fontSize: 12},data: seriesNames};
	}
	return legend;
}
//option.radar设置
WindRose.prototype.getRadar = function(config)
{
	var radar = {
		radius:config.radiu,
		//雷达图绘制类型，支持 'polygon' 和 'circle'。
		shape: "circle",
		//数据轴分割数，默认是5
		splitNumber: 6,//12级风速，分6份
		//坐标轴在 grid 区域中的分隔区域，默认显示 (API文档有误，说默认show是false，其实是true)。
		splitArea: {show:false},
		//坐标直线样式(X轴)，注意lineStyle默认会应用到区域label文字颜色上（indicator的color可覆盖label颜色）
		axisLine: {show: true,lineStyle: {color: config.foregroundColor}},
		//环形坐标样式(Y轴)
		splitLine: {show: true,lineStyle: {color: config.foregroundColor}},
		indicator: [{name: "北",max: 12}, {name: "北北西",max: 12}, {name: "西北",max: 12}, {name: "西西北",max: 12}, 
					{name: "西",max: 12}, {name: "西西南",max: 12}, {name: "西南",max: 12}, {name: "南南西",max: 12}, 
					{name: "南",max: 12}, {name: "南南东",max: 12}, {name: "东南",max: 12}, {name: "东东南",max: 12}, 
					{name: "东",max: 12}, {name: "东东北",max: 12}, {name: "东北",max: 12},{name: "北北东",max: 12}]
	};
	//不显示指示器
	if(!config.showLabel)
	{
		radar.name = {show:false};
	}
	return radar;
}
//option.series设置
WindRose.prototype.getSeries = function(config)
{	
	var series = [];
	for(var i=0;i<config.items.length;i++)
	{
		var item = config.items[i];
		var serieItem = {
			tag:item.bind,//增加一个属性tag，可以在refreshData的时候用来绑定
			name: item.name,
			type: "radar",
			symbol: "emptyCircle",
			symbolSize: 6,
			areaStyle: {color: item.color},
			itemStyle:{color:item.lineColor},//symbol的颜色
			lineStyle:{color:item.lineColor},//边界线颜色
			data:[]//radar的data可以是个二维数组
		};
		series.push(serieItem);
	}
	return series;
}

//通过rtdaDom构建Config对象
WindRose.prototype.getConfig =  function(rtdaDom)
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
	if(bindStr != '*' && bindStr.trim() != '')
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
	if(rtdaDom.getAttribute('showlabel') == 'true')//是否显示标签
	{
		config.showLabel = true;
	}
	else
	{
		config.showLabel = false;
	}
	if(rtdaDom.getAttribute('showlegend') == 'true')//是否显示图例
	{
		config.showLegend = true;
	}
	else
	{
		config.showLegend = false;
	}
	config.radiu = rtdaDom.getAttribute('radiu')+'%';
	//解析子元素rtda:echartsItem
	config.items = [];//items定义
	config.tags = [];//items绑定的tag,抽出去，方便查询的时候传递参数
	var childNodes = rtdaDom.childNodes;
	for(var i = 0; i < childNodes.length; i++) 
	{
		//nodeType ==1 表示是element
		if(childNodes[i].nodeType == 1 && childNodes[i].nodeName == "rtda:echartsitem") 
		{
			var childDom = childNodes[i];
			var item = new Object();
			item.bind = childDom.getAttribute('bind');
			config.tags.push(item.bind);
			item.name = childDom.getAttribute('name');
			item.color = childDom.getAttribute('color');
			item.lineColor = childDom.getAttribute('linecolor');
			config.items.push(item);
		}
	}
	return config;
}


export default WindRose;