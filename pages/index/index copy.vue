<template>
  <view class="camera-container">
    <camera 
      device-position="back" 
      flash="off" 
      binderror="error" 
      style="width: 100%; height: 100vh;"
    >
      <cover-view class="watermark">
        <cover-view>当前时间: {{ timeStr }}</cover-view>
        <cover-view>当前位置: {{ address }}</cover-view>
      </cover-view>

      <cover-view class="btn-area">
        <button type="primary" @click="takePhoto">确认拍照</button>
      </cover-view>
    </camera>
  </view>
</template>

<script>
import { getLocationWithCheck } from '@/utils/getLocation.js';
export default {
  data() {
    return {
      timeStr: '', // 实时更新
      address: '定位中...',
      ctx: null
    }
  },
  async onReady() {
    // 创建相机上下文
	const res = await getLocationWithCheck()
	console.log(res);
    this.ctx = uni.createCameraContext();
  },
  methods: {
    takePhoto() {
		
      this.ctx.takePhoto({
        quality: 'high',
        success: (res) => {
          // res.tempImagePath 就是照片路径
          // 拿到照片后，再用 Canvas 把水印真的画上去（或者传给后端处理）
          this.processPhoto(res.tempImagePath);
        }
      });
    }
  }
}
</script>

<style>
/* 简单的水印样式 */
.watermark {
  position: absolute;
  bottom: 150px;
  left: 20px;
  color: white;
  text-shadow: 1px 1px 2px black; /* 增加文字阴影防止背景太白看不清 */
}
.btn-area {
  position: absolute;
  bottom: 50px;
  width: 100%;
  display: flex;
  justify-content: center;
}
</style>
