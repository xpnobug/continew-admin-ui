<template>
  <a-drawer v-model:visible="visible" title="应用配置详情" :width="width >= 700 ? 700 : '100%'" :footer="false">
    <div class="detail-container">
      <!-- 基本信息 -->
      <a-card title="基本信息" :bordered="false" class="detail-section">
        <a-descriptions :column="2" size="medium">
          <a-descriptions-item label="应用名称" :span="1">
            <strong>{{ dataDetail?.appName || '-' }}</strong>
          </a-descriptions-item>
          <a-descriptions-item label="状态" :span="1">
            <a-tag :color="dataDetail?.status === 1 ? 'green' : 'red'">
              {{ dataDetail?.status === 1 ? '启用' : '禁用' }}
            </a-tag>
          </a-descriptions-item>
          <a-descriptions-item label="应用宣传语" :span="2">
            {{ dataDetail?.appSlogan || '-' }}
          </a-descriptions-item>
          <a-descriptions-item label="应用公告" :span="2">
            <div class="text-content">{{ dataDetail?.appNotice || '-' }}</div>
          </a-descriptions-item>
          <a-descriptions-item label="应用描述" :span="2">
            <div class="text-content">{{ dataDetail?.appDesc || '-' }}</div>
          </a-descriptions-item>
          <a-descriptions-item label="上传类型" :span="2">
            {{ dataDetail?.uploadType || '-' }}
          </a-descriptions-item>
        </a-descriptions>
      </a-card>

      <!-- 版权信息 -->
      <a-card title="版权信息" :bordered="false" class="detail-section">
        <a-descriptions :column="2" size="medium">
          <a-descriptions-item label="版权类型">
            {{ dataDetail?.copyType || '-' }}
          </a-descriptions-item>
          <a-descriptions-item label="版权图片">
            {{ dataDetail?.copyImg || '-' }}
          </a-descriptions-item>
          <a-descriptions-item label="版权文本" :span="2">
            {{ dataDetail?.copyText || '-' }}
          </a-descriptions-item>
          <a-descriptions-item label="版权网站">
            {{ dataDetail?.copyWebsite || '-' }}
          </a-descriptions-item>
          <a-descriptions-item label="版权链接">
            <a v-if="dataDetail?.copyLink" :href="dataDetail.copyLink" target="_blank">
              {{ dataDetail.copyLink }}
            </a>
            <span v-else>-</span>
          </a-descriptions-item>
        </a-descriptions>
      </a-card>

      <!-- 功能开关 -->
      <a-card title="功能开关" :bordered="false" class="detail-section">
        <div class="features-grid">
          <div class="feature-item">
            <span class="feature-label">活动功能：</span>
            <a-tag :color="dataDetail?.isActivity === 1 ? 'blue' : 'gray'" size="small">
              {{ dataDetail?.isActivity === 1 ? '已开启' : '已关闭' }}
            </a-tag>
          </div>
          <div class="feature-item">
            <span class="feature-label">瀑布流：</span>
            <a-tag :color="dataDetail?.isWaterfall === 1 ? 'green' : 'gray'" size="small">
              {{ dataDetail?.isWaterfall === 1 ? '已开启' : '已关闭' }}
            </a-tag>
          </div>
          <div class="feature-item">
            <span class="feature-label">分类功能：</span>
            <a-tag :color="dataDetail?.isClassify === 1 ? 'purple' : 'gray'" size="small">
              {{ dataDetail?.isClassify === 1 ? '已开启' : '已关闭' }}
            </a-tag>
          </div>
          <div class="feature-item">
            <span class="feature-label">商城功能：</span>
            <a-tag :color="dataDetail?.isNoteShop === 1 ? 'orange' : 'gray'" size="small">
              {{ dataDetail?.isNoteShop === 1 ? '已开启' : '已关闭' }}
            </a-tag>
          </div>
          <div class="feature-item">
            <span class="feature-label">视频功能：</span>
            <a-tag :color="dataDetail?.isNoteVideo === 1 ? 'red' : 'gray'" size="small">
              {{ dataDetail?.isNoteVideo === 1 ? '已开启' : '已关闭' }}
            </a-tag>
          </div>
          <div class="feature-item">
            <span class="feature-label">卡片功能：</span>
            <a-tag :color="dataDetail?.isCard === 1 ? 'cyan' : 'gray'" size="small">
              {{ dataDetail?.isCard === 1 ? '已开启' : '已关闭' }}
            </a-tag>
          </div>
          <div class="feature-item">
            <span class="feature-label">直播功能：</span>
            <a-tag :color="dataDetail?.isLive === 1 ? 'magenta' : 'gray'" size="small">
              {{ dataDetail?.isLive === 1 ? '已开启' : '已关闭' }}
            </a-tag>
          </div>
          <div class="feature-item">
            <span class="feature-label">备忘录模式：</span>
            <a-tag :color="dataDetail?.isMemo === 1 ? 'lime' : 'gray'" size="small">
              {{ dataDetail?.isMemo === 1 ? '已开启' : '已关闭' }}
            </a-tag>
          </div>
        </div>
      </a-card>

      <!-- 系统信息 -->
      <a-card title="系统信息" :bordered="false" class="detail-section">
        <a-descriptions :column="2" size="medium">
          <a-descriptions-item label="创建人">
            {{ dataDetail?.createUserString || dataDetail?.createUser || '-' }}
          </a-descriptions-item>
          <a-descriptions-item label="创建时间">
            {{ dataDetail?.createTime || '-' }}
          </a-descriptions-item>
          <a-descriptions-item label="修改人">
            {{ dataDetail?.updateUserString || dataDetail?.updateUser || '-' }}
          </a-descriptions-item>
          <a-descriptions-item label="修改时间">
            {{ dataDetail?.updateTime || '-' }}
          </a-descriptions-item>
        </a-descriptions>
      </a-card>
    </div>
  </a-drawer>
</template>

<script setup lang="ts">
import { useWindowSize } from '@vueuse/core'
import { type AppConfigDetailResp, getAppConfig as getDetail } from '@/apis/daily/appConfig'

const { width } = useWindowSize()

const dataId = ref('')
const dataDetail = ref<AppConfigDetailResp>()
const visible = ref(false)

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
  .detail-section {
    margin-bottom: 20px;
    
    :deep(.arco-card-header) {
      background: var(--color-fill-1);
      border-bottom: 1px solid var(--color-border-2);
      
      .arco-card-header-title {
        font-weight: 600;
        font-size: 16px;
      }
    }
    
    :deep(.arco-card-body) {
      padding: 20px;
    }
  }
  
  .text-content {
    max-width: 400px;
    word-break: break-all;
    line-height: 1.5;
  }
  
  .features-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
    gap: 16px;
    
    .feature-item {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 12px 16px;
      background: var(--color-fill-1);
      border-radius: 6px;
      border-left: 3px solid var(--color-primary);
      
      .feature-label {
        font-weight: 500;
        color: var(--color-text-2);
      }
    }
  }
}

// 响应式适配
@media (max-width: 768px) {
  .detail-container {
    .features-grid {
      grid-template-columns: 1fr;
    }
    
    :deep(.arco-descriptions) {
      .arco-descriptions-item {
        span: 2 !important;
      }
    }
  }
}
</style>
