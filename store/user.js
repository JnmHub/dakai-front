import { defineStore } from 'pinia'

export const useUserStore = defineStore('user', {
	state: () => ({
		token: uni.getStorageSync('access_token') || '', // 初始化时从本地缓存读
		userInfo: null
	}),
	
	actions: {
		// 保存登录信息
		setLoginInfo(token, userInfo) {
			this.token = token
			this.userInfo = userInfo
			// 💡 关键：持久化存储，防止小程序关闭后丢失登录态
			uni.setStorageSync('access_token', token)
		},
		
		// 退出登录
		logout() {
			this.token = ''
			this.userInfo = null
			uni.removeStorageSync('access_token')
		}
	},
	
	getters: {
		isLogin: (state) => !!state.token
	}
})