import { createRouter, createWebHistory } from 'vue-router'
import SimList from '@/views/SimList.vue'
import SimDetail from '@/views/SimDetail.vue'
import SwitchEnterprise from '@/views/SwitchEnterprise.vue'
import SimSMS from '@/views/SimSMS.vue'

const routes = [
  {
    path: '/',
    redirect: '/sim-list'
  },
  {
    path: '/sim-list',
    name: 'SimList',
    component: SimList
  },
  {
    path: '/sim-detail',
    name: 'SimDetail',
    component: SimDetail
  },
  {
    path: '/sim-sms/:id',
    name: 'SimSMS',
    component: SimSMS
  },
  {
    path: '/switch-enterprise',
    name: 'SwitchEnterprise',
    component: SwitchEnterprise
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

export default router

