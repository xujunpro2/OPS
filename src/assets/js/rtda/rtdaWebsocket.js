
/**
 * websocket封装，参数是连接成功后的回调函数和rtda对象
 */
function RtdaSocket(rtda,connectedCallback) {
	var websocket = null;
	var reconTimer = null;
	var needDisconnect = false;//正常关闭通讯
	RtdaSocket.prototype.getSession = function() {
		return websocket;
	}
	/**
	 * 发送tag绑定消息给服务器
	 */
	RtdaSocket.prototype.sendMessage = function(message) {
		
		/*
		 * WebSocket.OPENING(0)：正在创建连接
		 * WebSocket.OPEN(1)：已经建立连接
		 * WebSocket.CLOSING(2)：正在关闭连接
		 * WebSocket.CLOSING(3)：已经关闭连接
		 * readyState的值永远从0开始。
		 */
		if(websocket && websocket.readyState == 1)
		{
			websocket.send(message);
		}
	}
	function connect()
	{

		//判断当前浏览器是否支持WebSocket
		if('WebSocket' in window)
		{
			if(websocket == null)
			{
				websocket = new WebSocket(rtda.socketUrl);
			}
		}
		else 
		{
			alert("当前浏览器不支持WebSocket,系统无法运行,请升级浏览器");
			return;
		}
		websocket.onopen = function(event) {
			//关闭断线重连
			if(reconTimer)
			{
				clearTimeout(reconTimer);
				reconTimer = null;
			}
			//连接成功之后的回调，注册tag
			if(connectedCallback)
			{
				connectedCallback();
			}
		}
		//接收到消息的回调方法
		websocket.onmessage = function(event) {
			//console.log(message);
			var now = new Date();//测值时间
            now.setMilliseconds(0);//毫秒没意义
			var json = eval("("+event.data+")");
			var datas = json;
			for(var i=0;i<datas.length;i++)
			{
				var tag = datas[i].tag;
				var measureValue = new Object();
				measureValue.value = datas[i].value;//值
				measureValue.quality = datas[i].quality;//品质
                measureValue.timestamp = now.getTime();//收到数据的时标
				rtda.tagCache.set(tag,measureValue);//断面缓存写一份，这个是为了动画图元不断的取值需要
				if(rtda.updateTags.indexOf(tag) == -1)
				{
					rtda.updateTags.push(tag);
				}
			}
		}
		//websocket的onclose会在第一次连接成功之后，一旦断开连接就自动触发
		//但如果一开始没有连接上服务端，那么不会触发该事件 ？（IOS上发现等待很久之后还是会触发）
		websocket.onclose = function(event) {
			console.log('WebSocket连接关闭');
			//非正常断开连接,启动重连机制
			if(!needDisconnect)
			{
				reconTimer = setTimeout(function() {
					console.log('尝试重新建立连接...');
					websocket = null;
					connect();
				}, 2000);
			}
			
		};
	
		//连接出现异常
		websocket.onerror = function(event) {
			//'连接WebSocket服务器失败，错误消息:' + e
			//console.log('websocket发生异常，调用了onerror');
		};
		
	}
	RtdaSocket.prototype.init = function() {
		connect();
	}
	/**
	 * 正常关闭websocket连接,不会启动重连操作
	 */
	RtdaSocket.prototype.close = function(){
		if(websocket)
		{
			needDisconnect = true;
			websocket.close();
			websocket = null;
		}
	}
	/**
	 * 连接websocket
	 */
	RtdaSocket.prototype.connect = function(){
		connect();
	}
}

export default RtdaSocket;