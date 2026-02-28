import App from './App'

// #ifndef VUE3
import Vue from 'vue'
import './uni.promisify.adaptor'
Vue.config.productionTip = false
App.mpType = 'app'
const app = new Vue({
    ...App
})
app.$mount()
// #endif

// #ifdef VUE3
import { createSSRApp } from 'vue'
import * as Pinia from 'pinia'
import { setupPermissionInterceptor } from '@/utils/permission'
export function createApp() {
    const pinia = Pinia.createPinia()
    const app = createSSRApp(App)
    setupPermissionInterceptor()
    app.use(pinia)
    return {
        app,
        Pinia
    }
}
// #endif
