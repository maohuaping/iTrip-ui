<template>
  <q-page class="national-day-plan-page">
    <div class="page-container">
      <!-- 行程统计信息和模式切换 -->
      <div class="schedule-stats">
        <div class="stats-content">
          <!-- 当日行程概览按钮 -->
          <q-btn v-if="selectedDate" flat dense size="sm" icon="timeline"
            :label="`查看${formatDateLabel(selectedDate)}行程`" color="primary" class="daily-overview-btn"
            @click="showDailyOverview = true" />

          <q-btn flat dense size="sm" icon="image" label="查看原图" color="grey-5" class="view-original-btn q-ml-md"
            @click="showOriginalImage = true" />
        </div>

        <!-- 模式切换按钮 -->
        <div class="mode-toggle">
          <q-btn :icon="isEditMode ? 'check' : 'edit'" :label="isEditMode ? '完成' : '编辑'"
            :color="isEditMode ? 'positive' : 'primary'" size="sm" unelevated @click="toggleEditMode"
            class="mode-toggle-btn" />
        </div>
      </div>

      <!-- 日期筛选 -->
      <q-card class="filter-card q-mb-md" flat bordered>
        <q-card-section class="q-py-sm">
          <div class="row q-gutter-xs">
            <q-btn v-for="date in uniqueDates" :key="date" :label="formatDateLabel(date)"
              :color="selectedDate === date ? 'red-6' : 'grey-4'" :text-color="selectedDate === date ? 'white' : 'dark'"
              size="sm" unelevated @click="selectedDate = selectedDate === date ? '' : date" class="date-filter-btn" />
          </div>
        </q-card-section>
      </q-card>

      <!-- 行程列表 -->
      <div class="schedule-list" :class="{ 'edit-mode': isEditMode }">
        <q-card v-for="(item, index) in filteredSchedule" :key="index" class="schedule-item q-mb-md"
          :class="{ completed: item.completed, 'edit-mode': isEditMode }" :data-type="item.type" flat bordered>
          <q-card-section class="q-pb-none">
            <!-- 日期和时间段 -->
            <div class="schedule-header">
              <div class="date-badge">
                <q-icon name="calendar_today" size="1rem" class="q-mr-xs" />
                {{ item.date }}
              </div>
              <div class="time-period">
                <q-chip :color="item.period === '上午' ? 'orange-3' : item.period === '下午' ? 'blue-3' : 'purple-3'"
                  text-color="dark" size="sm">
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
                  <q-chip v-for="highlight in item.highlights" :key="highlight" color="red-1" text-color="red-8"
                    size="sm" class="q-mr-xs q-mb-xs">
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

              <!-- 图片信息 - 紧凑型展示 -->
              <div v-if="item.image" class="image-info-compact q-mt-sm">
                <div class="row items-center no-wrap">
                  <div class="col">
                    <div class="flex items-center">
                      <q-icon name="image" color="primary" size="1rem" class="q-mr-xs" />
                      <span class="text-caption text-primary cursor-pointer"
                        @click="showImageDialog(item.image, item.location)">
                        {{ getImageLinkText(item.image) }}
                      </span>
                    </div>
                  </div>
                  <div class="col-auto">
                    <q-img :src="`/${item.image}`" :alt="item.location"
                      class="thumbnail-image rounded-borders cursor-pointer"
                      @click="showImageDialog(item.image, item.location)">
                      <template v-slot:loading>
                        <div class="flex flex-center full-height">
                          <q-spinner size="xs" color="primary" />
                        </div>
                      </template>
                      <template v-slot:error>
                        <div class="flex flex-center full-height bg-grey-3">
                          <q-icon name="broken_image" size="xs" color="grey-6" />
                        </div>
                      </template>
                    </q-img>
                  </div>
                </div>
              </div>
            </div>
          </q-card-section>

          <!-- 编辑模式控制按钮 -->
          <div v-if="isEditMode" class="edit-controls">
            <!-- 拖拽手柄 -->
            <div class="drag-handle">
              <q-icon name="drag_indicator" size="1.2rem" color="grey-6" />
            </div>

            <!-- 删除按钮 -->
            <q-btn flat round icon="delete" color="negative" size="sm" @click="confirmDeleteItem(item, index)"
              class="delete-btn">
              <q-tooltip class="bg-negative">删除此行程</q-tooltip>
            </q-btn>
          </div>

          <!-- 操作按钮 -->
          <q-card-actions class="q-px-md q-pb-md" :class="{ 'view-mode': !isEditMode }">
            <!-- 查看模式：功能按钮 -->
            <template v-if="!isEditMode">
              <q-btn flat size="sm" color="primary" icon="map" label="导航" @click="openNavigation(item)" />
              <q-btn flat size="sm" color="orange" icon="local_taxi" label="滴滴" @click="openDidiTaxi(item)" />
              <q-btn flat size="sm" color="secondary" icon="visibility" label="详情" @click="viewItemDetails(item)" />
              <q-space />
              <q-btn flat size="sm" :icon="item.completed ? 'check_circle' : 'radio_button_unchecked'"
                :color="item.completed ? 'positive' : 'grey'" @click="toggleCompleted(item)" />
            </template>

            <!-- 编辑模式：编辑按钮 -->
            <template v-else>
              <q-btn flat size="sm" color="secondary" icon="edit" label="编辑内容" @click="editItem(item)" />
              <q-space />
              <q-btn flat size="sm" :icon="item.completed ? 'check_circle' : 'radio_button_unchecked'"
                :color="item.completed ? 'positive' : 'grey'" @click="toggleCompleted(item)" />
            </template>
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
            <q-img src="/国庆计划.jpg" alt="国庆计划原图" fit="contain" class="full-width full-height">
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
          <q-btn icon="close" flat round dense v-close-popup class="absolute-top-right q-ma-md text-white" size="lg" />

          <!-- 下载按钮 -->
          <q-btn icon="download" flat round dense @click="downloadOriginalImage"
            class="absolute-top-left q-ma-md text-white" size="lg" />
        </q-card-section>
      </q-card>
    </q-dialog>

    <!-- 行程图片查看对话框 -->
    <q-dialog v-model="showImageDialogVisible" maximized>
      <q-card class="bg-black">
        <q-card-section class="q-pa-none full-height">
          <div class="full-height flex flex-center image-container" @dblclick="toggleImageZoom"
            :class="{ 'zoomed': imageZoomed }">
            <q-img :src="`/${currentImage}`" :alt="currentImageTitle" :fit="imageZoomed ? 'scale-down' : 'contain'"
              class="zoomable-image" :class="{ 'zoomed': imageZoomed }" @dblclick="toggleImageZoom">
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
          <q-btn icon="close" flat round dense v-close-popup class="absolute-top-right q-ma-md text-white" size="lg" />

          <!-- 缩放提示和控制 -->
          <div class="absolute-top-left q-ma-md">
            <q-btn :icon="imageZoomed ? 'zoom_out' : 'zoom_in'" flat round dense @click="toggleImageZoom"
              class="text-white zoom-btn" size="lg">
              <q-tooltip class="bg-dark">
                {{ imageZoomed ? '缩小' : '放大' }} (双击图片)
              </q-tooltip>
            </q-btn>
          </div>

          <!-- 标题 -->
          <div class="absolute-bottom-left q-ma-md text-white">
            <div class="text-h6">{{ currentImageTitle }}</div>
            <div class="text-caption opacity-70">双击图片可以放大/缩小</div>
          </div>
        </q-card-section>
      </q-card>
    </q-dialog>

    <!-- 当日行程概览对话框 -->
    <q-dialog v-model="showDailyOverview" maximized>
      <q-card class="daily-overview-dialog">
        <q-card-section class="q-pa-none full-height">
          <!-- 顶部标题栏 -->
          <div class="dialog-header q-pa-md">
            <div class="row items-center">
              <div class="col">
                <div class="text-h5 text-weight-medium">
                  <q-icon name="timeline" size="1.5rem" class="q-mr-sm" color="primary" />
                  {{ formatDateLabel(selectedDate) }}行程安排
                </div>
                <div class="text-caption text-grey-6 q-mt-xs">
                  共 {{ filteredSchedule.length }} 个安排
                </div>
              </div>
              <div class="col-auto">
                <q-btn flat round icon="close" size="lg" v-close-popup color="grey-7" />
              </div>
            </div>
          </div>

          <q-separator />

          <!-- 简洁行程列表 -->
          <div class="simple-list-container q-pa-md">
            <q-list separator>
              <q-item v-for="(item, index) in filteredSchedule" :key="index" class="simple-list-item"
                :class="{ completed: item.completed }" clickable @click="viewItemDetails(item)">
                <q-item-section avatar>
                  <q-avatar :color="getTypeBadgeColor(item.type)" text-color="white" size="40px">
                    <q-icon :name="getTimelineIcon(item.type)" size="1.2rem" />
                  </q-avatar>
                </q-item-section>

                <q-item-section>
                  <q-item-label class="text-h6 text-weight-medium">
                    {{ getSimpleLocationName(item.location) }}
                  </q-item-label>
                  <q-item-label caption class="text-grey-6">
                    {{ item.time }} · {{ item.type }}
                    <q-chip :color="item.period === '上午' ? 'orange-3' : item.period === '下午' ? 'blue-3' : 'purple-3'"
                      text-color="dark" size="sm" class="q-ml-sm">
                      {{ item.period }}
                    </q-chip>
                  </q-item-label>
                </q-item-section>

                <q-item-section side>
                  <div class="row items-center q-gutter-xs">
                    <q-btn flat round size="sm" icon="map" color="primary" @click.stop="openNavigation(item)">
                      <q-tooltip>导航</q-tooltip>
                    </q-btn>
                    <q-btn flat round size="sm" icon="local_taxi" color="orange" @click.stop="openDidiTaxi(item)">
                      <q-tooltip>滴滴打车</q-tooltip>
                    </q-btn>
                  </div>
                </q-item-section>
              </q-item>
            </q-list>
          </div>
        </q-card-section>
      </q-card>
    </q-dialog>

    <!-- 底部编辑面板 -->
    <q-dialog v-model="showEditBottomSheet" position="bottom" :maximized="false">
      <q-card class="edit-bottom-sheet">
        <!-- 顶部拖拽条和标题 -->
        <q-card-section class="q-pa-none">
          <!-- 拖拽指示条 -->
          <div class="flex justify-center q-pt-sm q-pb-xs">
            <div class="drag-indicator"></div>
          </div>

          <!-- 标题区域 -->
          <div class="row items-center q-px-md q-pb-sm">
            <div class="col">
              <div class="text-h6 text-weight-medium q-mb-xs">编辑行程</div>
              <div class="text-caption text-grey-6 ellipsis">
                {{ editForm.location || '行程信息' }}
              </div>
            </div>
            <div class="col-auto q-ml-sm">
              <q-btn flat round icon="close" size="md" v-close-popup color="grey-7" />
            </div>
          </div>
        </q-card-section>

        <q-separator />

        <!-- 编辑表单 -->
        <q-card-section class="q-pa-md edit-form-container">
          <q-form class="q-gutter-md">
            <!-- 基本信息组 -->
            <div class="form-group">
              <div class="form-group-title">基本信息</div>

              <!-- 日期和时间段 -->
              <div class="row q-gutter-sm q-mb-md">
                <div class="col">
                  <q-select v-model="editForm.date" :options="dateOptions" label="日期" outlined dense emit-value
                    map-options behavior="menu">
                    <template v-slot:prepend>
                      <q-icon name="event" />
                    </template>
                  </q-select>
                </div>
                <div class="col">
                  <q-select v-model="editForm.period" :options="periodOptions" label="时间段" outlined dense
                    behavior="menu">
                    <template v-slot:prepend>
                      <q-icon name="schedule" />
                    </template>
                  </q-select>
                </div>
              </div>

              <!-- 具体时间和时长 -->
              <div class="row q-gutter-sm q-mb-md">
                <div class="col">
                  <q-input v-model="editForm.time" label="具体时间" outlined dense placeholder="如: 08:28-12:34">
                    <template v-slot:prepend>
                      <q-icon name="access_time" />
                    </template>
                  </q-input>
                </div>
                <div class="col">
                  <q-input v-model="editForm.duration" label="时长" outlined dense placeholder="如: 4小时车程">
                    <template v-slot:prepend>
                      <q-icon name="timer" />
                    </template>
                  </q-input>
                </div>
              </div>
            </div>

            <!-- 地点信息组 -->
            <div class="form-group">
              <div class="form-group-title">地点信息</div>

              <!-- 地点输入 -->
              <q-input v-model="editForm.location" label="地点" outlined dense :rules="[val => !!val || '地点不能为空']"
                placeholder="如: 南通→济南西" class="q-mb-md">
                <template v-slot:prepend>
                  <q-icon name="place" />
                </template>
                <template v-slot:append>
                  <q-btn flat round icon="swap_horiz" size="sm" @click="swapLocation" />
                </template>
              </q-input>

              <!-- 类型选择 -->
              <q-select v-model="editForm.type" :options="typeOptions" label="类型" outlined dense behavior="menu"
                class="q-mb-md">
                <template v-slot:prepend>
                  <q-icon name="category" />
                </template>
              </q-select>
            </div>

            <!-- 详细信息组 -->
            <div class="form-group">
              <div class="form-group-title">详细信息</div>

              <!-- 描述 -->
              <q-input v-model="editForm.description" label="描述" outlined type="textarea" rows="3"
                :rules="[val => !!val || '描述不能为空']" placeholder="详细描述行程内容..." class="q-mb-md">
                <template v-slot:prepend>
                  <q-icon name="description" />
                </template>
              </q-input>

              <!-- 费用 -->
              <q-input v-model="editForm.cost" label="费用" outlined dense placeholder="如: 375元/人" class="q-mb-md">
                <template v-slot:prepend>
                  <q-icon name="payments" />
                </template>
              </q-input>

              <!-- 游览路线 -->
              <q-input v-model="editForm.route" label="游览路线" outlined type="textarea" rows="2"
                placeholder="如: 海边礁石→堤坝→蘑菇亭→贝壳亭..." class="q-mb-md">
                <template v-slot:prepend>
                  <q-icon name="route" />
                </template>
              </q-input>

              <!-- 备注 -->
              <q-input v-model="editForm.notes" label="备注" outlined type="textarea" rows="2" placeholder="其他注意事项..."
                class="q-mb-md">
                <template v-slot:prepend>
                  <q-icon name="note" />
                </template>
              </q-input>
            </div>

            <!-- 标签管理组 -->
            <div class="form-group">
              <div class="form-group-title">亮点标签</div>

              <!-- 推荐标签 -->
              <div v-if="recommendedTags.length" class="q-mb-sm">
                <div class="text-caption text-grey-6 q-mb-xs">推荐标签</div>
                <div class="row q-gutter-xs">
                  <q-chip v-for="tag in recommendedTags" :key="tag" clickable @click="addRecommendedTag(tag)"
                    color="blue-1" text-color="blue-8" size="sm" icon="add">
                    {{ tag }}
                  </q-chip>
                </div>
              </div>

              <!-- 当前标签 -->
              <div v-if="editForm.highlights && editForm.highlights.length" class="q-mb-sm">
                <div class="text-caption text-grey-6 q-mb-xs">当前标签</div>
                <div class="row q-gutter-xs">
                  <q-chip v-for="(highlight, index) in editForm.highlights" :key="index" removable
                    @remove="removeHighlight(index)" color="red-1" text-color="red-8" size="sm">
                    {{ highlight }}
                  </q-chip>
                </div>
              </div>

              <!-- 添加新标签 -->
              <q-input v-model="highlightInput" label="添加新标签" outlined dense @keyup.enter="addHighlight"
                placeholder="输入标签内容后按回车">
                <template v-slot:prepend>
                  <q-icon name="local_offer" />
                </template>
                <template v-slot:append>
                  <q-btn flat icon="add" @click="addHighlight" :disable="!highlightInput.trim()" />
                </template>
              </q-input>
            </div>
          </q-form>
        </q-card-section>

        <!-- 底部操作按钮 -->
        <q-card-actions class="q-pa-md q-pt-none sticky-bottom">
          <q-btn flat label="取消" color="grey" class="col-5" @click="cancelEdit" />
          <q-space />
          <q-btn unelevated label="保存" color="primary" class="col-5" :disable="!hasChanges" @click="saveEdit" />
        </q-card-actions>
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
  route?: string
  notes?: string
  image?: string
  completed: boolean
}

// 响应式数据
const selectedDate = ref('')
const showOriginalImage = ref(false)
const showImageDialogVisible = ref(false)
const currentImage = ref('')
const currentImageTitle = ref('')
const imageZoomed = ref(false)
// 编辑模式状态
const isEditMode = ref(false)

// 当日行程概览对话框
const showDailyOverview = ref(false)

// 编辑功能相关
const showEditBottomSheet = ref(false)
const editingIndex = ref(-1)
const highlightInput = ref('')
const originalEditForm = ref<ScheduleItem | null>(null)
const editForm = ref<ScheduleItem>({
  date: '',
  period: '上午' as '上午' | '下午' | '晚上',
  time: '',
  duration: '',
  location: '',
  type: '',
  description: '',
  highlights: [],
  cost: '',
  route: '',
  notes: '',
  image: '',
  completed: false
})

// 选项数据
const dateOptions = [
  { label: '10月4日', value: '10.4' },
  { label: '10月5日', value: '10.5' },
  { label: '10月6日', value: '10.6' },
  { label: '10月7日', value: '10.7' },
  { label: '10月8日', value: '10.8' }
]

const periodOptions = ['上午', '下午', '晚上']

const typeOptions = [
  '交通', '景点', '美食', '购物', '博物馆', '水上游览',
  '广场', '海滩', '教堂', '索道', '历史街区', '公园',
  '古街', '海岛', '市场', '自然景观', '古镇', '园林', '山景'
]

// 获取智能默认日期
const getSmartDefaultDate = (): string => {
  const today = new Date()
  const currentMonth = today.getMonth() + 1 // getMonth() 返回0-11
  const currentDay = today.getDate()

  // 行程日期范围：10月4日-10月8日
  const tripDates = ['10.4', '10.5', '10.6', '10.7', '10.8']

  // 如果是10月份，检查是否在行程日期范围内
  if (currentMonth === 10) {
    const currentDateStr = `10.${currentDay}`
    if (tripDates.includes(currentDateStr)) {
      // 当前日期在行程范围内，选择当天
      return currentDateStr
    }
  }

  // 三种情况都默认选择第一天：
  // 1. 还没到行程开始日期（10月4日之前）
  // 2. 已经过了行程结束日期（10月8日之后）
  // 3. 不是10月份
  return tripDates[0] || '10.4'
}

// 初始化默认选择的日期
selectedDate.value = getSmartDefaultDate()

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
  // 10.4 下午 - 济南西→你好酒店
  {
    date: '10.4',
    period: '下午',
    time: '约40-60分钟',
    location: '济南西→你好酒店',
    type: '交通',
    description: '约19公里',
    highlights: ['地铁出行', '打车备选'],
    notes: '可选择地铁或打车前往你好酒店，建议地铁经济实惠',
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
  // 10.4 下午 - 黑虎泉
  {
    date: '10.4',
    period: '下午',
    time: '全天开放',
    location: '黑虎泉',
    type: '景点',
    description: '黑虎泉位于济南，是其标志性名泉。它得名于泉水奔涌之声宛若虎啸的传说。其最标志性的形象，是泉水从三个石雕兽头中喷涌而出，汇入护城河。它自古就是百姓的饮用水源，如今依然是市民取水、亲水的热闹去处及著名旅游景点',
    highlights: ['免费景点', '泉城特色'],
    route: '导航到解放阁入口，右边可以依次经过九女泉→白石泉（可打水）→玛瑙泉→黑虎泉',
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
    notes: '微信小程序“天下第一泉”购买，只能购买当天票。上午班次08:00开始预约，下午班次11:00开始预约 (放票时间可能因水位调整)。建议购买16:00班次',
    completed: false
  },
  // 10.4 下午 - 大明湖
  {
    date: '10.4',
    period: '下午',
    time: '06:00-22:00',
    location: '大明湖',
    type: '景点',
    description: '与黑虎泉一样，大明湖也位于济南。其湖名可追溯至古时，标志形象是湖心的历下亭和环湖的垂柳。因电视剧"还珠格格"中"大明湖畔夏雨荷"的典故而家喻户晓。它自古是名士雅集之地，现为对公众免费开放的城市公园与旅游胜地',
    highlights: ['还珠格格拍摄地', '夕阳拍摄'],
    notes: '打卡夏雨荷（还珠格格），在大明湖拍夕阳，然后再去超然楼',
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
    notes: '拍照机位1: 搜索“南丰祠新区游船码头”，可拍摄南丰桥与超然楼同框。拍照机位2: 搜索“尚泉尚水茶馆”，其前面平台可拍摄湖面与楼阁全景。',
    completed: false
  },
  // 10.5 上午 - 你好酒店→趵突泉
  {
    date: '10.5',
    period: '上午',
    time: '步行约30分钟',
    location: '你好酒店→趵突泉',
    type: '交通',
    description: '约2.5公里',
    highlights: ['步行健身', '打车备选'],
    notes: '可选择步行约30分钟或打车前往趵突泉',
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
    highlights: ['天下第一泉', '李清照纪念馆', '观澜亭'],
    notes: '游玩路线：南门→趵突泉泉眼→漱玉泉→李清照纪念馆→观澜亭→万竹园→北门。8点前到人少一点，南门进北门出',
    completed: false
  },
  // 10.5 上午 - 五龙潭
  {
    date: '10.5',
    period: '上午',
    time: '07:00-22:00',
    location: '五龙潭',
    type: '景点',
    description: '免费景点，含五龙喷泉表演',
    highlights: ['五龙喷泉', '邓恩铭塑像', '天镜泉'],
    notes: '游玩路线：南门→五龙壁→天镜泉→玉泉→月牙泉→美铭广场→邓恩铭塑像→假山机位→五龙喷泉→东门。五龙喷泉整点启动15分钟(09:00-17:00)',
    completed: false
  },
  // 10.5 下午 - 泉城广场
  {
    date: '10.5',
    period: '下午',
    time: '免费',
    location: '泉城广场',
    type: '景点',
    description: '免费景点，可投喂鸽子',
    highlights: ['喷泉表演', '投喂鸽子'],
    notes: '广场西侧常有鸽子群，可买粮食(3元/包)投喂。喷泉表演：10:00, 15:00, 20:00三场，每场约20分钟',
    completed: false
  },
  // 10.5 下午 - 珍珠泉
  {
    date: '10.5',
    period: '下午',
    time: '全天开放',
    location: '珍珠泉',
    type: '景点',
    description: '免费景点',
    highlights: ['省人大院内', '历史景点'],
    notes: '定位：济南历下区院前街1号(省人大院内)',
    completed: false
  },
  // 10.5 下午 - 曲水亭街
  {
    date: '10.5',
    period: '下午',
    time: '免费',
    location: '曲水亭街',
    type: '古街',
    description: '街上走一走，墙上有大学的可以拍照',
    highlights: ['拍照打卡', '特色美食'],
    notes: '美食推荐：老周家牛肉烧饼、刘小忙把子肉',
    completed: false
  },
  // 10.5 下午 - 千佛山
  {
    date: '10.5',
    period: '下午',
    time: '门票30元/人',
    location: '千佛山',
    type: '景点',
    description: '从南门上山，10-20分钟能登顶',
    cost: '30元/人',
    highlights: ['登山健身', '俯瞰济南'],
    notes: '免费入园时间5点-6点半和18点-22点半',
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
    notes: '到达淄博后需要寄存行李。寄存柜：支持24小时自助存取，中号柜可容纳20寸行李箱，3小时8元/柜，不足3小时按3小时计费，超出按4元/小时叠加。大号柜3小时10元/柜，超出按5元/小时叠加',
    image: '柜子寄存.png',
    completed: false
  },
  // 10.6 上午 - 淄博陶瓷琉璃博物馆
  {
    date: '10.6',
    period: '上午',
    time: '09:00-17:00',
    location: '淄博陶瓷琉璃博物馆',
    type: '博物馆',
    description: '免费，需提前7天预约(9.30)，约9-12点的',
    highlights: ['琉璃艺术', '镇馆之宝', '琉璃烧烤'],
    route: '4楼琉璃灯工厅→五色厅→3楼国粹厅→2楼古瓷厅',
    notes: '4楼五色厅：战国琉璃珠【镇馆之宝】；3楼国粹厅：鸡油黄编钟、国宴骆驼、灯工石榴、琉璃淄博烧烤；2楼古瓷厅：青釉莲花尊【镇馆之宝】',
    completed: false
  },
  // 10.6 下午 - 淄博义乌小商品城2期
  {
    date: '10.6',
    period: '下午',
    time: '下午时光',
    location: '淄博义乌小商品城2期',
    type: '购物',
    description: '买饰品和小礼物',
    highlights: ['特色纪念品', '淄博特产'],
    notes: '推荐店铺：二期二楼东区5602@欣悦家居生活馆 冰箱贴、琉璃摆件和饰品；5505号店小圣诞树8元一个',
    completed: false
  },
  // 10.6 下午 - 八大局
  {
    date: '10.6',
    period: '下午',
    time: '用餐时间',
    location: '八大局',
    type: '美食',
    description: '美食广场：逛+吃',
    highlights: ['白老三炒锅饼', '博山菜', '淄博烧烤'],
    notes: '一条南北向的主街+两条东西向的次街。美食推荐：🌟白老三炒锅饼，麦香面食紫米饼；🍱博山菜：炸肉和风味茄子；🍢烧烤：走之前再去趟烧烤店',
    completed: false
  },
  // 10.6 晚上 - 淄博→青岛
  {
    date: '10.6',
    period: '晚上',
    time: '16:41-18:47',
    location: '淄博→青岛',
    type: '交通',
    description: 'D8185次列车，青岛站→汉庭(青岛栈桥火车站东广场店)',
    highlights: ['转战青岛', '海滨城市'],
    notes: '列车路程约2小时06分钟',
    completed: false
  },
  // 10.6 晚上 - 来之顺海鲜
  {
    date: '10.6',
    period: '晚上',
    time: '晚餐时间',
    location: '来之顺海鲜菜馆',
    type: '美食',
    description: '推荐海肠捞饭',
    highlights: ['海肠捞饭', '青岛海鲜'],
    notes: '美团已买套餐，有效期至10.6',
    completed: false
  },
  // 10.6 晚上 - 来之顺→五四广场交通
  {
    date: '10.6',
    period: '晚上',
    time: '约30分钟',
    location: '来之顺→五四广场',
    type: '交通',
    description: '地铁3号线坐6站',
    highlights: ['地铁出行', '6站路程'],
    notes: '从来之顺海鲜菜馆前往五四广场，地铁3号线直达',
    completed: false
  },
  // 10.6 晚上 - 五四广场
  {
    date: '10.6',
    period: '晚上',
    time: '晚间',
    location: '五四广场',
    type: '广场',
    description: '溜达一圈之后可以步行至奥帆中心',
    highlights: ['五四雕塑', '海滨广场'],
    notes: '欣赏五四雕塑，感受青岛海滨夜景',
    completed: false
  },
  // 10.6 晚上 - 奥帆中心
  {
    date: '10.6',
    period: '晚上',
    time: '19:30-22:00',
    location: '奥帆中心',
    type: '景点',
    description: '灯光秀19:30-22:00',
    highlights: ['奥帆灯光秀', '海上剧场'],
    notes: '导航至奥帆中心海上剧场',
    completed: false
  },
  // 10.6 晚上 - 石老人海水浴场
  {
    date: '10.6',
    period: '晚上',
    time: '09:00-18:00',
    location: '石老人海水浴场',
    type: '海滩',
    description: '导航至石老人健身区停车场',
    highlights: ['赶海体验', '预测21点后退潮'],
    notes: '看好赶海时间，预测是21点之后退潮，提前美团买好送到酒店(23元/套)',
    completed: false
  },
  // 10.7 上午 - 天主教堂
  {
    date: '10.7',
    period: '上午',
    time: '08:00-18:00',
    location: '天主教圣弥厄尔大教堂',
    type: '教堂',
    description: '门票10元/人，门口拍照即可，不用进去',
    cost: '10元/人',
    highlights: ['哥特式建筑', '拍照打卡'],
    notes: '周一至周六08:00-18:00，周日10:00-18:00开放',
    image: '7号全天路线.png',
    completed: false
  },
  // 10.7 上午 - 信号山
  {
    date: '10.7',
    period: '上午',
    time: '06:00-20:00',
    location: '信号山',
    type: '景点',
    description: '免费，但需要在门口扫描二维码预约',
    highlights: ['观景楼票价10元', '可不去'],
    notes: '门口扫描二维码预约，观景楼可选择不去',
    completed: false
  },
  // 10.7 上午 - 信号山→小麦岛交通
  {
    date: '10.7',
    period: '上午',
    time: '约30-40分钟',
    location: '信号山→小麦岛',
    type: '交通',
    description: '3号线转2号线，或者打车12km，20元左右',
    highlights: ['地铁转乘', '打车备选'],
    notes: '推荐地铁3号线转2号线，打车约20元',
    completed: false
  },
  // 10.7 上午 - 小麦岛
  {
    date: '10.7',
    period: '上午',
    time: '全天开放',
    location: '小麦岛',
    type: '景点',
    description: '免费，去小麦岛定位东园北侧更近',
    highlights: ['网红打卡', '孤独的树', '日出观赏'],
    route: '进去之后直走→到分叉路口(小海豚)左转→进入向上的木栈道→沿着白色石子路走到尽头左转→蓝色房子边上"五棵树"→接着往前走能看到石头墙→再往前就是"孤独的树"',
    notes: '天气好的话这个地方可以早看日出，日出时间5点50',
    completed: false
  },
  // 10.7 上午 - 雕塑园
  {
    date: '10.7',
    period: '上午',
    time: '全天开放',
    location: '雕塑园',
    type: '景点',
    description: '免费',
    highlights: ['艺术雕塑', '休闲漫步'],
    notes: '导航：雕塑园3号门',
    completed: false
  },
  // 10.7 下午 - 小鱼山公园
  {
    date: '10.7',
    period: '下午',
    time: '06:00-20:00',
    location: '小鱼山公园',
    type: '公园',
    description: '免费',
    highlights: ['览潮阁观景', '红屋顶全景'],
    route: '正门入口(福山支路)→沿台阶上山→览潮阁(山顶)→碧波亭→拥翠亭→下山',
    notes: '览潮阁2楼3楼观景平台无遮挡，可以看到第一海水浴场，也可以远眺栈桥和教堂，与信号山相望，可以看到一片片的红屋顶青岛老房子',
    completed: false
  },
  // 10.7 下午 - 栈桥
  {
    date: '10.7',
    period: '下午',
    time: '全天开放',
    location: '栈桥',
    type: '景点',
    description: '免费',
    highlights: ['青岛地标', '海上栈桥'],
    notes: '回澜阁4元(旺季7:00-19:00，淡季8:00-17:30)，不用登阁，拍拍照即可',
    completed: false
  },
  // 10.7 下午 - 团岛农贸市场
  {
    date: '10.7',
    period: '下午',
    time: '市场营业时间',
    location: '团岛农贸市场',
    type: '市场',
    description: '干饭，海胆/',
    highlights: ['海鲜市场', '当地美食'],
    notes: '品尝新鲜海鲜，体验当地市场文化',
    completed: false
  },
  // 10.8 上午 - 小青岛
  {
    date: '10.8',
    period: '上午',
    time: '06:00-20:00',
    location: '小青岛',
    type: '海岛',
    description: '免费',
    highlights: ['白色灯塔', '海边礁石'],
    route: '海边礁石→堤坝→蘑菇亭→贝壳亭→转角石阶→石板路→龙柏树→白色灯塔→小火车轨礁石',
    notes: '上岛后往左边开始环岛走一圈。汉庭(青岛栈桥火车站东广场店)→青海轮渡站，1.8km，可步行约20分钟或打车前往',
    completed: false
  },
  // 10.8 上午 - 太平山索道
  {
    date: '10.8',
    period: '上午',
    time: '08:30-19:30',
    location: '太平山索道',
    type: '索道',
    description: '单程票80元/人',
    cost: '80元/人',
    highlights: ['湛山寺→太平角公园→中山公园'],
    notes: '🚗打车到湛山寺南门，大门左边一直走到厕所，旁边有小门可以进去，进到公园可以看到"索道站"。📸湛山寺到太平山拍照最出片！拍照的时候有阿姨会提醒摆动作。在太平山下缆车可以选照片，照片+电子档30元',
    completed: false
  },
  // 10.8 下午 - 八大关
  {
    date: '10.8',
    period: '下午',
    time: '全天开放',
    location: '八大关',
    type: '历史街区',
    description: '八大关因最初有八条以长城关隘命名的路而得名。其标志性形象是红瓦绿树掩映下的"万国建筑群"。它曾是中外上层人士的别墅区，如今则是融合了历史风貌、婚纱摄影与疗养功能的著名风景区',
    highlights: ['万国建筑', '花石楼', '公主楼'],
    route: '中山公园C出口→韶关路→嘉峪关路→临淮关路(龙柏超适合拍照)→公主楼→蝴蝶楼→花石楼(推荐二楼观景台打卡)',
    notes: '游览贴士：街区免费开放，部分建筑单独收费(如花石楼8元，公主楼20元)。花石楼可进入',
    completed: false
  },
  // 10.8 下午 - 第二海水浴场
  {
    date: '10.8',
    period: '下午',
    time: '全天开放',
    location: '第二海水浴场',
    type: '海滩',
    description: '免费',
    highlights: ['海滩游玩', '山洞拍照'],
    notes: '冲脚处1元/次，储物柜20元/小时。有山洞可以打卡拍照(随缘逛)',
    completed: false
  },
  // 10.8 晚上 - 青岛轮渡
  {
    date: '10.8',
    period: '晚上',
    time: '08:00-18:20',
    location: '青岛轮渡',
    type: '水上游览',
    description: '【航行时间】为30min',
    cost: '89元/人',
    highlights: ['海上观光', '免费啤酒'],
    notes: '青岛轮渡公众号89元/人，抖音132元/两人(已买)。环游路线：青岛轮渡站→小港湾→邮轮母港→胶州湾大桥→马踏飞燕灯塔→青岛轮渡站。凭游船纸质票(核销后领取凭证)可在指定位置领取200毫升啤酒或饮料一杯，及一份鸥食，当日有效',
    image: '青岛轮渡.png',
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

// 动态统计信息
const dynamicStats = computed(() => {
  if (!selectedDate.value) {
    // 显示总体统计
    return {
      count: scheduleData.value.length,
      route: '济南→淄博→青岛',
      duration: '5天行程'
    }
  }

  // 显示当日统计
  const daySchedule = filteredSchedule.value

  return {
    count: daySchedule.length
  }
})

// 计算属性 - 推荐标签
const recommendedTags = computed(() => {
  const tags: string[] = []

  // 根据类型推荐标签
  if (editForm.value.type === '交通') {
    if (editForm.value.description?.includes('G')) tags.push('高铁出行')
    if (editForm.value.description?.includes('D')) tags.push('动车出行')
    if (editForm.value.time?.includes('-')) {
      const times = editForm.value.time.split('-')
      if (times.length === 2 && times[0] && times[1]) {
        const start = times[0].split(':')
        const end = times[1].split(':')
        if (start.length === 2 && end.length === 2 && start[0] && start[1] && end[0] && end[1]) {
          const startMinutes = parseInt(start[0]) * 60 + parseInt(start[1])
          const endMinutes = parseInt(end[0]) * 60 + parseInt(end[1])
          const duration = Math.round((endMinutes - startMinutes) / 60 * 10) / 10
          if (duration > 0) tags.push(`${duration}小时车程`)
        }
      }
    }
  }

  if (editForm.value.type === '景点') {
    tags.push('必游景点', '拍照打卡')
  }

  if (editForm.value.type === '美食') {
    tags.push('当地特色', '美食推荐')
  }

  if (editForm.value.cost) {
    tags.push('需要费用')
  } else {
    tags.push('免费景点')
  }

  // 过滤已存在的标签
  return tags.filter(tag => !editForm.value.highlights?.includes(tag))
})

// 计算属性 - 是否有变化
const hasChanges = computed(() => {
  if (!originalEditForm.value) return false

  return JSON.stringify(editForm.value) !== JSON.stringify(originalEditForm.value)
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
  const locationName = encodeURIComponent(item.location)
  const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)

  // 桌面设备直接打开网页版导航
  if (!isMobile) {
    window.open(`https://uri.amap.com/navigation?to=,,${locationName}&mode=walk&src=iTrip`, '_blank')
    return
  }

  const isIOS = /iPhone|iPad|iPod/i.test(navigator.userAgent)
  // 使用导航URL格式，直接设置目的地，t=2表示步行导航
  const iosUrl = `iosamap://route/plan/?dname=${locationName}&dev=0&t=2&sourceApplication=iTrip`
  const androidUrl = `amap://route/plan/?dname=${locationName}&dev=0&t=2&sourceApplication=iTrip`
  const webUrl = `https://uri.amap.com/navigation?to=,,${locationName}&mode=walk&src=iTrip`

  $q.notify({
    message: '正在打开高德地图导航...',
    color: 'positive',
    icon: 'directions_walk',
    timeout: 2000
  })

  // 尝试打开APP进行导航
  window.open(isIOS ? iosUrl : androidUrl, '_blank')

  // 2秒后如果APP没有打开，则打开网页版作为备用方案
  setTimeout(() => {
    window.open(webUrl, '_blank')
  }, 2000)
}

// 获取用户当前位置
const getCurrentLocation = (): Promise<{ latitude: number; longitude: number }> => {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new Error('浏览器不支持地理位置获取'))
      return
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        resolve({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude
        })
      },
      (error) => {
        let errorMessage = '获取位置失败'
        switch (error.code) {
          case error.PERMISSION_DENIED:
            errorMessage = '用户拒绝了位置权限请求'
            break
          case error.POSITION_UNAVAILABLE:
            errorMessage = '位置信息不可用'
            break
          case error.TIMEOUT:
            errorMessage = '获取位置超时'
            break
        }
        reject(new Error(errorMessage))
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 300000 // 5分钟内的缓存位置可用
      }
    )
  })
}

// 滴滴打车功能
const openDidiTaxi = async (item: ScheduleItem) => {
  try {
    $q.notify({
      message: '正在获取您的位置...',
      color: 'info',
      icon: 'my_location',
      timeout: 3000
    })

    // 获取用户当前位置
    const currentLocation = await getCurrentLocation()

    // 处理目的地名称
    let destinationName = item.location
    // 如果包含箭头，取目标地点
    if (destinationName.includes('→')) {
      destinationName = destinationName.split('→').pop()?.trim() || destinationName
    }
    // 去掉括号内的详细信息
    if (destinationName.includes('(')) {
      destinationName = destinationName.split('(')[0]?.trim() || destinationName
    }

    const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)

    // 构建滴滴打车URL
    const didiWebUrl = `https://webapp.diditaxi.com.cn/?city=&maptype=wgs84&fromlat=${currentLocation.latitude}&fromlng=${currentLocation.longitude}&fromaddr=当前位置&toaddr=${encodeURIComponent(destinationName)}&toshop=&channel=web`

    // 尝试打开滴滴APP (URL Scheme)
    const didiAppUrl = `diditaxi://taxi?fromlat=${currentLocation.latitude}&fromlng=${currentLocation.longitude}&fromaddr=当前位置&toaddr=${encodeURIComponent(destinationName)}`

    $q.notify({
      message: '正在打开滴滴打车...',
      color: 'positive',
      icon: 'local_taxi',
      timeout: 2000
    })

    if (isMobile) {
      // 移动端：先尝试打开APP，失败则打开网页版
      try {
        window.open(didiAppUrl, '_blank')
        // 2秒后如果APP没有打开，则打开网页版作为备用方案
        setTimeout(() => {
          window.open(didiWebUrl, '_blank')
        }, 2000)
      } catch (error) {
        // 如果APP调用失败，直接打开网页版
        window.open(didiWebUrl, '_blank')
      }
    } else {
      // 桌面端：直接打开网页版
      window.open(didiWebUrl, '_blank')
    }

  } catch (error) {
    console.error('滴滴打车调用失败:', error)

    $q.notify({
      message: `滴滴打车调用失败: ${error instanceof Error ? error.message : '未知错误'}`,
      color: 'negative',
      icon: 'error',
      timeout: 4000,
      actions: [
        {
          label: '重试',
          color: 'white',
          handler: () => openDidiTaxi(item)
        },
        {
          label: '关闭',
          color: 'white',
          handler: () => { }
        }
      ]
    })
  }
}

const showImageDialog = (imagePath: string, title: string) => {
  currentImage.value = imagePath
  currentImageTitle.value = title
  imageZoomed.value = false // 重置缩放状态
  showImageDialogVisible.value = true
}

// 双击切换缩放
const toggleImageZoom = () => {
  imageZoomed.value = !imageZoomed.value
}

// 编辑功能相关方法
const editItem = (item: ScheduleItem) => {
  // 找到当前编辑项的索引
  editingIndex.value = scheduleData.value.findIndex(scheduleItem =>
    scheduleItem.date === item.date &&
    scheduleItem.location === item.location &&
    scheduleItem.time === item.time
  )

  // 深拷贝当前项到编辑表单
  editForm.value = {
    ...item,
    highlights: item.highlights ? [...item.highlights] : []
  }

  // 保存原始数据用于变化检测
  originalEditForm.value = {
    ...item,
    highlights: item.highlights ? [...item.highlights] : []
  }

  // 清空亮点输入框
  highlightInput.value = ''

  // 显示底部编辑面板
  showEditBottomSheet.value = true
}

const addHighlight = () => {
  const highlight = highlightInput.value.trim()
  if (highlight && !editForm.value.highlights?.includes(highlight)) {
    if (!editForm.value.highlights) {
      editForm.value.highlights = []
    }
    editForm.value.highlights.push(highlight)
    highlightInput.value = ''
  }
}

const addRecommendedTag = (tag: string) => {
  if (!editForm.value.highlights?.includes(tag)) {
    if (!editForm.value.highlights) {
      editForm.value.highlights = []
    }
    editForm.value.highlights.push(tag)
  }
}

const removeHighlight = (index: number) => {
  if (editForm.value.highlights) {
    editForm.value.highlights.splice(index, 1)
  }
}

const swapLocation = () => {
  const location = editForm.value.location
  if (location.includes('→')) {
    const parts = location.split('→')
    if (parts.length === 2 && parts[0] && parts[1]) {
      editForm.value.location = `${parts[1].trim()}→${parts[0].trim()}`
    }
  }
}

const cancelEdit = () => {
  if (hasChanges.value) {
    $q.dialog({
      title: '确认取消',
      message: '您有未保存的修改，确定要取消吗？',
      cancel: true,
      persistent: true
    }).onOk(() => {
      showEditBottomSheet.value = false
    })
  } else {
    showEditBottomSheet.value = false
  }
}

const saveEdit = () => {
  // 验证必填字段
  if (!editForm.value.location.trim()) {
    $q.notify({
      message: '地点不能为空',
      color: 'negative',
      icon: 'error'
    })
    return
  }

  if (!editForm.value.description.trim()) {
    $q.notify({
      message: '描述不能为空',
      color: 'negative',
      icon: 'error'
    })
    return
  }

  // 更新数据
  if (editingIndex.value >= 0) {
    // 清理空字符串字段
    const updatedItem: ScheduleItem = { ...editForm.value }
    if (!updatedItem.duration?.trim()) {
      delete (updatedItem as any).duration
    }
    if (!updatedItem.cost?.trim()) {
      delete (updatedItem as any).cost
    }
    if (!updatedItem.route?.trim()) {
      delete (updatedItem as any).route
    }
    if (!updatedItem.notes?.trim()) {
      delete (updatedItem as any).notes
    }
    if (!updatedItem.image?.trim()) {
      delete (updatedItem as any).image
    }
    if (!updatedItem.highlights?.length) {
      delete (updatedItem as any).highlights
    }

    scheduleData.value[editingIndex.value] = updatedItem

    $q.notify({
      message: '行程信息已更新',
      color: 'positive',
      icon: 'check_circle',
      timeout: 2000
    })

    // 关闭面板
    showEditBottomSheet.value = false
  }
}

const getImageLinkText = (imagePath: string) => {
  if (imagePath.includes('路线')) {
    return '查看全天路线图'
  } else if (imagePath.includes('轮渡')) {
    return '查看预订截图'
  } else if (imagePath.includes('寄存') || imagePath.includes('柜子')) {
    return '查看寄存柜信息'
  } else {
    return '查看相关图片'
  }
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

// 模式切换相关方法
const toggleEditMode = () => {
  isEditMode.value = !isEditMode.value

  if (isEditMode.value) {
    $q.notify({
      message: '已进入编辑模式，可以拖拽排序和删除行程',
      color: 'info',
      icon: 'edit',
      timeout: 3000
    })
  } else {
    $q.notify({
      message: '已退出编辑模式',
      color: 'positive',
      icon: 'check',
      timeout: 2000
    })
  }
}

// 查看详情（查看模式专用）
const viewItemDetails = (item: ScheduleItem) => {
  $q.dialog({
    title: item.location,
    message: `
      <div style="text-align: left;">
        <p><strong>日期：</strong>${formatDateLabel(item.date)} ${item.period}</p>
        <p><strong>时间：</strong>${item.time}${item.duration ? ` (${item.duration})` : ''}</p>
        <p><strong>类型：</strong>${item.type}</p>
        <p><strong>描述：</strong>${item.description}</p>
        ${item.cost ? `<p><strong>费用：</strong>${item.cost}</p>` : ''}
        ${item.route ? `<p><strong>路线：</strong>${item.route}</p>` : ''}
        ${item.notes ? `<p><strong>备注：</strong>${item.notes}</p>` : ''}
        ${item.highlights?.length ? `<p><strong>亮点：</strong>${item.highlights.join(', ')}</p>` : ''}
      </div>
    `,
    html: true,
    ok: false
  })
}

// 确认删除（编辑模式专用）
const confirmDeleteItem = (item: ScheduleItem, index: number) => {
  $q.dialog({
    title: '确认删除',
    message: `您确定要删除「${item.location}」这段行程吗？此操作无法撤销。`,
    persistent: true,
    ok: {
      label: '确认删除',
      color: 'negative'
    },
    cancel: {
      label: '取消',
      color: 'grey'
    }
  }).onOk(() => {
    // 删除行程
    const actualIndex = scheduleData.value.findIndex(scheduleItem =>
      scheduleItem.date === item.date &&
      scheduleItem.location === item.location &&
      scheduleItem.time === item.time
    )

    if (actualIndex >= 0) {
      scheduleData.value.splice(actualIndex, 1)
      $q.notify({
        message: '行程已删除',
        color: 'positive',
        icon: 'delete',
        timeout: 2000
      })
    }
  })
}

// 时间轴相关方法
const getTimelineIcon = (type: string) => {
  const iconMap: Record<string, string> = {
    '交通': 'directions_transit',
    '景点': 'place',
    '美食': 'restaurant',
    '购物': 'shopping_bag',
    '博物馆': 'museum',
    '水上游览': 'directions_boat',
    '广场': 'park',
    '海滩': 'beach_access',
    '教堂': 'church',
    '索道': 'cable_car',
    '历史街区': 'location_city',
    '公园': 'nature',
    '古街': 'streetview',
    '海岛': 'island',
    '市场': 'store',
    '自然景观': 'landscape',
    '古镇': 'home_work',
    '园林': 'eco',
    '山景': 'terrain'
  }
  return iconMap[type] || 'place'
}

const getTypeBadgeColor = (type: string) => {
  const colorMap: Record<string, string> = {
    '交通': 'blue-6',
    '景点': 'green-6',
    '美食': 'orange-6',
    '购物': 'pink-6',
    '博物馆': 'purple-6',
    '水上游览': 'cyan-6',
    '广场': 'teal-6',
    '海滩': 'light-blue-6',
    '教堂': 'deep-purple-6',
    '索道': 'indigo-6',
    '历史街区': 'brown-6',
    '公园': 'light-green-6',
    '古街': 'amber-6',
    '海岛': 'blue-grey-6',
    '市场': 'red-6',
    '自然景观': 'green-7',
    '古镇': 'brown-7',
    '园林': 'light-green-7',
    '山景': 'blue-grey-7'
  }
  return colorMap[type] || 'grey-6'
}

// 简化地点名称显示
const getSimpleLocationName = (location: string) => {
  let simpleName = location

  // 如果包含箭头，取目标地点
  if (simpleName.includes('→')) {
    const parts = simpleName.split('→')
    simpleName = parts[parts.length - 1]?.trim() || simpleName
  }

  // 去掉括号内的详细信息
  if (simpleName.includes('(')) {
    const parts = simpleName.split('(')
    simpleName = parts[0]?.trim() || simpleName
  }

  return simpleName
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
    justify-content: space-between;
    padding: 8px 0 16px 0;
    border-bottom: 1px solid rgba(255, 255, 255, 0.12);
    margin-bottom: 16px;

    .stats-content {
      display: flex;
      align-items: center;
      flex: 1;

      .text-caption {
        font-size: 0.75rem;
        line-height: 1.4;
        transition: all 0.3s ease;

        // 当选中特定日期时的样式
        &:not(:empty) {
          color: #1976d2;
          font-weight: 500;
        }
      }

      .view-original-btn {
        opacity: 0.6;
        transition: opacity 0.2s ease;

        &:hover {
          opacity: 1;
        }
      }

      .daily-overview-btn {
        transition: all 0.2s ease;

        &:hover {
          transform: translateY(-1px);
          box-shadow: 0 2px 8px rgba(25, 118, 210, 0.2);
        }
      }
    }

    .mode-toggle {
      .mode-toggle-btn {
        font-weight: 600;
        transition: all 0.3s ease;

        &:hover {
          transform: translateY(-1px);
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
        }
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

        .image-info-compact {
          padding: 8px 12px;
          background: rgba(25, 118, 210, 0.04);
          border-radius: 8px;
          border-left: 3px solid #1976d2;

          span {
            transition: all 0.2s ease;

            &:hover {
              text-decoration: underline;
              color: #1565c0;
            }
          }

          .thumbnail-image {
            width: 60px;
            height: 40px;
            object-fit: cover;
            transition: all 0.2s ease;
            border: 1px solid rgba(0, 0, 0, 0.12);

            &:hover {
              transform: scale(1.05);
              border-color: #1976d2;
              box-shadow: 0 2px 8px rgba(25, 118, 210, 0.3);
            }
          }
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

      // 编辑模式样式
      &.edit-mode {
        position: relative;

        .edit-controls {
          position: absolute;
          top: 12px;
          right: 12px;
          display: flex;
          align-items: center;
          gap: 8px;
          z-index: 10;

          .drag-handle {
            cursor: grab;
            padding: 4px;
            border-radius: 4px;
            transition: all 0.2s ease;

            &:hover {
              background: rgba(0, 0, 0, 0.05);
            }

            &:active {
              cursor: grabbing;
              background: rgba(0, 0, 0, 0.1);
            }
          }

          .delete-btn {
            transition: all 0.2s ease;

            &:hover {
              transform: scale(1.1);
            }
          }
        }
      }
    }

    // 编辑模式下的列表样式
    &.edit-mode {
      .schedule-item {
        padding-right: 80px; // 为编辑控件留出空间

        &:hover {
          .edit-controls {
            .drag-handle {
              background: rgba(0, 0, 0, 0.08);
            }
          }
        }
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

// 图片缩放相关样式
.image-container {
  cursor: pointer;
  overflow: hidden;

  .zoomable-image {
    transition: all 0.3s ease;
    cursor: pointer;

    &.zoomed {
      transform: scale(2);
      cursor: grab;

      &:active {
        cursor: grabbing;
      }
    }
  }

  &.zoomed {
    overflow: auto;
  }
}

.zoom-btn {
  background: rgba(0, 0, 0, 0.5);
  backdrop-filter: blur(8px);

  &:hover {
    background: rgba(0, 0, 0, 0.7);
  }
}

// 底部编辑面板样式
.edit-bottom-sheet {
  border-radius: 20px 20px 0 0;
  max-height: 85vh;
  min-height: 50vh;

  .drag-indicator {
    width: 40px;
    height: 4px;
    background: rgba(0, 0, 0, 0.3);
    border-radius: 2px;
    transition: all 0.2s ease;

    &:hover {
      background: rgba(0, 0, 0, 0.4);
    }
  }

  .edit-form-container {
    max-height: 60vh;
    overflow-y: auto;

    // 自定义滚动条
    &::-webkit-scrollbar {
      width: 4px;
    }

    &::-webkit-scrollbar-track {
      background: rgba(0, 0, 0, 0.05);
      border-radius: 2px;
    }

    &::-webkit-scrollbar-thumb {
      background: rgba(0, 0, 0, 0.2);
      border-radius: 2px;

      &:hover {
        background: rgba(0, 0, 0, 0.3);
      }
    }
  }

  .form-group {
    margin-bottom: 24px;

    .form-group-title {
      font-size: 0.875rem;
      font-weight: 600;
      color: #1976d2;
      margin-bottom: 12px;
      padding-bottom: 4px;
      border-bottom: 2px solid rgba(25, 118, 210, 0.1);
    }
  }

  .sticky-bottom {
    background: white;
    border-top: 1px solid rgba(0, 0, 0, 0.12);

    .q-btn {
      font-weight: 500;
    }
  }

  // 文字省略样式
  .ellipsis {
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    max-width: 100%;
  }

  // 标题区域优化
  .text-h6 {
    font-size: 1.125rem;
    line-height: 1.4;
  }

  .text-caption {
    font-size: 0.75rem;
    line-height: 1.3;
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

      // 深色模式下的编辑控件
      &.edit-mode {
        .edit-controls {
          .drag-handle {
            &:hover {
              background: rgba(255, 255, 255, 0.08);
            }

            &:active {
              background: rgba(255, 255, 255, 0.12);
            }
          }
        }

        &:hover {
          .edit-controls {
            .drag-handle {
              background: rgba(255, 255, 255, 0.1);
            }
          }
        }
      }
    }
  }

  // 深色模式下的编辑面板
  .edit-bottom-sheet {
    background: #1e1e1e;
    color: white;

    .drag-indicator {
      background: rgba(255, 255, 255, 0.4);

      &:hover {
        background: rgba(255, 255, 255, 0.5);
      }
    }

    .form-group-title {
      color: #64b5f6;
      border-bottom-color: rgba(100, 181, 246, 0.2);
    }

    .sticky-bottom {
      background: #1e1e1e;
      border-top-color: rgba(255, 255, 255, 0.12);
    }

    .edit-form-container {
      &::-webkit-scrollbar-track {
        background: rgba(255, 255, 255, 0.05);
      }

      &::-webkit-scrollbar-thumb {
        background: rgba(255, 255, 255, 0.2);

        &:hover {
          background: rgba(255, 255, 255, 0.3);
        }
      }
    }
  }
}

// 当日行程概览对话框样式
.daily-overview-dialog {
  .dialog-header {
    background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
    border-bottom: 1px solid rgba(0, 0, 0, 0.12);
  }

  .simple-list-container {
    max-height: calc(100vh - 120px);
    overflow-y: auto;

    // 自定义滚动条
    &::-webkit-scrollbar {
      width: 6px;
    }

    &::-webkit-scrollbar-track {
      background: rgba(0, 0, 0, 0.05);
      border-radius: 3px;
    }

    &::-webkit-scrollbar-thumb {
      background: rgba(0, 0, 0, 0.2);
      border-radius: 3px;

      &:hover {
        background: rgba(0, 0, 0, 0.3);
      }
    }

    .q-list {
      .simple-list-item {
        border-radius: 8px;
        margin-bottom: 4px;
        transition: all 0.2s ease;

        &:hover {
          background: rgba(25, 118, 210, 0.04);
          transform: translateX(4px);
        }

        &.completed {
          opacity: 0.6;

          .q-item-label {
            text-decoration: line-through;
          }
        }

        .q-avatar {
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
        }

        .q-item-label {
          font-size: 1rem;
          line-height: 1.4;

          &.text-h6 {
            color: #1976d2;
          }
        }

        .q-item-section--side {
          .q-btn {
            transition: all 0.2s ease;

            &:hover {
              transform: scale(1.1);
            }
          }
        }
      }
    }
  }

  .timeline-wrapper {
    position: relative;
    padding-left: 40px;
  }

  .timeline-item {
    position: relative;
    display: flex;
    margin-bottom: 24px;

    &:last-child {
      margin-bottom: 0;
    }

    .timeline-line {
      position: absolute;
      left: -40px;
      top: 0;
      display: flex;
      flex-direction: column;
      align-items: center;

      .timeline-node {
        width: 40px;
        height: 40px;
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        color: white;
        font-weight: 600;
        box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
        z-index: 2;

        // 不同类型的节点颜色
        &.node-交通 {
          background: linear-gradient(135deg, #2196f3, #1976d2);
        }

        &.node-景点 {
          background: linear-gradient(135deg, #4caf50, #388e3c);
        }

        &.node-美食 {
          background: linear-gradient(135deg, #ff9800, #f57c00);
        }

        &.node-购物 {
          background: linear-gradient(135deg, #e91e63, #c2185b);
        }

        &.node-博物馆 {
          background: linear-gradient(135deg, #9c27b0, #7b1fa2);
        }

        &.node-水上游览 {
          background: linear-gradient(135deg, #00bcd4, #0097a7);
        }

        &.node-广场 {
          background: linear-gradient(135deg, #009688, #00695c);
        }

        &.node-海滩 {
          background: linear-gradient(135deg, #03a9f4, #0277bd);
        }

        &.node-教堂 {
          background: linear-gradient(135deg, #673ab7, #512da8);
        }

        &.node-索道 {
          background: linear-gradient(135deg, #3f51b5, #303f9f);
        }

        &.node-历史街区 {
          background: linear-gradient(135deg, #795548, #5d4037);
        }

        &.node-公园 {
          background: linear-gradient(135deg, #8bc34a, #689f38);
        }

        &.node-古街 {
          background: linear-gradient(135deg, #ffc107, #ffa000);
        }

        &.node-海岛 {
          background: linear-gradient(135deg, #607d8b, #455a64);
        }

        &.node-市场 {
          background: linear-gradient(135deg, #f44336, #d32f2f);
        }
      }

      .timeline-connector {
        width: 3px;
        height: 60px;
        background: linear-gradient(to bottom, #e0e0e0, #bdbdbd);
        margin-top: 8px;
        border-radius: 2px;
      }
    }

    .timeline-content {
      flex: 1;
      margin-left: 16px;

      .timeline-card {
        border-radius: 12px;
        transition: all 0.3s ease;
        border-left: 4px solid transparent;

        &:hover {
          transform: translateX(4px);
          box-shadow: 0 8px 24px rgba(0, 0, 0, 0.12);
        }

        &.completed {
          opacity: 0.7;

          .timeline-header .timeline-location span {
            text-decoration: line-through;
          }
        }

        .timeline-header {
          .timeline-time {
            display: flex;
            align-items: center;
            margin-bottom: 8px;
          }

          .timeline-location {
            display: flex;
            align-items: center;

            span {
              font-weight: 600;
              font-size: 1.1rem;
            }
          }
        }

        .timeline-details {
          .timeline-highlights {
            margin: 8px 0;
          }

          .timeline-meta {
            .meta-item {
              display: flex;
              align-items: center;

              &.cost {
                padding: 6px 12px;
                background: rgba(76, 175, 80, 0.1);
                border-radius: 6px;
                border-left: 3px solid #4caf50;
              }

              &.notes {
                padding: 6px 12px;
                background: rgba(255, 152, 0, 0.1);
                border-radius: 6px;
                border-left: 3px solid #ff9800;
              }
            }
          }
        }

        .timeline-actions {
          display: flex;
          align-items: center;
          gap: 8px;
        }
      }
    }
  }
}

// 深色模式下的时间轴对话框
.body--dark {
  .daily-overview-dialog {
    background: #1e1e1e;
    color: white;

    .dialog-header {
      background: linear-gradient(135deg, #2d2d2d 0%, #1e1e1e 100%);
      border-bottom-color: rgba(255, 255, 255, 0.12);
    }

    .simple-list-container {
      &::-webkit-scrollbar-track {
        background: rgba(255, 255, 255, 0.05);
      }

      &::-webkit-scrollbar-thumb {
        background: rgba(255, 255, 255, 0.2);

        &:hover {
          background: rgba(255, 255, 255, 0.3);
        }
      }

      .q-list {
        .simple-list-item {
          &:hover {
            background: rgba(100, 181, 246, 0.08);
          }

          .q-item-label.text-h6 {
            color: #64b5f6;
          }
        }
      }
    }

    .timeline-item {
      .timeline-line {
        .timeline-connector {
          background: linear-gradient(to bottom, #424242, #616161);
        }
      }

      .timeline-content {
        .timeline-card {
          background: rgba(255, 255, 255, 0.05);
          border-color: rgba(255, 255, 255, 0.12);

          &:hover {
            background: rgba(255, 255, 255, 0.08);
            box-shadow: 0 8px 24px rgba(0, 0, 0, 0.3);
          }

          .timeline-details {
            .timeline-meta {
              .meta-item {
                &.cost {
                  background: rgba(76, 175, 80, 0.15);
                }

                &.notes {
                  background: rgba(255, 152, 0, 0.15);
                }
              }
            }
          }
        }
      }
    }
  }
}
</style>
