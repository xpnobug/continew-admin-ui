import http from '@/utils/http'

const BASE_URL = '/daily/appConfig'

export interface AppConfigResp {
  appName: string
  appSlogan: string
  appNotice: string
  appDesc: string
  copyType: string
  copyImg: string
  copyText: string
  copyWebsite: string
  copyLink: string
  uploadType: string
  isActivity: string
  isWaterfall: string
  isClassify: string
  isNoteShop: string
  isNoteVideo: string
  isCard: string
  isLive: string
  isMemo: string
  configJson?: string
  status: string
  createUserString: string
  updateUserString: string
  disabled: boolean
}
export interface AppConfigDetailResp {
  id: string
  appName: string
  appSlogan: string
  appNotice: string
  appDesc: string
  copyType: string
  copyImg: string
  copyText: string
  copyWebsite: string
  copyLink: string
  uploadType: string
  isActivity: string
  isWaterfall: string
  isClassify: string
  isNoteShop: string
  isNoteVideo: string
  isCard: string
  isLive: string
  isMemo: string
  configJson?: string
  status: string
  createUser: string
  createTime: string
  updateUser: string
  updateTime: string
  createUserString: string
  updateUserString: string
}
export interface AppConfigQuery {
  status: string | undefined
  createUser: string | undefined
  createTime: string | undefined
  sort: Array<string>
}
export interface AppConfigPageQuery extends AppConfigQuery, PageQuery {}

/** @desc 查询应用配置列表 */
export function listAppConfig(query: AppConfigPageQuery) {
  return http.get<PageRes<AppConfigResp[]>>(BASE_URL, query)
}

/** @desc 查询应用配置详情 */
export function getAppConfig(id: string) {
  return http.get<AppConfigDetailResp>(`${BASE_URL}/${id}`)
}

/** @desc 新增应用配置 */
export function addAppConfig(data: any) {
  return http.post(BASE_URL, data)
}

/** @desc 修改应用配置 */
export function updateAppConfig(data: any, id: string) {
  return http.put(`${BASE_URL}/${id}`, data)
}

/** @desc 删除应用配置 */
export function deleteAppConfig(id: string) {
  return http.del(BASE_URL, { ids: [id] })
}

/** @desc 导出应用配置 */
export function exportAppConfig(query: AppConfigQuery) {
  return http.download(`${BASE_URL}/export`, query)
}
