<template>
  <a-drawer v-model:visible="visible" title="评论详情" :width="width >= 600 ? 600 : '100%'" :footer="false">
    <a-descriptions :column="2" size="large" class="general-description">
      <a-descriptions-item label="主键">{{ dataDetail?.id }}</a-descriptions-item>
      <a-descriptions-item label="评论用户ID">{{ dataDetail?.userId }}</a-descriptions-item>
      <a-descriptions-item label="动态ID">{{ dataDetail?.dynamicId }}</a-descriptions-item>
      <a-descriptions-item label="父评论ID">{{ dataDetail?.parentId }}</a-descriptions-item>
      <a-descriptions-item label="评论内容">{{ dataDetail?.content }}</a-descriptions-item>
      <a-descriptions-item label="点赞数">{{ dataDetail?.likesCount }}</a-descriptions-item>
      <a-descriptions-item label="状态">{{ dataDetail?.status }}</a-descriptions-item>
      <a-descriptions-item label="创建人">{{ dataDetail?.createUser }}</a-descriptions-item>
      <a-descriptions-item label="创建人">{{ dataDetail?.createUserString }}</a-descriptions-item>
      <a-descriptions-item label="创建时间">{{ dataDetail?.createTime }}</a-descriptions-item>
      <a-descriptions-item label="修改人">{{ dataDetail?.updateUser }}</a-descriptions-item>
      <a-descriptions-item label="修改人">{{ dataDetail?.updateUserString }}</a-descriptions-item>
      <a-descriptions-item label="修改时间">{{ dataDetail?.updateTime }}</a-descriptions-item>
      <a-descriptions-item label="评论">{{ dataDetail?.comment }}</a-descriptions-item>
      <a-descriptions-item label="头像">{{ dataDetail?.img }}</a-descriptions-item>
      <a-descriptions-item label="">{{ dataDetail?.replyCommentId }}</a-descriptions-item>
      <a-descriptions-item label="">{{ dataDetail?.replyUserId }}</a-descriptions-item>
    </a-descriptions>
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

<style scoped lang="scss"></style>
