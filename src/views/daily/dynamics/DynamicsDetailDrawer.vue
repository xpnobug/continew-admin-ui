<template>
  <a-drawer v-model:visible="visible" title="动态详情" :width="width >= 600 ? 600 : '100%'" :footer="false">
    <a-descriptions :column="2" size="large" class="general-description">
      <a-descriptions-item label="主键">{{ dataDetail?.id }}</a-descriptions-item>
      <a-descriptions-item label="用户ID">{{ dataDetail?.userId }}</a-descriptions-item>
      <a-descriptions-item label="文字内容">{{ dataDetail?.content }}</a-descriptions-item>
      <a-descriptions-item label="位置信息">{{ dataDetail?.location }}</a-descriptions-item>
      <a-descriptions-item label="所属圈子ID">{{ dataDetail?.circleId }}</a-descriptions-item>
      <a-descriptions-item label="是否公开：0否，1是">{{ dataDetail?.isPublic }}</a-descriptions-item>
      <a-descriptions-item label="点赞数">{{ dataDetail?.likesCount }}</a-descriptions-item>
      <a-descriptions-item label="评论数">{{ dataDetail?.commentsCount }}</a-descriptions-item>
      <a-descriptions-item label="分享数">{{ dataDetail?.sharesCount }}</a-descriptions-item>
      <a-descriptions-item label="状态（1：启用；2：禁用）">{{ dataDetail?.status }}</a-descriptions-item>
      <a-descriptions-item label="创建人">{{ dataDetail?.createUser }}</a-descriptions-item>
      <a-descriptions-item label="创建人">{{ dataDetail?.createUserString }}</a-descriptions-item>
      <a-descriptions-item label="创建时间">{{ dataDetail?.createTime }}</a-descriptions-item>
      <a-descriptions-item label="修改人">{{ dataDetail?.updateUser }}</a-descriptions-item>
      <a-descriptions-item label="修改人">{{ dataDetail?.updateUserString }}</a-descriptions-item>
      <a-descriptions-item label="修改时间">{{ dataDetail?.updateTime }}</a-descriptions-item>
      <a-descriptions-item label="0-纯文字, 1-图片, 2-视频, 3-音频">{{ dataDetail?.type }}</a-descriptions-item>
      <a-descriptions-item label="是否置顶：0否，1是">{{ dataDetail?.isTop }}</a-descriptions-item>
      <a-descriptions-item label="发布地点">{{ dataDetail?.province }}</a-descriptions-item>
      <a-descriptions-item label="浏览量">{{ dataDetail?.browse }}</a-descriptions-item>
    </a-descriptions>
  </a-drawer>
</template>

<script setup lang="ts">
import { useWindowSize } from '@vueuse/core'
import { type DynamicsDetailResp, getDynamics as getDetail } from '@/apis/daily/dynamics'

const { width } = useWindowSize()

const dataId = ref('')
const dataDetail = ref<DynamicsDetailResp>()
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
