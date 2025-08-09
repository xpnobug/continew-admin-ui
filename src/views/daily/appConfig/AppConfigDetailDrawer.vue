<template>
  <a-drawer v-model:visible="visible" title="应用配置详情" :width="width >= 600 ? 600 : '100%'" :footer="false">
    <a-descriptions :column="2" size="large" class="general-description">
      <a-descriptions-item label="">{{ dataDetail?.id }}</a-descriptions-item>
      <a-descriptions-item label="应用名称">{{ dataDetail?.appName }}</a-descriptions-item>
      <a-descriptions-item label="应用宣传语">{{ dataDetail?.appSlogan }}</a-descriptions-item>
      <a-descriptions-item label="应用公告">{{ dataDetail?.appNotice }}</a-descriptions-item>
      <a-descriptions-item label="应用描述">{{ dataDetail?.appDesc }}</a-descriptions-item>
      <a-descriptions-item label="版权类型">{{ dataDetail?.copyType }}</a-descriptions-item>
      <a-descriptions-item label="版权图片">{{ dataDetail?.copyImg }}</a-descriptions-item>
      <a-descriptions-item label="版权文本">{{ dataDetail?.copyText }}</a-descriptions-item>
      <a-descriptions-item label="版权网站">{{ dataDetail?.copyWebsite }}</a-descriptions-item>
      <a-descriptions-item label="版权链接">{{ dataDetail?.copyLink }}</a-descriptions-item>
      <a-descriptions-item label="上传类型">{{ dataDetail?.uploadType }}</a-descriptions-item>
      <a-descriptions-item label="是否开启活动功能">{{ dataDetail?.isActivity }}</a-descriptions-item>
      <a-descriptions-item label="是否开启瀑布流">{{ dataDetail?.isWaterfall }}</a-descriptions-item>
      <a-descriptions-item label="是否开启分类">{{ dataDetail?.isClassify }}</a-descriptions-item>
      <a-descriptions-item label="是否开启商城">{{ dataDetail?.isNoteShop }}</a-descriptions-item>
      <a-descriptions-item label="是否开启视频">{{ dataDetail?.isNoteVideo }}</a-descriptions-item>
      <a-descriptions-item label="是否开启卡片">{{ dataDetail?.isCard }}</a-descriptions-item>
      <a-descriptions-item label="是否开启直播">{{ dataDetail?.isLive }}</a-descriptions-item>
      <a-descriptions-item label="是否开启备忘录模式">{{ dataDetail?.isMemo }}</a-descriptions-item>
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

<style scoped lang="scss"></style>
