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

    getDevPage(context,query){
        return new Promise((resolve,reject)=>{
            request.get('dev/page.action',{params:query}).then(data=>{
                resolve(data);
            })
        })
    },
    getDevCount(context,query){
        return new Promise((resolve,reject)=>{
            request.get('dev/count.action',{params:query}).then(data=>{
                resolve(data);
            })
        })
    },
    //异步返回taskId
    importByIFC(context,ifcName){
        return new Promise((resolve,reject)=>{
            request.get('dev/importByIFC.action',{params:{ifcName:ifcName}}).then(data=>{
                resolve(data);
            })
        })
    },
    //获得导入任务的进度
    getImportProgress(context,taskId){
        return new Promise((resolve,reject)=>{
            request.get('dev/importProgress.action',{params:{taskId:taskId}}).then(data=>{
                resolve(data);
            })
        })
    },
     //进度100%之后，删除服务器上的进度缓存
     deleteImportProgress(context,taskId){
        return new Promise((resolve,reject)=>{
            request.get('dev/deleteImportProgress.action',{params:{taskId:taskId}}).then(data=>{
                resolve(data);
            })
        })
    },
    addDevBasic(context,query){
        return new Promise((resolve,reject)=>{
            request.post('dev/addBasic.action',query).then(data=>{
                resolve(data);
            })
        })
    },
    updateDevBasic(context,query){
        return new Promise((resolve,reject)=>{
            request.post('dev/updateBasic.action',query).then(data=>{
                resolve(data);
            })
        })
    },
    deleteDev(context,devId){
        return new Promise((resolve,reject)=>{
            request.get('dev/delete.action',{params:{devId:devId}}).then(data=>{
                resolve(data);
            })
        })
    },
    bindProduct(context,param){
        return new Promise((resolve,reject)=>{
            request.get('dev/binding.action',{params:param}).then(data=>{
                resolve(data);
            })
        })
    },
}

export default {
    namespaced: true,
    actions
}