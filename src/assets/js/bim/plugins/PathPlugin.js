
import TWEEN from "@tweenjs/tween.js";

function PathPlugin(option){
    this.name = "path";
}

PathPlugin.prototype.init=function (xviewer) {
	this.viewer = xviewer;
	//构件一个覆盖层的div的dom，可以复用
	var canvasBound = this.viewer._canvas.getBoundingClientRect();
	var left = canvasBound.left;
	var top = canvasBound.top;
	var width = canvasBound.width;
	var height = canvasBound.height;
	var overlayDivStr = '<div style=" position: absolute;left: '+left+'px;top: '+top+'px;width: '+width+'px;height: '+height+'px;background: rgba(255,0,0,0.0);"></div>'
	this.overlayDiv = this._createDom(overlayDivStr);
}
//设置路径和耗时
PathPlugin.prototype.setPath = function(path,time,lastOrg)
{
    if(!this.viewer)
    {
        return;
    }
    this.lastOrg = [-6501.67919921875, 33638.62109375, 3045.3271484375];
    //根据路径计算出各个段落之间的耗时
    var path = [
        [-1628.6220703125, 14012.89453125, 1597.753173828125],
        [-1376.585693359375, -1188.7420654296875, 1648.8802490234375],
        [-3554.440185546875, -3381.83935546875, 1189.4171142578125],
        [-5702.19921875, -2223.480712890625, 1597.2490234375],
        [-6464.75830078125, 8172.81298828125, 1202.714111328125],
    ];
    // var path = [
    //     [-28341.072265625, -32087.443359375, 1208.187744140625],
    //     [-26942.66015625, -2741.992431640625, 966.5922241210938],
    //     [-12709.4287109375, 2041.56591796875, 837.508544921875],
    //     [-7885.62255859375, 1301.279541015625, 713.686279296875],
    //     [-881.7783813476562, 971.615234375, 373.4770812988281]
    // ];
    var time = 30000;//10秒
    //计算每段的距离
    var subDists = new Array();
    var sumDist = 0;
    for(var i=0;i<path.length-1;i++)
    {
        var start = path[i];
        var end = path[i+1];
        var dist = this.viewer.dist(start,end);
        subDists.push(dist);
        sumDist = sumDist + dist;
    }
    //计算每段的耗时
    var unit = sumDist / time;
    var subTimes = new Array();
    for(var i=0;i<subDists.length;i++)
    {
        var subTime = Math.round(subDists[i] / unit);
        subTimes.push(subTime);
    }
    this.subTimes = subTimes;
    this.path = path;
}
//开始漫游
PathPlugin.prototype.start = function(){
    var self = this;
	//增加一个透明div覆盖在canvas上，用来屏蔽鼠标事件
	this._insertAfter(this.overlayDiv,this.viewer._canvas);
    this._animate();//启动tween动画

    var tweenObjs = new Array();
    let i = 0;
    this.subTimes.forEach(subTime=>{
        var t;
        //计算器
        var count = i;
        t = new TWEEN.Tween(this.path[i])
            .to(this.path[i+1],subTime)
            .easing(TWEEN.Easing.Linear.None)
            .onStart(()=>{
                //第一个片段开始时，记录下初始org，最后一个片段执行结束后恢复到这个org
                if(count === 0)
                {
                    this.srcOrg = this.viewer._origin;
                }
                if(count< (this.path.length-1))
                {
                    var org = this.path[count+1];
                    this.viewer._origin = org;
                }
            })
            .onUpdate(object => {
                this.viewer.setCameraPosition(object);
            })
            .onComplete(object=>{
                //最后一个片段结束的时候，需要恢复当前的原点，否则原点和摄像头位置重合就是一片灰色了
                if(count === (this.path.length-2))
                {
                    this.stop();
                    this.viewer._origin = this.lastOrg;
                    this.viewer.setCameraPosition(object);
                    console.info("最后一个片段结束"+count);
                }
            });
        tweenObjs.push(t);   
        i++;
    });
    //将tween对象链接起来
    for(var j=0;j<tweenObjs.length-1;j++)
    {
        tweenObjs[j].chain(tweenObjs[j+1]);
    }
    tweenObjs[0].start();
}

PathPlugin.prototype._animate = function(){
    function animate() {
		requestAnimationFrame(animate);
		TWEEN.update(); //调用所有的tween对象
    }
    animate();
}
//停止漫游
PathPlugin.prototype.stop = function(){
    this.viewer._canvas.parentNode.removeChild(this.overlayDiv);
}

PathPlugin.prototype._createDom = function(domStr)
{
    var tempNode = document.createElement('div');
    tempNode.innerHTML = domStr;
    return tempNode.firstChild;
}

PathPlugin.prototype._insertAfter = function(newDom, targetDom)
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

PathPlugin.prototype.onLoaded = function(event){
	
}
PathPlugin.prototype.onBeforeDraw = function () {
//	console.info("plugin onBeforeDraw")
};

PathPlugin.prototype.onBeforePick = function(id) { }

PathPlugin.prototype.onAfterDraw = function() { 
	
}

PathPlugin.prototype.onBeforeDrawId = function () {};

PathPlugin.prototype.onAfterDrawId = function () {};
PathPlugin.prototype.onBeforeGetId = function (id) { }
PathPlugin.prototype.draw = function() {}

export default PathPlugin