
import Layout from '@/layout'


/**
 * Note: 考虑到权限控制的简洁，现在导航菜单只支持2级,并且注意path全局唯一
 *
 * hidden: true                   是否显示，默认值false
 * alwaysShow: true               强制显示，如果false，那么当只有一个子菜单的时候，它将不显示
 * redirect: noRedirect           是否在导航面包屑breadcrumb控件上显示
 * name:'router-name'             the name is used by <keep-alive> (must set!!!)
 * meta : {
    roles: ['admin','editor']    control the page roles (you can set multiple roles)
    title: 'title'               the name show in sidebar and breadcrumb (recommend set)
    icon: 'svg-name'             the icon show in the sidebar
    breadcrumb: false            if set false, the item will hidden in breadcrumb(default is true)
    affix:false                  tag-view上是否可关闭,true为不可关闭
    cache: true                  启用keep-alive(default is false)
    activeMenu: '/example/list'  if set path, the sidebar will highlight the path you set
  }
 */


export const constantRoutes = [
  {
    path: '/login',
    component: () => import('@/views/login/Login'),
    hidden: true
  },
  {
    path: '/',
    component: Layout,
    redirect: '/dashboard',
    children: [{
      path: 'dashboard',
      name: 'Dashboard',
      component: () => import('@/views/dashboard/index'),
      meta: { title: '首页', icon: 'home',affix:true }
    }]
  },
  {
    path: '/404',
    component: () => import('@/views/404'),
    hidden: true
  },
  // 404 放路由最后
 { path: '*', redirect: '/404', hidden: true }

]

/** 动态路由，这里可以由服务端产生 */
export const dynamicRoutes = [
    // {
    //     path: '/factory',
    //     component: Layout,
    //     redirect: '/factory',
    //     children: [{
    //         path: 'factory',
    //         name: 'Factory',
    //         component: () => import('@/views/factory'),
    //         meta: { title: '数字工厂', icon: 'deploymentunit' }
    //       }]
    // },
    
    {
        path: '/workbench',
        component: Layout,
        redirect: '/workbench',
        children: [{
            path: 'bbs',
            name: 'Bbs',
            component: () => import('@/views/factory'),
            meta: { title: '工作台', icon: 'desktop' }
        }]
    },
    {
        path: '/scada',
        component: Layout,
        redirect: '/index',
        children: [{
            path: 'index',
            name: 'Scada',
            component: () => import('@/views/scada/Picture'),
            meta: { title: '工业控制', icon: 'alert' }
        }]
    },
    {
        path: '/video',
        component: Layout,
        redirect: 'noRedirect',
        meta: { title: '智慧安防', icon: 'video' },
        alwaysShow: true ,
        children: [{
            path: 'area',
            name: 'AreaManager',
            component: () => import('@/views/vedio/AreaManager'),
            meta: { title: '区域管理', icon: 'border-outer' }
        },
        {
            path: 'camera',
            name: 'CameraManager',
            component: () => import('@/views/vedio/CameraManager'),
            meta: { title: '摄像头管理', icon: 'video' }
        },
        {
            path: 'live',
            name: 'Live',
            component: () => import('@/views/vedio/VedioLive'),
            meta: { title: '视频监控', icon: 'camera' }
        },
        {
            path: 'vedioBack',
            name: 'VedioBack',
            component: () => import('@/views/vedio/VedioBack'),
            meta: { title: '视频回放', icon: 'USB' }
        },
        // {
        //     path: 'car',
        //     name: 'Car',
        //     component: () => import('@/views/vedio/VedioLive'),
        //     meta: { title: '车牌识别', icon: 'car' }
        // },
        {
            path: 'irruptAlarm',
            name: 'IrruptAlarm',
            component: () => import('@/views/vedio/IrruptAlarm'),
            meta: { title: '入侵告警', icon: 'gateway' }
        },
        {
            path: 'inSum',
            name: 'InSum',
            component: () => import('@/views/vedio/IrruptStatistical'),
            meta: { title: '入侵统计', icon: 'bao' }
        }]
    },
    // {
    //     path: '/simulation',
    //     component: Layout,
    //     redirect: '/simulation',
    //     children: [{
    //         path: 'docs',
    //         name: 'Docs',
    //         component: () => import('@/views/docs/Docs'),
    //         meta: { title: '工艺仿真', icon: 'filesearch' }
    //     }]
    // },
    {
        path: '/inspection',
        component: Layout,
        redirect: 'noRedirect',
        meta: { title: '智慧巡检', icon: 'monitor' },
        alwaysShow: true ,
        children: [{
            path: 'plan',
            name: 'Plan',
            component: () => import('@/views/Empty'),
            meta: { title: '巡检计划管理', icon: 'edit-square' }
        },
        {
            path: 'dev',
            name: 'Dev',
            component: () => import('@/views/Empty'),
            meta: { title: '巡检设备台账', icon: 'check' }
        },
        {
            path: 'workOrder',
            name: 'WorkOrder',
            component: () => import('@/views/Empty'),
            meta: { title: '巡检工单管理', icon: 'unordered list' }
        },
        {
            path: 'count',
            name: 'Count',
            component: () => import('@/views/Empty'),
            meta: { title: '巡检工作统计', icon: 'bar chart' }
        },
        {
            path: 'assess',
            name: 'Assess',
            component: () => import('@/views/Empty'),
            meta: { title: '巡检员工考核', icon: 'switch user' }
        }]
    },
    {
        path: '/om',
        component: Layout,
        redirect: 'noRedirect',
        alwaysShow: true ,
        meta: { title: '设备检修', icon: 'wrench' },
        children: [{
            path: 'malfunction',
            name: 'Malfunction',
            component: () => import('@/views/Empty'),
            meta: { title: '设备故障', icon: 'error' }
        },
        {
            path: 'alert',
            name: 'Alert',
            component: () => import('@/views/Empty'),
            meta: { title: '设备告警', icon: 'alert' }
        },
        
        {
            path: 'repairOrder',
            name: 'RepairOrder',
            component: () => import('@/views/Empty'),
            meta: { title: '检修工单', icon: 'file-text' }
        }]
    },
    {
        path: '/keep',
        component: Layout,
        redirect: 'noRedirect',
        meta: { title: '设备维保', icon: 'medicinebox' },
        alwaysShow: true ,
        children: [{
            path: 'keepPlan',
            name: 'KeppPlan',
            component: () => import('@/views/keep/KeepPlan'),
            meta: { title: '维保计划', icon: 'keepPlan' }
        },
        {
            path: 'keepOrder',
            name: 'KeppOrder',
            component: () => import('@/views/keep/KeepOrder'),
            meta: { title: '维保工单', icon: 'keepOrder' }
        },
        {
            path: 'keepSubmit',
            name: 'KeepSubmit',
            component: () => import('@/views/keep/KeepSubmit'),
            meta: { title: '维保确认', icon: 'keepSubmit' }
        }]
    },
    {
        path: '/dev',
        component: Layout,
        redirect: 'noRedirect',
        meta: { title: '设备资产', icon: 'sever' },
        alwaysShow: true ,
        children: [{
            path: 'list',
            name: 'DevList',
            component: () => import('@/views/dev/DevList'),
            meta: { title: '设备管理', icon: 'detail',cache:true }
        },
        {
            path: 'backup',
            name: 'DevBak',
            component: () => import('@/views/dev/DevBak'),
            meta: { title: '备件备件', icon: 'save' }
        },
        {
            path: 'fail',
            name: 'Fail',
            component: () => import('@/views/Empty'),
            meta: { title: '故障信息', icon: 'devFail' }
        }
        ,{
            path: 'devMeta',
            name: 'DevMeat',
            component: () => import('@/views/dev/DevMeta'),
            meta: { title: '类型和区域', icon: 'devMeta' }
        }]
    },
    {
        path: '/reprot',
        component: Layout,
        redirect: 'noRedirect',
        meta: { title: '统计报表', icon: 'report' },
        alwaysShow: true ,
        children: [{
            path: 'demo',
            name: 'Demo',
            component: () => import('@/views/Empty'),
            meta: { title: '某某报表', icon: 'report' }
        }]
    },
    {
        path: '/ifc',
        component: Layout,
        redirect: 'noRedirect',
        meta: { title: 'BIM管理', icon: 'bim' },
        alwaysShow: true ,
        children: [{
            path: 'ifcUpload',
            name: 'IFCUpload',
            component: () => import('@/views/ifc/IFCUpload'),
            meta: { title: 'IFC上传', icon: 'bimUpload' }
        },
        {
            path: 'bimView',
            name: 'BIMView',
            component: () => import('@/views/ifc/BIMView'),
            meta: { title: '模型预览', icon: 'bimView' }
        }]
    },
    {
        path: '/sys',
        component: Layout,
        redirect: 'noRedirect',
        meta: { title: '系统管理', icon: 'setting' },
        alwaysShow: true ,
        children: [
        {
            path: 'user',
            name: 'UserList',
            component: () => import('@/views/sys/UserList'),
            meta: { title: '用户管理', icon: 'user' }
        },
        {
            path: 'rule',
            name: 'Rule',
            component: () => import('@/views/sys/Rule'),
            meta: { title: '角色管理', icon: 'team' }
        },
        {
            path: 'member',
            name: 'Member',
            component: () => import('@/views/sys/Member'),
            meta: { title: '运维人员', icon: 'monitor' }
        }
        ]
    },
    // {
    //     path: '/develop',
    //     component: Layout,
    //     redirect: '/develop',
    //     children: [{
    //         path: 'log',
    //         name: 'Log',
    //         component: () => import('@/views/develop/Log'),
    //         meta: { title: '大屏', icon: 'bug' }
    //     }]
    // },
    {
        path: 'link1',
        component: Layout,
        children: [
          {
            path: 'http://datav.jiaminghi.com/demo/construction-data/index.html',
            meta: { title: '大屏', icon: 'dashboard' }
          }
        ]
    }
    // {
    //     path: 'link2',
    //     component: Layout,
    //     children: [
    //       {
    //         path: 'http://datav.jiaminghi.com/demo/electronic-file/index.html',
    //         meta: { title: '大屏2', icon: 'skin' }
    //       }
    //     ]
    // },
    // {
    //     path: 'link3',
    //     component: Layout,
    //     children: [
    //       {
    //         path: 'http://datav.jiaminghi.com/demo/manage-desk/index.html',
    //         meta: { title: '大屏3', icon: 'skin' }
    //       }
    //     ]
    // }
]

/**白名单路由 */
export const whiteNameList = ['/login'] ;

/**
 * 当前定义的动态路由数据，给角色权限设置使用
 */
export function getDynamicRoutesData(){
  var menus = new Array();
  dynamicRoutes.forEach(element=>{
        let menu = {};
        let basePath = element.path;
        menu.path = basePath;
        //alwaysShow表示包含二级菜单
        let alwaysShow = element.alwaysShow;
        if(alwaysShow)
        {
            menu.title = element.meta.title;
            menu.children = [];
            //二级菜单
            element.children.forEach(child=>{
                menu.children.push({path:child.path,title:child.meta.title});
            })
        }
        //没有二级菜单
        else
        {
            //菜单标题要么在自己的meta，要么在第一个child的meta中
            if(element.meta)
            {
                menu.title = element.meta.title;
            }
            else if(element.children && element.children.length == 1)
            {
                menu.title = element.children[0].meta.title;
            }
            else
            {
                menu.title = "routeMap编写错误，没有找到title";
            }
        
        }
        menus.push(menu);
    });
    
    return menus;
}
/**生成当前用户的动态路由数据 */
export function getDynamicRoutesByUser(routesStr) {
    let myMenus = new Array();
    let routes = JSON.parse(routesStr);
    //根据路由定义循环，这样保证菜单生成顺序
     
    var coloneRoutes = cloneDynamicRoutes(dynamicRoutes); 
    coloneRoutes.forEach(menu=>{

        for(var i=0;i<routes.length;i++)
        {
            let element = routes[i];
            let basePath = element.path;//一级菜单
            if(menu.path === basePath)
            {
                myMenus.push(menu);
                let childPaths = element.children;
                if(childPaths)
                {
                    var usedChildren=[];
                    //筛选children
                    menu.children.forEach(child=>{
                        if(childPaths.indexOf(child.path) > -1)
                        {
                            usedChildren.push(child);  
                        }
                    })
                    //只要使用的菜单
                    menu.children = usedChildren;
                }
                //找到就没必要继续遍历routes了
                break;
            }
        }
    })
    return myMenus;
}
/** 对动态路由进行深度拷贝，以便定义和操作互不干扰 */
function  cloneDynamicRoutes(routes) 
{
    let cloneRoutes = [];
    //生成二级菜单的克隆对象赋值给cloneRoutes
    routes.forEach(route => {
        let cloneRoute = Object.assign({}, route);
        //清除克隆对象的二级菜单，准备深拷贝
        if(cloneRoute.children)
        {
            cloneRoute.children = [];
             //二级菜单深度拷贝
            let children = route.children;
            children.forEach(child=>{
                let cloneChild =  Object.assign({}, child);
                let cloneChildMeta = Object.assign({},child.meta);
                cloneChild.meta = cloneChildMeta;
                cloneRoute.children.push(cloneChild);
            })
        }
        cloneRoutes.push(cloneRoute);  
    });
    return cloneRoutes;
}