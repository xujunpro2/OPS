/*
 * option参数结构
 * [	
 * 		{id:101,position:[x,y,z], text:{label:"水温:23℃",font:"16px 微软雅黑",color:"#000"}}
 * ]
 * id:每个label的id，用于变更某个label的时候，可以根据id去update
 */
function LabelPlugin(option)
{
    this._initialized = false;
    this._caculatePosition = false;
    this.name = "label";
    if(option)
    {
    	 this.option = option;
    	 //传来的参数是构件ID，需要计算一次position
    	 var self = this;
    	 this.option.forEach(function(optionItem){
    	 	if(optionItem.prodId)
    	 	{
    	 		self._caculatePosition = true;
    	 	}
    	 })
    }
   	else
   	{
   		this.option = [];
   	}
}


LabelPlugin.prototype._initShader = function()
{
    var gl = this.viewer._gl;

    //创建和编译着色器程序
    var VSHADER_SRC = 'attribute vec3 aPos;' + //顶点坐标
        'attribute vec2 texCoord;' + //纹理坐标
        'varying vec2 vtexCoord;' + //顶点和片元着色器共享纹理坐标
        'varying vec4 vIdColor;' +
        'vec4 getIdColor(float id){float product = floor(id + 0.5);float B = floor(product / (256.0*256.0)); float G = floor((product - B * 256.0*256.0) / 256.0); float R = mod(product, 256.0);return vec4(R / 255.0,G / 255.0,B / 255.0,1.0); }' +
        'void main() {' +
        '   vIdColor = getIdColor(8200000.0);' +
        '   gl_Position = vec4(aPos, 1.0);' +
        '   vtexCoord = texCoord;' + //将纹理坐标传递给片元着色器
        '}';
    var FSHADER_SRC = 'precision mediump float;' +
        'varying vec2 vtexCoord;' + //顶点和片元着色器共享纹理坐标，着色时使用，其实就是顶点着色器定义的attribute vec2 texCoord;
        'uniform sampler2D u_Sampler;' +
        'varying vec4 vIdColor;' +
        'uniform bool uColorCoding;' +
        'void main() {' +
        '	if(uColorCoding){gl_FragColor = vIdColor;}' +
        '	else{gl_FragColor = texture2D(u_Sampler, vtexCoord);}' +
        '}';

    const fShader = gl.createShader(gl.FRAGMENT_SHADER)
    const vShader = gl.createShader(gl.VERTEX_SHADER)
    // 将着色器源码写入对象
    gl.shaderSource(vShader, VSHADER_SRC)
    gl.shaderSource(fShader, FSHADER_SRC)
    // 编译着色器
    gl.compileShader(vShader)
    gl.compileShader(fShader)
    // 创建程序
    this._shader = gl.createProgram()
    // 程序绑定着色器
    gl.attachShader(this._shader, vShader)
    gl.attachShader(this._shader, fShader)
    // 链接程序
    gl.linkProgram(this._shader)
}
LabelPlugin.prototype._initPointer = function()
{
    //将position的世界坐标计算为webgl坐标
    var gl = this.viewer._gl;
    //使用shader之后才能获取变量,并且变量如果只定义但不使用，是获取不到内存指针的
    gl.useProgram(this._shader);

    //创建顶点坐标缓冲区对象
    this._aPos = gl.getAttribLocation(this._shader, 'aPos');
    gl.enableVertexAttribArray(this._aPos);
    this._vertexBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, this._vertexBuffer);
    //创建纹理坐标缓冲区对象
    this._texCoord = gl.getAttribLocation(this._shader, "texCoord");
    gl.enableVertexAttribArray(this._texCoord);
    this._texBuffer = gl.createBuffer();
    var texVertices = new Float32Array([
    	0.0, 1.0, //左上
        0.0, 0.0, //左下
        1.0, 1.0, //右上
        1.0, 0.0 //右下
    ]);
    gl.bindBuffer(gl.ARRAY_BUFFER, this._texBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, texVertices, gl.STATIC_DRAW);

    this._texture = gl.createTexture(); //创建纹理对象
    this._u_Sampler = gl.getUniformLocation(this._shader, "u_Sampler"); //获取u_Sampler的存储位置

    //是否启用uColorCoding，这个是在pick的时候为true
    this._colourCoding = gl.getUniformLocation(this._shader, "uColorCoding");
    //做完一切之后，记得恢复原来的bim shader
    gl.useProgram(this.viewer._shaderProgram);
}

LabelPlugin.prototype._drawItem = function(optionItem)
{
	var labelImage = optionItem.image;
	var position = optionItem.position;
	if(!labelImage || !position)
	{
		return;
	}
	
    var gl = this.viewer._gl;
    //模拟一个坐标点 
    var glVec3 = this.viewer.wcsToGL(position); //[x,y,z] ,左下点
    var dimesion = this._calculateDimension(glVec3, labelImage.width, labelImage.height);
    var w = dimesion[0];
    var h = dimesion[1];
  
  	//标签对应的矩形4个顶点坐标
    var vertices = new Float32Array([
    	glVec3[0], glVec3[1] + h, glVec3[2], //左上
        glVec3[0], glVec3[1], glVec3[2], //左下
        glVec3[0] + w, glVec3[1] + h, glVec3[2], //右上
        glVec3[0] + w, glVec3[1], glVec3[2]
    ]); //右下
    
	
    //设置顶点数据,注意先要调用bindBuffer，因为gl通常会定义多个buffer
    gl.bindBuffer(gl.ARRAY_BUFFER, this._vertexBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, vertices, gl.STATIC_DRAW);
    gl.vertexAttribPointer(this._aPos, 3, gl.FLOAT, false, 0, 0); //每个顶点读取3个数字，不 足用0补充

    //设置纹理坐标数据,注意先要调用bindBuffer，因为gl通常会定义多个buffer
    gl.bindBuffer(gl.ARRAY_BUFFER, this._texBuffer);
    gl.vertexAttribPointer(this._texCoord, 2, gl.FLOAT, false, 0, 0); //每个顶点读取2个数字，不 足用0补充

    //纹理绘制 一定要在draw中
    gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, 1); //对纹理图像进行y轴反转
    gl.activeTexture(gl.TEXTURE0); //开启0号纹理单元
    gl.bindTexture(gl.TEXTURE_2D, this._texture); //向target绑定纹理对象
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR); //配置纹理参数
    //webGL纹理贴图像素必须是2的幂次方，譬如64*64，128*128,但canvas生成的可能不是这个size，所以要做个设置
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, labelImage); //采用RGBA才能绘制png透明
    gl.uniform1i(this._u_Sampler, 0); //将0号纹理传递给着色器
    //画了
    gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4); //画连接三角
}
LabelPlugin.prototype._calculateDimension = function(position, width, height)
{
    var onePixWidth = 2 / this.viewer._width; //X方向一个像素折合webgl是多少
    var onePixHeight = 2 / this.viewer._height; //Y方向一个像素折合webgl是多少
    var dimesion = [onePixWidth * width, onePixHeight * height];
    return dimesion;
}
//创建文字图片
LabelPlugin.prototype._createImage = function(item)
{
	var self = this;
    var canvas = this._drawText(item.text.label, item.text.font,item.text.color);
    var image = new Image();
    image.src = canvas.toDataURL();
    image.width = canvas.width / 2; //canvas是按照2倍尺寸绘制的
    image.height = canvas.height / 2;
    item.image = image;

}
LabelPlugin.prototype._drawText = function(text, fontStyle, color)
{
    var textBounds = this._getTextBounds(text, fontStyle);
    var width = textBounds[0] + 10; //左右留白10px
    var height = textBounds[1];
    var canvas = document.createElement("canvas");
    var ctx = canvas.getContext("2d");
    var ratio = 2; //2倍绘制，解决canvas绘制文字模糊的问题
    ctx.canvas.width = width * ratio;
    ctx.canvas.height = height * ratio;

    ctx.scale(ratio, ratio);

    //画个背景测试下
    //  ctx.rect(0, 0, width, height);
    //  ctx.fillStyle = "rgba(255,255,255,1.1)";
    //  ctx.fill();

    ctx.font = fontStyle;
    ctx.textAlign = "center"; //水平居中
    ctx.textBaseline = "middle"; //垂直居中
    if(color)
    {
    	ctx.fillStyle = color;
    }
    else
   	{
   		ctx.fillStyle = "black";
   	}
    ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
    ctx.fillText(text, width / 2, height / 2); //绘制在中间
    return ctx.canvas;
}
//通过span计算文字的bounds
LabelPlugin.prototype._getTextBounds = function(text, fontStyle)
{
    var span = document.createElement("span");
    span.style.cssText = "padding:0;visibility:hidden;font:" + fontStyle;
    span.innerHTML = text;
    document.body.appendChild(span);
    var bounds = [span.offsetWidth, span.offsetHeight];
    document.body.removeChild(span);
    return bounds;
}
LabelPlugin.prototype._getLocationForOptionItem = function(bBox, optionItem)
{
	var offset = 100;
	//bBox [0, 0, 0, 4000, 500, 3000] 左下角，右上角[x,z,y]
	//中心点坐标
	var origin = [bBox[0] + bBox[3] / 2.0, bBox[1] + bBox[4] / 2.0, bBox[2] + bBox[5] / 2.0];
	console.info(bBox);
	console.info(origin);
	//当前只支持top
	if(optionItem.location === "top")
	{
		origin[2] = bBox[2] + bBox[5] + offset;
	}
	else if(optionItem.location === "right")
	{
		origin[0] = bBox[0] + bBox[3] + offset;
	}
	return origin;
}

//callback
LabelPlugin.prototype.init = function(xviewer)
{
    this.viewer = xviewer;
    var gl = this.viewer._gl;
    this._shader = null;
    //初始化shader
    this._initShader();
    //定义变量指针和顶点buffer
    this._initPointer();
   
    var self = this;
	this.option.forEach(function(item){
    	self._createImage(item);
    });
   
    this._initialized = true;
}
LabelPlugin.prototype.draw = function()
{
    if(this.option && this.option.length> 0 && this.option[this.option.length-1].image)
    {
    	if(this._caculatePosition)
	    {
	    	
	        var self = this;
	        //如果option中没有指定position，那么就尝试通过prodId来计算position
	        this.option.forEach(function(optionItem)
	        {
	            //if(optionItem.position == null &&optionItem.prodId != null)
	            if(optionItem.prodId != null)
	            {
	                var prod = self.viewer.getProductMap(optionItem.prodId);
	                if(prod)
	                {
	                    //如果设置了prodId但没有设置location，默认就是top
	                    if(!optionItem.location)
	                    {
	                        optionItem.location = "top";
	                    }
	                    //将计算的最终结果赋给optionItem
	                    optionItem.position = self._getLocationForOptionItem(prod.bBox, optionItem);
	                }
	            }
	        })
	        //下一帧就不用在处理了
	        this._caculatePosition = false;
	    }
    
    	var self = this;
    	this.option.forEach(function(optionItem){
    		self._drawItem(optionItem);
    	})
    }
}

//callback
LabelPlugin.prototype.onBeforeDraw = function()
{
   
}
//callback
LabelPlugin.prototype.onAfterDraw = function()
{
    var gl = this.setActive();
    //设置禁用ColorCoding，用构件真实的颜色绘制
    gl.uniform1i(this._colourCoding, 0);
    this.draw();
    this.setInactive();
}
//_getID中设置完bim的idcolor之后调用onAfterDrawId
LabelPlugin.prototype.onAfterDrawId = function()
{
    var gl = this.setActive();
    //pick使用虚拟色
    gl.uniform1i(this._colourCoding, 1);
    this.draw();
    this.setInactive();
};

LabelPlugin.prototype.setActive = function()
{
    var gl = this.viewer._gl;
    //使用插件的shader
    gl.useProgram(this._shader);
    return gl;
};
LabelPlugin.prototype.setInactive = function()
{
    var gl = this.viewer._gl;
    //恢复bim的shader
    gl.useProgram(this.viewer._shaderProgram);
};
//{id:101,position:[x,y,z], text:{label:"水温:23℃",font:"16px 微软雅黑"}}
//如果是替换文本，可以不传position，会用原来的位置
LabelPlugin.prototype.updateLabel = function(optionItem)
{
	if(this._initialized &&optionItem)
	{
		//先生成图片
		this._createImage(optionItem);
		//如果有同id就替换，否则就add
		var replaceIndex = -1;
		for(var i=0;i<this.option.length;i++)
		{
			if(optionItem.id === this.option[i].id)
			{
				replaceIndex = i;
				break;
			}
		}
		if(replaceIndex != -1)
		{
			//同ID的应该是保留position,注意拷贝数据，而不是直接Array引用
			optionItem.position = [this.option[replaceIndex].position[0],this.option[replaceIndex].position[1],this.option[replaceIndex].position[2]];
			this.option.splice(replaceIndex,1,optionItem);
			this._caculatePosition = true;
		}
		//新增label才可能需要重新计算position
		else
		{
			this.option.push(optionItem);
			if(optionItem.prodId)
			{
				this._caculatePosition = true;
			}
		}
		
		
	}
}
LabelPlugin.prototype.deleteLabel = function(deleteId)
{
	if(this._initialized)
	{
		//如果有同id就替换，否则就add
		var deleteIndex = -1;
		for(var i=0;i<this.option.length;i++)
		{
			if(deleteId === this.option[i].id)
			{
				deleteIndex = i;
				break;
			}
		}
		if(deleteIndex != -1)
		{
			this.option.splice(deleteIndex,1);
		}
	}
}
export default LabelPlugin