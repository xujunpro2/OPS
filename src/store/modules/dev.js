import request from '@/utils/request'

const actions = {
    getDevTypeList(context){
        return new Promise((resolve,reject)=>{
            request.get('dev/typeList.action').then(data=>{
                resolve(data);
            }).catch(()=>{
                reject();
            })
        })
    },
    addType(context,param){
        return new Promise((resolve,reject)=>{
            request.get('dev/addType.action',{params:param}).then(data=>{
                resolve(data);
            }).catch(()=>{
                reject();
            })
        })
    },
    updateType(context,param){
        return new Promise((resolve,reject)=>{
            request.get('dev/updateType.action',{params:param}).then(data=>{
                resolve(data);
            }).catch(()=>{
                reject();
            })
        })
    },
    deleteType(context,typeId){
        return new Promise((resolve,reject)=>{
            request.get('dev/deleteType.action',{params:{typeId:typeId}}).then(data=>{
                resolve(data);
            }).catch(()=>{
                reject();
            })
        })
    },
    getSpaceList(context){
        return new Promise((resolve,reject)=>{
            request.get('dev/spaceList.action').then(data=>{
                resolve(data);
            }).catch(()=>{
                reject();
            })
        })
    },
    getSpaceTree(context){
        return new Promise((resolve,reject)=>{
            request.get('dev/spaceTree.action').then(data=>{
                resolve(data);
            }).catch(()=>{
                reject();
            })
        })
    },
    addSpace(context,param){
        return new Promise((resolve,reject)=>{
            request.get('dev/addSpace.action',{params:param}).then(data=>{
                resolve(data);
            }).catch(()=>{
                reject();
            })
        })
    },
    updateSpace(context,param){
        return new Promise((resolve,reject)=>{
            request.get('dev/updateSpace.action',{params:param}).then(data=>{
                resolve(data);
            }).catch(()=>{
                reject();
            })
        })
    },
    deleteSpace(context,spaceId){
        return new Promise((resolve,reject)=>{
            request.get('dev/deleteSpace.action',{params:{spaceId:spaceId}}).then(data=>{
                resolve(data);
            }).catch(()=>{
                reject();
            })
        })
    },

    getDevPage(context,query){
        return new Promise((resolve,reject)=>{
            request.get('dev/page.action',{params:query}).then(data=>{
                resolve(data);
            }).catch(()=>{
                reject();
            })
        })
    },
    getDevCount(context,query){
        return new Promise((resolve,reject)=>{
            request.get('dev/count.action',{params:query}).then(data=>{
                resolve(data);
            }).catch(()=>{
                reject();
            })
        })
    },
    //异步返回taskId
    importByIFC(context,ifcName){
        return new Promise((resolve,reject)=>{
            request.get('dev/importByIFC.action',{params:{ifcName:ifcName}}).then(data=>{
                resolve(data);
            }).catch(()=>{
                reject();
            })
        })
    },
    //获得导入任务的进度
    getImportProgress(context,taskId){
        return new Promise((resolve,reject)=>{
            request.get('dev/importProgress.action',{params:{taskId:taskId}}).then(data=>{
                resolve(data);
            }).catch(()=>{
                reject();
            })
        })
    },
     //进度100%之后，删除服务器上的进度缓存
     deleteImportProgress(context,taskId){
        return new Promise((resolve,reject)=>{
            request.get('dev/deleteImportProgress.action',{params:{taskId:taskId}}).then(data=>{
                resolve(data);
            }).catch(()=>{
                reject();
            })
        })
    },
    addDevBasic(context,query){
        return new Promise((resolve,reject)=>{
            request.post('dev/addBasic.action',query).then(data=>{
                resolve(data);
            }).catch(()=>{
                reject();
            })
        })
    },
    updateDevBasic(context,query){
        return new Promise((resolve,reject)=>{
            request.post('dev/updateBasic.action',query).then(data=>{
                resolve(data);
            }).catch(()=>{
                reject();
            })
        })
    },
    deleteDev(context,devId){
        return new Promise((resolve,reject)=>{
            request.get('dev/delete.action',{params:{devId:devId}}).then(data=>{
                resolve(data);
            }).catch(()=>{
                reject();
            })
        })
    },
    bindProduct(context,param){
        return new Promise((resolve,reject)=>{
            request.get('dev/binding.action',{params:param}).then(data=>{
                resolve(data);
            }).catch(()=>{
                reject();
            })
        })
    },

    getDevBakPage(context,query){
        return new Promise((resolve,reject)=>{
            request.get('dev/bakPage.action',{params:query}).then(data=>{
                resolve(data);
            }).catch(()=>{
                reject();
            })
        })
    },
    getDevBakCount(context,query){
        return new Promise((resolve,reject)=>{
            request.get('dev/bakCount.action',{params:query}).then(data=>{
                resolve(data);
            }).catch(()=>{
                reject();
            })
        })
    },
    addBak(context,query){
        return new Promise((resolve,reject)=>{
            request.post('dev/addBak.action',query).then(data=>{
                resolve(data);
            }).catch(()=>{
                reject();
            })
        })
    },
    updateBak(context,query){
        return new Promise((resolve,reject)=>{
            request.post('dev/updateBak.action',query).then(data=>{
                resolve(data);
            }).catch(()=>{
                reject();
            })
        })
    },
    deleteBak(context,devId){
        return new Promise((resolve,reject)=>{
            request.get('dev/deleteBak.action',{params:{devId:devId}}).then(data=>{
                resolve(data);
            }).catch(()=>{
                reject();
            })
        })
    },

    bakChange(context,param){
        return new Promise((resolve,reject)=>{
            request.get('dev/bakChange.action',{params:param}).then(data=>{
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