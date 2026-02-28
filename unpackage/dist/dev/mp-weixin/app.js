"use strict";
Object.defineProperty(exports, Symbol.toStringTag, { value: "Module" });
const common_vendor = require("./common/vendor.js");
require("./utils/request.js");
const store_user = require("./store/user.js");
const utils_permission = require("./utils/permission.js");
if (!Math) {
  "./pages/index/index.js";
  "./pages/login/login.js";
  "./pages/checkin/checkin.js";
  "./pages/mine/mine.js";
  "./pages/mine/password.js";
  "./pages/mine/records.js";
}
const _sfc_main = {
  __name: "App",
  setup(__props) {
    store_user.useUserStore();
    common_vendor.onLaunch(async () => {
      const token = common_vendor.index.getStorageSync("access_token");
      const pages = getCurrentPages();
      const currentPage = pages.length > 0 ? pages[pages.length - 1].route : "";
      if (!token && currentPage !== "pages/login/login") {
        common_vendor.index.__f__("warn", "at App.vue:65", "检测到未登录，正在强制重定向...");
        common_vendor.index.reLaunch({
          url: "/pages/login/login"
        });
      }
    });
    return () => {
    };
  }
};
function createApp() {
  const pinia = common_vendor.createPinia();
  const app = common_vendor.createSSRApp(_sfc_main);
  utils_permission.setupPermissionInterceptor();
  app.use(pinia);
  return {
    app,
    Pinia: common_vendor.Pinia
  };
}
createApp().app.mount("#app");
exports.createApp = createApp;
//# sourceMappingURL=../.sourcemap/mp-weixin/app.js.map
