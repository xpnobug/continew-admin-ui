<template>
  <a-drawer v-model:visible="visible" title="导航项详情" :width="width >= 600 ? 600 : '100%'" :footer="false">
    <div class="detail-container">
      <!-- 基本信息 -->
      <a-card title="基本信息" class="detail-card">
        <a-descriptions :column="1" size="large">
          <a-descriptions-item label="导航项名称">
            <span class="item-name">{{ dataDetail?.itemName }}</span>
          </a-descriptions-item>
          <a-descriptions-item label="唯一标识">
            <a-tag color="blue">{{ dataDetail?.itemKey }}</a-tag>
          </a-descriptions-item>
          <a-descriptions-item label="页面路径">
            <span class="page-url">{{ dataDetail?.pageUrl }}</span>
          </a-descriptions-item>
          <a-descriptions-item label="排序">
            <a-tag>{{ dataDetail?.sort }}</a-tag>
          </a-descriptions-item>
        </a-descriptions>
      </a-card>

      <!-- 图标配置 -->
      <a-card title="图标配置" class="detail-card">
        <div class="icon-section">
          <div class="icon-group">
            <div class="icon-item">
              <label>常态图标</label>
              <div class="icon-preview">
                <img 
                  v-if="dataDetail?.iconNormal && isImageUrl(dataDetail.iconNormal)"
                  :src="dataDetail.iconNormal" 
                  class="nav-icon-large"
                  alt="常态图标"
                />
                <span v-else-if="dataDetail?.iconNormal" class="icon-text">{{ dataDetail.iconNormal }}</span>
                <span v-else class="no-icon">未设置</span>
              </div>
            </div>
            <div class="icon-item">
              <label>激活图标</label>
              <div class="icon-preview">
                <img 
                  v-if="dataDetail?.iconActive && isImageUrl(dataDetail.iconActive)"
                  :src="dataDetail.iconActive" 
                  class="nav-icon-large"
                  alt="激活图标"
                />
                <span v-else-if="dataDetail?.iconActive" class="icon-text">{{ dataDetail.iconActive }}</span>
                <span v-else class="no-icon">未设置</span>
              </div>
            </div>
          </div>
        </div>
      </a-card>

      <!-- 徽章配置 -->
      <a-card title="徽章配置" class="detail-card">
        <a-descriptions :column="1" size="large">
          <a-descriptions-item label="徽章类型">
            <a-tag v-if="dataDetail?.badgeType" color="green">{{ dataDetail.badgeType }}</a-tag>
            <span v-else class="no-value">未设置</span>
          </a-descriptions-item>
          <a-descriptions-item label="徽章文本">
            <span v-if="dataDetail?.badgeText">{{ dataDetail.badgeText }}</span>
            <span v-else class="no-value">未设置</span>
          </a-descriptions-item>
        </a-descriptions>
      </a-card>

      <!-- 权限配置 -->
      <a-card title="权限配置" class="detail-card">
        <a-descriptions :column="1" size="large">
          <a-descriptions-item label="是否可见">
            <a-tag :color="dataDetail?.isVisible === '1' ? 'green' : 'red'">
              {{ dataDetail?.isVisible === '1' ? '可见' : '隐藏' }}
            </a-tag>
          </a-descriptions-item>
          <a-descriptions-item label="权限代码">
            <span v-if="dataDetail?.permissionCode" class="permission-code">{{ dataDetail.permissionCode }}</span>
            <span v-else class="no-value">无限制</span>
          </a-descriptions-item>
          <a-descriptions-item label="用户角色">
            <div v-if="dataDetail?.userRoles" class="role-tags">
              <a-tag v-for="role in dataDetail.userRoles.split(',')" :key="role" color="purple">
                {{ role.trim() }}
              </a-tag>
            </div>
            <span v-else class="no-value">无限制</span>
          </a-descriptions-item>
        </a-descriptions>
      </a-card>

      <!-- 自定义样式 -->
      <a-card v-if="dataDetail?.customStyle" title="自定义样式" class="detail-card">
        <div class="custom-style">
          <pre>{{ dataDetail.customStyle }}</pre>
        </div>
      </a-card>

      <!-- 系统信息 -->
      <a-card title="系统信息" class="detail-card">
        <a-descriptions :column="1" size="large">
          <a-descriptions-item label="状态">
            <a-tag :color="dataDetail?.status === '1' ? 'green' : 'red'">
              {{ dataDetail?.status === '1' ? '启用' : '禁用' }}
            </a-tag>
          </a-descriptions-item>
          <a-descriptions-item label="创建人">
            {{ dataDetail?.createUserString || dataDetail?.createUser }}
          </a-descriptions-item>
          <a-descriptions-item label="创建时间">
            {{ dataDetail?.createTime }}
          </a-descriptions-item>
          <a-descriptions-item label="修改人">
            {{ dataDetail?.updateUserString || dataDetail?.updateUser }}
          </a-descriptions-item>
          <a-descriptions-item label="修改时间">
            {{ dataDetail?.updateTime }}
          </a-descriptions-item>
        </a-descriptions>
      </a-card>
    </div>
  </a-drawer>
</template>

<script setup lang="ts">
import { useWindowSize } from '@vueuse/core'
import { type NavItemsDetailResp, getNavItems as getDetail } from '@/apis/daily/navItems'

const { width } = useWindowSize()

const dataId = ref('')
const dataDetail = ref<NavItemsDetailResp>()
const visible = ref(false)

// 判断是否为图片URL
const isImageUrl = (url: string) => {
  if (!url) return false
  const imageExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.svg', '.ico']
  const lowerUrl = url.toLowerCase()
  return imageExtensions.some(ext => lowerUrl.includes(ext)) || url.startsWith('http')
}

// 查询详情
const getDataDetail = async () => {
  const { data } = await getDetail(dataId.value)
  dataDetail.value = data
}

// 打开
const onOpen = async (id: string) => {
  dataId.value = id
  await getDataDetail()
  visible.value = true
}

defineExpose({ onOpen })
</script>

<style scoped lang="scss">
.detail-container {
  .detail-card {
    margin-bottom: 16px;
    
    &:last-child {
      margin-bottom: 0;
    }
  }

  // 基本信息样式
  .item-name {
    font-size: 16px;
    font-weight: 600;
    color: var(--color-text-1);
  }

  .page-url {
    font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
    background: var(--color-bg-2);
    padding: 4px 8px;
    border-radius: 4px;
    font-size: 13px;
  }

  // 图标配置样式
  .icon-section {
    .icon-group {
      display: flex;
      gap: 32px;
      justify-content: space-around;
      
      @media (max-width: 768px) {
        flex-direction: column;
        gap: 16px;
      }
    }

    .icon-item {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 8px;

      label {
        font-weight: 500;
        color: var(--color-text-2);
        font-size: 14px;
      }

      .icon-preview {
        display: flex;
        justify-content: center;
        align-items: center;
        min-height: 60px;
        padding: 12px;
        background: var(--color-bg-1);
        border: 2px dashed var(--color-border-2);
        border-radius: 8px;
        width: 120px;
      }

      .nav-icon-large {
        width: 48px;
        height: 48px;
        object-fit: contain;
        border-radius: 6px;
      }

      .icon-text {
        font-size: 12px;
        color: var(--color-text-3);
        text-align: center;
        word-break: break-all;
        padding: 8px;
        background: var(--color-bg-2);
        border-radius: 4px;
      }

      .no-icon {
        color: var(--color-text-4);
        font-size: 14px;
      }
    }
  }

  // 权限配置样式
  .permission-code {
    font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
    background: var(--color-bg-2);
    padding: 4px 8px;
    border-radius: 4px;
    font-size: 13px;
  }

  .role-tags {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
  }

  .no-value {
    color: var(--color-text-4);
    font-style: italic;
  }

  // 自定义样式
  .custom-style {
    pre {
      background: var(--color-bg-2);
      padding: 16px;
      border-radius: 6px;
      font-size: 13px;
      line-height: 1.5;
      max-height: 300px;
      overflow-y: auto;
      white-space: pre-wrap;
      word-break: break-all;
    }
  }
}

// 抽屉样式优化
:deep(.arco-drawer-body) {
  padding: 16px;
}

:deep(.arco-card) {
  .arco-card-header {
    background: var(--color-bg-1);
    border-bottom: 1px solid var(--color-border-2);
    
    .arco-card-header-title {
      font-weight: 600;
      color: var(--color-text-1);
    }
  }
}

:deep(.arco-descriptions-item-label) {
  color: var(--color-text-2);
  font-weight: 500;
}
</style>
