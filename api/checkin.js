import http from '@/utils/request.js'
import { baseURL } from '../utils/request'
import { useUserStore } from '@/store/user.js'
/**
 * 获取当前员工被指派的所有打卡点
 */
export const getMyPoints = () => {
    return http.get('/checkin/my_points')
}

/**
 * 执行打卡提交 (包含图片上传)
 * @param {Object} data - FormData 格式，包含 file, lat, lon, employee_id
 */
export const uploadCheckIn = data => {
    return http.upload('/checkin/upload', {
        filePath: data.filePath,
        name: 'file',
        formData: {
            lat: data.lat,
            lon: data.lon,
            employee_id: data.employee_id
        }
    })
}

/**
 * 执行打卡提交 (包含图片上传)
 * @param {Object} data - FormData 格式，包含 file, lat, lon, employee_id
 */
export const uploadCheckOut = (previewImage, pointId, myCurrentLoc, address) => {
    const userStore = useUserStore()
    return uni.uploadFile({
        url: baseURL + '/checkin/upload',
        filePath: previewImage,
        name: 'file',
        header: { token: userStore.token },
        formData: { point_id: pointId, lat: myCurrentLoc.lat, lon: myCurrentLoc.lon, address: address }
    })
}

export const getMyRecords = params => {
    return http.get('/checkin/my_records', { params })
}
