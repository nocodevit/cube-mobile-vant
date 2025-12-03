// Mock 数据
export const mockSimList = [
  {
    id: '1',
    iccid: '89430103524107987990',
    imei: '868123456789012',
    msisdn: '43688879748810',
    status: 'pre-activated',
    statusText: 'Pre-activated',
    cycleUsage: 0.00,
    cycleUsageUnit: 'MB',
    tags: [],
    operator: 'Vodafone',
    plan: '30 Days 500MB American Only',
    activationDate: '2024-01-15',
    expiryDate: '2025-01-15',
    dataLimit: 10240,
    dataLimitUnit: 'MB',
    voiceLimit: 1000,
    voiceLimitUnit: 'minutes',
    smsLimit: 500,
    location: 'Austria',
    apn: 'internet.vodafone.at',
    paymentType: 'prepaid'
  },
  {
    id: '2',
    iccid: '8944538532045134792',
    imei: '868123456789013',
    msisdn: '43688879748811',
    status: 'active',
    statusText: 'Active',
    cycleUsage: 1250.50,
    cycleUsageUnit: 'MB',
    tags: ['Production'],
    operator: 'Orange',
    plan: '30 Days 1GB European Union',
    activationDate: '2024-02-01',
    expiryDate: '2025-02-01',
    dataLimit: 5120,
    dataLimitUnit: 'MB',
    voiceLimit: 2000,
    voiceLimitUnit: 'minutes',
    smsLimit: 1000,
    location: 'France',
    apn: 'orange.fr',
    paymentType: 'postpaid'
  },
  {
    id: '3',
    iccid: '89852202508070000001',
    imei: '868123456789014',
    msisdn: '43688879748812',
    status: 'suspended',
    statusText: 'Suspended',
    cycleUsage: 0.00,
    cycleUsageUnit: 'MB',
    tags: ['Test'],
    operator: 'T-Mobile',
    plan: '30 Days 200MB Global',
    activationDate: '2024-01-20',
    expiryDate: '2025-01-20',
    dataLimit: 2048,
    dataLimitUnit: 'MB',
    voiceLimit: 500,
    voiceLimitUnit: 'minutes',
    smsLimit: 200,
    location: 'Germany',
    apn: 'internet.t-mobile',
    paymentType: 'prepaid'
  },
  {
    id: '4',
    iccid: '89430103524107987991',
    imei: '868123456789015',
    msisdn: '43688879748813',
    status: 'active',
    statusText: 'Active',
    cycleUsage: 3456.78,
    cycleUsageUnit: 'MB',
    tags: ['Production', 'VIP'],
    operator: 'EE',
    plan: '30 Days 2GB Worldwide',
    activationDate: '2024-01-10',
    expiryDate: '2025-01-10',
    dataLimit: 10240,
    dataLimitUnit: 'MB',
    voiceLimit: 5000,
    voiceLimitUnit: 'minutes',
    smsLimit: 2000,
    location: 'UK',
    apn: 'everywhere',
    paymentType: 'postpaid'
  },
  {
    id: '5',
    iccid: '8944538532045134793',
    imei: '868123456789016',
    msisdn: '43688879748814',
    status: 'pre-activated',
    statusText: 'Pre-activated',
    cycleUsage: 0.00,
    cycleUsageUnit: 'MB',
    tags: [],
    operator: 'Telefonica',
    plan: '30 Days 500MB American Only',
    activationDate: '2024-03-01',
    expiryDate: '2025-03-01',
    dataLimit: 5120,
    dataLimitUnit: 'MB',
    voiceLimit: 1000,
    voiceLimitUnit: 'minutes',
    smsLimit: 500,
    location: 'Spain',
    apn: 'movistar.es',
    paymentType: 'prepaid'
  },
  {
    id: '6',
    iccid: '89852202508070000002',
    imei: '868123456789017',
    msisdn: '43688879748815',
    status: 'active',
    statusText: 'Active',
    cycleUsage: 890.25,
    cycleUsageUnit: 'MB',
    tags: ['Development'],
    operator: 'Three',
    plan: '30 Days 1GB European Union',
    activationDate: '2024-02-15',
    expiryDate: '2025-02-15',
    dataLimit: 10240,
    dataLimitUnit: 'MB',
    voiceLimit: 2000,
    voiceLimitUnit: 'minutes',
    smsLimit: 1000,
    location: 'UK',
    apn: 'three.co.uk',
    paymentType: 'postpaid'
  },
  {
    id: '7',
    iccid: '89430103524107987992',
    imei: '868123456789018',
    msisdn: '43688879748816',
    status: 'expired',
    statusText: 'Expired',
    cycleUsage: 5120.00,
    cycleUsageUnit: 'MB',
    tags: ['Archive'],
    operator: 'Vodafone',
    plan: '30 Days 500MB American Only',
    activationDate: '2023-12-01',
    expiryDate: '2024-12-01',
    dataLimit: 5120,
    dataLimitUnit: 'MB',
    voiceLimit: 1000,
    voiceLimitUnit: 'minutes',
    smsLimit: 500,
    location: 'Austria',
    apn: 'internet.vodafone.at',
    paymentType: 'prepaid'
  },
  {
    id: '8',
    iccid: '8944538532045134794',
    imei: '868123456789019',
    msisdn: '43688879748817',
    status: 'active',
    statusText: 'Active',
    cycleUsage: 2345.67,
    cycleUsageUnit: 'MB',
    tags: ['Production', 'Critical'],
    operator: 'Orange',
    plan: '30 Days 2GB Worldwide',
    activationDate: '2024-01-05',
    expiryDate: '2025-01-05',
    dataLimit: 20480,
    dataLimitUnit: 'MB',
    voiceLimit: 10000,
    voiceLimitUnit: 'minutes',
    smsLimit: 5000,
    location: 'France',
    apn: 'orange.fr',
    paymentType: 'postpaid'
  },
  {
    id: '9',
    iccid: '89852202508070000003',
    imei: '868123456789020',
    msisdn: '43688879748818',
    status: 'pre-activated',
    statusText: 'Pre-activated',
    cycleUsage: 0.00,
    cycleUsageUnit: 'MB',
    tags: [],
    operator: 'T-Mobile',
    plan: '30 Days 200MB Global',
    activationDate: '2024-03-10',
    expiryDate: '2025-03-10',
    dataLimit: 2048,
    dataLimitUnit: 'MB',
    voiceLimit: 500,
    voiceLimitUnit: 'minutes',
    smsLimit: 200,
    location: 'Germany',
    apn: 'internet.t-mobile',
    paymentType: 'prepaid'
  },
  {
    id: '10',
    iccid: '89430103524107987993',
    imei: '868123456789021',
    msisdn: '43688879748819',
    status: 'active',
    statusText: 'Active',
    cycleUsage: 6789.12,
    cycleUsageUnit: 'MB',
    tags: ['Production'],
    operator: 'EE',
    plan: '30 Days 1GB European Union',
    activationDate: '2024-01-25',
    expiryDate: '2025-01-25',
    dataLimit: 10240,
    dataLimitUnit: 'MB',
    voiceLimit: 2000,
    voiceLimitUnit: 'minutes',
    smsLimit: 1000,
    location: 'UK',
    apn: 'everywhere',
    paymentType: 'postpaid'
  }
]

// 根据 ID 获取 SIM 详情
export function getSimById(id) {
  return mockSimList.find(sim => sim.id === id) || null
}

// 根据 ICCID 获取 SIM 详情
export function getSimByIccid(iccid) {
  return mockSimList.find(sim => sim.iccid === iccid) || null
}

// 搜索 SIM 卡
export function searchSims(keyword) {
  if (!keyword) return mockSimList
  const lowerKeyword = keyword.toLowerCase()
  return mockSimList.filter(sim => 
    sim.iccid.toLowerCase().includes(lowerKeyword) ||
    sim.imei.toLowerCase().includes(lowerKeyword) ||
    sim.msisdn.toLowerCase().includes(lowerKeyword)
  )
}

// 根据状态筛选
export function filterSimsByStatus(status) {
  if (!status || status === 'all') return mockSimList
  return mockSimList.filter(sim => sim.status === status)
}

// 高级筛选 - 支持多条件组合
export function filterSims(filters) {
  let results = [...mockSimList]
  
  // 状态筛选
  if (filters.status && filters.status !== 'all') {
    results = results.filter(sim => sim.status === filters.status)
  }
  
  // 运营商筛选
  if (filters.operator) {
    results = results.filter(sim => sim.operator === filters.operator)
  }
  
  // 位置筛选
  if (filters.location) {
    results = results.filter(sim => sim.location === filters.location)
  }
  
  // 计划筛选
  if (filters.plan) {
    results = results.filter(sim => sim.plan === filters.plan)
  }
  
  // 标签筛选
  if (filters.tag) {
    results = results.filter(sim => sim.tags && sim.tags.includes(filters.tag))
  }
  
  // 关键词搜索（ICCID/IMEI/MSISDN）
  if (filters.keyword) {
    const lowerKeyword = filters.keyword.toLowerCase()
    results = results.filter(sim => 
      sim.iccid.toLowerCase().includes(lowerKeyword) ||
      sim.imei.toLowerCase().includes(lowerKeyword) ||
      sim.msisdn.toLowerCase().includes(lowerKeyword)
    )
  }
  
  return results
}

// 获取所有唯一的运营商列表
export function getOperators() {
  const operators = [...new Set(mockSimList.map(sim => sim.operator))]
  return operators.sort()
}

// 获取所有唯一的位置列表
export function getLocations() {
  const locations = [...new Set(mockSimList.map(sim => sim.location))]
  return locations.sort()
}

// 获取所有唯一的计划列表
export function getPlans() {
  const plans = [...new Set(mockSimList.map(sim => sim.plan))]
  return plans.sort()
}

// 获取所有唯一的标签列表
export function getTags() {
  const allTags = []
  mockSimList.forEach(sim => {
    if (sim.tags && sim.tags.length > 0) {
      allTags.push(...sim.tags)
    }
  })
  return [...new Set(allTags)].sort()
}

// 分页加载数据（模拟服务端分页）
export function getSimsPaginated(filters, page = 1, pageSize = 20) {
  const allResults = filterSims(filters)
  const total = allResults.length
  const start = (page - 1) * pageSize
  const end = start + pageSize
  const data = allResults.slice(start, end)
  
  return {
    data,
    total,
    page,
    pageSize,
    totalPages: Math.ceil(total / pageSize),
    hasMore: end < total
  }
}

// Mock SMS 消息数据
export function getSmsMessages(simId) {
  // 根据 simId 返回不同的消息列表
  const messages = [
    {
      id: '1',
      type: 'received',
      content: 'Welcome to Cube Mobile! Your SIM card has been activated successfully.',
      timestamp: '2024-01-15 10:30:00',
      phoneNumber: '+1234567890'
    },
    {
      id: '2',
      type: 'sent',
      content: 'Thank you!',
      timestamp: '2024-01-15 10:35:00',
      phoneNumber: '+1234567890'
    },
    {
      id: '3',
      type: 'received',
      content: 'Your data usage is at 50% of your monthly limit.',
      timestamp: '2024-01-20 14:20:00',
      phoneNumber: '+1234567890'
    },
    {
      id: '4',
      type: 'received',
      content: 'Reminder: Your plan will expire on 2025-01-15. Please renew to continue service.',
      timestamp: '2024-12-01 09:00:00',
      phoneNumber: '+1234567890'
    },
    {
      id: '5',
      type: 'sent',
      content: 'I will renew it soon.',
      timestamp: '2024-12-01 09:15:00',
      phoneNumber: '+1234567890'
    },
    {
      id: '6',
      type: 'received',
      content: 'Your SIM card status has been updated to Active.',
      timestamp: '2024-02-01 11:45:00',
      phoneNumber: '+1234567890'
    },
    {
      id: '7',
      type: 'sent',
      content: 'Great! Thanks for the update.',
      timestamp: '2024-02-01 11:50:00',
      phoneNumber: '+1234567890'
    },
    {
      id: '8',
      type: 'received',
      content: 'You have used 80% of your monthly data allowance. Consider upgrading your plan.',
      timestamp: '2024-01-25 16:30:00',
      phoneNumber: '+1234567890'
    }
  ]
  
  // 可以根据 simId 返回不同的消息
  return messages.sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp))
}

