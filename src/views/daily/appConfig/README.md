模块化 JSON 配置（约定式注册）

目录结构
- `components/types.ts`：模块类型定义（JsonModuleMeta / JsonModule）
- `components/jsonUtils.ts`：JSON 路径工具（get/set/ensure/clone）
- `components/registry.ts`：自动注册 `./modules/*.vue` 导出的模块
- `components/modules/`：每个功能模块一个独立的 .vue 文件
- `AppConfigEditor.vue`：通用配置编辑器，按模块渲染表单

如何新增一个配置模块
1. 在 `components/modules` 新建 `XxxModule.vue`
2. 使用 `<script setup lang="ts">` 并导出命名常量 `meta`
3. `meta` 必须满足 `JsonModuleMeta` 类型：
   - `key`: 唯一键
   - `title`: 展示名称
   - `path`: 该模块在 JSON 中的路径（数组）
   - `defaultValue`: 不存在时的默认值
   - `featureKey?`: 可选，对应 `config.features` 的开关键
4. 默认导出为 Vue 组件（`<script setup>` 默认即组件）

示例（简化）：
```vue
<script setup lang="ts">
import type { JsonModuleMeta } from '../types'

export const meta: JsonModuleMeta = {
  key: 'myFeature',
  title: '我的功能',
  path: ['ui', 'myFeature'],
  featureKey: 'isMyFeature',
  defaultValue: { enabled: true, color: '#fff' },
}

const props = defineProps<{ value: Record<string, any>; features: Record<string, any>; onChange: (v: any, f?: any) => void }>()
// 使用 props.value / props.features 进行表单双向绑定，变更时调用 props.onChange
</script>
```

使用 AppConfigEditor
```vue
<AppConfigEditor v-model="config" @save="saveConfig" />
```

快速开始（模板）
- 模板文件：`components/templates/ModuleTemplate.vue`
- 复制到 `components/modules/` 并重命名，例如 `MyFeatureModule.vue`
- 修改 `meta.key/title/path/featureKey/defaultValue`，按需调整表单项

设计要点
- 约定式自动注册：无需改动中心注册表，扩展成本低
- 顶层 `config.features` 统一管理开关，模块可声明 `featureKey`
- 每个模块仅负责自身片段（`path` 对应的 JSON 子树）
- `defaultValue` 保证新建/缺失时可编辑
- 支持导入/导出，以 JSON 文本为主便于回滚与审计

后续扩展建议
- 模块校验：在模块中导出可选 `validate(value): string[]`，Editor 收集展示
- 版本迁移：在 `config.meta.version` 记录版本，提供迁移器
- 权限/可见性：模块可导出 `visible(context): boolean` 控制列表可见
- 懒加载：使用 `import.meta.glob` 非 eager 模式，首次点击再加载组件
