import request from '@/utils/request'
import { resolve, reject } from 'core-js/fn/promise'

const actions = {
    getPlan(context,planId){
        return new Promise((resolve,reject)=>{
            request.get('insp/getPlanById.action',{params:{planId:planId}}).then(data=>{
                resolve(data);
            }).catch(()=>{
                reject();
            })
        })
    },
    planPage(context,query){
        return new Promise((resolve,reject)=>{
            request.get('insp/planPage.action',{params:query}).then(data=>{
                resolve(data);
            }).catch(()=>{
                reject();
            })
        })
    },
    planCount(context,query){
        return new Promise((resolve,reject)=>{
            request.get('insp/planCount.action',{params:query}).then(data=>{
                resolve(data);
            }).catch(()=>{
                reject();
            })
        })
    },
    addPlan(context,param){
        return new Promise((resolve,reject)=>{
            request.post('insp/addPlan.action',param).then(data=>{
                resolve(data);
            }).catch(()=>{
                reject();
            })
        })
    },
    updatePlan(context,param){
        return new Promise((resolve,reject)=>{
            request.post('insp/updatePlan.action',param).then(data=>{
                resolve(data);
            }).catch(()=>{
                reject();
            })
        })
    },
    deletePlan(context,planId){
        return new Promise((resolve,reject)=>{
            request.get('insp/deletePlan.action',{params:{planId:planId}}).then(data=>{
                resolve(data);
            }).catch(()=>{
                reject();
            })
        })
    },
    //获得巡检计划的默认巡检人
    getMembersByPlan(context,planId){
        return new Promise((resolve,reject)=>{
            request.get('insp/getMembersByPlan.action',{params:{planId:planId}}).then(data=>{
                resolve(data);
            }).catch(()=>{
                reject();
            })
        })
    },

    positions(context){
        return new Promise((resolve,reject)=>{
            request.get('insp/positions.action').then(data=>{
                resolve(data);
            }).catch(()=>{
                reject();
            })
        })
    },
    addPosition(context,param){
        return new Promise((resolve,reject)=>{
            request.get('insp/addPosition.action',{params:param}).then(data=>{
                resolve(data);
            }).catch(()=>{
                reject();
            })
        })
    },
    updatePosition(context,param){
        return new Promise((resolve,reject)=>{
            request.get('insp/updatePosition.action',{params:param}).then(data=>{
                resolve(data);
            }).catch(()=>{
                reject();
            })
        })
    },
    deletePosition(context,positionId){
        return new Promise((resolve,reject)=>{
            request.get('insp/deletePosition.action',{params:{positionId:positionId}}).then(data=>{
                resolve(data);
            }).catch(()=>{
                reject();
            })
        })
    },

    addTask(context,param){
        return new Promise((resolve,reject)=>{
            request.post('insp/addTask.action',param).then(data=>{
                resolve(data);
            }).catch(()=>{
                reject();
            })
        })
    },

    taskPage(context,query){
        return new Promise((resolve,reject)=>{
            request.get('insp/taskPage.action',{params:query}).then(data=>{
                resolve(data);
            }).catch(()=>{
                reject();
            })
        })
    },
    taskCount(context,query){
        return new Promise((resolve,reject)=>{
            request.get('insp/taskCount.action',{params:query}).then(data=>{
                resolve(data);
            }).catch(()=>{
                reject();
            })
        })
    },
    workTask(context,memberId){
        return new Promise((resolve,reject)=>{
            request.get('insp/workTask.action',{params:{memberId:memberId}}).then(data=>{
                resolve(data);
            }).catch(()=>{
                reject();
            })
        })
    },
    //接单
    assignTask(context,param){
        return new Promise((resolve,reject)=>{
            request.get('insp/assignOrder.action',{params:param}).then(data=>{
                resolve(data);
            }).catch(()=>{
                reject();
            })
        })
    },
    //查询巡检任务相关的检查点信息和完成情况
    pointsByTask(context,taskId){
        return new Promise((resolve,reject)=>{
            request.get('insp/pointsByTask.action',{params:{taskId:taskId}}).then(data=>{
                resolve(data);
            }).catch(()=>{
                reject();
            })
        })
    },
    //检查点巡检记录提交
    submitTaskPoint(context,param){
        return new Promise((resolve,reject)=>{
            request.post('insp/submitTaskPoint.action',param).then(data=>{
                resolve(data);
            }).catch(()=>{
                reject();
            })
        })
    },
     //删除任务，只有未接单可以
     deleteTask(context,taskId){
        return new Promise((resolve,reject)=>{
            request.get('insp/deleteTask.action',{params:{taskId:taskId}}).then(data=>{
                resolve(data);
            }).catch(()=>{
                reject();
            })
        })
    },
    //派单
    sendOrder(context,param){
        return new Promise((resolve,reject)=>{
            request.post('insp/sendOrder.action',param).then(data=>{
                resolve(data);
            }).catch(()=>{
                reject();
            })
        })
    },

    //巡检统计相关API
    labCardValues(context){
        return new Promise((resolve,reject)=>{
            request.get('insp/labCardValues.action').then(data=>{
                resolve(data);
            }).catch(()=>{
                reject();
            })
        })
    },
    statisticalByType(context,type){
        return new Promise((resolve,reject)=>{
            request.get('insp/statisticalByType.action',{params:{type:type}}).then(data=>{
                resolve(data);
            }).catch(()=>{
                reject();
            })
        })
    },
    devExceptionTop5(context){
        return new Promise((resolve,reject)=>{
            request.get('insp/devExceptionTop5.action').then(data=>{
                resolve(data);
            }).catch(()=>{
                reject();
            })
        })
    },
    positionExceptionTop5(context){
        return new Promise((resolve,reject)=>{
            request.get('insp/positionExceptionTop5.action').then(data=>{
                resolve(data);
            }).catch(()=>{
                reject();
            })
        })
    },
    taskByMemberPage(context,query){
        return new Promise((resolve,reject)=>{
            request.get('insp/taskByMember.action',{params:query}).then(data=>{
                resolve(data);
            }).catch(()=>{
                reject();
            })
        })
    },
    taskCountByMember(context,query){
        return new Promise((resolve,reject)=>{
            request.get('insp/taskCountByMember.action',{params:query}).then(data=>{
                resolve(data);
            }).catch(()=>{
                reject();
            })
        })
    },
    memberLabCardValues(context,query){
        return new Promise((resolve,reject)=>{
            request.get('insp/memberLabCardValues.action',{params:query}).then(data=>{
                resolve(data);
            }).catch(()=>{
                reject();
            })
        })
    },
    forException(context,param){
        return new Promise((resolve,reject)=>{
            request.get('insp/forException.action',{params:param}).then(data=>{
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