import http from '@/utils/http'

const BASE_URL = '/ai/promptResource'

export interface PromptResourceResp {
  id: string
  spaceId: number
  name: string
  description: string
  promptText: string
  status: number
  createUser: string
  createTime: string
  updateUser: string
  updateTime: string
  createUserString: string
  updateUserString: string
  disabled: boolean
}
export interface PromptResourceDetailResp {
  id: string
  spaceId: number
  name: string
  description: string
  promptText: string
  status: number
  createUser: string
  createTime: string
  updateUser: string
  updateTime: string
  createUserString: string
  updateUserString: string
}
export interface PromptResourceQuery {
  spaceId: number | undefined
  name: string | undefined
  description: string | undefined
  status: number | undefined
  createUser: string | undefined
  createTime: string | undefined
  sort: Array<string>
}
export interface PromptResourcePageQuery extends PromptResourceQuery, PageQuery {}

/** @desc 查询提示词资源列表 */
export function listPromptResource(query: PromptResourcePageQuery) {
  return http.get<PageRes<PromptResourceResp[]>>(BASE_URL, query)
}

/** @desc 查询提示词资源详情 */
export function getPromptResource(id: string) {
  return http.get<PromptResourceDetailResp>(`${BASE_URL}/${id}`)
}

/** @desc 新增提示词资源 */
export function addPromptResource(data: any) {
  return http.post(BASE_URL, data)
}

/** @desc 修改提示词资源 */
export function updatePromptResource(data: any, id: string) {
  return http.put(`${BASE_URL}/${id}`, data)
}

/** @desc 删除提示词资源 */
export function deletePromptResource(id: string) {
  return http.del(BASE_URL, { ids: [id] })
}

/** @desc 导出提示词资源 */
export function exportPromptResource(query: PromptResourceQuery) {
  return http.download(`${BASE_URL}/export`, query)
}
