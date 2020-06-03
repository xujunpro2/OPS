import request from '@/utils/request'

const actions = {
    getDevTypeList(context){
        return new Promise((resolve,reject)=>{
            request.get('dev/typeList.action').then(data=>{
                resolve(data);
            })
        })
    },
    addType(context,param){
        return new Promise((resolve,reject)=>{
            request.get('dev/addType.action',{params:param}).then(data=>{
                resolve(data);
            })
        })
    },
    updateType(context,param){
        return new Promise((resolve,reject)=>{
            request.get('dev/updateType.action',{params:param}).then(data=>{
                resolve(data);
            })
        })
    },
    deleteType(context,typeId){
        return new Promise((resolve,reject)=>{
            request.get('dev/deleteType.action',{params:{typeId:typeId}}).then(data=>{
                resolve(data);
            })
        })
    },
    getSpaceList(context){
        return new Promise((resolve,reject)=>{
            request.get('dev/spaceList.action').then(data=>{
                resolve(data);
            })
        })
    },
    getSpaceTree(context){
        return new Promise((resolve,reject)=>{
            request.get('dev/spaceTree.action').then(data=>{
                resolve(data);
            })
        })
    },
    addSpace(context,param){
        return new Promise((resolve,reject)=>{
            request.get('dev/addSpace.action',{params:param}).then(data=>{
                resolve(data);
            })
        })
    },
    updateSpace(context,param){
        return new Promise((resolve,reject)=>{
            request.get('dev/updateSpace.action',{params:param}).then(data=>{
                resolve(data);
            })
        })
    },
    deleteSpace(context,spaceId){
        return new Promise((resolve,reject)=>{
            request.get('dev/deleteSpace.action',{params:{spaceId:spaceId}}).then(data=>{
                resolve(data);
            })
        })
    },
}

export default {
    namespaced: true,
    actions
}