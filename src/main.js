import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import Vant from 'vant'
import 'vant/lib/index.css'
import './styles/main.css'
import { getCurrentTheme } from './config/theme.js'

// 获取当前主题配置
const themeConfig = getCurrentTheme()

// 动态设置 CSS 变量
const root = document.documentElement
root.style.setProperty('--cube-primary-color', themeConfig.primary)
root.style.setProperty('--cube-primary-light', themeConfig.primaryLight)
root.style.setProperty('--cube-primary-dark', themeConfig.primaryDark)
root.style.setProperty('--cube-secondary-color', themeConfig.secondary)
root.style.setProperty('--cube-primary-rgba-light', themeConfig.primaryRgba.light)
root.style.setProperty('--cube-primary-rgba-medium', themeConfig.primaryRgba.medium)
root.style.setProperty('--cube-primary-rgba-shadow', themeConfig.primaryRgba.shadow)
root.style.setProperty('--cube-text-primary', themeConfig.textPrimary)
root.style.setProperty('--cube-text-secondary', themeConfig.textSecondary)
root.style.setProperty('--cube-border-color', themeConfig.borderColor)
root.style.setProperty('--cube-background', themeConfig.background)

// 设置 gradient 配置（用于按钮渐变背景）
if (themeConfig.gradient) {
  root.setAttribute('data-gradient-enabled', 'true')
  // 设置渐变颜色（从 primary 到 secondary）
  root.style.setProperty('--cube-gradient-start', themeConfig.primary)
  root.style.setProperty('--cube-gradient-end', themeConfig.secondary)
} else {
  root.removeAttribute('data-gradient-enabled')
}

const app = createApp(App)
app.use(router)
app.use(Vant)
app.mount('#app')

