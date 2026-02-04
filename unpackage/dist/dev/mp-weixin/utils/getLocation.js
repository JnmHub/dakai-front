"use strict";
const common_vendor = require("../common/vendor.js");
function getLocationWithCheck() {
  return new Promise((resolve, reject) => {
    common_vendor.index.getSetting({
      success: (res) => {
        const authStatus = res.authSetting["scope.userLocation"];
        if (authStatus === false) {
          showAuthModal(resolve, reject);
        } else {
          doGetLocation(resolve, reject);
        }
      },
      fail: (err) => {
        reject(err);
      }
    });
  });
}
function doGetLocation(resolve, reject) {
  common_vendor.index.getLocation({
    type: "gcj02",
    isHighAccuracy: true,
    // 开启高精度
    success: (res) => {
      resolve(res);
    },
    fail: (err) => {
      if (err.errMsg.indexOf("auth deny") !== -1) {
        showAuthModal(resolve, reject);
      } else {
        reject(err);
      }
    }
  });
}
function showAuthModal(resolve, reject) {
  common_vendor.index.showModal({
    title: "权限提示",
    content: "打卡拍照需要获取您的地理位置，请在设置中开启",
    confirmText: "去设置",
    success: (res) => {
      if (res.confirm) {
        common_vendor.index.openSetting({
          success: (settingRes) => {
            if (settingRes.authSetting["scope.userLocation"]) {
              doGetLocation(resolve, reject);
            } else {
              reject(new Error("用户在设置页依然未授权"));
            }
          }
        });
      } else {
        reject(new Error("用户点击取消，拒绝授权"));
      }
    }
  });
}
exports.getLocationWithCheck = getLocationWithCheck;
//# sourceMappingURL=../../.sourcemap/mp-weixin/utils/getLocation.js.map
