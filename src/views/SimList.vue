<template>
  <div class="sim-list-page">
    <!-- 顶部导航栏 - 半透明 banner -->
    <div class="custom-banner">
      <div class="banner-content">
        <div class="logo-container">
          <img v-if="logoExists" :src="logoImg" alt="Logo" class="logo-img" />
          <span v-if="themeConfig.brandName" class="brand-text">{{ themeConfig.brandName }}</span>
        </div>
        <div class="banner-right">
          <div class="user-avatar" @click.stop="handleUserClick">
            {{ userInfo.email }}
          </div>
        </div>
      </div>
    </div>

    <!-- 搜索栏 -->
    <div class="search-section">
      <div class="search-wrapper">
        <van-search v-model="searchKeyword" placeholder="Search ICCID/IMEI/MSISDN" shape="round" @search="handleSearch"
          @clear="handleClear" />
      </div>
      <van-button icon="filter-o" size="small" round class="filter-btn" @click="handleFilterClick">
        Filter
        <van-badge v-if="hasActiveFilters" :content="activeFilterCount" />
      </van-button>
    </div>

    <!-- 状态筛选 -->
    <div class="filter-section">
      <van-tabs v-model:active="activeTab" @change="handleTabChange" line-width="40px">
        <van-tab title="All" name="all"></van-tab>
        <van-tab title="Active" name="active"></van-tab>
        <van-tab title="Pre-act" name="pre-activated"></van-tab>
        <van-tab title="Suspended" name="suspended"></van-tab>
        <van-tab title="Expired" name="expired"></van-tab>
      </van-tabs>
    </div>

    <!-- SIM 列表 -->
    <div class="list-section">
      <van-pull-refresh v-model="refreshing" @refresh="onRefresh" loading-text="Loading...">
        <van-list v-model:loading="loading" :finished="finished" finished-text="No more data" loading-text="Loading..."
          @load="onLoad">
          <van-cell v-for="sim in displayList" :key="sim.id" is-link @click="goToDetail(sim)" class="sim-item">
            <template #title>
              <div class="sim-item-header">
                <div class="sim-iccid">{{ sim.iccid }}</div>
                <van-tag :type="getStatusType(sim.status)" size="small" class="status-tag" :data-status="sim.status">
                  {{ sim.statusText }}
                </van-tag>
              </div>
            </template>
            <template #label>
              <div class="sim-item-content">
                <div class="sim-info-row">
                  <span class="label">MSISDN:</span>
                  <span class="value">{{ sim.msisdn }}</span>
                </div>
                <div class="usage-row">
                  <div class="usage-header">
                    <span class="label">Usage:</span>
                    <span class="usage-text">
                      {{ formatUsage(sim.cycleUsage) }} {{ sim.cycleUsageUnit }} / {{ sim.dataLimit }} {{
                        sim.dataLimitUnit }}
                    </span>
                  </div>
                  <div class="usage-progress-wrapper">
                    <div class="usage-progress-bar"
                      :style="{ width: getUsagePercentage(sim) + '%', backgroundColor: getProgressColor(sim) }"></div>
                  </div>
                </div>
                <div class="sim-tags" v-if="sim.tags && sim.tags.length > 0">
                  <van-tag v-for="tag in sim.tags" :key="tag" type="primary" size="small" class="tag-item">
                    {{ tag }}
                  </van-tag>
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

    <!-- 高级筛选面板 -->
    <van-popup v-model:show="showFilterPanel" position="bottom" :style="{ height: '70%' }" round>
      <div class="filter-panel">
        <div class="filter-header">
          <span class="filter-title">Advanced Filters</span>
          <span class="clear-all-btn" @click="clearFilters">Clear All</span>
        </div>
        <div class="filter-content">
          <van-cell-group>
            <van-cell title="Operator" :value="filters.operator || 'All'" is-link @click="showOperatorPicker = true" />
            <van-cell title="Location" :value="filters.location || 'All'" is-link @click="showLocationPicker = true" />
            <van-cell title="Plan" :value="filters.plan || 'All'" is-link @click="showPlanPicker = true" />
            <van-cell title="Tag" :value="filters.tag || 'All'" is-link @click="showTagPicker = true" />
          </van-cell-group>
        </div>

        <!-- 选择器 -->
        <van-popup v-model:show="showOperatorPicker" position="bottom">
          <van-picker :columns="operatorOptions" @confirm="onOperatorConfirm" @cancel="showOperatorPicker = false"
            confirm-button-text="Confirm" cancel-button-text="Cancel" />
        </van-popup>
        <van-popup v-model:show="showLocationPicker" position="bottom">
          <van-picker :columns="locationOptions" @confirm="onLocationConfirm" @cancel="showLocationPicker = false"
            confirm-button-text="Confirm" cancel-button-text="Cancel" />
        </van-popup>
        <van-popup v-model:show="showPlanPicker" position="bottom">
          <van-picker :columns="planOptions" @confirm="onPlanConfirm" @cancel="showPlanPicker = false"
            confirm-button-text="Confirm" cancel-button-text="Cancel" />
        </van-popup>
        <van-popup v-model:show="showTagPicker" position="bottom">
          <van-picker :columns="tagOptions" @confirm="onTagConfirm" @cancel="showTagPicker = false"
            confirm-button-text="Confirm" cancel-button-text="Cancel" />
        </van-popup>
        <div class="filter-footer">
          <van-button block type="primary" round @click="applyFilters">Apply Filters</van-button>
        </div>
      </div>
    </van-popup>

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
import { getSimsPaginated, getOperators, getLocations, getPlans, getTags } from '@/mock.js'
import { showConfirmDialog, showToast, showLoadingToast, closeToast } from 'vant'
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

const searchKeyword = ref('')
const activeTab = ref('all')
const refreshing = ref(false)
const loading = ref(false)
const finished = ref(false)
const showFilterPanel = ref(false)
const showOperatorPicker = ref(false)
const showLocationPicker = ref(false)
const showPlanPicker = ref(false)
const showTagPicker = ref(false)
const activeTabbar = ref(0)
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

// 分页相关
const currentPage = ref(1)
const pageSize = ref(20)
const total = ref(0)

// 筛选条件
const filters = ref({
  status: 'all',
  operator: '',
  location: '',
  plan: '',
  tag: '',
  keyword: ''
})

const displayList = ref([])

// 筛选选项
const operatorOptions = ref([{ text: 'All', value: '' }])
const locationOptions = ref([{ text: 'All', value: '' }])
const planOptions = ref([{ text: 'All', value: '' }])
const tagOptions = ref([{ text: 'All', value: '' }])

// 初始化数据
onMounted(async () => {
  // 检查是否从企业切换页面返回
  const enterpriseSwitched = localStorage.getItem('enterpriseSwitched')
  let showLoading = false

  if (enterpriseSwitched === 'true') {
    // 显示 SIM 页面的 loading
    showLoadingToast({
      message: 'Loading data',
      forbidClick: true,
      duration: 0
    })
    showLoading = true
    // 清除标志
    localStorage.removeItem('enterpriseSwitched')
  }

  // 加载筛选选项
  const operators = getOperators()
  operatorOptions.value = [{ text: 'All', value: '' }, ...operators.map(op => ({ text: op, value: op }))]

  const locations = getLocations()
  locationOptions.value = [{ text: 'All', value: '' }, ...locations.map(loc => ({ text: loc, value: loc }))]

  const plans = getPlans()
  planOptions.value = [{ text: 'All', value: '' }, ...plans.map(plan => ({ text: plan, value: plan }))]

  const tags = getTags()
  tagOptions.value = [{ text: 'All', value: '' }, ...tags.map(tag => ({ text: tag, value: tag }))]

  // 加载第一页数据
  // 模拟数据加载延迟
  await new Promise(resolve => setTimeout(resolve, 500))
  loadData()

  // 如果显示了 loading，关闭它
  if (showLoading) {
    closeToast()
  }
})

// 计算是否有激活的筛选条件
const hasActiveFilters = computed(() => {
  return filters.value.operator || filters.value.location || filters.value.plan || filters.value.tag
})

const activeFilterCount = computed(() => {
  let count = 0
  if (filters.value.operator) count++
  if (filters.value.location) count++
  if (filters.value.plan) count++
  if (filters.value.tag) count++
  return count
})

// 加载数据（使用分页）
const loadData = (page = 1, reset = false) => {
  if (reset) {
    displayList.value = []
    currentPage.value = 1
  }

  const filterParams = {
    ...filters.value,
    status: activeTab.value,
    keyword: searchKeyword.value
  }

  const result = getSimsPaginated(filterParams, page, pageSize.value)

  if (reset) {
    displayList.value = result.data
  } else {
    displayList.value.push(...result.data)
  }

  total.value = result.total
  currentPage.value = result.page
  finished.value = !result.hasMore
}

// 搜索处理
const handleSearch = () => {
  loadData(1, true)
}

// 清除搜索
const handleClear = () => {
  searchKeyword.value = ''
  filters.value.keyword = ''
  loadData(1, true)
}

// Tab 切换
const handleTabChange = (name) => {
  filters.value.status = name
  loadData(1, true)
}

// 下拉刷新
const onRefresh = () => {
  setTimeout(() => {
    loadData(1, true)
    refreshing.value = false
  }, 1000)
}

// 上拉加载
const onLoad = () => {
  setTimeout(() => {
    loadData(currentPage.value + 1, false)
    loading.value = false
  }, 1000)
}

// 处理 filter 按钮点击
const handleFilterClick = () => {
  showFilterPanel.value = true
}

// 处理用户头像点击
const handleUserClick = () => {
  showUserInfo.value = true
}

// 应用筛选
const applyFilters = () => {
  showFilterPanel.value = false
  loadData(1, true)
}

// 清除所有筛选
const clearFilters = () => {
  filters.value = {
    status: activeTab.value,
    operator: '',
    location: '',
    plan: '',
    tag: '',
    keyword: searchKeyword.value
  }
  loadData(1, true)
}

// 选择器确认回调
const onOperatorConfirm = ({ selectedOptions }) => {
  filters.value.operator = selectedOptions[0]?.value || ''
  showOperatorPicker.value = false
}

const onLocationConfirm = ({ selectedOptions }) => {
  filters.value.location = selectedOptions[0]?.value || ''
  showLocationPicker.value = false
}

const onPlanConfirm = ({ selectedOptions }) => {
  filters.value.plan = selectedOptions[0]?.value || ''
  showPlanPicker.value = false
}

const onTagConfirm = ({ selectedOptions }) => {
  filters.value.tag = selectedOptions[0]?.value || ''
  showTagPicker.value = false
}

// 跳转详情
const goToDetail = (sim) => {
  // 使用 query 参数传递 ICCID
  router.push({
    path: '/sim-detail',
    query: { iccid: sim.iccid }
  })
}

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
    return (usage / 1024).toFixed(2)
  }
  return usage.toFixed(2)
}

// 获取使用百分比
const getUsagePercentage = (sim) => {
  if (!sim || sim.dataLimit === 0) return 0
  // 统一转换为 MB 进行计算
  let usage = sim.cycleUsage
  let limit = sim.dataLimit

  // 如果单位不一致，需要转换（这里假设都是 MB，如果不同需要转换）
  const percentage = (usage / limit) * 100
  return Math.min(Math.round(percentage), 100)
}

// 获取进度条颜色
const getProgressColor = (sim) => {
  const percentage = getUsagePercentage(sim)
  if (percentage >= 90) return '#ee0a24'
  if (percentage >= 70) return '#ff976a'
  return themeConfig.primary
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
.sim-list-page {
  padding-top: 0;
  padding-bottom: 50px;
  min-height: 100vh;
  background-color: var(--cube-background);
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
  position: relative;
  z-index: 101;
}

.user-avatar:active {
  background-color: var(--cube-primary-rgba-light);
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

.search-section {
  background-color: #fff;
  padding: 8px 16px;
  margin-top: 60px;
  display: flex;
  align-items: center;
  gap: 8px;
}

.search-wrapper {
  flex: 1;
}

/* 移除 van-search 内部的 padding，确保与 filter 按钮对齐 */
:deep(.search-wrapper .van-search) {
  padding: 0;
}

:deep(.search-wrapper .van-search__content) {
  padding: 0;
}

/* 搜索图标和输入框之间添加 padding */
:deep(.search-wrapper .van-search__left-icon) {
  margin-right: 12px !important;
  padding-right: 0 !important;
  padding-left: 12px !important;
}

:deep(.search-wrapper .van-field__control) {
  padding-left: 0 !important;
}

.filter-btn {
  flex-shrink: 0;
  background-color: var(--cube-primary-color) !important;
  border-color: var(--cube-primary-color) !important;
  color: #fff !important;
  position: relative;
  z-index: 1;
}

:deep(.filter-btn) {
  background-color: var(--cube-primary-color) !important;
  border-color: var(--cube-primary-color) !important;
  color: #fff !important;
}

.filter-section {
  background-color: #fff;
  margin-top: 8px;
}

.list-section {
  margin-top: 8px;
  padding: 0 8px;
}

.sim-item {
  margin-bottom: 12px;
  background-color: #fff;
  border-radius: 5px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.06);
  overflow: hidden;
}

/* 确保 van-cell 内部也应用圆角，移除默认边框 */
:deep(.sim-item .van-cell) {
  border-radius: 5px;
  border: none;
  padding: 12px 16px;
}

.sim-item-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
}

.sim-iccid {
  font-size: 16px;
  font-weight: 600;
  color: #646566;
  flex: 1;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.status-tag {
  margin-left: 8px;
}

/* 优化状态标签样式 - 更 subtle、透明、圆角更大 */
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

:deep(.status-tag.van-tag--primary),
:deep(.status-tag.van-tag.van-tag--primary) {
  background-color: rgba(234, 24, 69, 0.15) !important;
  color: rgba(234, 24, 69, 0.9) !important;
}

/* pre-activated 状态使用浅蓝色 - 需要更高优先级覆盖 primary */
:deep(.status-tag[data-status="pre-activated"]),
:deep(.status-tag.van-tag[data-status="pre-activated"]),
:deep(.status-tag.van-tag--primary[data-status="pre-activated"]) {
  background-color: rgba(100, 181, 246, 0.15) !important;
  color: rgba(100, 181, 246, 0.9) !important;
  border: none !important;
}

:deep(.status-tag.van-tag--warning),
:deep(.status-tag.van-tag.van-tag--warning) {
  background-color: rgba(255, 193, 7, 0.15) !important;
  color: rgba(255, 193, 7, 0.9) !important;
}

:deep(.status-tag.van-tag--danger),
:deep(.status-tag.van-tag.van-tag--danger) {
  background-color: rgba(238, 10, 36, 0.15) !important;
  color: rgba(238, 10, 36, 0.9) !important;
}

.sim-item-content {
  margin-top: 8px;
}

.sim-info-row {
  display: flex;
  margin-bottom: 4px;
  font-size: 14px;
  justify-content: space-between;
}

.sim-info-row .label {
  color: var(--cube-text-secondary);
  margin-right: 8px;
  min-width: 80px;
}

.sim-info-row .value {
  color: #646566;
  flex: 1;
  text-align: right;
}

.usage-row {
  margin-top: 8px;
}

.usage-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 6px;
  font-size: 16px;
}

.usage-text {
  color: #646566;
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

.sim-tags {
  margin-top: 8px;
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
}

/* SIM 标签样式 - 圆角5px，浅灰色背景+边框 */
:deep(.tag-item) {
  border-radius: 5px !important;
  background-color: rgba(100, 101, 102, 0.05) !important;
  color: #646566 !important;
  border: 1px solid rgba(100, 101, 102, 0.35) !important;
  padding: 2px 8px;
}


:deep(.van-tabs__line) {
  background-color: var(--cube-primary-color);
}

:deep(.van-tab--active) {
  color: var(--cube-primary-color);
}

/* 筛选面板样式 */
.filter-panel {
  display: flex;
  flex-direction: column;
  height: 100%;
}

.filter-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px;
  border-bottom: 1px solid #ebedf0;
}

.filter-title {
  font-size: 18px;
  font-weight: 600;
  color: var(--cube-text-primary);
}

.clear-all-btn {
  font-size: 14px;
  color: var(--cube-primary-color);
  text-decoration: underline;
  cursor: pointer;
  user-select: none;
}

.clear-all-btn:active {
  opacity: 0.7;
}

.filter-content {
  flex: 1;
  overflow-y: auto;
  padding: 0;
}

/* 移除 van-cell-group 的顶部和底部边框，避免与 header/footer 重复 */
:deep(.filter-content .van-cell-group) {
  border-top: none;
  border-bottom: none;
}

.filter-footer {
  padding: 16px;
  border-top: 1px solid #ebedf0;
}

/* Filter 面板内的按钮使用主题色 */
:deep(.filter-footer .van-button--primary) {
  background-color: var(--cube-primary-color) !important;
  border-color: var(--cube-primary-color) !important;
}

/* 当 gradient 启用时，使用渐变背景 */
:root[data-gradient-enabled="true"] :deep(.filter-footer .van-button--primary) {
  background: linear-gradient(135deg, var(--cube-gradient-start) 0%, var(--cube-gradient-end) 100%) !important;
  background-color: transparent !important;
  border-color: transparent !important;
}

:deep(.filter-footer .van-button--primary:active) {
  background-color: var(--cube-primary-dark) !important;
  border-color: var(--cube-primary-dark) !important;
}

:root[data-gradient-enabled="true"] :deep(.filter-footer .van-button--primary:active) {
  opacity: 0.9;
  filter: brightness(0.95);
  background: linear-gradient(135deg, var(--cube-gradient-start) 0%, var(--cube-gradient-end) 100%) !important;
  background-color: transparent !important;
}

/* Picker 确认按钮文字颜色使用主题色 */
:deep(.van-picker__confirm) {
  color: var(--cube-primary-color) !important;
}

/* 底部导航栏样式 */
:deep(.van-tabbar-item--active) {
  color: var(--cube-primary-color);
}

:deep(.van-tabbar-item__icon) {
  font-size: 22px;
}
</style>
