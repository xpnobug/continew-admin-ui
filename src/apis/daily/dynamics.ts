import http from '@/utils/http'

const BASE_URL = '/daily/dynamics'

export interface DynamicsResp {
  userId: string
  content: string
  location: string
  circleId: string
  isPublic: string
  likesCount: string
  commentsCount: string
  sharesCount: string
  status: string
  createTime: string
  type: string
  isTop: string
  province: string
  browse: string
  createUserString: string
  updateUserString: string
  disabled: boolean
}
export interface DynamicsDetailResp {
  id: string
  userId: string
  content: string
  location: string
  circleId: string
  isPublic: string
  likesCount: string
  commentsCount: string
  sharesCount: string
  status: string
  createUser: string
  createTime: string
  updateUser: string
  updateTime: string
  type: string
  isTop: string
  province: string
  browse: string
  createUserString: string
  updateUserString: string
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
