class TipPlugin {
    constructor() {
        this.name = "tip";
        this.tips = [];
        this.loaded = false; //这个插件只有在bim加载完成后才能计算postion坐标,需要一个标记
    }
    addTip(tip) {
        //增加一个显示tip的默认属性，为hidAllTips服务
        tip.show = true;
        var containerWidth = tip.width + "px";
        var containerHeight = tip.height + "px";
        //添加锚线svg
        var markSvg = '<svg style="position: absolute;pointer-events: none;" xmlns="http://www.w3.org/2000/svg" version="1.1" width="100" height="30"><path style="fill:none;stroke:#000000;" d="M3 4L100 30"/><ellipse rx="3" ry="3" style="fill:#00000,stroke:none;" cx="3" cy="3"/></svg> ';
        tip.arrow = this._createDom(markSvg);
        //如果添加到body中，需要多一次计算控件坐标到浏览器坐标的损耗，所以要求canvas上面套一个div，这样就append到这个div中
        //注意要设置这个div的position: relative;
        this.viewer._canvas.parentNode.appendChild(tip.arrow);
        //document.body.appendChild(tip.arrow);
        //添加容器div
        var containerDiv = '<div style="position: absolute;width: ' + containerWidth + ';height: ' + containerHeight + ';' +
            'text-align:center;padding: 5px;border: 2px solid #000;border-radius:8px"></div>';
        tip.container = this._createDom(containerDiv);
        tip.container.innerHTML = tip.html;
        this.viewer._canvas.parentNode.appendChild(tip.container);
        //document.body.appendChild(tip.container);
        //添加到数组中
        this.tips.push(tip);
        //如果是点击按钮触发addTip()，那么焦点不在canvas上，bimi做了性能优化，此时不会触发绘制，也就不会触发onAfterDraw
        //所以，为了点击按钮后立刻看到tip，这里手工调用一次_refreshTip，让tip的postion立即刷新
        this._refreshTip(tip);
    }
    removeTip(tipId) {
        let index = -1;
        for (let i = 0; i < this.tips.length; i++) {
            let tip = this.tips[i];
            if (tip.id === tipId) {
                tip.arrow.remove();
                tip.arrow = null;
                tip.container.remove();
                tip.container = null;
                tip.html = '';
                index = i;
                break;
            }
        }
        //从数组中删除
        if (index > -1) {
            this.tips.splice(index, 1);
        }
    }
    hidAllTips(){
        //遍历处理
        this.tips.forEach(tip => {
            tip.show = false;
            this._refreshTip(tip);
        });
        //刷新下
    }

    _createDom(domStr) {
        var tempNode = document.createElement('div');
        tempNode.innerHTML = domStr;
        return tempNode.firstChild;
    }

    init(xviewer) {
        this.viewer = xviewer;
        var gl = this.viewer._gl;
    }
    onLoaded(event) {
        this.loaded = true;
    }
    onBeforeDraw() {}
    onBeforePick(id) {}
    onAfterDraw() {
        //遍历处理
        this.tips.forEach(tip => {
            this._refreshTip(tip);
        });
    }
    _refreshTip(tip) {
        if (!this.loaded) {
            return;
        }
        //tip是否要显示,如果不显示，就不用计算坐标了
        tip.show ? tip.arrow.style.display = 'block':tip.arrow.style.display = 'none';
        tip.show ? tip.container.style.display = 'block':tip.container.style.display = 'none';
        if(!tip.show){
            return;
        }
        //如果绑定了构件，那么就只会计算一次，以后直接使用postion
        if (tip.postion) {
            this._refreshPostion(tip);
        } else if (tip.prodId) {
            var prodOrigin = this.viewer.getProdOrigin(tip.prodId);
            tip.postion = prodOrigin;
            this._refreshPostion(tip);
        }
    }
    _refreshPostion(tip) {
        var t = this.viewer.wcsToView(tip.postion);
        tip.arrow.style.left = t[0];
        tip.arrow.style.top = t[1];
        tip.container.style.left = (t[0] + 99) + "px";
        var height = tip.container.offsetHeight - 4;
        tip.container.style.top = (t[1] + 30 - height) + "px";
    }
    onBeforeDrawId() {}
    onAfterDrawId() {}
    onBeforeGetId(id) {}
    draw() {}
}

export default TipPlugin