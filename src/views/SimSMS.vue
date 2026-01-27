<template>
  <div class="sms-list-page">
    <!-- 对话模式 -->
    <div v-if="isConversationMode" class="conversation-page">
      <!-- 顶部导航栏 -->
      <van-nav-bar :title="simInfo ? simInfo.iccid : 'SMS Conversation'" fixed left-arrow @click-left="$router.back()"
        :style="{ backgroundColor: themeConfig.primary, color: '#fff' }" />

      <!-- 消息列表 -->
      <div class="messages-container">
        <div v-for="message in messages" :key="message.id" 
          :class="['message-item', message.type === 'sent' ? 'message-sent' : 'message-received']">
          <div class="message-bubble">
            <div class="message-content">{{ message.content }}</div>
            <div class="message-time">{{ formatMessageTime(message.timestamp) }}</div>
          </div>
        </div>
      </div>

      <!-- 发送消息输入框 -->
      <div class="message-input-section">
        <van-field
          v-model="newMessage"
          type="textarea"
          rows="2"
          placeholder="Type a message..."
          maxlength="140"
          show-word-limit
          class="message-input"
        />
        <van-button 
          type="primary" 
          round 
          :disabled="!newMessage.trim() || sendingMessage"
          :loading="sendingMessage"
          @click="sendMessage"
          class="send-button"
        >
          Send
        </van-button>
      </div>
    </div>

    <!-- 列表模式 -->
    <div v-else>
      <!-- 顶部导航栏 -->
      <div class="custom-banner">
        <div class="banner-content">
          <div class="logo-container">
            <img v-if="logoExists" :src="logoImg" alt="Logo" class="logo-img" />
            <span v-if="themeConfig.brandName" class="brand-text">{{ themeConfig.brandName }}</span>
          </div>
          <div class="banner-right">
            <div class="page-title">SMS</div>
          </div>
        </div>
      </div>

      <!-- 搜索栏和时间段选择 -->
      <div class="search-section">
        <div class="search-wrapper">
          <van-search v-model="searchIccid" placeholder="Search ICCID" shape="round" @search="handleSearch"
            @clear="handleClear" />
        </div>
      </div>

      <!-- 时间段选择器 -->
      <div class="time-range-section">
        <van-tabs v-model:active="activeTimeRange" @change="handleTimeRangeChange" line-width="60px">
          <van-tab title="Today" name="today"></van-tab>
          <van-tab title="Last 3 Days" name="last3days"></van-tab>
          <van-tab title="Last 30 Days" name="last30days"></van-tab>
        </van-tabs>
      </div>

      <!-- SMS 列表 -->
      <div class="list-section">
        <van-pull-refresh v-model="refreshing" @refresh="onRefresh" loading-text="Loading...">
          <van-list v-model:loading="loading" :finished="finished" finished-text="No more data" loading-text="Loading..."
            @load="onLoad">
            <van-cell v-for="sms in displayList" :key="sms.id" is-link @click="showDetail(sms)" class="sms-item">
              <template #title>
                <div class="sms-item-header">
                  <div class="sms-iccid-wrapper">
                    <div class="sms-iccid">{{ sms.iccid }}</div>
                    <div class="copy-icon-overlay" @click.stop="copyIccid(sms.iccid)">
                      <div class="copy-box-back"></div>
                      <div class="copy-box-front"></div>
                    </div>
                  </div>
                </div>
              </template>
              <template #label>
                <div class="sms-item-content">
                  <div class="sms-msisdn-row">
                    <span class="msisdn-label">MSISDN:</span>
                    <span class="msisdn-value">{{ sms.msisdn || 'N/A' }}</span>
                  </div>
                  <div class="sms-info-row">
                    <div class="sms-status">
                      <van-tag :type="sms.status === 'success' ? 'success' : 'danger'" size="small" class="status-tag">
                        {{ sms.status === 'success' ? 'Success' : 'Failed' }}
                      </van-tag>
                      <van-tag v-if="sms.replies && sms.replies.length > 0" type="primary" size="small" class="reply-tag">
                        Has Reply
                      </van-tag>
                    </div>
                    <div class="sms-time">{{ formatTime(sms.timestamp) }}</div>
                  </div>
                </div>
              </template>
              <template #right-icon>
                <van-icon name="arrow" />
              </template>
            </van-cell>
          </van-list>
        </van-pull-refresh>
      </div>
    </div>

    <!-- 详情弹窗 -->
    <van-popup v-model:show="showDetailPopup" position="bottom" :style="{ height: '60%' }" round>
      <div class="detail-panel">
        <div class="detail-header">
          <span class="detail-title">SMS Details</span>
          <van-icon name="cross" class="close-icon" @click="showDetailPopup = false" />
        </div>
        <div class="detail-content" v-if="selectedSms">
          <div class="detail-section">
            <div class="detail-label">ICCID</div>
            <div class="detail-value">{{ selectedSms.iccid }}</div>
          </div>
          <div class="detail-section">
            <div class="detail-label">MSISDN</div>
            <div class="detail-value">{{ selectedSms.msisdn || 'N/A' }}</div>
          </div>
          <div class="detail-section">
            <div class="detail-label">Status</div>
            <div class="detail-value">
              <van-tag :type="selectedSms.status === 'success' ? 'success' : 'danger'" size="small" class="status-tag">
                {{ selectedSms.status === 'success' ? 'Success' : 'Failed' }}
              </van-tag>
            </div>
          </div>
          <div class="detail-section" v-if="selectedSms.direction === 'MT' && selectedSms.senderName">
            <div class="detail-label">Sender</div>
            <div class="detail-value">{{ selectedSms.senderName }}</div>
          </div>
          <div class="detail-section">
            <div class="detail-label">Time</div>
            <div class="detail-value">{{ formatDetailTime(selectedSms.timestamp) }}</div>
          </div>
          <div class="detail-section content-section">
            <div class="detail-label">Content</div>
            <div class="content-text-wrapper">
              <div class="content-text">
                {{ selectedSms.content }}
                <div class="copy-icon-overlay" @click="copyContent">
                  <div class="copy-box-back"></div>
                  <div class="copy-box-front"></div>
                </div>
              </div>
            </div>
          </div>
          <!-- 回复内容 -->
          <div v-if="selectedSms.replies && selectedSms.replies.length > 0" class="detail-section replies-section">
            <div class="detail-label">Replies</div>
            <div v-for="(reply, index) in selectedSms.replies" :key="index" class="reply-item">
              <div class="reply-content-wrapper">
                <div class="reply-content-text">
                  {{ reply.content }}
                  <div class="copy-icon-overlay" @click="copyReplyContent(reply.content)">
                    <div class="copy-box-back"></div>
                    <div class="copy-box-front"></div>
                  </div>
                </div>
                <div class="reply-time">{{ formatDetailTime(reply.timestamp) }}</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </van-popup>

    <!-- 底部导航栏 -->
    <van-tabbar v-model="activeTabbar" fixed>
      <van-tabbar-item icon="apps-o" to="/sim-list">SIM</van-tabbar-item>
      <van-tabbar-item icon="chat-o" to="/sim-sms">SMS</van-tabbar-item>
      <van-tabbar-item icon="exchange" to="/switch-enterprise">Switch</van-tabbar-item>
      <van-tabbar-item icon="arrow" @click="handleLogout">Logout</van-tabbar-item>
    </van-tabbar>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { getSmsList, getSimByIccid } from '@/mock.js'
import themeConfig from '@/config/theme.js'
import { showConfirmDialog, showToast } from 'vant'

// 导入所有可能的 logo
import logoLinksfield from '@/assets/logo.png'
import logoThg from '@/assets/logo-thg.png'

const route = useRoute()

// 根据主题配置选择对应的 logo
const logoImg = computed(() => {
  const logoMap = {
    'logo.png': logoLinksfield,
    'logo-thg.png': logoThg
  }
  return logoMap[themeConfig.logo] || logoLinksfield
})

const logoExists = ref(true)

// 对话模式相关
const isConversationMode = ref(false)
const messages = ref([])
const simInfo = ref(null)
const newMessage = ref('')
const sendingMessage = ref(false)

// 列表模式相关
const searchIccid = ref('')
const activeTimeRange = ref('today') // 默认今天
const refreshing = ref(false)
const loading = ref(false)
const finished = ref(false)
const showDetailPopup = ref(false)
const selectedSms = ref(null)
const activeTabbar = ref(1) // SMS tab 是第二个，索引为1

const displayList = ref([])

// 初始化数据
onMounted(() => {
  // 检查是否进入对话模式（通过路由参数 id 或 query.iccid）
  const routeId = route.params.id
  const queryIccid = route.query.iccid
  
  if (routeId || queryIccid) {
    // 进入对话模式
    isConversationMode.value = true
    let targetIccid = queryIccid
    
    // 如果没有 query.iccid，尝试通过 id 获取 iccid（向后兼容）
    if (!targetIccid && routeId) {
      // 这里可以添加通过 id 获取 iccid 的逻辑
      // 暂时跳过，因为现在使用 iccid
    }
    
    if (targetIccid) {
      // 获取 SIM 信息
      simInfo.value = getSimByIccid(targetIccid)
      
      // 加载该 ICCID 的所有短信
      loadConversationMessages(targetIccid)
    }
  } else {
    // 列表模式
    isConversationMode.value = false
    loadData()
  }
})

// 加载对话消息
const loadConversationMessages = (iccid) => {
  // 获取该 ICCID 的所有短信
  const smsList = getSmsList({ iccid })
  
  // 转换为对话格式：MT (平台发给设备) = received, MO (设备发给平台) = sent
  messages.value = smsList
    .map(sms => ({
      id: sms.id,
      type: sms.direction === 'MT' ? 'received' : 'sent',
      content: sms.content,
      timestamp: sms.timestamp,
      status: sms.status
    }))
    .sort((a, b) => a.timestamp - b.timestamp) // 按时间正序排列
}

// 发送消息
const sendMessage = async () => {
  if (!newMessage.value.trim() || sendingMessage.value) return
  
  sendingMessage.value = true
  
  // 模拟发送延迟
  await new Promise(resolve => setTimeout(resolve, 1000))
  
  // 创建新消息（MO - 设备发给平台）
  const newMsg = {
    id: `msg_${Date.now()}`,
    type: 'sent',
    content: newMessage.value.trim(),
    timestamp: Date.now(),
    status: 'success'
  }
  
  // 添加到消息列表
  messages.value.push(newMsg)
  
  // 清空输入框
  newMessage.value = ''
  sendingMessage.value = false
  
  showToast({
    type: 'success',
    message: 'Message sent successfully!'
  })
  
  // 滚动到底部
  setTimeout(() => {
    const container = document.querySelector('.messages-container')
    if (container) {
      container.scrollTop = container.scrollHeight
    }
  }, 100)
}

// 格式化消息时间
const formatMessageTime = (timestamp) => {
  const date = new Date(timestamp)
  const now = new Date()
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
  const messageDate = new Date(date.getFullYear(), date.getMonth(), date.getDate())
  
  if (messageDate.getTime() === today.getTime()) {
    // 今天，只显示时间
    return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false })
  } else {
    // 其他日期，显示日期和时间
    return date.toLocaleString('en-US', { 
      month: 'short', 
      day: 'numeric', 
      hour: '2-digit', 
      minute: '2-digit',
      hour12: false
    })
  }
}

// 加载数据
const loadData = () => {
  const filters = {
    iccid: searchIccid.value,
    timeRange: activeTimeRange.value
  }
  
  const results = getSmsList(filters)
  displayList.value = results
  finished.value = true
}

// 搜索处理
const handleSearch = () => {
  loadData()
}

// 清除搜索
const handleClear = () => {
  searchIccid.value = ''
  loadData()
}

// 时间段切换
const handleTimeRangeChange = (name) => {
  activeTimeRange.value = name
  loadData()
}

// 下拉刷新
const onRefresh = () => {
  setTimeout(() => {
    loadData()
    refreshing.value = false
  }, 1000)
}

// 上拉加载（这里不需要分页，所以直接完成）
const onLoad = () => {
  setTimeout(() => {
    loading.value = false
    finished.value = true
  }, 1000)
}

// 显示详情
const showDetail = (sms) => {
  selectedSms.value = sms
  showDetailPopup.value = true
}

// 复制 ICCID
const copyIccid = async (iccid) => {
  try {
    await navigator.clipboard.writeText(iccid)
    showToast({
      type: 'success',
      message: 'ICCID copied to clipboard'
    })
  } catch (err) {
    // 降级方案：使用传统方法
    const textArea = document.createElement('textarea')
    textArea.value = iccid
    textArea.style.position = 'fixed'
    textArea.style.opacity = '0'
    document.body.appendChild(textArea)
    textArea.select()
    try {
      document.execCommand('copy')
      showToast({
        type: 'success',
        message: 'ICCID copied to clipboard'
      })
    } catch (err) {
      showToast({
        type: 'fail',
        message: 'Failed to copy ICCID'
      })
    }
    document.body.removeChild(textArea)
  }
}

// 格式化时间（列表显示）
const formatTime = (timestamp) => {
  const date = new Date(timestamp)
  const now = new Date()
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
  const messageDate = new Date(date.getFullYear(), date.getMonth(), date.getDate())
  
  if (messageDate.getTime() === today.getTime()) {
    // 今天，只显示时间
    return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false })
  } else {
    // 其他日期，显示日期和时间
    return date.toLocaleString('en-US', { 
      month: 'short', 
      day: 'numeric', 
      hour: '2-digit', 
      minute: '2-digit',
      hour12: false
    })
  }
}

// 格式化时间（详情显示）
const formatDetailTime = (timestamp) => {
  const date = new Date(timestamp)
  return date.toLocaleString('en-US', { 
    year: 'numeric',
    month: 'long', 
    day: 'numeric', 
    hour: '2-digit', 
    minute: '2-digit',
    second: '2-digit',
    hour12: false
  })
}

// 复制内容
const copyContent = async () => {
  if (!selectedSms.value) return
  
  try {
    await navigator.clipboard.writeText(selectedSms.value.content)
    showToast({
      type: 'success',
      message: 'Content copied to clipboard'
    })
  } catch (err) {
    // 降级方案：使用传统方法
    const textArea = document.createElement('textarea')
    textArea.value = selectedSms.value.content
    textArea.style.position = 'fixed'
    textArea.style.opacity = '0'
    document.body.appendChild(textArea)
    textArea.select()
    try {
      document.execCommand('copy')
      showToast({
        type: 'success',
        message: 'Content copied to clipboard'
      })
    } catch (err) {
      showToast({
        type: 'fail',
        message: 'Failed to copy content'
      })
    }
    document.body.removeChild(textArea)
  }
}

// 复制回复内容
const copyReplyContent = async (content) => {
  if (!content) return
  
  try {
    await navigator.clipboard.writeText(content)
    showToast({
      type: 'success',
      message: 'Reply content copied to clipboard'
    })
  } catch (err) {
    // 降级方案：使用传统方法
    const textArea = document.createElement('textarea')
    textArea.value = content
    textArea.style.position = 'fixed'
    textArea.style.opacity = '0'
    document.body.appendChild(textArea)
    textArea.select()
    try {
      document.execCommand('copy')
      showToast({
        type: 'success',
        message: 'Reply content copied to clipboard'
      })
    } catch (err) {
      showToast({
        type: 'fail',
        message: 'Failed to copy reply content'
      })
    }
    document.body.removeChild(textArea)
  }
}

// 处理登出
const handleLogout = async () => {
  try {
    await showConfirmDialog({
      title: 'Logout',
      message: 'Are you sure you want to logout?',
      confirmButtonText: 'Confirm',
      cancelButtonText: 'Cancel'
    })
    showToast({
      type: 'success',
      message: 'Logged out successfully'
    })
    // 这里可以添加实际的登出逻辑，比如清除 token、跳转到登录页等
    // router.push('/login')
  } catch {
    // 用户取消
  }
}
</script>

<style scoped>
.sms-list-page {
  padding-top: 0;
  padding-bottom: 50px;
  min-height: 100vh;
  background-color: var(--cube-background);
}

/* 顶部 Banner */
.custom-banner {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  height: 60px;
  z-index: 100;
  background-color: rgba(255, 255, 255, 0.75);
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
}

.banner-content {
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 16px;
}

.logo-container {
  display: flex;
  align-items: center;
  gap: 6px;
  flex: 1;
}

.banner-right {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  flex-shrink: 0;
}

.page-title {
  font-size: 20px;
  font-weight: 600;
  color: var(--cube-text-primary);
}

.logo-img {
  height: 40px;
  width: auto;
  filter: drop-shadow(0 2px 4px rgba(0, 0, 0, 0.2));
}

.brand-text {
  font-family: 'Archivo', sans-serif;
  color: var(--cube-text-primary);
  font-size: 24px;
  font-weight: 600;
  letter-spacing: 1px;
}

.search-section {
  background-color: #fff;
  padding: 8px 16px;
  margin-top: 60px;
}

.search-wrapper {
  flex: 1;
}

:deep(.search-wrapper .van-search) {
  padding: 0;
}

:deep(.search-wrapper .van-search__content) {
  padding: 0;
}

:deep(.search-wrapper .van-search__left-icon) {
  margin-right: 12px !important;
  padding-right: 0 !important;
  padding-left: 12px !important;
}

:deep(.search-wrapper .van-field__control) {
  padding-left: 0 !important;
}

.time-range-section {
  background-color: #fff;
  margin-top: 8px;
}

.list-section {
  margin-top: 8px;
  padding: 0 8px;
}

.sms-item {
  margin-bottom: 12px;
  background-color: #fff;
  border-radius: 5px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.06);
  overflow: hidden;
}

:deep(.sms-item .van-cell) {
  border-radius: 5px;
  border: none;
  padding: 12px 16px;
}

:deep(.sms-item .van-cell__right-icon) {
  margin-left: 16px;
}

.sms-item-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
  gap: 8px;
}

/* Has Reply 标签样式 - 与 SIM 标签保持一致 */
:deep(.reply-tag) {
  border-radius: 5px !important;
  background-color: rgba(234, 24, 69, 0.05) !important;
  color: var(--cube-primary-color) !important;
  border: 1px solid rgba(234, 24, 69, 0.35) !important;
  padding: 2px 8px;
}

.sms-iccid-wrapper {
  display: flex;
  align-items: center;
  gap: 6px;
  flex: 1;
  min-width: 0;
}

.sms-iccid {
  font-size: 16px;
  font-weight: 600;
  color: #646566;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  flex-shrink: 1;
}

/* 列表中的复制图标 */
.sms-iccid-wrapper .copy-icon-overlay {
  position: relative;
  flex-shrink: 0;
}

/* 通用的复制图标样式 */
.copy-icon-overlay {
  cursor: pointer;
  width: 20px;
  height: 20px;
  transition: all 0.2s;
}

.copy-icon-overlay:active {
  opacity: 0.7;
}

.copy-box-back,
.copy-box-front {
  position: absolute;
  border: 1.5px solid #646566;
  background-color: transparent;
  border-radius: 2px;
}

.copy-box-back {
  width: 14px;
  height: 14px;
  top: 4px;
  left: 0;
  opacity: 0.5;
}

.copy-box-front {
  width: 14px;
  height: 14px;
  top: 0;
  left: 4px;
  opacity: 1;
  background-color: #fff;
}

/* 详情弹窗中的复制图标 */
.content-text-wrapper .copy-icon-overlay {
  position: absolute;
  bottom: 8px;
  right: 8px;
}

.content-text-wrapper .copy-box-front {
  background-color: #f7f8fa;
}

.sms-msisdn-row {
  display: flex;
  align-items: center;
  gap: 6px;
  margin-bottom: 8px;
}

.msisdn-label {
  font-size: 13px;
  color: var(--cube-text-secondary);
  font-weight: 500;
}

.msisdn-value {
  font-size: 14px;
  color: #646566;
  font-weight: 500;
}

.sms-item-content {
  margin-top: 8px;
}

.sms-info-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 14px;
}

.sms-status {
  display: flex;
  align-items: center;
  gap: 6px;
}

.status-tag {
  margin-right: 8px;
}

/* 优化状态标签样式 - 与SIM页面保持一致 */
:deep(.status-tag) {
  border-radius: 12px !important;
  opacity: 0.75;
  font-weight: 400;
  padding: 2px 10px;
  border: none !important;
}

:deep(.status-tag.van-tag--success),
:deep(.status-tag.van-tag.van-tag--success) {
  background-color: rgba(7, 193, 96, 0.15) !important;
  color: rgba(7, 193, 96, 0.9) !important;
}

:deep(.status-tag.van-tag--danger),
:deep(.status-tag.van-tag.van-tag--danger) {
  background-color: rgba(238, 10, 36, 0.15) !important;
  color: rgba(238, 10, 36, 0.9) !important;
}

.sms-time {
  color: var(--cube-text-secondary);
  font-size: 13px;
}

:deep(.van-tabs__line) {
  background-color: var(--cube-primary-color);
}

:deep(.van-tab--active) {
  color: var(--cube-primary-color);
}

/* 详情弹窗样式 */
.detail-panel {
  display: flex;
  flex-direction: column;
  height: 100%;
}

.detail-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px;
  border-bottom: 1px solid #ebedf0;
}

.detail-title {
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

.detail-content {
  flex: 1;
  overflow-y: auto;
  padding: 16px;
}

.detail-section {
  margin-bottom: 20px;
}

.detail-section.content-section {
  margin-bottom: 0;
}

.detail-label {
  font-size: 14px;
  color: var(--cube-text-secondary);
  margin-bottom: 8px;
  font-weight: 500;
}


.detail-value {
  font-size: 16px;
  color: var(--cube-text-primary);
  display: flex;
  align-items: center;
}

.content-text-wrapper {
  margin-top: 8px;
}

.content-text {
  position: relative;
  line-height: 1.6;
  word-wrap: break-word;
  white-space: pre-wrap;
  padding: 12px;
  padding-bottom: 40px;
  background-color: #f7f8fa;
  border-radius: 8px;
}

/* 回复内容样式 */
.replies-section {
  margin-top: 24px;
}

.reply-item {
  margin-bottom: 16px;
}

.reply-item:last-child {
  margin-bottom: 0;
}

.reply-content-wrapper {
  margin-top: 8px;
}

.reply-content-text {
  position: relative;
  line-height: 1.6;
  word-wrap: break-word;
  white-space: pre-wrap;
  padding: 12px;
  padding-bottom: 40px;
  background-color: #f7f8fa;
  border-radius: 8px;
}

.reply-time {
  margin-top: 8px;
  font-size: 12px;
  color: var(--cube-text-secondary);
}

.reply-content-wrapper .copy-icon-overlay {
  position: absolute;
  bottom: 8px;
  right: 8px;
}

.reply-content-wrapper .copy-box-front {
  background-color: #f7f8fa;
}


/* 底部导航栏样式 */
:deep(.van-tabbar-item--active) {
  color: var(--cube-primary-color);
}

:deep(.van-tabbar-item__icon) {
  font-size: 22px;
}

/* 对话模式样式 */
.conversation-page {
  display: flex;
  flex-direction: column;
  height: 100vh;
  padding-top: 46px;
  padding-bottom: 0;
  background-color: var(--cube-background);
}

.messages-container {
  flex: 1;
  overflow-y: auto;
  padding: 16px;
  padding-bottom: 80px;
}

.message-item {
  display: flex;
  margin-bottom: 12px;
  animation: fadeIn 0.3s ease-in;
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.message-sent {
  justify-content: flex-end;
}

.message-received {
  justify-content: flex-start;
}

.message-bubble {
  max-width: 75%;
  padding: 10px 14px;
  border-radius: 18px;
  word-wrap: break-word;
  position: relative;
}

.message-sent .message-bubble {
  background-color: var(--cube-primary-color);
  color: #fff;
  border-bottom-right-radius: 4px;
}

.message-received .message-bubble {
  background-color: #fff;
  color: var(--cube-text-primary);
  border-bottom-left-radius: 4px;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.1);
}

.message-content {
  font-size: 15px;
  line-height: 1.4;
  margin-bottom: 4px;
}

.message-time {
  font-size: 11px;
  opacity: 0.7;
  margin-top: 4px;
}

.message-sent .message-time {
  color: rgba(255, 255, 255, 0.8);
  text-align: right;
}

.message-received .message-time {
  color: var(--cube-text-secondary);
  text-align: left;
}

.message-input-section {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  background-color: #fff;
  padding: 12px 16px;
  padding-bottom: calc(12px + env(safe-area-inset-bottom));
  border-top: 1px solid #ebedf0;
  display: flex;
  align-items: flex-end;
  gap: 12px;
  z-index: 100;
}

.message-input {
  flex: 1;
  background-color: #f7f8fa;
  border-radius: 20px;
  padding: 8px 16px;
}

:deep(.message-input .van-field__control) {
  background-color: transparent;
  font-size: 15px;
  line-height: 1.4;
  padding: 0;
}

:deep(.message-input .van-field__word-limit) {
  color: var(--cube-text-secondary);
  font-size: 12px;
  margin-top: 4px;
}

.send-button {
  flex-shrink: 0;
  height: 40px;
  padding: 0 20px;
  border-radius: 20px;
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
</style>
