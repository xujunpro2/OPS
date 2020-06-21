import deptService from '@/api/dept'


const actions = {
    getDeptTree(context) {
        return new Promise((resolve,reject)=>{
            deptService.getTree().then(data=>{
                resolve(data);
            }).catch(()=>{
                reject();
            })
        })
    },
    addDept(context, dept) {
        return new Promise((resolve,reject)=>{
            deptService.addDept(dept).then(data=>{
                resolve();
            }).catch(()=>{
                reject();
            })
        })
    },
    updateDept(context, dept) {
        return new Promise((resolve,reject)=>{
            deptService.updateDept(dept).then(data=>{
                resolve();
            }).catch(()=>{
                reject();
            })
        })
    },
    deleteDept(context, deptId) {
        return new Promise((resolve,reject)=>{
            deptService.deleteDept(deptId).then(data=>{
                resolve();
            }).catch(()=>{
                reject();
            })
        })
    },
    getUserCountByDept(context,deptId){
        return new Promise((resolve,reject)=>{
            deptService.getUserCountByDept(deptId).then(data=>{
                resolve(data);
            }).catch(()=>{
                reject();
            })
        })
    },
    getUserPageByDept(context,query){
        return new Promise((resolve,reject)=>{
            deptService.getUserPageByDept(query.deptId,query.startIndex,query.rows).then(data=>{
                resolve(data);
            }).catch(()=>{
                reject();
            })
        })
    }
}

export default {
    namespaced: true,
    actions
}