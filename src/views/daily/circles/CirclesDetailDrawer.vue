<template>
  <a-drawer v-model:visible="visible" title="圈子详情" :width="width >= 600 ? 600 : '100%'" :footer="false">
    <a-descriptions :column="2" size="large" class="general-description">
      <a-descriptions-item label="主键">{{ dataDetail?.id }}</a-descriptions-item>
      <a-descriptions-item label="圈子名称">{{ dataDetail?.name }}</a-descriptions-item>
      <a-descriptions-item label="圈子描述">{{ dataDetail?.description }}</a-descriptions-item>
      <a-descriptions-item label="圈子头像">{{ dataDetail?.avatar }}</a-descriptions-item>
      <a-descriptions-item label="圈子横幅">{{ dataDetail?.banner }}</a-descriptions-item>
      <a-descriptions-item label="创建者ID">{{ dataDetail?.creatorId }}</a-descriptions-item>
      <a-descriptions-item label="是否热门：0否，1是">{{ dataDetail?.isHot }}</a-descriptions-item>
      <a-descriptions-item label="是否新建：0否，1是">{{ dataDetail?.isNew }}</a-descriptions-item>
      <a-descriptions-item label="成员数量">{{ dataDetail?.membersCount }}</a-descriptions-item>
      <a-descriptions-item label="动态数量">{{ dataDetail?.dynamicsCount }}</a-descriptions-item>
      <a-descriptions-item label="状态（1：启用；2：禁用）">{{ dataDetail?.status }}</a-descriptions-item>
      <a-descriptions-item label="创建人">{{ dataDetail?.createUser }}</a-descriptions-item>
      <a-descriptions-item label="创建人">{{ dataDetail?.createUserString }}</a-descriptions-item>
      <a-descriptions-item label="创建时间">{{ dataDetail?.createTime }}</a-descriptions-item>
      <a-descriptions-item label="修改人">{{ dataDetail?.updateUser }}</a-descriptions-item>
      <a-descriptions-item label="修改人">{{ dataDetail?.updateUserString }}</a-descriptions-item>
      <a-descriptions-item label="修改时间">{{ dataDetail?.updateTime }}</a-descriptions-item>
    </a-descriptions>
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

<style scoped lang="scss"></style>
