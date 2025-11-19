<template>
  <van-popup :show="show" @update:show="updateShow" position="top" :style="{ paddingTop: '20px' }" round>
    <div class="user-info-panel">
      <div class="user-info-header">
        <h3 class="user-info-title">Profile Information</h3>
      </div>
      <div class="user-info-details">
        <van-cell-group :border="false">
          <van-cell title="First Name" :value="userInfo.firstName" :border="false" />
          <van-cell title="Surname" :value="userInfo.surname" :border="false" />
          <van-cell title="Email" :value="userInfo.email" :border="false" />
          <van-cell title="Role" :border="false">
            <template #value>
              <span class="role-badge" :class="'role-' + userInfo.role.toLowerCase()">{{ userInfo.role }}</span>
            </template>
          </van-cell>
        </van-cell-group>
      </div>
      <div class="user-info-footer">
        <van-button block type="primary" round @click="handleLogout">Logout</van-button>
      </div>
    </div>
  </van-popup>
</template>

<script setup>
import { defineProps, defineEmits } from 'vue'

const props = defineProps({
  show: {
    type: Boolean,
    default: false
  },
  userInfo: {
    type: Object,
    required: true,
    default: () => ({
      firstName: '',
      surname: '',
      email: '',
      role: ''
    })
  }
})

const emit = defineEmits(['update:show', 'logout'])

const updateShow = (value) => {
  emit('update:show', value)
}

const handleLogout = () => {
  emit('logout')
}
</script>

<style scoped>
/* 用户信息面板样式 */
.user-info-panel {
  background-color: #fff;
  border-radius: 16px;
  overflow: hidden;
}

.user-info-header {
  padding: 20px 16px 16px 16px;
  border-bottom: 1px solid #ebedf0;
}

.user-info-title {
  margin: 0;
  font-size: 20px;
  font-weight: 600;
  color: var(--cube-text-primary);
}

.user-info-details {
  padding: 0;
}

:deep(.user-info-details .van-cell-group) {
  border: none;
  box-shadow: none;
}

:deep(.user-info-details .van-cell) {
  padding: 12px 16px;
  display: flex;
  align-items: center;
  min-height: 44px;
}

:deep(.user-info-details .van-cell:not(:last-child)) {
  border-bottom: 1px solid #ebedf0;
}

:deep(.user-info-details .van-cell:last-child) {
  border-bottom: none;
}

:deep(.user-info-details .van-cell__title) {
  color: var(--cube-text-secondary);
  font-size: 16px;
}

:deep(.user-info-details .van-cell__value) {
  color: var(--cube-text-primary);
  font-size: 16px;
  font-weight: 500;
}

.role-badge {
  display: inline-block;
  padding: 4px 12px;
  border-radius: 12px;
  font-size: 14px;
  font-weight: 500;
}

.role-user {
  background-color: rgba(100, 101, 102, 0.1);
  color: #646566;
}

.role-admin {
  background-color: var(--cube-primary-rgba-light);
  color: var(--cube-primary-color);
}

.role-operator {
  background-color: rgba(7, 193, 96, 0.1);
  color: #07c160;
}

.user-info-footer {
  padding: 16px;
}

:deep(.user-info-footer .van-button--primary) {
  background-color: var(--cube-primary-color) !important;
  border-color: var(--cube-primary-color) !important;
}

/* 当 gradient 启用时，使用渐变背景 */
:root[data-gradient-enabled="true"] :deep(.user-info-footer .van-button--primary) {
  background: linear-gradient(135deg, var(--cube-gradient-start) 0%, var(--cube-gradient-end) 100%) !important;
  background-color: transparent !important;
  border-color: transparent !important;
}

:deep(.user-info-footer .van-button--primary:active) {
  background-color: var(--cube-primary-dark) !important;
  border-color: var(--cube-primary-dark) !important;
}

:root[data-gradient-enabled="true"] :deep(.user-info-footer .van-button--primary:active) {
  opacity: 0.9;
  filter: brightness(0.95);
  background: linear-gradient(135deg, var(--cube-gradient-start) 0%, var(--cube-gradient-end) 100%) !important;
  background-color: transparent !important;
}
</style>
