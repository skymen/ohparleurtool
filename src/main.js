import Vue from 'vue'
import App from './App.vue'
import vuetify from './plugins/vuetify'
import store from './store'
import router from './router'
import './registerServiceWorker'
import i18n from './i18n'
import VueKonva from 'vue-konva'
import PinchZoom from 'vue-pinch-zoom'

Vue.component('pinch-zoom', PinchZoom);

Vue.use(VueKonva)

window.addEventListener('mousewheel', (event) => {
  store.dispatch('mouseWheel', event)
})

document.onkeydown = (event) => {
  store.dispatch('keyPress', event)
};


Vue.config.productionTip = false

new Vue({
  vuetify,
  store,
  router,
  i18n,
  render: h => h(App)
}).$mount('#app')