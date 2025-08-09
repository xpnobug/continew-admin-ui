<template>
  <a-drawer v-model:visible="visible" title="用户详情" :width="width >= 600 ? 600 : '100%'" :footer="false">
    <a-descriptions :column="2" size="large" class="general-description">
      <a-descriptions-item label="主键">{{ dataDetail?.id }}</a-descriptions-item>
      <a-descriptions-item label="微信OpenID">{{ dataDetail?.openid }}</a-descriptions-item>
      <a-descriptions-item label="微信UnionID">{{ dataDetail?.unionid }}</a-descriptions-item>
      <a-descriptions-item label="昵称">{{ dataDetail?.nickname }}</a-descriptions-item>
      <a-descriptions-item label="头像URL">{{ dataDetail?.avatar }}</a-descriptions-item>
      <a-descriptions-item label="手机号">{{ dataDetail?.mobile }}</a-descriptions-item>
      <a-descriptions-item label="性别">{{ dataDetail?.gender }}</a-descriptions-item>
      <a-descriptions-item label="生日">{{ dataDetail?.birthday }}</a-descriptions-item>
      <a-descriptions-item label="城市">{{ dataDetail?.city }}</a-descriptions-item>
      <a-descriptions-item label="省份">{{ dataDetail?.province }}</a-descriptions-item>
      <a-descriptions-item label="个人简介">{{ dataDetail?.bio }}</a-descriptions-item>
      <a-descriptions-item label="隐私设置">{{ dataDetail?.privacySetting }}</a-descriptions-item>
      <a-descriptions-item label="最后登录时间">{{ dataDetail?.lastLoginAt }}</a-descriptions-item>
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
import { type UsersDetailResp, getUsers as getDetail } from '@/apis/daily/users'

const { width } = useWindowSize()

const dataId = ref('')
const dataDetail = ref<UsersDetailResp>()
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
