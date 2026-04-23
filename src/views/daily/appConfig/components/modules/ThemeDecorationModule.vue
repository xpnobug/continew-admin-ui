<template>
  <a-space direction="vertical" fill :size="16">
    <!-- 主题配置 -->
    <a-card :bordered="true" size="small" title="主题配置">
      <template #extra>
        <a-button type="primary" size="mini" @click="addTheme">
          <icon-plus /> 新增主题
        </a-button>
      </template>

      <a-table :data="model.themes" :pagination="false" :bordered="{ cell: true }">
        <template #columns>
          <a-table-column title="主题ID" data-index="id" :width="120" />
          <a-table-column title="主题名称" data-index="name" :width="120">
            <template #cell="{ record }">
              <a-input v-model="record.name" size="small" />
            </template>
          </a-table-column>
          <a-table-column title="访问类型" data-index="accessType" :width="110">
            <template #cell="{ record }">
              <a-select v-model="record.accessType" size="small" style="width: 100%">
                <a-option value="free">免费</a-option>
                <a-option value="paid">付费</a-option>
                <a-option value="vip">会员专享</a-option>
              </a-select>
            </template>
          </a-table-column>
          <a-table-column title="解锁价格" data-index="unlockPrice" :width="110">
            <template #cell="{ record }">
              <a-input-number
                v-model="record.unlockPrice"
                :min="0"
                :step="10"
                size="small"
                style="width: 100%"
                :disabled="record.accessType === 'free'"
              />
            </template>
          </a-table-column>
          <a-table-column title="排序" data-index="sortOrder" :width="80">
            <template #cell="{ record }">
              <a-input-number v-model="record.sortOrder" :min="0" size="small" style="width: 100%" />
            </template>
          </a-table-column>
          <a-table-column title="默认主题" data-index="isDefault" :width="90">
            <template #cell="{ record }">
              <a-switch v-model="record.isDefault" size="small" />
            </template>
          </a-table-column>
          <a-table-column title="操作" :width="180" fixed="right">
            <template #cell="{ record, rowIndex }">
              <a-space>
                <a-button type="text" size="mini" @click="editTheme(record)">
                  <icon-edit /> 编辑
                </a-button>
                <a-popconfirm content="确定删除该主题吗?" @ok="deleteTheme(rowIndex)">
                  <a-button type="text" status="danger" size="mini">
                    <icon-delete /> 删除
                  </a-button>
                </a-popconfirm>
              </a-space>
            </template>
          </a-table-column>
        </template>
      </a-table>
    </a-card>

    <!-- 头像配置 -->
    <a-card :bordered="true" size="small" title="头像配置">
      <template #extra>
        <a-button type="primary" size="mini" @click="addAvatar">
          <icon-plus /> 新增头像
        </a-button>
      </template>

      <a-table :data="model.avatars" :pagination="false" :bordered="{ cell: true }">
        <template #columns>
          <a-table-column title="头像ID" data-index="id" :width="140" />
          <a-table-column title="头像图片" data-index="avatarPath" :width="120">
            <template #cell="{ record }">
              <a-image :src="record.avatarPath" width="50" height="50" />
            </template>
          </a-table-column>
          <a-table-column title="头像路径" data-index="avatarPath" :width="300">
            <template #cell="{ record }">
              <a-input v-model="record.avatarPath" size="small" allow-clear>
                <template #suffix>
                  <a-button type="text" size="mini" @click="selectAvatarImage(record)">
                    <icon-folder /> 选择
                  </a-button>
                </template>
              </a-input>
            </template>
          </a-table-column>
          <a-table-column title="头像名称" data-index="name" :width="120">
            <template #cell="{ record }">
              <a-input v-model="record.name" size="small" />
            </template>
          </a-table-column>
          <a-table-column title="访问类型" data-index="accessType" :width="110">
            <template #cell="{ record }">
              <a-select v-model="record.accessType" size="small" style="width: 100%">
                <a-option value="free">免费</a-option>
                <a-option value="paid">付费</a-option>
              </a-select>
            </template>
          </a-table-column>
          <a-table-column title="解锁价格" data-index="unlockPrice" :width="110">
            <template #cell="{ record }">
              <a-input-number
                v-model="record.unlockPrice"
                :min="0"
                :step="10"
                size="small"
                style="width: 100%"
                :disabled="record.accessType === 'free'"
              />
            </template>
          </a-table-column>
          <a-table-column title="操作" :width="120" fixed="right">
            <template #cell="{ rowIndex }">
              <a-popconfirm content="确定删除该头像吗?" @ok="deleteAvatar(rowIndex)">
                <a-button type="text" status="danger" size="mini">
                  <icon-delete /> 删除
                </a-button>
              </a-popconfirm>
            </template>
          </a-table-column>
        </template>
      </a-table>
    </a-card>

    <!-- 颜色配置 -->
    <a-card :bordered="true" size="small" title="颜色配置">
      <a-space direction="vertical" fill :size="12">
        <div v-for="(config, configIndex) in model.colorConfigs" :key="configIndex">
          <a-divider v-if="configIndex > 0" />
          <a-row :gutter="12">
            <a-col :span="4">
              <a-space align="center">
                <span class="lbl">配置类型</span>
                <a-input v-model="config.type" disabled size="small" />
              </a-space>
            </a-col>
            <a-col :span="4">
              <a-space align="center">
                <span class="lbl">配置标题</span>
                <a-input v-model="config.title" size="small" />
              </a-space>
            </a-col>
            <a-col :span="16">
              <a-space align="center">
                <span class="lbl">颜色选项</span>
                <a-button type="primary" size="mini" @click="addColorOption(configIndex)">
                  <icon-plus /> 新增颜色
                </a-button>
              </a-space>
            </a-col>
          </a-row>

          <!-- 颜色选项列表 -->
          <a-row :gutter="12" style="margin-top: 12px">
            <a-col :span="24">
              <a-space wrap>
                <div
                  v-for="(color, colorIndex) in config.colors"
                  :key="colorIndex"
                  class="color-option-item"
                >
                  <div class="color-preview" :style="{ backgroundColor: color.value }"></div>
                  <a-input
                    v-model="color.label"
                    placeholder="颜色标签"
                    size="small"
                    style="width: 80px; margin: 0 4px;"
                  />
                  <a-input
                    v-model="color.value"
                    placeholder="颜色值"
                    size="small"
                    style="width: 140px; margin: 0 4px;"
                  >
                    <template #prefix>
                      <div :style="{ width: '16px', height: '16px', backgroundColor: color.value || '#ccc', border: '1px solid #ddd', borderRadius: '2px' }"></div>
                    </template>
                    <template #suffix>
                      <a-popover trigger="click" position="bottom" :popup-visible="colorPickerVisible[`${configIndex}-${colorIndex}`]" @update:popup-visible="(v) => updateColorPickerVisible(`${configIndex}-${colorIndex}`, v)">
                        <template #content>
                          <ColorPicker theme="light" :color="color.value || '#FFFFFF'" :sucker-hide="true" @change-color="(c) => onPickColorOption(c, config, colorIndex)" />
                        </template>
                        <a-button type="text" size="mini">取色</a-button>
                      </a-popover>
                    </template>
                  </a-input>
                  <a-button
                    type="text"
                    status="danger"
                    size="mini"
                    @click="deleteColorOption(configIndex, colorIndex)"
                  >
                    <icon-delete />
                  </a-button>
                </div>
              </a-space>
            </a-col>
          </a-row>
        </div>
      </a-space>
    </a-card>

    <!-- 展示与文案配置（分组归类） -->
    <a-card :bordered="true" size="small" title="展示与文案配置（小程序回显）">
      <a-space direction="vertical" fill :size="16">
        <!-- 积分价格配置 -->
        <a-card size="small" :bordered="false" class="ui-config-section">
          <template #title>
            <span class="section-title">积分价格配置</span>
            <span class="section-desc">用于显示主题/头像解锁价格</span>
          </template>
          <a-row :gutter="16">
            <a-col :span="8">
              <a-form-item label="积分图标" label-col-flex="120px">
                <a-input v-model="model.uiOptions.pointsIconUrl" allow-clear>
                  <template #suffix>
                    <a-button type="text" size="mini" @click="selectUiPointsIcon">
                      <icon-folder /> 选择
                    </a-button>
                  </template>
                </a-input>
                <a-image v-if="model.uiOptions.pointsIconUrl" :src="model.uiOptions.pointsIconUrl" width="50" height="50" style="margin-top: 8px;" fit="contain" />
              </a-form-item>
            </a-col>
            <a-col :span="8">
              <a-form-item label="价格文字颜色" label-col-flex="120px">
                <a-input v-model="model.uiOptions.pointsTextColor" placeholder="#333333">
                  <template #prefix>
                    <div :style="{ width: '16px', height: '16px', backgroundColor: model.uiOptions.pointsTextColor || '#333333', border: '1px solid #ddd', borderRadius: '2px' }"></div>
                  </template>
                  <template #suffix>
                    <a-popover trigger="click" position="bottom" v-model:popup-visible="uiColorPicker.pointsTextColor">
                      <template #content>
                        <ColorPicker theme="light" :color="model.uiOptions.pointsTextColor || '#333333'" :sucker-hide="true" @change-color="(c) => onPickUiColor(c, 'pointsTextColor')" />
                      </template>
                      <a-button type="text" size="mini">取色</a-button>
                    </a-popover>
                  </template>
                </a-input>
              </a-form-item>
            </a-col>
            <a-col :span="8">
              <a-form-item label="价格背景颜色" label-col-flex="120px">
                <a-input v-model="model.uiOptions.pointsBgColor" placeholder="#f9d8e2">
                  <template #prefix>
                    <div :style="{ width: '16px', height: '16px', backgroundColor: model.uiOptions.pointsBgColor || '#f9d8e2', border: '1px solid #ddd', borderRadius: '2px' }"></div>
                  </template>
                  <template #suffix>
                    <a-popover trigger="click" position="bottom" v-model:popup-visible="uiColorPicker.pointsBgColor">
                      <template #content>
                        <ColorPicker theme="light" :color="model.uiOptions.pointsBgColor || '#f9d8e2'" :sucker-hide="true" @change-color="(c) => onPickUiColor(c, 'pointsBgColor')" />
                      </template>
                      <a-button type="text" size="mini">取色</a-button>
                    </a-popover>
                  </template>
                </a-input>
              </a-form-item>
            </a-col>
          </a-row>
          <!-- 积分价格预览效果 -->
          <a-row :gutter="16">
            <a-col :span="24">
              <a-form-item label="显示效果预览" label-col-flex="120px">
                <div class="price-preview-wrapper">
                  <div class="price-pill-preview" :style="{ backgroundColor: model.uiOptions.pointsBgColor || '#f9d8e2' }">
                    <img v-if="model.uiOptions.pointsIconUrl" :src="model.uiOptions.pointsIconUrl" class="preview-icon" />
                    <span v-else class="preview-icon-placeholder">图</span>
                    <span :style="{ color: model.uiOptions.pointsTextColor || '#333333' }">200</span>
                  </div>
                  <span class="preview-hint">（主题卡片上的价格标签示例）</span>
                </div>
              </a-form-item>
            </a-col>
          </a-row>
        </a-card>

        <!-- 使用中徽章配置 -->
        <a-card size="small" :bordered="false" class="ui-config-section">
          <template #title>
            <span class="section-title">使用中徽章</span>
            <span class="section-desc">显示在当前正在使用的主题/头像上</span>
          </template>
          <a-row :gutter="16">
            <a-col :span="6">
              <a-form-item label="徽章文案" label-col-flex="100px">
                <a-input v-model="model.uiOptions.texts.usingBadge" placeholder="使用中" />
              </a-form-item>
            </a-col>
            <a-col :span="6">
              <a-form-item label="文字颜色" label-col-flex="100px">
                <a-input v-model="model.uiOptions.usingBadgeTextColor" placeholder="#ffffff">
                  <template #prefix>
                    <div :style="{ width: '16px', height: '16px', backgroundColor: model.uiOptions.usingBadgeTextColor || '#ffffff', border: '1px solid #ddd', borderRadius: '2px' }"></div>
                  </template>
                  <template #suffix>
                    <a-popover trigger="click" position="bottom" v-model:popup-visible="uiColorPicker.usingBadgeTextColor">
                      <template #content>
                        <ColorPicker theme="light" :color="model.uiOptions.usingBadgeTextColor || '#ffffff'" :sucker-hide="true" @change-color="(c) => onPickUiColor(c, 'usingBadgeTextColor')" />
                      </template>
                      <a-button type="text" size="mini">取色</a-button>
                    </a-popover>
                  </template>
                </a-input>
              </a-form-item>
            </a-col>
            <a-col :span="6">
              <a-form-item label="背景-起始色" label-col-flex="100px">
                <a-input v-model="model.uiOptions.usingBadgeBgStart" placeholder="#ff8fae">
                  <template #prefix>
                    <div :style="{ width: '16px', height: '16px', backgroundColor: model.uiOptions.usingBadgeBgStart || '#ff8fae', border: '1px solid #ddd', borderRadius: '2px' }"></div>
                  </template>
                  <template #suffix>
                    <a-popover trigger="click" position="bottom" v-model:popup-visible="uiColorPicker.usingBadgeBgStart">
                      <template #content>
                        <ColorPicker theme="light" :color="model.uiOptions.usingBadgeBgStart || '#ff8fae'" :sucker-hide="true" @change-color="(c) => onPickUiColor(c, 'usingBadgeBgStart')" />
                      </template>
                      <a-button type="text" size="mini">取色</a-button>
                    </a-popover>
                  </template>
                </a-input>
              </a-form-item>
            </a-col>
            <a-col :span="6">
              <a-form-item label="背景-结束色" label-col-flex="100px">
                <a-input v-model="model.uiOptions.usingBadgeBgEnd" placeholder="#ff6f9f">
                  <template #prefix>
                    <div :style="{ width: '16px', height: '16px', backgroundColor: model.uiOptions.usingBadgeBgEnd || '#ff6f9f', border: '1px solid #ddd', borderRadius: '2px' }"></div>
                  </template>
                  <template #suffix>
                    <a-popover trigger="click" position="bottom" v-model:popup-visible="uiColorPicker.usingBadgeBgEnd">
                      <template #content>
                        <ColorPicker theme="light" :color="model.uiOptions.usingBadgeBgEnd || '#ff6f9f'" :sucker-hide="true" @change-color="(c) => onPickUiColor(c, 'usingBadgeBgEnd')" />
                      </template>
                      <a-button type="text" size="mini">取色</a-button>
                    </a-popover>
                  </template>
                </a-input>
              </a-form-item>
            </a-col>
          </a-row>
          <!-- 使用中徽章预览 -->
          <a-row :gutter="16">
            <a-col :span="24">
              <a-form-item label="显示效果预览" label-col-flex="100px">
                <div class="badge-preview-wrapper">
                  <div class="badge-preview" :style="{ background: `linear-gradient(102deg, ${model.uiOptions.usingBadgeBgStart || '#ff8fae'} 10%, ${model.uiOptions.usingBadgeBgEnd || '#ff6f9f'} 90%)`, color: model.uiOptions.usingBadgeTextColor || '#ffffff' }">
                    {{ model.uiOptions.texts.usingBadge || '使用中' }}
                  </div>
                  <span class="preview-hint">（主题卡片左上角显示）</span>
                </div>
              </a-form-item>
            </a-col>
          </a-row>
        </a-card>

        <!-- 已解锁徽章配置 -->
        <a-card size="small" :bordered="false" class="ui-config-section">
          <template #title>
            <span class="section-title">已解锁徽章</span>
            <span class="section-desc">显示在已解锁但未使用的主题/头像上</span>
          </template>
          <a-row :gutter="16">
            <a-col :span="6">
              <a-form-item label="徽章文案" label-col-flex="100px">
                <a-input v-model="model.uiOptions.texts.unlockedBadge" placeholder="已解锁" />
              </a-form-item>
            </a-col>
            <a-col :span="6">
              <a-form-item label="文字颜色" label-col-flex="100px">
                <a-input v-model="model.uiOptions.unlockedBadgeTextColor" placeholder="#544000">
                  <template #prefix>
                    <div :style="{ width: '16px', height: '16px', backgroundColor: model.uiOptions.unlockedBadgeTextColor || '#544000', border: '1px solid #ddd', borderRadius: '2px' }"></div>
                  </template>
                  <template #suffix>
                    <a-popover trigger="click" position="bottom" v-model:popup-visible="uiColorPicker.unlockedBadgeTextColor">
                      <template #content>
                        <ColorPicker theme="light" :color="model.uiOptions.unlockedBadgeTextColor || '#544000'" :sucker-hide="true" @change-color="(c) => onPickUiColor(c, 'unlockedBadgeTextColor')" />
                      </template>
                      <a-button type="text" size="mini">取色</a-button>
                    </a-popover>
                  </template>
                </a-input>
              </a-form-item>
            </a-col>
            <a-col :span="6">
              <a-form-item label="背景-起始色" label-col-flex="100px">
                <a-input v-model="model.uiOptions.unlockedBadgeBgStart" placeholder="#ffecf0">
                  <template #prefix>
                    <div :style="{ width: '16px', height: '16px', backgroundColor: model.uiOptions.unlockedBadgeBgStart || '#ffecf0', border: '1px solid #ddd', borderRadius: '2px' }"></div>
                  </template>
                  <template #suffix>
                    <a-popover trigger="click" position="bottom" v-model:popup-visible="uiColorPicker.unlockedBadgeBgStart">
                      <template #content>
                        <ColorPicker theme="light" :color="model.uiOptions.unlockedBadgeBgStart || '#ffecf0'" :sucker-hide="true" @change-color="(c) => onPickUiColor(c, 'unlockedBadgeBgStart')" />
                      </template>
                      <a-button type="text" size="mini">取色</a-button>
                    </a-popover>
                  </template>
                </a-input>
              </a-form-item>
            </a-col>
            <a-col :span="6">
              <a-form-item label="背景-结束色" label-col-flex="100px">
                <a-input v-model="model.uiOptions.unlockedBadgeBgEnd" placeholder="#f7cbd8">
                  <template #prefix>
                    <div :style="{ width: '16px', height: '16px', backgroundColor: model.uiOptions.unlockedBadgeBgEnd || '#f7cbd8', border: '1px solid #ddd', borderRadius: '2px' }"></div>
                  </template>
                  <template #suffix>
                    <a-popover trigger="click" position="bottom" v-model:popup-visible="uiColorPicker.unlockedBadgeBgEnd">
                      <template #content>
                        <ColorPicker theme="light" :color="model.uiOptions.unlockedBadgeBgEnd || '#f7cbd8'" :sucker-hide="true" @change-color="(c) => onPickUiColor(c, 'unlockedBadgeBgEnd')" />
                      </template>
                      <a-button type="text" size="mini">取色</a-button>
                    </a-popover>
                  </template>
                </a-input>
              </a-form-item>
            </a-col>
          </a-row>
          <!-- 已解锁徽章预览 -->
          <a-row :gutter="16">
            <a-col :span="24">
              <a-form-item label="显示效果预览" label-col-flex="100px">
                <div class="badge-preview-wrapper">
                  <div class="badge-preview" :style="{ background: `linear-gradient(102deg, ${model.uiOptions.unlockedBadgeBgStart || '#ffecf0'} 11%, ${model.uiOptions.unlockedBadgeBgEnd || '#f7cbd8'})`, color: model.uiOptions.unlockedBadgeTextColor || '#544000' }">
                    {{ model.uiOptions.texts.unlockedBadge || '已解锁' }}
                  </div>
                  <span class="preview-hint">（主题卡片左上角显示）</span>
                </div>
              </a-form-item>
            </a-col>
          </a-row>
        </a-card>

        <!-- 主题详情页按钮配置 -->
        <a-card size="small" :bordered="false" class="ui-config-section">
          <template #title>
            <span class="section-title">主题详情页按钮</span>
            <span class="section-desc">主题详情页底部操作按钮的文案配置</span>
          </template>
          <a-row :gutter="16">
            <a-col :span="8">
              <a-form-item label="解锁按钮背景色" label-col-flex="120px">
                <a-input v-model="model.uiOptions.unlockButtonBgColor" placeholder="#ffe387">
                  <template #prefix>
                    <div :style="{ width: '16px', height: '16px', backgroundColor: model.uiOptions.unlockButtonBgColor || '#ffe387', border: '1px solid #ddd', borderRadius: '2px' }"></div>
                  </template>
                  <template #suffix>
                    <a-popover trigger="click" position="bottom" v-model:popup-visible="uiColorPicker.unlockButtonBgColor">
                      <template #content>
                        <ColorPicker theme="light" :color="model.uiOptions.unlockButtonBgColor || '#ffe387'" :sucker-hide="true" @change-color="(c) => onPickUiColor(c, 'unlockButtonBgColor')" />
                      </template>
                      <a-button type="text" size="mini">取色</a-button>
                    </a-popover>
                  </template>
                </a-input>
              </a-form-item>
            </a-col>
            <a-col :span="8">
              <a-form-item label="解锁按钮文案" label-col-flex="120px">
                <a-input v-model="model.uiOptions.texts.unlockButtonLabel" placeholder="解锁" />
              </a-form-item>
            </a-col>
            <a-col :span="8">
              <a-form-item label="会员免费文案" label-col-flex="120px">
                <a-input v-model="model.uiOptions.texts.vipFreeLabel" placeholder="会员免费" />
              </a-form-item>
            </a-col>
          </a-row>
          <a-row :gutter="16">
            <a-col :span="8">
              <a-form-item label="应用按钮文案" label-col-flex="120px">
                <a-input v-model="model.uiOptions.texts.applyButtonLabel" placeholder="应用" />
              </a-form-item>
            </a-col>
            <a-col :span="8">
              <a-form-item label="已应用文案" label-col-flex="120px">
                <a-input v-model="model.uiOptions.texts.appliedLabel" placeholder="使用中" />
              </a-form-item>
            </a-col>
          </a-row>
          <!-- 按钮预览 -->
          <a-row :gutter="16">
            <a-col :span="24">
              <a-form-item label="按钮效果预览" label-col-flex="120px">
                <div class="button-preview-wrapper">
                  <button class="button-preview unlock-button" :style="{ backgroundColor: model.uiOptions.unlockButtonBgColor || '#ffe387' }">
                    200 <img v-if="model.uiOptions.pointsIconUrl" :src="model.uiOptions.pointsIconUrl" class="button-icon" /> {{ model.uiOptions.texts.unlockButtonLabel || '解锁' }}
                  </button>
                  <button class="button-preview vip-button">{{ model.uiOptions.texts.vipFreeLabel || '会员免费' }}</button>
                  <button class="button-preview apply-button">{{ model.uiOptions.texts.applyButtonLabel || '应用' }}</button>
                  <div class="button-preview applied-state">{{ model.uiOptions.texts.appliedLabel || '使用中' }}</div>
                </div>
              </a-form-item>
            </a-col>
          </a-row>
        </a-card>
      </a-space>
    </a-card>

    <!-- 主题编辑弹窗 -->
    <a-modal
      v-model:visible="themeModalVisible"
      title="编辑主题详情"
      width="1100px"
      fullscreen
      @ok="saveThemeEdit"
      @cancel="cancelThemeEdit"
    >
      <a-form :model="editingTheme" layout="vertical" v-if="editingTheme">
        <!-- 基础信息 -->
        <a-collapse :default-active-key="['basic', 'preview', 'colors', 'backgrounds', 'tabbar', 'icons']" :bordered="false">
          <a-collapse-item key="basic" header="基础信息">
            <a-row :gutter="12">
              <a-col :span="8">
                <a-form-item label="主题ID" required>
                  <a-input v-model="editingTheme.id" :disabled="!isNewTheme" />
                </a-form-item>
              </a-col>
              <a-col :span="8">
                <a-form-item label="主题名称" required>
                  <a-input v-model="editingTheme.name" />
                </a-form-item>
              </a-col>
              <a-col :span="8">
                <a-form-item label="排序序号">
                  <a-input-number v-model="editingTheme.sortOrder" :min="0" style="width: 100%" />
                </a-form-item>
              </a-col>
              <a-col :span="24">
                <a-form-item label="主题描述">
                  <a-textarea v-model="editingTheme.description" :auto-size="{ minRows: 2, maxRows: 4 }" placeholder="请输入主题描述" />
                </a-form-item>
              </a-col>
            </a-row>
          </a-collapse-item>

          <!-- 预览图和背景图 -->
          <a-collapse-item key="preview" header="预览图和背景图">
            <a-row :gutter="12">
              <a-col :span="12">
                <a-form-item label="首页背景图">
                  <a-input v-model="editingTheme.homeBgImage" allow-clear>
                    <template #suffix>
                      <a-button type="text" size="mini" @click="selectThemeImage('homeBgImage')">
                        <icon-folder /> 选择
                      </a-button>
                    </template>
                  </a-input>
                  <a-image v-if="editingTheme.homeBgImage" :src="editingTheme.homeBgImage" width="100%" style="margin-top: 8px;" />
                </a-form-item>
              </a-col>
              <a-col :span="12">
                <a-form-item label="个人中心背景图">
                  <a-input v-model="editingTheme.mineBgImage" allow-clear>
                    <template #suffix>
                      <a-button type="text" size="mini" @click="selectThemeImage('mineBgImage')">
                        <icon-folder /> 选择
                      </a-button>
                    </template>
                  </a-input>
                  <a-image v-if="editingTheme.mineBgImage" :src="editingTheme.mineBgImage" width="100%" style="margin-top: 8px;" />
                </a-form-item>
              </a-col>
              <a-col :span="24">
                <a-form-item label="主题预览图">
                  <a-space direction="vertical" fill>
                    <a-button type="outline" size="small" @click="addPreviewImage">
                      <icon-plus /> 添加预览图
                    </a-button>
                    <a-space wrap>
                      <div v-for="(img, imgIndex) in editingTheme.images" :key="imgIndex" class="preview-image-item">
                        <a-image :src="img" width="150" height="150" fit="cover" />
                        <div class="preview-image-actions">
                          <a-button type="text" size="mini" @click="editPreviewImage(imgIndex)">
                            <icon-edit /> 修改
                          </a-button>
                          <a-button type="text" status="danger" size="mini" @click="deletePreviewImage(imgIndex)">
                            <icon-delete /> 删除
                          </a-button>
                        </div>
                      </div>
                    </a-space>
                  </a-space>
                </a-form-item>
              </a-col>
            </a-row>
          </a-collapse-item>

          <!-- 主题颜色配置 -->
          <a-collapse-item key="colors" header="主题颜色配置">
            <a-row :gutter="12">
              <a-col :span="8">
                <a-form-item label="经期颜色">
                  <a-input v-model="editingTheme.colors.period">
                    <template #prefix>
                      <div :style="{ width: '16px', height: '16px', backgroundColor: editingTheme.colors.period, border: '1px solid #ddd', borderRadius: '2px' }"></div>
                    </template>
                    <template #suffix>
                      <a-popover trigger="click" position="bottom" v-model:popup-visible="themeColorPicker.period">
                        <template #content>
                          <ColorPicker theme="light" :color="editingTheme.colors.period || '#FF8FAE'" :sucker-hide="true" @change-color="(c) => onPickThemeColor(c, 'period')" />
                        </template>
                        <a-button type="text" size="mini">取色</a-button>
                      </a-popover>
                    </template>
                  </a-input>
                </a-form-item>
              </a-col>
              <a-col :span="8">
                <a-form-item label="预测经期颜色">
                  <a-input v-model="editingTheme.colors.predicted">
                    <template #prefix>
                      <div :style="{ width: '16px', height: '16px', backgroundColor: editingTheme.colors.predicted, border: '1px solid #ddd', borderRadius: '2px' }"></div>
                    </template>
                    <template #suffix>
                      <a-popover trigger="click" position="bottom" v-model:popup-visible="themeColorPicker.predicted">
                        <template #content>
                          <ColorPicker theme="light" :color="editingTheme.colors.predicted || '#FCBED5'" :sucker-hide="true" @change-color="(c) => onPickThemeColor(c, 'predicted')" />
                        </template>
                        <a-button type="text" size="mini">取色</a-button>
                      </a-popover>
                    </template>
                  </a-input>
                </a-form-item>
              </a-col>
              <a-col :span="8">
                <a-form-item label="排卵期颜色">
                  <a-input v-model="editingTheme.colors.ovulation">
                    <template #prefix>
                      <div :style="{ width: '16px', height: '16px', backgroundColor: editingTheme.colors.ovulation, border: '1px solid #ddd', borderRadius: '2px' }"></div>
                    </template>
                    <template #suffix>
                      <a-popover trigger="click" position="bottom" v-model:popup-visible="themeColorPicker.ovulation">
                        <template #content>
                          <ColorPicker theme="light" :color="editingTheme.colors.ovulation || '#B09CFF'" :sucker-hide="true" @change-color="(c) => onPickThemeColor(c, 'ovulation')" />
                        </template>
                        <a-button type="text" size="mini">取色</a-button>
                      </a-popover>
                    </template>
                  </a-input>
                </a-form-item>
              </a-col>
              <a-col :span="8">
                <a-form-item label="排卵日颜色">
                  <a-input v-model="editingTheme.colors.ovulationDay">
                    <template #prefix>
                      <div :style="{ width: '16px', height: '16px', backgroundColor: editingTheme.colors.ovulationDay, border: '1px solid #ddd', borderRadius: '2px' }"></div>
                    </template>
                    <template #suffix>
                      <a-popover trigger="click" position="bottom" v-model:popup-visible="themeColorPicker.ovulationDay">
                        <template #content>
                          <ColorPicker theme="light" :color="editingTheme.colors.ovulationDay || '#FFC400'" :sucker-hide="true" @change-color="(c) => onPickThemeColor(c, 'ovulationDay')" />
                        </template>
                        <a-button type="text" size="mini">取色</a-button>
                      </a-popover>
                    </template>
                  </a-input>
                </a-form-item>
              </a-col>
              <a-col :span="8">
                <a-form-item label="选中日期颜色">
                  <a-input v-model="editingTheme.colors.selected">
                    <template #prefix>
                      <div :style="{ width: '16px', height: '16px', backgroundColor: editingTheme.colors.selected, border: '1px solid #ddd', borderRadius: '2px' }"></div>
                    </template>
                    <template #suffix>
                      <a-popover trigger="click" position="bottom" v-model:popup-visible="themeColorPicker.selected">
                        <template #content>
                          <ColorPicker theme="light" :color="editingTheme.colors.selected || '#FF8FAE'" :sucker-hide="true" @change-color="(c) => onPickThemeColor(c, 'selected')" />
                        </template>
                        <a-button type="text" size="mini">取色</a-button>
                      </a-popover>
                    </template>
                  </a-input>
                </a-form-item>
              </a-col>
            </a-row>
            <a-row :gutter="12" style="margin-top: 12px">
              <a-col :span="12">
                <a-form-item label="排卵日图标">
                  <a-input v-model="editingTheme.ovulationDayIcon" allow-clear>
                    <template #suffix>
                      <a-button type="text" size="mini" @click="selectThemeImage('ovulationDayIcon')">
                        <icon-folder /> 选择
                      </a-button>
                    </template>
                  </a-input>
                  <a-image v-if="editingTheme.ovulationDayIcon" :src="editingTheme.ovulationDayIcon" width="60" height="60" style="margin-top: 8px;" fit="contain" />
                </a-form-item>
              </a-col>
            </a-row>
          </a-collapse-item>

          <!-- 页面背景色配置 -->
          <a-collapse-item key="backgrounds" header="页面背景色配置">
            <a-row :gutter="12">
              <a-col :span="8">
                <a-form-item label="日历背景色">
                  <a-input v-model="editingTheme.calendarBg">
                    <template #prefix>
                      <div :style="{ width: '16px', height: '16px', backgroundColor: editingTheme.calendarBg, border: '1px solid #ddd', borderRadius: '2px' }"></div>
                    </template>
                    <template #suffix>
                      <a-popover trigger="click" position="bottom" v-model:popup-visible="themeBgColorPicker.calendarBg">
                        <template #content>
                          <ColorPicker theme="light" :color="editingTheme.calendarBg || '#fff'" :sucker-hide="true" @change-color="(c) => onPickThemeBgColor(c, 'calendarBg')" />
                        </template>
                        <a-button type="text" size="mini">取色</a-button>
                      </a-popover>
                    </template>
                  </a-input>
                </a-form-item>
              </a-col>
              <a-col :span="8">
                <a-form-item label="个人中心背景色">
                  <a-input v-model="editingTheme.mineBgColor">
                    <template #prefix>
                      <div :style="{ width: '16px', height: '16px', backgroundColor: editingTheme.mineBgColor, border: '1px solid #ddd', borderRadius: '2px' }"></div>
                    </template>
                    <template #suffix>
                      <a-popover trigger="click" position="bottom" v-model:popup-visible="themeBgColorPicker.mineBgColor">
                        <template #content>
                          <ColorPicker theme="light" :color="editingTheme.mineBgColor || '#F5F5F5'" :sucker-hide="true" @change-color="(c) => onPickThemeBgColor(c, 'mineBgColor')" />
                        </template>
                        <a-button type="text" size="mini">取色</a-button>
                      </a-popover>
                    </template>
                  </a-input>
                </a-form-item>
              </a-col>
              <a-col :span="8">
                <a-form-item label="头部背景色">
                  <a-input v-model="editingTheme.headerBgColor">
                    <template #prefix>
                      <div :style="{ width: '16px', height: '16px', backgroundColor: editingTheme.headerBgColor, border: '1px solid #ddd', borderRadius: '2px' }"></div>
                    </template>
                    <template #suffix>
                      <a-popover trigger="click" position="bottom" v-model:popup-visible="themeBgColorPicker.headerBgColor">
                        <template #content>
                          <ColorPicker theme="light" :color="editingTheme.headerBgColor || '#fff'" :sucker-hide="true" @change-color="(c) => onPickThemeBgColor(c, 'headerBgColor')" />
                        </template>
                        <a-button type="text" size="mini">取色</a-button>
                      </a-popover>
                    </template>
                  </a-input>
                </a-form-item>
              </a-col>
              <a-col :span="8">
                <a-form-item label="AI聊天背景色">
                  <a-input v-model="editingTheme.aiChatBgColor">
                    <template #prefix>
                      <div :style="{ width: '16px', height: '16px', backgroundColor: editingTheme.aiChatBgColor, border: '1px solid #ddd', borderRadius: '2px' }"></div>
                    </template>
                    <template #suffix>
                      <a-popover trigger="click" position="bottom" v-model:popup-visible="themeBgColorPicker.aiChatBgColor">
                        <template #content>
                          <ColorPicker theme="light" :color="editingTheme.aiChatBgColor || '#ffecf3'" :sucker-hide="true" @change-color="(c) => onPickThemeBgColor(c, 'aiChatBgColor')" />
                        </template>
                        <a-button type="text" size="mini">取色</a-button>
                      </a-popover>
                    </template>
                  </a-input>
                </a-form-item>
              </a-col>
              <a-col :span="8">
                <a-form-item label="记录边框颜色">
                  <a-input v-model="editingTheme.recordBorderColor">
                    <template #prefix>
                      <div :style="{ width: '16px', height: '16px', backgroundColor: editingTheme.recordBorderColor, border: '1px solid #ddd', borderRadius: '2px' }"></div>
                    </template>
                    <template #suffix>
                      <a-popover trigger="click" position="bottom" v-model:popup-visible="themeBgColorPicker.recordBorderColor">
                        <template #content>
                          <ColorPicker theme="light" :color="editingTheme.recordBorderColor || '#fcbed5'" :sucker-hide="true" @change-color="(c) => onPickThemeBgColor(c, 'recordBorderColor')" />
                        </template>
                        <a-button type="text" size="mini">取色</a-button>
                      </a-popover>
                    </template>
                  </a-input>
                </a-form-item>
              </a-col>
            </a-row>
          </a-collapse-item>

          <!-- 底部导航栏背景色配置 -->
          <a-collapse-item key="tabbar" header="底部导航栏背景色配置">
            <a-row :gutter="12">
              <a-col :span="6">
                <a-form-item label="首页导航栏背景色">
                  <a-input v-model="editingTheme.tabbarBgColor.home">
                    <template #prefix>
                      <div :style="{ width: '16px', height: '16px', backgroundColor: editingTheme.tabbarBgColor.home, border: '1px solid #ddd', borderRadius: '2px' }"></div>
                    </template>
                    <template #suffix>
                      <a-popover trigger="click" position="bottom" v-model:popup-visible="tabbarBgColorPicker.home">
                        <template #content>
                          <ColorPicker theme="light" :color="editingTheme.tabbarBgColor.home || '#fff'" :sucker-hide="true" @change-color="(c) => onPickTabbarBgColor(c, 'home')" />
                        </template>
                        <a-button type="text" size="mini">取色</a-button>
                      </a-popover>
                    </template>
                  </a-input>
                </a-form-item>
              </a-col>
              <a-col :span="6">
                <a-form-item label="发现页导航栏背景色">
                  <a-input v-model="editingTheme.tabbarBgColor.find">
                    <template #prefix>
                      <div :style="{ width: '16px', height: '16px', backgroundColor: editingTheme.tabbarBgColor.find, border: '1px solid #ddd', borderRadius: '2px' }"></div>
                    </template>
                    <template #suffix>
                      <a-popover trigger="click" position="bottom" v-model:popup-visible="tabbarBgColorPicker.find">
                        <template #content>
                          <ColorPicker theme="light" :color="editingTheme.tabbarBgColor.find || '#fff'" :sucker-hide="true" @change-color="(c) => onPickTabbarBgColor(c, 'find')" />
                        </template>
                        <a-button type="text" size="mini">取色</a-button>
                      </a-popover>
                    </template>
                  </a-input>
                </a-form-item>
              </a-col>
              <a-col :span="6">
                <a-form-item label="AI聊天导航栏背景色">
                  <a-input v-model="editingTheme.tabbarBgColor.aiChat">
                    <template #prefix>
                      <div :style="{ width: '16px', height: '16px', backgroundColor: editingTheme.tabbarBgColor.aiChat, border: '1px solid #ddd', borderRadius: '2px' }"></div>
                    </template>
                    <template #suffix>
                      <a-popover trigger="click" position="bottom" v-model:popup-visible="tabbarBgColorPicker.aiChat">
                        <template #content>
                          <ColorPicker theme="light" :color="editingTheme.tabbarBgColor.aiChat || '#fff'" :sucker-hide="true" @change-color="(c) => onPickTabbarBgColor(c, 'aiChat')" />
                        </template>
                        <a-button type="text" size="mini">取色</a-button>
                      </a-popover>
                    </template>
                  </a-input>
                </a-form-item>
              </a-col>
              <a-col :span="6">
                <a-form-item label="我的页导航栏背景色">
                  <a-input v-model="editingTheme.tabbarBgColor.mine">
                    <template #prefix>
                      <div :style="{ width: '16px', height: '16px', backgroundColor: editingTheme.tabbarBgColor.mine, border: '1px solid #ddd', borderRadius: '2px' }"></div>
                    </template>
                    <template #suffix>
                      <a-popover trigger="click" position="bottom" v-model:popup-visible="tabbarBgColorPicker.mine">
                        <template #content>
                          <ColorPicker theme="light" :color="editingTheme.tabbarBgColor.mine || '#fff'" :sucker-hide="true" @change-color="(c) => onPickTabbarBgColor(c, 'mine')" />
                        </template>
                        <a-button type="text" size="mini">取色</a-button>
                      </a-popover>
                    </template>
                  </a-input>
                </a-form-item>
              </a-col>
            </a-row>
          </a-collapse-item>

          <!-- 底部导航图标配置 -->
          <a-collapse-item key="icons" header="底部导航图标配置">
            <a-row :gutter="12">
              <!-- 首页图标 -->
              <a-col :span="12">
                <a-card size="small" title="首页图标">
                  <a-form-item label="未选中图标">
                    <a-input v-model="editingTheme.tabIcons.home.normal" allow-clear>
                      <template #suffix>
                        <a-button type="text" size="mini" @click="selectTabIcon('home', 'normal')">
                          <icon-folder /> 选择
                        </a-button>
                      </template>
                    </a-input>
                    <a-image v-if="editingTheme.tabIcons.home.normal" :src="editingTheme.tabIcons.home.normal" width="60" style="margin-top: 8px;" />
                  </a-form-item>
                  <a-form-item label="选中图标">
                    <a-input v-model="editingTheme.tabIcons.home.active" allow-clear>
                      <template #suffix>
                        <a-button type="text" size="mini" @click="selectTabIcon('home', 'active')">
                          <icon-folder /> 选择
                        </a-button>
                      </template>
                    </a-input>
                    <a-image v-if="editingTheme.tabIcons.home.active" :src="editingTheme.tabIcons.home.active" width="60" style="margin-top: 8px;" />
                  </a-form-item>
                </a-card>
              </a-col>

              <!-- 发现页图标 -->
              <a-col :span="12">
                <a-card size="small" title="发现页图标">
                  <a-form-item label="未选中图标">
                    <a-input v-model="editingTheme.tabIcons.find.normal" allow-clear>
                      <template #suffix>
                        <a-button type="text" size="mini" @click="selectTabIcon('find', 'normal')">
                          <icon-folder /> 选择
                        </a-button>
                      </template>
                    </a-input>
                    <a-image v-if="editingTheme.tabIcons.find.normal" :src="editingTheme.tabIcons.find.normal" width="60" style="margin-top: 8px;" />
                  </a-form-item>
                  <a-form-item label="选中图标">
                    <a-input v-model="editingTheme.tabIcons.find.active" allow-clear>
                      <template #suffix>
                        <a-button type="text" size="mini" @click="selectTabIcon('find', 'active')">
                          <icon-folder /> 选择
                        </a-button>
                      </template>
                    </a-input>
                    <a-image v-if="editingTheme.tabIcons.find.active" :src="editingTheme.tabIcons.find.active" width="60" style="margin-top: 8px;" />
                  </a-form-item>
                </a-card>
              </a-col>

              <!-- AI聊天图标 -->
              <a-col :span="12">
                <a-card size="small" title="AI聊天图标">
                  <a-form-item label="未选中图标">
                    <a-input v-model="editingTheme.tabIcons.aiChat.normal" allow-clear>
                      <template #suffix>
                        <a-button type="text" size="mini" @click="selectTabIcon('aiChat', 'normal')">
                          <icon-folder /> 选择
                        </a-button>
                      </template>
                    </a-input>
                    <a-image v-if="editingTheme.tabIcons.aiChat.normal" :src="editingTheme.tabIcons.aiChat.normal" width="60" style="margin-top: 8px;" />
                  </a-form-item>
                  <a-form-item label="选中图标">
                    <a-input v-model="editingTheme.tabIcons.aiChat.active" allow-clear>
                      <template #suffix>
                        <a-button type="text" size="mini" @click="selectTabIcon('aiChat', 'active')">
                          <icon-folder /> 选择
                        </a-button>
                      </template>
                    </a-input>
                    <a-image v-if="editingTheme.tabIcons.aiChat.active" :src="editingTheme.tabIcons.aiChat.active" width="60" style="margin-top: 8px;" />
                  </a-form-item>
                </a-card>
              </a-col>

              <!-- 我的页图标 -->
              <a-col :span="12">
                <a-card size="small" title="我的页图标">
                  <a-form-item label="未选中图标">
                    <a-input v-model="editingTheme.tabIcons.mine.normal" allow-clear>
                      <template #suffix>
                        <a-button type="text" size="mini" @click="selectTabIcon('mine', 'normal')">
                          <icon-folder /> 选择
                        </a-button>
                      </template>
                    </a-input>
                    <a-image v-if="editingTheme.tabIcons.mine.normal" :src="editingTheme.tabIcons.mine.normal" width="60" style="margin-top: 8px;" />
                  </a-form-item>
                  <a-form-item label="选中图标">
                    <a-input v-model="editingTheme.tabIcons.mine.active" allow-clear>
                      <template #suffix>
                        <a-button type="text" size="mini" @click="selectTabIcon('mine', 'active')">
                          <icon-folder /> 选择
                        </a-button>
                      </template>
                    </a-input>
                    <a-image v-if="editingTheme.tabIcons.mine.active" :src="editingTheme.tabIcons.mine.active" width="60" style="margin-top: 8px;" />
                  </a-form-item>
                </a-card>
              </a-col>
            </a-row>
          </a-collapse-item>
        </a-collapse>
      </a-form>
    </a-modal>

    <!-- 文件选择器 -->
    <FileSelector
      v-model="fileSelectorVisible"
      :title="fileSelectorTitle"
      :allow-file-types="['jpg','jpeg','png','gif','webp','svg']"
      :only-file="true"
      :select-multiple="false"
      @select="onFileSelected"
      @cancel="fileSelectorVisible = false"
    />
  </a-space>
</template>

<script lang="ts">
import type { JsonModuleMeta } from '../types'

export const meta: JsonModuleMeta = {
  key: 'themeDecoration',
  title: '主题装扮',
  path: ['themeDecoration'],
  defaultValue: {
    themes: [],
    avatars: [],
    colorConfigs: [],
    uiOptions: {
      pointsIconUrl: '',
      pointsTextColor: '#333333',
      pointsBgColor: '#f9d8e2',
      unlockButtonBgColor: '#ffe387',
      usingBadgeBgStart: '#ff8fae',
      usingBadgeBgEnd: '#ff6f9f',
      usingBadgeBg: 'linear-gradient(102deg, #ff8fae 10%, #ff6f9f 90%)',
      usingBadgeTextColor: '#ffffff',
      unlockedBadgeBgStart: '#ffecf0',
      unlockedBadgeBgEnd: '#f7cbd8',
      unlockedBadgeBg: 'linear-gradient(102deg, #ffecf0 11%, #f7cbd8)',
      unlockedBadgeTextColor: '#544000',
      texts: {
        usingBadge: '使用中',
        unlockedBadge: '已解锁',
        unlockButtonLabel: '解锁',
        vipFreeLabel: '会员免费',
        applyButtonLabel: '应用',
        appliedLabel: '使用中'
      }
    }
  },
}
</script>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { Message } from '@arco-design/web-vue'
import { deepClone } from '../jsonUtils'
import FileSelector from '@/views/system/file/components/FileSelector/FileSelector.vue'
import type { FileItem } from '@/apis/system/file'
import { ColorPicker } from 'vue-color-kit'
import 'vue-color-kit/dist/vue-color-kit.css'

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

// 保底：确保 uiOptions 结构存在，避免模板访问报错
const ensureUiOptions = () => {
  if (!model.value.uiOptions) {
    model.value.uiOptions = {
      pointsIconUrl: '',
      pointsTextColor: '#333333',
      pointsBgColor: '#f9d8e2',
      unlockButtonBgColor: '#ffe387',
      usingBadgeBgStart: '#ff8fae',
      usingBadgeBgEnd: '#ff6f9f',
      usingBadgeBg: 'linear-gradient(102deg, #ff8fae 10%, #ff6f9f 90%)',
      usingBadgeTextColor: '#ffffff',
      unlockedBadgeBgStart: '#ffecf0',
      unlockedBadgeBgEnd: '#f7cbd8',
      unlockedBadgeBg: 'linear-gradient(102deg, #ffecf0 11%, #f7cbd8)',
      unlockedBadgeTextColor: '#544000',
      texts: {
        usingBadge: '使用中',
        unlockedBadge: '已解锁',
        unlockButtonLabel: '解锁',
        vipFreeLabel: '会员免费',
        applyButtonLabel: '应用',
        appliedLabel: '使用中'
      }
    }
  } else {
    if (!model.value.uiOptions.texts) {
      model.value.uiOptions.texts = {
        usingBadge: '使用中',
        unlockedBadge: '已解锁',
        unlockButtonLabel: '解锁',
        vipFreeLabel: '会员免费',
        applyButtonLabel: '应用',
        appliedLabel: '使用中'
      }
    }
    if (!model.value.uiOptions.usingBadgeBgStart) model.value.uiOptions.usingBadgeBgStart = '#ff8fae'
    if (!model.value.uiOptions.usingBadgeBgEnd) model.value.uiOptions.usingBadgeBgEnd = '#ff6f9f'
    if (!model.value.uiOptions.unlockedBadgeBgStart) model.value.uiOptions.unlockedBadgeBgStart = '#ffecf0'
    if (!model.value.uiOptions.unlockedBadgeBgEnd) model.value.uiOptions.unlockedBadgeBgEnd = '#f7cbd8'
  }
}

ensureUiOptions()
watch(() => model.value.uiOptions, () => ensureUiOptions(), { deep: true })
// 监听徽章渐变颜色变化，自动拼接CSS
watch(
  () => [model.value.uiOptions?.usingBadgeBgStart, model.value.uiOptions?.usingBadgeBgEnd],
  () => updateBadgeGradient('using')
)
watch(
  () => [model.value.uiOptions?.unlockedBadgeBgStart, model.value.uiOptions?.unlockedBadgeBgEnd],
  () => updateBadgeGradient('unlocked')
)

// 主题编辑
const themeModalVisible = ref(false)
const editingTheme = ref<any>(null)
const editingThemeIndex = ref(-1)
const isNewTheme = ref(false)

// 文件选择器
const fileSelectorVisible = ref(false)
const fileSelectorTitle = ref('选择文件')
const currentFileField = ref('')
const currentAvatarRecord = ref<any>(null)
const currentPreviewImageIndex = ref<number>(-1)
const currentTabIconTab = ref<string>('')
const currentTabIconState = ref<string>('')

// 颜色选择器状态
const colorPickerVisible = ref<Record<string, boolean>>({})
const themeColorPicker = ref({
  period: false,
  predicted: false,
  ovulation: false,
  ovulationDay: false,
  selected: false
})
const themeBgColorPicker = ref({
  calendarBg: false,
  mineBgColor: false,
  headerBgColor: false,
  aiChatBgColor: false,
  recordBorderColor: false
})
const tabbarBgColorPicker = ref({
  home: false,
  find: false,
  aiChat: false,
  mine: false
})

// UI展示配置颜色选择器状态
const uiColorPicker = ref<Record<string, boolean>>({
  pointsTextColor: false,
  pointsBgColor: false,
  unlockButtonBgColor: false,
  usingBadgeTextColor: false,
  unlockedBadgeTextColor: false,
  usingBadgeBgStart: false,
  usingBadgeBgEnd: false,
  unlockedBadgeBgStart: false,
  unlockedBadgeBgEnd: false
})

interface ColorObj { hex: string }

// 更新颜色选择器显示状态
const updateColorPickerVisible = (key: string, visible: boolean) => {
  colorPickerVisible.value[key] = visible
}

// 颜色配置取色回调
const onPickColorOption = (c: ColorObj, config: any, optionIndex: number) => {
  if (/^#[0-9A-Fa-f]{6}$/.test(c.hex)) {
    config.colors[optionIndex].value = c.hex
  }
}

// 主题颜色取色回调
const onPickThemeColor = (c: ColorObj, colorKey: string) => {
  if (/^#[0-9A-Fa-f]{6}$/.test(c.hex) && editingTheme.value) {
    editingTheme.value.colors[colorKey] = c.hex
  }
}

// 主题背景色取色回调
const onPickThemeBgColor = (c: ColorObj, bgKey: string) => {
  if (/^#[0-9A-Fa-f]{6}$/.test(c.hex) && editingTheme.value) {
    editingTheme.value[bgKey] = c.hex
  }
}

// 导航栏背景色取色回调
const onPickTabbarBgColor = (c: ColorObj, tabKey: string) => {
  if (/^#[0-9A-Fa-f]{6}$/.test(c.hex) && editingTheme.value) {
    editingTheme.value.tabbarBgColor[tabKey] = c.hex
  }
}

// UI展示配置取色回调
const onPickUiColor = (c: ColorObj, key: string) => {
  if (/^#[0-9A-Fa-f]{6}$/.test(c.hex)) {
    if (!model.value.uiOptions) model.value.uiOptions = {}
    model.value.uiOptions[key] = c.hex
  }
}

// 根据起止色更新徽章背景CSS
const updateBadgeGradient = (type: 'using' | 'unlocked') => {
  if (!model.value.uiOptions) return
  if (type === 'using') {
    const start = model.value.uiOptions.usingBadgeBgStart || '#ff8fae'
    const end = model.value.uiOptions.usingBadgeBgEnd || '#ff6f9f'
    model.value.uiOptions.usingBadgeBg = `linear-gradient(102deg, ${start} 10%, ${end} 90%)`
  } else {
    const start = model.value.uiOptions.unlockedBadgeBgStart || '#ffecf0'
    const end = model.value.uiOptions.unlockedBadgeBgEnd || '#f7cbd8'
    model.value.uiOptions.unlockedBadgeBg = `linear-gradient(102deg, ${start} 11%, ${end})`
  }
}

// 新增主题
const addTheme = () => {
  isNewTheme.value = true
  editingThemeIndex.value = -1
  editingTheme.value = {
    id: '',
    name: '',
    description: '',
    accessType: 'free',
    isDefault: false,
    unlockPrice: 0,
    sortOrder: model.value.themes.length,
    homeBgImage: '',
    mineBgImage: '',
    images: [],
    colors: {
      period: '#FF8FAE',
      predicted: '#FCBED5',
      ovulation: '#B09CFF',
      ovulationDay: '#FFC400',
      selected: '#FF8FAE'
    },
    tabbarBgColor: {
      home: '#fff',
      find: '#fff',
      aiChat: '#fff',
      mine: '#fff'
    },
    calendarBg: '#fff',
    recordBorderColor: '#fcbed5',
    mineBgColor: '#F5F5F5',
    headerBgColor: '#fff',
    aiChatBgColor: '#ffecf3',
    tabIcons: {
      home: { normal: '', active: '' },
      find: { normal: '', active: '' },
      aiChat: { normal: '', active: '' },
      mine: { normal: '', active: '' }
    },
    ovulationDayIcon: 'https://images.lvtu1120.cn/images/calendar_star.png'
  }
  themeModalVisible.value = true
}

// 编辑主题
const editTheme = (record: any) => {
  isNewTheme.value = false
  editingThemeIndex.value = model.value.themes.findIndex((t: any) => t.id === record.id)
  editingTheme.value = deepClone(record)
  themeModalVisible.value = true
}

// 保存主题编辑
const saveThemeEdit = () => {
  if (!editingTheme.value.id || !editingTheme.value.name) {
    Message.warning('请填写主题ID和名称')
    return
  }

  if (isNewTheme.value) {
    // 检查ID是否重复
    const exists = model.value.themes.some((t: any) => t.id === editingTheme.value.id)
    if (exists) {
      Message.warning('主题ID已存在')
      return
    }
    model.value.themes.push(deepClone(editingTheme.value))
  } else {
    model.value.themes[editingThemeIndex.value] = deepClone(editingTheme.value)
  }

  themeModalVisible.value = false
  Message.success('保存成功')
}

// 取消主题编辑
const cancelThemeEdit = () => {
  themeModalVisible.value = false
  editingTheme.value = null
}

// 删除主题
const deleteTheme = (index: number) => {
  model.value.themes.splice(index, 1)
  Message.success('删除成功')
}

// 新增头像
const addAvatar = () => {
  model.value.avatars.push({
    id: 'avatar-' + Date.now(),
    avatarPath: '',
    name: '',
    unlockPrice: 20,
    accessType: 'paid'
  })
}

// 删除头像
const deleteAvatar = (index: number) => {
  model.value.avatars.splice(index, 1)
  Message.success('删除成功')
}

// 选择头像图片
const selectAvatarImage = (record: any) => {
  currentAvatarRecord.value = record
  currentFileField.value = 'avatar'
  fileSelectorTitle.value = '选择头像图片'
  fileSelectorVisible.value = true
}

// 添加预览图
const addPreviewImage = () => {
  currentPreviewImageIndex.value = -1
  currentFileField.value = 'previewImage'
  fileSelectorTitle.value = '选择主题预览图'
  fileSelectorVisible.value = true
}

// 编辑预览图
const editPreviewImage = (index: number) => {
  currentPreviewImageIndex.value = index
  currentFileField.value = 'previewImage'
  fileSelectorTitle.value = '选择主题预览图'
  fileSelectorVisible.value = true
}

// 删除预览图
const deletePreviewImage = (index: number) => {
  if (editingTheme.value && editingTheme.value.images) {
    editingTheme.value.images.splice(index, 1)
  }
}

// 选择主题图片
const selectThemeImage = (field: string) => {
  currentFileField.value = field
  fileSelectorTitle.value = '选择主题图片'
  fileSelectorVisible.value = true
}

// 选择UI积分图标
const selectUiPointsIcon = () => {
  currentFileField.value = 'ui.pointsIconUrl'
  fileSelectorTitle.value = '选择积分图标'
  fileSelectorVisible.value = true
}

// 选择导航图标
const selectTabIcon = (tab: string, state: string) => {
  currentTabIconTab.value = tab
  currentTabIconState.value = state
  currentFileField.value = 'tabIcon'
  fileSelectorTitle.value = `选择${tab === 'home' ? '首页' : tab === 'find' ? '发现页' : tab === 'aiChat' ? 'AI聊天' : '我的页'}${state === 'normal' ? '未选中' : '选中'}图标`
  fileSelectorVisible.value = true
}

// 文件选择回调
const onFileSelected = (fileInfo: FileItem | FileItem[]) => {
  const file = Array.isArray(fileInfo) ? fileInfo[0] : fileInfo
  if (file && (file as any).url) {
    const url = (file as any).url

    if (currentFileField.value === 'avatar' && currentAvatarRecord.value) {
      // 头像图片
      currentAvatarRecord.value.avatarPath = url
    } else if (currentFileField.value === 'previewImage' && editingTheme.value) {
      // 主题预览图
      if (currentPreviewImageIndex.value >= 0) {
        // 编辑已有预览图
        editingTheme.value.images[currentPreviewImageIndex.value] = url
      } else {
        // 添加新预览图
        if (!editingTheme.value.images) {
          editingTheme.value.images = []
        }
        editingTheme.value.images.push(url)
      }
    } else if (currentFileField.value === 'tabIcon' && editingTheme.value) {
      // 导航图标
      if (!editingTheme.value.tabIcons) {
        editingTheme.value.tabIcons = {
          home: { normal: '', active: '' },
          find: { normal: '', active: '' },
          aiChat: { normal: '', active: '' },
          mine: { normal: '', active: '' }
        }
      }
      if (!editingTheme.value.tabIcons[currentTabIconTab.value]) {
        editingTheme.value.tabIcons[currentTabIconTab.value] = { normal: '', active: '' }
      }
      editingTheme.value.tabIcons[currentTabIconTab.value][currentTabIconState.value] = url
    } else if (currentFileField.value === 'ui.pointsIconUrl') {
      if (!model.value.uiOptions) model.value.uiOptions = {}
      model.value.uiOptions.pointsIconUrl = url
    } else if (editingTheme.value && currentFileField.value) {
      // 其他主题图片字段
      editingTheme.value[currentFileField.value] = url
    }
  }
  fileSelectorVisible.value = false
}

// 新增颜色选项
const addColorOption = (configIndex: number) => {
  model.value.colorConfigs[configIndex].colors.push({
    value: '#FFFFFF',
    label: '新颜色'
  })
}

// 删除颜色选项
const deleteColorOption = (configIndex: number, colorIndex: number) => {
  model.value.colorConfigs[configIndex].colors.splice(colorIndex, 1)
}
</script>

<style scoped>
.lbl {
  color: var(--color-text-2);
  min-width: 80px;
  display: inline-block;
}

.color-option-item {
  display: inline-flex;
  align-items: center;
  padding: 4px 8px;
  border: 1px solid var(--color-border);
  border-radius: 4px;
  margin: 4px;
}

.color-preview {
  width: 32px;
  height: 32px;
  border-radius: 4px;
  border: 1px solid var(--color-border);
  margin-right: 8px;
}

.preview-image-item {
  position: relative;
  display: inline-block;
  border: 1px solid var(--color-border);
  border-radius: 4px;
  overflow: hidden;
}

.preview-image-actions {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  display: flex;
  justify-content: space-around;
  align-items: center;
  background-color: rgba(0, 0, 0, 0.6);
  padding: 4px;
}

.preview-image-item:hover .preview-image-actions {
  opacity: 1;
}

/* UI配置区域样式 */
.ui-config-section {
  background: var(--color-fill-1);
}

.ui-config-section .section-title {
  font-weight: 600;
  font-size: 14px;
  color: var(--color-text-1);
  margin-right: 8px;
}

.ui-config-section .section-desc {
  font-size: 12px;
  color: var(--color-text-3);
  font-weight: normal;
}

/* 积分价格预览 */
.price-preview-wrapper {
  display: flex;
  align-items: center;
  gap: 12px;
}

.price-pill-preview {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 4px 12px;
  border-radius: 20px;
  font-size: 13px;
  font-weight: 500;
}

.price-pill-preview .preview-icon {
  width: 18px;
  height: 18px;
  object-fit: contain;
}

.price-pill-preview .preview-icon-placeholder {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 18px;
  height: 18px;
  background: #ccc;
  border-radius: 2px;
  font-size: 10px;
  color: #fff;
}

.preview-hint {
  font-size: 12px;
  color: var(--color-text-3);
}

/* 徽章预览 */
.badge-preview-wrapper {
  display: flex;
  align-items: center;
  gap: 12px;
}

.badge-preview {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 4px 16px;
  border-radius: 0 0 12px 0;
  font-size: 12px;
  font-weight: 500;
  min-width: 60px;
}

/* 按钮预览 */
.button-preview-wrapper {
  display: flex;
  align-items: center;
  gap: 12px;
  flex-wrap: wrap;
}

.button-preview {
  padding: 8px 24px;
  border-radius: 20px;
  border: none;
  font-size: 14px;
  font-weight: 500;
  cursor: default;
  display: inline-flex;
  align-items: center;
  gap: 4px;
}

.button-preview.unlock-button {
  color: #333;
}

.button-preview.vip-button {
  background: linear-gradient(135deg, #ffd700 0%, #ffed4e 100%);
  color: #333;
}

.button-preview.apply-button {
  background: #165dff;
  color: #fff;
}

.button-preview.applied-state {
  background: #e8e8e8;
  color: #999;
  cursor: not-allowed;
}

.button-preview .button-icon {
  width: 16px;
  height: 16px;
  object-fit: contain;
}
</style>
