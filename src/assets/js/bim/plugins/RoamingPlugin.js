function RoamingPlugin(option){
	this.name = "roaming";
	this.directionSpeed = 1;//上下左右键盘移动速度
	this.zoomSpeed = 1;//前进后退键盘移动速度
	this.rotateSpeed = 1;//镜头左右旋转
	if(option && option.speed)
	{
		this.directionSpeed = option.speed.direction;
		this.zoomSpeed = option.speed.zoom;
		this.rotateSpeed = option.speed.rotate;
	}
}

RoamingPlugin.prototype.init=function (xviewer) {
	this.viewer = xviewer;
	//构件一个覆盖层的div的dom，可以复用
	var canvasBound = this.viewer._canvas.getBoundingClientRect();
	var left = canvasBound.left;
	var top = canvasBound.top;
	var width = canvasBound.width;
	var height = canvasBound.height;
	var overlayDivStr = '<div style=" position: absolute;left: '+left+'px;top: '+top+'px;width: '+width+'px;height: '+height+'px;background: rgba(255,0,0,0.0);"></div>'
	this.overlayDiv = this._createDom(overlayDivStr);
	//启用碰撞检测
	this.enableCollide = false;
	//碰撞标志，如果enableCollide为false，那么这个值永远是false
	this.collideFlag = false;
	//鼠标按下标志
	this.mouseDown = false;
	//根据ifc中米的单位定义间隔距离
	if(this.viewer._handles[0] && this.viewer._handles[0]._model)
	{
		var meter = this.viewer._handles[0]._model.meter;
		this.cubeX = Math.floor(meter / 5);  //视角立方体宽度的一半是0.2米
		this.cubeY = Math.floor(meter / 2);  //视角立方体高度的一半是0.5米
		this.cubeZ = Math.floor(meter / 2);  //视角立方体深度的一半是0.5米
	}
}
//开始漫游
RoamingPlugin.prototype.start = function(){
	//增加一个透明div覆盖在canvas上，用来屏蔽鼠标事件
	this._insertAfter(this.overlayDiv,this.viewer._canvas);
	//键盘监听
	this._addKeydownHander();
	//document.body.style.cursor = 'none'; 
}
//停止漫游
RoamingPlugin.prototype.stop = function(){
	//清除碰撞检测线程
	this.setCollide(false);
	//移除键盘监听
	document.onkeydown = function(event){}
	//移除鼠标移动
	this.overlayDiv.removeEventListener('mousemove', this._onMouseMove, true);
	this.overlayDiv.removeEventListener('mousedown', this._onMouseDown, true);
	this.overlayDiv.removeEventListener('mouseup', this._onMouseUp, true);
	this.viewer._canvas.parentNode.removeChild(this.overlayDiv);
	
}
RoamingPlugin.prototype.setCollide = function(enable){
	this.enableCollide = enable;
	if(this.enableCollide)
	{
		this._collideThread();
	}
	else
	{
		//console.info("停止碰撞检测");
		//恢复碰撞检测标志
		this.collideFlag = false;
		if(this.interval)
		{
			clearInterval(this.interval);
			this.interval = null;
		}
	}
}
RoamingPlugin.prototype._collideThread = function(){
    //console.info("启动碰撞检测");
	//_getID()的坐标是canvas的相对坐标，所以中心点就是canvas的高宽一半
    var centerX =  this.viewer._canvas.clientWidth / 2;
    var centerY =  this.viewer._canvas.clientHeight / 2;
    var viewX = centerX;
    var viewY = this.viewer._height - (centerY); //这个Y坐标是底部为0
    var self = this;
    this.interval = setInterval(function()
    {
        var id = self.viewer._getID(viewX, viewY);
        if(id)
        {
            self.collideFalg = self._collide(id);
        }
        //漫游中心没有建筑物那么就肯定不会碰撞
        else
        {
        	self.collideFalg = false;
        }

    }, 200);
}
RoamingPlugin.prototype._collide = function(id){
    var prod = this.viewer.getProductMap(id);
    if(prod)
    {
        var bbox = prod.bBox;
        var prodOrigin = [bbox[0] + bbox[3] / 2.0, bbox[1] + bbox[4] / 2.0, bbox[2] + bbox[5] / 2.0];
        //bbox的位置是x z y，后三位表示 X边长，Z边长 ，Y边长
        //求出两个立方体的x轴方向上的边长和的1/2
        var distanceX = bbox[3] / 2.0 + this.cubeX;
        //求出两个立方体的z轴方向上的边长和的1/2
        var distanceZ = bbox[4] / 2.0 + this.cubeY;
        //求出两个立方体的y轴方向上的边长和的1/2
        var distanceY = bbox[5] / 2.0 + this.cubeZ;
        //计算当前视角与构件中心点的距离
        var cameraPosition = this.viewer.getCameraPosition();
        //构件中心点
        var x1 = prodOrigin[0];
        var z1 = prodOrigin[1];
        var y1 = prodOrigin[2];
        //视角中心点
        var x2 = cameraPosition[0];
        var z2 = cameraPosition[1];
        var y2 = cameraPosition[2];

        if(Math.abs(x1 - x2) <= distanceX && Math.abs(y1 - y2) <= distanceY && Math.abs(z1 - z2) <= distanceZ)
        {
            //console.info("撞上了");
            return true;
        }
    }
    return false;
}
RoamingPlugin.prototype._createDom = function(domStr)
{
    var tempNode = document.createElement('div');
    tempNode.innerHTML = domStr;
    return tempNode.firstChild;
}
//js本身没有insertAfter方法，写一个
RoamingPlugin.prototype._insertAfter = function(newDom, targetDom)
{
    var parentDom = targetDom.parentNode;
    if(parentDom.lastChild == targetDom)
    {
        parentDom.appendChild(newDom);
    }
    else
    {
        parentDom.insertBefore(newDom, targetDom.nextSibling);
    }
}

RoamingPlugin.prototype._addKeydownHander = function()
{
    var self = this;
    document.onkeydown = function(event)
    {
        if(event.keyCode == 87) //W  前进(放大)
        {
            if(self.collideFalg)
                return;

            self.viewer.navigate('zoom', 0, self.zoomSpeed);
            self.viewer._origin = self.viewer.getCameraPosition();
            //self.viewer._origin = self.viewer.getCameraPosition();
        }
        if(event.keyCode == 83) //S  后退(缩小)
        {

            self.viewer.navigate('zoom', 0, -self.zoomSpeed);
            self.viewer._origin = self.viewer.getCameraPosition();
            //self.viewer._origin = self.viewer.getCameraPosition();
        }
        if(event.keyCode == 65) //A  左移
        {
            self.viewer.navigate('pan', self.directionSpeed, 0); 
           	self.viewer._origin = self.viewer.getCameraPosition();
        }
        if(event.keyCode == 68) //D  右移
        {
            self.viewer.navigate('pan', -self.directionSpeed, 0); 
           	self.viewer._origin = self.viewer.getCameraPosition();
        }
        if(event.keyCode == 37) //LEFT 镜头左转
		{
			self.viewer.navigate('orbit', -self.rotateSpeed, 0); 
		}
		if(event.keyCode == 39) //RIGHT 镜头右转
		{
			self.viewer.navigate('orbit', self.rotateSpeed, 0);
		}
    }
	
	this.overlayDiv.addEventListener('mousemove', this._onMouseMove.bind(this), true);
	this.overlayDiv.addEventListener('mousedown', this._onMouseDown.bind(this), true);
	this.overlayDiv.addEventListener('mouseup', this._onMouseUp.bind(this), true);
}
RoamingPlugin.prototype._onMouseDown = function(event){
	this.mouseDown = true;
	this.lastMouseX = event.clientX;
	this.lastMouseY = event.clientY;

}
RoamingPlugin.prototype._onMouseUp = function(event){
	this.mouseDown = false;
	this.lastMouseX = null;
    this.lastMouseY = null;
}
RoamingPlugin.prototype._onMouseMove = function(event){
	if (!this.mouseDown) 
	{
        return;
    }
	var newX = event.clientX;
    var newY = event.clientY;
	var deltaX = newX - this.lastMouseX;
    var deltaY = newY - this.lastMouseY;
    //console.info(deltaX+","+deltaY);
    //如果开启重力感应
    this.viewer.navigate('orbit', deltaX , 0 );
    //如果不开启重力感应
    //this.viewer.navigate('orbit', deltaX ,deltaY );
    this.lastMouseX = newX;
    this.lastMouseY = newY;
}
RoamingPlugin.prototype.onLoaded = function(event){
	
}
RoamingPlugin.prototype.onBeforeDraw = function () {
//	console.info("plugin onBeforeDraw")
};

RoamingPlugin.prototype.onBeforePick = function(id) { }

RoamingPlugin.prototype.onAfterDraw = function() { 
	
}

RoamingPlugin.prototype.onBeforeDrawId = function () {};

RoamingPlugin.prototype.onAfterDrawId = function () {};
RoamingPlugin.prototype.onBeforeGetId = function (id) { }
RoamingPlugin.prototype.draw = function() {}

export default RoamingPlugin