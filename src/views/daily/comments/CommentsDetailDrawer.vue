<template>
  <a-drawer v-model:visible="visible" title="评论详情" :width="width >= 600 ? 600 : '100%'" :footer="false">
    <div class="comment-detail">
      <!-- 用户信息卡片 -->
      <a-card class="detail-card" title="评论用户" :bordered="false">
        <div class="user-profile">
          <a-avatar
            :src="dataDetail?.user?.avatar"
            :size="48"
            class="user-avatar-large"
          >
            {{ dataDetail?.user?.nickname?.charAt(0) }}
          </a-avatar>
          <div class="user-info-detail">
            <div class="user-name-large">{{ dataDetail?.user?.nickname || dataDetail?.user?.username }}</div>
            <div class="user-meta">
              <span class="user-dept">{{ dataDetail?.user?.deptName }}</span>
              <a-divider type="vertical" />
              <span class="user-id">ID: {{ dataDetail?.userId }}</span>
            </div>
          </div>
        </div>
      </a-card>

      <!-- 评论内容卡片 -->
      <a-card class="detail-card" title="评论内容" :bordered="false">
        <div class="comment-content-detail">
          <p class="content-text">{{ dataDetail?.content }}</p>

          <!-- 回复信息 -->
          <div v-if="dataDetail?.replyCommentId !== 0 && dataDetail?.replyUser" class="reply-section">
            <a-divider>回复信息</a-divider>
            <div class="reply-info-detail">
              <icon-reply style="color: #165dff; margin-right: 8px; font-size: 16px;" />
              <span>回复 </span>
              <a-avatar
                :src="dataDetail?.replyUser?.avatar"
                :size="24"
                style="margin: 0 4px"
              >
                {{ dataDetail?.replyUser?.nickname?.charAt(0) }}
              </a-avatar>
              <span class="reply-user-name">{{ dataDetail?.replyUser?.nickname || dataDetail?.replyUser?.username }}</span>
              <span class="reply-meta">（评论ID: {{ dataDetail?.replyCommentId }}）</span>
            </div>
          </div>

          <!-- 评论类型 -->
          <div class="comment-type-section">
            <a-tag v-if="dataDetail?.replyCommentId === 0" color="blue" size="large">
              <template #icon><icon-message /></template>
              主评论
            </a-tag>
            <a-tag v-else color="orange" size="large">
              <template #icon><icon-reply /></template>
              回复评论
            </a-tag>
          </div>
        </div>
      </a-card>

      <!-- 图片展示 -->
      <a-card v-if="dataDetail?.img" class="detail-card" title="相关图片" :bordered="false">
        <a-image
          :src="dataDetail.img"
          :width="200"
          fit="cover"
          show-loader
          :preview="{ src: dataDetail.img }"
          class="comment-detail-image"
        />
      </a-card>

      <!-- 统计数据卡片 -->
      <a-card class="detail-card" title="互动数据" :bordered="false">
        <div class="stats-grid">
          <div class="stat-item">
            <a-statistic
              :value="dataDetail?.likesCount || 0"
              title="点赞数"
              :value-style="{ fontSize: '20px', fontWeight: 'bold', color: '#f53f3f' }"
            >
              <template #suffix>
                <icon-heart style="color: #f53f3f" />
              </template>
            </a-statistic>
          </div>
          <div class="stat-item">
            <a-statistic
              :value="dataDetail?.listCount || 0"
              title="回复数"
              :value-style="{ fontSize: '20px', fontWeight: 'bold', color: '#165dff' }"
            >
              <template #suffix>
                <icon-message style="color: #165dff" />
              </template>
            </a-statistic>
          </div>
        </div>
      </a-card>

      <!-- 状态信息卡片 -->
      <a-card class="detail-card" title="状态信息" :bordered="false">
        <a-descriptions :column="1" size="medium">
          <a-descriptions-item label="评论状态">
            <a-tag :color="dataDetail?.status === 1 ? 'green' : 'red'" size="large">
              {{ dataDetail?.status === 1 ? '正常' : '禁用' }}
            </a-tag>
          </a-descriptions-item>
          <a-descriptions-item label="所属动态">
            <a-tag color="blue">动态ID: {{ dataDetail?.dynamicId }}</a-tag>
          </a-descriptions-item>
        </a-descriptions>
      </a-card>

      <!-- 回复评论列表 -->
      <a-card v-if="dataDetail?.list && dataDetail.list.length > 0" class="detail-card" title="回复评论" :bordered="false">
        <div class="reply-comments">
          <div
            v-for="reply in dataDetail.list"
            :key="reply.id"
            class="reply-comment-item"
          >
            <div class="reply-header">
              <a-avatar
                :src="reply.user?.avatar"
                :size="32"
                class="reply-avatar"
              >
                {{ reply.user?.nickname?.charAt(0) }}
              </a-avatar>
              <div class="reply-user-info">
                <div class="reply-user-name">{{ reply.user?.nickname || reply.user?.username }}</div>
                <div class="reply-time">{{ reply.createTime }}</div>
              </div>
              <a-tag
                :color="reply.status === 1 ? 'green' : 'red'"
                size="small"
                class="reply-status"
              >
                {{ reply.status === 1 ? '正常' : '禁用' }}
              </a-tag>
            </div>

            <div class="reply-content">
              <p>{{ reply.content }}</p>
              <div v-if="reply.replyUser" class="reply-target">
                <icon-reply style="color: #165dff; margin-right: 4px;" />
                回复 @{{ reply.replyUser.nickname || reply.replyUser.username }}
              </div>
            </div>

            <div v-if="reply.img" class="reply-image">
              <a-image
                :src="reply.img"
                :width="100"
                :height="100"
                fit="cover"
                show-loader
                :preview="{ src: reply.img }"
                class="reply-img"
              />
            </div>

            <div class="reply-stats">
              <a-space>
                <span class="stat-item">
                  <icon-heart style="color: #f53f3f; margin-right: 4px;" />
                  {{ reply.likesCount || 0 }}
                </span>
              </a-space>
            </div>

            <!-- 嵌套回复 -->
            <div v-if="reply.list && reply.list.length > 0" class="nested-replies">
              <div
                v-for="nestedReply in reply.list"
                :key="nestedReply.id"
                class="nested-reply-item"
              >
                <div class="nested-reply-header">
                  <a-avatar
                    :src="nestedReply.user?.avatar"
                    :size="24"
                  >
                    {{ nestedReply.user?.nickname?.charAt(0) }}
                  </a-avatar>
                  <span class="nested-reply-user">{{ nestedReply.user?.nickname || nestedReply.user?.username }}</span>
                  <span class="nested-reply-time">{{ nestedReply.createTime }}</span>
                </div>
                <div class="nested-reply-content">
                  <p>{{ nestedReply.content }}</p>
                  <div v-if="nestedReply.replyUser" class="nested-reply-target">
                    <icon-reply style="color: #165dff; margin-right: 4px;" />
                    回复 @{{ nestedReply.replyUser.nickname || nestedReply.replyUser.username }}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </a-card>

      <!-- 系统信息卡片 -->
      <a-card class="detail-card" title="系统信息" :bordered="false">
        <a-descriptions :column="1" size="small">
          <a-descriptions-item label="创建时间">
            <icon-clock-circle style="margin-right: 4px;" />
            {{ dataDetail?.createTime }}
          </a-descriptions-item>
          <a-descriptions-item v-if="dataDetail?.updateTime" label="修改时间">
            <icon-edit style="margin-right: 4px;" />
            {{ dataDetail?.updateTime }}
          </a-descriptions-item>
          <a-descriptions-item v-if="dataDetail?.createUserString" label="创建人">
            {{ dataDetail?.createUserString }}
          </a-descriptions-item>
          <a-descriptions-item v-if="dataDetail?.updateUserString" label="修改人">
            {{ dataDetail?.updateUserString }}
          </a-descriptions-item>
          <a-descriptions-item label="评论ID">
            <a-tag color="gray">{{ dataDetail?.id }}</a-tag>
          </a-descriptions-item>
        </a-descriptions>
      </a-card>
    </div>
  </a-drawer>
</template>

<script setup lang="ts">
import { useWindowSize } from '@vueuse/core'
import { type CommentsDetailResp, getComments as getDetail } from '@/apis/daily/comments'

const { width } = useWindowSize()

const dataId = ref('')
const dataDetail = ref<CommentsDetailResp>()
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
.comment-detail {
  .detail-card {
    margin-bottom: 16px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
    border-radius: 8px;

    &:last-child {
      margin-bottom: 0;
    }
  }

  .user-profile {
    display: flex;
    align-items: center;
    gap: 16px;

    .user-avatar-large {
      flex-shrink: 0;
    }

    .user-info-detail {
      .user-name-large {
        font-size: 18px;
        font-weight: 600;
        line-height: 1.4;
        margin-bottom: 8px;
      }

      .user-meta {
        display: flex;
        align-items: center;
        font-size: 13px;
        color: var(--color-text-3);

        .user-dept {
          color: var(--color-text-2);
        }

        .user-id {
          color: var(--color-text-3);
        }
      }
    }
  }

  .comment-content-detail {
    .content-text {
      font-size: 15px;
      line-height: 1.6;
      margin-bottom: 16px;
      color: var(--color-text-1);
      white-space: pre-wrap;
      word-break: break-word;
    }

    .reply-section {
      margin-top: 20px;

      .reply-info-detail {
        display: flex;
        align-items: center;
        padding: 12px;
        background-color: var(--color-fill-1);
        border-radius: 6px;
        font-size: 14px;

        .reply-user-name {
          font-weight: 500;
          color: var(--color-text-1);
        }

        .reply-meta {
          color: var(--color-text-3);
          margin-left: 8px;
        }
      }
    }

    .comment-type-section {
      margin-top: 16px;
    }
  }

  .comment-detail-image {
    border-radius: 8px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  }

  .stats-grid {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 24px;

    .stat-item {
      text-align: center;
      padding: 16px;
      background-color: var(--color-fill-1);
      border-radius: 8px;
    }
  }
}
</style>
