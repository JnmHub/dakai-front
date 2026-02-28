<template>
    <view class="login-container">
        <view class="header-bg">
            <view class="title">外勤签到系统</view>
            <view class="subtitle">Employee Check-in Terminal</view>
        </view>

        <view class="form-wrapper">
            <view class="welcome-text">欢迎登录</view>

            <u-form :model="form" ref="uForm" label-width="0">
                <u-form-item borderBottom>
                    <u-input v-model="form.account" placeholder="请输入员工账号" border="none">
                        <template #prefix>
                            <u-icon name="account-fill" color="#909399" size="20" class="mr-2"></u-icon>
                        </template>
                    </u-input>
                </u-form-item>

                <u-form-item borderBottom>
                    <u-input v-model="form.password" type="password" placeholder="请输入登录密码" border="none">
                        <template #prefix>
                            <u-icon name="lock-fill" color="#909399" size="20" class="mr-2"></u-icon>
                        </template>
                    </u-input>
                </u-form-item>
            </u-form>

            <view class="btn-group">
                <u-button type="primary" text="立即登录" :loading="loading" shape="circle" customStyle="margin-top: 60rpx; height: 90rpx; font-weight: bold; background: linear-gradient(to right, #2979ff, #609cff);" @click="handleLogin"></u-button>
            </view>

            <view class="footer-tips">登录即代表您同意《定位数据收集隐私协议》</view>
        </view>
    </view>
</template>

<script setup>
import { ref, reactive } from 'vue'
import { wechatLogin } from '@/api/user.js' // ✅ 使用修正后的函数名
import { useUserStore } from '@/store/user.js'

const userStore = useUserStore()
const loading = ref(false)
const form = reactive({
    account: '',
    password: ''
})

const handleLogin = async () => {
    if (!form.account || !form.password) {
        return uni.showToast({ title: '请填写账号和密码', icon: 'none' })
    }

    loading.value = true

    try {

        let res = null

        // ================== 微信小程序 ==================
        // #ifdef MP-WEIXIN
        const loginRes = await new Promise((resolve, reject) => {
            uni.login({
                provider: 'weixin',
                success: resolve,
                fail: reject
            })
        })

        res = await wechatLogin({
            account: form.account,
            password: form.password,
            code: loginRes.code
        })
        // #endif


        // ================== H5 ==================
        // #ifdef H5
        res = await wechatLogin({
            account: form.account,
            password: form.password
        })
        // #endif


        // ================== APP ==================
        // #ifdef APP-PLUS
        res = await wechatLogin({
            account: form.account,
            password: form.password
        })
        // #endif


        // ================== 统一登录后逻辑 ==================
        userStore.setLoginInfo(
            res.data.access_token,
            res.data.employee_info
        )

        uni.showToast({ title: '登录成功', icon: 'success' })

        setTimeout(() => {
            uni.reLaunch({ url: '/pages/index/index' })
        }, 800)

    } catch (e) {
        console.error('Login Process Error:', e)
    } finally {
        loading.value = false
    }
}
</script>

<style lang="scss" scoped>
.login-container {
    min-height: 100vh;
    background-color: #fff;

    .header-bg {
        height: 450rpx;
        background: linear-gradient(135deg, #2979ff 0%, #1c5fd1 100%);
        padding: 120rpx 60rpx;
        color: #fff;
        border-bottom-left-radius: 100rpx;
        border-bottom-right-radius: 100rpx;

        .title {
            font-size: 56rpx;
            font-weight: bold;
        }
        .subtitle {
            font-size: 24rpx;
            opacity: 0.7;
            margin-top: 10rpx;
            letter-spacing: 2rpx;
        }
    }

    .form-wrapper {
        margin-top: -60rpx;
        background-color: #fff;
        border-radius: 40rpx;
        padding: 60rpx;

        .welcome-text {
            font-size: 40rpx;
            font-weight: bold;
            margin-bottom: 60rpx;
            color: #303133;
        }
        .mr-2 {
            margin-right: 16rpx;
        }
    }

    .footer-tips {
        margin-top: 40rpx;
        font-size: 24rpx;
        color: #909399;
        text-align: center;
    }
}
</style>
