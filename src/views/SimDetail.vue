<template>
  <div class="sim-detail-page" v-if="sim">
    <!-- 顶部导航栏 -->
    <van-nav-bar title="SIM Details" fixed left-arrow @click-left="$router.back()"
      :style="{ backgroundColor: '#ea1845', color: '#fff' }" />

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
  </div>
  <van-empty v-else description="SIM not found" />
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { getSimById } from '@/mock.js'
import { showToast, showConfirmDialog } from 'vant'

const route = useRoute()
const router = useRouter()
const sim = ref(null)

onMounted(() => {
  const id = route.params.id
  sim.value = getSimById(id)
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
    'expired': 'danger'
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
  return '#ea1845'
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
  router.push(`/sim-sms/${route.params.id}`)
}

// 发送短信
const handleSendSMS = () => {
  showToast('SMS feature coming soon')
}
</script>

<style scoped>
.sim-detail-page {
  padding-top: 46px;
  padding-bottom: 20px;
  min-height: 100vh;
  background-color: #f7f8fa;
}

.detail-content {
  padding: 16px;
  padding-top: 0;
}

.status-card {
  background: rgba(255, 255, 255, 0.2);
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
  border: 1px solid #ea1845;
  border-radius: 12px;
  margin-bottom: 16px;
  margin-top: 16px;
  overflow: hidden;
  box-shadow: 0 2px 8px rgba(234, 24, 69, 0.1);
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
  color: #323233;
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
  background-color: rgba(234, 24, 69, 0.1) !important;
  color: #ea1845 !important;
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
  background-color: rgba(234, 24, 69, 0.15) !important;
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


.info-group {
  margin-bottom: 16px;
  border-radius: 8px;
  overflow: hidden;
}

:deep(.info-group .van-cell-group__title) {
  font-size: 18px;
  font-weight: 600;
  color: #323233;
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
  color: #969799;
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

.action-buttons {
  margin-top: 24px;
  padding: 0 16px;
  position: relative;
  z-index: 2;
}

:deep(.van-nav-bar) {
  background-color: #ea1845;
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
  background-color: #ea1845;
  border-color: #ea1845;
}

:deep(.van-button--primary:active) {
  background-color: #c4123a;
  border-color: #c4123a;
}
</style>
