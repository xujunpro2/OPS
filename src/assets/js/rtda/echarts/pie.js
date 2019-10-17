import echarts from 'echarts'
var Pie = function(rtda,chartDiv,rtdaDom)
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
	option.title = {show: false};//不显示标题 
	if(config.title != '')
	{
		option.title = {show: true, text: config.title,left:'center',textStyle:{color:config.foregroundColor}};
	}
	//tooltip
	//option.tooltip = {trigger: 'item',formatter: "{a} <br/>{b} : {c} ({d}%)"};
	option.tooltip = {trigger: 'item',formatter: "{b} : {c} ({d}%)"};
	//legend
	option.legend = this.getLegend(config);
	//series
	option.series = this.getSeries(config);
	//color
	option.color = this.getColor(config);
	myChart.setOption(option);
	/**
	 * 获得chart所占的svg img的原始bounds
	 */
	Pie.prototype.getSvgOrgBounds = function()
	{
		return orgBound;
	}
	Pie.prototype.getDiv = function()
	{
		return chartDiv;
	}
	/**
	* 关闭画面的时候,释放图资源
	*/
	Pie.prototype.dispose = function()
	{
		myChart.clear();
		myChart.dispose();
		chartDiv.parentNode.removeChild(chartDiv);
	}
	/**
	 * 处理消息总线
	 */
	Pie.prototype.doNotify = function(event,source,paramObj){
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
				console.info("Pie收到"+source+"发来事件timechanged:"+start.format("yyyy-MM-dd hh:mm")+"至"+end.format("yyyy-MM-dd hh:mm"));
				this.refreshData(start,end,config.tags);
			}
		}	
	}
	
	/**
	 * 收到消息查询数据并刷新柱状图
	 */
	Pie.prototype.refreshData = function(start,end,tags)
	{
		var data = option.series[0].data;
		data.length = 0;//清空数据
		var max = 100;
		var min = 20;
		for(var i=0;i<config.items.length;i++)
		{
			var item = config.items[i];
			var name = item.name;//显示名称
			var tag = item.bind;//绑定tag
			var rand = Math.floor(Math.random()*(max-min+1)+min);//模拟数据
			data.push({value:rand, name:name});
		}
		//echarts一定要通过setOption才能刷新，内部会自动合并option
		myChart.setOption(option);
	}
}
//option.legend设置
Pie.prototype.getLegend = function(config)
{
	var legend = {show: false};
	if(config.showLegend)
	{
		var seriesNames = [];
		for(var i=0;i<config.items.length;i++)
		{
			seriesNames.push(config.items[i].name);
		}
		var orient = config.legendOrient;
		var left = config.legendX;
		legend = {show:true,orient:orient,left:left,data: seriesNames,textStyle:{color:config.foregroundColor}};
		if(config.legendY == 'top')
		{
			legend.top = '0';
		}
		else if(config.legendY == 'bottom')
		{
			legend.bottom = '0';
		}
	}
	
	return legend;
}

//option.series设置
Pie.prototype.getSeries = function(config)
{	
	var emptyData = [];
	for(var i=0;i<config.items.length;i++)
	{
		emptyData.push({value:0,name:config.items[i].name});
	}
	var series = [];
	var serieItem = {type: 'pie',data:emptyData};
	serieItem.radius = config.radius;
	//是否显示label
	if(config.showLabel)
	{
		serieItem.label = {show:true,position:'inside'};
	}
	else
	{
		serieItem.label = {show:false};
	}
	series.push(serieItem);
	return series;
}
Pie.prototype.getColor = function(config)
{
	var colors = [];
	for(var i=0;i<config.items.length;i++)
	{
		var item = config.items[i];
		colors.push(item.color);
	}
	// color:['#c23531','#2f4554', '#61a0a8', '#d48265', '#91c7ae','#749f83',  '#ca8622', '#bda29a','#6e7074']
	return colors;
}
//通过rtdaDom构建Config对象
Pie.prototype.getConfig =  function(rtdaDom)
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
	config.title = rtdaDom.getAttribute('title');// 标题，空字符表示无标题
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
	config.legendOrient = rtdaDom.getAttribute('legendorient');//图例排列方向
	config.legendX = rtdaDom.getAttribute('legendx');//图例x位置
	config.legendY = rtdaDom.getAttribute('legendy');//图例y位置
	var radiuStrs = rtdaDom.getAttribute('radius').split(',');
	config.radius = [radiuStrs[0]+'%',radiuStrs[1]+'%'];//内外半径，百分比单位 
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
			config.items.push(item);
		}
	}
	return config;
}

export default Pie;