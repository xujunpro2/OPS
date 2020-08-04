import request from '@/utils/request'

const actions = {
    page(context,query){
        return new Promise((resolve,reject)=>{
            request.get('exception/page.action',{params:query}).then(data=>{
                resolve(data);
            }).catch(()=>{
                reject();
            })
        })
    },
    count(context,query){
        return new Promise((resolve,reject)=>{
            request.get('exception/count.action',{params:query}).then(data=>{
                resolve(data);
            }).catch(()=>{
                reject();
            })
        })
    },
    addException(context,param){
        return new Promise((resolve,reject)=>{
            request.post('exception/addException.action',param).then(data=>{
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