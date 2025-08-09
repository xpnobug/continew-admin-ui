import http from '@/utils/http'

const BASE_URL = '/daily/comments'

interface User {
  id: string
  username: string
  nickname: string
  avatar: string
  status: number
  gender: number
  deptName: string
}

interface ReplyComment {
  id: string
  userId: string
  dynamicId: string
  content: string
  likesCount: number
  status: number
  img: string
  replyCommentId: string
  replyUserId: string
  createTime: string
  user: User
  replyUser: User | null
  list: ReplyComment[] | null
}

export interface CommentsResp {
  id: string
  userId: string
  dynamicId: string
  content: string
  likesCount: number
  status: number
  createTime: string
  comment: string | null
  img: string
  replyCommentId: number
  replyUserId: number
  listCount: number
  createUserString: string | null
  updateUserString: string | null
  disabled?: boolean
  user: User
  replyUser: User | null
  list: ReplyComment[]
}
export interface CommentsDetailResp {
  id: string
  userId: string
  dynamicId: string
  content: string
  likesCount: number
  status: number
  createUser: string
  createTime: string
  updateUser: string
  updateTime: string
  comment: string | null
  img: string
  replyCommentId: number
  replyUserId: number
  listCount: number
  createUserString: string | null
  updateUserString: string | null
  user?: User
  replyUser?: User | null
  list?: ReplyComment[]
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
