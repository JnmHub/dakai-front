<template>
    <view class="camera-container">
        <block v-if="!showPreview">
            <camera :device-position="devicePos" flash="off" style="width: 100vw; height: 100vh">
                <cover-view class="watermark-info" id="preview-wm">
                    <cover-view class="wm-line">时间：{{ timeStr }}</cover-view>
                    <cover-view class="wm-line address-text">地点：{{ address }}</cover-view>
                    <cover-view class="wm-point-tag" v-if="pointTitle">目标点：{{ pointTitle }}</cover-view>
                </cover-view>

                <cover-view class="controls-bar">
                    <cover-view class="btn-item" @click="goBack"><cover-view class="btn-text">返回</cover-view></cover-view>
                    <cover-view class="shutter-outer" @click="takePhoto"><cover-view class="shutter-inner"></cover-view></cover-view>
                    <cover-view class="btn-item" @click="toggleCamera">
                        <cover-image src="/static/icons/flip.png" class="btn-icon"></cover-image>
                        <cover-view class="btn-text">翻转</cover-view>
                    </cover-view>
                </cover-view>
            </camera>
        </block>

        <view class="preview-container" v-else>
            <image :src="previewImage" mode="aspectFit" class="preview-img"></image>
            <view class="preview-controls">
                <view class="retake-btn" @click="handleRetake">重拍一张</view>
                <view class="confirm-btn" @click="doUpload">确认提交</view>
            </view>
        </view>

        <canvas type="2d" id="wmCanvas" :style="{ width: canvasW + 'px', height: canvasH + 'px', position: 'fixed', left: '200vw' }"></canvas>
    </view>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import { onLoad } from '@dcloudio/uni-app'
import { useUserStore } from '@/store/user'
import { getDistance } from '@/utils/geo'
import http from '@/utils/request'
import dayjs from 'dayjs'
import { uploadCheckOut } from '@/api/checkin.js'
import { getLocationWithCheck } from '@/utils/getLocation.js'
const userStore = useUserStore()
const devicePos = ref('back')
const timeStr = ref('')
const address = ref('正在定位解析中...')
const showPreview = ref(false)
const previewImage = ref('')

const pointId = ref(0)
const pointTitle = ref('')
const pointTarget = ref({ lat: 0, lon: 0 })
const pointRadius = ref(500)
const myCurrentLoc = ref({ lat: 0, lon: 0 })

const canvasW = ref(1080)
const canvasH = ref(1440)

let cameraCtx = null
let timer = null

// --- 样式常量（需与 CSS 保持一致，单位 px） ---
const UI_WM_LEFT = 20 // 对应 CSS 30rpx 左右
const UI_WM_BOTTOM = 180 // 水印离底部的距离
const UI_FONT_SIZE = 15 // 对应 CSS 30rpx

onLoad(options => {
    pointId.value = options.id
    pointTitle.value = decodeURIComponent(options.title)
    pointTarget.value = { lat: parseFloat(options.lat), lon: parseFloat(options.lon) }
    pointRadius.value = parseInt(options.radius) || 500
})

onMounted(() => {
    cameraCtx = uni.createCameraContext()
    refreshTime()
    initLocation()
    timer = setInterval(refreshTime, 1000)
})

onUnmounted(() => {
    if (timer) clearInterval(timer)
})

const refreshTime = () => {
    timeStr.value = dayjs().format('YYYY-MM-DD HH:mm:ss')
}

const toggleCamera = () => {
    devicePos.value = devicePos.value === 'back' ? 'front' : 'back'
}

const initLocation = async () => {
    // uni.getLocation({
    //     type: 'gcj02',
    //     isHighAccuracy: true,
    //     success: async res => {
    //         myCurrentLoc.value = { lat: res.latitude, lon: res.longitude }
    //         const geoRes = await http.get('/geo/regeo', { params: { lat: res.latitude, lon: res.longitude } })
    //         address.value = geoRes.data.address
    //     }
    // })
    const res = await getLocationWithCheck()
    myCurrentLoc.value = { lat: res.latitude, lon: res.longitude }
    const geoRes = await http.get('/geo/regeo', { params: { lat: res.latitude, lon: res.longitude } })
    address.value = geoRes.data.address
}

const takePhoto = () => {
    const dist = getDistance(myCurrentLoc.value.lat, myCurrentLoc.value.lon, pointTarget.value.lat, pointTarget.value.lon)
    if (dist > pointRadius.value) {
        uni.showModal({ title: '超出范围', content: `当前距离约 ${Math.round(dist)}米，无法打卡。`, showCancel: false })
        return
    }
    cameraCtx.takePhoto({
        quality: 'high',
        success: res => {
            startCanvasProcess(res.tempImagePath)
        }
    })
}

/**
 * 核心逻辑：精准还原水印位置和样式
 */
const startCanvasProcess = async tempPath => {
    uni.showLoading({ title: '处理照片中...' })

    const imgInfo = await uni.getImageInfo({ src: tempPath })
    const sysInfo = uni.getSystemInfoSync()

    // 计算比例：照片宽度 / 屏幕宽度
    const scale = imgInfo.width / sysInfo.screenWidth

    const query = uni.createSelectorQuery()
    query
        .select('#wmCanvas')
        .fields({ node: true })
        .exec(res => {
            const canvas = res[0].node
            const ctx = canvas.getContext('2d')
            canvas.width = imgInfo.width
            canvas.height = imgInfo.height

            const mainImg = canvas.createImage()
            mainImg.src = tempPath
            mainImg.onload = () => {
                // 1. 绘制原图
                ctx.drawImage(mainImg, 0, 0, canvas.width, canvas.height)

                // 2. 准备绘制水印
                const fontSize = UI_FONT_SIZE * scale
                const padding = UI_WM_LEFT * scale
                const bottomGap = UI_WM_BOTTOM * scale

                ctx.fillStyle = '#ffffff'
                ctx.font = `bold ${Math.floor(fontSize)}px sans-serif`
                ctx.shadowColor = 'rgba(0,0,0,0.8)'
                ctx.shadowBlur = 4 * scale
                ctx.shadowOffsetX = 2 * scale
                ctx.shadowOffsetY = 2 * scale

                // 3. 处理文本换行 (针对长地址)
                const contentWidth = canvas.width - padding * 2
                const lines = []
                const fullText = `地点：${address.value}`

                // 简单的换行算法
                let currentLine = ''
                for (let char of fullText) {
                    let testLine = currentLine + char
                    let metrics = ctx.measureText(testLine)
                    if (metrics.width > contentWidth && currentLine.length > 0) {
                        lines.push(currentLine)
                        currentLine = char
                    } else {
                        currentLine = testLine
                    }
                }
                lines.push(currentLine)
                // lines.reverse() // 从下往上排版方便计算 bottom

                // 4. 绘制每一行
                const lineHeight = fontSize * 1.5
                // 先画时间
                ctx.fillText(`时间：${timeStr.value}`, padding, canvas.height - bottomGap)

                // 再画地址（从下往上递增高度）
                lines.forEach((line, index) => {
                    ctx.fillText(line, padding, canvas.height - bottomGap + lineHeight * (index + 1))
                })

                // 5. 导出预览
                uni.canvasToTempFilePath({
                    canvas,
                    destWidth: canvas.width,
                    destHeight: canvas.height,
                    success: out => {
                        previewImage.value = out.tempFilePath
                        showPreview.value = true
                        uni.hideLoading()
                    }
                })
            }
        })
}

const doUpload = async () => {
    uni.showLoading({ title: '上传中...' })
    console.log(pointId.value, myCurrentLoc.value, address.value)

    try {
        const res = await uploadCheckOut(previewImage.value, pointId.value, myCurrentLoc.value, address.value)
		uni.showModal({
			content:JSON.parse(res.data).msg,
			success: () => {
					setTimeout(() => uni.navigateBack(), 0)
			},
		})
    } catch (e) {
        uni.showToast({ title: '上传失败', icon: 'none' })
    } finally {
        uni.hideLoading()
    }
}

const handleRetake = () => {
    showPreview.value = false
    previewImage.value = ''
}
const goBack = () => uni.navigateBack()
</script>

<style lang="scss" scoped>
.camera-container {
    width: 100vw;
    height: 100vh;
    background-color: #000;
}

.watermark-info {
    position: absolute;
    left: 40rpx;
    bottom: 350rpx;
    width: 600rpx;
    .wm-line {
        color: #fff;
        font-size: 30rpx;
        margin-bottom: 10rpx;
        text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.8);
        white-space: normal;
        line-height: 1.4;
    }
    .wm-point-tag {
        display: inline-block;
        background: rgba(255, 202, 40, 0.9);
        color: #000;
        padding: 4rpx 16rpx;
        border-radius: 8rpx;
        font-size: 24rpx;
        font-weight: bold;
    }
}

.controls-bar {
    position: absolute;
    bottom: 0;
    width: 100%;
    height: 300rpx;
    display: flex;
    flex-direction: row;
    align-items: center;
    justify-content: space-around;
    background: linear-gradient(to top, rgba(0, 0, 0, 0.8), transparent);
    .btn-item {
        display: flex;
        flex-direction: column;
        align-items: center;
        width: 140rpx;
        .btn-icon {
            width: 64rpx;
            height: 64rpx;
            margin-bottom: 10rpx;
        }
        .btn-text {
            color: #fff;
            font-size: 26rpx;
        }
    }
    .shutter-outer {
        width: 160rpx;
        height: 160rpx;
        border: 10rpx solid #fff;
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        .shutter-inner {
            width: 120rpx;
            height: 120rpx;
            background: #fff;
            border-radius: 50%;
        }
    }
}

.preview-container {
    width: 100vw;
    height: 100vh;
    display: flex;
    flex-direction: column;
    background: #000;
    .preview-img {
        width: 100%;
        flex: 1;
    }
    .preview-controls {
        height: 200rpx;
        background: #fff;
        display: flex;
        align-items: center;
        justify-content: space-around;
        .retake-btn {
            padding: 20rpx 60rpx;
            background: #f4f4f5;
            border-radius: 40rpx;
            color: #606266;
            font-weight: bold;
        }
        .confirm-btn {
            padding: 20rpx 60rpx;
            background: #19be6b;
            border-radius: 40rpx;
            color: #fff;
            font-weight: bold;
        }
    }
}
</style>
