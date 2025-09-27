import http from '@/utils/http'

const BASE_URL = '/daily/dynamics'

interface User {
  id: string
  username: string
  nickname: string
  avatar: string
  status: number
  gender: number
  deptName: string
}

interface MediaItem {
  id: string
  type: number
  url: string
  coverUrl?: string
  width: number
  height: number
  duration?: number
}

export interface DynamicsResp {
  id: string
  userId: string
  content: string
  location: string
  circleId: string
  isPublic: boolean
  likesCount: number
  commentsCount: number
  sharesCount: number
  status: number
  createTime: string
  type: number
  isTop: boolean
  province: string | null
  browse: number | null
  auditStatus?: number | null
  createUserString: string | null
  updateUserString: string | null
  disabled?: boolean
  user: User
  imgs: MediaItem[]
  video: MediaItem | null
  audio: MediaItem | null
  circle: any | null
}
export interface DynamicsDetailResp {
  id: string
  userId: string
  content: string
  location: string
  circleId: string
  isPublic: boolean
  likesCount: number
  commentsCount: number
  sharesCount: number
  status: number
  createUser: string
  createTime: string
  updateUser: string
  updateTime: string
  type: number
  isTop: boolean
  province: string | null
  browse: number | null
  auditStatus?: number | null
  createUserString: string | null
  updateUserString: string | null
  user?: User
  imgs?: MediaItem[]
  video?: MediaItem | null
  audio?: MediaItem | null
  circle?: any | null
}
export interface DynamicsQuery {
  sort: Array<string>
  /** 审核状态：0-待审核，1-审核通过，2-审核不通过 */
  auditStatus?: number
  /** 发布用户ID */
  userId?: string | number
  /** 是否公开：0否，1是 */
  isPublic?: number
  /** 启用状态：1启用，2禁用 */
  status?: number
  /** 动态类型：0文字，1图片，2视频，3音频 */
  type?: number
  /** 圈子ID */
  circleId?: string | number
  /** 创建时间-开始 */
  createTimeStart?: string
  /** 创建时间-结束 */
  createTimeEnd?: string
}
export interface DynamicsPageQuery extends DynamicsQuery, PageQuery {}

/** @desc 查询动态列表 */
export function listDynamics(query: DynamicsPageQuery) {
  return http.get<PageRes<DynamicsResp[]>>(BASE_URL, query)
}

/** @desc 后台查询动态列表（包含审核状态） */
export function listDynamicsAdmin(query: DynamicsPageQuery) {
  return http.get<PageRes<DynamicsResp[]>>(`${BASE_URL}/admin`, query)
}

/** @desc 查询动态详情 */
export function getDynamics(id: string) {
  return http.get<DynamicsDetailResp>(`${BASE_URL}/${id}`)
}

/** @desc 新增动态 */
export function addDynamics(data: any) {
  return http.post(BASE_URL, data)
}

/** @desc 修改动态 */
export function updateDynamics(data: any, id: string) {
  return http.put(`${BASE_URL}/${id}`, data)
}

/** @desc 审核动态 */
export function auditDynamics(id: string, auditStatus: number) {
  // 以查询参数方式传递，匹配后端 @RequestParam("auditStatus")
  return http.put(`${BASE_URL}/${id}/audit`, undefined, { params: { auditStatus } })
}

/** @desc 删除动态 */
export function deleteDynamics(id: string) {
  return http.del(BASE_URL, { ids: [id] })
}

/** @desc 导出动态 */
export function exportDynamics(query: DynamicsQuery) {
  return http.download(`${BASE_URL}/export`, query)
}
