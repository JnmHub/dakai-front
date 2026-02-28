// @/utils/getLocation.js
/**
 * 获取定位（Promise版）
 * 自动处理：授权检测 -> 引导去设置页 -> 重新获取
 * @returns {Promise<Object>} { latitude, longitude, address... }
 */
export function getLocationWithCheck() {
  return new Promise((resolve, reject) => {
    // 1. 获取用户的当前设置
    uni.getSetting({
      success: (res) => {
        const authStatus = res.authSetting['scope.userLocation'];
        
        // 情况A：用户之前明确拒绝过 (authStatus === false)
        if (authStatus === false) {
          showAuthModal(resolve, reject);
        } 
        // 情况B：新用户(undefined) 或 已授权(true) -> 直接调用定位
        else {
          doGetLocation(resolve, reject);
        }
      },
      fail: (err) => {
        reject(err);
      }
    });
  });
}

// 内部函数：执行真正的定位
function doGetLocation(resolve, reject) {
  uni.getLocation({
    type: 'gcj02',
    isHighAccuracy: true, // 开启高精度
    success: (res) => {
      resolve(res); // 成功返回
    },
    fail: (err) => {
      // 这里的 fail 通常是用户在系统弹窗点了拒绝，或者手机没开 GPS
      // 如果是用户刚才点了拒绝，再次引导
      if (err.errMsg.indexOf('auth deny') !== -1) {
        showAuthModal(resolve, reject);
      } else {
        reject(err);
      }
    }
  });
}

// 内部函数：弹窗引导去设置页
function showAuthModal(resolve, reject) {
  uni.showModal({
    title: '权限提示',
    content: '打卡拍照需要获取您的地理位置，请在设置中开启',
    confirmText: '去设置',
    success: (res) => {
      if (res.confirm) {
        uni.openSetting({
          success: (settingRes) => {
            if (settingRes.authSetting['scope.userLocation']) {
              // 用户在设置页打开了，回来重试
              doGetLocation(resolve, reject);
            } else {
              reject(new Error('用户在设置页依然未授权'));
            }
          }
        });
      } else {
        reject(new Error('用户点击取消，拒绝授权'));
      }
    }
  });
}
