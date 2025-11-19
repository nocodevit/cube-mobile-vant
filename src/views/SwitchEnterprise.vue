<template>
  <div class="switch-enterprise-page">
    <!-- 顶部导航栏 - 半透明 banner -->
    <div class="custom-banner">
      <div class="banner-content">
        <div class="logo-container">
          <img v-if="logoExists" :src="logoImg" alt="Logo" class="logo-img" />
          <span v-if="themeConfig.brandName" class="brand-text">{{ themeConfig.brandName }}</span>
        </div>
        <div class="banner-right">
          <div class="user-avatar" @click="showUserInfo = true">
            {{ userInfo.email }}
          </div>
        </div>
      </div>
    </div>

    <div class="enterprise-content">
      <div class="current-enterprise">
        <div class="current-label">Current Enterprise</div>
        <div class="current-name">{{ currentEnterprise }}</div>
      </div>

      <div class="enterprise-list">
        <van-cell-group>
          <van-cell v-for="enterprise in enterprises" :key="enterprise.id" :title="enterprise.name"
            :label="enterprise.description" :class="{ 'active': enterprise.name === currentEnterprise }" is-link
            @click="switchEnterprise(enterprise)">
            <template #right-icon>
              <van-icon v-if="enterprise.name === currentEnterprise" name="success" :color="themeConfig.primary" />
            </template>
          </van-cell>
        </van-cell-group>
      </div>
    </div>

    <!-- 用户信息弹窗 -->
    <UserInfoPopup v-model:show="showUserInfo" :user-info="userInfo" @logout="handleLogout" />

    <!-- 底部导航栏 -->
    <van-tabbar v-model="activeTabbar" fixed>
      <van-tabbar-item icon="apps-o" to="/sim-list">SIM</van-tabbar-item>
      <van-tabbar-item icon="chat-o">SMS</van-tabbar-item>
      <van-tabbar-item icon="exchange" to="/switch-enterprise">Switch</van-tabbar-item>
      <van-tabbar-item icon="arrow" @click="handleLogout">Logout</van-tabbar-item>
    </van-tabbar>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { showToast, showConfirmDialog, showLoadingToast, closeToast } from 'vant'
import UserInfoPopup from '@/components/UserInfoPopup.vue'
import themeConfig from '@/config/theme.js'

const router = useRouter()

// 导入所有可能的 logo
import logoLinksfield from '@/assets/logo.png'
import logoThg from '@/assets/logo-thg.png'

// 根据主题配置选择对应的 logo
const logoImg = computed(() => {
  const logoMap = {
    'logo.png': logoLinksfield,
    'logo-thg.png': logoThg
  }
  return logoMap[themeConfig.logo] || logoLinksfield
})

const logoExists = ref(true)
const activeTabbar = ref(2) // Switch 是第三个，索引为 2
const showUserInfo = ref(false)

// 用户信息
const userInfo = ref({
  firstName: 'Alex',
  surname: 'Smith',
  email: 'user@example.com',
  role: 'Admin' // User, Admin, Operator
})

// 计算用户头像字母（邮箱前两个字母）
const userInitials = computed(() => {
  const email = userInfo.value.email || ''
  const letters = email.substring(0, 2).toUpperCase()
  return letters || 'U'
})

// 企业列表数据
const enterprises = ref([
  { id: 'ENT001', name: 'Technology Solutions Inc.', description: 'ENT001' },
  { id: 'ENT002', name: 'Global Communications Ltd.', description: 'ENT002' },
  { id: 'ENT003', name: 'Digital Services Corp.', description: 'ENT003' },
  { id: 'ENT004', name: 'Cloud Infrastructure Group', description: 'ENT004' },
  { id: 'ENT005', name: 'Mobile Networks International', description: 'ENT005' },
  { id: 'ENT006', name: 'Telecom Solutions Worldwide', description: 'ENT006' }
])

// 当前选中的企业
const currentEnterprise = ref('Technology Solutions Inc.')

// 从本地存储加载当前企业
onMounted(() => {
  const saved = localStorage.getItem('currentEnterprise')
  if (saved) {
    currentEnterprise.value = saved
  }
})

// 切换企业
const switchEnterprise = async (enterprise) => {
  if (enterprise.name === currentEnterprise.value) {
    return
  }

  // 显示切换企业的 loading
  showLoadingToast({
    message: 'Switching enterprise',
    forbidClick: true,
    duration: 0
  })

  // 模拟切换延迟
  await new Promise(resolve => setTimeout(resolve, 500))

  currentEnterprise.value = enterprise.name
  localStorage.setItem('currentEnterprise', enterprise.name)
  // 设置一个标志，表示企业已切换，需要重新加载数据
  localStorage.setItem('enterpriseSwitched', 'true')

  // 关闭切换企业的 loading
  closeToast()

  // 切换后返回 SIM 主页
  router.push('/sim-list')
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
.switch-enterprise-page {
  padding-top: 0;
  padding-bottom: 50px;
  min-height: 100vh;
  background-color: #f7f8fa;
}

/* 无颜色 Banner */
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
  width: 40px;
  display: flex;
  align-items: center;
  justify-content: flex-end;
  flex-shrink: 0;
}

.user-avatar {
  min-width: 120px;
  height: 32px;
  border-radius: 16px;
  background-color: transparent;
  border: 1px solid var(--cube-primary-color);
  color: var(--cube-primary-color);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
  flex-shrink: 0;
  padding: 0 12px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.user-avatar:active {
  background-color: rgba(234, 24, 69, 0.1);
  opacity: 0.8;
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

.enterprise-content {
  padding: 16px;
  margin-top: 60px;
}

.current-enterprise {
  background-color: #fff;
  border-radius: 8px;
  padding: 16px;
  margin-bottom: 16px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.06);
}

.current-label {
  font-size: 12px;
  color: #969799;
  margin-bottom: 8px;
}

.current-name {
  font-size: 20px;
  font-weight: 600;
  color: var(--cube-text-primary);
}

.enterprise-list {
  background-color: #fff;
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.06);
}

:deep(.enterprise-list .van-cell) {
  padding: 16px;
}

:deep(.enterprise-list .van-cell--clickable:active) {
  background-color: #f7f8fa;
}

:deep(.enterprise-list .active) {
  background-color: rgba(234, 24, 69, 0.05);
}

:deep(.enterprise-list .active .van-cell__title) {
  color: var(--cube-primary-color);
  font-weight: 600;
}

/* 底部导航栏样式 */
:deep(.van-tabbar-item--active) {
  color: var(--cube-primary-color);
}

:deep(.van-tabbar-item__icon) {
  font-size: 22px;
}
</style>
