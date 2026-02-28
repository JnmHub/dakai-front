<template>
    <view class="records-container">
        <u-navbar title="打卡历史" autoBack placeholder border left-text="返回"></u-navbar>

        <view class="list-content">
            <u-list v-if="recordList.length > 0" @scrolltolower="loadMore">
                <u-list-item v-for="(item, index) in recordList" :key="index">
                    <view class="record-card">
                        <view class="card-header">
                            <text class="time">{{ formatTime(item.create_time) }}</text>
                            <u-tag :text="item.point_title" size="mini" type="primary" plain></u-tag>
                        </view>

                        <view class="card-body">
                            <view class="loc-info">
                                <u-icon name="map-fill" size="14" color="#909399"></u-icon>
                                <text class="address">{{ item.location_name }}</text>
                            </view>

                            <view class="photo-wrapper" @click="previewImage(item.photo_url)">
                                <image :src="getFullImageUrl(item.photo_url)" mode="aspectFill" class="checkin-photo"></image>
                                <view class="zoom-tip">查看原图</view>
                            </view>
                        </view>
                    </view>
                </u-list-item>
            </u-list>

            <u-empty v-else mode="history" text="暂无打卡记录" marginTop="100"></u-empty>
        </view>
    </view>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { getMyRecords } from '@/api/checkin'
import dayjs from 'dayjs'
import { useUserStore } from '@/store/user'
import { baseURL } from '@/utils/request'
const recordList = ref([])
const page = ref(0)
const loading = ref(false)
const userStore = useUserStore()
const fetchRecords = async () => {
    loading.value = true
    try {
        const res = await getMyRecords({ skip: page.value * 10, limit: 10 })
        if (res.data.length > 0) {
            recordList.value = [...recordList.value, ...res.data]
        }
    } finally {
        loading.value = false
    }
}

const loadMore = () => {
    page.value++
    fetchRecords()
}

// 💡 拼接 MinIO 的完整访问地址
const getFullImageUrl = path => {
    // 1. 使用你的后端 API 地址，而不是直连 MinIO
    // 2. 拼接 photo_path 和 token
    const token = userStore.token
    return `${baseURL}/checkin/view_photo?photo_path=${path}&query_token=${token}`
}

const previewImage = path => {
    uni.previewImage({
        urls: [getFullImageUrl(path)]
    })
}

const formatTime = time => dayjs(time).format('YYYY-MM-DD HH:mm')

onMounted(fetchRecords)
</script>

<style lang="scss" scoped>
.records-container {
    min-height: 100vh;
    background-color: #f8f9fa;
    .list-content {
        padding: 20rpx;
    }
}

.record-card {
    background-color: #fff;
    border-radius: 16rpx;
    padding: 24rpx;
    margin-bottom: 24rpx;
    box-shadow: 0 4rpx 12rpx rgba(0, 0, 0, 0.03);

    .card-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding-bottom: 20rpx;
        border-bottom: 1rpx solid #f2f2f2;
        margin-bottom: 20rpx;
        .time {
            font-size: 28rpx;
            color: #303133;
            font-weight: bold;
        }
    }

    .card-body {
        .loc-info {
            display: flex;
            align-items: flex-start;
            margin-bottom: 20rpx;
            .address {
                font-size: 26rpx;
                color: #606266;
                margin-left: 10rpx;
                line-height: 1.4;
            }
        }

        .photo-wrapper {
            position: relative;
            width: 240rpx;
            height: 320rpx;
            border-radius: 8rpx;
            overflow: hidden;
            .checkin-photo {
                width: 100%;
                height: 100%;
            }
            .zoom-tip {
                position: absolute;
                bottom: 0;
                width: 100%;
                background: rgba(0, 0, 0, 0.5);
                color: #fff;
                font-size: 20rpx;
                text-align: center;
                padding: 4rpx 0;
            }
        }
    }
}
</style>
