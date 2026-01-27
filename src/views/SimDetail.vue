<template>
  <div class="sim-detail-page" v-if="sim">
    <!-- 顶部导航栏 -->
      <van-nav-bar title="SIM Details" fixed left-arrow @click-left="$router.back()"
      :style="{ backgroundColor: themeConfig.primary, color: '#fff' }" />

    <!-- SIM 卡片 -->
    <div class="detail-content">
      <!-- 状态卡片 -->
      <div class="status-card">
        <div class="card-content">
          <div class="iccid-row">
            <div class="iccid-title">{{ sim.iccid }}</div>
          </div>
          <div class="tags-row">
            <van-tag :class="['payment-tag', sim.paymentType === 'prepaid' ? 'payment-prepaid' : 'payment-postpaid']"
              size="small">
              {{ sim.paymentType === 'prepaid' ? 'Prepaid' : 'Postpaid' }}
            </van-tag>
            <van-tag :type="getStatusType(sim.status)" size="small" :data-status="sim.status" class="status-tag">
              {{ sim.statusText }}
            </van-tag>
          </div>
        </div>
      </div>

      <!-- 基本信息 -->
      <van-cell-group title="Basic Information" class="info-group">
        <van-cell title="ICCID" :value="sim.iccid" class="iccid-cell" />
        <van-cell title="IMEI" :value="sim.imei" />
        <van-cell title="MSISDN" :value="sim.msisdn" />
        <van-cell title="Operator" :value="sim.operator" />
        <van-cell title="Location" :value="sim.location" />
        <van-cell title="Plan" :value="sim.plan" />
      </van-cell-group>

      <!-- 使用情况 -->
      <van-cell-group title="Usage" class="info-group">
        <van-cell title="Cycle Usage">
          <template #value>
            <span class="usage-highlight">
              {{ formatUsage(sim.cycleUsage) }} {{ sim.cycleUsageUnit }}
            </span>
          </template>
        </van-cell>
        <van-cell title="Data Limit">
          <template #value>
            {{ sim.dataLimit }} {{ sim.dataLimitUnit }}
          </template>
        </van-cell>
        <van-cell title="Voice Limit">
          <template #value>
            {{ sim.voiceLimit }} {{ sim.voiceLimitUnit }}
          </template>
        </van-cell>
        <van-cell title="SMS Limit">
          <template #value>
            {{ sim.smsLimit }}
          </template>
        </van-cell>
      </van-cell-group>

      <!-- 日期信息 -->
      <van-cell-group title="Dates" class="info-group">
        <van-cell title="Activation Date" :value="sim.activationDate" />
        <van-cell title="Expiry Date" :value="sim.expiryDate" />
      </van-cell-group>

      <!-- 网络配置 -->
      <van-cell-group title="Network Configuration" class="info-group">
        <van-cell title="APN" :value="sim.apn" />
      </van-cell-group>

      <!-- 使用进度条 -->
      <div class="progress-section">
        <div class="progress-header">
          <span>Data Usage Progress</span>
          <span class="progress-text">
            {{ formatUsage(sim.cycleUsage) }} / {{ sim.dataLimit }} {{ sim.dataLimitUnit }}
          </span>
        </div>
        <div class="usage-progress-wrapper">
          <div class="usage-progress-bar"
            :style="{ width: getUsagePercentage() + '%', backgroundColor: getProgressColor() }">
          </div>
        </div>
      </div>

      <!-- Pause/Resume Switch (仅对 active 状态显示) -->
      <div v-if="sim.status === 'active' || sim.status === 'paused'" class="switch-section">
        <div class="switch-card">
          <div class="switch-content">
            <div class="switch-label">
              <span class="switch-title">{{ sim.status === 'active' ? 'Active' : 'Paused' }}</span>
              <span class="switch-desc">{{ sim.status === 'active' ? 'Tap to pause the SIM' : 'Tap to resume the SIM' }}</span>
            </div>
            <van-switch 
              :model-value="switchValue"
              :loading="switchLoading"
              :disabled="switchLoading"
              size="24px"
              @update:model-value="handleSwitchChange"
            />
          </div>
        </div>
      </div>

      <!-- 操作按钮 -->
      <div class="action-buttons">
        <van-button type="primary" block round icon="replay" @click="handleRefresh">
          Refresh SIM
        </van-button>
        <van-button type="default" block round icon="chat-o" style="margin-top: 12px;" @click="handleViewSMS">
          View SMS
        </van-button>
        <van-button type="default" block round icon="envelop-o" style="margin-top: 12px;" @click="handleSendSMS">
          Send SMS
        </van-button>
      </div>
    </div>
    
    <!-- Sticky Activate Button (仅当状态为 pre-activated 时显示) -->
    <div v-if="sim.status === 'pre-activated'" class="sticky-activate-button">
      <van-button type="primary" block round icon="success" @click="handleActivate">
        Activate
      </van-button>
    </div>

    <!-- 发送 SMS 底部抽屉 -->
    <van-popup v-model:show="showSendSmsSheet" position="bottom" :style="{ height: '50%' }" round>
      <div class="send-sms-sheet">
        <div class="sheet-header">
          <span class="sheet-title">Send SMS</span>
          <van-icon name="cross" class="close-icon" @click="showSendSmsSheet = false" />
        </div>
        <div class="sheet-content">
          <div class="sms-input-section">
            <div class="input-label">Message Content</div>
            <van-field
              v-model="smsContent"
              type="textarea"
              rows="3"
              placeholder="Enter your message here..."
              maxlength="140"
              show-word-limit
              class="sms-textarea"
            />
          </div>
        </div>
        <div class="sheet-footer">
          <van-button 
            type="primary" 
            block 
            round 
            :loading="sendingSms"
            @click="handleSendSmsSubmit"
          >
            Send
          </van-button>
        </div>
      </div>
    </van-popup>
  </div>
  <van-empty v-else description="SIM not found" />
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { getSimById, getSimByIccid } from '@/mock.js'
import { showToast, showConfirmDialog } from 'vant'
import themeConfig from '@/config/theme.js'

const route = useRoute()
const router = useRouter()
const sim = ref(null)
const switchLoading = ref(false)
const showSendSmsSheet = ref(false)
const smsContent = ref('')
const sendingSms = ref(false)

// Switch 的值：true = active, false = paused
const switchValue = computed(() => sim.value?.status === 'active')

onMounted(() => {
  // 从 query 参数中读取 ICCID
  const iccid = route.query.iccid
  
  if (iccid) {
    sim.value = getSimByIccid(iccid)
  }
  
  if (!sim.value) {
    showToast('SIM card not found')
    setTimeout(() => {
      router.back()
    }, 1500)
  }
})

// 获取状态类型
const getStatusType = (status) => {
  const statusMap = {
    'active': 'success',
    'pre-activated': 'primary',
    'suspended': 'warning',
    'expired': 'danger',
    'paused': 'warning'
  }
  return statusMap[status] || 'default'
}

// 格式化使用量
const formatUsage = (usage) => {
  if (usage >= 1024) {
    return (usage / 1024).toFixed(2) + 'GB'
  }
  return usage.toFixed(2)
}

// 获取使用百分比
const getUsagePercentage = () => {
  if (!sim.value || sim.value.dataLimit === 0) return 0
  const percentage = (sim.value.cycleUsage / sim.value.dataLimit) * 100
  return Math.min(percentage, 100)
}

// 获取进度条颜色
const getProgressColor = () => {
  const percentage = getUsagePercentage()
  if (percentage >= 90) return '#ee0a24'
  if (percentage >= 70) return '#ff976a'
  return themeConfig.primary
}

// 刷新状态
const handleRefresh = async () => {
  try {
    await showConfirmDialog({
      title: 'Refresh SIM',
      message: 'SIM service will be switched off and on again. It may incure service disruption. Are you sure to proceed.',
      confirmButtonText: 'Confirm',
      cancelButtonText: 'Cancel'
    })
    showToast({
      type: 'success',
      message: 'SIM refresh request sent successfully!'
    })
    // 这里可以添加实际的刷新逻辑
  } catch {
    // 用户取消
  }
}

// 查看短信
const handleViewSMS = () => {
  // 使用 iccid 作为 query 参数来显示对话模式
  if (sim.value) {
    router.push({
      path: '/sim-sms',
      query: { iccid: sim.value.iccid }
    })
  }
}

// 发送短信 - 打开底部抽屉
const handleSendSMS = () => {
  smsContent.value = ''
  showSendSmsSheet.value = true
}

// 提交发送短信
const handleSendSmsSubmit = async () => {
  if (!smsContent.value.trim()) {
    showToast({
      type: 'fail',
      message: 'Please enter message content'
    })
    return
  }

  sendingSms.value = true

  // 模拟发送延迟
  await new Promise(resolve => setTimeout(resolve, 1500))

  // 模拟成功或失败（90% 成功率）
  const success = Math.random() > 0.1

  sendingSms.value = false
  showSendSmsSheet.value = false

  if (success) {
    showToast({
      type: 'success',
      message: 'SMS sent successfully!'
    })
    smsContent.value = ''
  } else {
    showToast({
      type: 'fail',
      message: 'Failed to send SMS. Please try again.'
    })
  }
}

// 激活 SIM 卡
const handleActivate = async () => {
  if (!sim.value) return
  
  try {
    await showConfirmDialog({
      title: 'Activate Plan',
      message: `This will activate the plan "${sim.value.plan}". Billing will start after success. Are you sure?`,
      confirmButtonText: 'Confirm',
      cancelButtonText: 'Cancel'
    })
    // 这里可以添加实际的激活逻辑
    showToast({
      type: 'success',
      message: 'SIM activation request sent successfully!'
    })
    // 可选：更新状态
    // sim.value.status = 'active'
    // sim.value.statusText = 'Active'
  } catch {
    // 用户取消
  }
}

// 处理 Switch 切换
const handleSwitchChange = async (value) => {
  if (!sim.value) return
  
  // 显示 loading（在 switch 按钮上）
  switchLoading.value = true
  
  // 模拟 API 请求延迟
  await new Promise(resolve => setTimeout(resolve, 1500))
  
  // 更新状态
  if (value) {
    // 打开：变为 Active
    sim.value.status = 'active'
    sim.value.statusText = 'Active'
    showToast({
      type: 'success',
      message: 'SIM resumed successfully!'
    })
  } else {
    // 关闭：变为 Paused
    sim.value.status = 'paused'
    sim.value.statusText = 'Paused'
    showToast({
      type: 'success',
      message: 'SIM paused successfully!'
    })
  }
  
  // 关闭 loading
  switchLoading.value = false
}
</script>

<style scoped>
.sim-detail-page {
  padding-top: 46px;
  padding-bottom: 20px;
  min-height: 100vh;
  background-color: var(--cube-background);
  position: relative;
  padding-bottom: 80px; /* 为底部按钮留出空间 */
}

.detail-content {
  padding: 16px;
  padding-top: 0;
}

.status-card {
  background: rgba(255, 255, 255, 0.2);
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
  border: 1px solid var(--cube-primary-color);
  border-radius: 12px;
  margin-bottom: 16px;
  margin-top: 16px;
  overflow: hidden;
  box-shadow: 0 2px 8px var(--cube-primary-rgba-shadow);
  position: sticky;
  top: 62px;
  z-index: 1;
}

.card-content {
  padding: 16px;
}

.iccid-row {
  margin-bottom: 12px;
}

.tags-row {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
}

.iccid-title {
  font-size: 20px;
  font-weight: 600;
  color: var(--cube-text-primary);
  flex: 1;
}

/* 支付类型标签样式 */
.payment-tag {
  border-radius: 12px !important;
  font-weight: 400;
  padding: 2px 8px;
  border: none !important;
}

:deep(.payment-prepaid) {
  background-color: var(--cube-primary-rgba-light) !important;
  color: var(--cube-primary-color) !important;
}

:deep(.payment-postpaid) {
  background-color: rgba(100, 101, 102, 0.1) !important;
  color: #646566 !important;
}

/* 状态标签样式 */
.status-tag {
  border-radius: 12px !important;
  font-weight: 400;
  padding: 2px 8px;
  border: none !important;
}

/* 状态标签透明背景样式 */
:deep(.status-tag.van-tag--success) {
  background-color: rgba(7, 193, 96, 0.15) !important;
  color: rgba(7, 193, 96, 0.9) !important;
}

:deep(.status-tag.van-tag--primary) {
  background-color: var(--cube-primary-rgba-medium) !important;
  color: rgba(234, 24, 69, 0.9) !important;
}

:deep(.status-tag.van-tag--warning) {
  background-color: rgba(255, 193, 7, 0.15) !important;
  color: rgba(255, 193, 7, 0.9) !important;
}

:deep(.status-tag.van-tag--danger) {
  background-color: rgba(238, 10, 36, 0.15) !important;
  color: rgba(238, 10, 36, 0.9) !important;
}

/* pre-activated 状态使用浅蓝色 */
:deep(.status-tag[data-status="pre-activated"]) {
  background-color: rgba(100, 181, 246, 0.15) !important;
  color: rgba(100, 181, 246, 0.9) !important;
}

/* paused 状态使用警告色 */
:deep(.status-tag[data-status="paused"]) {
  background-color: rgba(255, 193, 7, 0.15) !important;
  color: rgba(255, 193, 7, 0.9) !important;
}


.info-group {
  margin-bottom: 16px;
  border-radius: 8px;
  overflow: hidden;
}

:deep(.info-group .van-cell-group__title) {
  font-size: 18px;
  font-weight: 600;
  color: var(--cube-text-primary);
  padding: 12px 16px;
  background-color: #fff;
}

/* 调整详情页正文字体颜色，让它们更浅 */
:deep(.info-group .van-cell__value) {
  color: #646566;
}

:deep(.info-group .van-cell__title) {
  color: #646566;
}

/* ICCID 值确保不折行 */
:deep(.iccid-cell .van-cell__value) {
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  flex: 1;
  text-align: right;
}

.usage-highlight {
  color: #646566;
  font-weight: 600;
  font-size: 18px;
}

.progress-section {
  background-color: #fff;
  padding: 16px;
  border-radius: 8px;
  margin-bottom: 16px;
}

.progress-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
  font-size: 16px;
  color: #646566;
}

.progress-text {
  color: var(--cube-text-secondary);
  font-size: 14px;
}

.usage-progress-wrapper {
  width: 100%;
  height: 6px;
  background-color: #ebedf0;
  border-radius: 3px;
  overflow: hidden;
  margin-top: 6px;
  position: relative;
}

.usage-progress-bar {
  height: 100%;
  border-radius: 3px;
  transition: width 0.3s ease, background-color 0.3s ease;
  position: relative;
}

.usage-progress-bar::after {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(90deg, transparent 0%, rgba(255, 255, 255, 0.2) 50%, transparent 100%);
  animation: shimmer 2s infinite;
}

@keyframes shimmer {
  0% {
    transform: translateX(-100%);
  }

  100% {
    transform: translateX(100%);
  }
}

.switch-section {
  margin-bottom: 16px;
}

.switch-card {
  background-color: #fff;
  border-radius: 8px;
  padding: 16px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
}

.switch-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.switch-label {
  display: flex;
  flex-direction: column;
  gap: 4px;
  flex: 1;
}

.switch-title {
  font-size: 16px;
  font-weight: 600;
  color: var(--cube-text-primary);
}

.switch-desc {
  font-size: 14px;
  color: var(--cube-text-secondary);
}

:deep(.van-switch--on) {
  background-color: var(--cube-primary-color);
}

:deep(.van-switch--on:active) {
  background-color: var(--cube-primary-dark);
}

.action-buttons {
  margin-top: 24px;
  padding: 0 16px;
  position: relative;
  z-index: 2;
}

:deep(.van-nav-bar) {
  background-color: var(--cube-primary-color);
  border-bottom-left-radius: 16px;
  border-bottom-right-radius: 16px;
  overflow: hidden;
}

:deep(.van-nav-bar__title) {
  color: #fff;
}

:deep(.van-nav-bar__arrow),
:deep(.van-nav-bar__arrow::before) {
  color: #fff !important;
  border-color: #fff !important;
}

:deep(.van-button--primary) {
  background-color: var(--cube-primary-color);
  border-color: var(--cube-primary-color);
}

/* 当 gradient 启用时，使用渐变背景 */
:root[data-gradient-enabled="true"] :deep(.van-button--primary) {
  background: linear-gradient(135deg, var(--cube-gradient-start) 0%, var(--cube-gradient-end) 100%) !important;
  background-color: transparent !important;
  border-color: transparent !important;
}

:deep(.van-button--primary:active) {
  background-color: var(--cube-primary-dark);
  border-color: var(--cube-primary-dark);
}

:root[data-gradient-enabled="true"] :deep(.van-button--primary:active) {
  opacity: 0.9;
  filter: brightness(0.95);
  background: linear-gradient(135deg, var(--cube-gradient-start) 0%, var(--cube-gradient-end) 100%) !important;
  background-color: transparent !important;
}

/* Sticky Activate Button */
.sticky-activate-button {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  padding: 12px 16px;
  background-color: #fff;
  box-shadow: 0 -2px 10px rgba(0, 0, 0, 0.1);
  z-index: 100;
  border-top: 1px solid var(--cube-border-color);
}

/* 发送 SMS 底部抽屉样式 */
.send-sms-sheet {
  display: flex;
  flex-direction: column;
  height: 100%;
}

.sheet-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px;
  border-bottom: 1px solid #ebedf0;
}

.sheet-title {
  font-size: 18px;
  font-weight: 600;
  color: var(--cube-text-primary);
}

.close-icon {
  font-size: 20px;
  color: var(--cube-text-secondary);
  cursor: pointer;
}

.close-icon:active {
  opacity: 0.7;
}

.sheet-content {
  flex: 1;
  overflow-y: auto;
  padding: 16px;
}

.sms-input-section {
  width: 100%;
}

.input-label {
  font-size: 14px;
  color: var(--cube-text-secondary);
  margin-bottom: 8px;
  font-weight: 500;
}

.sms-textarea {
  background-color: #f7f8fa;
  border-radius: 8px;
  padding: 12px;
}

:deep(.sms-textarea .van-field__control) {
  background-color: transparent;
  font-size: 16px;
  line-height: 1.5;
}

:deep(.sms-textarea .van-field__word-limit) {
  color: var(--cube-text-secondary);
  font-size: 12px;
}

.sheet-footer {
  padding: 16px;
  border-top: 1px solid #ebedf0;
}
</style>
