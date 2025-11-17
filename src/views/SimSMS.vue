<template>
  <div class="sms-page">
    <!-- 顶部导航栏 -->
    <van-nav-bar :title="`SMS - ${sim?.iccid || ''}`" fixed left-arrow @click-left="$router.back()"
      :style="{ backgroundColor: '#ea1845', color: '#fff' }" />

    <div class="sms-content">
      <!-- 聊天消息列表 -->
      <div class="messages-container" ref="messagesContainer">
        <div v-for="message in messages" :key="message.id" :class="['message-item', message.type]">
          <div class="message-bubble">
            <div class="message-content">{{ message.content }}</div>
            <div class="message-time">{{ formatTime(message.timestamp) }}</div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, nextTick } from 'vue'
import { useRoute } from 'vue-router'
import { getSimById, getSmsMessages } from '@/mock.js'

const route = useRoute()
const sim = ref(null)
const messages = ref([])
const messagesContainer = ref(null)

onMounted(() => {
  const id = route.params.id
  sim.value = getSimById(id)
  if (sim.value) {
    messages.value = getSmsMessages(id)
    // 滚动到底部
    nextTick(() => {
      scrollToBottom()
    })
  }
})

// 格式化时间
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

// 滚动到底部
const scrollToBottom = () => {
  if (messagesContainer.value) {
    messagesContainer.value.scrollTop = messagesContainer.value.scrollHeight
  }
}
</script>

<style scoped>
.sms-page {
  padding-top: 46px;
  min-height: 100vh;
  background-color: #f7f8fa;
  display: flex;
  flex-direction: column;
}

.sms-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.messages-container {
  flex: 1;
  overflow-y: auto;
  padding: 16px;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.message-item {
  display: flex;
  width: 100%;
}

.message-item.received {
  justify-content: flex-start;
}

.message-item.sent {
  justify-content: flex-end;
}

.message-bubble {
  max-width: 75%;
  padding: 10px 14px;
  border-radius: 12px;
  position: relative;
}

.message-item.received .message-bubble {
  background-color: #fff;
  border: 1px solid #ebedf0;
  border-bottom-left-radius: 4px;
}

.message-item.sent .message-bubble {
  background-color: #ea1845;
  color: #fff;
  border-bottom-right-radius: 4px;
}

.message-content {
  font-size: 16px;
  line-height: 1.5;
  word-wrap: break-word;
  margin-bottom: 4px;
}

.message-time {
  font-size: 13px;
  opacity: 0.7;
  text-align: right;
  margin-top: 4px;
}

.message-item.received .message-time {
  color: #969799;
  text-align: left;
}

.message-item.sent .message-time {
  color: rgba(255, 255, 255, 0.8);
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
</style>

