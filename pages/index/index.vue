<template>
    <view class="index-container">
        <view class="header-bg"></view>

        <view class="sticky-header">
            <view class="nav-title">打卡任务</view>
            <view class="search-box">
                <u-search v-model="keyword" placeholder="搜索打卡点名称..." :showAction="false" shape="round" bgColor="#fff" @change="handleSearch"></u-search>
            </view>

            <view class="loc-status-bar" @click="manualRefreshLocation">
                <u-icon name="map-fill" size="14" color="#2979ff"></u-icon>
                <text class="loc-text">{{ currentAddress || '正在获取当前精确位置...' }}</text>
                <u-icon name="reload" size="14" class="refresh-icon" :class="{ rotating: locLoading }"></u-icon>
            </view>
        </view>

        <view class="list-wrapper">
            <u-list v-if="computedPoints.length > 0">
                <u-list-item v-for="item in computedPoints" :key="item.id">
                    <view class="point-card" @click="goToDetail(item)">
                        <view class="card-body">
                            <view class="info-left">
                                <view class="title-row">
                                    <text class="title">{{ item.title }}</text>
                                    <u-tag :text="item.isInRange ? '进入范围' : '距离过远'" :type="item.isInRange ? 'success' : 'info'" size="mini" shape="circle"></u-tag>
                                </view>
                                <view class="address-text">{{ item.address }}</view>

                                <view class="distance-meta">
                                    <text class="dist-val" :class="{ 'in-range': item.isInRange }"> 距离您：{{ item.distanceText }} </text>
                                    <text class="radius-tip">（允许范围: {{ item.radius }}m）</text>
                                </view>
                            </view>

                            <view class="action-right">
                                <view class="go-btn" :class="{ 'can-check': item.isInRange }">
                                    <u-icon name="camera-fill" color="#fff" size="20"></u-icon>
                                </view>
                            </view>
                        </view>
                    </view>
                </u-list-item>
            </u-list>

            <u-empty v-else mode="search" text="暂无匹配的打卡点" marginTop="100"></u-empty>
        </view>

        <u-safe-bottom></u-safe-bottom>
    </view>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { getMyPoints } from '@/api/checkin'
import { getDistance } from '@/utils/geo' // 💡 导入经纬度计算工具
import { getLocationWithCheck } from '@/utils/getLocation.js' // 💡 使用你提供的工具
import http from '@/utils/request'

const points = ref([])
const keyword = ref('')
const locLoading = ref(false)
const myLoc = ref({ lat: 0, lon: 0 })
const currentAddress = ref('')

/**
 * 核心逻辑：对列表进行实时计算、搜索和排序
 */
const computedPoints = computed(() => {
    let list = [...points.value]

    // 1. 搜索过滤
    if (keyword.value) {
        list = list.filter(p => p.title.toLowerCase().includes(keyword.value.toLowerCase()))
    }

    // 2. 距离计算与状态标记
    const mappedList = list.map(item => {
        let dist = 999999 // 默认极大值
        let isInRange = false
        let distanceText = '定位中...'

        if (myLoc.value.lat) {
            dist = getDistance(myLoc.value.lat, myLoc.value.lon, item.latitude, item.longitude)
            isInRange = dist <= item.radius
            distanceText = dist > 1000 ? (dist / 1000).toFixed(2) + 'km' : Math.round(dist) + 'm'
        }

        return { ...item, dist, isInRange, distanceText }
    })

    // 3. 排序：按距离由近到远排序，让用户第一眼看到最近的点
    return mappedList.sort((a, b) => a.dist - b.dist)
})

/**
 * 初始化数据
 */
onMounted(() => {
    fetchPoints()
    manualRefreshLocation()
})

const fetchPoints = async () => {
    try {
        const res = await getMyPoints()
        points.value = res.data || []
    } catch (e) {
        console.error('获取打卡点列表失败', e)
    }
}

/**
 * 刷新位置逻辑：结合你提供的 getLocationWithCheck
 */
const manualRefreshLocation = async () => {
    if (locLoading.value) return
    locLoading.value = true

    try {
        // ✅ 使用专业封装的定位工具
        const loc = await getLocationWithCheck()
        myLoc.value = { lat: loc.latitude, lon: loc.longitude }

        // 调用后端接口获取当前地址文字 (Reverse Geocoding)
        const geoRes = await http.get('/geo/regeo', {
            params: { lat: loc.latitude, lon: loc.longitude }
        })
        currentAddress.value = geoRes.data.address
    } catch (err) {
        uni.showToast({ title: '定位失败，请确保权限开启', icon: 'none' })
    } finally {
        locLoading.value = false
    }
}

/**
 * 页面跳转
 */
const goToDetail = item => {
    // 跳转到拍照页，将所有必要参数带过去，减少拍照页的二次查询
    uni.navigateTo({
        url: `/pages/checkin/checkin?id=${item.id}&title=${encodeURIComponent(item.title)}&lat=${item.latitude}&lon=${item.longitude}&radius=${item.radius}`
    })
}
</script>

<style lang="scss" scoped>
.index-container {
    min-height: 100vh;
    background-color: #f6f8fa;
    position: relative;
}

/* 顶部蓝色渐变背景装饰 */
.header-bg {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 380rpx;
    background: linear-gradient(180deg, #2979ff 0%, #f6f8fa 100%);
    z-index: 0;
}

.sticky-header {
    position: sticky;
    top: 0;
    z-index: 10;
    padding: 100rpx 30rpx 20rpx;

    .nav-title {
        font-size: 46rpx;
        color: #fff;
        font-weight: bold;
        margin-bottom: 30rpx;
        letter-spacing: 2rpx;
    }

    .loc-status-bar {
        margin-top: 24rpx;
        background: rgba(255, 255, 255, 0.9);
        backdrop-filter: blur(10px);
        padding: 16rpx 24rpx;
        border-radius: 50rpx;
        display: flex;
        align-items: center;
        box-shadow: 0 4rpx 12rpx rgba(0, 0, 0, 0.05);

        .loc-text {
            flex: 1;
            font-size: 24rpx;
            color: #606266;
            margin: 0 16rpx;
            white-space: nowrap;
            overflow: hidden;
            text-overflow: ellipsis;
        }

        .refresh-icon.rotating {
            animation: spin 1s linear infinite;
        }
    }
}

.list-wrapper {
    padding: 10rpx 30rpx 40rpx;
    position: relative;
    z-index: 1;
}

/* 卡片样式 */
.point-card {
    background-color: #fff;
    border-radius: 24rpx;
    padding: 32rpx;
    margin-bottom: 24rpx;
    box-shadow: 0 8rpx 20rpx rgba(0, 0, 0, 0.04);
    border: 1rpx solid rgba(0, 0, 0, 0.02);

    &:active {
        transform: scale(0.98);
        background-color: #fafafa;
    }

    .card-body {
        display: flex;
        justify-content: space-between;
        align-items: center;
    }

    .info-left {
        flex: 1;
        .title-row {
            display: flex;
            align-items: center;
            gap: 16rpx;
            margin-bottom: 12rpx;
            .title {
                font-size: 34rpx;
                font-weight: bold;
                color: #303133;
            }
        }
        .address-text {
            font-size: 26rpx;
            color: #909399;
            margin-bottom: 18rpx;
            line-height: 1.4;
        }
        .distance-meta {
            font-size: 24rpx;
            .dist-val {
                color: #fa3534;
                font-weight: bold;
                &.in-range {
                    color: #19be6b;
                }
            }
            .radius-tip {
                color: #c0c4cc;
                margin-left: 8rpx;
            }
        }
    }

    .action-right {
        margin-left: 30rpx;
        .go-btn {
            width: 80rpx;
            height: 80rpx;
            border-radius: 50%;
            background-color: #dcdfe6;
            display: flex;
            align-items: center;
            justify-content: center;
            transition: all 0.3s;

            &.can-check {
                background: linear-gradient(135deg, #2979ff, #1c5fd1);
                box-shadow: 0 6rpx 16rpx rgba(41, 121, 255, 0.3);
            }
        }
    }
}

@keyframes spin {
    from {
        transform: rotate(0deg);
    }
    to {
        transform: rotate(360deg);
    }
}
:deep(.u-tag__text) {
    display: flex;
}
</style>
