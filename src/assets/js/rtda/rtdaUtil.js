function RtdaUtil() {}
 /** 
  * 格式化数字显示方式 
  * 用法 
  * formatNumber(12345.999,'#,##0.00'); 
  * formatNumber(12345.999,'#,##0.##'); 
  * formatNumber(123,'000000'); 
  * @param num 
  * @param pattern 
  */
RtdaUtil.prototype.formatNumber = function (num, pattern) {
    var strarr = num ? num.toString().split('.') : ['0'];
    var fmtarr = pattern ? pattern.split('.') : [''];
    var retstr = '';

    // 整数部分 
    var str = strarr[0];
    var fmt = fmtarr[0];
    var i = str.length - 1;
    var comma = false;
    for (var f = fmt.length - 1; f >= 0; f--) {
        switch (fmt.substr(f, 1)) {
            case '#':
                if (i >= 0) retstr = str.substr(i--, 1) + retstr;
                break;
            case '0':
                if (i >= 0) retstr = str.substr(i--, 1) + retstr;
                else retstr = '0' + retstr;
                break;
            case ',':
                comma = true;
                retstr = ',' + retstr;
                break;
        }
    }
    if (i >= 0) {
        if (comma) {
            var l = str.length;
            for (; i >= 0; i--) {
                retstr = str.substr(i, 1) + retstr;
                if (i > 0 && ((l - i) % 3) == 0) retstr = ',' + retstr;
            }
        } else retstr = str.substr(0, i + 1) + retstr;
    }

    retstr = retstr + '.';
    // 处理小数部分 
    str = strarr.length > 1 ? strarr[1] : '';
    fmt = fmtarr.length > 1 ? fmtarr[1] : '';
    i = 0;
    for (var f = 0; f < fmt.length; f++) {
        switch (fmt.substr(f, 1)) {
            case '#':
                if (i < str.length) retstr += str.substr(i++, 1);
                break;
            case '0':
                if (i < str.length) retstr += str.substr(i++, 1);
                else retstr += '0';
                break;
        }
    }
    return retstr.replace(/^,+/, '').replace(/\.$/, '');
}
//文本转Date，注意只支持formate： yyyy-MM-dd，yyyy-MM-dd HH，yyyy-MM-dd HH：mm ，  yyyy-MM-dd HH:mm:ss
RtdaUtil.prototype.parseToDate = function(dateString){
    //穿过的日期可能不带秒,做0补充
    var dayAndTimeStrs = dateString.split(' ');
    if(dayAndTimeStrs.length == 2)
    {
        var timeStrs = dayAndTimeStrs[1].split(":");
        if(timeStrs.length == 1)
        {
            dateString +=":00:00";
        }
        else if(timeStrs.length == 2)
        {
            dateString +=":00";
        }
        
    }
    var DATE_REGEXP = new RegExp("(\\d{4})-(\\d{2})-(\\d{2})([T\\s](\\d{2}):(\\d{2}):(\\d{2})(\\.(\\d{3}))?)?.*");
   if(DATE_REGEXP.test(dateString))
   {
       //$month-1因为月从0开始，而文本中月是1月开始
       var timestamp = dateString.replace(DATE_REGEXP, function($all,$year,$month,$day,$part1,$hour,$minute,$second,$part2,$milliscond){
           var date = new Date($year, $month-1,$day, $hour||"00", $minute||"00", $second||"00", $milliscond||"00");
               return date.getTime();
           });
       var date = new Date();
       date.setTime(timestamp);
       return date;
   }
   return null;
}

 /**
  * js获得Url参数,但在vue其实是没用的
  */
 RtdaUtil.prototype.getQueryStringByName = function(name)
 {
     var result = decodeURI(location.search).match(new RegExp("[\?\&]" + name + "=([^\&]+)", "i"));
     if(result == null || result.length < 1)
     {
         return "";
     }
     return result[1];
 }

RtdaUtil.prototype.getMapKeys = function(map){
    let keys = new Array();
    let keyIter = map.keys();
    for(let i=0;i<map.size;i++)  
    {  
        let key = keyIter.next().value;
        keys.push(key);
    } 
    return keys;
}
RtdaUtil.prototype.getMapValues = function(map){
    let values = new Array();
    let valIter = map.values();
    for(let i=0;i<map.size;i++)  
    {  
        let v = valIter.next().value;
        values.push(v);
    } 
    return values;
}

var rtdaUtil = new RtdaUtil();
export default rtdaUtil;