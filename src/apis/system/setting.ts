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
