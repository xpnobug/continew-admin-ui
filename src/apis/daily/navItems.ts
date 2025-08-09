import http from '@/utils/http'

const BASE_URL = '/daily/navItems'

export interface NavItemsResp {
  id: string
  itemName: string
  itemKey: string
  iconNormal: string
  iconActive: string
  pageUrl: string
  badgeType: string
  badgeText: string
  isVisible: string
  permissionCode: string
  userRoles: string
  customStyle: string
  sort: string
  status: string
  createUser: string
  createTime: string
  updateUser: string
  updateTime: string
  createUserString: string
  updateUserString: string
  disabled: boolean
}
export interface NavItemsDetailResp {
  id: string
  itemName: string
  itemKey: string
  iconNormal: string
  iconActive: string
  pageUrl: string
  badgeType: string
  badgeText: string
  isVisible: string
  permissionCode: string
  userRoles: string
  customStyle: string
  sort: string
  status: string
  createUser: string
  createTime: string
  updateUser: string
  updateTime: string
  createUserString: string
  updateUserString: string
}
export interface NavItemsQuery {
  itemName: string | undefined
  itemKey: string | undefined
  pageUrl: string | undefined
  isVisible: string | undefined
  createUser: string | undefined
  createTime: string | undefined
  sort: Array<string>
}
export interface NavItemsPageQuery extends NavItemsQuery, PageQuery {}

/** @desc 查询导航项列表 */
export function listNavItems(query: NavItemsPageQuery) {
  return http.get<PageRes<NavItemsResp[]>>(BASE_URL, query)
}

/** @desc 查询导航项详情 */
export function getNavItems(id: string) {
  return http.get<NavItemsDetailResp>(`${BASE_URL}/${id}`)
}

/** @desc 新增导航项 */
export function addNavItems(data: any) {
  return http.post(BASE_URL, data)
}

/** @desc 修改导航项 */
export function updateNavItems(data: any, id: string) {
  return http.put(`${BASE_URL}/${id}`, data)
}

/** @desc 删除导航项 */
export function deleteNavItems(id: string) {
  return http.del(BASE_URL, { ids: [id] })
}

/** @desc 导出导航项 */
export function exportNavItems(query: NavItemsQuery) {
  return http.download(`${BASE_URL}/export`, query)
}
