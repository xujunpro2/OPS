import request from '@/utils/request'

const actions = {
    
    queryPlan(context,param){
        return new Promise((resolve,reject)=>{
            request.get('keep/queryPlan.action',{params:param}).then(data=>{
                resolve(data);
            }).catch(()=>{
                reject();
            })
        })
    },

    addPlan(context,param){
        return new Promise((resolve,reject)=>{
            request.post('keep/add.action',param).then(data=>{
                resolve(data);
            }).catch(()=>{
                reject();
            })
        })
    },
    updatePlan(context,param){
        return new Promise((resolve,reject)=>{
            request.post('keep/update.action',param).then(data=>{
                resolve(data);
            }).catch(()=>{
                reject();
            })
        })
    },
    deletePlan(context,planId){
        return new Promise((resolve,reject)=>{
            request.get('keep/delete.action',{params:{planId:planId}}).then(data=>{
                resolve(data);
            }).catch(()=>{
                reject();
            })
        })
    },

    keepPage(context,query){
        return new Promise((resolve,reject)=>{
            request.get('keep/keepPage.action',{params:query}).then(data=>{
                resolve(data);
            }).catch(()=>{
                reject();
            })
        })
    },
    keepCount(context,query){
        return new Promise((resolve,reject)=>{
            request.get('keep/keepCount.action',{params:query}).then(data=>{
                resolve(data);
            }).catch(()=>{
                reject();
            })
        })
    },
    addKeep(context,param){
        return new Promise((resolve,reject)=>{
            request.post('keep/addKeep.action',param).then(data=>{
                resolve(data);
            }).catch(()=>{
                reject();
            })
        })
    },
    findKeep(context,keepId){
        return new Promise((resolve,reject)=>{
            request.get('keep/findKeep.action',{params:{keepId:keepId}}).then(data=>{
                resolve(data);
            }).catch(()=>{
                reject();
            })
        })
    },
    deleteKeep(context,keepId){
        return new Promise((resolve,reject)=>{
            request.get('keep/deleteKeep.action',{params:{keepId:keepId}}).then(data=>{
                resolve(data);
            }).catch(()=>{
                reject();
            })
        })
    },
    //派单
    assignOrder(context,param){
        return new Promise((resolve,reject)=>{
            request.post('keep/assignOrder.action',param).then(data=>{
                resolve(data);
            }).catch(()=>{
                reject();
            })
        })
    },
    //超时
    timeout(context,keepId){
        return new Promise((resolve,reject)=>{
            request.get('keep/timeout.action',{params:{keepId:keepId}}).then(data=>{
                resolve(data);
            }).catch(()=>{
                reject();
            })
        })
    },

    //根据人员ID查询对应的工单列表
    byMemeber(context,memberCode){
        return new Promise((resolve,reject)=>{
            request.get('keep/byMemeber.action',{params:{memberCode:memberCode}}).then(data=>{
                resolve(data);
            }).catch(()=>{
                reject();
            })
        })
    },

    //提交维保记录
    addComplete(context,param){
        return new Promise((resolve,reject)=>{
            request.post('keep/addComplete.action',param).then(data=>{
                resolve(data);
            }).catch(()=>{
                reject();
            })
        })
    },
}

export default {
    namespaced: true,
    actions
}