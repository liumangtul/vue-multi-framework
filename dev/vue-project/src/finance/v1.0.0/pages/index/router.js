import Vue from 'vue'
import Router from 'vue-router'
import Index from './views/index/Index'
import Detail from './views/detail/Index'

Vue.use(Router)


export default new Router({
  mode: 'hash',
  base: process.env.BASE_URL,
  routes: [
      {
          path: '/index',
          name: 'index',
          component: Index
      },{
          path:'/detail',
          name:'detail',
          component:Detail
      }
  ]
})
