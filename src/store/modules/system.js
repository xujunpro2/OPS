import request from '@/utils/request'

const actions = {
    //查询字典
    getDictionary(context,type){
        return new Promise((resolve,reject)=>{
            request.get('sys/dictionary.action',{params:{type:type}}).then(data=>{
                resolve(data);
            }).catch(()=>{
                reject();
            })
        })
    },
    memberCount(context,query){
        return new Promise((resolve,reject)=>{
            request.get('sys/memberCount.action',{params:query}).then(data=>{
                resolve(data);
            }).catch(()=>{
                reject();
            })
        })
    },
    memberPage(context,query){
        return new Promise((resolve,reject)=>{
            request.get('sys/memberPage.action',{params:query}).then(data=>{
                resolve(data);
            }).catch(()=>{
                reject();
            })
        })
    },

    addMember(context,param){
        return new Promise((resolve,reject)=>{
            request.post('sys/addMember.action',param).then(data=>{
                resolve(data);
            }).catch(()=>{
                reject();
            })
        })
    },
    updateMember(context,param){
        return new Promise((resolve,reject)=>{
            request.post('sys/updateMember.action',param).then(data=>{
                resolve(data);
            }).catch(()=>{
                reject();
            })
        })
    },
    deleteMember(context,memberId){
        return new Promise((resolve,reject)=>{
            request.get('sys/deleteMember.action',{params:{memberId:memberId}}).then(data=>{
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