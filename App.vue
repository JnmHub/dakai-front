<script setup>
import { onLaunch, onShow } from '@dcloudio/uni-app'
import { silentLogin } from '@/api/auth.js'

import { useUserStore } from '@/store/user.js'

const userStore = useUserStore()

async function handleSilentLogin() {
    // 1. 开启全局 Loading 遮罩，防止用户操作
    console.log('开始静默登录..............')

    uni.showLoading({
        title: '正在安全登录...',
        mask: true
    })

    try {
        // 2. 获取微信临时登录凭证 code
        const [loginErr, loginRes] = await uni.login({
            provider: 'weixin'
        })

        if (loginErr || !loginRes.code) {
            throw new Error('微信登录失败')
        }

        // 3. 调用后端静默登录接口
        const res = await silentLogin(loginRes.code)
        console.log('静默登录返回结果:', res)

        // 4. 根据返回状态处理逻辑
        if (res.bound) {
            // ✅ 场景 A：已绑定，直接保存 Token 并进入首页
            // uni.setStorageSync('access_token', res.access_token)
            // uni.setStorageSync('employee_info', res.employee_info)
            userStore.setLoginInfo(res.access_token, res.employee_info)
            // 如果当前不是首页，跳转到首页
            uni.reLaunch({ url: '/pages/index/index' })
        } else {
            // ❌ 场景 B：未绑定，携带 openid 跳转到登录页进行绑定
            uni.reLaunch({
                url: `/pages/login/login?openid=${res.openid}`
            })
        }
    } catch (e) {
        console.error('静默登录异常:', e)
        // 网络错误或其它异常，强制去登录页
        uni.reLaunch({ url: '/pages/login/login' })
    } finally {
        // 5. 无论成功失败，关闭 Loading
        uni.hideLoading()
    }
}
onLaunch(async () => {
    // await handleSilentLogin()
    // 💡 核心逻辑：物理检查本地同步存储的 Token
    const token = uni.getStorageSync('access_token')

    // 获取当前路由路径
    const pages = getCurrentPages()
    const currentPage = pages.length > 0 ? pages[pages.length - 1].route : ''

    if (!token && currentPage !== 'pages/login/login') {
        console.warn('检测到未登录，正在强制重定向...')
        // 使用 reLaunch 确保清理所有页面栈
        uni.reLaunch({
            url: '/pages/login/login'
        })
    }
})
</script>

<style>
/*每个页面公共css */
</style>
