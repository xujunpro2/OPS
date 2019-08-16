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
    }
}

export default {
    namespaced: true,
    actions
}