import dirService from '@/api/dir'


const actions = {
    addDir(context, dir) {
        return new Promise((resolve,reject)=>{
            dirService.addDir(dir).then(data=>{
                resolve();
            })
        })
    },
    deleteDir(context, dirId) {
        return new Promise((resolve,reject)=>{
            dirService.deleteDir(dirId).then(data=>{
                resolve();
            })
        })
    },
    renameDir(context, dir) {
        return new Promise((resolve,reject)=>{
            dirService.renameDir(dir).then(data=>{
                resolve();
            })
        })
    },
    rootIFCDirs(context){
        return new Promise((resolve,reject)=>{
            dirService.rootIFCDirs().then(data=>{
                resolve(data);
            })
        })
    },
    childDirsAndIFCS(context,parentId){
        return new Promise((resolve,reject)=>{
            dirService.childDirsAndIFCS(parentId).then(data=>{
                resolve(data);
            })
        })
    },
}

export default {
    namespaced: true,
    actions
}