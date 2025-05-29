<template>
  <div class="trip-page">
    <!-- 顶部导航 -->
    <div class="nav-tabs">
      <div class="tab active">旅游</div>
      <div class="tab">待办</div>
      <div class="tab">摸金</div>
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
    <div class="trip-cards-wrapper">
      <div class="trip-cards">
        <div class="trip-card" :class="{ active: selectedTrip === 'tonglu' }" @click="selectTrip('tonglu')" ref="tongluCard">
          <div class="trip-header">
            <div class="trip-title">{{ trip.name }}</div>
            <div class="trip-meta">
              <span>{{ tripDuration }}天</span>
              <span>同行好友 {{ trip.travelers }}</span>
            </div>
          </div>
        </div>
        
        <div class="trip-card" :class="{ active: selectedTrip === 'shanghai' }" @click="selectTrip('shanghai')" ref="shanghaiCard">
          <div class="trip-header">
            <div class="trip-title">上海旅行</div>
            <div class="trip-meta">
              <span>3天</span>
              <span>同行好友 3</span>
            </div>
          </div>
        </div>
      </div>
      <div class="dots-indicator">
        <div class="indicator-pill" :class="{ active: currentCardIndex === 0 }"></div>
        <div class="indicator-pill" :class="{ active: currentCardIndex === 1 }"></div>
      </div>
    </div>

    <!-- 功能按钮组 -->
    <div class="function-buttons">
      <button class="func-btn">酒店预定</button>
      <button class="func-btn">门票购买</button>
      <button class="func-btn">天气查看</button>
      <button class="func-btn">高德导航</button>
      <button class="func-btn">滴滴打车</button>
      <button class="func-btn">账单统计</button>
    </div>

    <!-- 日期选择 -->
    <div class="date-selector">
      <div class="date-item"
           :class="{ active: selectedDayIndex === 0 }"
           @click="selectDay(0)">
        <div class="date-day">第一天</div>
        <div class="date-full">8月15日</div>
      </div>
      <div class="date-item"
           :class="{ active: selectedDayIndex === 1 }"
           @click="selectDay(1)">
        <div class="date-day">第二天</div>
        <div class="date-full">8月16日</div>
      </div>
    </div>

    <!-- 行程列表 -->
    <div class="schedule-list">
      <div class="schedule-item"
           v-for="(activity, index) in todayActivities"
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
import { ref, computed, onMounted } from 'vue'

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
        name: '去火车站',
        time: '08:16',
        location: '上海虹桥站',
        type: '交通出行',
        note: '滴滴打车'
      },
      {
        name: '到达桐庐',
        time: '09:16',
        location: '桐庐站',
        type: '交通出行',
        note: '票价122元/人，11:06到达桐庐站'
      },
      {
        name: '吃午餐',
        time: '12:30',
        location: '一味大院 (距桐庐站5.5km)',
        type: '餐饮美食',
        note: '桐庐站下车后打车前往'
      },
      // ... 其他活动
    ]
  },
  {
    date: '2023-08-16',
    activities: [
      {
        name: '早餐',
        time: '08:30',
        location: '桐庐大酒店',
        type: '餐饮美食',
        note: '酒店自助早餐'
      },
      {
        name: '瑶琳仙境',
        time: '10:00',
        location: '瑶琳仙境景区 (距酒店12km)',
        type: '景点游览',
        note: '门票120元/人'
      },
      {
        name: '午餐',
        time: '12:30',
        location: '农家乐 (距景区1km)',
        type: '餐饮美食',
        note: '当地特色菜'
      }
    ]
  }
])

const selectedDayIndex = ref(0)
const selectedTrip = ref('tonglu')
const currentCardIndex = ref(0)
const tongluCard = ref<HTMLElement | null>(null)
const shanghaiCard = ref<HTMLElement | null>(null)

const selectDay = (index: number) => {
  selectedDayIndex.value = index
}

const selectTrip = (tripId: string) => {
  selectedTrip.value = tripId
}

// 计算行程天数
const tripDuration = computed(() => {
  const from = new Date(trip.value.dateRange.from)
  const to = new Date(trip.value.dateRange.to)
  return Math.ceil((to.getTime() - from.getTime()) / (1000 * 60 * 60 * 24))
})

// 获取今天的活动
const todayActivities = computed(() => {
  return days.value[selectedDayIndex.value].activities
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
    // iOS 使用 iosamap:// scheme，只指定终点
    mapUrl = `iosamap://path?sourceApplication=myapp&dlat=&dlon=&dname=${encodeURIComponent(destination)}&dev=0&t=0`
  } else {
    // 其他设备使用网页版导航
    mapUrl = `https://uri.amap.com/navigation?to=,,${encodeURIComponent(destination)}&mode=car&policy=1&src=myapp&coordinate=gaode&callnative=0`
  }

  // 提取并显示参数
//   const params = mapUrl.split('?')[1]
//   alert(`导航参数：\n${params.split('&').join('\n')}`)

  // 尝试打开地图
  window.location.href = mapUrl
}

// 监听滚动位置
const handleScroll = (e: Event) => {
  const container = e.target as HTMLElement
  const scrollLeft = container.scrollLeft
  const cardWidth = container.offsetWidth

  // 根据滚动位置计算当前显示的卡片索引
  currentCardIndex.value = Math.round(scrollLeft / cardWidth)
}

onMounted(() => {
  const container = document.querySelector('.trip-cards')
  if (container) {
    container.addEventListener('scroll', handleScroll)
  }
})
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
  background-color: #f4f6f4;
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24'%3E%3Ccircle cx='12' cy='12' r='11' fill='%23ffffff' stroke='%232e5a2e' stroke-width='1.5'/%3E%3Cpath d='M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20zm0 18a8 8 0 1 1 0-16 8 8 0 0 1 0 16z' fill='%232e5a2e'/%3E%3Cpath d='M12 5.5L14.5 14.5L12 12L9.5 14.5z' fill='%23ff6b6b'/%3E%3Cpath d='M12 18.5L9.5 9.5L12 12L14.5 9.5z' fill='%232e5a2e'/%3E%3C/svg%3E");
  background-size: 100%;
  background-position: center;
  background-repeat: no-repeat;
  box-shadow: 0 2px 8px rgba(46, 90, 46, 0.15);
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

.trip-cards-wrapper {
  margin-bottom: 20px;
}

.trip-cards {
  display: flex;
  gap: 12px;
  overflow-x: auto;
  padding: 0 4px;
  margin-bottom: 8px;
  scrollbar-width: none;
  -ms-overflow-style: none;
  scroll-snap-type: x mandatory;
}

.trip-cards::-webkit-scrollbar {
  display: none; /* Chrome and Safari */
}

.trip-card {
  scroll-snap-align: start;
  background: white;
  border-radius: 16px;
  padding: 16px;
  min-width: 280px; /* 设置最小宽度确保卡片不会太窄 */
  cursor: pointer;
  transition: all 0.3s ease;
  border: 2px solid transparent;
}

.trip-card.active {
  border-color: #2e5a2e;
  background-color: #f9faf9;
}

.dots-indicator {
  display: flex;
  justify-content: center;
  gap: 6px;
  margin: 12px auto 0;
}

.indicator-pill {
  height: 4px;
  width: 12px;
  border-radius: 2px;
  background-color: #e0e0e0;
  transition: all 0.3s ease;
}

.indicator-pill.active {
  width: 24px;
  background-color: #2e5a2e;
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
  display: flex;
  align-items: center;
  gap: 8px;
}

.trip-title::after {
  content: "进行中";
  font-size: 12px;
  font-weight: normal;
  color: #2e5a2e;
  background-color: rgba(46, 90, 46, 0.1);
  padding: 2px 8px;
  border-radius: 10px;
  display: flex;
  align-items: center;
}

.trip-title::after::before {
  content: "";
  display: inline-block;
  width: 6px;
  height: 6px;
  background-color: #2e5a2e;
  border-radius: 50%;
  margin-right: 4px;
  animation: pulse 2s infinite;
}

@keyframes pulse {
  0% {
    opacity: 1;
  }
  50% {
    opacity: 0.4;
  }
  100% {
    opacity: 1;
  }
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

.date-selector {
  display: flex;
  gap: 12px;
  margin-bottom: 20px;
  padding: 0 4px;
}

.date-item {
  background: white;
  border-radius: 12px;
  padding: 8px 16px;
  flex: 1;
  text-align: center;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
}

.date-item.active {
  background: #2e5a2e;
  color: white;
}

.date-day {
  font-size: 14px;
  font-weight: bold;
  margin-bottom: 0;
}

.date-full {
  font-size: 13px;
  opacity: 0.8;
}
</style>
