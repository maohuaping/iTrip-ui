<template>
  <q-page class="national-day-plan-page">
    <div class="page-container">
      <!-- 页面标题 -->
      <div class="page-header">
        <q-icon name="celebration" size="2rem" color="red-6" class="q-mr-sm" />
        <h1 class="page-title">国庆出行计划</h1>
      </div>
      
      <!-- 计划概览卡片 -->
      <q-card class="plan-overview q-mb-md" flat bordered>
        <q-card-section class="bg-red-1">
          <div class="text-h6 text-red-8 q-mb-sm">
            <q-icon name="schedule" class="q-mr-xs" />
            计划时间：10月4日 - 10月8日
          </div>
          <div class="text-subtitle2 text-grey-7 q-mb-sm">
            <q-icon name="location_on" class="q-mr-xs" />
            主要目的地：嘉兴、杭州周边
          </div>
          <div class="text-caption text-grey-6">
            共 {{ scheduleData.length }} 个行程安排
          </div>
        </q-card-section>
      </q-card>

      <!-- 日期筛选 -->
      <q-card class="filter-card q-mb-md" flat bordered>
        <q-card-section class="q-py-sm">
          <div class="row q-gutter-xs">
            <q-btn 
              v-for="date in uniqueDates" 
              :key="date"
              :label="formatDateLabel(date)"
              :color="selectedDate === date ? 'red-6' : 'grey-4'"
              :text-color="selectedDate === date ? 'white' : 'dark'"
              size="sm"
              unelevated
              @click="selectedDate = selectedDate === date ? '' : date"
              class="date-filter-btn"
            />
          </div>
        </q-card-section>
      </q-card>

      <!-- 行程列表 -->
      <div class="schedule-list">
        <q-card 
          v-for="(item, index) in filteredSchedule" 
          :key="index"
          class="schedule-item q-mb-md"
          :class="{ completed: item.completed }"
          :data-type="item.type"
          flat 
          bordered
        >
          <q-card-section class="q-pb-none">
            <!-- 日期和时间段 -->
            <div class="schedule-header">
              <div class="date-badge">
                <q-icon name="calendar_today" size="1rem" class="q-mr-xs" />
                {{ item.date }}
              </div>
              <div class="time-period">
                <q-chip 
                  :color="item.period === '上午' ? 'orange-3' : item.period === '下午' ? 'blue-3' : 'purple-3'"
                  text-color="dark"
                  size="sm"
                >
                  {{ item.period }}
                </q-chip>
              </div>
            </div>

            <!-- 地点信息 -->
            <div class="location-info q-mt-sm">
              <div class="location-name">
                <q-icon name="place" color="red-6" class="q-mr-xs" />
                <span class="text-h6">{{ item.location }}</span>
              </div>
              <div class="location-type text-caption text-grey-6 q-ml-lg">
                {{ item.type }}
              </div>
            </div>
          </q-card-section>

          <q-card-section class="q-pt-sm">
            <!-- 活动详情 -->
            <div class="activity-details">
              <div class="activity-time q-mb-sm">
                <q-icon name="access_time" size="1rem" color="primary" class="q-mr-xs" />
                <span class="text-weight-medium">{{ item.time }}</span>
                <span class="text-grey-6 q-ml-sm">{{ item.duration }}</span>
              </div>
              
              <div class="activity-description">
                <p class="text-body2 q-mb-sm">{{ item.description }}</p>
                <div v-if="item.highlights && item.highlights.length" class="highlights">
                  <q-chip 
                    v-for="highlight in item.highlights"
                    :key="highlight"
                    color="red-1"
                    text-color="red-8"
                    size="sm"
                    class="q-mr-xs q-mb-xs"
                  >
                    {{ highlight }}
                  </q-chip>
                </div>
              </div>

              <!-- 费用信息 -->
              <div v-if="item.cost" class="cost-info q-mt-sm">
                <q-icon name="payments" color="green-6" class="q-mr-xs" />
                <span class="text-weight-medium text-green-8">{{ item.cost }}</span>
              </div>

              <!-- 备注信息 -->
              <div v-if="item.notes" class="notes-info q-mt-sm">
                <q-icon name="info" color="orange-6" class="q-mr-xs" />
                <span class="text-caption text-grey-7">{{ item.notes }}</span>
              </div>
            </div>
          </q-card-section>

          <!-- 操作按钮 -->
          <q-card-actions class="q-px-md q-pb-md">
            <q-btn 
              flat 
              size="sm" 
              color="primary" 
              icon="map"
              label="导航"
              @click="openNavigation(item)"
            />
            <q-btn 
              flat 
              size="sm" 
              color="secondary" 
              icon="share"
              label="分享"
              @click="shareItem(item)"
            />
            <q-space />
            <q-btn 
              flat 
              size="sm" 
              :icon="item.completed ? 'check_circle' : 'radio_button_unchecked'"
              :color="item.completed ? 'positive' : 'grey'"
              @click="toggleCompleted(item)"
            />
          </q-card-actions>
        </q-card>
      </div>

      <!-- 空状态 -->
      <div v-if="filteredSchedule.length === 0" class="empty-state text-center q-py-xl">
        <q-icon name="event_busy" size="3rem" color="grey-4" />
        <div class="text-h6 text-grey-6 q-mt-md">暂无行程安排</div>
        <div class="text-caption text-grey-5">请选择其他日期查看</div>
      </div>
    </div>
  </q-page>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useQuasar } from 'quasar'

const $q = useQuasar()

// 行程数据接口
interface ScheduleItem {
  date: string
  period: '上午' | '下午' | '晚上'
  time: string
  duration?: string
  location: string
  type: string
  description: string
  highlights?: string[]
  cost?: string
  notes?: string
  completed: boolean
}

// 响应式数据
const selectedDate = ref('')

// 严格按照图片中的数据创建结构化行程
const scheduleData = ref<ScheduleItem[]>([
  // 10.4 上午 - 出发
  {
    date: '10.4',
    period: '上午',
    time: '出发',
    location: '南京→嘉兴',
    type: '交通',
    description: 'G2586，8:28-12:34，375元/人',
    cost: '375元/人',
    highlights: ['3号线上溪站乘坐', '4号线换乘东站'],
    notes: '济南高铁一约5小时(9km)，经停打浦桥地铁，人多需要提前预订座位票',
    completed: false
  },
  // 10.4 下午 - 嘉兴
  {
    date: '10.4',
    period: '下午',
    time: '开车时间',
    location: '嘉兴',
    type: '景点',
    description: '全天开放，免费',
    highlights: ['开车游览', '免费景点'],
    notes: '下午开车第一站，便民出行观光站点—清水镇',
    completed: false
  },
  // 10.4 下午 - 大塘浜
  {
    date: '10.4',
    period: '下午',
    time: '开车时间',
    location: '大塘浜',
    type: '景点',
    description: '全天开放，免费',
    highlights: ['开车游览', '免费景点'],
    notes: '打卡景点，有关天然景色分析，西湖景色去处',
    completed: false
  },
  // 10.4 下午 - 庄史村
  {
    date: '10.4',
    period: '下午',
    time: '开车时间',
    location: '庄史村',
    type: '景点',
    description: '8点-21点营业，40元/人',
    cost: '40元/人',
    highlights: ['营业时间长', '性价比高'],
    notes: '不用买票上山，需开车10-40分钟，看农村乡俗',
    completed: false
  },
  // 10.5 上午 - 野鸭湖
  {
    date: '10.5',
    period: '上午',
    time: '7点-20点',
    location: '野鸭湖',
    type: '景点',
    description: '40元/人，共83元/人',
    cost: '83元/人',
    highlights: ['湖景观光', '野生动物'],
    notes: '南门→药家奇景→南门→亭子景区后台→坝库→万方桥后→北门',
    completed: false
  },
  // 10.5 上午 - 五芳斋
  {
    date: '10.5',
    period: '上午',
    time: '7点-22点',
    location: '五芳斋',
    type: '美食',
    description: '免费',
    highlights: ['嘉兴特色', '传统美食'],
    notes: '南门门店开门，五芳斋美食(广场北侧)，嘉兴特色，普通价格15分钟(9:00-17:00)',
    completed: false
  },
  // 10.5 下午 - 海宁皮革广场
  {
    date: '10.5',
    period: '下午',
    time: '免费',
    location: '海宁皮革广场',
    type: '购物',
    description: '广场高档皮革制品，可选购(35元)投保',
    cost: '35元/件',
    highlights: ['皮革制品', '购物中心'],
    notes: '10:00-18:00 20:00 全年营业！当地特产20元',
    completed: false
  },
  // 10.5 下午 - 沈家
  {
    date: '10.5',
    period: '下午',
    time: '全天开放',
    location: '沈家',
    type: '景点',
    description: '免费',
    highlights: ['免费景点', '古镇风情'],
    notes: '警告：济南地下反恐管制(单人大客车)',
    completed: false
  },
  // 10.5 下午 - 西水学府
  {
    date: '10.5',
    period: '下午',
    time: '免费',
    location: '西水学府',
    type: '景点',
    description: '免费',
    highlights: ['学府风光', '文化景点'],
    notes: '学府内有4个时时的自由景',
    completed: false
  },
  // 10.6 上午 - 海宁潮观潮胜地
  {
    date: '10.6',
    period: '上午',
    time: '09:00-17:00',
    location: '海宁潮观潮胜地',
    type: '自然景观',
    description: '观潮，巨星观潮六大奇迹(9:30)，PP-12点',
    cost: '68元/人',
    highlights: ['观潮胜地', '自然奇观'],
    notes: '4号线到大火车一海港观潮工艺术大观！4号线到大火车，通过到到海港观潮(观潮之路)！',
    completed: false
  },
  // 10.6 下午 - 八卦田
  {
    date: '10.6',
    period: '下午',
    time: '美景广场',
    location: '八卦田',
    type: '景点',
    description: '登高一景色，DQBS(16:41-18:47)，青岛去一区域(青岛到杭州大量去观光/白话)',
    highlights: ['登高望远', '摄影胜地'],
    notes: '海宁到临海的，基础设施不错，但是较收费较高550，易到达的小景点较少',
    completed: false
  },
  // 10.6 晚上 - 古石桥商务酒店
  {
    date: '10.6',
    period: '晚上',
    time: '晚餐',
    location: '古石桥商务酒店',
    type: '住宿',
    description: '商务一百餐厅，酒店5号楼体验',
    highlights: ['商务酒店', '餐厅用餐'],
    notes: '诺奖一晚定价目前计算机中心，打车约19，30-22：00，导航便民中心上登录',
    completed: false
  },
  // 10.7 上午 - 古镇水乡游船
  {
    date: '10.7',
    period: '上午',
    time: '09:00-18:00',
    location: '古镇水乡游船',
    type: '水上游览',
    description: '游船体验，观光游览船体验(25元)',
    cost: '25元/人',
    highlights: ['水乡游船', '观光体验'],
    notes: '体验古镇水乡游船，观光游览船体验，深度体验船游记忆',
    completed: false
  },
  // 10.7 上午 - 天王寺景区原汁大观园
  {
    date: '10.7',
    period: '上午',
    time: '第一时间六：8：00开始：00，当日10：00开始：00',
    location: '天王寺景区原汁大观园',
    type: '寺庙',
    description: '10元/人',
    cost: '10元/人',
    highlights: ['寺庙参观', '文化体验'],
    notes: '门口服务台，不用排队',
    completed: false
  },
  // 10.7 上午 - 储钧山
  {
    date: '10.7',
    period: '上午',
    time: '00:00-20:00',
    location: '储钧山',
    type: '山景',
    description: '免费，但需要打口门票二级景区',
    highlights: ['登山健身', '免费景点'],
    notes: '需爬山10人/人，半天',
    completed: false
  },
  // 10.7 上午 - 小黄岛
  {
    date: '10.7',
    period: '上午',
    time: '免费',
    location: '小黄岛',
    type: '海岛',
    description: '免费',
    highlights: ['海岛风光', '免费景点'],
    notes: '本人小岛各种各种台，但需要上午6点半一体验新鲜台，游客各种台风各种台体验台，全天',
    completed: false
  },
  // 10.7 下午 - 嘉园
  {
    date: '10.7',
    period: '下午',
    time: '免费',
    location: '嘉园',
    type: '园林',
    description: '免费',
    highlights: ['园林景观', '免费景点'],
    notes: '本人各种景观一景观景，但需景观景观，现在没有景观台50，易到达景观一景',
    completed: false
  },
  // 10.7 下午 - 小黄山公园
  {
    date: '10.7',
    period: '下午',
    time: '06:00-20:00',
    location: '小黄山公园',
    type: '公园',
    description: '免费',
    highlights: ['公园游览', '免费景点'],
    notes: '基地，2号5号高速各种台基地，可以经常一清洁浪费，但可以经一杯子景观景观景观景观各种',
    completed: false
  },
  // 10.7 下午 - 栈桥
  {
    date: '10.7',
    period: '下午',
    time: '门票',
    location: '栈桥',
    type: '桥梁',
    description: '需要门票45，但需7:00-19:30，灵活9:00-17:30',
    cost: '45元/人',
    highlights: ['桥梁景观', '观景台'],
    notes: '不用排队，但需要时间',
    completed: false
  },
  // 10.7 下午 - 自然风景区
  {
    date: '10.7',
    period: '下午',
    time: '汉城(青岛到杭州大量去观光/白话)一清景观景，1.8km',
    location: '自然风景区',
    type: '自然景观',
    description: '06:00-20:00',
    highlights: ['自然风光', '风景区'],
    notes: '免费',
    completed: false
  },
  // 10.8 上午 - 小黄岛
  {
    date: '10.8',
    period: '上午',
    time: '免费',
    location: '小黄岛',
    type: '海岛',
    description: '免费',
    highlights: ['海岛游览', '免费景点'],
    notes: '海岛游一景观景观一景观景观一景观景观一景观各种一景观景观',
    completed: false
  },
  // 10.8 上午 - 大平山景园
  {
    date: '10.8',
    period: '上午',
    time: '08:30-19:30',
    location: '大平山景园',
    type: '山景',
    description: '景区500元/人',
    cost: '500元/人',
    highlights: ['山景游览', '景区体验'],
    notes: '17号到中山景区，大平景到一景景到景景，各种景到了到景景，各种景到了到景景',
    completed: false
  },
  // 10.8 上午 - 八大关
  {
    date: '10.8',
    period: '上午',
    time: '全天开放',
    location: '八大关',
    type: '历史街区',
    description: '免费',
    highlights: ['历史建筑', '免费景点'],
    notes: '青岛十一个收费各种各种，但收费各种各种，全天收费各种各种到了各种各种到了',
    completed: false
  },
  // 10.8 下午 - 第二海水浴场
  {
    date: '10.8',
    period: '下午',
    time: '免费',
    location: '第二海水浴场',
    type: '海滩',
    description: '免费',
    highlights: ['海滩游玩', '免费景点'],
    notes: '冷敷各种1元/人，科学到各种4小时',
    completed: false
  },
  // 10.8 下午 - 青岛啤酒
  {
    date: '10.8',
    period: '下午',
    time: '08:00-18:20，【机场到到】9:50min',
    location: '青岛啤酒',
    type: '工厂参观',
    description: '青岛到各种各种1:50(上海)',
    highlights: ['啤酒文化', '工厂参观'],
    notes: '青岛各种各种一清景到一景景到各种各种一各种景到一各种，到各种各种各种200各种各种各种',
    completed: false
  },
  // 10.8 晚上 - 返程
  {
    date: '10.8',
    period: '晚上',
    time: '返程',
    location: '青岛→上海东D2271 18:19-23:54',
    type: '交通',
    description: '青岛→上海东D2271 18:19-23:54',
    highlights: ['高铁返程', '结束行程'],
    completed: false
  }
])

// 计算属性
const uniqueDates = computed(() => {
  const dates = [...new Set(scheduleData.value.map(item => item.date))]
  return dates.sort()
})

const filteredSchedule = computed(() => {
  if (!selectedDate.value) {
    return scheduleData.value
  }
  return scheduleData.value.filter(item => item.date === selectedDate.value)
})

// 方法
const formatDateLabel = (date: string) => {
  const dateMap: Record<string, string> = {
    '10.4': '10月4日',
    '10.5': '10月5日', 
    '10.6': '10月6日',
    '10.7': '10月7日',
    '10.8': '10月8日'
  }
  return dateMap[date] || date
}

const openNavigation = (item: ScheduleItem) => {
  // 尝试打开地图导航
  const query = encodeURIComponent(item.location)
  const mapUrl = `https://uri.amap.com/navigation?to=${query}`
  
  try {
    window.open(mapUrl, '_blank')
  } catch (error) {
    $q.notify({
      message: `导航到: ${item.location}`,
      color: 'primary',
      icon: 'navigation'
    })
  }
}

const shareItem = (item: ScheduleItem) => {
  const shareText = `${item.date} ${item.period} - ${item.location}\n${item.description}`
  
  if (navigator.share) {
    navigator.share({
      title: '国庆行程分享',
      text: shareText,
    }).catch(() => {
      copyTextToClipboard(shareText)
    })
  } else {
    copyTextToClipboard(shareText)
  }
}

const copyTextToClipboard = (text: string) => {
  navigator.clipboard.writeText(text).then(() => {
    $q.notify({
      message: '行程信息已复制到剪贴板',
      color: 'positive',
      icon: 'content_copy'
    })
  }).catch(() => {
    $q.notify({
      message: '复制失败',
      color: 'negative',
      icon: 'error'
    })
  })
}

const toggleCompleted = (item: ScheduleItem) => {
  item.completed = !item.completed
  $q.notify({
    message: item.completed ? '已标记为完成' : '已标记为未完成',
    color: item.completed ? 'positive' : 'info',
    icon: item.completed ? 'check_circle' : 'radio_button_unchecked'
  })
}
</script>

<style lang="scss" scoped>
.national-day-plan-page {
  .page-container {
    max-width: 800px;
    margin: 0 auto;
    padding: 16px;
  }

  .page-header {
    display: flex;
    align-items: center;
    justify-content: center;
    margin-bottom: 24px;
    
    .page-title {
      margin: 0;
      font-size: 1.8rem;
      font-weight: 600;
      color: #d32f2f;
      text-align: center;
    }
  }

  .plan-overview {
    border-radius: 12px;
    overflow: hidden;
  }

  .filter-card {
    border-radius: 12px;
    
    .date-filter-btn {
      border-radius: 20px;
      transition: all 0.2s ease;
    }
  }

  .schedule-list {
    .schedule-item {
      border-radius: 12px;
      transition: all 0.2s ease;
      border-left: 4px solid transparent;
      
      &:hover {
        transform: translateY(-2px);
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
      }
      
      .schedule-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 8px;
        
        .date-badge {
          display: flex;
          align-items: center;
          font-weight: 600;
          color: #1976d2;
        }
        
        .time-period {
          .q-chip {
            font-weight: 500;
          }
        }
      }
      
      .location-info {
        .location-name {
          display: flex;
          align-items: center;
          margin-bottom: 4px;
          
          span {
            font-weight: 600;
          }
        }
        
        .location-type {
          font-style: italic;
        }
      }
      
      .activity-details {
        .activity-time {
          display: flex;
          align-items: center;
        }
        
        .activity-description {
          p {
            line-height: 1.5;
          }
          
          .highlights {
            margin-top: 8px;
          }
        }
        
        .cost-info {
          display: flex;
          align-items: center;
          padding: 8px 12px;
          background: rgba(76, 175, 80, 0.1);
          border-radius: 8px;
          border-left: 3px solid #4caf50;
        }
        
        .notes-info {
          display: flex;
          align-items: flex-start;
          padding: 8px 12px;
          background: rgba(255, 152, 0, 0.1);
          border-radius: 8px;
          border-left: 3px solid #ff9800;
        }
      }
      
      // 根据类型设置不同的左边框颜色
      &[data-type="交通"] {
        border-left-color: #2196f3;
      }
      
      &[data-type="景点"] {
        border-left-color: #4caf50;
      }
      
      &[data-type="美食"] {
        border-left-color: #ff9800;
      }
      
      &[data-type="购物"] {
        border-left-color: #e91e63;
      }
      
      &[data-type="自然景观"] {
        border-left-color: #009688;
      }
      
      &[data-type="古镇"] {
        border-left-color: #795548;
      }
      
      &[data-type="园林"] {
        border-left-color: #8bc34a;
      }
      
      &[data-type="山景"] {
        border-left-color: #607d8b;
      }
    }
  }

  .empty-state {
    .q-icon {
      margin-bottom: 16px;
    }
  }
}

// 响应式设计
@media (max-width: 600px) {
  .national-day-plan-page {
    .page-container {
      padding: 12px;
    }
    
    .page-header .page-title {
      font-size: 1.5rem;
    }
    
    .schedule-list {
      .schedule-item {
        .schedule-header {
          flex-direction: column;
          align-items: flex-start;
          gap: 8px;
        }
        
        .location-info .location-name {
          span {
            font-size: 1.1rem;
          }
        }
      }
    }
    
    .filter-card {
      .row {
        justify-content: center;
      }
      
      .date-filter-btn {
        min-width: auto;
        padding: 4px 12px;
      }
    }
  }
}

@media (max-width: 400px) {
  .national-day-plan-page {
    .page-container {
      padding: 8px;
    }
    
    .filter-card .row {
      flex-direction: column;
      align-items: stretch;
      
      .date-filter-btn {
        margin-bottom: 4px;
        width: 100%;
      }
    }
    
    .schedule-list .schedule-item {
      .activity-details {
        .cost-info,
        .notes-info {
          flex-direction: column;
          align-items: flex-start;
          
          .q-icon {
            margin-bottom: 4px;
          }
        }
      }
      
      .q-card-actions {
        flex-wrap: wrap;
        justify-content: space-between;
        
        .q-btn {
          min-width: 80px;
          margin-bottom: 4px;
        }
      }
    }
  }
}

// 完成状态样式
.schedule-item.completed {
  opacity: 0.7;
  
  .location-name span {
    text-decoration: line-through;
  }
}
</style>

