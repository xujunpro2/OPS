/**用户权限模块 */
import {setToken, removeToken} from '@/utils/auth'
import router, {resetRouter} from '@/router'
import {constantRoutes,getDynamicRoutesByUser,getDynamicRoutesData} from '@/router/routerMap'
import uvService from '@/api/uv'


//可以通过this.$store.state.uv.XX操作
const state = {
    userId:-1,//用户ID
    username: '', //用户名
    rule:null,
    avatar: '', //头像
    myRouter: [], //路由,通过对动态路由定义的拷贝进行编辑
    specail:{} //个性化设置
}

//getter 的返回值会根据它的依赖被缓存起来，且只有当它的依赖值发生了改变才会被重新计算。
const getters = {
    username: state => {
        return state.username;
    },
    currentRouter: state => {
        return state.myRouter;
    }
}


//mutations是暴露给外部通过this.$store.commit调用改变store的接口,注意必须是同步函数
const mutations = {
    SET_USER:(state,user)=>{
        state.username = user.username;
        state.userId = user.userId;
        state.avatar = user.avatar;
        state.rule = {ruleId:user.ruleId,ruleName:user.ruleName};
    },

    SET_ROUTER: (state, router) => {
        resetRouter(); 
        state.myRouter = router
    },
    SET_SPECAIL:(state,specailList) =>{
        let temp = {};
        specailList.forEach(item => {
            temp[item.specialName] = item.specailValue
        });
        state.specail = temp;
    },
    //根据用户的路由数据生成菜单
    CREATE_ROUTER:(state,routesData) =>{
        resetRouter(); 
        //获得动态路由
        let dynimac = getDynamicRoutesByUser(routesData);
        //添加动态路由
        router.addRoutes(dynimac);
        //更新状态数据
        let newRouter = constantRoutes.concat(dynimac);
       
        state.myRouter = newRouter;
    }
}

const actions = {
    /**登陆 */
    login(context, userInfo) {
        return new Promise((resolve, reject) => {
            uvService.login(userInfo).then(async data=>{
               // console.info(data);
                setToken(data.token);
                context.commit("SET_USER",{ userId:data.userId,
                                            username:data.username,
                                            avatar:data.avatar,
                                            ruleId:data.ruleId,
                                            ruleName:data.ruleName});
                context.commit("CREATE_ROUTER",data.routes);
                let userId = data.userId;
                await context.dispatch("getUserSpecail",userId);//调用同模块的另一个action，不需要加模块名称
                resolve();
            })
            .catch(error => {  //这里传递错误给Login.vue，让登陆按钮结束loading状态
                reject(error);
            });
        });
    },
    /**注销 */
    logout(context){
        return new Promise(resolve => {
            uvService.logout().then(data=>{
                context.commit('SET_ROUTER', []);
                removeToken();
                resolve();
            })
            .catch(error => {
                console.log(error);
            });
           
        });
    },
    //根据当前用户token获得router数据,用在页面刷新的时候重新设置state中的myRouter
    refreshRouter(context){
        return new Promise((resolve, reject) => {
            uvService.getUerInfo().then( async data=>{
                context.commit("SET_USER",{ userId:data.userId,
                                            username:data.username,
                                            avatar:data.avatar,
                                            ruleId:data.ruleId,
                                            ruleName:data.ruleName});
                context.commit("CREATE_ROUTER",data.routes);
                //获得用户个性化设置
                await context.dispatch("getUserSpecail",data.userId);//调用同模块的另一个action，不需要加模块名称
                resolve(); //返回then数据
            });
           
        }); 
    },
    getRules(context){
        return new Promise((resolve,reject)=>{
            uvService.getRules().then(data=>{
                resolve(data);
            });
        })
    },
    setRule(context,ruleInfo){
        return new Promise((resolve,reject)=>{
            uvService.setRule(ruleInfo).then(data=>{
                resolve();
            })
        });
    },
    addRule(context,ruleInfo){
        return new Promise( (resolve,reject)=>{
            uvService.addRule(ruleInfo).then(data=>{
                resolve();
            });
        } );
    },
    deleteRule(context,ruleId){
        return new Promise((resolve,reject)=>{
            uvService.deleteRule(ruleId).then(data=>{
                resolve();
            });
        });
    },
    //获得当前系统的可配置菜单，给权限用
    getMenus(context){
        return new Promise((resolve,reject)=>{
            let routesData = getDynamicRoutesData();
            resolve(routesData)
        });
    },
    
    //修改用户信息
    setUser(context,user){
        return new Promise((resolve,reject)=>{
            uvService.setUser(user).then(data=>{
                resolve();   
            })
        })
    },
    //添加信息
    addUser(context,user){
        return new Promise((resolve,reject)=>{
            uvService.addUser(user).then(data=>{
                resolve();   
            })
        })
    },
    //删除用户
    deleteUser(context,userId){
        return new Promise((resolve,reject)=>{
            uvService.deleteUser(userId).then(data=>{
                resolve();   
            })
        })
    },
    //获得用户个性化设置
    getUserSpecail(context,userId){
        return new Promise((resolve,reject)=>{
            uvService.getUerSpecail(userId).then(data=>{
                context.commit("SET_SPECAIL",data);
                resolve();   
            })
        })
    },
    //设置用户个性化设置
    setUserSpecail(context,specail){
        return new Promise((resolve,reject)=>{
            let userId = state.userId;
            let paramObj = {userId:userId,specail:specail};
            uvService.setUerSpecail(paramObj).then(async data=>{
                let userId = state.userId;
                await context.dispatch("getUserSpecail",userId);   
                resolve();
            })
        })
    },
}




export default {
    namespaced: true,
    state,
    getters,
    mutations,
    actions
}