<script setup lang="ts">
import { onMounted, nextTick, ref } from 'vue'
import { useAppStore } from '@/stores'

const appStore = useAppStore()
const containerRef = ref<HTMLElement | null>(null)

onMounted(async () => {
  // 等待DOM渲染完成
  await nextTick()
  const container = containerRef.value || document.querySelector('.wwads-container')
  if (!container) {
    // 容器不存在时，降级将脚本插入到 <head>
    const head = document.head || document.body
    if (head && !document.querySelector('script[data-wwads-script="makemoney"]')) {
      const s = document.createElement('script')
      s.async = true
      s.src = 'https://cdn.wwads.cn/js/makemoney.js'
      s.setAttribute('data-wwads-script', 'makemoney')
      head.appendChild(s)
    }
    return
  }
  // 避免重复注入
  if (!document.querySelector('script[data-wwads-script="makemoney"]')) {
    const s = document.createElement('script')
    s.async = true
    s.src = 'https://cdn.wwads.cn/js/makemoney.js'
    s.setAttribute('data-wwads-script', 'makemoney')
    ;(document.head || document.body).appendChild(s)
  }
})
</script>

<template>
  <div v-show="!appStore.menuCollapse" class="wwads-container" ref="containerRef">
    <div class="wwads-cn wwads-vertical" data-id="359" style="max-width: 180px"></div>
  </div>
</template>

<style>
.wwads-container {
  padding: 1px 15px 10px;
  margin-top: 20px;
  background-color: var(--color-fill-2);
}
.wwads-vertical {
  background-color: transparent !important;
}
.wwads-text {
  color: var(--color-text-2) !important;
}
</style>
