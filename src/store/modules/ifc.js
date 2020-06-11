import request from '@/utils/request'


const actions = {
    getAllIFC(context){
        return new Promise((resolve,reject)=>{
            request.get('ifc/allIFC.action').then(data=>{
                resolve(data);
            })
        })
    },
    getIFCCount(context){
        return new Promise((resolve,reject)=>{
            request.get('ifc/count.action').then(data=>{
                resolve(data);
            })
        })
    },
    getIFCPage(context,query){
        return new Promise((resolve,reject)=>{
            request.get('ifc/page.action',{params:{startIndex:query.startIndex,rows:query.rows}}).then(data=>{
                resolve(data);
            })
        })
    },
    
    addIFC(context, ifc) {
        return new Promise((resolve,reject)=>{
            request.post('ifc/add.action',ifc).then(data=>{
                resolve(data);
            })
        })
    },
    deleteIFC(context, ifcId) {
        return new Promise((resolve,reject)=>{
            request.get("ifc/delete.action",{params:{ifcId:ifcId}}).then(data=>{
                resolve(data);
            })
        })
    },

    ifcUsed(context) {
        return new Promise((resolve,reject)=>{
            request.get("ifc/ifcUsed.action").then(data=>{
                resolve(data);
            })
        })
    },
    
    ifcUsedByUsedKey(context,usedKey) {
        return new Promise((resolve,reject)=>{
            request.get("ifc/ifcUsedByUsedKey.action",{params:{usedKey:usedKey}}).then(data=>{
                resolve(data);
            })
        })
    },

    updateUsed(context,param){
        return new Promise((resolve,reject)=>{
            request.post("ifc/updateIFCUsed.action",param).then(data=>{
                resolve(data);
            })
        })
    },
}

export default {
    namespaced: true,
    actions
}