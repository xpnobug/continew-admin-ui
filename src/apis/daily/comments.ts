import http from '@/utils/http'

const BASE_URL = '/daily/comments'

export interface CommentsResp {
  userId: string
  dynamicId: string
  content: string
  likesCount: string
  status: string
  createTime: string
  comment: string
  img: string
  createUserString: string
  updateUserString: string
  disabled: boolean
}
export interface CommentsDetailResp {
  id: string
  userId: string
  dynamicId: string
  parentId: string
  content: string
  likesCount: string
  status: string
  createUser: string
  createTime: string
  updateUser: string
  updateTime: string
  comment: string
  img: string
  replyCommentId: string
  replyUserId: string
  createUserString: string
  updateUserString: string
}
export interface CommentsQuery {
  sort: Array<string>
}
export interface CommentsPageQuery extends CommentsQuery, PageQuery {}

/** @desc 查询评论列表 */
export function listComments(query: CommentsPageQuery) {
  return http.get<PageRes<CommentsResp[]>>(BASE_URL, query)
}

/** @desc 查询评论详情 */
export function getComments(id: string) {
  return http.get<CommentsDetailResp>(`${BASE_URL}/${id}`)
}

/** @desc 新增评论 */
export function addComments(data: any) {
  return http.post(BASE_URL, data)
}

/** @desc 修改评论 */
export function updateComments(data: any, id: string) {
  return http.put(`${BASE_URL}/${id}`, data)
}

/** @desc 删除评论 */
export function deleteComments(id: string) {
  return http.del(BASE_URL, { ids: [id] })
}

/** @desc 导出评论 */
export function exportComments(query: CommentsQuery) {
  return http.download(`${BASE_URL}/export`, query)
}
