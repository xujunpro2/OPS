import { ProductState } from "@/assets/js/bim/bim";
class FlashPlugin {
    constructor(option) {
        if (option && option.colors) {
            this.alarmColors = option.colors;
        }
        else {
            this.alarmColors = [[255, 0, 0, 255], [255, 173, 33, 255]]; //默认颜色
        }
        this.prodIds = [];
        this.interval = null;
        this.name="flash";
    }
    start() {
        var index =  ProductState.UNSTYLED;
        this.interval = setInterval(()=> {
            index == 0 ? index = ProductState.UNSTYLED : index = 0;
            if (this.prodIds.length > 0) {
                this.viewer.setStyle(index, this.prodIds);
            }
        }, 500);
    }
    stop(){
        if(this.interval)
        {
            clearInterval(this.interval);
        }
    }
    addProds(prodIds) {
        //合并数组
        this.prodIds = this.prodIds.concat(prodIds);
    }
    removeProds(prodIds) {
        prodIds.forEach((prodId)=> {
            var index = this.prodIds.indexOf(prodId);
            if (index > -1) {
                this.prodIds.splice(index, 1);
            }
        });
        //恢复原始样式
        this.viewer.setStyle(ProductState.UNSTYLED, prodIds);
    }
    init(xviewer) {
        this.viewer = xviewer;
        var gl = this.viewer._gl;
        this.viewer.defineStyle(0, this.alarmColors[0]);
        this.viewer.defineStyle(1, this.alarmColors[1]);
        this.start();
    }
    onLoaded(event) {}
    onBeforeDraw() {}
    onBeforePick(id) { }
    onAfterDraw() {}
    onBeforeDrawId() { }
    onAfterDrawId() { }
    onBeforeGetId(id) { }
    draw() { }
}
export default FlashPlugin