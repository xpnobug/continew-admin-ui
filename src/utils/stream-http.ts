import { getToken } from '@/utils/auth'

export interface StreamOptions {
  onMessage: (data: any) => void
  onError?: (error: Error) => void
  onComplete?: () => void
  signal?: AbortSignal
  headers?: Record<string, string>
}

export interface StreamRequestConfig {
  url: string
  method?: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE'
  data?: any
  headers?: Record<string, string>
  timeout?: number
}

/**
 * 统一的流式HTTP工具类
 * 提供Server-Sent Events (SSE)和普通流式请求的统一接口
 */
export class StreamHttpClient {
  private baseURL: string
  private defaultHeaders: Record<string, string>
  private defaultTimeout: number

  constructor(baseURL?: string, timeout: number = 30000) {
    this.baseURL = baseURL || import.meta.env.VITE_API_BASE_URL || ''
    this.defaultTimeout = timeout
    this.defaultHeaders = {
      'Content-Type': 'application/json',
      'Accept': 'text/event-stream',
      'Cache-Control': 'no-cache',
    }
  }

  /**
   * 发送流式请求
   */
  async streamRequest(config: StreamRequestConfig, options: StreamOptions): Promise<void> {
    const { onMessage, onError, onComplete, signal, headers: optionHeaders = {} } = options
    const { url, method = 'POST', data, headers: configHeaders = {}, timeout = this.defaultTimeout } = config

    try {
      // 构建完整的请求URL
      const fullUrl = this.buildUrl(url)

      // 获取认证token
      const token = getToken()

      // 构建请求头
      const headers: Record<string, string> = {
        ...this.defaultHeaders,
        ...configHeaders,
        ...optionHeaders,
      }

      if (token) {
        headers.Authorization = `Bearer ${token}`
      }

      // 创建请求配置
      const requestConfig: RequestInit = {
        method,
        headers,
        signal,
      }

      // 添加请求体（如果需要）
      if (data && ['POST', 'PUT', 'PATCH'].includes(method)) {
        requestConfig.body = JSON.stringify(data)
      }

      // 设置超时
      const timeoutController = new AbortController()
      const timeoutId = setTimeout(() => timeoutController.abort(), timeout)

      // 组合信号
      const combinedSignal = this.combineSignals([signal, timeoutController.signal].filter(Boolean) as AbortSignal[])
      requestConfig.signal = combinedSignal

      // 发送请求
      const response = await fetch(fullUrl, requestConfig)

      // 清除超时
      clearTimeout(timeoutId)

      // 检查响应状态
      if (!response.ok) {
        await this.handleErrorResponse(response)
        return
      }

      // 检查是否支持流式响应
      if (!response.body) {
        throw new Error('浏览器不支持流式响应')
      }

      // 处理流式数据
      await this.processStreamResponse(response, onMessage, onError)

      onComplete?.()
    } catch (error) {
      const errorObj = error instanceof Error ? error : new Error(String(error))

      // 如果是用户主动取消或超时，不报错
      if (signal?.aborted || errorObj.name === 'AbortError') {
        return
      }

      onError?.(errorObj)
      throw errorObj
    }
  }

  /**
   * 发送SSE流式请求（简化接口）
   */
  async streamSSE(url: string, data: any, options: StreamOptions): Promise<void> {
    return this.streamRequest(
      {
        url,
        method: 'POST',
        data,
        headers: {
          Accept: 'text/event-stream',
        },
      },
      options,
    )
  }

  /**
   * 发送JSON流式请求
   */
  async streamJSON(url: string, data: any, options: StreamOptions): Promise<void> {
    return this.streamRequest(
      {
        url,
        method: 'POST',
        data,
        headers: {
          Accept: 'application/json',
        },
      },
      options,
    )
  }

  /**
   * 构建完整URL
   */
  private buildUrl(url: string): string {
    if (url.startsWith('http')) {
      return url
    }

    const baseUrl = this.baseURL.endsWith('/') ? this.baseURL.slice(0, -1) : this.baseURL
    const path = url.startsWith('/') ? url : `/${url}`

    return `${baseUrl}${path}`
  }

  /**
   * 处理错误响应
   */
  private async handleErrorResponse(response: Response): Promise<never> {
    let errorMessage = `HTTP ${response.status}: ${response.statusText}`

    try {
      const contentType = response.headers.get('content-type')
      if (contentType?.includes('application/json')) {
        const errorData = await response.json()
        if (errorData.message || errorData.msg) {
          errorMessage = errorData.message || errorData.msg
        }
      } else {
        const textError = await response.text()
        if (textError) {
          errorMessage = textError
        }
      }
    } catch {
      // 如果解析错误响应失败，使用默认错误信息
    }

    throw new Error(errorMessage)
  }

  /**
   * 处理流式响应
   */
  private async processStreamResponse(
    response: Response,
    onMessage: (data: any) => void,
    onError?: (error: Error) => void,
  ): Promise<void> {
    const reader = response.body!.getReader()
    const decoder = new TextDecoder('utf-8')

    let buffer = ''

    try {
      while (true) {
        const { done, value } = await reader.read()

        if (done) {
          break
        }

        // 解码数据
        const chunk = decoder.decode(value, { stream: true })
        buffer += chunk

        // 处理连续的 data: 块，返回已处理的位置
        const processedIndex = await this.processStreamBuffer(buffer, onMessage, onError)

        // 移除已处理的部分，只保留未处理的数据
        if (processedIndex > 0) {
          if (import.meta.env.DEV) {
            // eslint-disable-next-line no-console
            console.log(`🧹 清理buffer: 已处理${processedIndex}字符，剩余${buffer.length - processedIndex}字符`)
          }
          buffer = buffer.substring(processedIndex)
        }
      }

      // 处理剩余的buffer
      if (buffer.trim()) {
        await this.processStreamBuffer(buffer, onMessage, onError)
      }
    } finally {
      reader.releaseLock()
    }
  }

  /**
   * 处理流式数据缓冲区
   * @returns 已处理到的位置索引
   */
  private async processStreamBuffer(
    buffer: string,
    onMessage: (data: any) => void,
    onError?: (error: Error) => void,
  ): Promise<number> {
    let startIndex = 0
    let lastProcessedIndex = 0

    while (true) {
      // 查找下一个 "data:" 的位置
      const dataIndex = buffer.indexOf('data:', startIndex)
      if (dataIndex === -1) {
        break
      }

      // 从 "data:" 后开始查找JSON对象，跳过可能的空格
      let jsonStart = dataIndex + 5 // "data:".length

      // 跳过data:后的空格
      while (jsonStart < buffer.length && buffer[jsonStart] === ' ') {
        jsonStart++
      }

      // 检查是否是JSON对象的开始
      if (jsonStart >= buffer.length || buffer[jsonStart] !== '{') {
        startIndex = dataIndex + 1
        continue
      }

      // 使用括号计数来找到完整的JSON对象
      let braceCount = 0
      let jsonEnd = jsonStart
      let inString = false
      let escaped = false

      for (let i = jsonStart; i < buffer.length; i++) {
        const char = buffer[i]

        if (!inString) {
          if (char === '{') {
            braceCount++
          } else if (char === '}') {
            braceCount--
            if (braceCount === 0) {
              jsonEnd = i + 1
              break
            }
          } else if (char === '"') {
            inString = true
          }
        } else {
          if (!escaped && char === '"') {
            inString = false
          }
          escaped = !escaped && char === '\\'
        }
      }

      // 如果找到完整的JSON对象
      if (braceCount === 0 && jsonEnd > jsonStart) {
        const dataStr = buffer.substring(jsonStart, jsonEnd)

        if (import.meta.env.DEV) {
          // eslint-disable-next-line no-console
          console.log('🔍 处理data块:', dataStr)
        }

        try {
          const data = JSON.parse(dataStr)

          if (import.meta.env.DEV) {
            // eslint-disable-next-line no-console
            console.log('📦 解析到流式数据:', data)
          }

          // 检查是否有错误信息
          if (data.error) {
            console.error('❌ 流式响应错误:', data.error)
            onError?.(new Error(data.error))
            return lastProcessedIndex
          }

          // 调用消息处理回调
          onMessage(data)

          // 更新已处理位置（包含换行符）
          lastProcessedIndex = jsonEnd
          // 跳过可能的换行符
          while (lastProcessedIndex < buffer.length && (buffer[lastProcessedIndex] === '\n' || buffer[lastProcessedIndex] === '\r')) {
            lastProcessedIndex++
          }
        } catch (error) {
          console.warn('⚠️ 解析流式响应数据失败:', {
            dataStr,
            error: (error as Error).message,
          })
        }

        // 继续处理下一个data块
        startIndex = jsonEnd
      } else {
        // 没有找到完整的JSON对象，跳过这个位置
        startIndex = dataIndex + 1
      }
    }

    return lastProcessedIndex
  }

  /**
   * 处理流式响应行数据
   */
  private async processStreamLine(
    line: string,
    onMessage: (data: any) => void,
    onError?: (error: Error) => void,
  ): Promise<void> {
    const trimmedLine = line.trim()

    // 跳过空行和事件类型行
    if (trimmedLine === '' || trimmedLine === 'event: message') {
      return
    }

    if (import.meta.env.DEV) {
      // eslint-disable-next-line no-console
      console.log('🔍 处理流式响应行:', trimmedLine)
    }

    // 处理SSE格式数据: data: {...}
    if (trimmedLine.startsWith('data: ')) {
      const dataStr = trimmedLine.slice(6).trim()

      // 检查结束标志
      if (dataStr === '[DONE]' || dataStr === 'DONE') {
        if (import.meta.env.DEV) {
          // eslint-disable-next-line no-console
          console.log('✅ 流式响应完成')
        }
        return
      }

      try {
        const data = JSON.parse(dataStr)
        if (import.meta.env.DEV) {
          // eslint-disable-next-line no-console
          console.log('📦 解析到流式数据:', data)
        }

        // 检查是否有错误信息
        if (data.error) {
          console.error('❌ 流式响应错误:', data.error)
          onError?.(new Error(data.error))
          return
        }

        // 调用消息处理回调
        onMessage(data)
      } catch (error) {
        console.warn('⚠️ 解析流式响应数据失败:', {
          line: trimmedLine,
          dataStr,
          error: error.message,
        })
        // 不中断流式处理，继续处理后续数据
      }
    } else if (trimmedLine.startsWith('{') && trimmedLine.endsWith('}')) {
      try {
        const data = JSON.parse(trimmedLine)
        if (import.meta.env.DEV) {
          // eslint-disable-next-line no-console
          console.log('📦 解析到JSON数据:', data)
        }
        onMessage(data)
      } catch (error) {
        console.warn('⚠️ 解析JSON行数据失败:', {
          line: trimmedLine,
          error: error.message,
        })
      }
    } else if (trimmedLine.length > 0) {
      if (import.meta.env.DEV) {
        // eslint-disable-next-line no-console
        console.log('📝 收到纯文本响应:', trimmedLine)
      }
      // 尝试作为普通文本内容处理
      try {
        onMessage({ content: trimmedLine, done: false })
      } catch (error) {
        console.warn('⚠️ 处理纯文本响应失败:', error)
      }
    }
  }

  /**
   * 组合多个AbortSignal
   */
  private combineSignals(signals: AbortSignal[]): AbortSignal {
    if (signals.length === 0) {
      return new AbortController().signal
    }

    if (signals.length === 1) {
      return signals[0]
    }

    const controller = new AbortController()

    // 监听所有信号
    signals.forEach((signal) => {
      if (signal.aborted) {
        controller.abort()
        return
      }

      signal.addEventListener('abort', () => {
        controller.abort()
      })
    })

    return controller.signal
  }
}

// 创建默认实例
export const streamHttp = new StreamHttpClient()

// 导出便捷函数
export const streamRequest = streamHttp.streamRequest.bind(streamHttp)
export const streamSSE = streamHttp.streamSSE.bind(streamHttp)
export const streamJSON = streamHttp.streamJSON.bind(streamHttp)

// 创建流式请求控制器
export function createStreamController() {
  const controller = new AbortController()

  return {
    signal: controller.signal,
    cancel: () => controller.abort(),
    isCanceled: () => controller.signal.aborted,
  }
}

export default streamHttp
