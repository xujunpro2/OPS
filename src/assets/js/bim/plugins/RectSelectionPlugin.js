function RectSelectionPlugin(onSelected) {
	this.name = "rectSelection";
	this._onMouseUp = onSelected;
}

RectSelectionPlugin.prototype.init = function(xviewer) {
	this.viewer = xviewer;
}

RectSelectionPlugin.prototype.enableSelection = function() {
	if(!document.getElementById('mulitSelection')) {
		//构件一个覆盖层的div的dom，可以复用
		var canvasBound = this.viewer._canvas.getBoundingClientRect();
		var left = canvasBound.left;
		var top = canvasBound.top;
		var width = canvasBound.width;
		var height = canvasBound.height;
		var overlayDivStr = '<div id="mulitSelection" style="position: absolute;left: ' + left + 'px;top: ' + top + 'px;width: ' + width + 'px;height: ' + height + 'px;background: rgba(255,255,255,0);"></div>'
		this.overlayDiv = this._createDom(overlayDivStr);
		document.body.appendChild(this.overlayDiv);

		this.isDraw = false;
		this.isMouseUp = true;
		this.currentDrawRectangle = null;
		this.debug = false;

		this.bindListener();
	}

}
RectSelectionPlugin.prototype.bindListener = function() {
	document.body.onmousemove = this.dragSize.bind(this);
	document.body.onmouseup = this.onMouseUp.bind(this);
	document.body.onmouseout = this.onMouseOut.bind(this);
	document.body.onmouseover = this.onMouseOver.bind(this);
	document.body.onmousedown = this.drawLayer.bind(this);
	document.body.onmouseup = this.onMouseUp.bind(this);
}
RectSelectionPlugin.prototype.unbindListener = function() {
	document.body.onmousemove = null;
	document.body.onmouseup = null;
	document.body.onmouseout = null;
	document.body.onmouseover = null;
	document.body.onmousedown = null;
	document.body.onmouseup = null;
}
RectSelectionPlugin.prototype.drawLayer = function() {
	if(event.srcElement.id !== "mulitSelection") {
		return;
	}

	this.isDraw = true;
	this.ismouseup = false;

	var pos = this.getSourcePos();

	var x = event.offsetX;
	var y = event.offsetY;

	var top = y + pos.top;
	var left = x + pos.left;

	var d = document.createElement("div");
	document.body.appendChild(d);
	d.style.border = "1px solid #ff0000";
	d.style.background = "#ff0000";
	d.style.width = 0;
	d.style.height = 0;
	d.style.overflow = "hidden";

	d.style.position = "absolute";
	d.style.left = left + "px";
	d.style.top = top + "px";
	d.style.opacity = 0.4;
	d.style.zIndex = 1001;
	this.currentDrawRectangle = d;

	this.RectangleDiv = {
		left: left,
		top: top,
		el: d
	};
}
RectSelectionPlugin.prototype.dragSize = function() {
	if(this.isDraw && this.RectangleDiv) {
		if(event.srcElement.id !== "mulitSelection")
            return false;
		var pos = this.getSourcePos();
		var img_x = pos.left;
		var img_y = pos.top;
		var x = event.offsetX;
        var y = event.offsetY;
		var drawW = (x + img_x) - this.RectangleDiv.left;
        var drawH = (y + img_y) - this.RectangleDiv.top;
		this.currentDrawRectangle.style.width = (drawW > 0 ? drawW : -drawW) + "px";
		this.currentDrawRectangle.style.height = (drawH > 0 ? drawH : -drawH) + "px";
		if(drawW < 0) {
			this.currentDrawRectangle.style.left = (x + img_x) + "px";
		}
		if(drawH < 0) {
			this.currentDrawRectangle.style.top = (y + img_y) + "px";
		}
		//记录下数据
		this.data = {
			endX: x,
			endY: y,
			width: drawW,
			height: drawH
		}

		if(this.debug) {
			this.currentDrawRectangle.innerHTML = "<div class='innerbg'>x:" + x + ",y:" + y +
				". img_x:" +
				img_x +
				",img_y:" +
				img_y +
				". drawW:" +
				drawW +
				",drawH:" +
				drawH +
				".  Dleft[i]:" +
				this.RectangleDiv.left +
				",Dtop[i]:" +
				this.RectangleDiv.top +
				".</div>";
		}

    } 
    else 
    {
		return false;
	}
}
RectSelectionPlugin.prototype.stopDraw = function() {
	this.isDraw = false;
}
RectSelectionPlugin.prototype.onMouseOut = function() {
	if(!this.isMouseUp) {
		this.isDraw = false;
	}
}

RectSelectionPlugin.prototype.onMouseUp = function() {
	this.isDraw = false;
	this.isMouseUp = true;
	this.rect = {};
	if(this.data.width < 0) {
		this.rect.x = this.data.endX;
		this.rect.width = Math.abs(this.data.width);
	} else {
		this.rect.x = this.data.endX - this.data.width;
		this.rect.width = this.data.width;
	}
	if(this.data.height < 0) {
		this.rect.y = this.data.endY;
		this.rect.height = Math.abs(this.data.height);
	} else {
		this.rect.y = this.data.endY - this.data.height;
		this.rect.height = this.data.height;
	}
	if(this._onMouseUp) 
	{
		var canvasBound = this.viewer._canvas.getBoundingClientRect();
		var left = canvasBound.left;
		var top = canvasBound.top;
		var width = canvasBound.width;
		var height = canvasBound.height;
		this.rect.y = height - (this.rect.y+this.rect.height);
		var ids = this.viewer.rectSelection(this.rect.x,this.rect.y,this.rect.width,this.rect.height);
		this._onMouseUp.call(this, ids);
	}
	this.RectangleDiv = null;
	this.unbindListener();
	
	if(this.currentDrawRectangle) {
		document.body.removeChild(this.currentDrawRectangle);
		this.currentDrawRectangle = null;
	}
	if(this.overlayDiv)
	{
		document.body.removeChild(this.overlayDiv);
		this.overlayDiv = null;
	}
}
RectSelectionPlugin.prototype.onMouseOver = function() {
	if(!this.isMouseUp) {
		this.isDraw = true;
	}
}
RectSelectionPlugin.prototype._createDom = function(domStr) {
	var tempNode = document.createElement('div');
	tempNode.innerHTML = domStr;
	return tempNode.firstChild;
}
RectSelectionPlugin.prototype.getSourcePos = function() {
	return this.getAbsolutePosition(this.overlayDiv);
}
RectSelectionPlugin.prototype.getAbsolutePosition = function(obj) {
	var t = obj.offsetTop;
	var l = obj.offsetLeft;
	var w = obj.offsetWidth;
	var h = obj.offsetHeight;

	while(obj = obj.offsetParent) {
		t += obj.offsetTop;
		l += obj.offsetLeft;
	}

	return {
		top: t,
		left: l,
		width: w,
		height: h
	};
}
//js本身没有insertAfter方法，写一个
RectSelectionPlugin.prototype._insertAfter = function(newDom, targetDom) {
	var parentDom = targetDom.parentNode;
	if(parentDom.lastChild == targetDom) {
		parentDom.appendChild(newDom);
	} else {
		parentDom.insertBefore(newDom, targetDom.nextSibling);
	}
}

RectSelectionPlugin.prototype.onLoaded = function(event) {

}
RectSelectionPlugin.prototype.onBeforeDraw = function() {
	//	console.info("plugin onBeforeDraw")
};

RectSelectionPlugin.prototype.onBeforePick = function(id) {}

RectSelectionPlugin.prototype.onAfterDraw = function() {

}

RectSelectionPlugin.prototype.onBeforeDrawId = function() {};

RectSelectionPlugin.prototype.onAfterDrawId = function() {};
RectSelectionPlugin.prototype.onBeforeGetId = function(id) {}
RectSelectionPlugin.prototype.draw = function() {}

export default RectSelectionPlugin