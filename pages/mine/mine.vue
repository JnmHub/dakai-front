<template>
    <view class="mine-container">
        <view class="header-section">
            <u-avatar :text="userStore.userInfo?.name?.substring(0, 1)" size="60" bg-color="#fff" color="#2979ff"></u-avatar>
            <view class="user-details">
                <view class="name">{{ userStore.userInfo?.name }}</view>
                <view class="account">账号：{{ userStore.userInfo?.account }}</view>
            </view>
        </view>

        <view class="menu-list">
            <u-cell-group :border="false">
                <u-cell icon="calendar" title="打卡历史记录" @click="toCheckinRecords"></u-cell>
                <u-cell icon="lock-open" title="修改登录密码" @click="toChangePassword"></u-cell>
                <u-cell icon="info-circle" title="关于系统" value="v1.0.0" isLink></u-cell>
            </u-cell-group>
        </view>

        <view class="logout-box">
            <u-button type="error" plain text="退出当前登录" shape="circle" @click="handleLogout"></u-button>
        </view>
    </view>
</template>

<script setup>
import { useUserStore } from '@/store/user'

const userStore = useUserStore()

const handleLogout = () => {
    uni.showModal({
        title: '提示',
        content: '确定要退出登录吗？',
        success: res => {
            if (res.confirm) {
                // ✅ 清理 Pinia 和缓存
                userStore.logout()
                uni.reLaunch({
                    url: '/pages/login/login'
                })
            }
        }
    })
}
const toChangePassword = () => {
    uni.navigateTo({
        url: '/pages/mine/password'
    })
}
const toCheckinRecords = () => {
    uni.navigateTo({
        url: '/pages/mine/records'
    })
}
</script>

<style lang="scss" scoped>
.mine-container {
    min-height: 100vh;
    background-color: #f5f7fa;

    .header-section {
        height: 400rpx;
        background: linear-gradient(135deg, #2979ff, #1c5fd1);
        display: flex;
        align-items: center;
        padding: 0 50rpx;
        padding-top: 100rpx;

        .user-details {
            margin-left: 30rpx;
            color: #fff;
            .name {
                font-size: 40rpx;
                font-weight: bold;
            }
            .account {
                font-size: 24rpx;
                opacity: 0.8;
                margin-top: 10rpx;
            }
        }
    }

    .menu-list {
        margin: -40rpx 30rpx 0;
        background-color: #fff;
        border-radius: 20rpx;
        overflow: hidden;
        box-shadow: 0 4rpx 20rpx rgba(0, 0, 0, 0.05);
    }

    .logout-box {
        margin: 60rpx 30rpx;
    }
}
</style>
