import request from '@/utils/request'
var IFCService = function(){
    /**
     * 新增扩展属性
     */
    IFCService.prototype.addExtProperties = function(extProperties){
        
        return request.post("ifc/addExtProperties.action",extProperties);
    }
    /**
     * 编辑扩展属性
     */
    IFCService.prototype.updateExtProperties = function(extProperties){
        
        return request.post("ifc/updateExtProperties.action",extProperties);
    }
    /**
     * 删除一个ifc上传记录
     */
    IFCService.prototype.deleteExtProperties = function(extId){
        return request.get("ifc/deleteExtProperties.action",{params:{extId:extId}});
    }
    /**
     * 查询某个bim构件的扩展属性
     */
    IFCService.prototype.getExtProperties = function(bimId,prodId){
        
        return request.get("ifc/extProperties.action",{ params: {bimId:bimId,prodId:prodId} });
    }
    /**
     * 查询某个用户的ifc文件数量
     */
    IFCService.prototype.getIFCCount = function(userId){
        
        return request.get("ifc/count.action",{ params: {userId:userId} });
    }
    /**
     * 分页查询某个用户的ifc文件
     */
    IFCService.prototype.getIFCPage = function(userId,startIndex,rows){
        return request.get("ifc/page.action",{ params: {userId:userId,startIndex:startIndex,rows:rows} });
    }

     /**
     * ifc文件夹树
     */
    IFCService.prototype.getIFCDir = function(){
        return request.get("dir/ifcDirTree.action");
    }

    /**
     * 新建一个ifc上传记录
     */
    IFCService.prototype.addIFC = function(ifc){
        return request.post("ifc/add.action",ifc);
    }

    /**
     * 删除一个ifc上传记录
     */
    IFCService.prototype.deleteIFC = function(ifcId){
        return request.get("ifc/delete.action",{params:{ifcId:ifcId}});
    }

}
//单例无状态对象，直接导出
const ifcService = new IFCService();

export default ifcService;