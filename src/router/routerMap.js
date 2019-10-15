
import Layout from '@/layout'


/**
 * Note: 考虑到权限控制的简洁，现在导航菜单只支持2级,并且注意path全局唯一
 *
 * hidden: true                   if set true, item will not show in the sidebar(default is false)
 * alwaysShow: true               if set true, will always show the root menu
 *                                if not set alwaysShow, when item has more than one children route,
 *                                it will becomes nested mode, otherwise not show the root menu
 * redirect: noRedirect           if set noRedirect will no redirect in the breadcrumb
 * name:'router-name'             the name is used by <keep-alive> (must set!!!)
 * meta : {
    roles: ['admin','editor']    control the page roles (you can set multiple roles)
    title: 'title'               the name show in sidebar and breadcrumb (recommend set)
    icon: 'svg-name'             the icon show in the sidebar
    breadcrumb: false            if set false, the item will hidden in breadcrumb(default is true)
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
      meta: { title: '首页', icon: 'dashboard' }
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
const dynamicRoutes = [
    {
        path: '/scada',
        component: Layout,
        redirect: 'noRedirect',
        meta: { title: '实时控制', icon: 'example' },
        alwaysShow: true ,
        children: [{
            path: 'picture',
            name: 'Picture',
            component: () => import('@/views/scada/Picture'),
            meta: { title: '监控画面', icon: 'icon' }
          }]
    },
    {
        path: '/docs',
        component: Layout,
        redirect: '/docs',
        children: [{
            path: 'docs',
            name: 'Docs',
            component: () => import('@/views/docs/Docs'),
            meta: { title: '档案管理', icon: 'education' }
        }]
    },
    {
        path: '/bbs',
        component: Layout,
        redirect: '/bbs',
        children: [{
            path: 'bbs',
            name: 'Bbs',
            component: () => import('@/views/bbs/Bbs'),
            meta: { title: '沟通管理', icon: 'message' }
        }]
    },
    {
        path: '/sys',
        component: Layout,
        redirect: 'noRedirect',
        meta: { title: '系统管理', icon: 'component' },
        alwaysShow: true ,
        children: [
        {
            path: 'user',
            name: 'UserList',
            component: () => import('@/views/sys/UserList'),
            meta: { title: '用户管理', icon: 'peoples' }
        },
        {
            path: 'rule',
            name: 'Rule',
            component: () => import('@/views/sys/Rule'),
            meta: { title: '角色管理', icon: 'theme' }
        },
        {
            path: 'dept',
            name: 'Dept',
            component: () => import('@/views/sys/Dept'),
            meta: { title: '部门管理', icon: 'tree' }
        },
        {
            path: 'specail',
            name: 'Specail',
            component: () => import('@/views/sys/Specail'),
            meta: { title: '个性化设置', icon: 'people' }
        }
        ]
    }
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