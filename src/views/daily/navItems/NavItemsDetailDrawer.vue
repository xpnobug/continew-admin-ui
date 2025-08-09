<template>
  <a-drawer v-model:visible="visible" title="导航项详情" :width="width >= 600 ? 600 : '100%'" :footer="false">
    <a-descriptions :column="2" size="large" class="general-description">
      <a-descriptions-item label="导航项ID">{{ dataDetail?.id }}</a-descriptions-item>
      <a-descriptions-item label="导航项名称">{{ dataDetail?.itemName }}</a-descriptions-item>
      <a-descriptions-item label="导航项唯一标识">{{ dataDetail?.itemKey }}</a-descriptions-item>
      <a-descriptions-item label="常态图标">{{ dataDetail?.iconNormal }}</a-descriptions-item>
      <a-descriptions-item label="激活图标">{{ dataDetail?.iconActive }}</a-descriptions-item>
      <a-descriptions-item label="页面路径">{{ dataDetail?.pageUrl }}</a-descriptions-item>
      <a-descriptions-item label="徽标类型(dot/number/text)">{{ dataDetail?.badgeType }}</a-descriptions-item>
      <a-descriptions-item label="徽标文本">{{ dataDetail?.badgeText }}</a-descriptions-item>
      <a-descriptions-item label="是否可见">{{ dataDetail?.isVisible }}</a-descriptions-item>
      <a-descriptions-item label="权限代码(需要的权限)">{{ dataDetail?.permissionCode }}</a-descriptions-item>
      <a-descriptions-item label="允许查看的用户角色(逗号分隔)">{{ dataDetail?.userRoles }}</a-descriptions-item>
      <a-descriptions-item label="自定义样式(JSON)">{{ dataDetail?.customStyle }}</a-descriptions-item>
      <a-descriptions-item label="排序">{{ dataDetail?.sort }}</a-descriptions-item>
      <a-descriptions-item label="状态">{{ dataDetail?.status }}</a-descriptions-item>
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
import { type NavItemsDetailResp, getNavItems as getDetail } from '@/apis/daily/navItems'

const { width } = useWindowSize()

const dataId = ref('')
const dataDetail = ref<NavItemsDetailResp>()
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
