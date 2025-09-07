import http from '@/utils/http'

const BASE_URL = '/ai/meta'

export interface MetaResp {
  id: string
  modelName: string
  protocol: string
  iconUri: string
  capability: string
  connConfig: string
  status: number
  description: string
  createUser: string
  createTime: string
  updateUser: string
  updateTime: string
  iconUrl: string
  createUserString: string
  updateUserString: string
  disabled: boolean
}
export interface MetaDetailResp {
  id: string
  modelName: string
  protocol: string
  iconUri: string
  capability: string
  connConfig: string
  status: number
  description: string
  createUser: string
  createTime: string
  updateUser: string
  updateTime: string
  iconUrl: string
  createUserString: string
  updateUserString: string
}
export interface MetaQuery {
  modelName: string | undefined
  protocol: string | undefined
  iconUri: string | undefined
  status: number | undefined
  description: string | undefined
  createUser: string | undefined
  createTime: string | undefined
  iconUrl: string | undefined
  sort: Array<string>
}
export interface MetaPageQuery extends MetaQuery, PageQuery {}

/** @desc 查询模型元数据列表 */
export function listMeta(query: MetaPageQuery) {
  return http.get<PageRes<MetaResp[]>>(BASE_URL, query)
}

/** @desc 查询模型元数据详情 */
export function getMeta(id: string) {
  return http.get<MetaDetailResp>(`${BASE_URL}/${id}`)
}

/** @desc 新增模型元数据 */
export function addMeta(data: any) {
  return http.post(BASE_URL, data)
}

/** @desc 修改模型元数据 */
export function updateMeta(data: any, id: string) {
  return http.put(`${BASE_URL}/${id}`, data)
}

/** @desc 删除模型元数据 */
export function deleteMeta(id: string) {
  return http.del(BASE_URL, { ids: [id] })
}

/** @desc 导出模型元数据 */
export function exportMeta(query: MetaQuery) {
  return http.download(`${BASE_URL}/export`, query)
}

/** @desc 测试模型连接 */
export function testConnection(config: {
  provider: string
  baseUrl: string
  apiKey: string
  model: string
  timeout?: number
}) {
  return http.post(`${BASE_URL}/test-connection`, config)
}
