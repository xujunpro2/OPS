import SimpleBar from './simpleBar'
import WindRose from './windRose'
import Pie from './pie'
import MultiTagLine from './multiTagLine'

var EChartsManager = function(rtda){
    EChartsManager.prototype.init = function(rtdaDom){
        //通过<image>节点的占位，计算出图形的占位
        var img = rtdaDom.parentNode;
        var imgX = Number(img.getAttribute('x'));
        var imgY = Number(img.getAttribute('y'));
        var imgWidth = Number(img.getAttribute('width'));
        var imgHeight = Number(img.getAttribute('height'));
        
        var screenStart = rtda.canvasToScreen(imgX,imgY);
        var screenEnd = rtda.canvasToScreen(imgX+imgWidth,imgY+imgHeight);
        var screenWidth = screenEnd.x-screenStart.x;
        var screenHeight = screenEnd.y-screenStart.y;
        //记录下原始尺寸，后面resize的时候要用 
        rtdaDom.setAttribute("orgX",imgX);
        rtdaDom.setAttribute("orgY",imgY);
        rtdaDom.setAttribute("orgWidth",imgWidth);
        rtdaDom.setAttribute("orgHeight",imgHeight);
        //记录下当前画面实际尺寸，图元如果有需要相关像素转比例计算的时候可用(多点折现图)
        rtdaDom.setAttribute("screenWidth",screenWidth);
        rtdaDom.setAttribute("screenHeight",screenHeight);	
        //移除<image>，释放内存
        img.parentNode.removeChild(img);
            
        //创建div容器
        var chartId = rtdaDom.getAttribute('id');
        var chartDiv = document.getElementById(chartId);
        if(!chartDiv)
        {
            var chartDiv = document.createElement('div');
            chartDiv.setAttribute('id',rtdaDom.getAttribute('id'));
            document.body.appendChild(chartDiv);   
        }
        var style = 'position: absolute; top:'+screenStart.y+'px;left:'+screenStart.x+'px; width: '+(screenEnd.x-screenStart.x)+'px;height:'+(screenEnd.y-screenStart.y)+'px;';
        //console.log("echarts占位的DIV的样式:"+style);
        chartDiv.setAttribute('style',style);
        //
        var chart;
        var chartName = rtdaDom.getAttribute('chart-name');
        switch (chartName)
        {
            case 'simpleBar':
                chart = new SimpleBar(rtda,chartDiv,rtdaDom);
                break;
            case 'wind':
                chart = new WindRose(rtda,chartDiv,rtdaDom);
                break;
            case 'pie':
                chart = new Pie(rtda,chartDiv,rtdaDom);
                break;
            case 'multiTagLine':
                chart = new MultiTagLine(rtda,chartDiv,rtdaDom);
                break;
            default:
                console.error('发现未定义的echarts图元:'+chartName);
                break;
        }
        if(chart)
        {
            //全局变量中记录下这个chart的引用，方便后面resize()的操作	
            rtda.chartObjects.push(chart);
            //消息总线
            rtda.addOberserver(chart);
        }
    }
}

export default EChartsManager;