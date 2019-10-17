import echarts from 'echarts'
//多点时序折线图
var MultiTagLine = function(rtda,chartDiv,rtdaDom)
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
		option.title = {show: true, text: config.title,left:'center'};
	}
	var screenHeight = Number(rtdaDom.getAttribute('screenHeight'));
	//根据当前缩放后的height计算grid
	option.grid = this.getGrid(config,screenHeight);
	option.xAxis = this.getXAxis(config);
	option.yAxis = this.getYAxis(config);
	option.dataZoom = this.getDataZoom(config);
	option.series = this.getSeries(config);
	option.axisPointer = this.getAxisPointer(config);
	option.tooltip = this.getTooltip(config);
	
	myChart.setOption(option);
	
	/**
	 * 因为grid的top是固定像素，而为了自适应缩放，要计算为百分比，所以每次rtda的resize()要调用下这里
	 */
	MultiTagLine.prototype.resize = function(newWidth,newHeight)
	{
		//重新计算grid，echarts自己的resize()并不会调用setOption，所以这里要调一下
		option.grid = this.getGrid(config,newHeight);
		myChart.setOption(option);
	}
	/**
	 * 获得chart所占的svg img的原始bounds
	 */
	MultiTagLine.prototype.getSvgOrgBounds = function()
	{
		return orgBound;
	}
	MultiTagLine.prototype.getDiv = function()
	{
		return chartDiv;
	}
	/**
	* 关闭画面的时候,释放图资源
	*/
	MultiTagLine.prototype.dispose = function()
	{
		myChart.clear();
		myChart.dispose();
		chartDiv.parentNode.removeChild(chartDiv);
	}
	/**
	 * 处理消息总线
	 */
	MultiTagLine.prototype.doNotify = function(event,source,paramObj){
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
				console.info("MultiTagLine收到"+source+"发来事件timechanged:"+start.format("yyyy-MM-dd hh:mm")+"至"+end.format("yyyy-MM-dd hh:mm"));
				this.refreshData(start,end,config.tags);
			}
		}	
	}
	/**
	 * 收到消息查询数据并刷新柱状图
	 */
	MultiTagLine.prototype.refreshData = function(start,end,tags)
	{
		var oneDay = 24 * 3600 * 1000;
		var tempTime = start;
		
		var randData = [];
		while(tempTime.getTime() <= end.getTime())
		{
			var time = tempTime.getTime();
			var val = Math.round(Math.random() * 100);
			randData.push({value:[time,val]});
			tempTime = new Date(tempTime.getTime() + oneDay);
		}
		for(var i=0;i<option.series.length;i++)
		{
			option.series[i].data = randData;
		}
		myChart.setOption(option);
	}
}
MultiTagLine.prototype.getSeries = function(config)
{
	var series = [];
	for(var i=0;i<config.items.length;i++)
	{
		var item = config.items[i];
		var serie  = {type: 'line',lineStyle:{color:item.color}, xAxisIndex: i, yAxisIndex:i, name: item.name, showSymbol: false,hoverAnimation: false,data: []};
		if(item.lineType == 'smooth')
		{
			serie.smooth = true;
		}
		else if(item.lineType == 'step')
		{
			serie.step = true;
		}
		//填充
		if(item.areaColor != '')
		{
			serie.areaStyle = {color:item.areaColor};
		}
		series.push(serie);
	}
	return series;
}
//计算X坐标
MultiTagLine.prototype.getXAxis = function(config)
{
	var itemCount = config.items.length;
	var axes = [];
	for(var i=0;i<itemCount;i++)
	{
		//注意gridIndex是和i一致的，从0开始
		var axis = { show:true,type: 'time',gridIndex: i,axisLabel:{
								formatter:function (value, index) {
									var date = new Date(value);
									var text = date.format(config.dateFmt);
									return text;
								}
						},splitLine: {show:false},splitNumber:config.splitNumber};
		//如果子图数量大于1，并且当前子图不是最后以后，坐标不可见
		if(itemCount > 1 && i<(itemCount-1))
		{
			axis.show = false;
		}
		//设置时间轴最小间隔，根据日期格式来.这样可以避免坐标轴label重复的情况(月就不折腾了)
		//日
		if(config.dateFmt == 'yyyy-MM-dd' ||config.dateFmt == 'yyyy-M-d')
		{
			axis.minInterval = 24*3600*1000;//一天
		}
		//时
		if(config.dateFmt == 'yyyy-MM-dd hh')
		{
			axis.minInterval = 3600*1000;
		}
		//分
		if(config.dateFmt == 'hh:mm')
		{
			axis.minInterval = 60*1000;
		}
		//秒
		if(config.dateFmt == 'hh:mm:ss')
		{
			axis.minInterval = 1*1000;
		}
		
		axes.push(axis);
	}
	return axes;
}
//计算Y坐标
MultiTagLine.prototype.getYAxis = function(config)
{
	var itemCount = config.items.length;
	var axes = [];
	for(var i=0;i<itemCount;i++)
	{
		var name = config.items[i].name;
		//注意gridIndex是和i一致的，从0开始
		var axis = {gridIndex:i,name:name,nameLocation: 'center',nameGap:30,type: 'value',splitLine: {lineStyle: {type: 'dashed'}}};
		//如果是自定义坐标
		if(!config.items[i].axisAutoRange)
		{
			//[lower,upper,interval]
			var range = config.items[i].axisCustomeRange; 
			axis.min = range[0];
			axis.max = range[1];
			axis.interval = range[2];
		}
		axes.push(axis);
	}
	return axes;
}

//计算Grid,处理完美，因为考虑到resize，只能用百分比高度，而grid和title的距离30px是最好的，但30px占当前总高度的百分之几，这个得动态算出来.resize的时候也得重算。
MultiTagLine.prototype.getGrid = function(config,chartHeight)
{
	
	var itemCount = config.items.length;
	//如果无title，第一个子图的top就是10，否则就是30.这个就是space存在的bug
	var top = 10;
	if(config.title != '')
	{
		top = 30;
	}
	//计算top占当前图元高度的百分比
	var gridToTitlePercent = top / chartHeight * 100;
	//console.info('当前距离标题的百分比:'+gridToTitlePercent);
	//计算每个Grid的高度,只能用百分比，因为给的div的高宽都是经过了比例计算的
	var gridSumHeight = config.gridSumHeight;
	var space = gridToTitlePercent;//两个子图之间的留白高度
	var lineSumHeight = gridSumHeight- space;//总高度-留白高度,因为就第二个子图的top用到了space，其他子图都没用，所以只要减一个即可
	var gridItemHeight = Math.round(lineSumHeight / itemCount) ;//取整
	//组装grid设置
	var right = config.right;
	var grid = [];
	//其实每个子图隐藏的X轴的留白是正好的，但因为第一个子图下沉了30，导致space其实就是用在算第二个子图的top
	//space其实就是给出30px在整个图元高度的合适的百分比
	for(var i=0;i<itemCount;i++)
	{
		//就第二个子图用到top，从第三个子图开始，留白就不需要了，X隐藏的坐标正好就是留白空间，所以+一个space就够了
		if(i>= 1)
		{
			top = ((gridItemHeight * i) + space) + '%';
		}
		//console.info(top+" space:"+space+" itemHeght:"+gridItemHeight);
		var gridItem = {top: top,bottom: 0,left:20,right:right,containLabel: true,height: gridItemHeight+'%'};
		grid.push(gridItem);
	}
	return grid;
}

//计算datazoom
MultiTagLine.prototype.getDataZoom = function(config)
{
	var zoomStrs = config.dataZoom.split(',');
	var start = Number(zoomStrs[0]);
	var end = Number(zoomStrs[1]);
	//datazoom的xAxisIndex不像axisPointer.link那样支持‘all’，只能明确指明index
	var xAxisIndex = [];
	for(var i=0;i<config.items.length;i++)
	{
		xAxisIndex.push(i);
	}
	var dataZoom=[{type: 'slider',show: true,xAxisIndex: xAxisIndex,start: start,end: end}];
	return dataZoom;
}
//刻度尺
MultiTagLine.prototype.getAxisPointer = function(config)
{
	var axisPointer={
				    	link: {xAxisIndex: 'all'},//all表示所有X和Y联动
				        label: 
				        {
				            backgroundColor: '#777',
				            formatter:function (params)//时间轴要设置下，默认时间展示是分段的，不符合国内习惯
				            {
				               	var timestamp = params.value;//时间戳
				                var time = new Date(timestamp);
				                return time.format(config.dateFmt);
				            }
				       }
				    };
	return axisPointer;
}
MultiTagLine.prototype.getTooltip = function(config)
{
	var tooltip={
				    trigger: 'axis',
				    //cross默认就会显示X和Y两个方向的lable
				    axisPointer: {type: 'line',label:{show:true}},
				    formatter: function(params) 
				    {
				            if (params instanceof Array) 
				            {
				                var tooltipDatas = [];
				                var time = params[0].axisValue;//时间都是一样的，取第一个就行
				                var timeFmt = new Date(time).format(config.dateFmt);
				                for (var i = 0; i < params.length; i++) 
				                {
				                	var tagValue = params[i].data.value[1];//time类型的数据[时间，值]
				                    tooltipDatas.push({
				                        marker: params[i].marker,//图标段的html文本
				                        seriesName: params[i].seriesName,
				                        tagValue: tagValue
				                    });
				                }
				                var tipHtml = '<div style="padding:10px">'+timeFmt+'<br/>';
				                for(var i=0;i<tooltipDatas.length;i++)
				                {
				                	tipHtml += '<p style="margin: 0;">'+tooltipDatas[i].marker+tooltipDatas[i].seriesName+ ' : '+tooltipDatas[i].tagValue +'</p>';
				                }
				                tipHtml +='</div>';
								return tipHtml;
				            }
				    }
			};
	return tooltip;
}
//通过rtdaDom构建Config对象
MultiTagLine.prototype.getConfig =  function(rtdaDom)
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
	config.dateFmt = rtdaDom.getAttribute('datefmt');// 时间显示格式，用于X轴标签
	config.dataZoom = rtdaDom.getAttribute('datazoom');//缩放控件初始值 start，end
	config.right =  rtdaDom.getAttribute('right');//图形右边留白，默认40，正好够显示yyyy-MM-dd
	config.gridSumHeight = Number(rtdaDom.getAttribute('gridsumheight'));//grid区域高度总百分比
	config.splitNumber = Number(rtdaDom.getAttribute('splitnumber'));//时间轴刻度个数
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
			item.color = childDom.getAttribute('color');//线色
			item.areaColor = childDom.getAttribute('areacolor');//填充色，为‘’表示不填充
			item.lineType = childDom.getAttribute('linetype');//线样式，line smooth step
			//Y坐标轴,每个子图的Y坐标都可以个性化
			if(childDom.getAttribute('axisautorange') == 'true')
			{
				item.axisAutoRange = true;
			}
			else
			{
				item.axisAutoRange = false;
				//数据轴坐标人工指定:[lower,upper,ticksize]
				var range = childDom.getAttribute('axiscustomerange').split(',');
				var numberRange = [];
				for(var j=0;j<range.length;j++)
				{
					numberRange[j] = Number(range[j]);
				}
				item.axisCustomeRange = numberRange;
			}
			config.items.push(item);
		}
	}
	return config;
}

export default MultiTagLine;