<template>
  <router-view />
</template>

<script setup>
</script>

<style>
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body {
  font-family: 'Archivo', sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}

#app {
  min-height: 100vh;
  background-color: #f7f8fa;
}

/* 全局强制防止 loading toast 文字折行 - 单词不能拆开 */
/* 这是 Vant 的已知问题，已在 main.css 中统一处理 */
.van-loading__text,
.van-loading__text * {
  white-space: nowrap !important;
  word-break: normal !important;
  overflow: visible !important;
}

/* Toast 文字防止单词被拆分 */
.van-toast__text,
.van-toast__text * {
  word-break: normal !important;
  overflow-wrap: break-word !important;
}
</style>

