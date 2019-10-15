import SVG from "svgjs";
import $ from "jquery";
import rtdaUtil from "./rtdaUtil";

/*画面上的导航按钮如果rect和label都绑定了loadview动作 ，那么点击时会触发两次，这和cs是不一样的。冒泡
 *所以通过建立一个timer延迟400毫秒触发loadview动作，规避连续多次的触发
 * 2019-4-2 更新： 这是以前CS版本的做法，现在全web了，只需要rect绑定动作就可以了
 */

var RtdaAction = function(rtda) {
	var rtda = rtda;
	var enableScriptActions = new Array();//定义了使能脚本的action对象，这些对象会在rtda的update时执行使能脚本运算
	var scriptTags = new Array();//在解析画面过程中，记录下所有使能脚本中包含的不重复的tag，这个也是要注册的
	/**
	 * 获得定义了使能脚本的action对象
	 */
	RtdaAction.prototype.getEnableScriptActions = function()
	{
		return enableScriptActions;
    }
    //计算tag相关的使能脚本
	RtdaAction.prototype.updateActionEnableScript = function(tag)
	{
		for(var i=0;i<enableScriptActions.length;i++)
		{
            var actionObj = enableScriptActions[i];
            //如果请求的这个tag是属于这个使能脚本相关tags，那么要计算一次
			var tags = rtdaUtil.getMapKeys(actionObj.tagDefineMap);
			if(tags.indexOf(tag) != -1)
			{
				//执行之后，action对象的enable就最终确定了
				this.runActionEnableScript(actionObj);
				if(actionObj.enable)
				{
					
				}
			}
		}
    }
    RtdaAction.prototype.loadView = function(rtdaDom)
    {
        var clickDom =  rtdaDom.parentNode;
        var gDom = rtdaDom.parentNode.parentNode;
        if(gDom && gDom.nodeName == 'g')
        {
            clickDom = gDom;
        }
        $(clickDom).css('cursor','pointer');//如果用了<g>可避免<text>的输入光标，就算不用<g>，rect是hand也醒目一点
        
        var view = rtdaDom.getAttribute('view');
        // 解析出画面ID
        var keyStartIndex = view.indexOf("[");
        var keyEndIndex = view.indexOf(']');
        var canvasIdStr = view.substring(keyStartIndex + 1, keyEndIndex);
        
        clickDom.addEventListener('click',(event)=>{
            console.info(canvasIdStr);
            rtda.loadSVG(Number(canvasIdStr));
            // var url = 'pages/canvas/canvas.html?canvasId='+canvasIdStr;
            // var frame = window.parent.document.getElementById('frame');
            // $(frame).attr('src',url);
        });
    }
    RtdaAction.prototype.parseActions = function(rtdaDom)
    {
        var nodeName = rtdaDom.nodeName;
        switch(nodeName)
        {
            case 'rtda:loadview': //画面跳转
                this.loadView(rtdaDom);
                break;
            case 'rtda:sendeoutcommand': //状态量控制命令
                this.parseSendEoutCommand(rtdaDom);
                break;
            case 'rtda:sendaoutcommand': //模拟量控制命令
                this.parseSendAoutCommand(rtdaDom);
                break;
            case 'rtda:sendcommand'://控制量(脚本量)控制命令
                this.parseSendCommand(rtdaDom);
                break;
            default:
                break;
        }
    }
    //<rtda:sendEoutCommand>
    RtdaAction.prototype.parseSendEoutCommand = function(rtdaDom)
    {
        var obj = new Object();
        //默认action是可用的
        obj.enable = true;
        obj.tag = rtdaDom.getAttribute('tag'); //需要控制的状态点tag
        obj.svgDom = rtdaDom.parentNode;
        obj.confirmationDialog = rtdaDom.getAttribute('confirmationdialog'); //操作确认对话框消息
        obj.sendEoutValue = rtdaDom.getAttribute('sendeoutvalue'); //要设置的值，0或1
        //如果包含使能定义
        obj.actionEnable = rtdaDom.getAttribute('actionenable');
        if(obj.actionEnable && obj.actionEnable != '')
        {
            this.actionEnableScriptParse(rtdaDom,obj);
        }
        //绑定事件，编辑画面的时候，建议最后将rect和text组合起来，这样可以将事件绑定到<g>上，否则点击rect有事件，但点击text没事件
        //判断是否组合
        var clickDom = obj.svgDom;
        var gDom = rtdaDom.parentNode.parentNode;
        if(gDom && gDom.nodeName == 'g')
        {
            clickDom = gDom;
        }
        $(clickDom).css('cursor','pointer');//如果用了<g>可避免<text>的输入光标，就算不用<g>，rect是hand也醒目一点
        clickDom.addEventListener('click',function(event){
            //使能判断通过
            if(obj.enable)
            {
                //二次确认
                if(obj.confirmationDialog && obj.confirmationDialog.trim() != '')
                {
                    var result = confirm(obj.confirmationDialog);
                    if(result)
                    {
                        alert('发送控制令：设置测点 '+obj.tag+' 值为 '+obj.sendEoutValue);
                    }
                }
            }
        });
    }

    //<rtda:sendAoutCommand>
    RtdaAction.prototype.parseSendAoutCommand = function(rtdaDom)
    {
        var obj = new Object();
        //默认action是可用的
        obj.enable = true;
        obj.tag = rtdaDom.getAttribute('tag'); //需要控制的状态点tag
        obj.svgDom = rtdaDom.parentNode;
        obj.confirmationDialog = rtdaDom.getAttribute('confirmationdialog'); //操作确认对话框消息
        //如果包含使能定义
        obj.actionEnable = rtdaDom.getAttribute('actionenable');
        if(obj.actionEnable && obj.actionEnable != '')
        {
            this.actionEnableScriptParse(rtdaDom,obj);
        }
        //绑定事件，编辑画面的时候，建议最后将rect和text组合起来，这样可以将事件绑定到<g>上，否则点击rect有事件，但点击text没事件
        //判断是否组合
        var clickDom = obj.svgDom;
        var gDom = rtdaDom.parentNode.parentNode;
        if(gDom && gDom.nodeName == 'g')
        {
            clickDom = gDom;
        }
        $(clickDom).css('cursor','pointer');//如果用了<g>可避免<text>的输入光标，就算不用<g>，rect是hand也醒目一点
        clickDom.addEventListener('click',function(event){
            //使能判断通过
            if(obj.enable)
            {
                //二次确认
                if(obj.confirmationDialog && obj.confirmationDialog.trim() != '')
                {
                    var result = confirm(obj.confirmationDialog);
                    if(result)
                    {
                        var message = prompt('请输入要设置的测值:');
                        alert('发送控制令：设置测点 '+obj.tag+' 值为 '+message);
                    }
                }
            }
        });
    }

    //<rtda:sendCommand>
    RtdaAction.prototype.parseSendCommand = function(rtdaDom)
    {
        var obj = new Object();
        //默认action是可用的
        obj.enable = true;
        obj.tag = rtdaDom.getAttribute('tag'); //需要控制的状态点tag
        obj.svgDom = rtdaDom.parentNode;
        obj.confirmationDialog = rtdaDom.getAttribute('confirmationdialog'); //操作确认对话框消息
        //如果包含使能定义
        obj.actionEnable = rtdaDom.getAttribute('actionenable');
        if(obj.actionEnable && obj.actionEnable != '')
        {
            this.actionEnableScriptParse(rtdaDom,obj);
        }
        //绑定事件，编辑画面的时候，建议最后将rect和text组合起来，这样可以将事件绑定到<g>上，否则点击rect有事件，但点击text没事件
        //判断是否组合
        var clickDom = obj.svgDom;
        var gDom = rtdaDom.parentNode.parentNode;
        if(gDom && gDom.nodeName == 'g')
        {
            clickDom = gDom;
        }
        $(clickDom).css('cursor','pointer');//如果用了<g>可避免<text>的输入光标，就算不用<g>，rect是hand也醒目一点
        clickDom.addEventListener('click',function(event){
            //使能判断通过
            if(obj.enable)
            {
                //二次确认
                if(obj.confirmationDialog && obj.confirmationDialog.trim() != '')
                {
                    var result = confirm(obj.confirmationDialog);
                    if(result)
                    {
                        alert('发送控制令：设置测点 '+obj.tag+' 执行脚本 ');
                    }
                }
            }
        });
    }
    //使能脚本解析，生成"3_0_0_5:{水温[3_0_0_5].测值}"HashMap映射数据,并push到使能对象中去，rtda的update时，会计算使能状态
    RtdaAction.prototype.actionEnableScriptParse = function(rtdaDom,rtdaObj)
    {
        var script = rtdaObj.actionEnable;
        //如果有使能判断，那么默认是不可用的，要通过使能来判断可用性
        rtdaObj.enable = false;
        //记录下原始颜色，先填禁用色
        rtda.resolveStyle(rtdaObj.svgDom);
        //记录下rect原始的填充色
        rtdaObj.orgFill = rtdaObj.svgDom.getAttribute('fill');
        rtdaObj.disableFill = rtdaDom.getAttribute('disablefill'); //禁用色，使能判断如果为false，就用这个填充
        var svgElement = SVG.adopt(rtdaObj.svgDom);
        svgElement.style('fill',  rtdaObj.disableFill);
            
        var tagDefineMap = new Map();
        var begin = 0, end = 0;
        for (var i = 0; i <= script.lastIndexOf(".测值}");) 
        {
                begin = script.indexOf("{", i) ;
                end = script.indexOf(".测值}", begin) + 4;
                if(begin != -1 && end != -1)
                {
                    //tagDefine的格式："#1闸门[1_0_0_0]"
                    var tagDefine = script.substring(begin, end);
                    var splitFlagIndex = tagDefine.indexOf("[");
                    var tag = tagDefine.substring(splitFlagIndex+1, tagDefine.length-5);
                    //记录到scriptTags中，这些tag也是要注册的,但不要重复
                    if(scriptTags.indexOf(tag) == -1)
                    {
                        scriptTags.push(tag);
                    }
                    tagDefineMap.set(tag, tagDefine);
                    i = end + 1;
                }
                
        }
        rtdaObj.tagDefineMap = tagDefineMap;
        //加入定义了使能脚本的action对象
        this.getEnableScriptActions().push(rtdaObj);
    }
    //获得使能脚本中相关tag，这些tag需要注册，否则不会收到这些tag的测值推送
    RtdaAction.prototype.getScriptTags = function(){
        return scriptTags;
    }
    //执行使能脚本
    RtdaAction.prototype.runActionEnableScript = function(actionObj)
    {
        var script = actionObj.actionEnable;
        var tagDefineMap = actionObj.tagDefineMap;
        var tags =  rtdaUtil.getMapKeys(tagDefineMap);
        var allTagHaveValue = true;//脚本中包含的所有tag都有测值，如果不满足，不能执行脚本，使能状态即false
        for(var i=0;i<tags.length;i++)
        {
            var tag = tags[i];
            var measureValue = rtda.tagCache.get(tag);
            if(measureValue)
            {
                //var valueStr = ''+
                var defineStr = tagDefineMap.get(tag);
                script = script.replace(defineStr, measureValue.value);
            }
            else
            {
                allTagHaveValue = false;
                break;
            }
        }
        if(allTagHaveValue)
        {
            console.info('需要执行的使能脚本:'+script);
            //action对象是否可用
            var preEnable = actionObj.enable;//当前状态
            actionObj.enable = eval(script);//本次计算结果
            //设置颜色，如果有必要
            if(preEnable != actionObj.enable)
            {
                var svgElement = SVG.adopt(actionObj.svgDom);
                //可用，rect原始的填充色
                if(actionObj.enable)
                {
                    svgElement.style('fill',  actionObj.orgFill);
                }
                //禁用色
                else
                {
                    svgElement.style('fill',  actionObj.disableFill);
                }
            }
            
        }
        else
        {
            console.info('使能脚本tag测值不全:'+script);
        }

    }
    //切换画面的时候，清空使能对象，防止和下一个画面的使能对象有冲突
    RtdaAction.prototype.dispose = function(){
        enableScriptActions.length = 0;
        scriptTags.length = 0;
    }
};

	

//loadview以前的版本备份
RtdaAction.prototype.loadView_bak = function(rtdaDom)
{
	var loadViewTimer;
	var dom = rtdaDom.parentNode;
	$(dom).css('cursor','pointer');
	var view = rtdaDom.getAttribute('view');
	// 解析出画面ID
	var keyStartIndex = view.indexOf("[");
	var keyEndIndex = view.indexOf(']');
	var canvasIdStr = view.substring(keyStartIndex + 1, keyEndIndex);
	dom.addEventListener('click',function(event){
		//防止多次触发
		if(loadViewTimer == null)
		{
			loadViewTimer = setTimeout(function(){
				loadViewTimer = null;
				var url = 'pages/canvas/canvas.html?canvasId='+canvasIdStr;
				var frame = window.parent.document.getElementById('frame');
				$(frame).attr('src',url);
			},400);//间隔时间不能太短，200毫秒有点短了
		}
	});
}

export default RtdaAction;