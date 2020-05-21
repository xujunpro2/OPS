/* eslint-disable */

var player = null;

var videoPlayerCameraCode = null

// 销毁	 TypeError: this.el_.vjs_getProperty is not a function
function onunloadPlayer(event) {

	if(player) {

		player.dispose();
	}
};
/**
 * 获得url参数
 * @param {Object} name
 */
function getUrlParam(name) {
	var reg = new RegExp("(^|&)" + name + "=([^&]*)(&|$)"); //构造一个含有目标参数的正则表达式对象  
	var r = window.location.search.substr(1).match(reg); //匹配目标参数  
	if(r != null) {
		return unescape(r[2]); //返回参数值 
	} else {
		return null;
	}
}


/**
 * 动作停止命令
 * @param {Object} command 摄像头控制命令
 * @example
 * LEFT 左转，RIGHT 右转，UP 上转，DOWN 下转，ZOOM_IN 焦距变大，ZOOM_OUT 焦距变小，LEFT_UP 左上 ，LEFT_DOWN 左下，RIGHT_UP 右上，RIGHT_DOWN 右下，FOCUS_FAR焦点后移，IRIS_ENLARGE 光圈扩大，IRIS_REDUCE 光圈缩小，以下命令presetIndex不可为空： GOTO_PRESET到预置点	
 */
function vedioControlStop(command){

	videoControlSubmit(command,1)
}

/**
 * 视频控制
 * @param {Object} command 摄像头控制命令
 * @param {int} action 动作 0-开始 1-停止
 */
function videoControlSubmit(command, action){
	if(videoPlayerCameraCode){
		//command LEFT 左转，RIGHT 右转，UP 上转，DOWN 下转，ZOOM_IN 焦距变大，ZOOM_OUT 焦距变小，LEFT_UP 左上 ，LEFT_DOWN 左下，RIGHT_UP 右上，RIGHT_DOWN 右下，FOCUS_FAR焦点后移，IRIS_ENLARGE 光圈扩大，IRIS_REDUCE 光圈缩小，以下命令presetIndex不可为空： GOTO_PRESET到预置点
		
		if(!action){
			action = 0
		}
		
		$.ajax({
			url : serverUrl + "/camera/control",
			type: 'post',
			dataType: 'json',
			timeout: 30000,
			async:true,  
			xhrFields: {
				withCredentials: true
			},
			data:{
				"id" : videoPlayerCameraCode,
				"action" : action,
				"command" : command,
				"Integer" : 50,
				"presetIndex" : 200
			},
			success: function(data) {
				setTimeout(function(){
					if(action == 0){
						videoControlSubmit(obj, 1);
					}
				}, 1000 * 10)
			},
			error: function(XMLHttpRequest, textStatus, errorThrown) {
				alert("摄像他控制失败");
			}
		});
	}
}


/**
 * 获得摄像头播放URL
 * @param {Object} videoPlayerCameraCode 摄像头ID
 */
function loadCameraPlayUrl(videoPlayerCameraCode){
	
	$.ajax({
		url : serverUrl + "/camera/play",
		type: 'post',
		dataType: 'json',
		timeout: 30000,
		async:true,
		data:{
			"id" : videoPlayerCameraCode,
			"stream" : 0,
			"protocol" : "hls"
		},
		success: function(result) {
			
			if(result.code == 0 || result.code === "0"){
				if(null != result.data.url && undefined != result.data.url && "" !== result.data.url){
					//是否播放选中的摄像头
					//data.url
						vedioPlay(result.data.url)
			
				}else{
					
				}
			}
			
		},
		error: function(XMLHttpRequest, textStatus, errorThrown) {
				
		}
	});
}


/**
 * 播放hls流
 * @param {Object} playUrl
 */
function vedioPlay (playUrl){
	
		player = videojs('vedio', {
			controls: false,
			autoplay: true,
			techOrder: ['html5','flash'] // 强制使用flash
		})

		player.src(playUrl);

		player.ready(function() {
			player.on('error', function(e) {
				
				if(e.target.player.error_.code == 2) {
					// 说明连接操错误

					console.log("通道网络连接错误");
					/* 	if(parent && parent.getNewChannel) {
							parent.getNewChannel(cid, this);
						} */
				}

			})

			var bon = player.play();
			bon.catch(function(e) {
				$(".vjs-big-play-button").show();

				$(".vjs-big-play-button").click(function() {
					$(".vjs-big-play-button").hide();
				})
			})

		});
}


$(function() {
	videojs.options.flash.swf = 'video-js.swf';

	videoPlayerCameraCode = getUrlParam('cid');
	
	if(videoPlayerCameraCode){
			loadCameraPlayUrl(videoPlayerCameraCode);
	}
	else {
		console.info("请传入传入摄像头ID")
	}
	


})