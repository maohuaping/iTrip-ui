<template>
  <q-page class="trip-page q-pa-md">
    <div class="q-mx-auto" style="max-width: 1200px">
      <!-- 页面标题 -->
      <div class="text-center q-mb-lg">
        <h1 class="text-h4 text-weight-bold q-mb-sm">我的旅行计划</h1>
        <p class="text-subtitle1 text-grey-7">规划您的旅行，记录美好时刻</p>
      </div>

      <!-- 即将出行的旅行计划 -->
      <section class="upcoming-trip-section glass rounded-xl overflow-hidden shadow-2xl q-mb-xl">
        <div class="q-pa-md">
          <div v-if="upcomingTrip" class="row items-center">
            <div class="col-12 col-md-6 q-pa-md">
              <h2 class="text-h5 text-weight-bold q-mb-md">即将出行</h2>
              <div class="text-h3 text-primary q-mb-sm">{{ upcomingTrip.destination }}</div>
              <div class="text-subtitle1 q-mb-md">
                {{ formatDateRange(upcomingTrip.startDate, upcomingTrip.endDate) }}
                <q-badge color="green" class="q-ml-sm">{{ upcomingTrip.days }}天</q-badge>
              </div>
              <div class="text-h6 q-mb-xs">距离出行还有</div>
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
              <div class="q-mt-md">
                <q-btn
                  color="primary"
                  label="查看详情"
                  class="q-mr-sm"
                  :to="`/trip/detail/${upcomingTrip.id}`"
                />
                <q-btn
                  outline
                  color="primary"
                  label="编辑行程"
                />
              </div>
            </div>
            <div class="col-12 col-md-6 q-pa-md">
              <div class="destination-image-container">
                <img :src="upcomingTrip.image" class="destination-image" />
                <div class="image-overlay">
                  <div class="weather-info">
                    <q-icon :name="getWeatherIcon(upcomingTrip.weather)" size="md" />
                    <span class="q-ml-xs">{{ upcomingTrip.temperature }}°C</span>
                    <div class="weather-desc">{{ upcomingTrip.weather }}</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div v-else class="text-center q-pa-lg">
            <q-icon name="flight_takeoff" size="64px" color="grey-4" />
            <div class="text-subtitle1 q-mt-md text-grey-7">暂无即将出行的旅行计划</div>
            <div class="q-mt-md">
              <q-btn color="primary" label="创建旅行计划" icon="add" @click="showNewTripDialog = true" />
            </div>
          </div>
        </div>
      </section>

      <!-- 旅行计划列表 -->
      <div class="row q-col-gutter-md q-mb-xl">
        <div class="col-12">
          <div class="section-header flex justify-between items-center q-mb-md">
            <h2 class="text-h5 text-weight-bold q-my-none">我的旅行计划</h2>
            <q-btn
              color="primary"
              label="创建旅行计划"
              icon="add"
              rounded
              unelevated
              @click="showNewTripDialog = true"
            />
          </div>

          <!-- 旅行计划状态筛选 -->
          <div class="q-mb-md">
            <q-tabs
              v-model="activeTab"
              class="text-primary"
              active-color="primary"
              indicator-color="primary"
              narrow-indicator
              dense
            >
              <q-tab name="all" label="全部" />
              <q-tab name="upcoming" label="即将出行" />
              <q-tab name="ongoing" label="进行中" />
              <q-tab name="completed" label="已完成" />
              <q-tab name="draft" label="草稿" />
            </q-tabs>
          </div>

          <!-- 旅行计划卡片列表 -->
          <div class="row q-col-gutter-md">
            <div v-for="trip in filteredTrips" :key="trip.id" class="col-12 col-md-6 col-lg-4">
              <q-card class="trip-card">
                <q-img
                  :src="trip.image"
                  :ratio="16/9"
                >
                  <div class="absolute-top-right q-pa-sm">
                    <q-badge :color="getTripStatusColor(trip.status)">
                      {{ getTripStatusText(trip.status) }}
                    </q-badge>
                  </div>
                </q-img>

                <q-card-section>
                  <div class="text-h6 ellipsis">{{ trip.destination }}</div>
                  <div class="text-subtitle2 text-grey-7">
                    {{ formatDateRange(trip.startDate, trip.endDate) }}
                    <q-badge color="green" class="q-ml-sm">{{ trip.days }}天</q-badge>
                  </div>
                </q-card-section>

                <q-card-section class="q-pt-none">
                  <div class="text-body2 trip-description">{{ trip.description }}</div>
                </q-card-section>

                <q-separator />

                <q-card-actions>
                  <q-btn flat color="primary" :to="`/trip/detail/${trip.id}`">查看详情</q-btn>
                  <q-space />
                  <q-btn flat round color="grey" icon="more_vert">
                    <q-menu>
                      <q-list style="min-width: 100px">
                        <q-item clickable v-close-popup @click="editTrip()">
                          <q-item-section avatar>
                            <q-icon name="edit" />
                          </q-item-section>
                          <q-item-section>编辑</q-item-section>
                        </q-item>
                        <q-item clickable v-close-popup @click="duplicateTrip(trip)">
                          <q-item-section avatar>
                            <q-icon name="content_copy" />
                          </q-item-section>
                          <q-item-section>复制</q-item-section>
                        </q-item>
                        <q-separator />
                        <q-item clickable v-close-popup @click="confirmDelete(trip)">
                          <q-item-section avatar>
                            <q-icon name="delete" color="negative" />
                          </q-item-section>
                          <q-item-section class="text-negative">删除</q-item-section>
                        </q-item>
                      </q-list>
                    </q-menu>
                  </q-btn>
                </q-card-actions>
              </q-card>
            </div>

            <!-- 空状态 -->
            <div v-if="filteredTrips.length === 0" class="col-12 text-center q-pa-lg">
              <q-icon name="flight" size="64px" color="grey-4" />
              <div class="text-subtitle1 q-mt-md text-grey-7">暂无旅行计划</div>
              <div class="text-caption text-grey-6 q-mt-sm">点击"创建旅行计划"开始您的旅行</div>
            </div>
          </div>
        </div>
      </div>

      <!-- 热门目的地推荐 -->
      <section class="popular-destinations-section glass rounded-xl overflow-hidden shadow-2xl q-mb-xl">
        <div class="q-pa-md">
          <h2 class="text-h5 text-weight-bold q-mb-md">热门目的地推荐</h2>
          <div class="row q-col-gutter-md">
            <div v-for="destination in popularDestinations" :key="destination.id" class="col-12 col-md-4">
              <q-card class="destination-card">
                <q-img :src="destination.image" height="200px">
                  <div class="absolute-bottom text-white bg-transparent">
                    <div class="text-h6">{{ destination.name }}</div>
                    <div class="text-subtitle2">{{ destination.description }}</div>
                  </div>
                </q-img>
                <q-card-actions align="right">
                  <q-btn flat color="primary" label="查看详情" />
                  <q-btn flat color="primary" label="创建旅行" @click="createTripFromDestination(destination)" />
                </q-card-actions>
              </q-card>
            </div>
          </div>
        </div>
      </section>

      <!-- 旅行小贴士 -->
      <section class="travel-tips-section glass rounded-xl overflow-hidden shadow-2xl">
        <div class="q-pa-md">
          <h2 class="text-h5 text-weight-bold q-mb-md">旅行小贴士</h2>
          <div class="row q-col-gutter-md">
            <div class="col-12 col-md-6">
              <q-card flat bordered class="tip-card">
                <q-card-section>
                  <div class="text-h6 q-mb-sm">出行前准备</div>
                  <ul class="q-mb-none">
                    <li>检查证件：护照、身份证、签证等是否齐全有效</li>
                    <li>提前规划行程，预订机票和住宿</li>
                    <li>备好常用药物和必要的紧急联系方式</li>
                    <li>查看目的地天气预报，准备适合的衣物</li>
                  </ul>
                </q-card-section>
              </q-card>
            </div>
            <div class="col-12 col-md-6">
              <q-card flat bordered class="tip-card">
                <q-card-section>
                  <div class="text-h6 q-mb-sm">旅行节省技巧</div>
                  <ul class="q-mb-none">
                    <li>选择淡季出行，机票和住宿价格更优惠</li>
                    <li>使用比价工具查找最佳价格</li>
                    <li>考虑公共交通或共享出行服务</li>
                    <li>寻找当地美食，避开旅游区的高价餐厅</li>
                  </ul>
                </q-card-section>
              </q-card>
            </div>
          </div>
        </div>
      </section>
    </div>

    <!-- 新建旅行计划对话框 -->
    <q-dialog v-model="showNewTripDialog" persistent>
      <q-card style="min-width: 500px">
        <q-card-section class="row items-center">
          <div class="text-h6">创建旅行计划</div>
          <q-space />
          <q-btn icon="close" flat round dense v-close-popup />
        </q-card-section>

        <q-card-section class="q-pt-none">
          <q-form @submit="createTrip" class="q-gutter-md">
            <q-input
              v-model="newTrip.destination"
              label="目的地"
              outlined
              :rules="[val => !!val || '请输入目的地']"
            />

            <div class="row q-col-gutter-sm">
              <div class="col-6">
                <q-input
                  v-model="newTrip.startDate"
                  label="出发日期"
                  outlined
                  type="date"
                  :rules="[val => !!val || '请选择出发日期']"
                />
              </div>
              <div class="col-6">
                <q-input
                  v-model="newTrip.endDate"
                  label="返回日期"
                  outlined
                  type="date"
                  :rules="[
                    val => !!val || '请选择返回日期',
                    val => val >= newTrip.startDate || '返回日期必须晚于出发日期'
                  ]"
                />
              </div>
            </div>

            <q-input
              v-model="newTrip.description"
              label="旅行描述"
              outlined
              type="textarea"
              rows="3"
            />

            <div class="row justify-end q-mt-md">
              <q-btn label="取消" flat v-close-popup class="q-mr-sm" />
              <q-btn label="保存为草稿" color="grey-7" class="q-mr-sm" @click="saveAsDraft" />
              <q-btn label="创建" type="submit" color="primary" />
            </div>
          </q-form>
        </q-card-section>
      </q-card>
    </q-dialog>

    <!-- 删除确认对话框 -->
    <q-dialog v-model="showDeleteDialog" persistent>
      <q-card>
        <q-card-section class="row items-center">
          <q-avatar icon="warning" color="negative" text-color="white" />
          <span class="q-ml-sm">确定要删除这个旅行计划吗？</span>
        </q-card-section>

        <q-card-actions align="right">
          <q-btn flat label="取消" v-close-popup />
          <q-btn flat label="删除" color="negative" @click="deleteTrip" v-close-popup />
        </q-card-actions>
      </q-card>
    </q-dialog>
  </q-page>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onBeforeUnmount } from 'vue';
import { useQuasar } from 'quasar';

const $q = useQuasar();

// 定义旅行计划接口
interface Trip {
  id: number;
  destination: string;
  startDate: Date;
  endDate: Date;
  days: number;
  description: string;
  status: 'upcoming' | 'ongoing' | 'completed' | 'draft';
  image: string;
  weather?: string;
  temperature?: number;
}

// 定义目的地接口
interface Destination {
  id: number;
  name: string;
  description: string;
  image: string;
}

// 模拟数据
const currentDate = new Date();
const futureDate = new Date();
futureDate.setDate(currentDate.getDate() + 15);

// 即将出行的旅行
const upcomingTrip = ref<Trip | null>({
  id: 1,
  destination: '日本东京',
  startDate: futureDate,
  endDate: new Date(futureDate.getTime() + 7 * 24 * 60 * 60 * 1000),
  days: 7,
  description: '樱花季节的东京之旅，包括富士山、银座购物和迪士尼乐园',
  status: 'upcoming',
  image: 'https://cdn.pixabay.com/photo/2019/05/11/22/13/tokyo-4196764_1280.jpg',
  weather: '晴天',
  temperature: 22
});

// 旅行计划列表
const trips = ref<Trip[]>([
  {
    id: 1,
    destination: '日本东京',
    startDate: futureDate,
    endDate: new Date(futureDate.getTime() + 7 * 24 * 60 * 60 * 1000),
    days: 7,
    description: '樱花季节的东京之旅，包括富士山、银座购物和迪士尼乐园',
    status: 'upcoming',
    image: 'https://cdn.pixabay.com/photo/2019/05/11/22/13/tokyo-4196764_1280.jpg'
  },
  {
    id: 2,
    destination: '泰国普吉岛',
    startDate: new Date(currentDate.getTime() + 45 * 24 * 60 * 60 * 1000),
    endDate: new Date(currentDate.getTime() + 50 * 24 * 60 * 60 * 1000),
    days: 6,
    description: '海岛度假，体验泰式按摩和美食',
    status: 'upcoming',
    image: 'https://cdn.pixabay.com/photo/2017/01/20/00/30/maldives-1993704_1280.jpg'
  },
  {
    id: 3,
    destination: '法国巴黎',
    startDate: new Date(currentDate.getTime() - 30 * 24 * 60 * 60 * 1000),
    endDate: new Date(currentDate.getTime() - 24 * 24 * 60 * 60 * 1000),
    days: 7,
    description: '浪漫之都，艺术与美食的完美结合',
    status: 'completed',
    image: 'https://cdn.pixabay.com/photo/2015/07/13/14/40/paris-843229_1280.jpg'
  },
  {
    id: 4,
    destination: '西藏拉萨',
    startDate: new Date(currentDate.getTime() - 5 * 24 * 60 * 60 * 1000),
    endDate: new Date(currentDate.getTime() + 2 * 24 * 60 * 60 * 1000),
    days: 8,
    description: '高原探险，探访布达拉宫和圣湖',
    status: 'ongoing',
    image: 'https://cdn.pixabay.com/photo/2018/03/12/20/07/tibet-3220766_1280.jpg'
  },
  {
    id: 5,
    destination: '新西兰',
    startDate: new Date(),
    endDate: new Date(),
    days: 10,
    description: '中土世界之旅，体验极限运动和自然风光',
    status: 'draft',
    image: 'https://cdn.pixabay.com/photo/2016/01/09/18/27/old-1130731_1280.jpg'
  }
]);

// 热门目的地
const popularDestinations = ref<Destination[]>([
  {
    id: 1,
    name: '日本京都',
    description: '古都风情，樱花和枫叶的天堂',
    image: 'https://cdn.pixabay.com/photo/2017/01/28/02/24/japan-2014619_1280.jpg'
  },
  {
    id: 2,
    name: '意大利威尼斯',
    description: '水城之光，浪漫与艺术的交融',
    image: 'https://cdn.pixabay.com/photo/2019/07/07/13/21/venice-4322233_1280.jpg'
  },
  {
    id: 3,
    name: '澳大利亚悉尼',
    description: '海港城市，现代与自然的完美结合',
    image: 'https://cdn.pixabay.com/photo/2014/06/06/09/36/sydney-opera-house-363244_1280.jpg'
  }
]);

// 状态筛选
const activeTab = ref('all');
const filteredTrips = computed(() => {
  if (activeTab.value === 'all') return trips.value;
  return trips.value.filter(trip => trip.status === activeTab.value);
});

// 新建旅行计划表单
const showNewTripDialog = ref(false);
const newTrip = ref({
  destination: '',
  startDate: '',
  endDate: '',
  description: ''
});

// 删除确认
const showDeleteDialog = ref(false);
const tripToDelete = ref<Trip | null>(null);

// 倒计时数据
const countdown = ref({
  days: 0,
  hours: 0,
  minutes: 0,
  seconds: 0
});
const countdownTimer = ref<number | null>(null);

// 倒计时数据的计算属性
const countdownDays = computed(() => countdown.value.days.toString().padStart(2, '0'));
const countdownHours = computed(() => countdown.value.hours.toString().padStart(2, '0'));
const countdownMinutes = computed(() => countdown.value.minutes.toString().padStart(2, '0'));
const countdownSeconds = computed(() => countdown.value.seconds.toString().padStart(2, '0'));

// 格式化日期范围
const formatDateRange = (startDate: Date, endDate: Date) => {
  const options: Intl.DateTimeFormatOptions = { year: 'numeric', month: '2-digit', day: '2-digit' };
  const start = new Date(startDate).toLocaleDateString('zh-CN', options);
  const end = new Date(endDate).toLocaleDateString('zh-CN', options);

  return `${start} 至 ${end}`;
};

// 获取旅行状态文本
const getTripStatusText = (status: string) => {
  switch (status) {
    case 'upcoming': return '即将出行';
    case 'ongoing': return '进行中';
    case 'completed': return '已完成';
    case 'draft': return '草稿';
    default: return '';
  }
};

// 获取旅行状态颜色
const getTripStatusColor = (status: string) => {
  switch (status) {
    case 'upcoming': return 'blue';
    case 'ongoing': return 'green';
    case 'completed': return 'grey';
    case 'draft': return 'orange';
    default: return 'grey';
  }
};

// 获取天气图标
const getWeatherIcon = (weather: string | undefined) => {
  if (!weather) return 'cloud';

  switch (weather.toLowerCase()) {
    case '晴天': return 'wb_sunny';
    case '多云': return 'wb_cloudy';
    case '雨天': return 'umbrella';
    case '雪天': return 'ac_unit';
    default: return 'cloud';
  }
};

// 更新倒计时
const updateCountdown = () => {
  if (!upcomingTrip.value) return;

  const now = new Date();
  const targetDate = upcomingTrip.value.startDate;

  // 计算距离下一个旅行的时间
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
};

// 创建旅行计划
const createTrip = () => {
  $q.notify({
    color: 'positive',
    message: '旅行计划创建成功！',
    icon: 'check_circle'
  });

  const startDate = new Date(newTrip.value.startDate);
  const endDate = new Date(newTrip.value.endDate);
  const days = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)) + 1;

  const trip: Trip = {
    id: trips.value.length + 1,
    destination: newTrip.value.destination,
    startDate,
    endDate,
    days,
    description: newTrip.value.description || '暂无描述',
    status: 'upcoming',
    image: 'https://cdn.pixabay.com/photo/2016/01/09/18/27/old-1130731_1280.jpg'
  };

  trips.value.unshift(trip);

  // 如果这是第一个创建的旅行，设置为即将出行的旅行
  if (!upcomingTrip.value) {
    upcomingTrip.value = trip;
  }

  // 关闭对话框并重置表单
  showNewTripDialog.value = false;
  resetNewTripForm();
};

// 保存为草稿
const saveAsDraft = () => {
  if (!newTrip.value.destination) {
    $q.notify({
      color: 'negative',
      message: '请至少输入目的地',
      icon: 'error'
    });
    return;
  }

  $q.notify({
    color: 'positive',
    message: '草稿已保存',
    icon: 'check_circle'
  });

  const trip: Trip = {
    id: trips.value.length + 1,
    destination: newTrip.value.destination,
    startDate: newTrip.value.startDate ? new Date(newTrip.value.startDate) : new Date(),
    endDate: newTrip.value.endDate ? new Date(newTrip.value.endDate) : new Date(),
    days: 0,
    description: newTrip.value.description || '暂无描述',
    status: 'draft',
    image: 'https://cdn.pixabay.com/photo/2016/01/09/18/27/old-1130731_1280.jpg'
  };

  trips.value.unshift(trip);

  // 关闭对话框并重置表单
  showNewTripDialog.value = false;
  resetNewTripForm();
};

// 重置表单
const resetNewTripForm = () => {
  newTrip.value = {
    destination: '',
    startDate: '',
    endDate: '',
    description: ''
  };
};

// 编辑旅行计划
const editTrip = () => {
  $q.notify({
    color: 'info',
    message: '编辑功能尚未实现',
    icon: 'info'
  });
};

// 复制旅行计划
const duplicateTrip = (trip: Trip) => {
  const newTrip: Trip = {
    ...JSON.parse(JSON.stringify(trip)),
    id: trips.value.length + 1,
    destination: `${trip.destination} (复制)`,
    status: 'draft'
  };

  trips.value.unshift(newTrip);

  $q.notify({
    color: 'positive',
    message: '旅行计划已复制',
    icon: 'content_copy'
  });
};

// 确认删除
const confirmDelete = (trip: Trip) => {
  tripToDelete.value = trip;
  showDeleteDialog.value = true;
};

// 删除旅行计划
const deleteTrip = () => {
  if (tripToDelete.value) {
    const index = trips.value.findIndex(t => t.id === tripToDelete.value?.id);
    if (index !== -1) {
      trips.value.splice(index, 1);

      // 如果删除的是即将出行的旅行，更新upcomingTrip
      if (upcomingTrip.value && upcomingTrip.value.id === tripToDelete.value.id) {
        const nextUpcomingTrip = trips.value.find(t => t.status === 'upcoming');
        upcomingTrip.value = nextUpcomingTrip ?? null;
      }

      $q.notify({
        color: 'positive',
        message: '旅行计划已删除',
        icon: 'check_circle'
      });
    }
  }
};

// 从推荐目的地创建旅行
const createTripFromDestination = (destination: Destination) => {
  // 设置新旅行计划的默认值
  newTrip.value.destination = destination.name;

  // 默认出发日期设为30天后
  const defaultStartDate = new Date();
  defaultStartDate.setDate(defaultStartDate.getDate() + 30);
  newTrip.value.startDate = formatDateForInput(defaultStartDate);

  // 默认返回日期设为出发日期的7天后
  const defaultEndDate = new Date(defaultStartDate);
  defaultEndDate.setDate(defaultEndDate.getDate() + 7);
  newTrip.value.endDate = formatDateForInput(defaultEndDate);

  // 设置描述
  newTrip.value.description = destination.description;

  // 打开创建对话框
  showNewTripDialog.value = true;
};

// 格式化日期为 YYYY-MM-DD 格式
const formatDateForInput = (date: Date): string => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

// 生命周期钩子
onMounted(() => {
  updateCountdown();
  countdownTimer.value = window.setInterval(updateCountdown, 1000);
});

onBeforeUnmount(() => {
  if (countdownTimer.value) {
    clearInterval(countdownTimer.value);
  }
});

// 组件名称定义
defineOptions({
  name: 'TripPage'
});
</script>

<style lang="scss" scoped>
.trip-page {
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

// 目的地图片容器
.destination-image-container {
  position: relative;
  border-radius: 12px;
  overflow: hidden;
  height: 220px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);

  .destination-image {
    width: 100%;
    height: 100%;
    object-fit: cover;
    transition: transform 0.5s ease;
  }

  &:hover {
    .destination-image {
      transform: scale(1.05);
    }
  }

  .image-overlay {
    position: absolute;
    bottom: 0;
    left: 0;
    right: 0;
    padding: 15px;
    background: linear-gradient(to top, rgba(0, 0, 0, 0.7) 0%, rgba(0, 0, 0, 0) 100%);

    .weather-info {
      color: white;
      display: flex;
      align-items: center;

      .weather-desc {
        margin-left: 10px;
        font-size: 0.9rem;
        opacity: 0.8;
      }
    }
  }
}

// 旅行卡片样式
.trip-card {
  transition: all 0.3s ease;
  height: 100%;

  &:hover {
    transform: translateY(-5px);
    box-shadow: 0 8px 20px rgba(0, 0, 0, 0.1);
  }

  .trip-description {
    display: -webkit-box;
    -webkit-box-orient: vertical;
    -webkit-line-clamp: 3;
    overflow: hidden;
    color: #666;
    min-height: 4.5em;
  }
}

// 目的地卡片样式
.destination-card {
  transition: all 0.3s ease;
  height: 100%;

  &:hover {
    transform: translateY(-5px);
    box-shadow: 0 8px 20px rgba(0, 0, 0, 0.1);
  }
}

// 小贴士卡片样式
.tip-card {
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
      color: #555;

      &:last-child {
        margin-bottom: 0;
      }
    }
  }
}

// 确保内容溢出时显示省略号
.ellipsis {
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

// 自定义滚动条
::-webkit-scrollbar {
  width: 8px;
}

::-webkit-scrollbar-track {
  background: #f1f1f1;
  border-radius: 4px;
}

::-webkit-scrollbar-thumb {
  background: #ccc;
  border-radius: 4px;
}

::-webkit-scrollbar-thumb:hover {
  background: #888;
}

// 响应式调整
@media (max-width: 599px) {
  .countdown-timer {
    .timer-box {
      font-size: 1.2rem;
      padding: 8px 0;
    }

    .timer-label {
      font-size: 0.8rem;
    }
  }

  .destination-image-container {
    height: 180px;
  }
}
</style>
