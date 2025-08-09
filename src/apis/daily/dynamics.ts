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
}
export interface DynamicsPageQuery extends DynamicsQuery, PageQuery {}

/** @desc 查询动态列表 */
export function listDynamics(query: DynamicsPageQuery) {
  return http.get<PageRes<DynamicsResp[]>>(BASE_URL, query)
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

/** @desc 删除动态 */
export function deleteDynamics(id: string) {
  return http.del(BASE_URL, { ids: [id] })
}

/** @desc 导出动态 */
export function exportDynamics(query: DynamicsQuery) {
  return http.download(`${BASE_URL}/export`, query)
}
