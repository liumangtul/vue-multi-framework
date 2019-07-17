import Vue from 'vue'
import App from './App.vue'
import axios from 'axios';
import QS from 'qs'
import router from './router'
import store from './store'


Vue.config.productionTip = false;
Vue.prototype.$axios = axios;
Vue.prototype.qs = QS;

new Vue({
  router,
  store,
  render: h => h(App)
}).$mount('#app');
