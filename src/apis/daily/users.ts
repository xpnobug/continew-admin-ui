import http from '@/utils/http'

const BASE_URL = '/daily/users'

export interface UsersResp {
  openid: string
  unionid: string
  nickname: string
  avatar: string
  mobile: string
  gender: string
  birthday: string
  city: string
  province: string
  bio: string
  privacySetting: string
  lastLoginAt: string
  status: string
  createUserString: string
  updateUserString: string
  disabled: boolean
}
export interface UsersDetailResp {
  id: string
  openid: string
  unionid: string
  nickname: string
  avatar: string
  mobile: string
  gender: string
  birthday: string
  city: string
  province: string
  bio: string
  privacySetting: string
  lastLoginAt: string
  status: string
  createUser: string
  createTime: string
  updateUser: string
  updateTime: string
  createUserString: string
  updateUserString: string
}
export interface UsersQuery {
  nickname: string | undefined
  mobile: string | undefined
  sort: Array<string>
}
export interface UsersPageQuery extends UsersQuery, PageQuery {}

/** @desc 查询用户列表 */
export function listUsers(query: UsersPageQuery) {
  return http.get<PageRes<UsersResp[]>>(BASE_URL, query)
}

/** @desc 查询用户详情 */
export function getUsers(id: string) {
  return http.get<UsersDetailResp>(`${BASE_URL}/${id}`)
}

/** @desc 新增用户 */
export function addUsers(data: any) {
  return http.post(BASE_URL, data)
}

/** @desc 修改用户 */
export function updateUsers(data: any, id: string) {
  return http.put(`${BASE_URL}/${id}`, data)
}

/** @desc 删除用户 */
export function deleteUsers(id: string) {
  return http.del(BASE_URL, { ids: [id] })
}

/** @desc 导出用户 */
export function exportUsers(query: UsersQuery) {
  return http.download(`${BASE_URL}/export`, query)
}
