<template>
  <a-drawer v-model:visible="visible" title="动态详情" :width="width >= 600 ? 600 : '100%'" :footer="false">
    <div class="detail-container">
      <!-- 用户信息 -->
      <a-card title="发布用户" class="detail-card" :bordered="false">
        <div class="user-section">
          <a-avatar
            :src="dataDetail?.user?.avatar"
            :size="48"
            class="user-avatar-large"
          >
            {{ dataDetail?.user?.nickname?.charAt(0) }}
          </a-avatar>
          <div class="user-info-detail">
            <h3 class="user-name">{{ dataDetail?.user?.nickname || dataDetail?.user?.username }}</h3>
            <div class="user-meta">
              <a-tag size="small">{{ dataDetail?.user?.deptName }}</a-tag>
              <span class="user-id">ID: {{ dataDetail?.userId }}</span>
            </div>
          </div>
        </div>
      </a-card>

      <!-- 动态内容 -->
      <a-card title="动态内容" class="detail-card" :bordered="false">
        <a-descriptions :column="1" size="large" class="basic-info">
          <a-descriptions-item label="动态类型">
            <a-tag v-if="dataDetail?.type === 0" color="blue">
              <template #icon><icon-edit /></template>
              纯文字
            </a-tag>
            <a-tag v-else-if="dataDetail?.type === 1" color="green">
              <template #icon><icon-image /></template>
              图片
              <a-badge v-if="dataDetail?.imgs?.length" :count="dataDetail.imgs.length" class="type-badge" />
            </a-tag>
            <a-tag v-else-if="dataDetail?.type === 2" color="red">
              <template #icon><icon-video-camera /></template>
              视频
            </a-tag>
            <a-tag v-else-if="dataDetail?.type === 3" color="orange">
              <template #icon><icon-sound /></template>
              音频
            </a-tag>
            <a-tag v-else color="gray">未知类型</a-tag>
          </a-descriptions-item>
          <a-descriptions-item label="文字内容">
            <div class="content-text">{{ dataDetail?.content || '无内容' }}</div>
          </a-descriptions-item>
        </a-descriptions>

        <!-- 媒体内容展示 -->
        <div v-if="dataDetail?.imgs || dataDetail?.video || dataDetail?.audio" class="media-content">
          <h4>媒体内容</h4>
          <!-- 图片展示 -->
          <div v-if="dataDetail?.imgs?.length" class="images-grid">
            <a-image-preview-group infinite>
              <div v-for="img in dataDetail.imgs" :key="img.id || img.url" class="image-item">
                <div class="image-wrap">
                  <a-image
                    :src="img.url"
                    :width="120"
                    :height="120"
                    fit="cover"
                    show-loader
                  />
                  <div v-if="img.width && img.height" class="image-meta">{{ img.width }}x{{ img.height }}</div>
                </div>
              </div>
            </a-image-preview-group>
          </div>
          <!-- 视频展示 -->
          <div v-if="dataDetail?.video" class="video-content">
            <video
              :src="dataDetail.video.url"
              :poster="dataDetail.video.coverUrl"
              controls
              class="video-player"
            />
            <div class="video-info">
              <span v-if="dataDetail.video.width && dataDetail.video.height">尺寸: {{ dataDetail.video.width }}x{{ dataDetail.video.height }}</span>
              <span v-if="dataDetail.video.duration" style="margin-left: 12px;">时长: {{ dataDetail.video.duration }}s</span>
              <a v-if="dataDetail.video.url" :href="dataDetail.video.url" target="_blank" style="margin-left: 12px;">在新标签打开</a>
            </div>
          </div>
          <!-- 音频展示 -->
          <div v-if="dataDetail?.audio" class="audio-content">
            <audio :src="dataDetail.audio.url" controls class="audio-player" />
            <div class="audio-info">
              <span v-if="dataDetail.audio?.duration">时长: {{ dataDetail.audio.duration }}s</span>
              <a v-if="dataDetail.audio?.url" :href="dataDetail.audio.url" target="_blank" style="margin-left: 12px;">在新标签打开</a>
            </div>
          </div>
        </div>
      </a-card>

      <!-- 位置信息 -->
      <a-card title="位置信息" class="detail-card" :bordered="false">
        <div v-if="dataDetail?.location" class="location-detail">
          <div class="location-content">
            <div class="location-name">
              <icon-location style="color: #165dff;" />
              {{ getLocationInfo(dataDetail.location).name }}
            </div>
            <div class="location-address">{{ getLocationInfo(dataDetail.location).address }}</div>
          </div>
        </div>
        <div v-else class="no-location">
          <icon-location style="color: var(--color-text-3);" />
          <span class="text-gray">未设置位置信息</span>
        </div>
      </a-card>

      <!-- 互动统计 -->
      <a-card title="互动统计" class="detail-card" :bordered="false">
        <a-row :gutter="16" class="stats-row">
          <a-col :span="6">
            <a-statistic title="点赞数" :value="dataDetail?.likesCount || 0">
              <template #prefix>
                <icon-heart style="color: #f53f3f" />
              </template>
            </a-statistic>
          </a-col>
          <a-col :span="6">
            <a-statistic title="评论数" :value="dataDetail?.commentsCount || 0">
              <template #prefix>
                <icon-message style="color: #165dff" />
              </template>
            </a-statistic>
          </a-col>
          <a-col :span="6">
            <a-statistic title="分享数" :value="dataDetail?.sharesCount || 0">
              <template #prefix>
                <icon-share-alt style="color: #00b42a" />
              </template>
            </a-statistic>
          </a-col>
          <a-col :span="6">
            <a-statistic title="浏览量" :value="dataDetail?.browse || 0">
              <template #prefix>
                <icon-eye style="color: #722ed1" />
              </template>
            </a-statistic>
          </a-col>
        </a-row>
      </a-card>

      <!-- 状态信息 -->
      <a-card title="状态信息" class="detail-card" :bordered="false">
        <a-descriptions :column="2" size="large">
          <a-descriptions-item label="所属圈子">{{ dataDetail?.circleId || '未设置' }}</a-descriptions-item>
          <a-descriptions-item label="发布状态">
            <a-tag :color="dataDetail?.status === 1 ? 'green' : 'red'">
              {{ dataDetail?.status === 1 ? '启用' : '禁用' }}
            </a-tag>
          </a-descriptions-item>
          <a-descriptions-item label="公开状态">
            <a-tag :color="dataDetail?.isPublic ? 'blue' : 'orange'">
              <template #icon>
                <icon-eye v-if="dataDetail?.isPublic" />
                <icon-eye-invisible v-else />
              </template>
              {{ dataDetail?.isPublic ? '公开' : '私密' }}
            </a-tag>
          </a-descriptions-item>
          <a-descriptions-item label="置顶状态">
            <a-tag :color="dataDetail?.isTop ? 'red' : 'gray'">
              <template #icon>
                <icon-to-top v-if="dataDetail?.isTop" />
              </template>
              {{ dataDetail?.isTop ? '已置顶' : '未置顶' }}
            </a-tag>
          </a-descriptions-item>
        </a-descriptions>
      </a-card>

      <!-- 系统信息 -->
      <a-card title="系统信息" class="detail-card" :bordered="false">
        <a-descriptions :column="1" size="large">
          <a-descriptions-item label="创建人">{{ dataDetail?.createUserString || dataDetail?.createUser || '未知' }}</a-descriptions-item>
          <a-descriptions-item label="创建时间">{{ dataDetail?.createTime }}</a-descriptions-item>
          <a-descriptions-item label="修改人">{{ dataDetail?.updateUserString || dataDetail?.updateUser || '未修改' }}</a-descriptions-item>
          <a-descriptions-item label="修改时间">{{ dataDetail?.updateTime || '未修改' }}</a-descriptions-item>
        </a-descriptions>
      </a-card>
    </div>
  </a-drawer>
</template>

<script setup lang="ts">
import { useWindowSize } from '@vueuse/core'
import { type DynamicsDetailResp, getDynamics as getDetail } from '@/apis/daily/dynamics'

const { width } = useWindowSize()

const dataId = ref('')
const dataDetail = ref<DynamicsDetailResp>()
const visible = ref(false)

// 解析位置信息
const getLocationInfo = (location: string) => {
  try {
    const locationData = JSON.parse(location)
    return {
      name: locationData.name || '未知位置',
      address: locationData.address || '未知地址',
    }
  } catch {
    return { name: location, address: '解析失败' }
  }
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

  // 用户信息样式
  .user-section {
    display: flex;
    align-items: center;
    gap: 16px;

    .user-avatar-large {
      flex-shrink: 0;
    }

    .user-info-detail {
      .user-name {
        margin: 0 0 8px 0;
        font-size: 18px;
        font-weight: 600;
        color: var(--color-text-1);
      }

      .user-meta {
        display: flex;
        align-items: center;
        gap: 12px;

        .user-id {
          font-size: 12px;
          color: var(--color-text-3);
        }
      }
    }
  }

  // 动态内容样式
  .content-text {
    padding: 12px 16px;
    background-color: var(--color-fill-2);
    border-radius: 8px;
    line-height: 1.8;
    max-height: 200px;
    overflow-y: auto;
    white-space: pre-wrap;
    word-break: break-word;
    font-size: 14px;
  }

  // 媒体内容样式
  .media-content {
    margin-top: 16px;
    padding-top: 16px;
    border-top: 1px solid var(--color-border-2);

    h4 {
      margin: 0 0 12px 0;
      font-size: 14px;
      font-weight: 500;
      color: var(--color-text-2);
    }

    .images-grid {
      display: flex;
      flex-wrap: wrap;
      gap: 8px;

      .image-item {
        border-radius: 6px;
        overflow: hidden;
      }

      .image-wrap {
        position: relative;
        border-radius: 6px;
        overflow: hidden;
      }

      .image-meta {
        position: absolute;
        right: 4px;
        bottom: 4px;
        background: rgba(0, 0, 0, 0.45);
        color: #fff;
        border-radius: 3px;
        padding: 0 4px;
        font-size: 10px;
        line-height: 16px;
      }
    }

    .video-content {
      .video-player {
        width: 100%;
        max-width: 400px;
        border-radius: 8px;
      }

      .video-info {
        margin-top: 8px;
        font-size: 12px;
        color: var(--color-text-3);
      }
    }

    .audio-content {
      .audio-player {
        width: 100%;
        max-width: 400px;
      }
      .audio-info {
        margin-top: 6px;
        font-size: 12px;
        color: var(--color-text-3);
      }
    }
  }

  // 位置信息样式
  .location-detail {
    .location-content {
      .location-name {
        display: flex;
        align-items: center;
        gap: 8px;
        font-size: 16px;
        font-weight: 500;
        color: var(--color-text-1);
        margin-bottom: 8px;
      }

      .location-address {
        font-size: 14px;
        color: var(--color-text-2);
        padding-left: 24px;
        line-height: 1.5;
      }
    }
  }

  .no-location {
    display: flex;
    align-items: center;
    gap: 8px;
    color: var(--color-text-3);
    font-style: italic;
  }

  // 统计信息样式
  .stats-row {
    .arco-col {
      text-align: center;
    }
  }

  .text-gray {
    color: var(--color-text-3);
  }

  .type-badge {
    margin-left: 6px;
    :deep(.arco-badge-number) {
      height: 16px;
      line-height: 16px;
      font-size: 10px;
      min-width: 16px;
    }
  }
}
</style>
