import request from '@/utils/request'

const actions = {
    //删除上传的图片
    deletePicture(context,path){
        return new Promise((resolve,reject)=>{
            request.get('upload/deletePicture.action',{params:{path:path}}).then(data=>{
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