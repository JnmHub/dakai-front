// utils/request.js
import LRequest from '@/js_sdk/luch-request/luch-request/index.js'
import { useUserStore } from '@/store/user.js'

const http = new LRequest()
export const baseURL = 'https://checkin-api.xxb.zhongyushipin.com/api/v1'

// 💡 控制静默登录状态的变量
let isRefreshing = false
let requests = [] // 存储由于 401 挂起的请求

http.setConfig(config => {
    config.baseURL = baseURL
    return config
})

// 请求拦截器
http.interceptors.request.use(
    config => {
        const userStore = useUserStore()
        if (userStore.token) {
            config.header['token'] = `${userStore.token}`
        }
        return config
    },
    config => Promise.reject(config)
)

// 响应拦截器
http.interceptors.response.use(
    response => {
        const res = response.data
        if (res.code && res.code !== 200) {
            uni.showToast({ title: res.msg || '请求出错', icon: 'none' })
            return Promise.reject(res)
        }
        return res
    },
    async error => {
        const { config, statusCode, data } = error
        const userStore = useUserStore()
		// #ifdef MP-WEIXIN
        // 💡 重点：处理 401 Token 过期
        if (statusCode === 401) {
            // 如果已经是登录/静默登录接口报错，直接去登录页，防止死循环
            if (config.url.includes('/auth/silent_login') || config.url.includes('/auth/wechat_login')) {
                handleLogout(userStore)
                return Promise.reject(error)
            }

            if (!isRefreshing) {
                isRefreshing = true
                try {
                    // 1. 调用微信登录获取新的 code
                    const [loginErr, loginRes] = await uni.login({ provider: 'weixin' })
                    if (loginErr || !loginRes.code) throw new Error('微信登录失败')

                    // 2. 调用后端静默登录接口换取新 Token
                    // 这里直接使用 uni.request 避免进入当前的 http 拦截器死循环
                    const [resErr, refreshRes] = await uni.request({
                        url: `${baseURL}/auth/silent_login`,
                        method: 'POST',
                        data: { code: loginRes.code }
                    })

                    const result = refreshRes.data
                    if (result.code === 200 && result.data.bound) {
                        // ✅ 静默登录成功：保存新 Token
                        const newToken = result.data.access_token
                        userStore.setToken(newToken)
                        userStore.setUserInfo(result.data.employee_info)

                        // 3. 重新发起之前挂起的请求
                        config.header['token'] = newToken
                        // 执行队列中的请求
                        requests.forEach(cb => cb(newToken))
                        requests = []
                        return http.request(config)
                    } else {
                        // ❌ 未绑定或其它错误，跳转登录页
                        throw new Error('未绑定或静默登录失败')
                    }
                } catch (e) {
                    handleLogout(userStore)
                    return Promise.reject(e)
                } finally {
                    isRefreshing = false
                }
            } else {
                // 如果正在刷新中，把当前的请求暂存起来，等刷新完再执行
                return new Promise(resolve => {
                    requests.push(newToken => {
                        config.header['token'] = newToken
                        resolve(http.request(config))
                    })
                })
            }
        }
		// #endif
		// #ifndef MP-WEIXIN
		if (statusCode === 401){
			handleLogout(userStore)
		}
		// #endif
        // 其他错误处理
        uni.showToast({ title: data?.msg || '请求出错', icon: 'none' })
        return Promise.reject(error)
    }
)

// 登出并清空数据
function handleLogout(userStore) {
    userStore.logout()
    uni.reLaunch({ url: '/pages/login/login' })
}

export default http
