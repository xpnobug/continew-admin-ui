<template>
  <a-drawer v-model:visible="visible" title="提示词资源详情" :width="width >= 600 ? 600 : '100%'" :footer="false">
    <a-descriptions :column="2" size="large" class="general-description">
      <a-descriptions-item label="主键ID">{{ dataDetail?.id }}</a-descriptions-item>
      <a-descriptions-item label="空间ID">{{ dataDetail?.spaceId }}</a-descriptions-item>
      <a-descriptions-item label="名称">{{ dataDetail?.name }}</a-descriptions-item>
      <a-descriptions-item label="描述">{{ dataDetail?.description }}</a-descriptions-item>
      <a-descriptions-item label="提示词文本">{{ dataDetail?.promptText }}</a-descriptions-item>
      <a-descriptions-item label="状态，0无效，1有效">{{ dataDetail?.status }}</a-descriptions-item>
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
import { type PromptResourceDetailResp, getPromptResource as getDetail } from '@/apis/ai/promptResource'

const { width } = useWindowSize()

const dataId = ref('')
const dataDetail = ref<PromptResourceDetailResp>()
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
