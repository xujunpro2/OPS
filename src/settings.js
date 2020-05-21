
export default {
    title: 'LETS OPS System',
    fixedHeader: true,
    websocket: () => {
        //js获得当前服务器IP和端口
        var curPath = window.document.location.href;
        //如果url中包含了xsw，那么表示是正式部署到tomcat上了,node开发环境下的url不会包含xsw的
        if (curPath.indexOf('xsw') != -1) 
        {
            //获取当前网址，
            var host = window.document.location.host; //ip:port
            return 'ws://' + host + '/ops/websocket';
        } 
        else 
        {
            return 'ws://127.0.0.1:8080/ops/websocket';
        }
    },
    server:()=>{
         //js获得当前服务器IP和端口
         var curPath = window.document.location.href;
         //如果url中包含了xsw，那么表示是正式部署到tomcat上了,node开发环境下的url不会包含xsw的
         if (curPath.indexOf('xsw') != -1) 
         {
            return '';//发行版本
         } 
         else 
         {
             return 'http://127.0.0.1:8080/ops/';
         }
    }
    //websocket:'ws://127.0.0.1:8088/xsw/websocket',
    //server:'' //发行版本
    //server: 'http://127.0.0.1:8080/xsw/' //考虑到统一部署，ajax请求相对路径不能以/开头
}
