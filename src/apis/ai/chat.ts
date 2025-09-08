import http from '@/utils/http'
import { createStreamController, streamSSE } from '@/utils/stream-http'

const BASE_URL = '/ai/chat'

export interface ChatMessage {
  role: 'user' | 'assistant' | 'system'
  content: string
}

export interface ChatRequest {
  messages: ChatMessage[]
  modelId: string
  promptId?: string
  config?: {
    temperature?: number
    maxTokens?: number
    topP?: number
    frequencyPenalty?: number
    presencePenalty?: number
  }
  stream?: boolean
}

export interface ChatResponse {
  message: ChatMessage
  usage?: {
    promptTokens: number
    completionTokens: number
    totalTokens: number
  }
  responseTime: number
}

export interface StreamChatResponse {
  content: string
  done: boolean
  usage?: {
    promptTokens: number
    completionTokens: number
    totalTokens: number
  }
  error?: string
}

export interface StreamChatOptions {
  onMessage: (chunk: StreamChatResponse) => void
  onError?: (error: Error) => void
  onComplete?: () => void
  signal?: AbortSignal
}

/** @desc 发送聊天消息 */
export function sendChatMessage(data: ChatRequest) {
  return http.post<ChatResponse>(`${BASE_URL}/send`, data)
}

/** @desc 流式聊天 */
export async function sendStreamChatMessage(
  data: ChatRequest,
  options: StreamChatOptions,
): Promise<void> {
  // 使用统一的流式HTTP工具
  return streamSSE(`${BASE_URL}/stream`, { ...data, stream: true }, {
    onMessage: options.onMessage,
    onError: options.onError,
    onComplete: options.onComplete,
    signal: options.signal,
  })
}

/** @desc 创建流式聊天控制器（支持取消） */
export function createStreamChatController() {
  return createStreamController()
}
