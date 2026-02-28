import http from '@/utils/request.js'
export function silentLogin(code) {
    return http.post('/auth/silent_login', { code })
}
