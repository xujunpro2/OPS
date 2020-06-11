import request from '@/utils/request'

const actions = {
    
    queryPlan(context,param){
        return new Promise((resolve,reject)=>{
            request.get('ops/queryPlan.action',{params:param}).then(data=>{
                resolve(data);
            })
        })
    },

    addPlan(context,param){
        return new Promise((resolve,reject)=>{
            request.post('ops/add.action',param).then(data=>{
                resolve(data);
            })
        })
    },
    updatePlan(context,param){
        return new Promise((resolve,reject)=>{
            request.post('ops/update.action',param).then(data=>{
                resolve(data);
            })
        })
    },
    deletePlan(context,planId){
        return new Promise((resolve,reject)=>{
            request.get('ops/delete.action',{params:{planId:planId}}).then(data=>{
                resolve(data);
            })
        })
    },
}

export default {
    namespaced: true,
    actions
}