<template>
  <div class="trip-page">
    <!-- 顶部导航 -->
    <div class="nav-tabs">
      <div class="tab active">旅游</div>
      <div class="tab">待办</div>
    </div>

    <!-- 用户信息卡片 -->
    <div class="user-card">
      <div class="user-info">
        <div class="avatar"></div>
        <div class="info">
          <div class="name">背起了行囊</div>
          <div class="description">旅游爱好者 走遍全国3个城市</div>
        </div>
      </div>
    </div>

    <!-- 行程卡片 -->
    <div class="trip-card">
      <div class="trip-header">
        <div class="trip-title">{{ trip.name }}</div>
        <div class="trip-meta">
          <span>{{ tripDuration }}天</span>
          <span>同行好友 {{ trip.travelers }}</span>
        </div>
      </div>
    </div>

    <!-- 功能按钮组 -->
    <div class="function-buttons">
      <button class="func-btn">酒店预定</button>
      <button class="func-btn">门票购买</button>
      <button class="func-btn">天气查看</button>
      <button class="func-btn">账单统计</button>
      <button class="func-btn">滴滴打车</button>
      <button class="func-btn">周边景点</button>
    </div>

    <!-- 行程列表 -->
    <div class="schedule-list">
      <div class="schedule-item" 
           v-for="activity in todayActivities" 
           :key="activity.time"
           @click="openNavigation(activity.location)">
        <div class="schedule-content">
          <div class="destination">{{ activity.name }}</div>
          <div class="location">{{ activity.location }}</div>
        </div>
        <div class="time">{{ activity.time }}</div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'

const trip = ref({
  id: '1',
  name: '桐庐旅行',
  destination: '桐庐',
  dateRange: {
    from: '2023-08-15',
    to: '2023-08-20'
  },
  travelers: 2,
  tripType: '情侣旅行',
  description: '这是一次桐庐旅行，计划游览主要景点和体验当地美食文化。'
})

const days = ref([
  {
    date: '2023-08-15',
    activities: [
      {
        name: '火车前往桐庐',
        time: '09:16',
        location: '上海虹桥→桐庐站',
        type: '交通出行',
        note: '票价122元/人，11:06到达桐庐站'
      },
      {
        name: '吃午餐',
        time: '12:30',
        // location: '一味大院 (距桐庐站5.5km)',
        location: '桐庐站->一味大院 (距桐庐站5.5km)',
        type: '餐饮美食',
        note: '桐庐站下车后打车前往'
      },
      // ... 其他活动
    ]
  }
])

// 计算行程天数
const tripDuration = computed(() => {
  const from = new Date(trip.value.dateRange.from)
  const to = new Date(trip.value.dateRange.to)
  return Math.ceil((to.getTime() - from.getTime()) / (1000 * 60 * 60 * 24))
})

// 获取今天的活动
const todayActivities = computed(() => {
  return days.value[0].activities // 这里简化处理，显示第一天的活动
})

// 打开高德地图导航
const openNavigation = (location: string) => {
  // 提取目的地，去除括号内的距离信息
  const destination = location.split('(')[0].trim()
  
  // 检测是否为 iOS 设备
  const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent)
  
  // 构建高德地图 URL
  let mapUrl
  if (isIOS) {
    // iOS 使用 iosamap:// scheme
    mapUrl = `iosamap://path?sourceApplication=myapp&dlat=&dlon=&dname=${encodeURIComponent(destination)}&dev=0&t=0`
  } else {
    // 其他设备使用网页版导航
    mapUrl = `https://uri.amap.com/navigation?to=,,${encodeURIComponent(destination)}&mode=car&policy=1&src=myapp&coordinate=gaode&callnative=0`
  }
  
  // 尝试打开地图
  window.location.href = mapUrl
}
</script>

<style scoped>
.trip-page {
  padding: 16px;
  background-color: #f4f6f4;
  min-height: 100vh;
}

.nav-tabs {
  display: flex;
  gap: 20px;
  margin-bottom: 20px;
}

.tab {
  font-size: 18px;
  color: #808080;
  transition: color 0.3s ease;
}

.tab.active {
  color: #2e5a2e;
  font-weight: bold;
}

.user-card {
  background: white;
  border-radius: 16px;
  padding: 16px;
  margin-bottom: 20px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
}

.user-info {
  display: flex;
  align-items: center;
  gap: 16px;
}

.avatar {
  width: 50px;
  height: 50px;
  border-radius: 25px;
  background-color: #e0e5e0;
}

.info .name {
  font-size: 16px;
  font-weight: bold;
  color: #404040;
}

.info .description {
  font-size: 14px;
  color: #808080;
  margin-top: 4px;
}

.trip-card {
  background: white;
  border-radius: 16px;
  padding: 16px;
  margin-bottom: 20px;
}

.trip-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.trip-title {
  font-size: 16px;
  font-weight: bold;
  color: #404040;
}

.trip-meta {
  color: #808080;
  font-size: 14px;
}

.trip-meta span {
  margin-left: 12px;
}

.function-buttons {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 12px;
  margin-bottom: 20px;
}

.func-btn {
  background: white;
  border: none;
  padding: 12px;
  border-radius: 8px;
  color: #2e5a2e;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
}

.func-btn:hover {
  background-color: #f0f4f0;
  transform: translateY(-1px);
}

.schedule-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.schedule-item {
  background: white;
  border-radius: 8px;
  padding: 16px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
  cursor: pointer;
  transition: all 0.3s ease;
}

.schedule-item:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
  background-color: #f9faf9;
}

.destination {
  font-size: 16px;
  color: #404040;
  margin-bottom: 4px;
}

.location {
  font-size: 14px;
  color: #808080;
}

.time {
  color: #2e5a2e;
  font-size: 16px;
}
</style>
