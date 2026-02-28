"use strict";
const common_vendor = require("../../common/vendor.js");
const api_checkin = require("../../api/checkin.js");
const utils_geo = require("../../utils/geo.js");
const utils_getLocation = require("../../utils/getLocation.js");
const utils_request = require("../../utils/request.js");
if (!Array) {
  const _easycom_u_search2 = common_vendor.resolveComponent("u-search");
  const _easycom_u_icon2 = common_vendor.resolveComponent("u-icon");
  const _easycom_u_tag2 = common_vendor.resolveComponent("u-tag");
  const _easycom_u_list_item2 = common_vendor.resolveComponent("u-list-item");
  const _easycom_u_list2 = common_vendor.resolveComponent("u-list");
  const _easycom_u_empty2 = common_vendor.resolveComponent("u-empty");
  const _easycom_u_safe_bottom2 = common_vendor.resolveComponent("u-safe-bottom");
  (_easycom_u_search2 + _easycom_u_icon2 + _easycom_u_tag2 + _easycom_u_list_item2 + _easycom_u_list2 + _easycom_u_empty2 + _easycom_u_safe_bottom2)();
}
const _easycom_u_search = () => "../../uni_modules/uview-plus/components/u-search/u-search.js";
const _easycom_u_icon = () => "../../uni_modules/uview-plus/components/u-icon/u-icon.js";
const _easycom_u_tag = () => "../../uni_modules/uview-plus/components/u-tag/u-tag.js";
const _easycom_u_list_item = () => "../../uni_modules/uview-plus/components/u-list-item/u-list-item.js";
const _easycom_u_list = () => "../../uni_modules/uview-plus/components/u-list/u-list.js";
const _easycom_u_empty = () => "../../uni_modules/uview-plus/components/u-empty/u-empty.js";
const _easycom_u_safe_bottom = () => "../../uni_modules/uview-plus/components/u-safe-bottom/u-safe-bottom.js";
if (!Math) {
  (_easycom_u_search + _easycom_u_icon + _easycom_u_tag + _easycom_u_list_item + _easycom_u_list + _easycom_u_empty + _easycom_u_safe_bottom)();
}
const _sfc_main = {
  __name: "index",
  setup(__props) {
    const points = common_vendor.ref([]);
    const keyword = common_vendor.ref("");
    const locLoading = common_vendor.ref(false);
    const myLoc = common_vendor.ref({ lat: 0, lon: 0 });
    const currentAddress = common_vendor.ref("");
    const computedPoints = common_vendor.computed(() => {
      let list = [...points.value];
      if (keyword.value) {
        list = list.filter((p) => p.title.toLowerCase().includes(keyword.value.toLowerCase()));
      }
      const mappedList = list.map((item) => {
        let dist = 999999;
        let isInRange = false;
        let distanceText = "定位中...";
        if (myLoc.value.lat) {
          dist = utils_geo.getDistance(myLoc.value.lat, myLoc.value.lon, item.latitude, item.longitude);
          isInRange = dist <= item.radius;
          distanceText = dist > 1e3 ? (dist / 1e3).toFixed(2) + "km" : Math.round(dist) + "m";
        }
        return { ...item, dist, isInRange, distanceText };
      });
      return mappedList.sort((a, b) => a.dist - b.dist);
    });
    common_vendor.onMounted(() => {
      fetchPoints();
      manualRefreshLocation();
    });
    const fetchPoints = async () => {
      try {
        const res = await api_checkin.getMyPoints();
        points.value = res.data || [];
      } catch (e) {
        common_vendor.index.__f__("error", "at pages/index/index.vue:109", "获取打卡点列表失败", e);
      }
    };
    const manualRefreshLocation = async () => {
      if (locLoading.value)
        return;
      locLoading.value = true;
      try {
        const loc = await utils_getLocation.getLocationWithCheck();
        myLoc.value = { lat: loc.latitude, lon: loc.longitude };
        const geoRes = await utils_request.http.get("/geo/regeo", {
          params: { lat: loc.latitude, lon: loc.longitude }
        });
        currentAddress.value = geoRes.data.address;
      } catch (err) {
        common_vendor.index.showToast({ title: "定位失败，请确保权限开启", icon: "none" });
      } finally {
        locLoading.value = false;
      }
    };
    const goToDetail = (item) => {
      common_vendor.index.navigateTo({
        url: `/pages/checkin/checkin?id=${item.id}&title=${encodeURIComponent(item.title)}&lat=${item.latitude}&lon=${item.longitude}&radius=${item.radius}`
      });
    };
    return (_ctx, _cache) => {
      return common_vendor.e({
        a: common_vendor.o(_ctx.handleSearch),
        b: common_vendor.o(($event) => keyword.value = $event),
        c: common_vendor.p({
          placeholder: "搜索打卡点名称...",
          showAction: false,
          shape: "round",
          bgColor: "#fff",
          modelValue: keyword.value
        }),
        d: common_vendor.p({
          name: "map-fill",
          size: "14",
          color: "#2979ff"
        }),
        e: common_vendor.t(currentAddress.value || "正在获取当前精确位置..."),
        f: locLoading.value ? 1 : "",
        g: common_vendor.p({
          name: "reload",
          size: "14"
        }),
        h: common_vendor.o(manualRefreshLocation),
        i: computedPoints.value.length > 0
      }, computedPoints.value.length > 0 ? {
        j: common_vendor.f(computedPoints.value, (item, k0, i0) => {
          return {
            a: common_vendor.t(item.title),
            b: "1cf27b2a-5-" + i0 + "," + ("1cf27b2a-4-" + i0),
            c: common_vendor.p({
              text: item.isInRange ? "进入范围" : "距离过远",
              type: item.isInRange ? "success" : "info",
              size: "mini",
              shape: "circle"
            }),
            d: common_vendor.t(item.address),
            e: common_vendor.t(item.distanceText),
            f: item.isInRange ? 1 : "",
            g: common_vendor.t(item.radius),
            h: "1cf27b2a-6-" + i0 + "," + ("1cf27b2a-4-" + i0),
            i: item.isInRange ? 1 : "",
            j: common_vendor.o(($event) => goToDetail(item), item.id),
            k: item.id,
            l: "1cf27b2a-4-" + i0 + ",1cf27b2a-3"
          };
        }),
        k: common_vendor.p({
          name: "camera-fill",
          color: "#fff",
          size: "20"
        })
      } : {
        l: common_vendor.p({
          mode: "search",
          text: "暂无匹配的打卡点",
          marginTop: "100"
        })
      });
    };
  }
};
const MiniProgramPage = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["__scopeId", "data-v-1cf27b2a"]]);
wx.createPage(MiniProgramPage);
//# sourceMappingURL=../../../.sourcemap/mp-weixin/pages/index/index.js.map
