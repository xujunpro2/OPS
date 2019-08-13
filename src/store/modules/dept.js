import deptService from '@/api/dept'


const actions = {
    getDeptTree(context) {
        return new Promise((resolve,reject)=>{
            deptService.getTree().then(data=>{
                resolve(data);
            })
        })
    },
    addDept(context, dept) {
        return new Promise((resolve,reject)=>{
            deptService.addDept(dept).then(data=>{
                resolve();
            })
        })
    },
    updateDept(context, dept) {
        return new Promise((resolve,reject)=>{
            deptService.updateDept(dept).then(data=>{
                resolve();
            })
        })
    },
    deleteDept(context, deptId) {
        return new Promise((resolve,reject)=>{
            deptService.deleteDept(deptId).then(data=>{
                resolve();
            })
        })
    },
    getUserCountByDept(context,deptId){
        return new Promise((resolve,reject)=>{
            deptService.getUserCountByDept(deptId).then(data=>{
                resolve(data);
            })
        })
    },
    getUserPageByDept(context,query){
        return new Promise((resolve,reject)=>{
            deptService.getUserPageByDept(query.deptId,query.startIndex,query.rows).then(data=>{
                resolve(data);
            })
        })
    }
}

export default {
    namespaced: true,
    actions
}