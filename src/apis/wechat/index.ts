import http from '@/utils/http'

const BASE_URL = '/wechat/robot'

/** 机器人查询参数 */
export interface RobotQuery {
  keyword?: string
  status?: string
  owner?: string
}

/** 机器人响应 */
export interface RobotResp {
  id: number
  robotCode: string
  owner: string
  deviceId: string
  deviceName: string
  wechatId?: string
  alias?: string
  bindMobile?: string
  nickname?: string
  avatar?: string
  status: 'online' | 'offline' | 'error'
  redisDb: number
  errorMessage?: string
  lastLoginAt?: number
  createdAt: number
  updatedAt: number
}

/** 机器人创建请求 */
export interface RobotCreateReq {
  robotCode: string // 机器人编码
}

/** 二维码登录请求 */
export interface QrCodeLoginReq {
  robotId: number
  loginType?: string // 登录设备类型: ipad/win/mac/car
  isPretender?: boolean
}

/** 二维码响应 */
export interface QrCodeResp {
  Uuid: string // UUID (注意首字母大写)
  QrBase64?: string // 二维码图片Base64 (注意首字母大写)
  QrUrl?: string // 二维码图片URL (注意首字母大写)
  ExpiredTime?: string // 过期时间 (注意首字母大写)
  autoLogin?: boolean // 是否自动登录
  awkenLogin?: boolean // 是否唤醒登录
}

/** 登录状态检查请求 */
export interface LoginCheckReq {
  robotId: number
  uuid: string
}

/** 账号信息 */
export interface AcctSectResp {
  userName: string
  alias: string
  bindMobile: string
  fsurl: string
  nickName: string
}

/** 登录状态响应 */
export interface LoginCheckResp {
  uuid: string
  status: number
  pushLoginUrlexpiredTime?: number
  expiredTime?: number
  headImgUrl?: string
  nickName?: string
  ticket?: string
  acctSectResp?: AcctSectResp
  data62?: string
  a16?: string
  need2FA?: boolean
  errMsg?: string
}

/** 2FA验证请求 */
export interface Login2FAReq {
  robotId: number
  uuid: string
  data62: string
  code?: string
  ticket?: string
}

/** Data62登录请求 */
export interface Data62LoginReq {
  robotId: number
  username: string // 微信账号(手机号/邮箱/微信号)
  password: string // 微信密码
  data62?: string // Data62数据(可选,传入可提高成功率)
}

/** Data62登录响应 */
export interface Data62LoginResp {
  status?: number
  errMsg?: string
  success?: boolean
  needSMS?: boolean // 是否需要短信验证
  ticket?: string // 票据(用于后续SMS验证)
}

/** @desc 查询机器人列表 */
export function listRobot(query: RobotQuery & PageQuery) {
  return http.get<PageRes<RobotResp[]>>(`${BASE_URL}`, query)
}

/** @desc 查询机器人详情 */
export function getRobot(id: number) {
  return http.get<RobotResp>(`${BASE_URL}/${id}`)
}

/** @desc 创建机器人 */
export function createRobot(data: RobotCreateReq) {
  return http.post<IdResp>(`${BASE_URL}`, data)
}

/** @desc 删除机器人 */
export function deleteRobot(id: number) {
  return http.del(`${BASE_URL}/${id}`)
}

/** @desc 重启客户端容器 */
export function restartClient(id: number) {
  return http.post(`${BASE_URL}/${id}/restart-client`)
}

/** @desc 重启服务端容器 */
export function restartServer(id: number) {
  return http.post(`${BASE_URL}/${id}/restart-server`)
}

// ========== 登录相关接口 ==========

const LOGIN_BASE_URL = '/wechat/robot/login'

/** @desc 获取登录二维码 */
export function getQrCode(data: QrCodeLoginReq) {
  return http.post<QrCodeResp>(`${LOGIN_BASE_URL}/qrcode`, data)
}

/** @desc 检查登录状态 */
export function checkLoginStatus(data: LoginCheckReq) {
  return http.post<LoginCheckResp>(`${LOGIN_BASE_URL}/check`, data)
}

/** @desc 二次验证 */
export function verify2FA(data: Login2FAReq) {
  return http.post<LoginCheckResp>(`${LOGIN_BASE_URL}/2fa`, data)
}

/** @desc Data62登录 */
export function loginByData62(data: Data62LoginReq) {
  return http.post<Data62LoginResp>(`${LOGIN_BASE_URL}/data62`, data)
}

/** @desc 退出登录 */
export function logout(robotId: number) {
  return http.del(`${LOGIN_BASE_URL}/logout/${robotId}`)
}

// ========== 联系人相关接口 ==========

const CONTACT_BASE_URL = '/wechat/contact'

/** 联系人类型 */
export type ContactType = 'friend' | 'chat_room' | 'official_account'

/** 联系人查询参数 */
export interface ContactQuery {
  robotId: number
  keyword?: string
  type?: ContactType | 'all'
}

/** 联系人响应 */
export interface ContactResp {
  id: number
  wechatId: string // 微信ID
  alias?: string // 微信号
  nickname?: string // 昵称
  avatar?: string // 头像
  type: ContactType // 类型
  remark?: string // 备注
  pyinitial?: string // 拼音首字母
  quanPin?: string // 全拼
  sex?: number // 性别: 0=未知,1=男,2=女
  country?: string // 国家
  province?: string // 省份
  city?: string // 城市
  signature?: string // 个性签名
  snsBackground?: string // 朋友圈背景
  chatRoomOwner?: string // 群主微信ID
  lastActiveAt?: number // 最近活跃时间
  createdAt: number
  updatedAt: number
}

/** 好友搜索请求 */
export interface FriendSearchReq {
  robotId: number
  keyword: string // 微信号/手机号
}

/** 添加好友请求 */
export interface FriendAddReq {
  robotId: number
  wechatId: string // 微信ID
  verifyContent?: string // 验证消息
  sourceType?: number // 来源类型
}

/** 从群聊添加好友请求 */
export interface FriendAddFromChatRoomReq {
  robotId: number
  chatRoomId: string // 群聊ID
  wechatId: string // 要添加的微信ID
  verifyContent?: string // 验证消息
}

/** 设置好友备注请求 */
export interface FriendRemarkReq {
  robotId: number
  wechatId: string
  remark: string
}

/** 通过好友验证请求 */
export interface FriendPassVerifyReq {
  robotId: number
  wechatId: string
  scene: number // 场景值(从系统消息XML中获取)
  ticket: string // 票据(从系统消息XML中获取)
}

/** 删除好友请求 */
export interface FriendDeleteReq {
  robotId: number
  wechatId: string
}

/** 同步联系人请求 */
export interface ContactSyncReq {
  robotId: number
}

/** @desc 查询联系人列表(分页) */
export function listContact(query: ContactQuery & PageQuery) {
  return http.get<PageRes<ContactResp[]>>(`${CONTACT_BASE_URL}/page`, query)
}

/** @desc 同步联系人 */
export function syncContacts(data: ContactSyncReq) {
  return http.post(`${CONTACT_BASE_URL}/sync`, data)
}

/** @desc 搜索好友 */
export function searchFriend(data: FriendSearchReq) {
  return http.post<ContactResp>(`${CONTACT_BASE_URL}/friend/search`, data)
}

/** @desc 添加好友 */
export function addFriend(data: FriendAddReq) {
  return http.post(`${CONTACT_BASE_URL}/friend/add`, data)
}

/** @desc 从群聊添加好友 */
export function addFriendFromChatRoom(data: FriendAddFromChatRoomReq) {
  return http.post(`${CONTACT_BASE_URL}/friend/add-from-chat-room`, data)
}

/** @desc 设置好友备注 */
export function setFriendRemark(data: FriendRemarkReq) {
  return http.patch(`${CONTACT_BASE_URL}/friend/remark`, data)
}

/** @desc 通过好友验证 */
export function passFriendVerify(data: FriendPassVerifyReq) {
  return http.post(`${CONTACT_BASE_URL}/friend/pass-verify`, data)
}

/** @desc 删除好友 */
export function deleteFriend(data: FriendDeleteReq) {
  return http.del(`${CONTACT_BASE_URL}/friend`, data)
}

// ========== 消息相关接口 ==========

const MESSAGE_BASE_URL = '/wechat/message'

/** 发送文本消息请求 */
export interface SendTextMessageReq {
  robotId: number
  toWxid: string // 接收者微信ID(好友ID或群ID)
  content: string // 文本内容
  atList?: string[] // @的微信ID列表(群聊消息)
}

/** 发送图片消息请求 */
export interface SendImageMessageReq {
  robotId: number
  toWxid: string
  imageUrl: string // 图片URL
}

/** 发送语音消息请求 */
export interface SendVoiceMessageReq {
  robotId: number
  toWxid: string
  voiceUrl: string // 语音文件URL
  duration: number // 时长(秒)
}

/** 发送视频消息请求 */
export interface SendVideoMessageReq {
  robotId: number
  toWxid: string
  videoUrl: string // 视频URL
  thumbUrl?: string // 缩略图URL
}

/** 发送文件消息请求 */
export interface SendFileMessageReq {
  robotId: number
  toWxid: string
  fileUrl: string // 文件URL
  fileName: string // 文件名
}

/** 撤回消息请求 */
export interface MessageRevokeReq {
  robotId: number
  msgId: number // 消息ID
  toWxid: string // 接收者微信ID
}

/** 聊天记录查询 */
export interface ChatHistoryQuery {
  robotId: number
  contactWxid: string // 联系人微信ID
  keyword?: string // 搜索关键词
}

/** 聊天记录响应 */
export interface ChatHistoryResp {
  id: number
  msgId: number
  type: number // 消息类型
  fromWxid: string
  toWxid: string
  content?: string
  senderWxid?: string // 群消息发送者
  isChatRoom: boolean
  isAtMe: boolean
  attachmentUrl?: string
  createdAt: number
}

/** @desc 发送文本消息 */
export function sendTextMessage(data: SendTextMessageReq) {
  return http.post(`${MESSAGE_BASE_URL}/send/text`, data)
}

/** @desc 发送图片消息 */
export function sendImageMessage(data: SendImageMessageReq) {
  return http.post(`${MESSAGE_BASE_URL}/send/image`, data)
}

/** @desc 发送语音消息 */
export function sendVoiceMessage(data: SendVoiceMessageReq) {
  return http.post(`${MESSAGE_BASE_URL}/send/voice`, data)
}

/** @desc 发送视频消息 */
export function sendVideoMessage(data: SendVideoMessageReq) {
  return http.post(`${MESSAGE_BASE_URL}/send/video`, data)
}

/** @desc 发送文件消息 */
export function sendFileMessage(data: SendFileMessageReq) {
  return http.post(`${MESSAGE_BASE_URL}/send/file`, data)
}

/** @desc 撤回消息 */
export function revokeMessage(data: MessageRevokeReq) {
  return http.post(`${MESSAGE_BASE_URL}/revoke`, data)
}

/** @desc 查询聊天记录(分页) */
export function listChatHistory(query: ChatHistoryQuery & PageQuery) {
  return http.get<PageRes<ChatHistoryResp[]>>('/wechat/chat-history/page', query)
}

// ========== 群聊相关接口 ==========

const CHATROOM_BASE_URL = '/wechat/chat-room'

/** 群成员响应 */
export interface ChatRoomMemberResp {
  id: number
  chatRoomId: string
  wechatId: string
  nickname?: string
  avatar?: string
  inviterWechatId?: string // 邀请人
  isAdmin: boolean // 是否管理员
  isLeaved: boolean // 是否已离开
  joinedAt: number
  lastActiveAt: number
  leavedAt?: number
}

/** 创建群聊请求 */
export interface ChatRoomCreateReq {
  robotId: number
  memberWxids: string[] // 成员微信ID列表
}

/** 邀请入群请求 */
export interface ChatRoomInviteReq {
  robotId: number
  chatRoomId: string
  memberWxids: string[] // 要邀请的微信ID列表
}

/** 同意入群请求 */
export interface ChatRoomJoinReq {
  robotId: number
  wechatId: string // 申请人微信ID
  chatRoomId: string
  ticket: string // 票据(从系统消息获取)
}

/** 设置群名称请求 */
export interface ChatRoomSetNameReq {
  robotId: number
  chatRoomId: string
  name: string
}

/** 设置群公告请求 */
export interface ChatRoomSetAnnouncementReq {
  robotId: number
  chatRoomId: string
  announcement: string
}

/** 设置群备注请求 */
export interface ChatRoomSetRemarkReq {
  robotId: number
  chatRoomId: string
  remark: string
}

/** 删除群成员请求 */
export interface ChatRoomMemberDeleteReq {
  robotId: number
  chatRoomId: string
  memberWxids: string[]
}

/** 退出群聊请求 */
export interface ChatRoomQuitReq {
  robotId: number
  chatRoomId: string
}

/** 同步群成员请求 */
export interface ChatRoomMemberSyncReq {
  robotId: number
  chatRoomId: string
}

/** @desc 查询群成员列表 */
export function listChatRoomMembers(robotId: number, chatRoomId: string) {
  return http.get<ChatRoomMemberResp[]>(`${CHATROOM_BASE_URL}/members`, {
    robotId,
    chatRoomId,
  })
}

/** @desc 同步群成员 */
export function syncChatRoomMembers(data: ChatRoomMemberSyncReq) {
  return http.post(`${CHATROOM_BASE_URL}/members/sync`, data)
}

/** @desc 创建群聊 */
export function createChatRoom(data: ChatRoomCreateReq) {
  return http.post(`${CHATROOM_BASE_URL}/create`, data)
}

/** @desc 邀请入群 */
export function inviteChatRoomMember(data: ChatRoomInviteReq) {
  return http.post(`${CHATROOM_BASE_URL}/invite`, data)
}

/** @desc 同意入群申请 */
export function consentToJoin(data: ChatRoomJoinReq) {
  return http.post(`${CHATROOM_BASE_URL}/join`, data)
}

/** @desc 设置群名称 */
export function setChatRoomName(data: ChatRoomSetNameReq) {
  return http.patch(`${CHATROOM_BASE_URL}/name`, data)
}

/** @desc 设置群公告 */
export function setChatRoomAnnouncement(data: ChatRoomSetAnnouncementReq) {
  return http.patch(`${CHATROOM_BASE_URL}/announcement`, data)
}

/** @desc 设置群备注 */
export function setChatRoomRemark(data: ChatRoomSetRemarkReq) {
  return http.patch(`${CHATROOM_BASE_URL}/remark`, data)
}

/** @desc 删除群成员 */
export function deleteChatRoomMember(data: ChatRoomMemberDeleteReq) {
  return http.del(`${CHATROOM_BASE_URL}/members`, data)
}

/** @desc 退出群聊 */
export function quitChatRoom(data: ChatRoomQuitReq) {
  return http.del(`${CHATROOM_BASE_URL}/quit`, data)
}

// ========== 系统消息相关接口 ==========

const SYSTEM_MESSAGE_BASE_URL = '/wechat/system-message'

/** 系统消息响应 */
export interface SystemMessageResp {
  id: number
  msgId: number
  type: number // 消息类型: 37=好友请求,10000=群邀请
  content?: string
  fromWxid?: string
  toWxid?: string
  status: number // 处理状态: 0=未处理,1=已处理
  isRead: boolean
  createdAt: number
  updatedAt: number
}

/** 批量标记已读请求 */
export interface SystemMessageMarkReadReq {
  robotId: number
  messageIds: number[]
}

/** @desc 查询最近一个月系统消息 */
export function listSystemMessages(robotId: number) {
  return http.get<SystemMessageResp[]>(`${SYSTEM_MESSAGE_BASE_URL}/recent`, { robotId })
}

/** @desc 批量标记已读 */
export function markSystemMessagesAsRead(data: SystemMessageMarkReadReq) {
  return http.post(`${SYSTEM_MESSAGE_BASE_URL}/mark-read`, data)
}

// ========== 配置管理相关接口 ==========

const SETTINGS_BASE_URL = '/wechat/settings'

/** 全局配置响应 */
export interface GlobalSettingsResp {
  id: number
  // AI聊天配置
  chatAiEnabled: boolean
  chatBaseUrl?: string
  chatApiKey?: string
  chatModel?: string
  workflowModel?: string
  imageRecognitionModel?: string
  chatPrompt?: string
  chatAiTrigger?: string
  maxCompletionTokens?: number
  
  // AI绘图配置
  imageAiEnabled: boolean
  imageModel?: string
  imageAiSettings?: string // JSON
  
  // TTS配置
  ttsEnabled: boolean
  ttsSettings?: string // JSON
  lttsSettings?: string // JSON
  
  // 拍一拍配置
  patEnabled: boolean
  patType?: 'text' | 'voice'
  patText?: string
  patVoiceTimbre?: string
  
  // 欢迎新人配置
  welcomeEnabled: boolean
  welcomeType?: 'text' | 'emoji' | 'image' | 'url'
  welcomeText?: string
  welcomeEmojiMd5?: string
  welcomeImageUrl?: string
  
  // 退群提醒
  leaveChatRoomAlertEnabled: boolean
  leaveChatRoomAlertText?: string
  
  // 定时任务
  friendSyncCron?: string
  newsEnabled: boolean
  newsCron?: string
  morningEnabled: boolean
  morningCron?: string
  chatRoomSummaryEnabled: boolean
  chatRoomSummaryCron?: string
  chatRoomRankingEnabled: boolean
  chatRoomRankingDailyCron?: string
  
  createdAt: number
  updatedAt: number
}

/** @desc 查询全局配置 */
export function getGlobalSettings(robotId: number) {
  return http.get<GlobalSettingsResp>(`${SETTINGS_BASE_URL}/global`, { robotId })
}

/** @desc 保存全局配置 */
export function saveGlobalSettings(robotId: number, data: Partial<GlobalSettingsResp>) {
  return http.post(`${SETTINGS_BASE_URL}/global`, { robotId, ...data })
}
