<template>
  <a-drawer v-model:visible="visible" title="圈子详情" :width="width >= 700 ? 700 : '100%'" :footer="false">
    <div class="detail-container">
      <!-- 圈子概览 -->
      <a-card :bordered="false" class="detail-section circle-overview">
        <div class="circle-header">
          <div class="circle-avatar-large">
            <img v-if="dataDetail?.avatar" :src="dataDetail.avatar" :alt="dataDetail.name" />
            <icon-user v-else />
          </div>
          <div class="circle-info">
            <h2 class="circle-name">{{ dataDetail?.name || '-' }}</h2>
            <div class="circle-tags">
              <a-tag :color="dataDetail?.status === 1 ? 'green' : 'red'" size="large">
                {{ dataDetail?.status === 1 ? '正常运营' : '已禁用' }}
              </a-tag>
              <a-tag v-if="dataDetail?.isHot === 1" color="red" size="large">
                <icon-fire /> 热门圈子
              </a-tag>
              <a-tag v-if="dataDetail?.isNew === 1" color="green" size="large">
                <icon-plus /> 新建圈子
              </a-tag>
            </div>
            <div class="circle-stats">
              <div class="stat-card">
                <div class="stat-number">{{ dataDetail?.membersCount || 0 }}</div>
                <div class="stat-label">成员</div>
              </div>
              <div class="stat-card">
                <div class="stat-number">{{ dataDetail?.dynamicsCount || 0 }}</div>
                <div class="stat-label">动态</div>
              </div>
            </div>
          </div>
        </div>
        <div v-if="dataDetail?.description" class="circle-description">
          <h4>圈子介绍</h4>
          <p>{{ dataDetail.description }}</p>
        </div>
      </a-card>

      <!-- 媒体资源 -->
      <a-card v-if="dataDetail?.avatar || dataDetail?.banner" title="媒体资源" :bordered="false" class="detail-section">
        <a-row :gutter="16">
          <a-col v-if="dataDetail?.avatar" :span="12">
            <div class="media-item">
              <div class="media-label">圈子头像</div>
              <div class="media-preview">
                <img :src="dataDetail.avatar" alt="圈子头像" />
              </div>
              <div class="media-url">{{ dataDetail.avatar }}</div>
            </div>
          </a-col>
          <a-col v-if="dataDetail?.banner" :span="12">
            <div class="media-item">
              <div class="media-label">圈子横幅</div>
              <div class="media-preview banner">
                <img :src="dataDetail.banner" alt="圈子横幅" />
              </div>
              <div class="media-url">{{ dataDetail.banner }}</div>
            </div>
          </a-col>
        </a-row>
      </a-card>

      <!-- 系统信息 -->
      <a-card title="系统信息" :bordered="false" class="detail-section">
        <a-descriptions :column="2" size="medium">
          <a-descriptions-item label="创建者ID">
            {{ dataDetail?.creatorId || '-' }}
          </a-descriptions-item>
          <a-descriptions-item label="创建人">
            {{ dataDetail?.createUserString || dataDetail?.createUser || '-' }}
          </a-descriptions-item>
          <a-descriptions-item label="创建时间">
            {{ dataDetail?.createTime || '-' }}
          </a-descriptions-item>
          <a-descriptions-item label="修改人">
            {{ dataDetail?.updateUserString || dataDetail?.updateUser || '-' }}
          </a-descriptions-item>
          <a-descriptions-item label="修改时间" :span="2">
            {{ dataDetail?.updateTime || '-' }}
          </a-descriptions-item>
        </a-descriptions>
      </a-card>
    </div>
  </a-drawer>
</template>

<script setup lang="ts">
import { useWindowSize } from '@vueuse/core'
import { type CirclesDetailResp, getCircles as getDetail } from '@/apis/daily/circles'

const { width } = useWindowSize()

const dataId = ref('')
const dataDetail = ref<CirclesDetailResp>()
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
}

.circle-overview {
  .circle-header {
    display: flex;
    gap: 20px;
    margin-bottom: 20px;

    .circle-avatar-large {
      width: 80px;
      height: 80px;
      border-radius: 50%;
      overflow: hidden;
      background: var(--color-fill-2);
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;

      img {
        width: 100%;
        height: 100%;
        object-fit: cover;
      }

      .arco-icon {
        font-size: 32px;
        color: var(--color-text-3);
      }
    }

    .circle-info {
      flex: 1;

      .circle-name {
        font-size: 24px;
        font-weight: 600;
        margin: 0 0 12px 0;
        color: var(--color-text-1);
      }

      .circle-tags {
        display: flex;
        gap: 8px;
        margin-bottom: 16px;
        flex-wrap: wrap;
      }

      .circle-stats {
        display: flex;
        gap: 20px;

        .stat-card {
          text-align: center;
          padding: 12px 16px;
          background: var(--color-fill-1);
          border-radius: 8px;
          border: 1px solid var(--color-border-2);

          .stat-number {
            font-size: 24px;
            font-weight: 600;
            color: var(--color-primary);
            line-height: 1;
          }

          .stat-label {
            font-size: 14px;
            color: var(--color-text-2);
            margin-top: 4px;
          }
        }
      }
    }
  }

  .circle-description {
    border-top: 1px solid var(--color-border-2);
    padding-top: 20px;

    h4 {
      margin: 0 0 12px 0;
      font-size: 16px;
      font-weight: 600;
      color: var(--color-text-1);
    }

    p {
      margin: 0;
      line-height: 1.6;
      color: var(--color-text-2);
    }
  }
}

.media-item {
  .media-label {
    font-weight: 500;
    color: var(--color-text-1);
    margin-bottom: 12px;
    font-size: 14px;
  }

  .media-preview {
    width: 100%;
    height: 120px;
    border: 1px solid var(--color-border-2);
    border-radius: 6px;
    overflow: hidden;
    margin-bottom: 8px;
    display: flex;
    align-items: center;
    justify-content: center;

    img {
      max-width: 100%;
      max-height: 100%;
      object-fit: cover;
    }

    &.banner {
      height: 80px;

      img {
        object-fit: cover;
        width: 100%;
        height: 100%;
      }
    }
  }

  .media-url {
    font-size: 12px;
    color: var(--color-text-3);
    word-break: break-all;
    line-height: 1.4;
  }
}

// 响应式适配
@media (max-width: 768px) {
  .circle-overview {
    .circle-header {
      flex-direction: column;
      text-align: center;

      .circle-info {
        .circle-stats {
          justify-content: center;
        }
      }
    }
  }

  :deep(.arco-descriptions) {
    .arco-descriptions-item {
      span: 2 !important;
    }
  }
}
</style>
