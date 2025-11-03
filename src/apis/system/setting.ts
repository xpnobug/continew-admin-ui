import http from '@/utils/http'

const BASE_URL = '/system/setting'

// 模块化配置：基础配置
export function getAppSetting<T = any>() {
  return http.get<T>(`${BASE_URL}/appSetting`)
}

export function saveAppSetting<T = any>(data: any) {
  return http.post<T>(`${BASE_URL}/appSetting`, data)
}

// 模块化配置：AI 按钮
export function getAiFabSetting<T = any>() {
  return http.get<T>(`${BASE_URL}/aiFab`)
}
export function saveAiFabSetting<T = any>(data: any) {
  return http.post<T>(`${BASE_URL}/aiFab`, data)
}

// 模块化配置：评论审核
export function getCommentSetting<T = any>() {
  return http.get<T>(`${BASE_URL}/comment`)
}
export function saveCommentSetting<T = any>(data: any) {
  return http.post<T>(`${BASE_URL}/comment`, data)
}

// 模块化配置：签到配置
export function getCheckinSetting<T = any>() {
  return http.get<T>(`${BASE_URL}/checkin`)
}
export function saveCheckinSetting<T = any>(data: any) {
  return http.post<T>(`${BASE_URL}/checkin`, data)
}

// 模块化配置：分片上传配置
export function getMultipartUploadSetting<T = any>() {
  return http.get<T>(`${BASE_URL}/multipart-upload`)
}
export function saveMultipartUploadSetting<T = any>(data: any) {
  return http.post<T>(`${BASE_URL}/multipart-upload`, data)
}

// 模块化配置：个人中心配置
export function getUserCenterSetting<T = any>() {
  return http.get<T>(`${BASE_URL}/user-center`)
}
export function saveUserCenterSetting<T = any>(data: any) {
  return http.post<T>(`${BASE_URL}/user-center`, data)
}

// 模块化配置：主题装扮配置
export function getThemeDecorationSetting<T = any>() {
  return http.get<T>(`${BASE_URL}/themeDecoration`)
}
export function saveThemeDecorationSetting<T = any>(data: any) {
  return http.post<T>(`${BASE_URL}/themeDecoration`, data)
}

// 模块化配置：常用设置（侧边栏）
export function getCommonSidebarSetting<T = any>() {
  return http.get<T>(`${BASE_URL}/commonSidebar`)
}
export function saveCommonSidebarSetting<T = any>(data: any) {
  return http.post<T>(`${BASE_URL}/commonSidebar`, data)
}

// 模块化配置：基础数据项配置
export function getBasicRecordItemsSetting<T = any>() {
  return http.get<T>(`${BASE_URL}/basicRecordItems`)
}
export function saveBasicRecordItemsSetting<T = any>(data: any) {
  return http.post<T>(`${BASE_URL}/basicRecordItems`, data)
}

// 模块化配置：微信小程序配置
export function getWxMaConfigSetting<T = any>() {
  return http.get<T>(`${BASE_URL}/wxMaConfig`)
}
export function saveWxMaConfigSetting<T = any>(data: any) {
  return http.post<T>(`${BASE_URL}/wxMaConfig`, data)
}
