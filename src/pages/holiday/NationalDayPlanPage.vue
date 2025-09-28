<template>
  <q-page class="national-day-plan-page">
    <div class="page-container">
      <!-- 行程统计信息 -->
      <div class="schedule-stats">
        <span class="text-caption text-grey-6">
          共 {{ scheduleData.length }} 个行程安排 · 济南→淄博→青岛 · 5天行程
        </span>
        <q-btn 
          flat 
          dense 
          size="sm" 
          icon="image" 
          label="查看原图" 
          color="grey-5"
          class="view-original-btn q-ml-md"
          @click="showOriginalImage = true"
        />
      </div>
      
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

    <!-- 原图查看对话框 -->
    <q-dialog v-model="showOriginalImage" maximized>
      <q-card class="bg-black">
        <q-card-section class="q-pa-none full-height">
          <div class="full-height flex flex-center">
            <q-img 
              src="/国庆计划.jpg"
              alt="国庆计划原图"
              fit="contain"
              class="full-width full-height"
            >
              <template v-slot:loading>
                <q-inner-loading showing color="primary" />
              </template>
              <template v-slot:error>
                <div class="absolute-full flex flex-center bg-negative text-white">
                  <q-icon name="broken_image" size="2rem" class="q-mr-sm" />
                  图片加载失败
                </div>
              </template>
            </q-img>
          </div>
          
          <!-- 关闭按钮 -->
          <q-btn 
            icon="close" 
            flat 
            round 
            dense 
            v-close-popup 
            class="absolute-top-right q-ma-md text-white"
            size="lg"
          />
          
          <!-- 下载按钮 -->
          <q-btn 
            icon="download" 
            flat 
            round 
            dense 
            @click="downloadOriginalImage"
            class="absolute-top-left q-ma-md text-white"
            size="lg"
          />
        </q-card-section>
      </q-card>
    </q-dialog>
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
const showOriginalImage = ref(false)

// 根据fullPlan.md的完整数据创建结构化行程
const scheduleData = ref<ScheduleItem[]>([
  // 10.4 上午 - 出发
  {
    date: '10.4',
    period: '上午',
    time: '08:28-12:34',
    location: '南通→济南西',
    type: '交通',
    description: 'G2586次列车，375元/人',
    cost: '375元/人',
    highlights: ['高铁出行', '4小时车程'],
    notes: '3号晚上返回东城，4号预约顺风车从东城前往南通站',
    completed: false
  },
  // 10.4 下午 - 黑虎泉
  {
    date: '10.4',
    period: '下午',
    time: '全天开放',
    location: '黑虎泉',
    type: '景点',
    description: '免费，泉城探访第一站',
    highlights: ['免费景点', '泉城特色'],
    notes: '导航至解放阁入口，沿途经过九女泉→白石泉(可打水)→玛瑙泉→黑虎泉',
    completed: false
  },
  // 10.4 下午 - 护城河游船
  {
    date: '10.4',
    period: '下午',
    time: '09:00-17:00',
    location: '护城河游船',
    type: '水上游览',
    description: '黑虎泉→大明湖西，50元/人',
    cost: '50元/人',
    highlights: ['水上观光', '建议16:00班次'],
    notes: '微信小程序"天下第一泉"购买，手机购票最佳位置1、2号',
    completed: false
  },
  // 10.4 下午 - 大明湖
  {
    date: '10.4',
    period: '下午',
    time: '06:00-22:00',
    location: '大明湖',
    type: '景点',
    description: '免费，打卡夏雨荷拍摄地',
    highlights: ['还珠格格拍摄地', '夕阳拍摄'],
    notes: '在大明湖拍摄夕阳，感受济南湖光山色',
    completed: false
  },
  // 10.4 下午 - 超然楼
  {
    date: '10.4',
    period: '下午',
    time: '08:00-21:30',
    location: '超然楼',
    type: '景点',
    description: '免费上楼，每晚18:40亮灯',
    highlights: ['免费登楼', '夜景观赏'],
    notes: '拍照机位：南丰祠新区游船码头可拍南丰桥与超然楼同框',
    completed: false
  },
  // 10.4 下午 - 陈氏肥蛤
  {
    date: '10.4',
    period: '下午',
    time: '用餐时间',
    location: '陈氏肥蛤(圣凯财富广场店)',
    type: '美食',
    description: '济南特色美食',
    highlights: ['当地特色', '提前确认'],
    notes: '提前打电话确认，若人多则点外卖或更换餐厅',
    completed: false
  },
  // 10.5 上午 - 趵突泉
  {
    date: '10.5',
    period: '上午',
    time: '07:00-20:00',
    location: '趵突泉',
    type: '景点',
    description: '门票40元/人(抖音37元/人)',
    cost: '40元/人',
    highlights: ['天下第一泉', '李清照纪念堂'],
    notes: '免费入园时间：05:00-06:30和18:00-22:30，游览路线：东门→龟石→漱玉泉→李清照纪念堂→三大殿→趵突泉→万竹园→南门',
    completed: false
  },
  // 10.5 上午 - 五龙喷泉
  {
    date: '10.5',
    period: '上午',
    time: '09:00-17:00',
    location: '五龙喷泉',
    type: '景点',
    description: '整点启动15分钟表演',
    highlights: ['音乐喷泉', '整点表演'],
    notes: '位于广场西北角，整点启动15分钟',
    completed: false
  },
  // 10.5 上午 - 曲水亭街
  {
    date: '10.5',
    period: '上午',
    time: '全天开放',
    location: '曲水亭街',
    type: '古街',
    description: '一条南北向主街+两条东西向次街',
    highlights: ['古街风情', '文创购物'],
    notes: '主街以紫米饼、炒锅饼、文创为主；东一街是本地菜市场；东二街商业化面向游客',
    completed: false
  },
  // 10.5 下午 - 五龙潭公园
  {
    date: '10.5',
    period: '下午',
    time: '全天开放',
    location: '五龙潭公园',
    type: '景点',
    description: '门票30元/人',
    cost: '30元/人',
    highlights: ['泉水景观', '邓恩铭塑像'],
    notes: '免费入园时间：05:00-06:30和18:00-22:30，建议南门进东门出',
    completed: false
  },
  // 10.5 下午 - 珍珠泉
  {
    date: '10.5',
    period: '下午',
    time: '10:00/15:00/20:00',
    location: '珍珠泉',
    type: '景点',
    description: '喷泉表演，每场约20分钟',
    highlights: ['珍珠泉喷涌', '定时表演'],
    notes: '位于济南历下区院前街1号(省人大院内)',
    completed: false
  },
  // 10.6 上午 - 济南→淄博
  {
    date: '10.6',
    period: '上午',
    time: '08:50-09:32',
    location: '济南→淄博',
    type: '交通',
    description: 'D6071次列车',
    highlights: ['城际交通', '42分钟车程'],
    notes: '到达淄博后需要寄存行李，有多种寄存方案可选',
    completed: false
  },
  // 10.6 上午 - 淄博陶瓷琉璃博物馆
  {
    date: '10.6',
    period: '上午',
    time: '09:00-12:00',
    location: '淄博陶瓷琉璃博物馆',
    type: '博物馆',
    description: '免费，需提前7天预约',
    highlights: ['琉璃艺术', '镇馆之宝'],
    notes: '游览路线：4楼琉璃灯工厅→5色厅→3楿国粹厅→2楿古瓷厅，重点看战国琉璃珠和青釉莲花尊',
    completed: false
  },
  // 10.6 下午 - 淄博美食
  {
    date: '10.6',
    period: '下午',
    time: '用餐时间',
    location: '淄博美食街',
    type: '美食',
    description: '品尝淄博特色美食',
    highlights: ['白老三炒锅饼', '博山菜', '淄博烧烤'],
    notes: '推荐：🌟白老三炒锅饼，🍱博山菜(炸肉、风味茄子)，🍢烧烤(离开前再去吃一次)',
    completed: false
  },
  // 10.6 下午 - 购物
  {
    date: '10.6',
    period: '下午',
    time: '下午时光',
    location: '淄博商业区',
    type: '购物',
    description: '买饰品和小礼物',
    highlights: ['特色纪念品', '淄博特产'],
    notes: '为朋友和家人挑选淄博特色小礼物',
    completed: false
  },
  // 10.6 晚上 - 前往青岛
  {
    date: '10.6',
    period: '晚上',
    time: '晚间',
    location: '淄博→青岛',
    type: '交通',
    description: '前往青岛，准备海滨之旅',
    highlights: ['转战青岛', '海滨城市'],
    completed: false
  },
  // 10.6 晚上 - 奥帆中心灯光秀
  {
    date: '10.6',
    period: '晚上',
    time: '19:30-22:00',
    location: '奥帆中心',
    type: '景点',
    description: '灯光秀表演',
    highlights: ['奥帆灯光秀', '海上剧场'],
    notes: '导航至奥帆中心海上剧场',
    completed: false
  },
  // 10.6 晚上 - 来之顺海鲜
  {
    date: '10.6',
    period: '晚上',
    time: '晚餐时间',
    location: '来之顺海鲜菜馆',
    type: '美食',
    description: '青岛海鲜大餐',
    highlights: ['海肠捞饭', '青岛海鲜'],
    notes: '美团已购买套餐，地铁3号线转2号线到奥帆中心共7站',
    completed: false
  },
  // 10.7 上午 - 石老人海水浴场
  {
    date: '10.7',
    period: '上午',
    time: '09:00-18:00',
    location: '石老人海水浴场',
    type: '海滩',
    description: '赶海体验，可看日出(05:50)',
    highlights: ['赶海体验', '日出观赏'],
    notes: '预测21:00后退潮，提前美团购买赶海工具包(23元/套)，导航至石老人健身区停车场',
    completed: false
  },
  // 10.7 上午 - 小麦岛
  {
    date: '10.7',
    period: '上午',
    time: '全天开放',
    location: '小麦岛',
    type: '景点',
    description: '网红打卡地，寻找"孤独的树"',
    highlights: ['网红打卡', '孤独的树', '日出观赏'],
    notes: '导航至雕塑园3号门，游览路线：进岛直走→小海豚左转→木栈道→白色石子路→蓝色房子"五棵树"→石头墙→小路深处"孤独的树"',
    completed: false
  },
  // 10.7 上午 - 天主教堂
  {
    date: '10.7',
    period: '上午',
    time: '08:00-18:00',
    location: '浙江路天主教堂',
    type: '教堂',
    description: '门票10元/人，门口拍照即可',
    cost: '10元/人',
    highlights: ['哥特式建筑', '拍照打卡'],
    notes: '周日10:00-18:00开放，门口拍照即可无需入内',
    completed: false
  },
  // 10.7 下午 - 五四广场
  {
    date: '10.7',
    period: '下午',
    time: '全天开放',
    location: '五四广场',
    type: '广场',
    description: '青岛标志性广场',
    highlights: ['五四雕塑', '海滨广场'],
    notes: '地铁3号线坐6站到达',
    completed: false
  },
  // 10.8 上午 - 小鱼山公园
  {
    date: '10.8',
    period: '上午',
    time: '06:00-20:00',
    location: '小鱼山公园',
    type: '公园',
    description: '免费，最佳观景点',
    highlights: ['览潮阁观景', '红屋顶全景'],
    notes: '游览路线：正门入口(福山支路)→览潮阁(山顶2楼3楼观景台)→碧波亭→拥翠亭→下山，可看第一海水浴场、远眺栈桥和教堂',
    completed: false
  },
  // 10.8 上午 - 栈桥
  {
    date: '10.8',
    period: '上午',
    time: '全天开放',
    location: '栈桥',
    type: '景点',
    description: '青岛标志性景点，免费',
    highlights: ['青岛地标', '海上栈桥'],
    notes: '青岛最著名的地标建筑',
    completed: false
  },
  // 10.8 上午 - 小青岛
  {
    date: '10.8',
    period: '上午',
    time: '06:00-20:00',
    location: '小青岛',
    type: '海岛',
    description: '免费，环岛游览',
    highlights: ['白色灯塔', '海边礁石'],
    notes: '游览路线：上岛后往左边环岛走一圈(海边礁石→堤坝→蘑菇亭→贝壳亭→转角石阶→石板路→龙柏树→白色灯塔→小火车轨礁石)',
    completed: false
  },
  // 10.8 上午 - 太平山索道
  {
    date: '10.8',
    period: '上午',
    time: '08:30-19:30',
    location: '太平山索道',
    type: '索道',
    description: '单程票80元/人，拍照效果最佳',
    cost: '80元/人',
    highlights: ['山顶观景', '专业拍照'],
    notes: '打车到湛山寺南门，大门左边走到厕所旁边小门进入，有工作人员指导摆姿势，照片+电子档30元',
    completed: false
  },
  // 10.8 下午 - 八大关
  {
    date: '10.8',
    period: '下午',
    time: '全天开放',
    location: '八大关',
    type: '历史街区',
    description: '街区免费，部分建筑收费',
    highlights: ['万国建筑', '花石楼', '公主楼'],
    notes: '游览路线：中山公园C出口→韶关路→嘉峪关路→临淮关路(龙柏树拍照)→公主楼→蝴蝶楼→花石楼(推荐二楼观景台)',
    completed: false
  },
  // 10.8 下午 - 第二海水浴场
  {
    date: '10.8',
    period: '下午',
    time: '全天开放',
    location: '第二海水浴场',
    type: '海滩',
    description: '冲脚1元/次，储物柜20元/小时',
    cost: '1元/次',
    highlights: ['海滩游玩', '山洞拍照'],
    notes: '有山洞可打卡拍照(随缘逛)',
    completed: false
  },
  // 10.8 下午 - 青岛轮渡
  {
    date: '10.8',
    period: '下午',
    time: '08:00-18:20',
    location: '青岛轮渡',
    type: '水上游览',
    description: '海上观光30分钟，89元/人',
    cost: '89元/人',
    highlights: ['海上观光', '免费啤酒'],
    notes: '抖音132元/两人已购买，凭游船纸质票可领取200毫升啤酒或饮料一杯及一份鸥食',
    completed: false
  },
  // 10.8 晚上 - 返程
  {
    date: '10.8',
    period: '晚上',
    time: '18:19-23:34',
    location: '青岛北→上海松江',
    type: '交通',
    description: 'D2911次列车返程',
    highlights: ['高铁返程', '结束旅程'],
    notes: '5小时15分钟车程，结束愉快的山东之旅',
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

const downloadOriginalImage = () => {
  const link = document.createElement('a')
  link.href = '/国庆计划.jpg'
  link.download = '国庆计划原图.jpg'
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  
  $q.notify({
    message: '原图下载已开始',
    color: 'positive',
    icon: 'download'
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

  .schedule-stats {
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 8px 0 16px 0;
    border-bottom: 1px solid rgba(255, 255, 255, 0.12);
    margin-bottom: 16px;
    
    .text-caption {
      font-size: 0.75rem;
      line-height: 1.4;
    }
    
    .view-original-btn {
      opacity: 0.6;
      transition: opacity 0.2s ease;
      
      &:hover {
        opacity: 1;
      }
    }
  }


  .filter-card {
    border-radius: 12px;
    border-color: rgba(255, 255, 255, 0.12);
    
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
      border-color: rgba(255, 255, 255, 0.12);
      
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
    
    .schedule-stats {
      flex-direction: column;
      gap: 8px;
      
      .view-original-btn {
        font-size: 0.75rem;
      }
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

// 深色模式适配
.body--dark {
  .national-day-plan-page {
    .schedule-stats {
      border-bottom-color: rgba(255, 255, 255, 0.12);
    }
    
    .filter-card {
      border-color: rgba(255, 255, 255, 0.12);
      background: rgba(255, 255, 255, 0.05);
    }
    
    .schedule-list .schedule-item {
      border-color: rgba(255, 255, 255, 0.12);
      background: rgba(255, 255, 255, 0.05);
      
      &:hover {
        background: rgba(255, 255, 255, 0.08);
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
      }
      
      .activity-details {
        .cost-info {
          background: rgba(76, 175, 80, 0.15);
          border-left-color: #4caf50;
        }
        
        .notes-info {
          background: rgba(255, 152, 0, 0.15);
          border-left-color: #ff9800;
        }
      }
    }
  }
}
</style>

