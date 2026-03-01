import http from '@/utils/request.js'
export function silentLogin(code) {
    return http.post('/auth/silent_login', { code })
}
export function unbind_wechat() {
    return http.post('/auth/unbind_wechat')
}