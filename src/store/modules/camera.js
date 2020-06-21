import request from '@/utils/request'
const actions = {
    getCameraList(context) {
        return new Promise((resolve,reject)=>{
            request.get('camera/list.action').then(data=>{
                resolve(data);
            });
        })
    },
    getCameraPlayUrl(context,param){
        return new Promise((resolve,reject)=>{
            request.get('camera/play.action',{ params: param }).then(data=>{
                resolve(data);
            })
        })
    },
    cameraControl(context,param){
        var cameraIndexCode = param.cameraIndexCode;
        var command = param.command;
        var speed = param.speed;
        var action = param.action;
        var param = {
            "id" : cameraIndexCode,
			"action" : action, //0表示开始，1表示停止，目前停止没开发
			"command" : command,
			"speed" : speed,
			"presetIndex" : 200 // 预置位置点编号，云台控制其实用不着这个参数
        }
        return new Promise((resolve,reject)=>{
            request.get('camera/control.action',{ params: param }).then(data=>{
                resolve(data);
            })
        }) 
    },
    vedioBack(context,param){
        return new Promise((resolve,reject)=>{
            request.get('camera/playback.action',{ params: param }).then(data=>{
                resolve(data);
            })
        }).catch(()=>{
            reject();
        }) 
    },

    //获得监控区域Tree
    getAreaTree(context){
        return new Promise((resolve,reject)=>{
            request.get('camera/areaTree.action').then(data=>{
                resolve(data);
            }).catch(()=>{
                reject();
            })
        })
    },
    //获得监控区域列表
    areaList(context){
        return new Promise((resolve,reject)=>{
            request.get('camera/areaList.action').then(data=>{
                resolve(data);
            }).catch(()=>{
                reject();
            })
        })
    },
    //新建区域
    addArea(context,param){
        return new Promise((resolve,reject)=>{
            request.post('camera/addArea.action',param).then(data=>{
                resolve(data);
            }).catch(()=>{
                reject();
            })
        }) 
    },
    //修改区域
    updateArea(context,param){
        return new Promise((resolve,reject)=>{
            request.post('camera/updateArea.action',param).then(data=>{
                resolve(data);
            }).catch(()=>{
                reject();
            })
        }) 
    },
    //删除区域
    deleteArea(context,areaId){
        return new Promise((resolve,reject)=>{
            request.get('camera/deleteArea.action',{params:{areaId:areaId}}).then(data=>{
                resolve(data);
            }).catch(()=>{
                reject();
            })
        }) 
    },
     //分页查询摄像头信息count
     cameraPageCount(context,param){
        return new Promise((resolve,reject)=>{
            request.get('camera/cameraPageCount.action',{params:param}).then(data=>{
                resolve(data);
            }).catch(()=>{
                reject();
            })
        }) 
    },
    //分页查询摄像头信息
    cameraPage(context,param){
        return new Promise((resolve,reject)=>{
            request.get('camera/cameraPage.action',{params:param}).then(data=>{
                resolve(data);
            }).catch(()=>{
                reject();
            })
        }) 
    },
    //获得摄像头分类信息
    cameraTypes(context){
        return new Promise((resolve,reject)=>{
            request.get('camera/cameraTypes.action').then(data=>{
                resolve(data);
            }).catch(()=>{
                reject();
            })
        }) 
    },

    //新建摄像头
    addCamera(context,param){
        return new Promise((resolve,reject)=>{
            request.post('camera/addCamera.action',param).then(data=>{
                resolve(data);
            }).catch(()=>{
                reject();
            })
        }) 
    },
    //修改摄像头
    updateCamera(context,param){
        return new Promise((resolve,reject)=>{
            request.post('camera/updateCamera.action',param).then(data=>{
                resolve(data);
            }).catch(()=>{
                reject();
            })
        }) 
    },
    //删除摄像头
    deleteCamera(context,cameraId){
        return new Promise((resolve,reject)=>{
            request.get('camera/deleteCamera.action',{params:{cameraId:cameraId}}).then(data=>{
                resolve(data);
            }).catch(()=>{
                reject();
            })
        }) 
    },
    //分页查询事件信息count
    eventPageCount(context,param){
        return new Promise((resolve,reject)=>{
            request.get('camera/eventPageCount.action',{params:param}).then(data=>{
                resolve(data);
            }).catch(()=>{
                reject();
            })
        }) 
    },
    //分页查询事件信息
    eventPage(context,param){
        return new Promise((resolve,reject)=>{
            request.get('camera/eventPage.action',{params:param}).then(data=>{
                resolve(data);
            }).catch(()=>{
                reject();
            })
        }) 
    },
    //根据ID查询事件
    eventById(context,param){
        return new Promise((resolve,reject)=>{
            request.get('camera/eventById.action',{params:param}).then(data=>{
                resolve(data);
            }).catch(()=>{
                reject();
            })
        }) 
    },
    //确认事件
    eventConfrim(context,param){
        return new Promise((resolve,reject)=>{
            request.post('camera/eventConfirm.action',param).then(data=>{
                resolve(data);
            }).catch(()=>{
                reject();
            })
        }) 
    },
    //昨日入侵事件统计
    yesterdayEvents(context,param){
        return new Promise((resolve,reject)=>{
            request.get('camera/yesterdayEvents.action').then(data=>{
                resolve(data);
            }).catch(()=>{
                reject();
            })
        })
    },
    //昨日入侵Top5
    yesterdayTop5(context,param){
        return new Promise((resolve,reject)=>{
            request.get('camera/top5.action').then(data=>{
                resolve(data);
            }).catch(()=>{
                reject();
            })
        })
    },
    //当月按天统计
    monthEvents(context){
        return new Promise((resolve,reject)=>{
            request.get('camera/month.action').then(data=>{
                resolve(data);
            }).catch(()=>{
                reject();
            })
        })
    },
     //当月按区域统计
     monthArea(context){
        return new Promise((resolve,reject)=>{
            request.get('camera/monthArea.action').then(data=>{
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