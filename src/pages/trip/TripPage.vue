<template>
  <q-layout view="lHh Lpr lFf">
    <q-header elevated class="bg-white text-dark">
      <q-toolbar>
        <q-btn
          flat
          dense
          round
          icon="menu"
          aria-label="Menu"
          @click="toggleLeftDrawer"
        />

        <q-space />

        <q-btn
          flat
          dense
          round
          icon="notifications"
          aria-label="提醒事项"
          color="green-7"
          @click="openTodoDialog"
        >
          <q-badge
            v-if="todoItems.length"
            color="red"
            floating
          >
            {{ todoItems.length }}
          </q-badge>
        </q-btn>
      </q-toolbar>
    </q-header>

    <q-drawer
      v-model="leftDrawerOpen"
      show-if-above
      bordered
      :width="240"
      :breakpoint="700"
      behavior="mobile"
      overlay
      content-class="bg-white"
    >
      <div class="q-pa-sm">
        <div class="text-subtitle1 q-pa-sm q-mb-sm text-weight-medium text-primary">旅行导航</div>

        <q-separator class="q-mb-sm" />

        <q-list padding dense class="menu-list">
          <q-item clickable to="/work" v-ripple>
            <q-item-section avatar>
              <q-icon name="home" />
            </q-item-section>
            <q-item-section>主页</q-item-section>
          </q-item>

          <q-item clickable to="/trip/destinations" v-ripple>
            <q-item-section avatar>
              <q-icon name="place" />
            </q-item-section>
            <q-item-section>热门目的地</q-item-section>
          </q-item>

          <q-item clickable to="/trip/routes" v-ripple>
            <q-item-section avatar>
              <q-icon name="map" />
            </q-item-section>
            <q-item-section>推荐路线</q-item-section>
          </q-item>

          <q-item clickable to="/trip/types" v-ripple>
            <q-item-section avatar>
              <q-icon name="category" />
            </q-item-section>
            <q-item-section>旅行风格</q-item-section>
          </q-item>

          <q-item clickable to="/trip/blogs" v-ripple>
            <q-item-section avatar>
              <q-icon name="article" />
            </q-item-section>
            <q-item-section>旅行博客</q-item-section>
          </q-item>

          <!-- 添加测试入口 -->
          <q-item clickable to="/trip/test" v-ripple>
            <q-item-section avatar>
              <q-icon name="bug_report" />
            </q-item-section>
            <q-item-section>测试页面</q-item-section>
          </q-item>

          <q-separator class="q-my-sm" />

          <div class="text-subtitle2 q-pa-sm q-pb-xs text-weight-medium">我的旅行</div>

          <q-item clickable to="/trip/planner" v-ripple>
            <q-item-section avatar>
              <q-icon name="event_note" />
            </q-item-section>
            <q-item-section>行程规划</q-item-section>
          </q-item>

          <q-item clickable to="/trip/favorites" v-ripple>
            <q-item-section avatar>
              <q-icon name="favorite" />
            </q-item-section>
            <q-item-section>我的收藏</q-item-section>
          </q-item>

          <q-item clickable to="/trip/history" v-ripple>
            <q-item-section avatar>
              <q-icon name="history" />
            </q-item-section>
            <q-item-section>历史行程</q-item-section>
          </q-item>
        </q-list>
      </div>
    </q-drawer>

    <q-page-container>
      <q-page class="trip-page-content">
        <!-- 删除顶部导航区域，但保留正确的div结构 -->
        <div class="container">
          <!-- 新增基础信息卡片区 -->
          <div class="row q-col-gutter-md q-mb-md">
            <!-- 综合信息卡片 -->
            <div class="col-12 col-md-8">
              <q-card class="info-summary-card">
                <q-card-section>
                  <div class="text-h6 text-primary q-mb-md">旅行概览</div>

                  <div class="row q-col-gutter-md">
                    <!-- 计划总天数 -->
                    <div class="col-12 col-sm-4">
                      <div class="info-item">
                        <div class="row items-center no-wrap">
                          <q-icon name="event" size="2.2rem" color="blue-8" class="q-mr-sm" />
                          <div>
                            <div class="text-h5 text-weight-bold text-blue-9">{{ totalTripDays }}</div>
                            <div class="text-caption text-blue-8">计划总天数</div>
                          </div>
                        </div>
                      </div>
                    </div>

                    <!-- 天气信息 -->
                    <div class="col-12 col-sm-4">
                      <div class="info-item">
                        <div class="row items-center no-wrap">
                          <q-icon name="wb_sunny" size="2.2rem" color="orange-8" class="q-mr-sm" />
                          <div>
                            <div class="text-h5 text-weight-bold text-orange-9">{{ weather.temp }}°C</div>
                            <div class="text-caption text-orange-8">{{ weather.location }} {{ weather.condition }}</div>
                          </div>
                        </div>
                      </div>
                    </div>

                    <!-- 行李准备进度 -->
                    <div class="col-12 col-sm-4">
                      <div class="info-item">
                        <div class="row items-center no-wrap">
                          <q-icon name="luggage" size="2.2rem" color="green-8" class="q-mr-sm" />
                          <div>
                            <div class="text-h5 text-weight-bold text-green-9">{{ packingProgress }}%</div>
                            <div class="text-caption text-green-8">行李准备进度</div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </q-card-section>
              </q-card>
            </div>

            <!-- 待办事项信息卡 -->
            <div class="col-12 col-md-4">
              <q-card class="info-card bg-purple-1" @click="openTodoDialog">
                <q-card-section class="q-py-sm">
                  <div class="row items-center no-wrap">
                    <div class="col-auto">
                      <q-icon name="checklist" size="3rem" color="purple-8" class="q-mr-md" />
                    </div>
                    <div class="col">
                      <div class="text-h5 text-weight-bold text-purple-9">{{ todoItems.length }}</div>
                      <div class="text-subtitle2 text-purple-8">待办事项</div>
                    </div>
                  </div>
                </q-card-section>
              </q-card>
            </div>

            <!-- 天气信息卡 -->
            <div class="col-12 col-md-4">
              <q-card class="info-card bg-blue-1">
                <q-card-section class="q-py-sm">
                  <div class="row items-center no-wrap">
                    <div class="col-auto">
                      <q-icon name="cloud" size="3rem" color="blue-8" class="q-mr-md" />
                    </div>
                    <div class="col">
                      <div class="text-subtitle2 text-grey-7">桐庐未来的天气</div>
                    </div>
                  </div>
                </q-card-section>

                <!-- 天气预报滚动区域 -->
                <div class="weather-forecast-container q-px-md q-pb-sm">
                  <div class="weather-forecast-scroll">
                    <div
                      v-for="(day, index) in extendedForecast"
                      :key="index"
                      class="weather-day-item text-center"
                    >
                      <div class="text-caption text-weight-medium q-mb-xs text-grey-8">{{ day.name }}</div>
                      <q-icon :name="getWeatherIcon(day.condition)" size="1.8rem" :color="day.iconColor" class="q-mb-xs" />
                      <div class="row justify-center text-caption q-gutter-x-xs">
                        <span class="text-weight-bold">{{ day.high }}°</span>
                        <span class="text-grey-6">{{ day.low }}°</span>
                      </div>
                    </div>
                  </div>
                </div>
              </q-card>
            </div>
          </div>
        </div>

        <!-- 旅行状态标签页 -->
        <div class="trips-section q-pt-none">
          <div class="container">
            <q-card flat class="no-shadow">
              <q-tabs
                v-model="activeTab"
                dense
                class="text-grey"
                active-color="primary"
                indicator-color="primary"
                align="justify"
                narrow-indicator
              >
                <q-tab name="upcoming">
                  <q-item-section>
                    <span class="row items-center">
                      待出发
                      <q-badge color="primary" class="q-ml-sm">{{ upcomingTrips.length }}</q-badge>
                    </span>
                  </q-item-section>
                </q-tab>
                <q-tab name="ongoing">
                  <q-item-section>
                    <span class="row items-center">
                      进行中
                      <q-badge color="primary" class="q-ml-sm">{{ ongoingTrips.length }}</q-badge>
                    </span>
                  </q-item-section>
                </q-tab>
                <q-tab name="completed">
                  <q-item-section>
                    <span class="row items-center">
                      已完成
                      <q-badge color="primary" class="q-ml-sm">{{ completedTrips.length }}</q-badge>
                    </span>
                  </q-item-section>
                </q-tab>
              </q-tabs>

              <q-separator />

              <q-tab-panels v-model="activeTab">
                <!-- 待出发旅行面板 -->
                <q-tab-panel name="upcoming">
                  <div class="row q-col-gutter-md">
                    <div v-for="(trip, index) in upcomingTrips" :key="index" class="col-12 col-sm-6 col-md-4">
                      <q-card class="trip-card">
                        <q-img
                          :src="trip.image"
                          :ratio="16/9"
                          basic
                        >
                          <div class="absolute-bottom text-subtitle2 text-center bg-transparent">
                            <q-chip
                              color="orange"
                              text-color="white"
                              class="trip-chip"
                            >
                              {{ trip.daysLeft }} 天后出发
                            </q-chip>
                          </div>
                        </q-img>
                        <q-card-section>
                          <div class="text-h6">{{ trip.destination }}</div>
                          <div class="text-subtitle2 text-grey-7">{{ trip.date }}</div>
                          <q-linear-progress
                            :value="trip.preparationProgress"
                            color="primary"
                            class="q-mt-sm"
                          />
                          <div class="row justify-between items-center q-mt-xs">
                            <div class="text-caption text-grey-7">准备进度</div>
                            <div class="text-caption text-primary">{{ Math.round(trip.preparationProgress * 100) }}%</div>
                          </div>
                        </q-card-section>
                        <q-card-actions align="right">
                          <q-btn flat color="primary" label="查看详情" @click="viewTripDetail(trip)" />
                          <q-btn flat color="secondary" label="编辑行程" />
                        </q-card-actions>
                      </q-card>
                    </div>
                  </div>

                  <div class="text-center q-mt-lg" v-if="upcomingTrips.length === 0">
                    <q-icon name="flight_takeoff" size="4rem" color="grey-5" />
                    <p class="text-grey-7 q-mt-md">您目前没有待出发的旅行</p>
                    <q-btn color="primary" label="开始规划新旅程" class="q-mt-md" to="/trip/planner" />
                  </div>
                </q-tab-panel>

                <!-- 进行中旅行面板 -->
                <q-tab-panel name="ongoing">
                  <div class="row q-col-gutter-md">
                    <div v-for="(trip, index) in ongoingTrips" :key="index" class="col-12">
                      <q-card class="ongoing-trip-card">
                        <div class="row no-wrap">
                          <div class="col-12 col-sm-4">
                            <q-img
                              :src="trip.image"
                              :ratio="4/3"
                              class="full-height"
                              style="border-radius: 4px 0 0 4px"
                            />
                          </div>
                          <div class="col-12 col-sm-8 q-pa-md">
                            <div class="row items-center q-mb-sm">
                              <div class="text-h5">{{ trip.destination }}</div>
                              <q-space />
                              <q-chip
                                color="green"
                                text-color="white"
                                icon="today"
                                class="q-ml-sm"
                              >
                                第 {{ trip.currentDay }} 天 / 共 {{ trip.totalDays }} 天
                              </q-chip>
                            </div>
                            <div class="text-subtitle2 text-grey-7 q-mb-md">{{ trip.date }}</div>
                            <p class="q-mb-md">{{ trip.todayPlan }}</p>
                            <div class="row justify-between items-center">
                              <q-btn color="primary" label="今日行程" icon="event_note" />
                              <q-btn outline color="primary" label="添加照片" icon="add_a_photo" />
                              <q-btn outline color="secondary" label="记录笔记" icon="edit_note" />
                            </div>
                          </div>
                        </div>
                      </q-card>
                    </div>
                  </div>

                  <div class="text-center q-mt-lg" v-if="ongoingTrips.length === 0">
                    <q-icon name="card_travel" size="4rem" color="grey-5" />
                    <p class="text-grey-7 q-mt-md">您目前没有进行中的旅行</p>
                  </div>
                </q-tab-panel>

                <!-- 已完成旅行面板 -->
                <q-tab-panel name="completed">
                  <div class="row q-col-gutter-md">
                    <div v-for="(trip, index) in completedTrips" :key="index" class="col-12 col-sm-6 col-md-4">
                      <q-card class="completed-trip-card">
                        <q-img
                          :src="trip.image"
                          :ratio="16/9"
                        >
                          <div class="absolute-bottom text-h6 text-center bg-transparent">
                            <div class="bg-black-7 q-pa-sm rounded-borders">{{ trip.destination }}</div>
                          </div>
                        </q-img>
                        <q-card-section>
                          <div class="row items-center">
                            <div class="text-subtitle2">{{ trip.date }}</div>
                            <q-space />
                            <q-rating
                              v-model="trip.rating"
                              size="1.5em"
                              color="orange"
                              readonly
                            />
                          </div>
                          <p class="q-mt-sm text-grey-7 ellipsis-3-lines">{{ trip.summary }}</p>
                        </q-card-section>
                        <q-card-actions align="right">
                          <q-btn flat color="primary" label="查看回忆" icon="photo_library" />
                          <q-btn flat color="secondary" label="分享" icon="share" />
                        </q-card-actions>
                      </q-card>
                    </div>
                  </div>

                  <div class="text-center q-mt-lg" v-if="completedTrips.length === 0">
                    <q-icon name="flag" size="4rem" color="grey-5" />
                    <p class="text-grey-7 q-mt-md">您还没有完成的旅行记录</p>
                  </div>

                  <div class="text-center q-mt-xl" v-if="completedTrips.length > 0">
                    <q-btn outline color="primary" label="查看更多历史旅行" to="/trip/history" />
                  </div>
                </q-tab-panel>
              </q-tab-panels>
            </q-card>
          </div>
        </div>

      </q-page>
    </q-page-container>

    <!-- 添加提醒事项对话框 -->
    <q-dialog v-model="todoDialogOpen" position="bottom">
      <q-card style="width: 100%; max-width: 400px">
        <q-card-section class="row items-center q-pb-none">
          <div class="text-h6">提醒事项</div>
          <q-space />
          <q-btn icon="close" flat round dense v-close-popup />
        </q-card-section>

        <q-card-section class="q-pt-sm">
          <q-input
            v-model="newTodoText"
            dense
            placeholder="添加新的提醒事项"
            @keyup.enter="addTodo"
          >
            <template v-slot:append>
              <q-btn round dense flat icon="add" @click="addTodo" />
            </template>
          </q-input>
        </q-card-section>

        <q-card-section class="q-pa-none">
          <q-list separator>
            <q-item
              v-for="(todo, index) in todoItems"
              :key="todo.id"
              class="q-py-sm"
            >
              <q-item-section side>
                <q-checkbox
                  v-model="todo.done"
                  @update:model-value="() => updateTodoStatus(index)"
                />
              </q-item-section>

              <q-item-section>
                <q-item-label :class="{'text-strike': todo.done}">
                  <q-input
                    v-if="todo.editing"
                    v-model="todo.editText"
                    dense
                    autofocus
                    @blur="saveTodoEdit(index)"
                    @keyup.enter="saveTodoEdit(index)"
                  />
                  <span v-else @click="startEdit(index)">{{ todo.text }}</span>
                </q-item-label>
              </q-item-section>

              <q-item-section side>
                <q-btn
                  flat
                  round
                  dense
                  color="negative"
                  icon="delete"
                  @click="deleteTodoItem(index)"
                >
                  <q-tooltip>删除</q-tooltip>
                </q-btn>
              </q-item-section>
            </q-item>
          </q-list>
        </q-card-section>

        <q-card-section v-if="todoItems.length === 0" class="text-center q-pa-lg">
          <q-icon name="check_circle" size="3rem" color="grey-5" />
          <p class="text-grey-7 q-mt-sm">暂无提醒事项</p>
        </q-card-section>

        <q-card-actions align="right" class="q-pa-md">
          <q-btn
            flat
            color="primary"
            label="查看全部"
            to="/work"
            v-close-popup
          />
        </q-card-actions>
      </q-card>
    </q-dialog>
  </q-layout>
</template>

<script lang="ts">
// 导入桐庐图片
import tongLuImage from 'src/assets/destinations/tongLu.jpg'
// 导入todo API
import { getTodo } from 'src/api/todo/todo'
import { ref, onMounted, computed } from 'vue'

export default {
  name: 'TripPage',
  setup(props, { root }) {
    const todoItems = ref([])
    const todoApi = getTodo()
    const todoDialogOpen = ref(false)
    const newTodoText = ref('')

    // 获取待办事项列表
    const fetchTodoItems = async () => {
      try {
        const response = await todoApi.getTodoByCondition()
        if (response.data.isOk && response.data.okData) {
          const mappedItems = response.data.okData.map(item => ({
            id: item.id,
            text: item.title,
            done: item.completed,
            editing: false,
            editText: item.title
          })).slice(0, 5)
          todoItems.value = mappedItems
        }
      } catch (error) {
        console.error('获取待办事项失败:', error)
      }
    }

    // 添加新待办事项
    const addTodo = async () => {
      if (!newTodoText.value.trim()) return

      try {
        const todoEntity = {
          title: newTodoText.value.trim(),
          completed: false
        }

        await todoApi.saveTodo(todoEntity)
        await fetchTodoItems() // 重新获取列表
        newTodoText.value = '' // 清空输入框
      } catch (error) {
        console.error('添加待办事项失败:', error)
      }
    }

    // 开始编辑待办事项
    const startEdit = (index) => {
      todoItems.value[index].editing = true
      todoItems.value[index].editText = todoItems.value[index].text
    }

    // 保存编辑的待办事项
    const saveTodoEdit = async (index) => {
      const todo = todoItems.value[index]
      if (!todo.editText.trim() || todo.editText === todo.text) {
        todo.editing = false
        todo.editText = todo.text
        return
      }

      try {
        const todoEntity = {
          id: todo.id,
          title: todo.editText.trim(),
          completed: todo.done
        }

        await todoApi.updateTodo(todoEntity)
        todo.text = todo.editText
        todo.editing = false
      } catch (error) {
        console.error('更新待办事项失败:', error)
      }
    }

    // 删除待办事项
    const deleteTodoItem = async (index) => {
      try {
        const todo = todoItems.value[index]
        await todoApi.deleteTodo(todo.id)
        await fetchTodoItems()
      } catch (error) {
        console.error('删除待办事项失败:', error)
      }
    }

    // 打开待办事项对话框
    const openTodoDialog = async () => {
      todoDialogOpen.value = true
      await fetchTodoItems() // 确保等待数据加载完成
    }

    // 更新待办事项状态
    const updateTodoStatus = async (index) => {
      try {
        const todoItem = todoItems.value[index]

        // 确保待办项有ID
        if (!todoItem.id) {
          console.error('待办项缺少ID')
          return
        }

        if (todoItem.done) {
          // 如果标记为完成，调用完成API
          await todoApi.completeTodo(todoItem.id)
        } else {
          // 如果标记为未完成，调用更新API
          const todoEntity = {
            id: todoItem.id,
            title: todoItem.text,
            completed: false
          }
          await todoApi.updateTodo(todoEntity)
        }
      } catch (error) {
        console.error('更新待办状态失败:', error)
      }
    }

    // 天气信息 (模拟数据)
    const weather = ref({
      temp: 31,
      condition: '晴朗',
      location: '桐庐'
    })

    // 扩展的天气预报数据 (模拟数据)
    const extendedForecast = ref([
      { name: '今天', high: 31, low: 23, condition: '晴朗', iconColor: 'orange' },
      { name: '明天', high: 30, low: 22, condition: '晴朗', iconColor: 'orange' },
      { name: '周三', high: 27, low: 21, condition: '多云', iconColor: 'blue-7' },
      { name: '周四', high: 25, low: 20, condition: '多云', iconColor: 'blue-7' },
      { name: '周五', high: 25, low: 19, condition: '阴天', iconColor: 'grey-7' },
      { name: '周六', high: 24, low: 19, condition: '小雨', iconColor: 'blue-9' },
      { name: '周日', high: 23, low: 18, condition: '小雨', iconColor: 'blue-9' },
      { name: '下周一', high: 23, low: 17, condition: '阴天', iconColor: 'grey-7' },
      { name: '下周二', high: 22, low: 16, condition: '阴天', iconColor: 'grey-7' },
      { name: '下周三', high: 21, low: 15, condition: '多云', iconColor: 'blue-7' },
      { name: '下周四', high: 21, low: 14, condition: '晴朗', iconColor: 'orange' }
    ])

    // 固定值
    const packingProgress = ref(75)
    const totalTripDays = ref(28)

    onMounted(() => {
      fetchTodoItems()
    })

    return {
      todoItems,
      todoDialogOpen,
      newTodoText,
      openTodoDialog,
      addTodo,
      updateTodoStatus,
      startEdit,
      saveTodoEdit,
      deleteTodoItem,
      fetchTodoItems,
      weather,
      extendedForecast,
      packingProgress,
      totalTripDays
    }
  },
  data () {
    return {
      leftDrawerOpen: false,
      searchForm: {
        destination: '',
        dateRange: '',
        travelers: { label: '2 成人', value: 2 }
      },
      travelerOptions: [
        { label: '1 成人', value: 1 },
        { label: '2 成人', value: 2 },
        { label: '2 成人, 1 儿童', value: '2-1' },
        { label: '2 成人, 2 儿童', value: '2-2' },
        { label: '3 成人', value: 3 },
        { label: '4 成人', value: 4 }
      ],
      // 待出发的旅行
      upcomingTrips: [
        {
          id: 'tonglu-1',
          destination: '桐庐',
          date: '2023年12月15日 - 2023年12月22日',
          image: tongLuImage,
          daysLeft: 28,
          preparationProgress: 0.65
        },
        {
          id: 'chiangmai-1',
          destination: '泰国清迈',
          date: '2024年1月10日 - 2024年1月17日',
          image: tongLuImage,
          daysLeft: 54,
          preparationProgress: 0.3
        },
        {
          id: 'paris-1',
          destination: '法国巴黎',
          date: '2024年2月14日 - 2024年2月21日',
          image: tongLuImage,
          daysLeft: 89,
          preparationProgress: 0.15
        }
      ],
      // 进行中的旅行
      ongoingTrips: [
        {
          destination: '意大利罗马',
          date: '2023年11月10日 - 2023年11月20日',
          image: 'https://images.unsplash.com/photo-1529260830199-42c24126f198',
          currentDay: 3,
          totalDays: 10,
          todayPlan: '上午参观梵蒂冈博物馆，下午游览西班牙广场，晚餐在特拉斯提弗莱区的传统餐厅享用正宗意大利面。'
        }
      ],
      // 已完成的旅行
      completedTrips: [
        {
          destination: '新加坡',
          date: '2023年9月5日 - 2023年9月12日',
          image: 'https://images.unsplash.com/photo-1565967511849-76a60a516170',
          rating: 4,
          summary: '一次难忘的城市之旅，探索了新加坡的现代建筑和多元文化，品尝了当地美食，还去了环球影城玩了一天。'
        },
        {
          destination: '澳大利亚悉尼',
          date: '2023年7月15日 - 2023年7月25日',
          image: 'https://images.unsplash.com/photo-1506973035872-a4ec16b8e8d9',
          rating: 5,
          summary: '悉尼的海滩和歌剧院令人印象深刻，还去了蓝山国家公园徒步，看到了野生袋鼠和考拉。'
        },
        {
          destination: '西班牙巴塞罗那',
          date: '2023年5月20日 - 2023年5月30日',
          image: 'https://images.unsplash.com/photo-1539037116277-4db20889f2d4',
          rating: 5,
          summary: '高迪的建筑作品令人惊叹，海鲜饭和塔帕斯美味无比，度过了愉快的十天假期。'
        }
      ],
      slide: 1,
      email: '',
      activeTab: 'upcoming'
    }
  },
  methods: {
    toggleLeftDrawer() {
      this.leftDrawerOpen = !this.leftDrawerOpen
    },
    onSearch() {
      // 实现搜索功能
      console.log('搜索表单提交:', this.searchForm)
      // 这里添加实际的搜索逻辑
    },
    onSubscribe() {
      // 实现订阅功能
      console.log('订阅邮箱:', this.email)
      // 这里添加实际的订阅逻辑
      this.$q.notify({
        color: 'positive',
        textColor: 'white',
        icon: 'check_circle',
        message: '订阅成功！感谢您的关注'
      })
      this.email = ''
    },
    viewTripDetail(trip) {
      // 跳转到行程详情页，并传递行程ID
      this.$router.push(`/trip/detail/${trip.id || '1'}`);
    },
    getWeatherIcon(condition) {
      // 根据天气状况返回对应的图标
      const iconMap = {
        '晴朗': 'wb_sunny',
        '多云': 'cloud',
        '阴天': 'cloud',
        '小雨': 'grain',
        '大雨': 'thunderstorm',
        '雷雨': 'flash_on',
        '雪': 'ac_unit'
      }

      return iconMap[condition] || 'wb_sunny'
    }
  }
}
</script>

<style scoped>
.container {
  max-width: 1200px;
  margin: 0 auto;
}

.hero-banner {
  background: linear-gradient(90deg, rgba(32, 55, 90, 0.9), rgba(32, 55, 90, 0.7)),
              url('https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1');
  background-size: cover;
  background-position: center;
  background-repeat: no-repeat;
  min-height: 280px; /* 减小高度 */
  display: flex;
  align-items: center;
  position: relative;
  overflow: hidden;
  margin-bottom: 0;
}

.hero-image {
  box-shadow: 0 8px 16px rgba(0, 0, 0, 0.2);
  transform: translateY(-5px);
  transition: transform 0.3s ease, box-shadow 0.3s ease;
  display: none; /* 在移动视图中隐藏 */
}

.hero-image-overlay {
  background: radial-gradient(circle at center, rgba(0,0,0,0.1) 0%, rgba(0,0,0,0.4) 100%);
}

@media (min-width: 1024px) {
  .hero-image {
    display: block; /* 在桌面视图中显示 */
  }
}

.hero-title {
  font-weight: 700;
  text-shadow: 1px 1px 3px rgba(0,0,0,0.5);
  animation: fadeInLeft 0.8s ease-out;
}

.hero-subtitle {
  max-width: 600px;
  text-shadow: 1px 1px 2px rgba(0,0,0,0.5);
  animation: fadeInLeft 0.8s ease-out 0.2s both;
}

.hero-btn {
  box-shadow: 0 4px 8px rgba(0,0,0,0.15);
  transition: transform 0.3s, box-shadow 0.3s;
  animation: fadeInLeft 0.8s ease-out 0.4s both;
}

.hero-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 12px rgba(0,0,0,0.2);
}

@keyframes fadeInLeft {
  from {
    opacity: 0;
    transform: translateX(-20px);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
}

.trip-card,
.ongoing-trip-card,
.completed-trip-card {
  transition: transform 0.3s, box-shadow 0.3s;
}

.trip-card:hover,
.ongoing-trip-card:hover,
.completed-trip-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 8px 16px rgba(0, 0, 0, 0.1);
}

.trip-chip {
  opacity: 0.95;
}

.bg-black-7 {
  background-color: rgba(0, 0, 0, 0.7);
}

.ellipsis-3-lines {
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

@media (max-width: 599px) {
  .hero-banner {
    min-height: 350px;
    text-align: center;
  }

  .hero-title {
    font-size: 2rem;
  }
}

.trips-section {
  background: white;
  padding-top: 1rem;
  padding-bottom: 2rem;
}

/* 简化菜单样式 */
.menu-list :deep(.q-item) {
  border-radius: 4px;
  padding: 8px 8px;
  margin-bottom: 2px;
}

.menu-list :deep(.q-item):hover {
  background: rgba(0, 0, 0, 0.03);
}

.menu-list :deep(.q-item.q-router-link-active) {
  background: rgba(25, 118, 210, 0.1);
  color: var(--q-primary);
  font-weight: 500;
}

/* 优化抽屉过渡 */
.q-drawer {
  will-change: transform;
}

.q-dialog__inner > div {
  border-radius: 12px 12px 0 0;
}

.q-item {
  min-height: 48px;
}

.q-checkbox {
  margin-right: 8px;
}

.info-card {
  transition: all 0.3s ease;
  border-radius: 8px;
  cursor: pointer;
}

.info-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.08);
}

.info-summary-card {
  position: relative;
  transition: all 0.3s ease;
  border-radius: 8px;
  overflow: visible;
  box-shadow: 0 3px 10px rgba(0, 0, 0, 0.1);
}

.info-summary-card:hover {
  box-shadow: 0 6px 15px rgba(0, 0, 0, 0.12);
}

.info-item {
  padding: 8px 16px;
  border-radius: 8px;
  transition: all 0.3s ease;
}

.info-item:hover {
  background-color: rgba(0, 0, 0, 0.03);
  transform: translateY(-2px);
}

.weather-forecast {
  padding-top: 8px;
  border-top: 1px solid rgba(0, 0, 0, 0.08);
}

.weather-day-card {
  padding: 6px 4px;
  border-radius: 6px;
  transition: all 0.2s ease;
}

.weather-day-card:hover {
  background-color: rgba(0, 0, 0, 0.04);
  transform: scale(1.05);
}

.weather-card {
  border-radius: 12px;
  background-color: #f5f7fa;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08);
  overflow: hidden;
}

.current-weather {
  margin-top: 8px;
  margin-bottom: 16px;
}

.weather-forecast-container {
  border-top: 1px solid rgba(0, 0, 0, 0.06);
  padding-top: 8px;
}

.weather-forecast-scroll {
  display: flex;
  overflow-x: auto;
  scrollbar-width: none; /* Firefox */
  -ms-overflow-style: none; /* IE and Edge */
  padding-bottom: 4px;
  margin-bottom: -4px; /* 抵消padding，防止出现空白区域 */
}

.weather-forecast-scroll::-webkit-scrollbar {
  display: none; /* Chrome, Safari, Opera */
}

.weather-day-item {
  flex: 0 0 auto;
  padding: 12px 8px;
  min-width: 60px;
  border-radius: 8px;
  margin-right: 10px;
  transition: all 0.2s ease;
}

.weather-day-item:hover {
  background-color: rgba(0, 0, 0, 0.04);
}
</style>
