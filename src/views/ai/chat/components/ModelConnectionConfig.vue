<template>
  <div class="connection-config">
    <div class="config-header">
      <h4>连接配置</h4>
      <div class="header-actions">
        <a-button size="small" type="outline" @click="resetToDefaults">
          <template #icon><icon-refresh /></template>
          重置
        </a-button>
      </div>
    </div>

    <div class="config-form">
      <!-- 基础连接信息 -->
      <div class="form-section">
        <div class="section-title">基础连接</div>

        <div class="form-row">
          <label class="form-label">服务提供商</label>
          <a-select
            v-model="config.provider"
            placeholder="选择服务提供商"
            style="width: 100%"
          >
            <a-option value="openai">OpenAI</a-option>
            <a-option value="anthropic">Anthropic</a-option>
            <a-option value="azure">Azure OpenAI</a-option>
            <a-option value="huggingface">HuggingFace</a-option>
            <a-option value="custom">自定义</a-option>
          </a-select>
        </div>

        <div class="form-row">
          <label class="form-label">API基础URL</label>
          <a-input
            v-model="config.baseUrl"
            placeholder="https://api.openai.com/v1"
            style="width: 100%"
          />
        </div>

        <div class="form-row">
          <label class="form-label">API密钥</label>
          <a-input-password
            v-model="config.apiKey"
            placeholder="输入API密钥或使用环境变量 ${API_KEY}"
            style="width: 100%"
          />
        </div>

        <div class="form-row">
          <label class="form-label">模型名称</label>
          <a-input
            v-model="config.model"
            placeholder="gpt-4o-mini"
            style="width: 100%"
          />
        </div>
      </div>

      <!-- 高级配置 -->
      <div class="form-section">
        <div class="section-title">高级配置</div>

        <div class="form-row">
          <label class="form-label">请求超时 (毫秒)</label>
          <a-input-number
            v-model="config.timeout"
            :min="1000"
            :max="300000"
            :step="1000"
            style="width: 100%"
          />
        </div>

        <div class="form-row">
          <label class="form-label">重试次数</label>
          <a-input-number
            v-model="config.retryTimes"
            :min="0"
            :max="10"
            style="width: 100%"
          />
        </div>
      </div>

      <!-- 速率限制 -->
      <div class="form-section">
        <div class="section-title">速率限制</div>

        <div class="form-row">
          <label class="form-label">每分钟请求数 (RPM)</label>
          <a-input-number
            v-model="config.rateLimit.rpm"
            :min="1"
            :max="10000"
            style="width: 100%"
          />
        </div>

        <div class="form-row">
          <label class="form-label">每分钟Token数 (TPM)</label>
          <a-input-number
            v-model="config.rateLimit.tpm"
            :min="1000"
            :max="1000000"
            :step="1000"
            style="width: 100%"
          />
        </div>
      </div>

      <!-- 自定义请求头 -->
      <div class="form-section">
        <div class="section-title">
          自定义请求头
          <a-button size="mini" type="text" @click="addHeader">
            <template #icon><icon-plus /></template>
            添加
          </a-button>
        </div>

        <div class="headers-list">
          <div
            v-for="(header, index) in config.headers"
            :key="index"
            class="header-row"
          >
            <a-input
              v-model="header.key"
              placeholder="Header名称"
              style="flex: 1"
            />
            <a-input
              v-model="header.value"
              placeholder="Header值"
              style="flex: 1"
            />
            <a-button
              size="small"
              type="text"
              status="danger"
              @click="removeHeader(index)"
            >
              <template #icon><icon-delete /></template>
            </a-button>
          </div>
        </div>
      </div>

      <!-- 代理配置 -->
      <div class="form-section">
        <div class="section-title">
          代理配置
          <a-switch
            v-model="config.proxy.enabled"
            size="small"
            style="margin-left: auto"
          />
        </div>

        <div v-show="config.proxy.enabled" class="proxy-config">
          <div class="form-row">
            <label class="form-label">代理主机</label>
            <a-input
              v-model="config.proxy.host"
              placeholder="proxy.example.com"
              style="width: 100%"
            />
          </div>

          <div class="form-row">
            <label class="form-label">端口</label>
            <a-input-number
              v-model="config.proxy.port"
              :min="1"
              :max="65535"
              style="width: 100%"
            />
          </div>

          <div class="form-row">
            <label class="form-label">用户名 (可选)</label>
            <a-input
              v-model="config.proxy.username"
              placeholder="代理用户名"
              style="width: 100%"
            />
          </div>

          <div class="form-row">
            <label class="form-label">密码 (可选)</label>
            <a-input-password
              v-model="config.proxy.password"
              placeholder="代理密码"
              style="width: 100%"
            />
          </div>
        </div>
      </div>

      <!-- SSL配置 -->
      <div class="form-section">
        <div class="section-title">SSL配置</div>

        <div class="form-row">
          <label class="form-label">验证SSL证书</label>
          <a-switch v-model="config.ssl.verify" />
        </div>

        <div v-show="!config.ssl.verify" class="form-row">
          <label class="form-label">证书路径 (可选)</label>
          <a-input
            v-model="config.ssl.certPath"
            placeholder="/path/to/certificate.pem"
            style="width: 100%"
          />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
interface RateLimit {
  rpm: number
  tpm: number
}

interface ProxyConfig {
  enabled: boolean
  host: string
  port: number
  username: string
  password: string
}

interface SSLConfig {
  verify: boolean
  certPath: string
}

interface ConnectionConfig {
  provider: string
  baseUrl: string
  apiKey: string
  model: string
  timeout: number
  retryTimes: number
  rateLimit: RateLimit
  headers: { key: string, value: string }[]
  proxy: ProxyConfig
  ssl: SSLConfig
}

interface Props {
  modelValue: ConnectionConfig
}

interface Emits {
  (e: 'update:modelValue', value: ConnectionConfig): void
}

const props = defineProps<Props>()
const emit = defineEmits<Emits>()

const config = computed({
  get: () => props.modelValue,
  set: (value) => emit('update:modelValue', value),
})

// 默认配置
const defaultConfig: ConnectionConfig = {
  provider: 'openai',
  baseUrl: 'https://api.openai.com/v1',
  apiKey: '${API_KEY}', // eslint-disable-line no-template-curly-in-string
  model: 'gpt-4o-mini',
  timeout: 30000,
  retryTimes: 3,
  rateLimit: {
    rpm: 3500,
    tpm: 200000,
  },
  headers: [],
  proxy: {
    enabled: false,
    host: '',
    port: 0,
    username: '',
    password: '',
  },
  ssl: {
    verify: true,
    certPath: '',
  },
}

// 添加请求头
const addHeader = () => {
  config.value.headers.push({ key: '', value: '' })
}

// 删除请求头
const removeHeader = (index: number) => {
  config.value.headers.splice(index, 1)
}

// 重置为默认值
const resetToDefaults = () => {
  emit('update:modelValue', JSON.parse(JSON.stringify(defaultConfig)))
}

// 初始化默认值
onMounted(() => {
  if (!props.modelValue) {
    emit('update:modelValue', defaultConfig)
  }
})
</script>

<style scoped lang="scss">
.connection-config {
  padding: 16px 0;

  .config-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 20px;
    flex-shrink: 0;

    h4 {
      margin: 0;
      color: var(--color-text-1);
      font-size: 16px;
      font-weight: 600;
    }

    .header-actions {
      display: flex;
      gap: 8px;
    }
  }

  .config-form {
    .form-section {
      margin-bottom: 24px;
      padding-bottom: 20px;
      border-bottom: 1px solid var(--color-border-3);

      &:last-child {
        border-bottom: none;
        margin-bottom: 0;
        padding-bottom: 0;
      }

      .section-title {
        display: flex;
        justify-content: space-between;
        align-items: center;
        font-size: 14px;
        font-weight: 500;
        color: var(--color-text-1);
        margin-bottom: 16px;
      }

      .form-row {
        margin-bottom: 16px;

        &:last-child {
          margin-bottom: 0;
        }

        .form-label {
          display: block;
          font-size: 13px;
          font-weight: 500;
          color: var(--color-text-2);
          margin-bottom: 6px;
        }
      }

      .headers-list {
        .header-row {
          display: flex;
          gap: 8px;
          align-items: center;
          margin-bottom: 8px;

          &:last-child {
            margin-bottom: 0;
          }
        }
      }

      .proxy-config {
        margin-top: 12px;
        padding: 12px;
        background: var(--color-fill-1);
        border-radius: 6px;
      }
    }
  }
}
</style>
