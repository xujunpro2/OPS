import Vue from 'vue'
import Router from 'vue-router'
import {constantRoutes,whiteNameList} from './routerMap'
import store from '@/store'
import {getToken} from '@/utils/auth'
import NProgress from 'nprogress' // progress bar
import 'nprogress/nprogress.css' // progress bar style

NProgress.configure({ showSpinner: false }) // NProgress设置
Vue.use(Router)


//创建默认路由
const createRouter = () => new Router({
  // mode: 'history', // require service support
  scrollBehavior: () => ({ y: 0 }),
  routes: constantRoutes
})

const router = createRouter()

/** next('xxx')是会继续跳转动作，即继续触发钩子，只有next()才会结束跳转动作 
 * 如果当前在A上跳转到A，vue是不会跳转的，也就不会触发afterEach，所以要NProgress.done()关闭进度条
*/
router.beforeEach(async (to, from, next) => {
  NProgress.start() ;
  const hasToken = getToken();
  //const hasToken = false;
  //有token
  if(hasToken)
  {
      
    //有token的话，哪怕url是login，也直接跳转到dashboard页面
    if (to.path === '/login') 
    {
      next({ path: '/' });
      NProgress.done();//dashboard -> dashboard
    } 
    //正常继续进行
    else
    {
      //判断state中的菜单数据还在不在，如果没有了，就表示页面刷新导致state丢失，得重新去拉一次
      let curRouter = store.getters["uv/currentRouter"];
      if(curRouter.length == 0)
      {
        await store.dispatch('uv/refreshRouter');
        //此时to是404，要拿到to之前的path，并且要replace，否则浏览器后退按钮就是404了
        next({path:to.redirectedFrom,replace: true});
      }
      next();
    }
    
  }
  //无token，确保进入login路由
  else
  {
    if (whiteNameList.indexOf(to.path) !== -1)    // if (to.path == '/login') 
    {
      next();
    }
    else
    {
      next({ path: '/login' });
      NProgress.done();// login -> login
    }
  }
})

router.afterEach(() => {
  NProgress.done()
})

//重置路由
export function resetRouter() {
  const newRouter = createRouter();
  router.matcher = newRouter.matcher 
}

export default router
