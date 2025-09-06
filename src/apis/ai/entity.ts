import http from '@/utils/http'

const BASE_URL = '/ai/entity'

export interface EntityResp {
  id: string
  metaId: string
  name: string
  description: string
  defaultParams: string
  scenario: number
  status: number
  createUser: string
  createTime: string
  updateUser: string
  updateTime: string
  createUserString: string
  updateUserString: string
  disabled: boolean
}
export interface EntityDetailResp {
  id: string
  metaId: string
  name: string
  description: string
  defaultParams: string
  scenario: number
  status: number
  createUser: string
  createTime: string
  updateUser: string
  updateTime: string
  createUserString: string
  updateUserString: string
}
export interface EntityQuery {
  metaId: string | undefined
  name: string | undefined
  scenario: number | undefined
  status: string | undefined
  createUser: string | undefined
  createTime: string | undefined
  sort: Array<string>
}
export interface EntityPageQuery extends EntityQuery, PageQuery {}

/** @desc 查询模型信息列表 */
export function listEntity(query: EntityPageQuery) {
  return http.get<PageRes<EntityResp[]>>(BASE_URL, query)
}

/** @desc 查询模型信息详情 */
export function getEntity(id: string) {
  return http.get<EntityDetailResp>(`${BASE_URL}/${id}`)
}

/** @desc 新增模型信息 */
export function addEntity(data: any) {
  return http.post(BASE_URL, data)
}

/** @desc 修改模型信息 */
export function updateEntity(data: any, id: string) {
  return http.put(`${BASE_URL}/${id}`, data)
}

/** @desc 删除模型信息 */
export function deleteEntity(id: string) {
  return http.del(BASE_URL, { ids: [id] })
}

/** @desc 导出模型信息 */
export function exportEntity(query: EntityQuery) {
  return http.download(`${BASE_URL}/export`, query)
}
