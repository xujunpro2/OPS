import request from '@/utils/request'
var DirService = function(){

    /**
     * 新建文件夹
     */
    DirService.prototype.addDir = function(dir){
        return request.post("dir/add.action",dir);
    }

    /**
     * 删除文件夹
     */
    DirService.prototype.deleteDir = function(dirId){
        return request.get("dir/delete.action",{params:{dirId:dirId}});
    }
    /**
     * 重命名文件夹
     */
    DirService.prototype.renameDir = function(dir){
        return request.get("dir/rename.action",{params:{dirId:dir.dirId,newName:dir.dirName}});
    }

}
//单例无状态对象，直接导出
const dirService = new DirService();

export default dirService;