import request from "@/utils/request";
import SVG from "svgjs"
import $ from "jquery";
import echarts from "echarts";
import RtdaWidget from './rtdaWidget';
import RtdaAction from './rtdaAction';
import RtdaCellParser from './rtdaParser';
import RtdaValuer from './rtdaValue';
import RtdaOperator from './rtdaOper';
import RtdaSocket from "./rtdaWebsocket";

function RTDA(contentDiv) {
    this.contentDom = contentDiv;
    this.server = 'http://127.0.0.1:8080/xsw/';
    this.socketUrl = 'ws://127.0.0.1:8080/xsw/websocket';
    this.svgNS = "http://www.w3.org/2000/svg";
    //缓存当前测值
    this.tagCache = new Map();
    this.updateTags = []; //接受从webscoket服务端rtdb发来的tag，websocket.onmessage 中add
    this.cycleObjects = []; //svg周期动画对象
    this.chartObjects = []; //曲线图对象
    this.RTDA_Event_TimeChanaged = 'timeChanged';
    this.curCanvasId = null;//记录下当前画面ID

    var self = this;
    var svgDom;
    //websocket
    var socket;
    //控件
    var rtdaWidget = new RtdaWidget(this);
    //控制令
    var rtdaAction = new RtdaAction(this);
    //解析者
    var svgParser = new RtdaCellParser(this, rtdaWidget, rtdaAction);
    //取值者
    var rtdaValuer = new RtdaValuer(this, rtdaWidget);
    //SVG操作者
    var svgOpeator = new RtdaOperator(rtdaWidget);
    //消息总线，当前应用在echarts图元接受时间控件通知
    var oberservers = [];
    //考虑到模块加载顺序并不能保证notify的时候观察者就已经创建好了，所以需要增加一个初始队列，这里面的事件会在画面加载以后处理掉
    var initEvents = [];

    var rtdataProvider; //刷新画面定时器
    var cycleProvider; //动画元素定时器，周期比画面刷新要快很多，单独一个


    RTDA.prototype.init = function(){
        this._initWebsocket();
        this._resizeHandler();
    }
    //初始化websocket
    RTDA.prototype._initWebsocket = function () {
        //建立websocket,注册断线重连成功后的回调函数
        socket = new RtdaSocket(this, ()=> {
            //这是专为画面断线重连服务的，虽然第一次打开画面也会发送，但此时getTags == 0，registerTags()中做了length判断，不会发送注册消息
            //实际上，第一次打开画面是在loadCanvas之后发送注册消息，因为那时候，Parser的getTags有内容了
            if(this.curCanvasId)
            {
                console.log("重新注册画面tags");
                var tags = this.getSvgParser().getTags();
                this.registerTags(tags);
            }
    
        });
        //连接服务器
        socket.init();
    }
    //注册画面tag，websocket连接成功之后的callback
    RTDA.prototype.registerTags = function (tags) {
        //发送新画面需要关注的tag给服务器
        if (tags.length > 0) {
            var message = "";
            var tagCount = tags.length;
            for (var i = 0; i < tagCount; i++) {
                message += tags[i];
                if (i < tagCount - 1) {
                    message += ",";
                }
            }
            socket.sendMessage("register:" + message);
        }
    }

    RTDA.prototype.startTimer = function () {
        this.stopTimer();
        //普通图元一秒去updateTags缓存中刷新并清空,这样如果websocket没有发来数据，动画也不会无意义的重复刷新
        rtdataProvider = setInterval(this.update.bind(this), 1000);
        //动画图元200毫秒去tagCache断面缓存中查当前值并刷新，不会清除tagCache
        cycleProvider = setInterval(this.cycleUpdate.bind(this), 200);
    }
    RTDA.prototype.stopTimer = function () {
        if (rtdataProvider) {
            clearInterval(rtdataProvider);
            rtdataProvider = null;
            console.log('stopRtdataProvider');
        }
        if (cycleProvider) {
            clearInterval(cycleProvider);
            cycleProvider = null;
            console.log('stopCycleProvider');
        }
        //在前台转后台的时候，曲线图不能不刷，否则曲线就不正确了，
        //并且，曲线图的timer是在自己内部创建的，这里也管不了。
        //并且，在页面切换画面或者跳转的时候，会调用曲线图的dispose()，那里会clear掉timer
    }
    /**
     * 释放当前画面资源，可用在切换画面时，如果是退出整个画面应用，要继续调用exit
     */
    RTDA.prototype.dispose = function () {
        this.stopTimer();
        this.tagCache.clear();
        this.updateTags = [];
        this.cycleObjects = [];
        //曲线图资源
        for (var i = 0; i < this.chartObjects.length; i++) {
            this.chartObjects[i].dispose();
        }
        this.chartObjects = [];
        oberservers = [];
        rtdaAction.dispose();
    }
    //退出画面应用
    RTDA.prototype.exit = function(){
        //关闭div的resize监视
        if(this.resizeInterval)
        {
            clearInterval(this.resizeInterval);
        }
        //断开websocket
        if(socket)
        {
            socket.close();
        }
    }
    RTDA.prototype._resizeHandler = function() {
        this.oldCanvasWidth = $(contentDiv).width();
        this.oldCanvasHeight = $(contentDiv).height();
        this.resizeInterval = setInterval(() => {
           if($(contentDiv).width() != this.oldCanvasWidth || $(contentDiv).height() != this.oldCanvasHeight)
           {
                this.resize();
                this.oldCanvasWidth = $(contentDiv).width();
                this.oldCanvasHeight = $(contentDiv).height();
           }}, 500);
    }
    RTDA.prototype.resize = function () {
        var w = Math.round($(contentDiv).width());
        var h = Math.round($(contentDiv).height());
        this.svg.size(w, h);

        //div图元都要重新设置
        for (var i = 0; i < this.chartObjects.length; i++) {
            var chart = this.chartObjects[i];
            var bounds = chart.getSvgOrgBounds();
            var screenStart = this.canvasToScreen(bounds.x, bounds.y);
            var screenEnd = this.canvasToScreen(bounds.x + bounds.width, bounds.y + bounds.height);
            var div = chart.getDiv();
            $(div).css('left', screenStart.x);
            $(div).css('top', screenStart.y);
            var newWidth = screenEnd.x - screenStart.x;
            var newHeight = screenEnd.y - screenStart.y;
            $(div).width(newWidth);
            $(div).height(newHeight);
            //echarts调用resize方法重绘
            var echart = echarts.getInstanceByDom(div);
            echart.resize({
                width: newWidth,
                height: newHeight
            });
            //如果图元有自定义的resize方法，那要调用下，估计他们要重新计算一些绝对高度
            if (chart.resize) {
                chart.resize(newWidth, newHeight);
            }
        }

    }
    /**
     * 加载SVG文件，并完成文档rtda解析处理
     */
    RTDA.prototype.loadSVG = function (curCanvasId, callback) {
        var self = this;
        self.curCanvasId = curCanvasId;
        //先清空测值缓存和动画缓存，因为切换画面了
        self.dispose();
        $(contentDiv).empty();
        $(contentDiv).css('background-color', "#FFFFFF");
        $(contentDiv).append('<div id="canvasLoadingDiv" class="canvas_loading"><img src="img/loading.gif"/><br/>正在加载...</div>');
        request.get("canvas/getUrl.action", {
            params: {
                canvasId: curCanvasId
            }
        }).then(data => {
            var fileUrl = self.server + "canvasCache/" + data;
            $(contentDiv).load(fileUrl, function () {
                //不需要删除Loading，因为ajax load之后，content里面只有svg这个dom了
                svgDom = $(contentDiv).children()[0];//第一子节点就是svg
                var canvasBgColor = svgDom.getAttribute("backgroundcolor");
                $(contentDiv).css('background-color', canvasBgColor);
                //console.log("画面背景色"+canvasBgColor);
                //全局的SVG对象
                var svg = SVG(svgDom);
                //记录下svg原始size
                var svgOrgWidth = svg.width();
                var svgOrgHeight = svg.height();

                //如果SVG文件中没有将viewbox设置的和size一样，下面就要设置viewbox和原始size一致，才能看到全画面
                svg.viewbox(0, 0, svgOrgWidth, svgOrgHeight);
                var w = $(contentDiv).width();
                var h = $(contentDiv).height();
                svg.size(w, h);
                self.svg = svg;
                //解析SVG文件，形成 {tag1:[obj1,obj2],tag2:[obj1,obj2]
                self.parseSVG();
                //启动实时数据刷新,动画刷新
                self.startTimer();
                self.notifyInitEvents();
                //发送注册tag
                var tags = svgParser.getTags();
                self.registerTags(tags);
                //回调发送注册画面tag，因为load文件是ajax异步的
                if (callback) {
                    callback(tags);
                }
            });
        });
    }

    /**
     * 测试状态 加载SVG文件，并完成文档rtda解析处理
     */
    RTDA.prototype.loadSVGForTest = function (svgStr) {
        var self = this;
        //先清空测值缓存和动画缓存，因为切换画面了
        self.dispose();
        $(contentDiv).empty();
        $(contentDiv).css('background-color', "#FFFFFF");
        $(contentDiv).append(svgStr);
        svgDom = $('svg').get(0);
        var canvasBgColor = svgDom.getAttribute("backgroundcolor");
        $(contentDiv).css('background-color', canvasBgColor);
        //console.log("画面背景色"+canvasBgColor);
        //全局的SVG对象
        svg = SVG(svgDom);
        //记录下svg原始size
        var svgOrgWidth = svg.width();
        var svgOrgHeight = svg.height();

        //如果SVG文件中没有将viewbox设置的和size一样，下面就要设置viewbox和原始size一致，才能看到全画面
        svg.viewbox(0, 0, svgOrgWidth, svgOrgHeight);
        var w = $(contentDiv).width();
        var h = $(contentDiv).height();
        svg.size(w, h);
        self.parseSVG();
        //启动实时数据刷新,动画刷新
        self.startTimer();
        self.notifyInitEvents();
    }
    //解析文件Dom
    RTDA.prototype.parseSVG = function () {
        //解析器初始化
        svgParser.init();
        //遍历SVG文档中的rtda元素，形成我们自己的对象
        $('svg').find('*').each(function () {
            var domnode = $(this)[0];
            var nodeName = domnode.nodeName;
            var ns = nodeName.substr(0, 4);
            //如果是rtda元素，需要解析
            if (ns == 'rtda') {
                svgParser.parse(domnode);

            }
        });
        //根据测点，将对象分组
        svgParser.groupByTag();
    }

    /**
     * 获得RtdaCellParser对象
     */
    RTDA.prototype.getSvgParser = function () {
        return svgParser;
    }
    /**
     * 获得RtdaCellParser对象
     */
    RTDA.prototype.getRtdaValuer = function () {
        return rtdaValuer;
    }
    RTDA.prototype.putTagValue = function (tagId, tagValue) {
        this.tagCache.put(tagId, tagValue);
        this.refreshTag(tagId);
    }
    /**
     * svg坐标转网页坐标
     */
    RTDA.prototype.canvasToScreen = function (x, y) {
        var pos = svgDom.createSVGPoint();
        pos.x = parseInt(x);
        pos.y = parseInt(y);
        var ctm = svgDom.getScreenCTM()
        pos = pos.matrixTransform(ctm);
        var screenPoint = new Object();
        screenPoint.x = Math.round(pos.x);
        screenPoint.y = Math.round(pos.y);
        return screenPoint;
    }
    /**
     * 消息总线增加监听者
     */
    RTDA.prototype.addOberserver = function (obj) {
        oberservers.push(obj);
    }
    /**
     * 消息总线发送消息
     */
    RTDA.prototype.notify = function (event, source, paramObj) {
        $.each(oberservers, function (index, ober) {
            ober.doNotify(event, source, paramObj);
        });
    }
    /**
     * 添加页面初始化事件通知
     */
    RTDA.prototype.addInitEvent = function (event, source, paramObj) {
        initEvents.push({
            event: event,
            source: source,
            param: paramObj
        });
    }
    /**
     * 处理页面初始化事件通知，并清空event队列
     */
    RTDA.prototype.notifyInitEvents = function () {
        var self = this;
        $.each(initEvents, function (index, eventObj) {
            self.notify(eventObj.event, eventObj.source, eventObj.param);
        });
        initEvents = [];
    }

    /**
     * 刷新待处理tags,并清空updateTags
     */
    RTDA.prototype.update = function () {
        //console.log("updateTags的length:"+this.updateTags.length);
        if (this.updateTags.length != 0) {
            var copyArr = this.updateTags.concat();
            this.updateTags.length = 0;

            for (var i = 0; i < copyArr.length; i++) {
                //刷新tag绑定的图元
                self.updateRtdaObjsWithTag(copyArr[i]);
                //刷新tag相关的使能脚本计算
                self.updateActionEnableScript(copyArr[i]);
            }
        }

    }
    /**
     * 刷新单个tag对应的rtdaObjs，这里未解决多个tag对应同一个rtdaObj会重复驱动的浪费
     */
    RTDA.prototype.updateRtdaObjsWithTag = function (tag) {
        //先获取tag对应的元素组
        var rtdaObjs = svgParser.getMap().get(tag);
        //存在该tag对应的svg元素对象
        if (rtdaObjs && rtdaObjs.length > 0) {
            //循环刷新tag画面
            for (var i = 0; i < rtdaObjs.length; i++) {
                //取值
                var rtdaObj = rtdaObjs[i];
                rtdaValuer.getValue(rtdaObj);
                //console.log(rtdaObj.mea.value);
                //刷新SVG元素
                svgOpeator.repaintSVG(rtdaObj);
            }
        }
    }

    /**
     * 刷新定义了使能脚本的控制Action对象
     */
    RTDA.prototype.updateActionEnableScript = function (tag) {
        rtdaAction.updateActionEnableScript(tag);
    }
    /**
     * 动画周期刷新
     */
    RTDA.prototype.cycleUpdate = function () {
        //console.log("updateTags的length:"+this.updateTags.length);
        for (var i = 0; i < this.cycleObjects.length; i++) {
            //获得tag对应的动画rtda
            var rtdaObj = this.cycleObjects[i];
            switch (rtdaObj.type) {
                //状态量旋转动画
                case 'rtda:cyclerotateein':
                    self.cycleRotateEinUpdate(rtdaObj);
                    break;
                    //模拟量旋转动画
                case 'rtda:cyclerotateain':
                    self.cycleRotateAinUpdate(rtdaObj);
                    break;
                    //状态量幻灯片动画
                case 'rtda:cycleslideein':
                    self.cycleSlideEinUpdate(rtdaObj);
                    break;
                    //动画控件(发电机)
                case 'rtda:widget':
                    rtdaWidget.cycleRepaint(rtdaObj);
                    break;
                default:
                    break;
            }
        }

    }

    /**
     * rtda:cycleSlideEin
     */
    RTDA.prototype.cycleSlideEinUpdate = function (rtdaObj) {
        var tagValue = rtdaValuer.getTagValue(rtdaObj.tag);
        if (!isNaN(tagValue) && rtdaObj.size > 1) {
            var running = false;
            //测值符合标志位之一
            if (rtdaObj.states.indexOf(tagValue) != -1) {
                running = true;
            }
            //停止复位
            if (!running && rtdaObj.rest) {
                rtdaObj.curIndex = 0;
                rtdaObj.slideElements[0].setAttribute("style", "visibility:visible;");
                for (var i = 1; i < rtdaObj.size; i++) {
                    rtdaObj.slideElements[i].setAttribute("style", "visibility:hidden;");
                }
            }
            //动画
            else if (running) {
                for (var i = 0; i < rtdaObj.size; i++) {
                    rtdaObj.slideElements[i].setAttribute("style", "visibility:hidden;");
                }
                rtdaObj.slideElements[rtdaObj.curIndex].setAttribute("style", "visibility:visible;");
                rtdaObj.curIndex++;
                //到终点了回头继续
                if (rtdaObj.curIndex > (rtdaObj.size - 1)) {
                    rtdaObj.curIndex = 0;
                }
            }

        }
    }
    /**
     * rtda:cycleRotateAin
     */
    RTDA.prototype.cycleRotateAinUpdate = function (rtdaObj) {
        var tagValue = rtdaValuer.getTagValue(rtdaObj.tag);
        if (!isNaN(tagValue)) {
            var running = false;
            var rangMin;
            if (rtdaObj.rangMinType == 'number') {
                rangMin = Number(rtdaObj.rangMin);
            } else if (rtdaObj.rangMinType == 'tag') {
                rangMin = rtdaValuer.getTagValue(rangMin);
            }
            var rangMax;
            if (rtdaObj.rangMaxType == 'number') {
                rangMax = Number(rtdaObj.rangMax);
            } else if (rtdaObj.rangMaxType == 'tag') {
                rangMax = rtdaValuer.getTagValue(rangMax);
            }
            if (!isNaN(rangMin) && !isNaN(rangMax)) {
                if (tagValue >= rangMin && tagValue <= rangMax) {
                    running = true;
                }
            }
            self.cycleRotate(running, rtdaObj);
        }
    }
    /**
     * rtda:cycleRotateEin
     */
    RTDA.prototype.cycleRotateEinUpdate = function (rtdaObj) {
        var tagValue = rtdaValuer.getTagValue(rtdaObj.tag);
        if (!isNaN(tagValue)) {
            var running = false;
            //测值符合标志位之一
            if (rtdaObj.states.indexOf(tagValue) != -1) {
                running = true;
            }
            self.cycleRotate(running, rtdaObj);
        }

    }

    RTDA.prototype.cycleRotate = function (running, rtdaObj) {
        //停止复位
        if (!running && rtdaObj.rest) {
            rtdaObj.angle = 0;
            rtdaObj.svgDom.setAttribute("transform", "rotate(" + rtdaObj.angle + "," + rtdaObj.xCenter + " " + rtdaObj.yCenter + ")");
        }
        //顺时针
        else if (running && rtdaObj.clockwise) {
            if (rtdaObj.angle >= 360) {
                rtdaObj.angle = 0;
            }
            rtdaObj.svgDom.setAttribute("transform", "rotate(" + rtdaObj.angle + "," + rtdaObj.xCenter + " " + rtdaObj.yCenter + ")");
            rtdaObj.angle += 10;

        }
        //逆时针
        else if (running && !rtdaObj.clockwise) {
            if (rtdaObj.angle <= 0) {
                rtdaObj.angle = 360;
            }
            rtdaObj.svgDom.setAttribute("transform", "rotate(" + rtdaObj.angle + "," + rtdaObj.xCenter + " " + rtdaObj.yCenter + ")");
            rtdaObj.angle -= 10;
        }
    }
    /**
     * 分解Elment的style属性，在widget和action中都用到
     */
    RTDA.prototype.resolveStyle = function (element) {
        var style = element.getAttribute('style');
        var styleItem = style.split(';');
        element.removeAttribute('style');
        for (var i = 0; i < styleItem.length; i++) {
            var item = styleItem[i];
            if (item != '') {
                var itemValue = item.split(':');
                element.setAttribute(itemValue[0], itemValue[1]);
            }
        }
    }
}





export default RTDA;