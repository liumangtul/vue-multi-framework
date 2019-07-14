import Vue from 'vue'
import Router from 'vue-router'
import Home from '@/pages/page1/views/Home/Home.vue'
import About from '@/pages/page1/views/About/About.vue'

Vue.use(Router)

export default new Router({
  mode: 'hash',
  base: process.env.BASE_URL,
  routes: [
    {
      path: '/home',
      name: 'home',
      component: Home
    },{
      path: '/about',
      name: 'about',
      component: About
    }
  ]
})
