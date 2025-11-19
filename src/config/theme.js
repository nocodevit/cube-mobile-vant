// 主题配置文件
// 支持多套主题配置，可以通过修改 currentTheme 来切换主题

// Linksfield 主题配置（原主题）
const linksfieldTheme = {
  name: 'linksfield',
  // Logo 文件名
  logo: 'logo.png',
  // 品牌名称
  brandName: 'Cube',
  // 主色（Primary Color）
  primary: '#ea1845',
  
  // 主色深色版本（用于 hover/active 状态）
  primaryDark: '#c4123a',
  
  // 主色浅色版本（可选，用于浅色背景）
  primaryLight: '#ff4d6d',
  
  // 次色（Secondary Color）
  secondary: '#ea1845',
  
  // 主色 rgba 版本（用于透明背景）
  primaryRgba: {
    // 0.1 透明度
    light: 'rgba(234, 24, 69, 0.1)',
    // 0.15 透明度
    medium: 'rgba(234, 24, 69, 0.15)',
    // 阴影
    shadow: 'rgba(234, 24, 69, 0.1)'
  },
  
  // 文本颜色
  textPrimary: '#323233',
  textSecondary: '#969799',
  
  // 边框颜色
  borderColor: '#ebedf0',
  
  // 背景颜色
  background: '#f7f8fa',
  
  // 是否启用 gradient（按钮使用渐变背景）
  gradient: false
}

// THG 主题配置
const thgTheme = {
  name: 'thg',
  // Logo 文件名
  logo: 'logo-thg.png',
  // 品牌名称（空字符串表示不显示）
  brandName: '',
  // 主色（Primary Color）
  primary: '#0D4D5E',
  
  // 主色深色版本（用于 hover/active 状态）
  primaryDark: '#0a3d4a',
  
  // 主色浅色版本（可选，用于浅色背景）
  primaryLight: '#1a6b7d',
  
  // 次色（Secondary Color）
  secondary: '#9EAB37',
  
  // 主色 rgba 版本（用于透明背景）
  primaryRgba: {
    // 0.1 透明度
    light: 'rgba(13, 77, 94, 0.1)',
    // 0.15 透明度
    medium: 'rgba(13, 77, 94, 0.15)',
    // 阴影
    shadow: 'rgba(13, 77, 94, 0.1)'
  },
  
  // 文本颜色
  textPrimary: '#323233',
  textSecondary: '#969799',
  
  // 边框颜色
  borderColor: '#ebedf0',
  
  // 背景颜色
  background: '#f7f8fa',
  
  // 是否启用 gradient（按钮使用渐变背景）
  gradient: true
}

// 所有主题配置
export const themes = {
  linksfield: linksfieldTheme,
  thg: thgTheme
}

// 当前使用的主题（可以通过修改这里来切换主题）
export const currentThemeName = 'thg' // 可选值: 'linksfield', 'thg'

// 获取当前主题配置
export const getCurrentTheme = () => {
  return themes[currentThemeName] || themes.linksfield
}

// 当前主题配置（导出供其他模块使用）
export const themeConfig = getCurrentTheme()

// 导出为默认导出以便更方便地导入
export default themeConfig
