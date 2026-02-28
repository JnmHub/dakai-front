// api/user.js
import http from '@/utils/request.js'

/**
 * 微信静默绑定登录
 * @param {Object} data - { account, password, code }
 */
export const wechatLogin = data => {
    // 💡 对应后端 router = APIRouter(prefix="/auth") + app.include_router(..., prefix="/api/v1")
    return http.post('/auth/wechat_login', data)
}

/**
 * 获取个人信息 (可选，登录接口已返回 employee_info)
 */
export const getProfile = () => {
    return http.get('/employee/me')
}
