<template>
  <q-page class="holiday-page q-pa-md">
    <div class="q-mx-auto" style="max-width: 1200px">
      <!-- 页面标题 -->
      <div class="text-center q-mb-lg">
        <h1 class="text-h4 text-weight-bold q-mb-sm">法定节假日日历</h1>
        <p class="text-subtitle1 text-grey-7">查看今年的法定节假日和火车票预售时间</p>
      </div>

      <!-- 下一个节假日倒计时 -->
      <section class="next-holiday-section glass rounded-xl overflow-hidden shadow-2xl q-mb-xl">
        <div class="q-pa-md">
          <div v-if="nextHoliday" class="row items-center">
            <div class="col-12 col-md-6 q-pa-md">
              <h2 class="text-h5 text-weight-bold q-mb-md">下一个节假日</h2>
              <div class="text-h3 text-primary q-mb-sm">{{ nextHoliday.name }}</div>
              <div class="text-subtitle1 q-mb-md">
                {{ formatDateRange(nextHoliday.startDate, nextHoliday.endDate) }}
                <q-badge color="green" class="q-ml-sm">{{ nextHoliday.days }}天</q-badge>
              </div>
              <div class="text-h6 q-mb-xs">距离假期还有</div>
              <div class="countdown-timer row q-col-gutter-md q-mb-md">
                <div class="col-3 text-center">
                  <div class="timer-box">{{ countdownDays }}</div>
                  <div class="timer-label">天</div>
                </div>
                <div class="col-3 text-center">
                  <div class="timer-box">{{ countdownHours }}</div>
                  <div class="timer-label">时</div>
                </div>
                <div class="col-3 text-center">
                  <div class="timer-box">{{ countdownMinutes }}</div>
                  <div class="timer-label">分</div>
                </div>
                <div class="col-3 text-center">
                  <div class="timer-box">{{ countdownSeconds }}</div>
                  <div class="timer-label">秒</div>
                </div>
              </div>
            </div>
            <div class="col-12 col-md-6 q-pa-md">
              <h2 class="text-h5 text-weight-bold q-mb-md">火车票预售时间</h2>
              <div v-if="ticketSaleDate && isTicketSaleOpen" class="text-positive text-h6 q-mb-md">
                <q-icon name="check_circle" size="sm" class="q-mr-xs" />
                火车票已开售！
              </div>
              <div v-else-if="ticketSaleDate" class="q-mb-md">
                <div class="text-subtitle1 q-mb-xs">开售日期：{{ formatDate(ticketSaleDate) }}</div>
                <div class="text-h6 q-mb-xs">距离开售还有</div>
                <div class="countdown-timer row q-col-gutter-md">
                  <div class="col-3 text-center">
                    <div class="timer-box">{{ ticketCountdownDays }}</div>
                    <div class="timer-label">天</div>
                  </div>
                  <div class="col-3 text-center">
                    <div class="timer-box">{{ ticketCountdownHours }}</div>
                    <div class="timer-label">时</div>
                  </div>
                  <div class="col-3 text-center">
                    <div class="timer-box">{{ ticketCountdownMinutes }}</div>
                    <div class="timer-label">分</div>
                  </div>
                  <div class="col-3 text-center">
                    <div class="timer-box">{{ ticketCountdownSeconds }}</div>
                    <div class="timer-label">秒</div>
                  </div>
                </div>
              </div>
              <div class="text-grey-7 text-caption">
                <q-icon name="info" size="xs" class="q-mr-xs" />
                12306火车票预售期为15天，节假日期间可能会延长至20天或更长
              </div>
            </div>
          </div>
          <div v-else class="text-center q-pa-lg">
            <q-spinner color="primary" size="3em" class="q-mb-md" />
            <div class="text-subtitle1">正在加载节假日信息...</div>
          </div>
        </div>
      </section>

      <!-- 所有节假日列表 -->
      <section class="holidays-list-section glass rounded-xl overflow-hidden shadow-2xl q-mb-xl">
        <div class="q-pa-md">
          <h2 class="text-h5 text-weight-bold q-mb-md">{{ currentYear }}年法定节假日</h2>
          
          <q-table
            :rows="holidays"
            :columns="columns"
            row-key="name"
            :pagination="{ rowsPerPage: 0 }"
            flat
            class="holiday-table"
          >
            <template v-slot:body="props">
              <q-tr :props="props">
                <q-td key="name" :props="props">
                  <div class="text-weight-bold">{{ props.row.name }}</div>
                </q-td>
                <q-td key="date" :props="props">
                  {{ formatDateRange(props.row.startDate, props.row.endDate) }}
                </q-td>
                <q-td key="days" :props="props">
                  <q-badge color="green">{{ props.row.days }}天</q-badge>
                </q-td>
                <q-td key="status" :props="props">
                  <div v-if="isHolidayPast(props.row)">
                    <q-badge color="grey">已过</q-badge>
                  </div>
                  <div v-else-if="isHolidayCurrent(props.row)">
                    <q-badge color="orange">进行中</q-badge>
                  </div>
                  <div v-else>
                    <q-badge color="primary">未来</q-badge>
                  </div>
                </q-td>
                <q-td key="ticketSale" :props="props">
                  <div v-if="isTicketSaleDate(props.row)">
                    <div>{{ formatDate(getTicketSaleDate(props.row)) }}</div>
                    <div v-if="isTicketSaleDatePast(props.row)" class="text-positive text-caption">
                      <q-icon name="check_circle" size="xs" class="q-mr-xs" />
                      已开售
                    </div>
                    <div v-else class="text-grey-7 text-caption">
                      还有 {{ getDaysUntilTicketSale(props.row) }} 天开售
                    </div>
                  </div>
                  <div v-else class="text-grey-7">-</div>
                </q-td>
              </q-tr>
            </template>
          </q-table>
        </div>
      </section>

      <!-- 说明信息 -->
      <section class="info-section glass rounded-xl overflow-hidden shadow-2xl">
        <div class="q-pa-md">
          <h2 class="text-h5 text-weight-bold q-mb-md">购票小贴士</h2>
          <div class="row q-col-gutter-md">
            <div class="col-12 col-md-6">
              <q-card flat bordered class="ticket-info-card">
                <q-card-section>
                  <div class="text-h6 q-mb-sm">12306购票规则</div>
                  <ul class="q-mb-none">
                    <li>普通车票预售期为15天</li>
                    <li>节假日期间可能延长至20天或更长</li>
                    <li>每天8:00、10:00、12:00、14:00、16:00、18:00和20:00会集中放票</li>
                    <li>建议提前设置购票提醒，避免错过开售时间</li>
                  </ul>
                </q-card-section>
              </q-card>
            </div>
            <div class="col-12 col-md-6">
              <q-card flat bordered class="ticket-info-card">
                <q-card-section>
                  <div class="text-h6 q-mb-sm">抢票小技巧</div>
                  <ul class="q-mb-none">
                    <li>提前注册并完善12306账号信息</li>
                    <li>添加常用联系人，避免购票时填写信息</li>
                    <li>开售前10分钟登录系统，避免高峰期登录困难</li>
                    <li>考虑选择备选日期或车次，增加购票成功率</li>
                  </ul>
                </q-card-section>
              </q-card>
            </div>
          </div>
        </div>
      </section>
    </div>
  </q-page>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onBeforeUnmount } from 'vue';

interface Holiday {
  name: string;
  startDate: Date;
  endDate: Date;
  days: number;
}

const currentYear = new Date().getFullYear();
const holidays = ref<Holiday[]>([]);
const countdownTimer = ref<number | null>(null);

// 表格列定义
const columns = [
  { name: 'name', label: '节假日', field: 'name', align: 'left' as const },
  { name: 'date', label: '日期', field: 'startDate', align: 'left' as const },
  { name: 'days', label: '天数', field: 'days', align: 'center' as const },
  { name: 'status', label: '状态', field: 'status', align: 'center' as const },
  { name: 'ticketSale', label: '火车票预售日', field: 'ticketSale', align: 'left' as const }
];

// 倒计时数据
const countdown = ref({
  days: 0,
  hours: 0,
  minutes: 0,
  seconds: 0
});

const ticketCountdown = ref({
  days: 0,
  hours: 0,
  minutes: 0,
  seconds: 0
});

// 获取今年的法定节假日数据
const fetchHolidays = () => {
  // 这里通常会从API获取数据，但为了演示，我们使用硬编码的数据
  // 实际应用中应该从后端API获取最新的节假日安排
  
  const thisYear = currentYear;
  
  const holidayData: Holiday[] = [
    {
      name: '元旦',
      startDate: new Date(thisYear, 0, 1),  // 1月1日
      endDate: new Date(thisYear, 0, 1),    // 1月1日
      days: 1
    },
    {
      name: '春节',
      startDate: new Date(thisYear, 0, 28), // 1月28日
      endDate: new Date(thisYear, 1, 4),    // 2月4日
      days: 8
    },
    {
      name: '清明节',
      startDate: new Date(thisYear, 3, 4),  // 4月4日
      endDate: new Date(thisYear, 3, 6),    // 4月6日
      days: 3
    },
    {
      name: '劳动节',
      startDate: new Date(thisYear, 4, 1),  // 5月1日
      endDate: new Date(thisYear, 4, 5),    // 5月5日
      days: 5
    },
    {
      name: '端午节',
      startDate: new Date(thisYear, 4, 31), // 5月31日
      endDate: new Date(thisYear, 5, 2),    // 6月2日
      days: 3
    },
    {
      name: '中秋节',
      startDate: new Date(thisYear, 9, 1),  // 10月1日
      endDate: new Date(thisYear, 9, 8),    // 10月8日
      days: 8
    },
    {
      name: '国庆节',
      startDate: new Date(thisYear, 9, 1),  // 10月1日
      endDate: new Date(thisYear, 9, 8),    // 10月8日
      days: 8
    }
  ];
  
  holidays.value = holidayData;
};

// 格式化日期范围
const formatDateRange = (startDate: Date, endDate: Date) => {
  const start = formatDate(startDate);
  const end = formatDate(endDate);
  
  if (start === end) {
    return start;
  }
  
  return `${start} 至 ${end}`;
};

// 格式化单个日期
const formatDate = (date: Date) => {
  const year = date.getFullYear();
  const month = date.getMonth() + 1;
  const day = date.getDate();
  
  return `${year}年${month}月${day}日`;
};

// 判断节假日是否已过
const isHolidayPast = (holiday: Holiday) => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return holiday.endDate < today;
};

// 判断节假日是否正在进行中
const isHolidayCurrent = (holiday: Holiday) => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return holiday.startDate <= today && today <= holiday.endDate;
};

// 获取下一个节假日
const nextHoliday = computed(() => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  const upcomingHolidays = holidays.value.filter(holiday => holiday.startDate > today);
  if (upcomingHolidays.length === 0) return null;
  
  return upcomingHolidays.sort((a, b) => a.startDate.getTime() - b.startDate.getTime())[0];
});

// 获取火车票预售日期（节假日前15天）
const getTicketSaleDate = (holiday: Holiday) => {
  const saleDate = new Date(holiday.startDate);
  saleDate.setDate(saleDate.getDate() - 15);
  return saleDate;
};

// 判断是否有火车票预售日期
const isTicketSaleDate = (holiday: Holiday) => {
  // 只对主要长假显示预售日期
  const majorHolidays = ['春节', '清明节', '劳动节', '端午节', '中秋节', '国庆节'];
  return majorHolidays.includes(holiday.name);
};

// 判断火车票是否已开售
const isTicketSaleDatePast = (holiday: Holiday) => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const saleDate = getTicketSaleDate(holiday);
  return saleDate <= today;
};

// 获取距离火车票开售还有多少天
const getDaysUntilTicketSale = (holiday: Holiday) => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const saleDate = getTicketSaleDate(holiday);
  
  const diffTime = saleDate.getTime() - today.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  
  return diffDays > 0 ? diffDays : 0;
};

// 下一个节假日的火车票预售日期
const ticketSaleDate = computed(() => {
  if (!nextHoliday.value) return null;
  if (!isTicketSaleDate(nextHoliday.value)) return null;
  
  return getTicketSaleDate(nextHoliday.value);
});

// 判断火车票是否已开售
const isTicketSaleOpen = computed(() => {
  if (!ticketSaleDate.value) return false;
  
  const today = new Date();
  return ticketSaleDate.value <= today;
});

// 倒计时计算
const updateCountdown = () => {
  if (!nextHoliday.value) return;
  
  const now = new Date();
  const targetDate = nextHoliday.value.startDate;
  
  // 计算距离下一个节假日的时间
  let diff = targetDate.getTime() - now.getTime();
  
  if (diff <= 0) {
    countdown.value = { days: 0, hours: 0, minutes: 0, seconds: 0 };
    return;
  }
  
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  diff -= days * (1000 * 60 * 60 * 24);
  
  const hours = Math.floor(diff / (1000 * 60 * 60));
  diff -= hours * (1000 * 60 * 60);
  
  const minutes = Math.floor(diff / (1000 * 60));
  diff -= minutes * (1000 * 60);
  
  const seconds = Math.floor(diff / 1000);
  
  countdown.value = { days, hours, minutes, seconds };
  
  // 计算距离火车票开售的时间
  if (ticketSaleDate.value && !isTicketSaleOpen.value) {
    diff = ticketSaleDate.value.getTime() - now.getTime();
    
    if (diff <= 0) {
      ticketCountdown.value = { days: 0, hours: 0, minutes: 0, seconds: 0 };
      return;
    }
    
    const ticketDays = Math.floor(diff / (1000 * 60 * 60 * 24));
    diff -= ticketDays * (1000 * 60 * 60 * 24);
    
    const ticketHours = Math.floor(diff / (1000 * 60 * 60));
    diff -= ticketHours * (1000 * 60 * 60);
    
    const ticketMinutes = Math.floor(diff / (1000 * 60));
    diff -= ticketMinutes * (1000 * 60);
    
    const ticketSeconds = Math.floor(diff / 1000);
    
    ticketCountdown.value = { days: ticketDays, hours: ticketHours, minutes: ticketMinutes, seconds: ticketSeconds };
  }
};

// 倒计时数据的计算属性
const countdownDays = computed(() => countdown.value.days.toString().padStart(2, '0'));
const countdownHours = computed(() => countdown.value.hours.toString().padStart(2, '0'));
const countdownMinutes = computed(() => countdown.value.minutes.toString().padStart(2, '0'));
const countdownSeconds = computed(() => countdown.value.seconds.toString().padStart(2, '0'));

const ticketCountdownDays = computed(() => ticketCountdown.value.days.toString().padStart(2, '0'));
const ticketCountdownHours = computed(() => ticketCountdown.value.hours.toString().padStart(2, '0'));
const ticketCountdownMinutes = computed(() => ticketCountdown.value.minutes.toString().padStart(2, '0'));
const ticketCountdownSeconds = computed(() => ticketCountdown.value.seconds.toString().padStart(2, '0'));

// 生命周期钩子
onMounted(() => {
  fetchHolidays();
  updateCountdown();
  countdownTimer.value = window.setInterval(updateCountdown, 1000);
});

onBeforeUnmount(() => {
  if (countdownTimer.value) {
    clearInterval(countdownTimer.value);
  }
});
</script>

<style lang="scss" scoped>
.holiday-page {
  background-color: #f5f7fa;
  min-height: 100vh;
}

// 玻璃效果
.glass {
  background: rgba(255, 255, 255, 0.8);
  backdrop-filter: blur(8px);
  border: 1px solid rgba(0, 0, 0, 0.1);
}

// 倒计时样式
.countdown-timer {
  .timer-box {
    background-color: #1976D2;
    color: white;
    border-radius: 8px;
    padding: 10px 0;
    font-size: 1.8rem;
    font-weight: bold;
    margin-bottom: 5px;
  }
  
  .timer-label {
    font-size: 0.9rem;
    color: #666;
  }
}

// 表格样式
.holiday-table {
  :deep(.q-table__card) {
    background: transparent;
  }
  
  :deep(th) {
    font-weight: bold;
    background-color: rgba(25, 118, 210, 0.1);
  }
  
  :deep(tr:hover) {
    background-color: rgba(25, 118, 210, 0.05);
  }
}

// 信息卡片样式
.ticket-info-card {
  height: 100%;
  transition: all 0.3s ease;
  
  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  }
  
  ul {
    padding-left: 20px;
    
    li {
      margin-bottom: 8px;
      
      &:last-child {
        margin-bottom: 0;
      }
    }
  }
}
</style> 