import request from '@/utils/request'

const actions = {
    page(context,query){
        return new Promise((resolve,reject)=>{
            request.get('alarm/page.action',{params:query}).then(data=>{
                resolve(data);
            }).catch(()=>{
                reject();
            })
        })
    },
    count(context,query){
        return new Promise((resolve,reject)=>{
            request.get('alarm/count.action',{params:query}).then(data=>{
                resolve(data);
            }).catch(()=>{
                reject();
            })
        })
    },
    addTask(context,param){
        return new Promise((resolve,reject)=>{
            request.post('insp/addTaskByAlarm.action',param).then(data=>{
                resolve(data);
            }).catch(()=>{
                reject();
            })
        })
    },
    excuteInfo(context,alarmId){
        return new Promise((resolve,reject)=>{
            request.get('alarm/excuteInfo.action',{params:{alarmId:alarmId}}).then(data=>{
                resolve(data);
            }).catch(()=>{
                reject()
            })
        })
    }
}

export default {
    namespaced: true,
    actions
}