// utils/permission.js
export function setupPermissionInterceptor() {
    const list = ['navigateTo', 'redirectTo', 'reLaunch', 'switchTab']

    const whiteList = [
        'pages/login/login', // 💡 注意：有些环境不需要前面的 /
        '/pages/login/login'
    ]

    list.forEach(item => {
        uni.addInterceptor(item, {
            invoke(args) {
                const url = args.url.split('?')[0]
                const token = uni.getStorageSync('access_token')

                // 如果没 token 且不在白名单，拦截
                if (!token && !whiteList.includes(url)) {
                    uni.showToast({ title: '请先登录', icon: 'none' })
                    uni.navigateTo({ url: '/pages/login/login' })
                    return false // 🔴 阻止跳转
                }
                return true // 🟢 放行
            }
        })
    })
}
