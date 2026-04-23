<template>
  <a-space direction="vertical" fill :size="12">
    <!-- 个人资料展示配置 -->
    <a-card :bordered="true" size="small" title="个人资料展示配置">
      <a-grid :cols="24" :col-gap="12" :row-gap="8">
        <a-grid-item :span="8">
          <a-space direction="vertical" fill>
            <span class="lbl">显示个人介绍</span>
            <a-switch v-model="model.profile.showIntro" />
            <span class="tip">是否显示个人介绍区域</span>
          </a-space>
        </a-grid-item>

        <a-grid-item :span="8">
          <a-space direction="vertical" fill>
            <span class="lbl">显示性别标签</span>
            <a-switch v-model="model.profile.showGender" />
            <span class="tip">是否显示性别图标</span>
          </a-space>
        </a-grid-item>

        <a-grid-item :span="8">
          <a-space direction="vertical" fill>
            <span class="lbl">显示年龄标签</span>
            <a-switch v-model="model.profile.showAge" />
            <span class="tip">是否显示年龄信息</span>
          </a-space>
        </a-grid-item>

        <a-grid-item :span="8">
          <a-space direction="vertical" fill>
            <span class="lbl">显示IP属地</span>
            <a-switch v-model="model.profile.showIpLocation" />
            <span class="tip">是否显示IP属地信息</span>
          </a-space>
        </a-grid-item>

        <a-grid-item :span="8">
          <a-space direction="vertical" fill>
            <span class="lbl">显示关注数</span>
            <a-switch v-model="model.profile.showFollowCount" />
            <span class="tip">是否显示关注数量</span>
          </a-space>
        </a-grid-item>

        <a-grid-item :span="8">
          <a-space direction="vertical" fill>
            <span class="lbl">显示粉丝数</span>
            <a-switch v-model="model.profile.showFansCount" />
            <span class="tip">是否显示粉丝数量</span>
          </a-space>
        </a-grid-item>

        <a-grid-item :span="8">
          <a-space direction="vertical" fill>
            <span class="lbl">显示获赞数</span>
            <a-switch v-model="model.profile.showLikeCount" />
            <span class="tip">是否显示获赞数量</span>
          </a-space>
        </a-grid-item>
      </a-grid>
    </a-card>

    <!-- 打卡模块配置 -->
    <a-card :bordered="true" size="small" title="打卡领积分配置">
      <a-grid :cols="24" :col-gap="12" :row-gap="8">
        <a-grid-item :span="24">
          <a-alert type="info">
            控制个人中心页面的打卡领积分模块是否显示及相关文案
          </a-alert>
        </a-grid-item>

        <a-grid-item :span="8">
          <a-space direction="vertical" fill>
            <span class="lbl">启用打卡模块</span>
            <a-switch v-model="model.checkin.enabled" />
            <span class="tip">是否显示打卡领积分卡片</span>
          </a-space>
        </a-grid-item>

        <a-grid-item :span="8">
          <a-space direction="vertical" fill>
            <span class="lbl">已打卡提示文案</span>
            <a-input v-model="model.checkin.checkedText" placeholder="已领取，明日打卡继续领" />
            <span class="tip">用户已打卡时的提示文字</span>
          </a-space>
        </a-grid-item>

        <a-grid-item :span="8">
          <a-space direction="vertical" fill>
            <span class="lbl">未打卡提示文案</span>
            <a-input v-model="model.checkin.uncheckedText" placeholder="今天还没有打卡领积分哦" />
            <span class="tip">用户未打卡时的提示文字</span>
          </a-space>
        </a-grid-item>

        <a-grid-item :span="12">
          <a-space direction="vertical" fill>
            <span class="lbl">打卡图标</span>
            <a-space align="center" fill>
              <a-input v-model="model.checkin.icon" allow-clear placeholder="/static/img/qd.png" style="flex: 1">
                <template #suffix>
                  <a-button type="text" size="mini" @click="openIconSelector('checkinIcon')">
                    <icon-folder /> 选择
                  </a-button>
                </template>
              </a-input>
              <img v-if="model.checkin.icon" :src="model.checkin.icon" class="icon-preview" />
            </a-space>
            <span class="tip">打卡按钮左侧的图标</span>
          </a-space>
        </a-grid-item>

        <a-grid-item :span="12">
          <a-space direction="vertical" fill>
            <span class="lbl">跳转路径</span>
            <a-input v-model="model.checkin.targetUrl" placeholder="/subPackages/welfare/index" />
            <span class="tip">点击打卡卡片跳转的页面路径</span>
          </a-space>
        </a-grid-item>
      </a-grid>
    </a-card>

    <!-- 功能区块配置 -->
    <a-card :bordered="true" size="small" title="功能区块配置">
      <a-grid :cols="24" :col-gap="12" :row-gap="8">
        <a-grid-item :span="24">
          <a-alert type="info">
            控制个人中心的横向滚动功能区块（活动、圈子、购物车、订单、卡券）及其图标
          </a-alert>
        </a-grid-item>

        <a-grid-item :span="8">
          <a-space direction="vertical" fill>
            <span class="lbl">启用功能区块</span>
            <a-switch v-model="model.modules.enabled" />
            <span class="tip">是否显示功能区块滚动区域</span>
          </a-space>
        </a-grid-item>

        <!-- 活动区块 -->
        <a-grid-item :span="24">
          <a-divider>活动区块</a-divider>
        </a-grid-item>

        <a-grid-item :span="8">
          <a-space direction="vertical" fill>
            <span class="lbl">显示活动区块</span>
            <a-switch v-model="model.modules.showActivity" />
            <span class="tip">是否显示活动入口</span>
          </a-space>
        </a-grid-item>

        <a-grid-item :span="8">
          <a-space direction="vertical" fill>
            <span class="lbl">活动图标</span>
            <a-space align="center" fill>
              <a-input v-model="model.modules.activityIcon" allow-clear placeholder="/static/img/hd.png" style="flex: 1">
                <template #suffix>
                  <a-button type="text" size="mini" @click="openIconSelector('activityIcon')">
                    <icon-folder /> 选择
                  </a-button>
                </template>
              </a-input>
              <img v-if="model.modules.activityIcon" :src="model.modules.activityIcon" class="icon-preview" />
            </a-space>
            <span class="tip">活动区块显示的图标</span>
          </a-space>
        </a-grid-item>

        <a-grid-item :span="8">
          <a-space direction="vertical" fill>
            <span class="lbl">跳转路径</span>
            <a-input v-model="model.modules.activityUrl" placeholder="activity/index?type=1" />
            <span class="tip">点击活动区块跳转的页面路径</span>
          </a-space>
        </a-grid-item>

        <!-- 圈子区块 -->
        <a-grid-item :span="24">
          <a-divider>圈子区块</a-divider>
        </a-grid-item>

        <a-grid-item :span="8">
          <a-space direction="vertical" fill>
            <span class="lbl">显示圈子区块</span>
            <a-switch v-model="model.modules.showCircle" />
            <span class="tip">是否显示圈子入口</span>
          </a-space>
        </a-grid-item>

        <a-grid-item :span="8">
          <a-space direction="vertical" fill>
            <span class="lbl">圈子图标</span>
            <a-space align="center" fill>
              <a-input v-model="model.modules.circleIcon" allow-clear placeholder="/static/img/qz.png" style="flex: 1">
                <template #suffix>
                  <a-button type="text" size="mini" @click="openIconSelector('circleIcon')">
                    <icon-folder /> 选择
                  </a-button>
                </template>
              </a-input>
              <img v-if="model.modules.circleIcon" :src="model.modules.circleIcon" class="icon-preview" />
            </a-space>
            <span class="tip">圈子区块显示的图标</span>
          </a-space>
        </a-grid-item>

        <a-grid-item :span="8">
          <a-space direction="vertical" fill>
            <span class="lbl">跳转路径</span>
            <a-input v-model="model.modules.circleUrl" placeholder="center/circle?type=1" />
            <span class="tip">点击圈子区块跳转的页面路径</span>
          </a-space>
        </a-grid-item>

        <!-- 购物车区块 -->
        <a-grid-item :span="24">
          <a-divider>购物车区块</a-divider>
        </a-grid-item>

        <a-grid-item :span="8">
          <a-space direction="vertical" fill>
            <span class="lbl">显示购物车区块</span>
            <a-switch v-model="model.modules.showCart" />
            <span class="tip">是否显示购物车入口</span>
          </a-space>
        </a-grid-item>

        <a-grid-item :span="8">
          <a-space direction="vertical" fill>
            <span class="lbl">购物车图标</span>
            <a-space align="center" fill>
              <a-input v-model="model.modules.cartIcon" allow-clear placeholder="/static/img/gwc.png" style="flex: 1">
                <template #suffix>
                  <a-button type="text" size="mini" @click="openIconSelector('cartIcon')">
                    <icon-folder /> 选择
                  </a-button>
                </template>
              </a-input>
              <img v-if="model.modules.cartIcon" :src="model.modules.cartIcon" class="icon-preview" />
            </a-space>
            <span class="tip">购物车区块显示的图标</span>
          </a-space>
        </a-grid-item>

        <a-grid-item :span="8">
          <a-space direction="vertical" fill>
            <span class="lbl">跳转路径</span>
            <a-input v-model="model.modules.cartUrl" placeholder="goods/cart" />
            <span class="tip">点击购物车区块跳转的页面路径</span>
          </a-space>
        </a-grid-item>

        <!-- 订单区块 -->
        <a-grid-item :span="24">
          <a-divider>订单区块</a-divider>
        </a-grid-item>

        <a-grid-item :span="8">
          <a-space direction="vertical" fill>
            <span class="lbl">显示订单区块</span>
            <a-switch v-model="model.modules.showOrder" />
            <span class="tip">是否显示订单入口</span>
          </a-space>
        </a-grid-item>

        <a-grid-item :span="8">
          <a-space direction="vertical" fill>
            <span class="lbl">订单图标</span>
            <a-space align="center" fill>
              <a-input v-model="model.modules.orderIcon" allow-clear placeholder="/static/img/dd.png" style="flex: 1">
                <template #suffix>
                  <a-button type="text" size="mini" @click="openIconSelector('orderIcon')">
                    <icon-folder /> 选择
                  </a-button>
                </template>
              </a-input>
              <img v-if="model.modules.orderIcon" :src="model.modules.orderIcon" class="icon-preview" />
            </a-space>
            <span class="tip">订单区块显示的图标</span>
          </a-space>
        </a-grid-item>

        <a-grid-item :span="8">
          <a-space direction="vertical" fill>
            <span class="lbl">跳转路径</span>
            <a-input v-model="model.modules.orderUrl" placeholder="order/index" />
            <span class="tip">点击订单区块跳转的页面路径</span>
          </a-space>
        </a-grid-item>

        <!-- 卡券区块 -->
        <a-grid-item :span="24">
          <a-divider>卡券区块</a-divider>
        </a-grid-item>

        <a-grid-item :span="8">
          <a-space direction="vertical" fill>
            <span class="lbl">显示卡券区块</span>
            <a-switch v-model="model.modules.showCard" />
            <span class="tip">是否显示卡券入口</span>
          </a-space>
        </a-grid-item>

        <a-grid-item :span="8">
          <a-space direction="vertical" fill>
            <span class="lbl">卡券图标</span>
            <a-space align="center" fill>
              <a-input v-model="model.modules.cardIcon" allow-clear placeholder="/static/img/kq.png" style="flex: 1">
                <template #suffix>
                  <a-button type="text" size="mini" @click="openIconSelector('cardIcon')">
                    <icon-folder /> 选择
                  </a-button>
                </template>
              </a-input>
              <img v-if="model.modules.cardIcon" :src="model.modules.cardIcon" class="icon-preview" />
            </a-space>
            <span class="tip">卡券区块显示的图标</span>
          </a-space>
        </a-grid-item>

        <a-grid-item :span="8">
          <a-space direction="vertical" fill>
            <span class="lbl">跳转路径</span>
            <a-input v-model="model.modules.cardUrl" placeholder="center/card?type=1" />
            <span class="tip">点击卡券区块跳转的页面路径</span>
          </a-space>
        </a-grid-item>
      </a-grid>
    </a-card>

    <!-- 顶部按钮配置 -->
    <a-card :bordered="true" size="small" title="顶部操作按钮配置">
      <a-grid :cols="24" :col-gap="12" :row-gap="8">
        <a-grid-item :span="8">
          <a-space direction="vertical" fill>
            <span class="lbl">显示退出登录按钮</span>
            <a-switch v-model="model.buttons.showLogout" />
            <span class="tip">是否显示退出登录按钮</span>
          </a-space>
        </a-grid-item>

        <a-grid-item :span="8">
          <a-space direction="vertical" fill>
            <span class="lbl">显示编辑资料按钮</span>
            <a-switch v-model="model.buttons.showEditProfile" />
            <span class="tip">是否显示编辑资料按钮</span>
          </a-space>
        </a-grid-item>

        <a-grid-item :span="8">
          <a-space direction="vertical" fill>
            <span class="lbl">显示设置按钮</span>
            <a-switch v-model="model.buttons.showSettings" />
            <span class="tip">是否显示设置按钮</span>
          </a-space>
        </a-grid-item>
      </a-grid>
    </a-card>

    <!-- 内容Tab配置 -->
    <a-card :bordered="true" size="small" title="内容Tab配置">
      <a-grid :cols="24" :col-gap="12" :row-gap="8">
        <a-grid-item :span="24">
          <a-space direction="vertical" fill>
            <span class="lbl">Tab标签列表</span>
            <a-space>
              <a-tag v-for="(tab, index) in model.tabs.items" :key="index" closable @close="removeTab(index)">
                {{ tab }}
              </a-tag>
              <a-input
                v-model="newTabName"
                placeholder="输入新标签名"
                style="width: 150px"
                @press-enter="addTab"
              >
                <template #suffix>
                  <a-button size="mini" type="primary" @click="addTab">添加</a-button>
                </template>
              </a-input>
            </a-space>
            <span class="tip">个人中心笔记Tab标签，默认：笔记、赞过</span>
          </a-space>
        </a-grid-item>

        <a-grid-item :span="8">
          <a-space direction="vertical" fill>
            <span class="lbl">显示草稿箱Tab</span>
            <a-switch v-model="model.tabs.showDraft" />
            <span class="tip">是否在Tab列表中显示草稿箱</span>
          </a-space>
        </a-grid-item>
      </a-grid>
    </a-card>
  </a-space>

  <!-- 文件选择器：图标 -->
  <FileSelector
    v-model="iconSelectorVisible"
    title="选择图标"
    :allow-file-types="['jpg','jpeg','png','gif','webp','svg']"
    :only-file="true"
    :select-multiple="false"
    @select="onIconSelected"
    @cancel="iconSelectorVisible = false"
  />
</template>

<script lang="ts">
import type { JsonModuleMeta } from '../types'

export const meta: JsonModuleMeta = {
  key: 'userCenter',
  title: '个人中心',
  path: ['modules', 'userCenter'],
  defaultValue: {
    // 个人资料展示配置
    profile: {
      showIntro: true,           // 是否显示个人介绍
      showGender: true,          // 是否显示性别
      showAge: true,             // 是否显示年龄
      showIpLocation: true,      // 是否显示IP属地
      showFollowCount: true,     // 是否显示关注数
      showFansCount: true,       // 是否显示粉丝数
      showLikeCount: true        // 是否显示获赞数
    },
    // 打卡模块配置
    checkin: {
      enabled: true,             // 是否显示打卡模块
      icon: '/static/img/qd.png',
      checkedText: '已领取，明日打卡继续领',
      uncheckedText: '今天还没有打卡领积分哦',
      targetUrl: '/subPackages/welfare/index'
    },
    // 功能区块配置
    modules: {
      enabled: false,            // 是否显示功能区块（当前默认false）
      showActivity: true,        // 是否显示活动区块
      activityIcon: '/static/img/hd.png', // 活动图标
      activityUrl: 'activity/index?type=1', // 活动跳转路径
      showCircle: true,          // 是否显示圈子
      circleIcon: '/static/img/qz.png',   // 圈子图标
      circleUrl: 'center/circle?type=1',  // 圈子跳转路径
      showCart: true,            // 是否显示购物车
      cartIcon: '/static/img/gwc.png',    // 购物车图标
      cartUrl: 'goods/cart',              // 购物车跳转路径
      showOrder: true,           // 是否显示订单
      orderIcon: '/static/img/dd.png',    // 订单图标
      orderUrl: 'order/index',            // 订单跳转路径
      showCard: true,            // 是否显示卡券
      cardIcon: '/static/img/kq.png',     // 卡券图标
      cardUrl: 'center/card?type=1'       // 卡券跳转路径
    },
    // 顶部按钮配置
    buttons: {
      showLogout: true,          // 是否显示退出登录
      showEditProfile: false,    // 是否显示编辑资料
      showSettings: false        // 是否显示设置
    },
    // 内容Tab配置
    tabs: {
      items: ['笔记', '赞过'],   // Tab标签列表
      showDraft: false           // 是否显示草稿箱
    }
  }
}
</script>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { deepClone } from '../jsonUtils'
import FileSelector from '@/views/system/file/components/FileSelector/FileSelector.vue'
import type { FileItem } from '@/apis/system/file'

const props = defineProps<{
  value: Record<string, any>
  apply: (val: Record<string, any>) => void
}>()

const localValue = ref<Record<string, any>>(deepClone(props.value || {}))
const syncingFromParent = ref(false)

watch(
  () => props.value,
  (v) => {
    syncingFromParent.value = true
    localValue.value = deepClone(v || {})
  },
  { deep: true }
)

watch(
  () => localValue.value,
  (v) => {
    if (syncingFromParent.value) {
      syncingFromParent.value = false
      return
    }
    props.apply(deepClone(v))
  },
  { deep: true }
)

const model = computed(() => localValue.value)

// Tab管理
const newTabName = ref('')

function addTab() {
  if (newTabName.value.trim()) {
    if (!model.value.tabs.items) {
      model.value.tabs.items = []
    }
    model.value.tabs.items.push(newTabName.value.trim())
    newTabName.value = ''
  }
}

function removeTab(index: number) {
  model.value.tabs.items.splice(index, 1)
}

// 图标文件选择器
const iconSelectorVisible = ref(false)
const currentIconType = ref<'checkinIcon' | 'activityIcon' | 'circleIcon' | 'cartIcon' | 'orderIcon' | 'cardIcon'>('checkinIcon')

function openIconSelector(type: 'checkinIcon' | 'activityIcon' | 'circleIcon' | 'cartIcon' | 'orderIcon' | 'cardIcon') {
  currentIconType.value = type
  iconSelectorVisible.value = true
}

const onIconSelected = (fileInfo: FileItem | FileItem[]) => {
  const file = Array.isArray(fileInfo) ? fileInfo[0] : fileInfo
  if (file && (file as any).url) {
    const iconUrl = (file as any).url

    switch (currentIconType.value) {
      case 'checkinIcon':
        if (!localValue.value.checkin) localValue.value.checkin = {}
        localValue.value.checkin.icon = iconUrl
        break
      case 'activityIcon':
        if (!localValue.value.modules) localValue.value.modules = {}
        localValue.value.modules.activityIcon = iconUrl
        break
      case 'circleIcon':
        if (!localValue.value.modules) localValue.value.modules = {}
        localValue.value.modules.circleIcon = iconUrl
        break
      case 'cartIcon':
        if (!localValue.value.modules) localValue.value.modules = {}
        localValue.value.modules.cartIcon = iconUrl
        break
      case 'orderIcon':
        if (!localValue.value.modules) localValue.value.modules = {}
        localValue.value.modules.orderIcon = iconUrl
        break
      case 'cardIcon':
        if (!localValue.value.modules) localValue.value.modules = {}
        localValue.value.modules.cardIcon = iconUrl
        break
    }
  }
  iconSelectorVisible.value = false
}
</script>

<style scoped>
.lbl {
  color: var(--color-text-2);
  font-weight: 500;
  font-size: 13px;
}
.tip {
  color: var(--color-text-3);
  font-size: 12px;
  margin-top: -4px;
}
.icon-preview {
  width: 40px;
  height: 40px;
  border-radius: 4px;
  object-fit: cover;
  border: 1px solid var(--color-border-2);
}
</style>
