import http from '@/utils/http'

const BASE_URL = '/daily/circleMembers'

export interface CircleMembersResp {
  role: string
  joinedAt: string
  status: string
  createUser: string
  createUserString: string
  updateUserString: string
  disabled: boolean
}
export interface CircleMembersDetailResp {
  id: string
  circleId: string
  userId: string
  role: string
  joinedAt: string
  status: string
  createUser: string
  createTime: string
  updateUser: string
  updateTime: string
  createUserString: string
  updateUserString: string
}
export interface CircleMembersQuery {
  sort: Array<string>
}
export interface CircleMembersPageQuery extends CircleMembersQuery, PageQuery {}

/** @desc 查询圈子成员列表 */
export function listCircleMembers(query: CircleMembersPageQuery) {
  return http.get<PageRes<CircleMembersResp[]>>(BASE_URL, query)
}

/** @desc 查询圈子成员详情 */
export function getCircleMembers(id: string) {
  return http.get<CircleMembersDetailResp>(`${BASE_URL}/${id}`)
}

/** @desc 新增圈子成员 */
export function addCircleMembers(data: any) {
  return http.post(BASE_URL, data)
}

/** @desc 修改圈子成员 */
export function updateCircleMembers(data: any, id: string) {
  return http.put(`${BASE_URL}/${id}`, data)
}

/** @desc 删除圈子成员 */
export function deleteCircleMembers(id: string) {
  return http.del(BASE_URL, { ids: [id] })
}

/** @desc 导出圈子成员 */
export function exportCircleMembers(query: CircleMembersQuery) {
  return http.download(`${BASE_URL}/export`, query)
}
