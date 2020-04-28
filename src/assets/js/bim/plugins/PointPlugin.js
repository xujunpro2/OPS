class PointPlugin {
    constructor(option) {
        this._initialized = false;
        this.vertices = option.vertices;
        this.pointCount = option.vertices.length / 3;//计算有几个point
        this.ids = option.ids;
        this.colors = option.colors;
        this.name="point";
    }
    init(xviewer) {
        this.viewer = xviewer;
        this._shader = null;
        //初始化shader
        this._initShader();
        //定义变量指针和顶点buffer
        this._initPointer();
        this._initialized = true;
    }
    onLoaded(event) { }
    onBeforeDrawId() { }
    _initShader() {
        let gl = this.viewer._gl;
        //vIdColor是在getID的时候(uColorCoding=true)用来绘制到内存中的色，注意这个颜色并不会显示在画布上，这个颜色是根据构件ID产生的唯一色
        //aColor是构件的真实颜色,由用户输入
        //vColor是用来将aColor传递到fshader中定义的变量
        //当pick操作的时候，设置uColorCoding=true,此时内存绘制ID色,画布上并不显示，但通过gl.readPixels读取的是内存ID色，就可以获得鼠标点击位置的构件ID
        //获得之后，再恢复uColorCoding=false
        const VSHADER_SRC = 'varying vec4 vIdColor; varying vec4 vColor;attribute vec4 aColor;attribute highp float aId; attribute vec3 aPos;  uniform mat4 uMVMatrix; uniform mat4 uPMatrix; vec4 getIdColor(float id){ float product = floor(id + 0.5); float B = floor(product / (256.0*256.0)); float G = floor((product - B * 256.0*256.0) / 256.0); float R = mod(product, 256.0); return vec4(R / 255.0, G / 255.0, B / 255.0, 1.0); } void main() {gl_Position = uPMatrix * uMVMatrix * vec4(aPos,1.0);gl_PointSize = 8.0;vIdColor = getIdColor(aId); vColor = aColor;}';
        const FSHADER_SRC = " precision mediump float; varying vec4 vIdColor; varying vec4 vColor;uniform bool uColorCoding; void main() {if(uColorCoding){gl_FragColor = vIdColor;}else{gl_FragColor=vColor;} }";
        const fShader = gl.createShader(gl.FRAGMENT_SHADER);
        const vShader = gl.createShader(gl.VERTEX_SHADER);
        // 将着色器源码写入对象
        gl.shaderSource(vShader, VSHADER_SRC);
        gl.shaderSource(fShader, FSHADER_SRC);
        // 编译着色器
        gl.compileShader(vShader);
        gl.compileShader(fShader);
        // 创建程序
        this._shader = gl.createProgram();
        // 程序绑定着色器
        gl.attachShader(this._shader, vShader);
        gl.attachShader(this._shader, fShader);
        // 链接程序
        gl.linkProgram(this._shader);
    }
    _initPointer() {
        let gl = this.viewer._gl;
        //使用shader之后才能获取变量,并且变量如果只定义但不使用，是获取不到内存指针的
        gl.useProgram(this._shader);
        //模型矩阵和视角矩阵，后面将viewer的两个矩阵赋给它们 
        this._uModelViewMatrix = gl.getUniformLocation(this._shader, "uMVMatrix");
        this._uProjectionMatrix = gl.getUniformLocation(this._shader, "uPMatrix");
        //顶点坐标
        this._aPos = gl.getAttribLocation(this._shader, 'aPos');
        //构件ID，根据这个计算idColor
        this._idAttrPointer = gl.getAttribLocation(this._shader, "aId"),
            //是否启用uColorCoding，这个是在pick的时候为true
            this._colourCoding = gl.getUniformLocation(this._shader, "uColorCoding");
        //构件真实颜色
        this._aColor = gl.getAttribLocation(this._shader, 'aColor');
        gl.enableVertexAttribArray(this._aPos);
        gl.enableVertexAttribArray(this._idAttrPointer);
        gl.enableVertexAttribArray(this._aColor);
        this._vertexBuffer = gl.createBuffer();
        this._idBuffer = gl.createBuffer();
        this._colorBuffer = gl.createBuffer();
        //绑定顶点缓存
        gl.bindBuffer(gl.ARRAY_BUFFER, this._vertexBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, this.vertices, gl.STATIC_DRAW);
        //绑定id缓存
        gl.bindBuffer(gl.ARRAY_BUFFER, this._idBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, this.ids, gl.STATIC_DRAW);
        //绑定color缓存
        gl.bindBuffer(gl.ARRAY_BUFFER, this._colorBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, this.colors, gl.STATIC_DRAW);
        //做完一切之后，记得恢复原来的bim shader
        gl.useProgram(this.viewer._shaderProgram);
    }
    //_getID中设置完bim的idcolor之后调用onAfterDrawId
    onAfterDrawId() {
        let gl = this.setActive();
        //设置禁用ColorCoding，用构件真实的颜色绘制
        gl.uniform1i(this._colourCoding, 1);
        this.draw();
        this.setInactive();
    }
    onAfterDraw() {
        let gl = this.setActive();
        //设置禁用ColorCoding，用构件真实的颜色绘制
        gl.uniform1i(this._colourCoding, 0);
        this.draw();
        this.setInactive();
    }
    ////每个点的颜色
    //PointPlugin.prototype.colors = new Float32Array([
    //	1.0,0.0,0.0,1.0,
    //	0.0,0.0,1.0,1.0,
    //]);
    ////每个点的位置
    //PointPlugin.prototype.vertices = new Float32Array([
    //	//2000.0,-250.0,1500.0,
    //	0,0,0,
    //	4000, 500, 3000,
    //]);
    ////每个点的ID
    //PointPlugin.prototype.ids = new Float32Array([
    //	6000000, //ID通常设置的大一点，但不要超过8200005
    //	6000001,
    //]);
    setActive() {
        let gl = this.viewer._gl;
        //使用插件的shader
        gl.useProgram(this._shader);
        return gl;
    }
    setInactive() {
        let gl = this.viewer._gl;
        //恢复bim的shader
        gl.useProgram(this.viewer._shaderProgram);
    }
    draw() {
        if (!this._initialized) {
            return;
        }
        let gl = this.viewer._gl;
        //gl.disableVertexAttribArray(this._aPos);//关闭array分配，否则vertexAttrib4f不起效果
        //gl.vertexAttrib3f(this._aPos, 2000.0,-250.0,1500.0);
        //gl.enableVertexAttribArray(this._aPos);//启用分配，bim都是用这个的
        //读取顶点数据,注意先要调用bindBuffer，因为gl通常会定义多个buffer
        gl.bindBuffer(gl.ARRAY_BUFFER, this._vertexBuffer);
        gl.vertexAttribPointer(this._aPos, 3, gl.FLOAT, false, 0, 0); //每个顶点读取3个数字，不 足用0补充
        //读取id数据
        gl.bindBuffer(gl.ARRAY_BUFFER, this._idBuffer);
        gl.vertexAttribPointer(this._idAttrPointer, 1, gl.FLOAT, false, 0, 0); //每次读一个
        //读取color数据
        gl.bindBuffer(gl.ARRAY_BUFFER, this._colorBuffer);
        gl.vertexAttribPointer(this._aColor, 4, gl.FLOAT, false, 0, 0); //每个顶点读取4个数字，不 足用0补充
        gl.uniformMatrix4fv(this._uModelViewMatrix, false, this.viewer._mvMatrix);
        gl.uniformMatrix4fv(this._uProjectionMatrix, false, this.viewer._pMatrix);
        // 绘制点
        gl.drawArrays(gl.POINTS, 0, this.pointCount); //从0开始，画几个点
    }
    onBeforeDraw() { }
    onBeforePick(id) { }
    onBeforeGetId(id) { }
}






export default PointPlugin