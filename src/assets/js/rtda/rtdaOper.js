import SVG from "svgjs"
import rtdaUtil from "./rtdaUtil"

/**
 * 图元设置器
 */
function RtdaOperator(widget) 
{
	var widget = widget;
	RtdaOperator.prototype.repaintSVG = function(rtdaObj) {
		var type = rtdaObj.type;
		switch (type) {
			//状态量文本
			case 'rtda:label':
				this.repaintLabel(rtdaObj);
				break;
			//模拟量文本
			case 'rtda:measuretext':
				this.repaintMeasureText(rtdaObj);
				break;
			//模拟量变色
			case 'rtda:coloronmeasure':
				this.repaintColorOnMeasure(rtdaObj);
				break;
			//状态量变色
			case 'rtda:coloronstate':
				this.repaintColorOnState(rtdaObj);
				break;
			//旋转
			case 'rtda:rotation':
				this.repaintRotation(rtdaObj);
				break;
			//位移
			case 'rtda:translation':
				this.repaintTranslation(rtdaObj);
				break;
			//缩放
			case 'rtda:scale':
				this.repaintScale(rtdaObj);
				break;
			//色柱
			case 'rtda:bargraph':
				this.repaintBarGraph(rtdaObj);
				break;
			//控件
			case 'rtda:widget':
				widget.repaint(rtdaObj);
				break;
			default:
				break;
		}
	};
	RtdaOperator.prototype.repaintBarGraph= function (rtdaObj)
	{
		var path = rtdaObj.path;
		var pathStr = "";//不管测值是否有效，都要重绘bar
		//pathStr是在有效值情况下计算出来的
		if(rtdaObj.pathStr)
		{
			//设置颜色
			//先填上原始色，如果背景透明也看不到
			if(rtdaObj.isBackgroundTransparent)
			{
				rtdaObj.svgDom.setAttribute("opacity", "0");
			}
			else
			{
				rtdaObj.svgDom.setAttribute("fill", rtdaObj.orgBackgroundColor);
			}
			//没有定义渐变填充
			if(rtdaObj.gradientForegroundColor == "none")
			{
				rtdaObj.path.setAttribute("fill",rtdaObj.foregroundColor);
			}
			else
			{
				rtdaObj.path.setAttribute("fill","url(#"+rtdaObj.gradientForegroundColor+")");
			}
			pathStr = rtdaObj.pathStr;	
		}
		//无效值
		else
		{
			//设置了无效颜色
			if(rtdaObj.invalidColor != "none")
			{
				//如果设置了背景透明，这里要恢复，否则看不到invalidateColor
				if(rtdaObj.isBackgroundTransparent)
				{
					rtdaObj.svgDom.setAttribute("opacity", "100");
				}
				rtdaObj.svgDom.setAttribute("fill", invalidColor);
			}
		}
		path.setAttribute("d",pathStr);//哪怕测值无效，也要重绘bar(pathStr"")
	}
	/**
	 * 缩放
	 */
	RtdaOperator.prototype.repaintScale=function (rtdaObj)
	{
		var xCenter = rtdaObj.xCenter;
		var yCenter = rtdaObj.yCenter;
		var sx = rtdaObj.sx;
		var sy = rtdaObj.sy;
		if( !isNaN(xCenter) && !isNaN(yCenter) && !isNaN(sx) && !isNaN(sy) )
		{
			var svgElement = SVG.adopt(rtdaObj.svgDom);
			var bbox = svgElement.bbox();
			var xAbsoluteCenter = xCenter + bbox.x;
			var yAbsoluteCenter = yCenter + bbox.y;
			svgElement.scale(sx,sy,xAbsoluteCenter,yAbsoluteCenter);
		}	
	}

	
	/**
	 * 移动
	 */
	RtdaOperator.prototype.repaintTranslation=function (rtdaObj) 
	{
		var tx = rtdaObj.tx;
		var ty = rtdaObj.ty;
		if(!isNaN(tx) && !isNaN(ty))
		{
			var svgElement = SVG.adopt(rtdaObj.svgDom);
			svgElement.translate(tx,ty);
		}
	};

	RtdaOperator.prototype.repaintRotation=function (rtdaObj) 
	{
		//只有angle算出来才表示取值一切正常
		if(!isNaN(rtdaObj.angle))
		{
			var xCenter = rtdaObj.xCenter;
			var yCenter = rtdaObj.yCenter;
			var angle = rtdaObj.angle;
			var svgElement = SVG.adopt(rtdaObj.svgDom);
			var bbox = svgElement.bbox();
			var xAbsoluteCenter = xCenter + bbox.x;
			var yAbsoluteCenter = yCenter + bbox.y;
			svgElement.rotate(angle, xAbsoluteCenter, yAbsoluteCenter);
		}
		
	}
	RtdaOperator.prototype.repaintColorOnState =function (rtdaObj)
	{
		
		var stroke = rtdaObj.rtda.getAttribute('defaultvaluestroke');
		var fill = rtdaObj.rtda.getAttribute('defaultvaluefill');
		
		var mea = rtdaObj.mea;
		//取值异常
		if (mea == null) 
		{
			stroke = rtdaObj.rtda.getAttribute('invalidvaluestroke');
			fill = rtdaObj.rtda.getAttribute('invalidvaluefill');
		}
		else
		{
			
			var stateItem = rtdaObj.childs.get(mea.value);
			if(stateItem)
			{
				stroke = stateItem.stroke;
				fill = stateItem.fill;
			}
		}
		//如果stroke和fill都不是null
		if (stroke && fill) 
		{
			var controlElements = [];
			var parentElementName = rtdaObj.svgDom.nodeName;
			//父元素是<g>，那么要逐个设置子元素
			if(parentElementName.toLowerCase() == "g")
			{
				var childNodes = rtdaObj.svgDom.childNodes;
				for(var i = 0; i < childNodes.length; i++) 
				{
					if(childNodes[i].nodeType == 1 && !childNodes[i].nodeName.startsWith('rtda')) 
					{
						controlElements.push(childNodes[i]);
					}
				}
			}
			else
			{
				controlElements.push(rtdaObj.svgDom);
			}
			
			var svgElement;
			if (stroke != null && stroke != "none") 
			{
				for(var i=0;i<controlElements.length;i++)
				{
					svgElement = SVG.adopt(controlElements[i]);
					svgElement.style('stroke', stroke);
				}
			}
			if (fill != null && fill != "none") 
			{
				for(var i=0;i<controlElements.length;i++)
				{
					svgElement = SVG.adopt(controlElements[i]);
					svgElement.style('fill', fill);
				}
				
			}
		}
	}
	RtdaOperator.prototype.repaintColorOnMeasure =function (rtdaObj) 
	{
		var stroke = rtdaObj.rtda.getAttribute('defaultValueStroke');
		var fill = rtdaObj.rtda.getAttribute('defaultValueFill');
		//验证当前值是否越限
		var tagValue = rtdaObj.tagValue;
		var tagMinValue = rtdaObj.tagMinValue;
		var tagMaxValue = rtdaObj.tagMaxValue;
		
		//取值异常
		if (isNaN(tagValue) || isNaN(tagMinValue) || isNaN(tagMaxValue)) 
		{
			stroke = rtdaObj.rtda.getAttribute('invalidvaluestroke');
			fill = rtdaObj.rtda.getAttribute('invalidvaluefill');
		}
		//越限
		else if (tagValue < tagMinValue || tagValue > tagMaxValue) 
		{
			stroke = rtdaObj.rtda.getAttribute('outofrangestroke');
			fill = rtdaObj.rtda.getAttribute('outofrangefill');
		}
		//正常处理
		else 
		{
			for (var i = 0; i < rtdaObj.ranges.length; i++) 
			{
				var rangeItem = rtdaObj.ranges[i];
				var rangeMinValue = rangeItem.minValue;
				var rangeMaxValue = rangeItem.maxValue;
				var in1 = false;
				var in2 = false;
				if (rangeItem.dom.getAttribute('equal1') == 'true') 
				{
					in1 = (tagValue >= rangeMinValue);
				} 
				else
				{
					in1 = (tagValue > rangeMinValue);
				}
				if (rangeItem.dom.getAttribute('equal2') == 'true') 
				{
					in2 = (tagValue <= rangeMaxValue);
				} 
				else 
				{
					in2 = (tagValue < rangeMaxValue);
				}
				if (in1 && in2) 
				{
					stroke = rangeItem.dom.getAttribute('stroke');
					fill = rangeItem.dom.getAttribute('fill');
					break;
				}
			}
		}
		var controlElements = [];
		var parentElementName = rtdaObj.svgDom.nodeName;
		//父元素是<g>，那么要逐个设置子元素
		if(parentElementName.toLowerCase() == "g")
		{
			var childNodes = rtdaObj.svgDom.childNodes;
			for(var i = 0; i < childNodes.length; i++) 
			{
				if(childNodes[i].nodeType == 1 && !childNodes[i].nodeName.startsWith('rtda')) 
				{
					controlElements.push(childNodes[i]);
				}
			}
		}
		else
		{
			controlElements.push(rtdaObj.svgDom);
		}
			
		var svgElement;
		if (stroke!= null && stroke != "none") 
		{
			for(var i=0;i<controlElements.length;i++)
			{
				svgElement = SVG.adopt(controlElements[i]);
				svgElement.style('stroke', stroke);
			}
		}
		if (fill!= null && fill != "none") 
		{
			for(var i=0;i<controlElements.length;i++)
			{
				svgElement = SVG.adopt(controlElements[i]);
				svgElement.style('fill', fill);
			}	
		}
	}
	
	RtdaOperator.prototype.repaintMeasureText =function (rtdaObj)
	{
		var labelStr = null;
		var mea = rtdaObj.mea;
		var svgDom = rtdaObj.svgDom;
		//无效
		if (mea == null) 
		{
			if (rtdaObj.invalidText!= null && rtdaObj.invalidText != "") 
			{
				labelStr = rtdaObj.invalidText;
			}
		}
		else if(mea.value)
		{
			if(rtdaObj.pattern)
			{
				labelStr = rtdaUtil.formatNumber(mea.value,rtdaObj.pattern);
			}
			else
			{
				labelStr = mea.value;
			}
		}
		//找到可以显示的文本了
		if(labelStr)
		{
			//svg dom转为svg对象
			var svgElement = SVG.adopt(svgDom);
			//只作文本填充，不需要tspan元素
			svgElement.plain(labelStr);
		}
	}
	/**
	 * 设置状态量文本
	 */
	RtdaOperator.prototype.repaintLabel =function (rtdaObj) 
	{
		var labelStr = null;
		//默认值
		if(rtdaObj.defaultText != null && rtdaObj.defaultText != "")
		{
			labelStr = rtdaObj.defaultText;
		}
		var mea = rtdaObj.mea;
		var svgDom = rtdaObj.svgDom;
		//无效
		if (mea == null) 
		{
			if (rtdaObj.invalidText != null && rtdaObj.invalidText != "") 
			{
				labelStr = rtdaObj.invalidText;
			}
		}
		else
		{
			labelStr = rtdaObj.childs.get(mea.value);
		}
		//找到可以显示的文本了
		if(labelStr)
		{
			//svg dom转为svg对象
			var svgElement = SVG.adopt(svgDom);
			//只作文本填充，不需要tspan元素
			svgElement.plain(labelStr);
		}
	}
};
export default RtdaOperator;