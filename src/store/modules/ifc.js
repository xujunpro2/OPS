import ifcService from '@/api/ifc'


const actions = {
    getIFCCount(context,userId){
        return new Promise((resolve,reject)=>{
            ifcService.getIFCCount(userId).then(data=>{
                resolve(data);
            })
        })
    },
    getIFCPage(context,query){
        return new Promise((resolve,reject)=>{
            ifcService.getIFCPage(query.userId,query.startIndex,query.rows).then(data=>{
                resolve(data);
            })
        })
    },
    getIFCDir(context,query){
        return new Promise((resolve,reject)=>{
            ifcService.getIFCDir().then(data=>{
                resolve(data);
            })
        })
    },
    addIFC(context, ifc) {
        return new Promise((resolve,reject)=>{
            ifcService.addIFC(ifc).then(data=>{
                resolve();
            })
        })
    },
    deleteIFC(context, ifcId) {
        return new Promise((resolve,reject)=>{
            ifcService.deleteIFC(ifcId).then(data=>{
                resolve();
            })
        })
    }
}

export default {
    namespaced: true,
    actions
}