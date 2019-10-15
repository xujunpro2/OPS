import SVG from "svgjs"
/**
 * 数据处理器,根据tag表达式返回tag的运算结果，如果运算失败，返回null
 */
function RtdaValuer(rtda,widget) {
	var rtda = rtda;
	var widget = widget;

	RtdaValuer.prototype.getValue = function(rtdaObj) {
		var objType = rtdaObj.type;
		//console.log(objType);
		switch(objType) {
			//文本元素
			case 'rtda:label'://状态量文本
			case 'rtda:measuretext'://模拟量文本
				this.getLabelValue(rtdaObj);
				break;
			//模拟量填色
			case 'rtda:coloronmeasure':
				this.getMeasureColorValue(rtdaObj);
				break;
			//状态量填色
			case 'rtda:coloronstate':
				this.getStateColorValue(rtdaObj);
				break;
			//旋转
			case 'rtda:rotation':
				this.getRotationValue(rtdaObj);
				break;
			//移动
			case 'rtda:translation':
				this.getTranslationValue(rtdaObj);
				break;
			//缩放
			case 'rtda:scale':
				this.getScaleValue(rtdaObj);
				break;
			//填色柱
			case 'rtda:bargraph':
				this.getBarGraphValue(rtdaObj);
				break;
			//控件,不是所有控件都要处理，这里将原始tag值变成控件需要的value数据，例如颜色，角度这类的
			case 'rtda:widget':
				widget.getValue(rtdaObj);
				break;
			default:
				break;
		}
	}
	/**
	 * 再断面缓存中取测值，如果没有就返回NaN
	 */
	RtdaValuer.prototype.getTagValue = function(tag)
	{
		var mea = rtda.tagCache.get(tag);
		if(mea != null)
		{
			return mea.value;
		}
		else
		{
			return Number.NaN;
		}
	}
	/**
	 * 取rtda:bargraph标签值
	 */
	RtdaValuer.prototype.getBarGraphValue =function (rtdaObj)
	{
		var tagValue = this.getTagValue(rtdaObj.tag);
		if(!isNaN(tagValue))
		{
			this.getTagMinAndTagMaxValue(rtdaObj);
			if(!isNaN(rtdaObj.tagMinValue) && !isNaN(rtdaObj.tagMaxValue))
			{
				var tagMinValue = rtdaObj.tagMinValue;
				var tagMaxValue = rtdaObj.tagMaxValue;
				var svgElement = SVG.adopt(rtdaObj.svgDom);
				var bbox = svgElement.bbox();
				var newBounds = bbox;
				var ratio = 0, amplitude = Math.abs(tagMaxValue- tagMinValue);
				//防止最大最小值设置的一样
				if (amplitude > 0)
				{
					ratio = Math.abs((tagValue - tagMinValue) / amplitude);
				}
				//X,Width都变化
				if (rtdaObj.direction == "left")
				{
					newBounds.x = Math.round(newBounds.x + newBounds.width * (1 - ratio));
					newBounds.width = Math.round(newBounds.width * ratio);
				} 
				//X,Y不变，width变化
				else if (rtdaObj.direction == "right")
				{
					newBounds.width = Math.round(newBounds.width * ratio);
				} 
				//X,Y不变，height变化
				else if (rtdaObj.direction == "bottom")
				{
					newBounds.height = Math.round(newBounds.height * ratio);	
				} 
				//Y, height变化
				else
				{
					var nowHeight = newBounds.height * ratio;
					newBounds.y = newBounds.y + Math.round(newBounds.height - nowHeight);
					newBounds.height = nowHeight;
				}
				//console.log("barGraph计算结果:"+newBounds.x+","+newBounds.y+","+newBounds.width+","+newBounds.height);
				//根据bounds计算出路径
				var bottom = newBounds.y+newBounds.height;
				var right = newBounds.x+newBounds.width;
				var mSegment = "M "+newBounds.x+" "+newBounds.y;
				var lSegmentBottom = "L "+newBounds.x +" "+bottom;
				var lSegmentRight = "L "+ right +" "+bottom;
				var lSegmentTop = "L "+ right +" "+newBounds.y;
				var zSegment = " Z";
				rtdaObj.pathStr = mSegment + lSegmentBottom + lSegmentRight + lSegmentTop +zSegment;
				//console.log(rtdaObj.pathStr);
			}
		}
	}
	/**
	 * 取rtda:scale标签值
	 */
	RtdaValuer.prototype.getScaleValue = function (rtdaObj) 
	{
		var tagValue = this.getTagValue(rtdaObj.tag);
		if(!isNaN(tagValue))
		{
			this.getTagMinAndTagMaxValue(rtdaObj);
			var tagMin = rtdaObj.tagMinValue;
			var tagMax = rtdaObj.tagMaxValue;
			var xRef = Number(rtdaObj.rtda.getAttribute('xref'));
			var yRef = Number(rtdaObj.rtda.getAttribute('yref'));
			var xCenter = Number(rtdaObj.rtda.getAttribute('xcenter'));
			var yCenter = Number(rtdaObj.rtda.getAttribute('ycenter'));
			rtdaObj.xCenter = xCenter;
			rtdaObj.yCenter = yCenter;
			var xMin = Number(rtdaObj.rtda.getAttribute('xmin'));
			var yMin = Number(rtdaObj.rtda.getAttribute('ymin'));
			var xMax = Number(rtdaObj.rtda.getAttribute('xmax'));
			var yMax = Number(rtdaObj.rtda.getAttribute('ymax'));
			var preserveaspectratio = false;
			var preserveaspectratioStr = rtdaObj.rtda.getAttribute('preserveaspectratio');
			if(preserveaspectratioStr == null || preserveaspectratioStr == 'true') 
			{
				preserveaspectratio = true;
			}
			var directionStr = rtdaObj.rtda.getAttribute('direction');
	
			var sx = 1,
				sy = 1;
			var amplitude = Math.abs(tagMax - tagMin);
			if(amplitude > 0) {
				var reversedX = (xMin - xCenter) > (xMax - xCenter);
				var reversedY = (yMin - yCenter) > (yMax - yCenter);
				var newX, newY;
				if(reversedX) {
					newX = (xMin - xCenter) - tagValue * Math.abs((xMin - xCenter) - (xMax - xCenter)) / amplitude;
				} else {
					newX = tagValue * Math.abs((xMin - xCenter) - (xMax - xCenter)) / amplitude + (xMin - xCenter);
				}
				if(reversedY) {
					newY = (yMin - yCenter) - tagValue * Math.abs((yMin - yCenter) - (yMax - yCenter)) / amplitude;
				} else {
					newY = tagValue * Math.abs((yMin - yCenter) - (yMax - yCenter)) / amplitude + (yMin - yCenter);
				}
				if(directionStr == 'x') {
					sx = newX / (xRef - xCenter);
					if(preserveaspectratio) {
						sy = sx;
					}
				} else if(directionStr == 'y') {
					sy = newY / (yRef - yCenter);
					if(preserveaspectratio) {
						sx = sy;
					}
				} else if(directionStr == 'xy') {
					sx = newX / (xRef - xCenter);
					if(preserveaspectratio) {
						sy = sx;
					} else {
						sy = newY / (yRef - yCenter);
					}
				}
	
			}
			rtdaObj.sx = sx;
			rtdaObj.sy = sy;
		}
	}
	/**
	 * 取rtda:rotation标签值
	 */
	RtdaValuer.prototype.getRotationValue = function (rtdaObj) 
	{
		var tagValue = this.getTagValue(rtdaObj.tag);
		if(!isNaN(tagValue))
		{
			this.getTagMinAndTagMaxValue(rtdaObj);
			var tagMin = rtdaObj.tagMinValue;
			var tagMax = rtdaObj.tagMaxValue;
			if(isNaN(tagMin) || isNaN(tagMax))
			{
				return;
			}
			
			var xRef = Number(rtdaObj.rtda.getAttribute('xref'));
			var yRef = Number(rtdaObj.rtda.getAttribute('yref'));
			var xCenter = Number(rtdaObj.rtda.getAttribute('xcenter'));
			var yCenter = Number(rtdaObj.rtda.getAttribute('ycenter'));
			rtdaObj.xCenter = xCenter;
			rtdaObj.yCenter = yCenter;
			var xMin = Number(rtdaObj.rtda.getAttribute('xmin'));
			var yMin = Number(rtdaObj.rtda.getAttribute('ymin'));
			var xMax = Number(rtdaObj.rtda.getAttribute('xmax'));
			var yMax = Number(rtdaObj.rtda.getAttribute('ymax'));
			var clockwise = false;
			var clockwiseStr = rtdaObj.rtda.getAttribute('clockwise');
			if(clockwiseStr == null || clockwiseStr == 'true') {
				clockwise = true;
			}
			var currentAngle = 0;
			var refAngle = 0,minAngle = 0,maxAngle = 0;
			//refAngle
			refAngle = Math.acos((xRef - xCenter) / Math.sqrt(Math.pow(xRef - xCenter, 2) + Math.pow(yRef - yCenter, 2)));
			if(yRef > yCenter) 
			{
				refAngle = 2 * Math.PI - refAngle;
			}
			//minAngle
			minAngle = Math.acos((xMin - xCenter) / Math.sqrt(Math.pow(xMin - xCenter, 2) + Math.pow(yMin - yCenter, 2)));
			if(yMin > yCenter) 
			{
				minAngle = 2 * Math.PI - minAngle;
			}
			minAngle -= refAngle;
			if(minAngle < 0) 
			{
				minAngle = 2 * Math.PI + minAngle;
			}
			//maxAngle
			maxAngle = Math.acos((xMax - xCenter) / Math.sqrt(Math.pow(xMax - xCenter, 2) + Math.pow(yMax - yCenter, 2)));
			if(yMax > yCenter) 
			{
				maxAngle = 2 * Math.PI - maxAngle;
			}
			maxAngle -= refAngle;
			if(maxAngle < 0) 
			{
				maxAngle = 2 * Math.PI + maxAngle;
			}
			var ratio = 0,
			amplitude = Math.abs(tagMax - tagMin);
	
			if(amplitude > 0) 
			{
				ratio = Math.abs((tagValue-tagMin) / amplitude);
				if(clockwise) 
				{
					if(minAngle < maxAngle) 
					{
						currentAngle = -(minAngle - ratio * (minAngle - (maxAngle - 2 * Math.PI)));
					} 
					else if(minAngle > maxAngle) 
					{
						currentAngle = -(minAngle - ratio * (minAngle - maxAngle));
					} 
					else 
					{
						currentAngle = -(-2 * Math.PI * ratio + minAngle);
					}
				} 
				else 
				{
					if(minAngle < maxAngle) 
					{
						currentAngle = -(ratio * (maxAngle - minAngle) + minAngle);
					} 
					else if(minAngle > maxAngle) 
					{
						currentAngle = -(ratio * (maxAngle - (minAngle - 2 * Math.PI)) + (minAngle - 2 * Math.PI));
					} 
					else 
					{
						currentAngle = -(2 * Math.PI * ratio + minAngle);
					}
				}
			}
			var angle = currentAngle / Math.PI * 180;
			rtdaObj.angle = angle;
		}
	}
	
	/**
	 * 取rtda:translation标签值
	 */
	RtdaValuer.prototype.getTranslationValue = function (rtdaObj) 
	{
		var tagValue = this.getTagValue(rtdaObj.tag);
		if(!isNaN(tagValue))
		{
			this.getTagMinAndTagMaxValue(rtdaObj);
			var tagMin = rtdaObj.tagMinValue;
			var tagMax = rtdaObj.tagMaxValue;
			if(!isNaN(tagMin) && !isNaN(tagMax))
			{
				var xRef = Number(rtdaObj.rtda.getAttribute('xref'));
				var yRef = Number(rtdaObj.rtda.getAttribute('yref'));
				var xMin = Number(rtdaObj.rtda.getAttribute('xmin'));
				var yMin = Number(rtdaObj.rtda.getAttribute('ymin'));
				var xMax = Number(rtdaObj.rtda.getAttribute('xmax'));
				var yMax = Number(rtdaObj.rtda.getAttribute('ymax'));
				var directionStr = rtdaObj.rtda.getAttribute('direction');
		
				var tx = 0,ty = 0;
				var minTranslationX = xMin - xRef;
				var minTranslationY = yMin - yRef;
				var maxTranslationX = xMax - xRef;
				var maxTranslationY = yMax - yRef;
				var ratio = 0,
					amplitude = Math.abs(tagMax - tagMin);
				if(amplitude > 0) 
				{
					
					var newTranslationX = 0;
					var newTranslationY = 0;
					ratio = Math.abs(tagValue / amplitude);
					newTranslationX = (maxTranslationX - minTranslationX) * ratio + minTranslationX;
					newTranslationY = (maxTranslationY - minTranslationY) * ratio + minTranslationY;
					if(directionStr == 'x') 
					{
						newTranslationY = 0;
					} 
					else if(directionStr == 'y') 
					{
						newTranslationX = 0;
					}
					tx = newTranslationX;
					ty = newTranslationY;
				}
				rtdaObj.tx = tx;
				rtdaObj.ty = ty;	
			}
		}
	};
	
	
	/**
	 * 取rtda:colorOnMeasure标签值
	 */
	RtdaValuer.prototype.getMeasureColorValue = function (rtdaObj) 
	{
		var tag = rtdaObj.tag;
		rtdaObj.tagValue = this.getTagValue(tag);
		if(!isNaN(rtdaObj.tagValue))
		{
			//tagMin和tagMax
			this.getTagMinAndTagMaxValue(rtdaObj);
			//rangs的min和max值
			this.getRangesMinAndMaxValue(rtdaObj);
		}
	};
	/**
	 * 取rtda:colorOnState标签值
	 */
	RtdaValuer.prototype.getStateColorValue = function (rtdaObj) 
	{
		var tag = rtdaObj.tag;
		rtdaObj.mea = rtda.tagCache.get(tag);
	};
	/**
	 * 取rtda:label标签值
	 */
	RtdaValuer.prototype.getLabelValue = function (rtdaObj) 
	{
		var tag = rtdaObj.tag;
		rtdaObj.mea = rtda.tagCache.get(tag);
	}

	
	
	/**
	 * 获得rtda设置中的tagMin和tagMax数值
	 */
	RtdaValuer.prototype.getTagMinAndTagMaxValue=function (tagObj) 
	{
		//tagMin和tagMax
		var tagMinStr = tagObj.rtda.getAttribute('tagmin');
		var tagMinType = tagObj.tagMinType;
		
		if(tagMinType == 'number') 
		{
			tagObj.tagMinValue = Number(tagMinStr);
		} 
		else if(tagMinType == 'tag') 
		{
			tagObj.tagMinValue = this.getTagValue(tagMinStr);
		}
		var tagMaxStr = tagObj.rtda.getAttribute('tagmax');
		var tagMaxType = tagObj.tagMaxType;
		if(tagMaxType == 'number') 
		{
			tagObj.tagMaxValue = Number(tagMaxStr);
		} 
		else if(tagMaxType == 'tag') 
		{
			tagObj.tagMaxValue = this.getTagValue(tagMaxStr);
		}
	}
	RtdaValuer.prototype.getRangesMinAndMaxValue =function (rtdaObj)
	{
		//取range的min或者max
		for(var i = 0; i < rtdaObj.ranges.length; i++) 
		{
			var rangeItem = rtdaObj.ranges[i];
			var rangeMinType = rangeItem.minType;
			switch(rangeMinType) 
			{
				case 'number':
					rangeItem.minValue = Number(rangeItem.dom.getAttribute('min'));
					rangeItem.maxValue = Number(rangeItem.dom.getAttribute('max'));
					break;
				case 'percent':
					rangeItem.minValue = rtdaObj.tagMaxValue * this.percentToNumber(rangeItem.dom.getAttribute('min'));
					rangeItem.maxValue = rtdaObj.tagMaxValue * this.percentToNumber(rangeItem.dom.getAttribute('max'));
					break;
				case 'tag':
					rangeItem.minValue = this.getTagValue(rangeItem.dom.getAttribute('min'));
					rangeItem.maxValue = this.getTagValue(rangeItem.dom.getAttribute('max'));
					break;
				default:
					rangeItem.minValue = null;
					rangeItem.maxValue = null;
					console.error('<rtda:range>的min和max没有对应的值类型');
					break;
			}
		}
	}
	//百分比字符转数字
	RtdaValuer.prototype.percentToNumber =function (percentStr) 
	{
		return Number(percentStr.replace('%', '')) / 100;
	}



	
	//转义符解析
//	var escapeChart = new HashMap();
//	escapeChart.put('&apos;', '\'');
//	escapeChart.put('&quot;', '\"');
//	escapeChart.put('&lt;', '\<');
//	escapeChart.put('&gt;', '\>');
//	escapeChart.put('&amp;', '\&');
//	//现在的结构已经不需要在作脚本转义处理了
//	function escaped(script, map) {
//		var keySet = map.keySet();
//		for(var i in keySet) {
//			var escapeKey = keySet[i];
//			var escapeValue = map.get(escapeKey);
//			script = script.replace(new RegExp(escapeKey, 'gm'), escapeValue);
//		}
//		return script;
//	}

};

export default RtdaValuer;