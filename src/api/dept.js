import request from '@/utils/request'
var DeptService = function(){

    /**
     * 获得部门树结构
     */
    DeptService.prototype.getTree = function(){
        return request.get('dept/tree.action');
    }
    /**
     * 新建部门
     */
    DeptService.prototype.addDept = function(dept){
        return request.post("dept/addDept.action",dept);
    }
    /**
     * 修改部门
     */
    DeptService.prototype.updateDept = function(dept){
        return request.post("dept/updateDept.action",dept);
    }
    /**
     * 删除部门
     */
    DeptService.prototype.deleteDept = function(deptId){
        return request.post("dept/deleteDept.action",{deptId:deptId});
    }
    /**
     * 根据部门查询用户数量
     */
    DeptService.prototype.getUserCountByDept = function(deptId){
        
        return request.get("dept/userCount.action",{ params: {deptId:deptId} });
    }
    /**
     * 根据部门查询用户分页
     */
    DeptService.prototype.getUserPageByDept = function(deptId,startIndex,rows){
        return request.get("dept/userPage.action",{ params: {deptId:deptId,startIndex:startIndex,rows:rows} });
    }
}
//单例无状态对象，直接导出
const deptService = new DeptService();

export default deptService;