import SVG from "svgjs"
import RtdaLineChart from './rtdaLineChart'
/**图元解释器*/
function RtdaCellParser(rtda,widget,action) {
	var rtdaWidget = widget;
	var rtdaAction = action;
	var tags = [];//需要注册的tag，包括min、max对应的tag，linechart可能对应多个tag
	var map = new Map();//用来将rtda对象根据tag分组
	//在解析dom过程中暂时保存所有rtda非脚本对象，然后解析完之后才能分组
	var rtdaObjs = [];
	
	/**
	 * 初始化，加载画面之前要调用
	 */
	RtdaCellParser.prototype.init = function()
	{
		map.clear();
		tags = [];
		rtdaObjs = [];
	}
	RtdaCellParser.prototype.parse = function(rtdaDom) 
	{
		var parseResultObj = null;
		var nodeName = rtdaDom.nodeName;
		
		//大部分rtda:开头的这样统一就处理好了，还要记得min和max绑定的tag
		var tag = rtdaDom.getAttribute('tag');
		if(tag != null && tag != "")
		{
			if(tags.indexOf(tag) == -1)
			{
				tags.push(tag);
			}
		}
		
		//svg文件解析后nodename自动变成小写字母
		switch(nodeName) 
		{
			case 'rtda:label'://开关量文本
				parseResultObj = this.parseLabel(rtdaDom);
				break;
			case 'rtda:measuretext'://模拟量文本
				parseResultObj = this.parseMeasuretext(rtdaDom);
				break;
			case 'rtda:coloronmeasure'://模拟量变色
				parseResultObj = this.parseColorOnMeasure(rtdaDom);
				break;
			case 'rtda:coloronstate'://模拟量变色
				parseResultObj = this.parseColorOnState(rtdaDom);
				break;
			case 'rtda:rotation'://旋转
				parseResultObj = this.parseRotation(rtdaDom);
				break;
			case 'rtda:translation'://位移
				parseResultObj = this.parseTranslation(rtdaDom);
				break;
			case 'rtda:scale'://缩放
				parseResultObj = this.parseScale(rtdaDom);
				break;
			case 'rtda:bargraph'://填色柱
				parseResultObj = this.parseBarGraph(rtdaDom);
				break;
			case 'rtda:cyclerotateein'://状态量旋转动画
				parseResultObj = this.parseCycleRotateEin(rtdaDom);
				break;
			case 'rtda:cyclerotateain'://模拟量旋转动画
				parseResultObj = this.parseCycleRotateAin(rtdaDom);
				break;
			case 'rtda:cycleslideein'://状态量幻灯片动画
				parseResultObj = this.parseCycleSlideEin(rtdaDom);
				break;
			case 'rtda:widget'://控件
				parseResultObj = rtdaWidget.parse(rtdaDom);
				break;
			//解析line和echarts,他们都是自己主动去断面缓存中获得数据，不需要rtda实时驱动，不需要加入rtdaObjs，所以没有返回值
			case 'rtda:chart'://图形
				this.parseChart(rtdaDom);
				break;
			//Action动作不需要rtda实时驱动的要求。
			//使能判断虽然有实时驱动但在rtdaAction内部专门判断，但不纳入rtdaObjs中处理，这样保证rtdaObj的tag属性就对应需要驱动的对象
			//使能的tag是需要控制的点，并不是判断脚本中的tag。
			case 'rtda:loadview'://画面跳转
			case 'rtda:sendeoutcommand'://状态量控制命令
			case 'rtda:sendaoutcommand'://模拟量控制命令
			case 'rtda:sendcommand'://控制量(脚本量)控制命令
				this.parseActions(rtdaDom);
				break;
			default:
				break;
		}
		//暂时先保存这些对象，等整个文档解析结束再分组
		if(parseResultObj != null) 
		{
			rtdaObjs.push(parseResultObj);
        }
        //解析完整个画面文档后，需要将使能脚本中绑定的tag也加入到当前tags中，注意不要重复
        var scriptTgas = action.getScriptTags();
        scriptTgas.forEach(scriptTag => {
            if(tags.indexOf(scriptTag) == -1)
            {
                tags.push(scriptTag);
            }
        });
	};
	
	RtdaCellParser.prototype.parseActions = function(rtdaDom)
	{
		rtdaAction.parseActions(rtdaDom);
	}
	RtdaCellParser.prototype.parseChart =function(rtdaDom)
	{
		var chartName = rtdaDom.getAttribute('chart-name');
		if(chartName == 'line')
		{
			this.parseLineChart(rtdaDom);
		}
		else
		{
			this.parseECharts(rtdaDom);
		}
	}
	RtdaCellParser.prototype.parseECharts = function(rtdaDom)
	{
		// var echartsManager = new EChartsManager();
		// echartsManager.init(rtdaDom);
	}
	RtdaCellParser.prototype.parseLineChart =function(rtdaDom)
	{
		var img = rtdaDom.parentNode;
		var imgX = Number(img.getAttribute('x'));
		var imgY = Number(img.getAttribute('y'));
		var imgWidth = Number(img.getAttribute('width'));
		var imgHeight = Number(img.getAttribute('height'));
		var screenStart = rtda.canvasToScreen(imgX,imgY);
		var screenEnd = rtda.canvasToScreen(imgX+imgWidth,imgY+imgHeight);
		
		//记录下原始尺寸，后面resize的时候要用 
		rtdaDom.setAttribute("orgX",imgX);
		rtdaDom.setAttribute("orgY",imgY);
		rtdaDom.setAttribute("orgWidth",imgWidth);
		rtdaDom.setAttribute("orgHeight",imgHeight);
		
		//移除<image>
		img.parentNode.removeChild(img);
		
		//创建div容器
		//如果已经创建对应的Div,
		var chartId = rtdaDom.getAttribute('id');
		var chartDiv = document.getElementById(chartId);
		if(!chartDiv)
		{
			//console.log('新建了一个chart用的Div');
			var chartDiv = document.createElement('div');
			chartDiv.setAttribute('id',rtdaDom.getAttribute('id'));
			document.body.appendChild(chartDiv);   
		}
		var style = 'position: absolute; top:'+screenStart.y+'px;left:'+screenStart.x+'px; width: '+(screenEnd.x-screenStart.x)+'px;height:'+(screenEnd.y-screenStart.y)+'px;';
		chartDiv.setAttribute('style',style);
	
		var chart;
		var chartName = rtdaDom.getAttribute('chart-name');
		switch (chartName)
		{
			case 'line':
				chart = new RtdaLineChart(rtda,chartDiv,rtdaDom);
				break;
			default:
				break;
		}
		
		rtda.chartObjects.push(chart);
	}
	RtdaCellParser.prototype.parseCycleSlideEin =  function (rtdaDom)
	{
		var obj = new Object();
		obj.tag = rtdaDom.getAttribute('tag');
		obj.type = rtdaDom.nodeName;
		obj.rtda = rtdaDom;
		var gDom = rtdaDom.parentNode;
		//解析幻灯片Item
		//解析<g>子元素
		obj.slideElements = [];
		var size = 0;
		var childNodes = gDom.childNodes;
		for(var i = 0; i < childNodes.length; i++) 
		{
			if(childNodes[i].nodeType == 1 && childNodes[i].nodeName != "rtda:cycleslideein") 
			{
				obj.slideElements.push(childNodes[i]) ;
				size++;
			}
		}
		obj.size = size;
		//rest
		if(rtdaDom.getAttribute('rest') == 'true')
		{
			obj.rest = true;
		}
		else
		{
			obj.rest = false;
		}
		//初始化幻灯片index
		obj.curIndex = 0;
		//解析状态子元素定义
		obj.states = [];
		var childNodes = rtdaDom.childNodes;
		for(var i = 0; i < childNodes.length; i++) 
		{
			if(childNodes[i].nodeType == 1 && childNodes[i].nodeName == "rtda:state") 
			{
				var childDom = childNodes[i];
				//child启用
				if(childDom.getAttribute('used') == "true") 
				{
					var state = childDom.getAttribute('value');
					obj.states.push(state);
				}
			}
		}
		rtda.cycleObjects.push(obj);//动画元素放另外一个专门的数组
		return obj;//要返回，这样才能在解析之后注册tag时将绑定的tag发送到服务端去
	}
	RtdaCellParser.prototype.parseCycleRotateAin = function (rtdaDom)
	{
		var obj = new Object();
		obj.tag = rtdaDom.getAttribute('tag');
		obj.type = rtdaDom.nodeName;
		obj.rtda = rtdaDom;
		obj.svgDom = rtdaDom.parentNode;
		//动画区间数值
		obj.rangMin = rtdaDom.getAttribute('rangmin');
		obj.rangMinType = this.getValueType(obj.rangMin)
		obj.rangMax = rtdaDom.getAttribute('rangmax');
		obj.rangMaxType = this.getValueType(obj.rangMax);
		if(rtdaDom.getAttribute('clockwise') == 'true')
		{
			obj.clockwise = true;
		}
		else
		{
			obj.clockwise = false;
		}
		if(obj.clockwise)
		{
			obj.angle = 0;
		}
		else
		{
			obj.angle = 360;
		}
		if(rtdaDom.getAttribute('rest') == 'true')
		{
			obj.rest = true;
		}
		else
		{
			obj.rest = false;
		}
		
		//计算中心点坐标
		obj.cycleRotateSelfCenter = rtdaDom.getAttribute('cyclerotateselfcenter');
		var svgElement = SVG.adopt(obj.svgDom);
		var bbox = svgElement.bbox();
		
		if(obj.cycleRotateSelfCenter == 'true')
		{
			obj.xCenter = bbox.x + bbox.width/2;
			obj.yCenter = bbox.y + bbox.height/2;
		}
		else
		{
			var xc= Number(rtdaDom.getAttribute('xcenter'));
			var yc = Number(rtdaDom.getAttribute('ycenter'));
			obj.xCenter = bbox.x + xc;
			obj.yCenter = bbox.y + yc;
		}
		rtda.cycleObjects.push(obj);//动画元素放另外一个专门的数组
		return obj;
	}
	RtdaCellParser.prototype.parseCycleRotateEin = function(rtdaDom)
	{
		var obj = new Object();
		obj.tag = rtdaDom.getAttribute('tag');
		obj.type = rtdaDom.nodeName;
		obj.rtda = rtdaDom;
		obj.svgDom = rtdaDom.parentNode;
		if(rtdaDom.getAttribute('clockwise') == 'true')
		{
			obj.clockwise = true;
		}
		else
		{
			obj.clockwise = false;
		}
		if(obj.clockwise)
		{
			obj.angle = 0;
		}
		else
		{
			obj.angle = 360;
		}
		if(rtdaDom.getAttribute('rest') == 'true')
		{
			obj.rest = true;
		}
		else
		{
			obj.rest = false;
		}
		
		//计算中心点坐标
		obj.cycleRotateSelfCenter = rtdaDom.getAttribute('cyclerotateselfcenter');
		var svgElement = SVG.adopt(obj.svgDom);
		var bbox = svgElement.bbox();
		
		if(obj.cycleRotateSelfCenter == 'true')
		{
			obj.xCenter = bbox.x + bbox.width/2;
			obj.yCenter = bbox.y + bbox.height/2;
		}
		else
		{
			var xc= Number(rtdaDom.getAttribute('xcenter'));
			var yc = Number(rtdaDom.getAttribute('ycenter'));
			obj.xCenter = bbox.x + xc;
			obj.yCenter = bbox.y + yc;
		}
		//解析子元素
		obj.states = [];
		var childNodes = rtdaDom.childNodes;
		for(var i = 0; i < childNodes.length; i++) 
		{
			if(childNodes[i].nodeType == 1 && childNodes[i].nodeName == "rtda:state") 
			{
				var childDom = childNodes[i];
				//child启用
				if(childDom.getAttribute('used') == "true") 
				{
					var state = childDom.getAttribute('value');
					obj.states.push(state);
				}
			}
		}
		rtda.cycleObjects.push(obj);//动画元素放另外一个专门的数组
		return obj;//要返回，这样才能在解析之后注册tag时将绑定的tag发送到服务端去
	}
	/**
	 * 填色柱
	 */
	RtdaCellParser.prototype.parseBarGraph = function(rtdaDom)
	{
		var obj = new Object();
		obj.tag = rtdaDom.getAttribute('tag');
		obj.type = rtdaDom.nodeName;
		obj.rtda = rtdaDom;
		obj.svgDom = rtdaDom.parentNode;
		var tagMinStr = rtdaDom.getAttribute('tagmin');
		obj.tagMinType = this.getValueType(tagMinStr)
		var tagMaxStr = rtdaDom.getAttribute('tagmax');
		obj.tagMaxType = this.getValueType(tagMaxStr);
		//背景透明
		var transparentBackground = rtdaDom.getAttribute("transparentbackground");
		obj.isBackgroundTransparent = (transparentBackground == "true");
		//动态bar的填充色
		var foregroundColor = rtdaDom.getAttribute("foregroundcolor");
		if(!foregroundColor == null)
		{
			obj.foregroundColor = "none";
		}
		else
		{
			obj.foregroundColor = foregroundColor;
		}
		
		var gradientForegroundColor = rtdaDom.getAttribute("gradientforegroundcolor");
		if(gradientForegroundColor == null)
		{
			obj.gradientForegroundColor = "none";
		}
		else
		{
			obj.gradientForegroundColor = gradientForegroundColor;
		}
		//无效色
		var invalidColor = rtdaDom.getAttribute("invalidcolor");
		if(invalidColor == null)
		{
			obj.invalidColor = "none";
		}
		else
		{
			obj.invalidColor = invalidColor;
		}
		//方向，默认向上
		var direction = rtdaDom.getAttribute("direction");
		if(invalidColor == null)
		{
			obj.direction = "top";
		}
		else
		{
			obj.direction = direction;
		}	
		//创建动态bar
		var bar = document.createElementNS(rtda.svgNS,"path");
		bar.setAttribute("d", "M 0 0");
		var nextElement = obj.svgDom.nextElementSibling;   //后一个兄弟元素(不包括文本节点以及注释节点)
		
		//如果有后面同级节点，就前插在[后面同级节点]
		if(nextElement)
		{
			obj.svgDom.parentNode.insertBefore(bar,nextElement);
		}
		//没有就加到svg文档结尾
		else
		{
			obj.svgDom.parentNode.appendChild(bar);
		}
		obj.orgBackgroundColor = obj.svgDom.getAttribute("fill");
		obj.path = bar;//bar dom对象
		return obj;
	}
	/**
	 * <rtda:scale>
	 */
	RtdaCellParser.prototype.parseScale = function (rtdaDom) 
	{
		var obj = new Object();
		obj.tag = rtdaDom.getAttribute('tag');
		obj.type = rtdaDom.nodeName;
		obj.rtda = rtdaDom;
		obj.svgDom = rtdaDom.parentNode;
		//解析tagMin和tagMax,判断是什么类型的取值.数字;动态取值
		var tagMinStr = rtdaDom.getAttribute('tagmin');
		obj.tagMinType = this.getValueType(tagMinStr)
		var tagMaxStr = rtdaDom.getAttribute('tagmax');
		obj.tagMaxType = this.getValueType(tagMaxStr);
		return obj;
	}
	/**
	 * <rtda:rotation>
	 */
	RtdaCellParser.prototype.parseRotation = function(rtdaDom) {
		var obj = new Object();
		obj.tag = rtdaDom.getAttribute('tag');
		obj.type = rtdaDom.nodeName;
		obj.rtda = rtdaDom;
		obj.svgDom = rtdaDom.parentNode;
		//解析tagMin和tagMax,判断是什么类型的取值.数字;动态取值
		var tagMinStr = rtdaDom.getAttribute('tagmin');
		obj.tagMinType = this.getValueType(tagMinStr)
		var tagMaxStr = rtdaDom.getAttribute('tagmax');
		obj.tagMaxType = this.getValueType(tagMaxStr);
		return obj;
	};
	/**
	 * <rtda:label>
	 */
	RtdaCellParser.prototype.parseLabel = function(rtdaDom) 
	{
		var obj = new Object();
		obj.type = rtdaDom.nodeName;
		obj.tag = rtdaDom.getAttribute('tag');
		obj.defaultText = rtdaDom.getAttribute('defaulttext');
		obj.invalidText = rtdaDom.getAttribute('invalidtext');
		obj.svgDom = rtdaDom.parentNode;
		//解析子元素
		obj.childs = new Map();
		var childNodes = rtdaDom.childNodes;
		for(var i = 0; i < childNodes.length; i++) 
		{
			//1:元素element/2:属性attr/3:文本text/ 8:注释comments/9:文档document
			if(childNodes[i].nodeType == 1 && childNodes[i].nodeName == "rtda:value") 
			{
				var childDom = childNodes[i];
				//child启用
				if(childDom.getAttribute('used') == "true") 
				{
					var childItem = new Object();
					childItem.value = childDom.getAttribute('value');
					childItem.text = childDom.getAttribute('text');
					obj.childs.set(childItem.value,childItem.text);
				}
			}
		}
		return obj;
	};
	/**
	 * <rtda:measuretext >
	 */
    RtdaCellParser.prototype.parseMeasuretext = function(rtdaDom)
    {
    	var obj = new Object();
		obj.type = rtdaDom.nodeName;
		obj.tag = rtdaDom.getAttribute('tag');
		obj.pattern = rtdaDom.getAttribute('pattern');
		obj.invalidText = rtdaDom.getAttribute('invalidtext');
		obj.svgDom = rtdaDom.parentNode;
		return obj;
    }
	
	/**
	 * <rtda:colorOnMeasure>
	 */
	RtdaCellParser.prototype.parseColorOnMeasure = function(rtdaDom) 
	{
		var obj = new Object();
		obj.tag = rtdaDom.getAttribute('tag');
		obj.type = rtdaDom.nodeName;
		obj.rtda = rtdaDom;
		obj.svgDom = rtdaDom.parentNode;
		//解析tagMin和tagMax,判断是什么类型的取值.数字;动态取值
		var tagMinStr = rtdaDom.getAttribute('tagmin');
		obj.tagMinType = this.getValueType(tagMinStr)
		var tagMaxStr = rtdaDom.getAttribute('tagmax');
		obj.tagMaxType = this.getValueType(tagMaxStr);
		
		//解析子元素<rtda:range>类型,这里遵循W3C标准，用childNodes而不是用children.然后通过nodeType来判断
		obj.ranges = new Array();
		var childNodes = rtdaDom.childNodes;
		for(var i = 0; i < childNodes.length; i++) 
		{
			//1:元素element/2:属性attr/3:文本text/ 8:注释comments/9:文档document
			if(childNodes[i].nodeType == 1 && childNodes[i].nodeName == "rtda:range") 
			{
				var rangeDom = childNodes[i];

				//是否使用该item
				if(rangeDom.getAttribute('used') == "true") 
				{
					var rangeItem = new Object();
					rangeItem.dom = rangeDom;
					obj.ranges.push(rangeItem);
					//解析range,判断rangeItem的min和max是什么类型的取值.1百分比;2数字;3动态取值
					var minStr = rangeDom.getAttribute('min');
					rangeItem.minType = this.getValueType(minStr);
					var maxStr = rangeDom.getAttribute('max');
					rangeItem.maxType = this.getValueType(maxStr);
				}
			}
		}
		return obj;
	};
	
	/**
	 * <rtda:colorOnState>
	 */
	RtdaCellParser.prototype.parseColorOnState = function(rtdaDom) 
	{
		
		var obj = new Object();
		obj.tag = rtdaDom.getAttribute('tag');
		obj.type = rtdaDom.nodeName;
		obj.rtda = rtdaDom;
		obj.svgDom = rtdaDom.parentNode;
		//解析rtda:state
		obj.childs = new Map();
		var childNodes = rtdaDom.childNodes;
		for(var i = 0; i < childNodes.length; i++) 
		{
			//1:元素element/2:属性attr/3:文本text/ 8:注释comments/9:文档document
			if(childNodes[i].nodeType == 1 && childNodes[i].nodeName == "rtda:state") 
			{
				var childDom = childNodes[i];
				//child启用
				if(childDom.getAttribute('used') == "true") 
				{
					
					var childItem = new Object();
					childItem.value = childDom.getAttribute('value');
					childItem.fill = childDom.getAttribute('fill');
					childItem.stroke = childDom.getAttribute('stroke');
					obj.childs.set(childItem.value,childItem);
				}
			}
		}
		return obj;
	}
	//<rtda:translation>
	RtdaCellParser.prototype.parseTranslation = function(rtdaDom) {
		var obj = new Object();
		obj.tag = rtdaDom.getAttribute('tag');
		obj.type = rtdaDom.nodeName;
		obj.rtda = rtdaDom;
		obj.svgDom = rtdaDom.parentNode;
		//解析tagMin和tagMax,判断是什么类型的取值.数字;动态取值
		var tagMinStr = rtdaDom.getAttribute('tagmin');
		obj.tagMinType = this.getValueType(tagMinStr)
		var tagMaxStr = rtdaDom.getAttribute('tagmax');
		obj.tagMaxType = this.getValueType(tagMaxStr);
		return obj;
	};
	
	
	/**
	 * 将rtda对象根据归属的tag分组
	 */
	RtdaCellParser.prototype.groupByTag = function() {
		var obj;
		while (obj = rtdaObjs.pop()) 
		{
			var tag = obj.tag;
			var sameTagCells = map.get(tag);
			if(sameTagCells == null) 
			{
				sameTagCells = new Array();
				map.set(tag, sameTagCells);
			}
			sameTagCells.push(obj);
		}
	};


	/**
	 * 解析最大值 最小值的取值类型,可以是数字、百分比、无限、某个相关tag这4种
	 */
	RtdaCellParser.prototype.getValueType = function (valueStr) 
	{
		if(valueStr == null || valueStr == "") 
		{
			throw "getValueType()参数不能是null或空字符";
		}
		//判断是否是数字
		if(!isNaN(Number(valueStr))) 
		{ 
			return 'number';
		} 
		//判断是否是百分比
		else if(valueStr.charAt(valueStr.length - 1) == '%') 
		{ 
			return 'percent';
		} 
		//无限制
		else if(valueStr == 'infinity') 
		{ 
			return 'infinity';
		} 
		//绑定tag
		else 
		{ 
			if(tags.indexOf(valueStr) == -1)
			{
				tags.push(valueStr);
			}
			return "tag";
		}
	};

	//从script中提取出测点集合
//	RtdaCellParser.prototype.parseTagByScript = function (script) {
//		var begin = 0;
//		var end = 0;
//		var tags = new Array();
//		for (var i = 0; i <= script.lastIndexOf("')");) {
//
//			begin = script.indexOf("tag('", i) + 5;
//			end = script.indexOf("')", begin);
//			var tagName = script.substring(begin, end);
//			tags.push(tagName);
//			i = end + 1;
//		}
//		return tags;
//	};
	/**
	 * 获得分组对象
	 */
	RtdaCellParser.prototype.getMap = function() {
		
		return map;
	}
	/**
	 * 获得画面上所有要注册的tag,包括使能脚本中的相关tag
	 */
	RtdaCellParser.prototype.getTags = function() {
		return tags;
    }
    
};

export default RtdaCellParser;