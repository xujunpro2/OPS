import rtdaUtil from  './rtdaUtil'
import echarts from 'echarts'

/** 历史遗留问题，实时曲线图单独开一个 */
function RtdaLineChart(rtda,chartDiv,rtdaDom)
{
	var lastValue = null;//记录下最后一次的有效值
	var chartDiv = chartDiv;
	//记录下初始div的bounds，当resize的时候，可以通过rtda的canvasToScreen()计算新坐标
	var orgBound = {
		x:Number(rtdaDom.getAttribute('orgX')),
		y:Number(rtdaDom.getAttribute('orgY')),
		width:Number(rtdaDom.getAttribute('orgWidth')),
		height:Number(rtdaDom.getAttribute('orgHeight'))
	}

	var lineChartConfig = this.getLineChartConfig(rtdaDom);
	var timeType = lineChartConfig.timeType;
	var myChart = echarts.init(chartDiv);	
	var dataset = new Map();//数据集，tag为key，data数组为value
	var tag2NameMap = new Map();//tag为key，tag的中文名称为value
	var tag2NullValueState = new Map();//tag为key,空值处理为value
	
	//图例
	var legend = {};
	legend.show = lineChartConfig.showLegend;
	legend.data = [];
	//X轴
	var xAxis = {};
	var axisLabel = {color:lineChartConfig.foregroundColor};
	xAxis.type = 'time';
	//秒的X坐标
	if(timeType == 3)
	{
		xAxis.interval = 5000;//5秒步长
		axisLabel.formatter = function (value, index) 
		{
			var date = new Date(value);
			var text = date.getSeconds();
			return text;
		};
	}
	//分钟的X坐标
	else if(timeType == 2)
	{
		xAxis.interval = 5*60*1000;//5分钟步长
		axisLabel.formatter = function (value, index) 
		{
			
			var date = new Date(value);
			var text = date.getMinutes();
			return text;
		};
	}
	//小时的X坐标
	else if(timeType == 1)
	{
		xAxis.interval = 3600*1000;//1小时步长
		axisLabel.formatter = function (value, index) 
		{
			var date = new Date(value);
			var text = date.getHours();
			return text;
		};	
	}
	xAxis.axisLabel = axisLabel;
	
	var lineStyle = {};
	lineStyle.color = lineChartConfig.foregroundColor;
	var axisLine = {};
	axisLine.lineStyle = lineStyle;
	xAxis.axisLine = axisLine;
	var axisTick = {};
	axisTick.lineStyle = lineStyle;
	xAxis.axisTick = axisTick;
	xAxis.splitLine = {show: true,lineStyle:{type:'dashed',opacity:0.6}};
	//Y坐标
	var yAxis = {};
	var lineStyle = {};
	lineStyle.color = lineChartConfig.foregroundColor;
	var axisLine = {};
	axisLine.lineStyle = lineStyle;
	yAxis.axisLine = axisLine;
		
	var axisTick = {};
	axisTick.lineStyle = lineStyle;
	yAxis.axisTick = axisTick;

	yAxis.axisLabel = {color:lineChartConfig.foregroundColor};
	yAxis.type = 'value';
	//如果是自定义坐标
	if(!lineChartConfig.axisAutoRange)
	{
		//[lower,upper,ticksize]
		var range = lineChartConfig.axisCustomeRange; 
		yAxis.min = range[0];
		yAxis.max = range[1];
		yAxis.interval = range[2];
	}
	yAxis.boundaryGap = false;
	yAxis.splitLine = {show: true,lineStyle:{type:'dashed',opacity:0.6}};
	//组装每条曲线的参数
	var series = [];
	for(var i=0;i<lineChartConfig.curves.length;i++)
	{
		var curveConfig = lineChartConfig.curves[i];
		/********************设置图例，标记图形的填充色****************************/
		var data = [];
		dataset.set(curveConfig.tag,data);
		tag2NameMap.set(curveConfig.tag,curveConfig.name);//tag和serie.name的对应，后面动态设值的时候需要
		tag2NullValueState.set(curveConfig.tag,curveConfig.nullValueState)//空值处理
		//生成该曲线的坐标占位空数据
		this.createXAxisEmptyData(curveConfig,data,timeType);
		//构建该曲线的对象
		var serie = new Object();
		serie.name = curveConfig.name;//曲线名称，唯一
		serie.type = 'line';//折线图，固定
		if(curveConfig.type == 'step')//阶梯线
		{
			serie.step = 'middle';
		}
		else if(curveConfig.type == 'spline')//圆滑曲线
		{
			serie.smooth = true;
			serie.smoothMonotone = 'x';
		}
		serie.data = dataset.get(curveConfig.tag);//数据源
		//线样式,itemStyle比lineStyle更好，可以自动统一线色、图例色、标记色
		var itemStyle = {};
		itemStyle.color = curveConfig.color;
		serie.itemStyle = itemStyle;
		if(curveConfig.lineStyle != 0)//虚线
		{
			serie.itemStyle.normal.type = 'dotted';
		}
		//标记
		if(curveConfig.showMark == 0)//不显示标记
		{
			serie.showSymbol = false;
		}
		else
		{
			serie.showSymbol = true;
		}
		//标记标签
		if(curveConfig.showLabel)
		{
			//根据小数点位数生成format
			var digNumber = curveConfig.digNumber;
			var digStr = '';
			for(var dig = 0;dig<digNumber;dig++)
			{
				digStr += '#';
			}
			if(digStr != '')
			{
				digStr = '####.'+digStr;
			}
			else 
			{
				digStr = '####';
			}
			var label = {};
			label.show = true;
			label.formatter = function(params)
			{
				var value = params.value;
				var time;
				if(timeType == 3)
				{
					time = new Date(value[0]).getSeconds();
				}
				else if(timeType == 2)
				{
					time = new Date(value[0]).getMinutes();
				}
				else if(timeType == 1)
				{
					time = new Date(value[0]).getHours();
				}
		      	return time+":"+formatNumber(value[1],digStr);
			}
			serie.label = label;
		}
		series.push(serie);
		/******************************构建legendDatas***********************/
		var legendData = {};
		legendData.name = curveConfig.name;
		var textStyle = {};
		textStyle.color = lineChartConfig.foregroundColor;
		legendData.textStyle = textStyle;
		legend.data.push(legendData);
	}
	//组装图形参数
	var option = {};
	//var grid = {show:true,top:8,bottom:'10%',left:'10%',right:'5%'};
	var grid = {show:true,left: 10,bottom:5,right:10,top:10, /*如果不显示标题，那么top要设置下，否则上面标题的区域仍然空白保留*/
			 containLabel: true/*左边距虽然设置为0，但为了显示Y轴lable，要设置为true*/
	};
	if(legend.show)
	{
		var grid = {show:true,top:30,left:10,right:10,bottom:5,containLabel: true};
	}
	option.grid = grid;
	//option.grid = {show:true,top:30,30,left:45,right:40};
	option.animation = false;
	option.backgroundColor = lineChartConfig.backgroundColor;
	option.title = {show: false};
	option.legend = legend;
	option.xAxis = xAxis;
	option.yAxis = yAxis;
	option.series = series;
	myChart.setOption(option);
	
	
	//根据timeType获得两个测值之间的最大时间间隔
	
	var sleep ;//定时刷新
	var clearCount;//第一次要清楚的空数据数量，时是24，其他是60
	switch (lineChartConfig.timeType)
	{
		case 1://时
			sleep = 3600*1000;
			clearCount = 24;
			break;
		case 2://分
			sleep = 60*1000;
			clearCount = 60;
			break;
		case 3://秒
			sleep = 1000;
			clearCount = 60;
			break;
		default:
			break;
	}
	
	/**
	 * 取tag的测值，并判断测值是否超期
	 */
	RtdaLineChart.prototype.randomData =function (tags) 
	{
		var now = new Date();
		now.setMilliseconds(0);
		var dataMap = new Map();
		for(var i=0;i<tags.length;i++)
		{
			var measureValue = rtda.tagCache.get(tags[i]);//模拟从tagCache中获得的测值对象
			//克隆一个，不要直接修改tagCache中的对象
			var tempValue = {};
			if(measureValue == null)
			{
				tempValue.value = null;
			}
			else
			{
				tempValue.value = measureValue.value;//值
				//过期值(>取值周期)设置为null
				var space = now.getTime() - measureValue.timestamp;
				//超时
				if(space > sleep)
				{
					tempValue.value = null;
				}
			}
			tempValue.time = now.getTime();//所有的数据都是以当前为曲线时标
			var newData = {};
			//时序图的数据格式data = [[时间格式字符/时间long，值]。。。。]
			newData.value = [tempValue.time,tempValue.value];
			dataMap.set(tags[i],newData)
			
		}
		return dataMap;
	}
	
	
	//占位空数据中的任意一组的最后一个时间都是一样的
	var tempData = dataset.values().next().value; //js Map的values是迭代器,这个是HashMap的dataset.values()[0];一样的效果
	var lastTime = tempData[tempData.length-1].value[0];
	var firstClear = false;
	var cycleClear = false;
	var tags = rtdaUtil.getMapKeys(dataset);//需要取值的tag数组
	var datas = rtdaUtil.getMapValues(dataset);//曲线绑定的数据集
	var self = this;//在定时器对象中引用this
	var timer = setInterval(function () 
	{
		//是否需要清除前面的数据(周期性清除)
		if(cycleClear)
		{
			for(var i=0;i<datas.length;i++)
			{
				data.shift();
			}
		}
		//第一次清理，echarts不是update数据，所以第一次创建的占位的{clearCount}个空数据都在，第一次清理的时候要清除了
		var now = new Date();
		now.setMilliseconds(0);
		if(!cycleClear && now.getTime()> lastTime)
		{
			firstClear = true;
		}
		if(firstClear)
		{
			firstClear = false;
			cycleClear = true;
			for(var i=0;i<datas.length;i++)
			{
				for(var j=0;j<clearCount;j++)
				{
					datas[i].shift();
				}
			}	
		}
			
		var newDataMap = self.randomData(tags);
		var newDataTags = rtdaUtil.getMapKeys(newDataMap);
		//找到新测值对应的dataset中的数据集对象，然后将新数据加入进去
		var series = [];
		
		for(var i=0;i<newDataTags.length;i++)
		{
		    var newTag = newDataTags[i];
		    var tagData = dataset.get(newTag);
		    var newData = newDataMap.get(newTag);
	
		    if(newData.value[1] == null)
		    {
		    	
		    	var nullValueState = tag2NullValueState.get(newTag);
		    	if(nullValueState == 2)//以最后一个有效测值为准连线
		    	{
		    		newData.value[1] = lastValue;
		    	}
		    	else if(nullValueState == 3)//以0为值连线
		    	{
		    		newData.value[1] = 0;
		    	}
		    }
		    else
		    {
		    	lastValue = newData.value[1];//以当前值作为最后有效值
		    }
		    tagData.push(newData);
		    var serieName = tag2NameMap.get(newTag);
		    var seriesData = {};
		    seriesData.name = serieName;
		    seriesData.data = tagData;
		    series.push(seriesData);
		}

		myChart.setOption({
		    series:series
		});
	}, sleep);
	/**
	 * 关闭画面的时候,释放曲线图资源
	 */
	RtdaLineChart.prototype.dispose = function()
	{
		//console.log('释放曲线图资源，曲线图ID:'+lineChartConfig.id);
		myChart.clear();
		myChart.dispose();
		chartDiv.parentNode.removeChild(chartDiv);
		if(timer)
		{
			clearInterval(timer);
			timer = null;
		}
	}
	/**
	 * 获得chart所占的svg img的原始bounds
	 */
	RtdaLineChart.prototype.getSvgOrgBounds = function()
	{
		return orgBound;
	}
	RtdaLineChart.prototype.getDiv = function()
	{
		return chartDiv;
	}
}

RtdaLineChart.prototype.getLineChartConfig = function (rtdaDom)
{
	//通过rtdaDom构建lineChartConfig
	var lineChartConfig = new Object();
	lineChartConfig.id = rtdaDom.getAttribute('id');
	lineChartConfig.timeType = parseInt(rtdaDom.getAttribute("timetype"));//1是小时监控，2是分钟监控,3是秒监控
	//显示图例
	if(rtdaDom.getAttribute("showlegend") == 'true')
	{
		lineChartConfig.showLegend = true;
	}
	else
	{
		lineChartConfig.showLegend = false;
	}
	lineChartConfig.backgroundColor = rtdaDom.getAttribute('backgroundcolor');//背景色
	lineChartConfig.foregroundColor = rtdaDom.getAttribute('foregroundcolor');//坐标、图例文字的颜色
	//数据轴坐标是否是自动计算的
	if(rtdaDom.getAttribute('axisautorange') == 'true')
	{
		lineChartConfig.axisAutoRange = true;
	}
	else
	{
		lineChartConfig.axisAutoRange = false;
		//数据轴坐标人工指定:[lower,upper,ticksize]
		var range = rtdaDom.getAttribute('axiscustomerange').split(',');
		var numberRange = [];
		for(var i=0;i<range.length;i++)
		{
			numberRange[i] = Number(range[i]);
		}
		lineChartConfig.axisCustomeRange = numberRange;
	}
	//解析子元素rtda:chartItem
	lineChartConfig.curves = [];//曲线定义
	var childNodes = rtdaDom.childNodes;
	for(var i = 0; i < childNodes.length; i++) 
	{
		if(childNodes[i].nodeType == 1 && childNodes[i].nodeName == "rtda:chartitem") 
		{
			var chartItemDom = childNodes[i];
			var curveConfig = new Object();
			curveConfig.tag = chartItemDom.getAttribute('tag');
			curveConfig.name = chartItemDom.getAttribute('name');
			curveConfig.type = chartItemDom.getAttribute('type');//线的样式：step是阶梯线，line是折线,spline是圆滑曲线
			curveConfig.lineStyle = parseInt(chartItemDom.getAttribute('linestyle'));//0是实线，其他就用虚线吧，不搞样式了
			curveConfig.color = chartItemDom.getAttribute('color');//线、标记、图例的颜色
			curveConfig.showMark = parseInt(chartItemDom.getAttribute('showmark'));//标记显示,0表示不显示，其他数字就显示 圆点，不搞样式了
			if(chartItemDom.getAttribute('showlabel') == 'true')
			{
				curveConfig.showLabel = true;//标记标签显示
			}
			else
			{
				curveConfig.showLabel = false;//标记标签显示
			}
			curveConfig.digNumber = parseInt(chartItemDom.getAttribute('dignumber'));//标记标签显示的数据小数位数
			curveConfig.nullValueState = parseInt(chartItemDom.getAttribute('nullvaluestate'));//无测值时的曲线状态(1:断开 2：以收到的最后一个测值为准连接，3：置为0)
			lineChartConfig.curves.push(curveConfig);
		}
	}
	return lineChartConfig;
}
RtdaLineChart.prototype.createXAxisEmptyData = function(curveConfig, data,timeType)
{
    if(timeType == 3)
    {
        this.createSecondEmptyData(curveConfig, data);
    }
    else if(timeType == 2)
    {
        this.createMinuteEmptyData(curveConfig, data);
    }
}
/**
 * 生成秒的占位数据
 */
RtdaLineChart.prototype.createSecondEmptyData = function(curveConfig, data)
{
    var c1 = new Date();
    var curSecond = c1.getSeconds();
    var firstSecond = parseInt(curSecond / 5) * 5;
    c1.setSeconds(firstSecond);
    c1.setMilliseconds(0);
    var c2 = new Date(c1.getTime() + 60 * 1000);
    while(c1 < c2)
    {
        var empty = { name: curveConfig.tag, value: [c1.getTime(), null] };
        data.push(empty);
        c1.setSeconds(c1.getSeconds() + 1);
    }
}

/**
 * 生成秒的占位数据
 */
RtdaLineChart.prototype.createMinuteEmptyData = function(curveConfig, data)
{
    var c1 = new Date();
    var curMinute = c1.getMinutes();
    var firstMinute = parseInt(curMinute / 5) * 5;
    c1.setMinutes(firstMinute);
    c1.setSeconds(0);
    c1.setMilliseconds(0);
    var c2 = new Date(c1.getTime() + 3600 * 1000); //后一小时
    while(c1 < c2)
    {
        var empty = { name: curveConfig.tag, value: [c1.getTime(), null] };
        data.push(empty);
        c1.setMinutes(c1.getMinutes() + 1);
    }
}

export default RtdaLineChart;