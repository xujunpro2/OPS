import request from '@/utils/request'


// return request.post('/auth/credentials', { userName, password })
// return request.get('/user', { params: { id } })

var UVService = function(){
    /**
     * 登陆
     */
    UVService.prototype.login = function(userInfo){
        return request.post('uv/login.action', userInfo);
    }
    /**
     * 注销
     */
    UVService.prototype.logout = function(){
        return request.post('uv/logout.action');
    }
    /**
     * 获得当前用户信息
     */
    UVService.prototype.getUerInfo = function(){
        return request.get('uv/getUser.action');
    }
    /**
     * 修改用户信息
     */
    UVService.prototype.setUser = function(user){
        return request.post('uv/setUser.action', user);
    }
    /**
     * 新建用户
     */
    UVService.prototype.addUser = function(user){
        return request.post('uv/addUser.action', user);
    }
    /**
     * 删除用户
     */
    UVService.prototype.deleteUser = function(userId){
        return request.post('uv/deleteUser.action', {userId:userId});
    }
    
    /** 获得角色信息列表 */
    UVService.prototype.getRules = function(){
        return request.get('uv/getRules.action');
    }
    /** 设置角色信息 */
    UVService.prototype.setRule = function(ruleInfo){
        return request.post('uv/setRule.action', ruleInfo);
    }
    /** 新建角色 */
    UVService.prototype.addRule = function(ruleInfo){
        return request.post("uv/addRule.action",ruleInfo);
    }
    /** 删除角色 */
    UVService.prototype.deleteRule = function(ruleId){
        return request.post("uv/deleteRule.action",{ruleId:ruleId});
    }
    /**
     * 获得当前用户个性化设置
     */
    UVService.prototype.getUerSpecail = function(userId){
        return request.get('uv/getUserSpecail.action',{ params: { userId:userId } });
    }
    /**
     * 设置当前用户个性化设置
     */
    UVService.prototype.setUerSpecail = function(paramObj){
        return request.post('uv/setUserSpecail.action',paramObj);
    }
}
//单例无状态对象，直接导出
const uvService = new UVService();

export default uvService;