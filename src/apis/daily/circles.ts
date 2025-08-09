import http from '@/utils/http'

const BASE_URL = '/daily/circles'

export interface CirclesResp {
  name: string
  isHot: string
  isNew: string
  membersCount: string
  dynamicsCount: string
  status: string
  createUserString: string
  updateUserString: string
  disabled: boolean
}
export interface CirclesDetailResp {
  id: string
  name: string
  description: string
  avatar: string
  banner: string
  creatorId: string
  isHot: string
  isNew: string
  membersCount: string
  dynamicsCount: string
  status: string
  createUser: string
  createTime: string
  updateUser: string
  updateTime: string
  createUserString: string
  updateUserString: string
}
export interface CirclesQuery {
  name: string | undefined
  sort: Array<string>
}
export interface CirclesPageQuery extends CirclesQuery, PageQuery {}

/** @desc 查询圈子列表 */
export function listCircles(query: CirclesPageQuery) {
  return http.get<PageRes<CirclesResp[]>>(BASE_URL, query)
}

/** @desc 查询圈子详情 */
export function getCircles(id: string) {
  return http.get<CirclesDetailResp>(`${BASE_URL}/${id}`)
}

/** @desc 新增圈子 */
export function addCircles(data: any) {
  return http.post(BASE_URL, data)
}

/** @desc 修改圈子 */
export function updateCircles(data: any, id: string) {
  return http.put(`${BASE_URL}/${id}`, data)
}

/** @desc 删除圈子 */
export function deleteCircles(id: string) {
  return http.del(BASE_URL, { ids: [id] })
}

/** @desc 导出圈子 */
export function exportCircles(query: CirclesQuery) {
  return http.download(`${BASE_URL}/export`, query)
}
