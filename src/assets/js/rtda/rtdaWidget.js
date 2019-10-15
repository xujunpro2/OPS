import SVG from "svgjs"
import $ from "jquery";
import rtdaUtil from "./rtdaUtil"

function RtdaWidget(rtda) {
	var rtda = rtda;//rtda全局对象，用来取数操作
	RtdaWidget.prototype.parse = function(rtdaDom)
	{
		var widgetName = rtdaDom.getAttribute('widget-name');
		switch(widgetName) 
		{
			case 'flow'://潮流线 
				return this.paserFlow(rtdaDom);
			case 'digitron'://数码管
				return this.paserDigitron(rtdaDom);
			case 'thermometer'://温度计
				return this.parseThermometer(rtdaDom);
			case 'generator'://发电机
				return this.parseGenerator(rtdaDom);
			case 'connector'://刀闸
				return this.parseConnector(rtdaDom);
			case 'breaker'://断路器
				return this.parseBreaker(rtdaDom);
			case 'progress'://环状进度条
				return this.parseProgress(rtdaDom);
			case 'datepicker'://时间选择器
				return this.parseDatepicker(rtdaDom);
			default:
				break;
		}
	}
	/**
	 * 原始的tag值如果需要处理一下
	 */
	RtdaWidget.prototype.getValue = function(rtdaObj)
	{
		switch(rtdaObj.widgetName) 
		{
			case 'breaker'://断路器
				this.getBreakerValue(rtdaObj);
				break;
			case 'progress'://环状进度条
				this.getProgressValue(rtdaObj);
				break;
			default:
				break;
		}
	}
	/**
	 * 普通控件重绘
	 */
	RtdaWidget.prototype.repaint = function(rtdaObj)
	{
		switch(rtdaObj.widgetName) 
		{
			case 'flow'://潮流线
				this.updateFlow(rtdaObj);
				return;
			case 'digitron'://数码管
				this.updateDigitron(rtdaObj);
				return;
			case 'thermometer'://温度计
				this.updateThermometer(rtdaObj)
				break;
			case 'connector'://刀闸
				this.updateConnector(rtdaObj);
				break;
			case 'breaker'://断路器
				this.updateBreaker(rtdaObj);
				break;
			case 'progress'://环状进度条
				this.updateProgress(rtdaObj);
				break;
			default:
				break;
		}
	}
	/**
	 * 动画控件重绘
	 */
	RtdaWidget.prototype.cycleRepaint = function(rtdaObj)
	{
		switch(rtdaObj.widgetName) 
		{
			case 'generator'://发电机
				return this.updateGenerator(rtdaObj);
				break;
			
			default:
				break;
		}
	}
	//潮流线
	RtdaWidget.prototype.paserFlow= function(rtdaDom)
	{
		var obj = new Object();
		obj.tag = rtdaDom.getAttribute('tag');
		obj.type = rtdaDom.nodeName;
		obj.widgetName = rtdaDom.getAttribute('widget-name');
		//解析<path>子元素
		var pathDom = rtdaDom.parentNode;
		obj.path = pathDom;
		//颜色
		obj.fillColor = rtdaDom.getAttribute("fillcolor");
		//invalidColor
		obj.invalidColor = rtdaDom.getAttribute("invalidcolor");
		//width
		obj.width = rtdaDom.getAttribute("width");
		//bgColor 暂时没用到,如果需要，就要动态在path之前增加一个背景path即可
		var bgColor = rtdaDom.getAttribute("bgcolor");
		if(bgColor == null || bgColor.trim() == '')
		{
			obj.bgColor = "none";
		}
		else
		{
			obj.bgColor = bgColor;
		}
		//背景透明,目前都是透明吧
		obj.bgTransparent = rtdaDom.getAttribute("bgtransparent");
		//如果设置背景色并且背景不透明
		if(obj.bgTransparent == 'false' && obj.bgColor != "none")
		{
			var bgPath = pathDom.cloneNode();
			var bgPathSvg = SVG.adopt(bgPath);
			bgPathSvg.style('stroke', obj.bgColor);
			bgPathSvg.style('stroke-dasharray', 0);//不要断开
			//将bgPath放到path前面
			var svgDom = pathDom.parentNode;
			svgDom.insertBefore(bgPath,pathDom);
		}
		//临界值
		obj.criticalValue = Number(rtdaDom.getAttribute("criticalvalue"));
		return obj;
	}
	RtdaWidget.prototype.updateFlow= function (rtdaObj)
	{
		var path = rtdaObj.path;
		var tagValue = rtda.getRtdaValuer().getTagValue(rtdaObj.tag);
		var svgElement = SVG.adopt(path);

		//设置潮流线颜色，因为潮流线path用了style，没有像其他widget那样拆分style，所以要adopt成svg
		if(isNaN(tagValue))
		{
			svgElement.style('stroke', rtdaObj.invalidColor);
			svgElement.style('animation-play-state','paused');//无效值，停止动画
		}
		else
		{
			svgElement.style('stroke', rtdaObj.fillColor);
			//大于临界值，起点到终点
			if(tagValue == rtdaObj.criticalValue)
			{
				svgElement.style('animation-play-state','paused');//临界值，停止动画
			}
			else
			{
				svgElement.style('animation-play-state','running');//有效值，运行动画
				if(tagValue > rtdaObj.criticalValue)
				{
					svgElement.style('animation','flow_forward 0.5s linear infinite');
				}
				else
				{
					svgElement.style('animation','flow_reverse 0.5s linear infinite');
				}
			}
		}
	}
	//数码管
	RtdaWidget.prototype.paserDigitron =function (rtdaDom)
	{
		var obj = new Object();
		obj.tag = rtdaDom.getAttribute('tag');
		obj.type = rtdaDom.nodeName;
		obj.widgetName = rtdaDom.getAttribute('widget-name');
		//位数,当前最多支持6位
		obj.n = parseInt(rtdaDom.getAttribute("number"));
		//初始化二维数组
		obj.digitrons = new Array();
		for(var i=0;i<obj.n;i++)
		{
			obj.digitrons[i] = new Array();
			for(var j=0;j<8;j++)
			{
				obj.digitrons[i][j] = "";
			}
		}
		//数据格式化
		var format = rtdaDom.getAttribute("format");
		obj.format = (format == "" ? "####.00" : format);
		//根据format判断整数位数和小数位数
		var temp = format.split(".");//js对'.'做splite不用像java那样加转义符\\
		obj.integer = temp[0].length;
		obj.decimal =  temp[1].length;
		obj.invalidColor = rtdaDom.getAttribute("invalidcolor");
		obj.actColor = rtdaDom.getAttribute("actcolor");
		//解析码管
		var gDom = rtdaDom.parentNode;
		var childNodes = gDom.childNodes;
		var x = 0;
		for(var i = 0; i < childNodes.length; i++) 
		{
			if(childNodes[i].nodeType == 1 && childNodes[i].nodeName != "rtda:widget") 
			{
				var element = childNodes[i];
				var elementChilds = element.childNodes;
				var y=0;
				for(var j = 0; j < elementChilds.length; j++) 
				{
					if(elementChilds[j].nodeType == 1) 
					{
						obj.digitrons[x][y] = elementChilds[j];
						rtda.resolveStyle(obj.digitrons[x][y]);
						y++;
					}
				}
				x++;
			}
		}
		return obj;
	}
	RtdaWidget.prototype.updateDigitron= function (rtdaObj)
	{
		//每次都清除数码管的数字
		for(var i=0;i<rtdaObj.digitrons.length;i++)
		{
			for(var j=0;j<rtdaObj.digitrons[0].length;j++)
			{
				rtdaObj.digitrons[i][j].setAttribute("fill", rtdaObj.invalidColor);
			}
		}
		var tagValue = rtda.getRtdaValuer().getTagValue(rtdaObj.tag);
		if(!isNaN(tagValue))
		{
			var n=rtdaObj.n;
			var decimal = rtdaObj.decimal;
			//根据小数位数点亮小数点,每组的index==7的就是小数点
			rtdaObj.digitrons[n-decimal-1][7].setAttribute("fill", rtdaObj.actColor);
			//格式化测值
			var valStr = rtdaUtil.formatNumber(tagValue,rtdaObj.format);
			
			//判断当前值是否超过数码管的显示范围
			var valInteger = valStr.split(".")[0].length;
			if(valInteger > rtdaObj.integer)
			{
				this.digitronOverflow(rtdaObj);
			}
			//正常范围内的值
			else
			{
				//将数据的小数点清除了
				valStr = valStr.replace(".", "");
				
				//从最后一个码管数字开始展示，所以index是n-1
				var digitorElementIndex = n-1;
				for(var i = valStr.length-1;i>=0;i--)
				{
					var numberStr = valStr.charAt(i);
					//对应的码管数字
					var paths = rtdaObj.digitrons[digitorElementIndex];
					this.digitronDisplayNumber(paths,numberStr,rtdaObj);
					digitorElementIndex -- ;
				}
			}
		}
	}
	RtdaWidget.prototype.digitronDisplayNumber = function(pathElements,numberStr,rtdaObj)
	{
		switch (numberStr)
		{
			case '0':
				//除了第4个和小数点，其他都亮,小数点都是在数组的最后一个
				for(var i=0;i<pathElements.length-1;i++)
				{
					var path = pathElements[i];
					var id =  path.getAttribute("widget_id");
					if(id == "n4")
					{
						path.setAttribute("fill", rtdaObj.invalidColor);
					}
					else
					{
						path.setAttribute("fill", rtdaObj.actColor);
					}
				}
				break;
			case '1':
				for(var i=0;i<pathElements.length-1;i++)
				{
					var path = pathElements[i];
					var id =  path.getAttribute("widget_id");
					if(id=="n3" || id=="n7")
					{
						path.setAttribute("fill", rtdaObj.actColor);
					}
					else
					{
						path.setAttribute("fill", rtdaObj.invalidColor);
					}
				}
				break;
			case '2':
				for(var i=0;i<pathElements.length-1;i++)
				{
					var path = pathElements[i];
					var id =  path.getAttribute("widget_id");
					if(id=="n1" || id=="n7")
					{
						path.setAttribute("fill", rtdaObj.invalidColor);
					}
					else
					{
						path.setAttribute("fill", rtdaObj.actColor);
					}
				}
				break;
			case '3':
				for(var i=0;i<pathElements.length-1;i++)
				{
					var path = pathElements[i];
					var id =  path.getAttribute("widget_id");
					if(id=="n1" || id=="n5")
					{
						path.setAttribute("fill", rtdaObj.invalidColor);
					}
					else
					{
						path.setAttribute("fill", rtdaObj.actColor);
					}
				}
				break;
			case '4':
				for(var i=0;i<pathElements.length-1;i++)
				{
					var path = pathElements[i];
					var id =  path.getAttribute("widget_id");
					if(id=="n2" || id=="n5" || id=="n6")
					{
						path.setAttribute("fill", rtdaObj.invalidColor);
					}
					else
					{
						path.setAttribute("fill", rtdaObj.actColor);
					}
				}
				break;
			case '5':
				for(var i=0;i<pathElements.length-1;i++)
				{
					var path = pathElements[i];
					var id =  path.getAttribute("widget_id");
					if(id=="n3" || id=="n5")
					{
						path.setAttribute("fill", rtdaObj.invalidColor);
					}
					else
					{
						path.setAttribute("fill", rtdaObj.actColor);
					}
				}
				break;
			case '6':
				for(var i=0;i<pathElements.length-1;i++)
				{
					var path = pathElements[i];
					var id =  path.getAttribute("widget_id");
					if(id=="n3")
					{
						path.setAttribute("fill", rtdaObj.invalidColor);
					}
					else
					{
						path.setAttribute("fill", rtdaObj.actColor);
					}
				}
				break;
			case '7':
				for(var i=0;i<pathElements.length-1;i++)
				{
					var path = pathElements[i];
					var id =  path.getAttribute("widget_id");
					if(id=="n2" || id=="n3" || id=="n7")
					{
						path.setAttribute("fill", rtdaObj.actColor);
					}
					else
					{
						path.setAttribute("fill", rtdaObj.invalidColor);
					}
				}
				break;
			case '8':
				for(var i=0;i<pathElements.length-1;i++)
				{
					var path = pathElements[i];
					path.setAttribute("fill", rtdaObj.actColor);
				}
				break;
			case '9':
				for(var i=0;i<pathElements.length-1;i++)
				{
					var path = pathElements[i];
					var id =  path.getAttribute("widget_id");
					if(id=="n5")
					{
						path.setAttribute("fill", rtdaObj.invalidColor);
					}
					else
					{
						path.setAttribute("fill", rtdaObj.actColor);
					}
				}
				break;
			case '-':
				for(var i=0;i<pathElements.length-1;i++)
				{
					var path = pathElements[i];
					var id =  path.getAttribute("widget_id");
					if(id=="n4")
					{
						path.setAttribute("fill", rtdaObj.actColor);
					}
					else
					{
						path.setAttribute("fill", rtdaObj.invalidColor);
					}
				}
				break;
			default:
				break;
		}
	}
	/**
	 * 数码管溢出处理
	 */
	RtdaWidget.prototype.digitronOverflow = function (rtdaObj)
	{
		for(var i=0;i<rtdaObj.digitrons.length;i++)
		{
			for(var j=0;j<rtdaObj.digitrons[0].length;j++)
			{
				var path = rtdaObj.digitrons[i][j];
				var id =  path.getAttribute("widget_id");
				if(id.equals("n4"))
				{
					path.setAttribute("fill", rtdaObj.actColor);
				}
				else
				{
					path.setAttribute("fill", rtdaObj.invalidColor);
				}
			}
		}
	}
	//温度计
	RtdaWidget.prototype.parseThermometer =function (rtdaDom)
	{
		var obj = new Object();
		obj.tag = rtdaDom.getAttribute('tag');
		obj.type = rtdaDom.nodeName;
		obj.widgetName = rtdaDom.getAttribute('widget-name');
		obj.tagMinValue = -25;
		obj.tagMaxValue = 50;//温度计的数值范围是定死的
		//解析<g>子元素
		var gDom = rtdaDom.parentNode;
		var childNodes = gDom.childNodes;
		for(var i = 0; i < childNodes.length; i++) 
		{
			if(childNodes[i].nodeType == 1 && childNodes[i].nodeName != "rtda:widget") 
			{
				var widgetId = childNodes[i].getAttribute("widget_id");
				if(widgetId == "bar")
				{
					obj.barElement = childNodes[i];
					obj.barElement.setAttribute("opacity", "0");
					break;
				}
			}
		}
		//创建动态bar
		var bar = document.createElementNS(rtda.svgNS,"path");
		bar.setAttribute("d", "M 0 0");
		bar.setAttribute("fill","#c71a1e");
		var nextElement = obj.barElement.nextElementSibling;
		if(nextElement)
		{
			obj.barElement.parentNode.insertBefore(bar,nextElement);
		}
		else
		{
			obj.barElement.parentNode.appendChild(bar);
		}
		obj.path = bar
		return obj;
	}
	RtdaWidget.prototype.updateThermometer= function (rtdaObj)
	{
		var tagValue = rtda.getRtdaValuer().getTagValue(rtdaObj.tag);
		var pathStr = "";
		if(!isNaN(tagValue))
		{
			var tagMinValue = rtdaObj.tagMinValue;
			var tagMaxValue = rtdaObj.tagMaxValue;
			var svgElement = SVG.adopt(rtdaObj.barElement);
			var bbox = svgElement.bbox();
			//创建一个和bar元素一样的rect
			var newBounds = bbox;
			var amplitude = Math.abs(tagMaxValue- tagMinValue);
			var ratio = Math.abs((tagValue - tagMinValue) / amplitude);
			//动态bar是向上的，y height都变化 
			var nowHeight = newBounds.height * ratio;//动态bar的height就是原始bar * 比例
			newBounds.y = newBounds.y + Math.round(newBounds.height - nowHeight); //y是向下的，所以是原始y + (原始高度-现在高度)
			newBounds.height = nowHeight;		
			//根据bounds计算出路径
			var bottom = newBounds.y+newBounds.height;
			var right = newBounds.x+newBounds.width;
			var mSegment = "M "+newBounds.x+" "+newBounds.y;
			var lSegmentBottom = "L "+newBounds.x +" "+bottom;
			var lSegmentRight = "L "+ right +" "+bottom;
			var lSegmentTop = "L "+ right +" "+newBounds.y;
			var zSegment = " Z";
			pathStr = mSegment + lSegmentBottom + lSegmentRight + lSegmentTop +zSegment;
		}
		rtdaObj.path.setAttribute("d",pathStr);//哪怕测值无效，也要重绘bar(pathStr"")
	}
	//发电机
	RtdaWidget.prototype.parseGenerator= function (rtdaDom)
	{
		var obj = new Object();
		obj.tag = rtdaDom.getAttribute('tag');
		obj.type = rtdaDom.nodeName;
		obj.widgetName = rtdaDom.getAttribute('widget-name');
		//解析<g>子元素
		var gDom = rtdaDom.parentNode;
		var childNodes = gDom.childNodes;
		for(var i = 0; i < childNodes.length; i++) 
		{
			if(childNodes[i].nodeType == 1 && childNodes[i].nodeName != "rtda:widget") 
			{
				var widgetId = childNodes[i].getAttribute("widget_id");
				if(widgetId == "generator_path")
				{
					obj.generator_path = childNodes[i];
					break;
				}
			}
		}
		rtda.resolveStyle(obj.generator_path);
		//run 颜色
		obj.runColor = rtdaDom.getAttribute("runcolor");
		//repairColor 颜色
		obj.repairColor = rtdaDom.getAttribute("repaircolor");
		//emptyLoaderColor 颜色
		obj.emptyLoaderColor = rtdaDom.getAttribute("emptyloadercolor");
		//emptyTurnColor 颜色
		obj.emptyTurnColor = rtdaDom.getAttribute("emptyturncolor");
		//transferColor 颜色
		obj.transferColor = rtdaDom.getAttribute("transfercolor");
		//stopColor 颜色
		obj.stopColor = rtdaDom.getAttribute("stopcolor");
		//invalidColor 颜色
		obj.invalidColor = rtdaDom.getAttribute("invalidcolor");
		
		obj.run = rtdaDom.getAttribute("run");
		obj.repair = rtdaDom.getAttribute("repair");
		obj.emptyLoader = rtdaDom.getAttribute("emptyloader");
		obj.emptyTurn = rtdaDom.getAttribute("emptyrurn");
		obj.transfer = rtdaDom.getAttribute("transfer");
		obj.stop = rtdaDom.getAttribute("stop");
		//计算旋转中心点
		var svgElement = SVG.adopt(obj.generator_path);
		var bbox = svgElement.bbox();
		obj.rotateX = bbox.x + bbox.width/2;
		obj.rotateY = bbox.y + bbox.height/2;
		//console.log(obj.rotateX+","+obj.rotateY);
		rtda.cycleObjects.push(obj);//动画元素放另外一个专门的数组
		obj.angle = 0;//旋转角度初始化
		return obj;
	}
	RtdaWidget.prototype.updateGenerator = function (rtdaObj)
	{
		var tagValue = rtda.getRtdaValuer().getTagValue(rtdaObj.tag);
		if(isNaN(tagValue))
		{
			rtdaObj.generator_path.setAttribute("stroke", rtdaObj.invalidColor);
		}
		else
		{
			var color = rtdaObj.invalidColor;
			var running = false;
			//运行
			if(tagValue == rtdaObj.run)
			{
				color = rtdaObj.runColor;
				running = true;
			}
			//检修
			else if(tagValue == rtdaObj.repair)
			{
				color = rtdaObj.repairColor;
			}
			//空载
			else if(tagValue == rtdaObj.emptyLoader)
			{
				color = rtdaObj.emptyLoaderColor;
				running = true;
			}
			//空转
			else if(tagValue == rtdaObj.emptyTurn)
			{
				color = rtdaObj.emptyTurnColor;
				running = true;
			}
			//调相
			else if(tagValue == rtdaObj.transfer)
			{
				color = rtdaObj.transferColor;
				running = true;
			}
			//停
			else if(tagValue == rtdaObj.stop)
			{
				color = rtdaObj.stopColor;
			}
			rtdaObj.generator_path.setAttribute("stroke", color);
			if(running)
			{
				if(rtdaObj.angle>=360)
				{
					rtdaObj.angle = 0;
				}
				rtdaObj.generator_path.setAttribute("transform", "rotate("+rtdaObj.angle+","+rtdaObj.rotateX+" "+rtdaObj.rotateY+")");
				rtdaObj.angle += 10;
			}
			//是否需要恢复到0角度
			else if(rtdaObj.angle != 0)//
			{
				rtdaObj.angle = 0;
				rtdaObj.generator_path.setAttribute("transform", "rotate("+rtdaObj.angle+","+rtdaObj.rotateX+" "+rtdaObj.rotateY+")");
			}
		}
	}
	//刀闸
	RtdaWidget.prototype.parseConnector = function (rtdaDom)
	{
		var obj = new Object();
		obj.tag = rtdaDom.getAttribute('tag');
		obj.type = rtdaDom.nodeName;
		obj.widgetName = rtdaDom.getAttribute('widget-name');
		//解析<g>子元素
		var gDom = rtdaDom.parentNode;
		var childNodes = gDom.childNodes;
		for(var i = 0; i < childNodes.length; i++) 
		{
			if(childNodes[i].nodeType == 1 && childNodes[i].nodeName != "rtda:widget") 
			{
				var widgetId = childNodes[i].getAttribute("widget_id");
				if(widgetId == "connector_circle")
				{
					obj.connector_circle = childNodes[i];
				}
				else if(widgetId == "connector_invalid")
				{
					obj.connector_invalid = childNodes[i];
				}
				else if(widgetId == "connector_v")
				{
					obj.connector_v = childNodes[i];
				}
				else if(widgetId == "connector_h")
				{
					obj.connector_h = childNodes[i];
				}
			}
		}
		rtda.resolveStyle(obj.connector_circle);
		rtda.resolveStyle(obj.connector_invalid);
		rtda.resolveStyle(obj.connector_v);
		rtda.resolveStyle(obj.connector_h);
		//颜色
		var actColor = rtdaDom.getAttribute("actcolor");
		if(actColor == null)
		{
			obj.actColor = "none";
		}
		else
		{
			obj.actColor = actColor;
		}
		//颜色
		var reActColor = rtdaDom.getAttribute("reactcolor");
		if(reActColor == null)
		{
			obj.reActColor = "none";
		}
		else
		{
			obj.reActColor = reActColor;
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
		//方向
		obj.direction = rtdaDom.getAttribute("direction");
		return obj;
	}
	RtdaWidget.prototype.updateConnector = function (rtdaObj)
	{
		var tagValue = rtda.getRtdaValuer().getTagValue(rtdaObj.tag);
		if(isNaN(tagValue))
		{
			rtdaObj.connector_h.setAttribute("visibility", "hidden");
			rtdaObj.connector_v.setAttribute("visibility", "hidden");
			rtdaObj.connector_invalid.setAttribute("visibility", "visible");	
			rtdaObj.connector_circle.setAttribute("stroke", rtdaObj.invalidColor);
			rtdaObj.connector_invalid.setAttribute("stroke", rtdaObj.invalidColor);
		}
		else if(tagValue == "1")
		{
			rtdaObj.connector_invalid.setAttribute("visibility", "hidden");
			rtdaObj.connector_circle.setAttribute("stroke", rtdaObj.actColor);
			//垂直
			if(rtdaObj.direction == "vertical")
			{
				rtdaObj.connector_v.setAttribute("visibility", "visible");
				rtdaObj.connector_h.setAttribute("visibility", "hidden");
				rtdaObj.connector_v.setAttribute("stroke", rtdaObj.actColor);
			}
			if(rtdaObj.direction == "horizontal")
			{
				rtdaObj.connector_v.setAttribute("visibility", "hidden");
				rtdaObj.connector_h.setAttribute("visibility", "visible");
				rtdaObj.connector_h.setAttribute("stroke", rtdaObj.actColor);
			}
		}
		else if(tagValue == "0")
		{
			rtdaObj.connector_invalid.setAttribute("visibility", "hidden");
			rtdaObj.connector_circle.setAttribute("stroke", rtdaObj.reActColor);
			//垂直
			if(rtdaObj.direction == "vertical")
			{
				rtdaObj.connector_h.setAttribute("visibility", "visible");
				rtdaObj.connector_v.setAttribute("visibility", "hidden");
				rtdaObj.connector_h.setAttribute("stroke",rtdaObj.reActColor);
			}
			if(rtdaObj.direction == "horizontal")
			{
				rtdaObj.connector_v.setAttribute("visibility", "visible");
				rtdaObj.connector_h.setAttribute("visibility", "hidden");
				rtdaObj.connector_v.setAttribute("stroke", rtdaObj.reActColor);
			}
		}
	}
	//断路器
	RtdaWidget.prototype.parseBreaker = function (rtdaDom)
	{
		var obj = new Object();
		obj.tag = rtdaDom.getAttribute('tag');
		obj.type = rtdaDom.nodeName;
		obj.widgetName = rtdaDom.getAttribute('widget-name');
		
		var gDom = rtdaDom.parentNode;
		//解析<g>子元素
		var childNodes = gDom.childNodes;
		for(var i = 0; i < childNodes.length; i++) 
		{
			if(childNodes[i].nodeType == 1 && childNodes[i].nodeName != "rtda:widget") 
			{
				var widgetId = childNodes[i].getAttribute("widget_id");
				if(widgetId == "breaker_state")
				{
					obj.stateElement = childNodes[i];
				}
			}
		}
		//stateElement样式是style做的，直接设没用,用svg.js的style函数又怕性能慢，干脆在parse一次性处理好
		rtda.resolveStyle(obj.stateElement);
		//颜色
		var actColor = rtdaDom.getAttribute("actcolor");
		if(actColor == null)
		{
			obj.actColor = "none";
		}
		else
		{
			obj.actColor = actColor;
		}
		//颜色
		var reActColor = rtdaDom.getAttribute("reactcolor");
		if(reActColor == null)
		{
			obj.reActColor = "none";
		}
		else
		{
			obj.reActColor = reActColor;
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
		return obj;
	}
	/**
	 * 断路器的状态量计算图元需要的填充色
	 */
	RtdaWidget.prototype.getBreakerValue = function (rtdaObj)
	{
		var color;
		var tagValue = rtda.getRtdaValuer().getTagValue(rtdaObj.tag);
		
		if(isNaN(tagValue))
		{
			color = rtdaObj.invalidColor;
		}
		else if(tagValue == "1")
		{
			color = rtdaObj.actColor;
		}
		else if(tagValue == "0")
		{
			color = rtdaObj.reActColor;
		}
		
		rtdaObj.color = color;
	}
	RtdaWidget.prototype.updateBreaker = function (rtdaObj)
	{
		rtdaObj.stateElement.setAttribute('fill',rtdaObj.color);
//		svgElement = SVG.adopt(rtdaObj.stateElement);
//		svgElement.style('fill', rtdaObj.color);
	}
	//环状进度条
	RtdaWidget.prototype.parseProgress = function (rtdaDom)
	{
		var obj = new Object();
		obj.tag = rtdaDom.getAttribute('tag');
		obj.type = rtdaDom.nodeName;
		obj.widgetName = rtdaDom.getAttribute('widget-name');
		obj.svgDom = rtdaDom.parentNode;
		//最大最小值，目前只能是数字
		obj.tagMin = Number(rtdaDom.getAttribute("tagmin"));
		obj.tagMax = Number(rtdaDom.getAttribute("tagmax"));
		
		//显示数值还是百分比
		obj.percent = false;
		if(rtdaDom.getAttribute("percent") == 'true')
		{
			obj.percent = true;
		}
		
		//解析<g>子元素
		var childNodes = obj.svgDom.childNodes;
		for(var i = 0; i < childNodes.length; i++) 
		{
			if(childNodes[i].nodeType == 1 && childNodes[i].nodeName != "rtda:widget") 
			{
				var widgetId = childNodes[i].getAttribute("widget_id");
				if(widgetId == "progress_bg")
				{
					obj.bgElement = childNodes[i];
				}
				else if(widgetId == "progress_txt")
				{
					obj.txtElement = childNodes[i];
				}
			}
		}
		
		//因为背景一定是个正圆形，所以只要取rx或ry的任一
		obj.r = Number(obj.bgElement.getAttribute("rx"));
		var cx = Number(obj.bgElement.getAttribute("cx"));
		var cy = Number(obj.bgElement.getAttribute("cy"));
		
		var pathElement = document.createElementNS(rtda.svgNS,"path");
		obj.pathElement = pathElement;
		var nextElement = obj.svgDom.nextElementSibling;   //后一个兄弟元素(不包括文本节点以及注释节点)
		//如果有后面同级节点，就前插在[后面同级节点]
		if(nextElement)
		{
			obj.svgDom.parentNode.insertBefore(pathElement,nextElement);
		}
		//没有就加到svg文档结尾
		else
		{
			obj.svgDom.parentNode.appendChild(pathElement);
		}
		//path移动到和bgElement矩阵一致
		pathElement.setAttribute("transform", "translate("+cx+","+cy+")");
		obj.startStr = "M0 "+(-obj.r)+" ";
		//设置进度条样式
		var fillColor = rtdaDom.getAttribute("fillcolor");
		pathElement.setAttribute("stroke", fillColor);
		pathElement.setAttribute("fill", "none");
		//分解背景ellipse样式
		rtda.resolveStyle(obj.bgElement);
		//背景透明
		if(rtdaDom.getAttribute("bgtransparent") == 'true')
		{
			obj.bgElement.setAttribute("visibility", "hidden");
		}
		else
		{
			obj.bgElement.setAttribute("stroke", rtdaDom.getAttribute("bgcolor"));
		}
		//+2是为了能遮盖住底部背景
		var strokeWidth = Number(obj.bgElement.getAttribute("stroke-width"))+2;
		pathElement.setAttribute("stroke-width", ""+strokeWidth);
		//设置文本色和填充色一致,文本样式是style做的，直接设没用
		rtda.resolveStyle(obj.txtElement);
		obj.txtElement.setAttribute("fill", fillColor);
		return obj;
	}
	/**
	 * 进度条的模拟量测值计算为path以及需要的文字
	 */
	RtdaWidget.prototype.getProgressValue = function(rtdaObj)
	{
		var tagValue = rtda.getRtdaValuer().getTagValue(rtdaObj.tag);
		if(isNaN(tagValue))
		{
			return;
		}
		var txt;
		var r = rtdaObj.r;
		var path = rtdaObj.startStr;
		//圆弧不能画100%,尽量靠近M坐标的X，然后通过Z闭合
		if(tagValue >= rtdaObj.tagMax)
		{
			if(rtdaObj.percent)
			{
				txt = "100%";
			}
			else
			{
				txt = ""+rtdaObj.tagMax;
			}
			path = path +"A"+r+" "+r+" 0 1 1 "+"-0.001"+" "+(-r)+"Z";
		}
		else
		{
			var progress = (tagValue-rtdaObj.tagMin) / (rtdaObj.tagMax - rtdaObj.tagMin);
			if(rtdaObj.percent)
			{
				var progressInt = Math.round(progress*100);
				txt = progressInt+"%";
			}
			else
			{
				txt = ""+tagValue;
			}
			//角度值
			var degrees = (progress * 360);  
			
			// 计算当前角度对应的弧度值
			var rad = degrees* (Math.PI / 180);

			//极坐标转换成直角坐标
			var x = Math.sin(rad) * r;
			var y = -(Math.cos(rad) * r);
			//大于180度时候画大角度弧，小于180度的画小角度弧，(deg > 180) ? 1 : 0
			var lenghty =  degrees > 180 ? 1:0;
			path = path+"A"+r+" "+r+" 0 "+lenghty+" 1 "+x+" "+y;

			rtdaObj.path = path;
			rtdaObj.txt = txt;
		}
		
	}
	RtdaWidget.prototype.updateProgress=function (rtdaObj)
	{
		if(rtdaObj.path)
		{
			rtdaObj.pathElement.setAttribute("d", rtdaObj.path);
			//svg dom转为svg对象
			var txtElement = SVG.adopt(rtdaObj.txtElement);
			//只作文本填充，不需要tspan元素
			txtElement.plain(rtdaObj.txt);
		}
	}

	//时间控件
	RtdaWidget.prototype.parseDatepicker = function (rtdaDom)
	{
		var gElement = rtdaDom.parentNode;
		//解析<g>子元素
		var textElement;
		var childNodes =gElement.childNodes;
		for(var i = 0; i < childNodes.length; i++) 
		{
			if(childNodes[i].nodeType == 1 && childNodes[i].nodeName == "text") 
			{
				var widgetId = childNodes[i].getAttribute("widget_id");
				if(widgetId == "time")
				{
					textElement = childNodes[i];
					break;
				}
			}
		}
		//根据设置生成默认时间
		if(textElement)
		{
			$(textElement).css('cursor','pointer');
			//根据设置解析默认值
			var pre = Number(rtdaDom.getAttribute('pre'));
			var unit = rtdaDom.getAttribute('unit');
			var showHour = rtdaDom.getAttribute('showhour').bool();//common.js中对String的扩展
			var dateFormat = 'yyyy-MM-dd';
			var my97pickerDateFormat = 'yyyy-MM-dd';//和format有点不同，HH和hh，写两个吧
			if(showHour)
			{
				dateFormat = 'yyyy-MM-dd hh:mm';
				my97pickerDateFormat = 'yyyy-MM-dd HH:mm';
			}
			var now = new Date();
			now.setSeconds(0);
			now.setMilliseconds(0);//清除秒和毫秒
			var preTime ;
			if(unit == 'hour')
			{
				now.setMinutes(0); //小时要清零分钟
				preTime = new Date(now.getTime())
				preTime.setHours(preTime.getHours() - pre);
			}
			else if(unit == 'day')
			{
				now.setMinutes(0);//天要清零小时分钟
				now.setHours(0);
				preTime = new Date(now.getTime());
				preTime.setDate(preTime.getDate() - pre);
			}
			else if(unit == 'month')
			{
				now.setMinutes(0);//月要清零日 时 分钟
				now.setHours(0);
				now.setDate(1);//某月1号
				preTime = new Date(now.getTime());
				preTime.setMonth(preTime.getMonth()-pre);
			}
			
			var nowTimeStr = now.format(dateFormat);
			var preTimeStr = preTime.format(dateFormat)
			
			//svg dom转为svg对象
			var svgElement = SVG.adopt(textElement);
			//只作文本填充，不需要tspan元素
			svgElement.plain(preTimeStr+" - "+nowTimeStr);
			//因为这里是解析阶段，echarts还未解析，所以增加一个画面初始化消息
			var id = rtdaDom.getAttribute('id');
			rtda.addInitEvent(rtda.RTDA_Event_TimeChanaged,id,{start:preTime.getTime(),end:now.getTime()});
			textElement.addEventListener('click',function(){
				// var timeChooser = new TimeChooser();
				// timeChooser.newDialog(dateFormat,my97pickerDateFormat,id,textElement);
			});
		}
		
	}
}

export default RtdaWidget;