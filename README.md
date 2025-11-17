# Cube Mobile - SIM Management

基于 Vue 3 + Vant 的移动端 SIM 卡管理系统。

## 功能特性

- 📱 移动端友好的界面设计
- 🔍 SIM 卡搜索功能（支持 ICCID/IMEI/MSISDN）
- 🏷️ 状态筛选（All/Active/Pre-activated/Suspended/Expired）
- 📋 SIM 卡列表展示
- 📄 SIM 卡详情页面
- 🎨 主题色定制（#ea1845）
- 💾 Mock 数据支持

## 技术栈

- Vue 3
- Vant 4
- Vue Router 4
- Vite

## 快速开始

### 安装依赖

```bash
npm install
```

### 开发运行

```bash
npm run dev
```

### 构建生产版本

```bash
npm run build
```

### 预览生产版本

```bash
npm run preview
```

## 项目结构

```
cube-mobile/
├── src/
│   ├── views/          # 页面组件
│   │   ├── SimList.vue    # SIM 列表页
│   │   └── SimDetail.vue  # SIM 详情页
│   ├── router/         # 路由配置
│   ├── styles/         # 样式文件
│   ├── mock.js         # Mock 数据
│   ├── App.vue         # 根组件
│   └── main.js         # 入口文件
├── index.html
├── vite.config.js
└── package.json
```

## 主题色定制

主题色定义在 `src/styles/main.css` 中：

```css
:root {
  --cube-primary-color: #ea1845;
}
```

可以修改此值来定制主题色。

## Mock 数据

Mock 数据位于 `src/mock.js`，包含 10 条示例 SIM 卡数据。可以根据需要修改或扩展。

## 数据加载策略

### 分页加载

为了优化大数据量场景下的性能，应用采用了分页加载策略：

- **每页数量**：默认每页加载 20 条数据
- **首次加载**：只加载第一页数据，避免一次性加载大量数据导致页面卡顿
- **上拉加载**：当用户滚动到列表底部时，自动加载下一页数据
- **下拉刷新**：下拉刷新时重新加载第一页数据

### 搜索和筛选

- **搜索触发**：输入关键词后按回车或点击搜索按钮触发搜索
- **筛选重置**：每次搜索或筛选时，会重置到第一页并重新加载数据
- **组合筛选**：支持多个筛选条件组合使用（状态、运营商、位置、计划、标签等）

### 性能优化

1. **分页加载**：使用 `getSimsPaginated()` 函数实现服务端分页逻辑
2. **按需加载**：只加载当前需要显示的数据，不预加载全部数据
3. **筛选优化**：筛选条件变化时，只重新加载第一页，避免重复加载

### 大数据场景

当数据量达到几万条时：

- 首次加载只显示 20 条，响应速度快
- 用户滚动时按需加载，不会一次性加载全部数据
- 筛选功能在服务端（或 mock 层）进行，只返回匹配的结果
- 支持组合筛选，快速定位目标数据

### API 对接说明

当前使用 Mock 数据，实际对接后端 API 时：

1. 将 `getSimsPaginated()` 函数改为调用真实 API
2. API 应支持分页参数：`page`、`pageSize`
3. API 应支持筛选参数：`status`、`operator`、`location`、`plan`、`tag`、`keyword`
4. API 返回格式应包含：`data`（数据数组）、`total`（总数）、`page`（当前页）、`hasMore`（是否有更多数据）

## Lessons Learnt

### Z-index 层级冲突导致按钮点击问题

**问题描述**：
- Filter 按钮点击后无法弹出底部抽屉
- Refresh SIM 按钮需要点击两次才能显示对话框

**根本原因**：
- 使用了 `position: sticky` 的元素（如 `status-card`）设置了过高的 `z-index`（如 `z-index: 10`）
- 按钮所在的容器没有设置 `z-index` 或设置了较低的 `z-index`
- 导致 sticky 元素覆盖了按钮，需要点击两次才能穿透到按钮

**解决方案**：
1. **合理设置 z-index 层级**：
   - Sticky 元素：`z-index: 1`（较低层级）
   - 按钮容器：`z-index: 2`（较高层级，确保在 sticky 元素之上）
   - 固定导航栏：`z-index: 100`（最高层级）

2. **避免使用 `.stop` 修饰符**：
   - 除非确实需要阻止事件冒泡，否则不要使用 `@click.stop`
   - 使用专门的函数处理点击事件，代码更清晰

3. **检查元素覆盖**：
   - 使用浏览器开发者工具检查元素的实际层级关系
   - 确保可交互元素（按钮、链接等）的 z-index 高于可能覆盖它们的元素

**示例代码**：
```css
/* ❌ 错误：z-index 过高，可能覆盖其他元素 */
.status-card {
  position: sticky;
  z-index: 10;  /* 过高 */
}

/* ✅ 正确：合理设置层级 */
.status-card {
  position: sticky;
  z-index: 1;  /* 较低层级 */
}

.action-buttons {
  position: relative;
  z-index: 2;  /* 确保按钮在卡片之上 */
}
```

