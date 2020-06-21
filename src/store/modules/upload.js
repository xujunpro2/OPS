import request from '@/utils/request'

const actions = {
    //删除上传的图片
    deletePicture(context,pictureServerName){
        return new Promise((resolve,reject)=>{
            request.get('upload/deletePicture.action',{params:{pictureServerName:pictureServerName}}).then(data=>{
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