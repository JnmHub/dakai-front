<template>
	<view class="page-container">
		<u-navbar 
			title="修改登录密码" 
			placeholder 
			border 
			autoBack 
			fixed
			titleStyle="font-weight: bold;"
			left-text="返回"
		></u-navbar>

		<view class="header-banner">
			<view class="title">安全中心</view>
			<view class="desc">定期更换密码，保护您的账户安全</view>
		</view>

		<view class="form-card">
			<u-form :model="pwdForm" ref="formRef" labelPosition="top">
				<u-form-item label="当前旧密码" prop="old_password" borderBottom>
					<u-input 
						v-model="pwdForm.old_password" 
						type="password" 
						placeholder="请输入旧密码验证身份" 
						border="none"
						prefixIcon="lock"
						prefixIconStyle="color: #909399; font-size: 18px;"
					></u-input>
				</u-form-item>
				
				<u-form-item label="设置新密码" prop="new_password" borderBottom>
					<u-input 
						v-model="pwdForm.new_password" 
						type="password" 
						placeholder="6-18位字母及数字组合" 
						border="none"
						prefixIcon="shield-fill"
						prefixIconStyle="color: #2979ff; font-size: 18px;"
					></u-input>
				</u-form-item>
				
				<u-form-item label="再次确认新密码" prop="confirm_password" borderBottom>
					<u-input 
						v-model="pwdForm.confirm_password" 
						type="password" 
						placeholder="请再次核对新密码" 
						border="none"
						prefixIcon="shield-check"
						prefixIconStyle="color: #2979ff; font-size: 18px;"
					></u-input>
				</u-form-item>
			</u-form>

			<view class="tips">
				<u-icon name="info-circle" color="#909399" size="14"></u-icon>
				<text>密码修改成功后，系统将自动退出并重新登录</text>
			</view>

			<view class="btn-group">
				<u-button 
					type="primary" 
					text="确认提交修改" 
					:loading="loading" 
					shape="circle"
					customStyle="height: 48px; font-weight: bold; background: linear-gradient(135deg, #2979ff, #1c5fd1);"
					@click="submitPassword"
				></u-button>
			</view>
		</view>
	</view>
</template>

<script setup>
import { ref, reactive } from 'vue'
import http from '@/utils/request'
import { useUserStore } from '@/store/user'

const userStore = useUserStore()
const loading = ref(false)

const pwdForm = reactive({
	old_password: '',
	new_password: '',
	confirm_password: ''
})

const submitPassword = async () => {
	if (!pwdForm.old_password) return uni.showToast({ title: '请输入原密码', icon: 'none' })
	if (pwdForm.new_password.length < 6) return uni.showToast({ title: '新密码不能少于6位', icon: 'none' })
	if (pwdForm.new_password !== pwdForm.confirm_password) {
		return uni.showToast({ title: '两次新密码输入不一致', icon: 'none' })
	}

	loading.value = true
	try {
		await http.post('/auth/change_password', {
			old_password: pwdForm.old_password,
			new_password: pwdForm.new_password
		})

		uni.showToast({ title: '修改成功', icon: 'success' })

		setTimeout(() => {
			userStore.logout()
			uni.reLaunch({ url: '/pages/login/login' })
		}, 1500)
	} catch (e) {
		// 错误通常由拦截器处理
	} finally {
		loading.value = false
	}
}
</script>

<style lang="scss" scoped>
.page-container {
	min-height: 100vh;
	background-color: #f8fafc;
}

.header-banner {
	height: 320rpx;
	background: linear-gradient(135deg, #2979ff, #1c5fd1);
	padding: 60rpx 40rpx;
	color: #fff;
	
	.title {
		font-size: 44rpx;
		font-weight: bold;
		margin-bottom: 16rpx;
	}
	
	.desc {
		font-size: 26rpx;
		opacity: 0.8;
	}
}

.form-card {
	margin: -80rpx 30rpx 0;
	background-color: #ffffff;
	border-radius: 24rpx;
	padding: 40rpx;
	box-shadow: 0 8rpx 32rpx rgba(41, 121, 255, 0.08);
	
	:deep(.u-form-item__body__left__content__label) {
		font-weight: bold;
		color: #303133;
		font-size: 28rpx;
	}
}

.tips {
	margin: 30rpx 0;
	display: flex;
	align-items: center;
	gap: 10rpx;
	font-size: 24rpx;
	color: #909399;
}

.btn-group {
	margin-top: 60rpx;
}
</style>