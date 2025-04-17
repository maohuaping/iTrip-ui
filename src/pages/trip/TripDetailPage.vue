<template>
  <q-layout view="lHh Lpr lFf">
    <q-header elevated class="bg-white text-dark">
      <q-toolbar>
        <q-btn
          flat
          dense
          round
          icon="arrow_back"
          aria-label="返回"
          @click="$router.back()"
        />

        <q-toolbar-title class="row items-center justify-start">
          <div class="text-h6 text-primary">行程详情</div>
        </q-toolbar-title>

        <q-btn
          flat
          dense
          icon="edit"
          no-caps
          label="编辑"
          class="q-mr-sm"
          aria-label="编辑行程"
          @click="editTrip"
          color="primary"
        >
          <q-tooltip>编辑行程</q-tooltip>
        </q-btn>
        
        <q-btn
          flat
          dense
          icon="share"
          no-caps
          :label="$q.screen.gt.xs ? '分享' : ''"
          class="q-ml-sm"
          aria-label="分享行程"
          @click="shareTrip"
          color="primary"
        >
          <q-tooltip>分享行程</q-tooltip>
        </q-btn>
      </q-toolbar>
    </q-header>

    <q-page-container>
      <q-page class="trip-detail-page">
        <!-- 顶部封面 -->
        <div class="trip-header relative-position">
          <q-img
            :src="trip.coverImage"
            :ratio="16/9"
            style="max-height: 400px"
          >
            <div class="absolute-bottom text-white">
              <div class="container q-pa-md bg-black-6">
                <div class="text-h4">{{ trip.destination }}</div>
                <div class="text-subtitle1 q-mt-sm">{{ trip.date }}</div>
                <div class="row items-center q-mt-md">
                  <q-chip
                    v-if="trip.status === 'upcoming'"
                    color="orange"
                    text-color="white"
                    icon="flight_takeoff"
                  >
                    {{ trip.daysLeft }} 天后出发
                  </q-chip>
                  <q-chip
                    v-if="trip.status === 'ongoing'"
                    color="green"
                    text-color="white"
                    icon="directions_car"
                  >
                    进行中 (第 {{ trip.currentDay }} 天)
                  </q-chip>
                  <q-chip
                    v-if="trip.status === 'completed'"
                    color="blue-grey"
                    text-color="white"
                    icon="flag"
                  >
                    已完成
                  </q-chip>
                  <q-space />
                  <q-rating
                    v-if="trip.status === 'completed'"
                    v-model="trip.rating"
                    size="1.5em"
                    color="orange"
                    icon="star"
                  />
                </div>
              </div>
            </div>
          </q-img>
        </div>

        <!-- 行程信息 -->
        <div class="trip-content q-pa-md">
          <div class="container">
            <div class="row q-col-gutter-lg">
              <!-- 左侧主要内容 -->
              <div class="col-12 col-md-8">
                <!-- 行程概览 -->
                <q-card flat bordered class="q-mb-md">
                  <q-card-section>
                    <div class="text-h6">行程概览</div>
                    <q-separator class="q-my-sm" />
                    <p>{{ trip.description }}</p>
                    
                    <div class="row q-col-gutter-md q-mt-md">
                      <div class="col-6 col-sm-3">
                        <div class="text-center">
                          <q-icon name="event" size="2rem" color="primary" />
                          <div class="text-caption q-mt-sm">总天数</div>
                          <div class="text-subtitle1 text-weight-bold">{{ trip.totalDays }} 天</div>
                        </div>
                      </div>
                      <div class="col-6 col-sm-3">
                        <div class="text-center">
                          <q-icon name="people" size="2rem" color="primary" />
                          <div class="text-caption q-mt-sm">旅行人数</div>
                          <div class="text-subtitle1 text-weight-bold">{{ trip.travelers }} 人</div>
                        </div>
                      </div>
                      <div class="col-6 col-sm-3">
                        <div class="text-center">
                          <q-icon name="place" size="2rem" color="primary" />
                          <div class="text-caption q-mt-sm">景点数量</div>
                          <div class="text-subtitle1 text-weight-bold">{{ trip.attractions.length }} 个</div>
                        </div>
                      </div>
                      <div class="col-6 col-sm-3">
                        <div class="text-center">
                          <q-icon name="hotel" size="2rem" color="primary" />
                          <div class="text-caption q-mt-sm">住宿天数</div>
                          <div class="text-subtitle1 text-weight-bold">{{ trip.accommodationDays }} 晚</div>
                        </div>
                      </div>
                    </div>
                  </q-card-section>
                </q-card>

                <!-- 日程安排 -->
                <q-card flat bordered class="q-mb-md">
                  <q-card-section>
                    <div class="text-h6">日程安排</div>
                    <q-separator class="q-my-sm" />
                    
                    <q-timeline color="primary">
                      <q-timeline-entry
                        v-for="(day, index) in trip.itinerary"
                        :key="index"
                        :title="`第 ${index + 1} 天 · ${day.date}`"
                        :subtitle="day.title"
                        :icon="index + 1 === trip.currentDay ? 'location_on' : ''"
                        :color="index + 1 === trip.currentDay ? 'green' : 'primary'"
                      >
                        <div>
                          <div v-for="(activity, i) in day.activities" :key="i" class="q-mb-sm">
                            <div class="row items-start">
                              <div class="col-auto time-column">
                                <div class="text-subtitle2 text-weight-medium">{{ activity.time }}</div>
                              </div>
                              <q-separator vertical inset class="q-mx-md" />
                              <div class="col activity-content">
                                <div class="text-subtitle2 text-weight-medium">{{ activity.title }}</div>
                                <div class="text-caption text-grey-8">{{ activity.location }}</div>
                                <div class="q-mt-xs">{{ activity.description }}</div>
                                <div class="row q-mt-sm" v-if="activity.photos && activity.photos.length">
                                  <q-img
                                    v-for="(photo, photoIndex) in activity.photos"
                                    :key="photoIndex"
                                    :src="photo"
                                    class="activity-photo q-mr-sm"
                                    width="80px"
                                    height="80px"
                                  />
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </q-timeline-entry>
                    </q-timeline>
                  </q-card-section>
                </q-card>

                <!-- 旅行笔记和照片 -->
                <q-card v-if="trip.notes && trip.notes.length" flat bordered class="q-mb-md">
                  <q-card-section>
                    <div class="text-h6">旅行笔记</div>
                    <q-separator class="q-my-sm" />
                    
                    <div v-for="(note, index) in trip.notes" :key="index" class="q-mb-lg">
                      <div class="row items-center q-mb-sm">
                        <div class="text-subtitle1 text-weight-medium">{{ note.title }}</div>
                        <q-space />
                        <div class="text-caption text-grey">{{ note.date }}</div>
                      </div>
                      <p>{{ note.content }}</p>
                      
                      <div class="row q-col-gutter-sm q-mt-md" v-if="note.photos && note.photos.length">
                        <div v-for="(photo, photoIndex) in note.photos" :key="photoIndex" class="col-4 col-sm-3">
                          <q-img
                            :src="photo"
                            :ratio="1"
                            class="rounded-borders cursor-pointer"
                            @click="openPhotoGallery(note.photos, photoIndex)"
                          />
                        </div>
                      </div>
                    </div>
                  </q-card-section>
                </q-card>
              </div>

              <!-- 右侧侧边栏 -->
              <div class="col-12 col-md-4">
                <!-- 预算信息 -->
                <q-card flat bordered class="q-mb-md">
                  <q-card-section>
                    <div class="text-h6">预算信息</div>
                    <q-separator class="q-my-sm" />
                    
                    <div class="row justify-between items-center q-mt-md">
                      <div class="text-subtitle2">总预算</div>
                      <div class="text-subtitle1 text-weight-bold">¥{{ trip.budget.total.toLocaleString() }}</div>
                    </div>
                    
                    <q-list dense>
                      <q-item v-for="(item, index) in trip.budget.breakdown" :key="index">
                        <q-item-section>
                          <q-item-label>{{ item.category }}</q-item-label>
                        </q-item-section>
                        <q-item-section side>
                          <q-item-label>¥{{ item.amount.toLocaleString() }}</q-item-label>
                        </q-item-section>
                      </q-item>
                    </q-list>
                    
                    <q-linear-progress
                      :value="trip.budget.used / trip.budget.total"
                      color="primary"
                      class="q-mt-lg"
                    />
                    <div class="row justify-between items-center q-mt-xs">
                      <div class="text-caption text-grey-7">已使用</div>
                      <div class="text-caption text-primary">
                        ¥{{ trip.budget.used.toLocaleString() }} / ¥{{ trip.budget.total.toLocaleString() }}
                      </div>
                    </div>
                  </q-card-section>
                </q-card>
                
                <!-- 行程地图 -->
                <q-card flat bordered class="q-mb-md">
                  <q-card-section>
                    <div class="text-h6">行程地图</div>
                    <q-separator class="q-my-sm" />
                    
                    <div class="map-container">
                      <q-img
                        src="https://maps.googleapis.com/maps/api/staticmap?center=Tokyo,Japan&zoom=10&size=400x300&markers=color:red|Tokyo,Japan&key=YOUR_API_KEY"
                        class="full-width"
                        style="height: 250px"
                      >
                        <div class="absolute-bottom text-subtitle2 text-center bg-black-6 text-white">
                          点击查看详细地图
                        </div>
                      </q-img>
                    </div>
                  </q-card-section>
                </q-card>
                
                <!-- 景点列表 -->
                <q-card flat bordered class="q-mb-md">
                  <q-card-section>
                    <div class="row items-center justify-between">
                      <div class="text-h6">景点列表</div>
                      <q-btn flat round icon="open_in_new" size="sm" color="primary">
                        <q-tooltip>查看全部</q-tooltip>
                      </q-btn>
                    </div>
                    <q-separator class="q-my-sm" />
                    
                    <q-list>
                      <q-item v-for="(attraction, index) in trip.attractions" :key="index" clickable v-ripple>
                        <q-item-section avatar>
                          <q-avatar>
                            <q-img :src="attraction.image" />
                          </q-avatar>
                        </q-item-section>
                        <q-item-section>
                          <q-item-label>{{ attraction.name }}</q-item-label>
                          <q-item-label caption>{{ attraction.location }}</q-item-label>
                        </q-item-section>
                        <q-item-section side>
                          <q-rating
                            v-model="attraction.rating"
                            size="1em"
                            color="orange"
                            icon="star"
                            readonly
                          />
                        </q-item-section>
                      </q-item>
                    </q-list>
                  </q-card-section>
                </q-card>
                
                <!-- 待办事项 -->
                <q-card v-if="trip.status === 'upcoming'" flat bordered class="q-mb-md">
                  <q-card-section>
                    <div class="text-h6">待办事项</div>
                    <q-separator class="q-my-sm" />
                    
                    <q-list dense>
                      <q-item v-for="(task, index) in trip.todoList" :key="index">
                        <q-item-section avatar>
                          <q-checkbox v-model="task.completed" color="primary" />
                        </q-item-section>
                        <q-item-section>
                          <q-item-label :class="{ 'text-strike': task.completed }">
                            {{ task.title }}
                          </q-item-label>
                          <q-item-label caption v-if="task.dueDate">
                            截止日期: {{ task.dueDate }}
                          </q-item-label>
                        </q-item-section>
                        <q-item-section side v-if="task.priority === 'high'">
                          <q-icon name="priority_high" color="negative" />
                        </q-item-section>
                      </q-item>
                    </q-list>
                    
                    <div class="text-center q-mt-md">
                      <q-btn flat color="primary" label="添加待办事项" icon="add" />
                    </div>
                  </q-card-section>
                </q-card>
              </div>
            </div>
          </div>
        </div>

        <!-- 底部操作工具栏 -->
        <q-page-sticky position="bottom-right" :offset="[18, 18]">
          <q-fab
            color="primary"
            icon="more_vert"
            direction="up"
            vertical-actions-align="right"
          >
            <q-fab-action color="green" icon="add_a_photo" label="添加照片" @click="addPhotos" />
            <q-fab-action color="orange" icon="edit_note" label="添加笔记" @click="addNote" />
            <q-fab-action color="blue" icon="print" label="打印行程" @click="printItinerary" />
            <q-fab-action color="red" icon="delete" label="删除行程" @click="confirmDelete" />
          </q-fab>
        </q-page-sticky>
      </q-page>
    </q-page-container>

    <!-- 图片画廊对话框 -->
    <q-dialog v-model="photoGalleryOpen" full-width>
      <q-card class="full-width">
        <q-card-section class="row items-center">
          <div class="text-h6">旅行照片</div>
          <q-space />
          <q-btn icon="close" flat round dense v-close-popup />
        </q-card-section>
        
        <q-card-section>
          <q-carousel
            v-model="currentPhotoIndex"
            :fullscreen.sync="fullscreenGallery"
            arrows
            navigation
            infinite
            height="70vh"
          >
            <q-carousel-slide
              v-for="(photo, index) in galleryPhotos"
              :key="index"
              :name="index"
              class="column flex-center"
            >
              <q-img
                :src="photo"
                fit="contain"
                style="max-height: 100%; max-width: 100%"
              />
            </q-carousel-slide>
          </q-carousel>
        </q-card-section>
      </q-card>
    </q-dialog>

    <!-- 删除确认对话框 -->
    <q-dialog v-model="deleteConfirmOpen" persistent>
      <q-card>
        <q-card-section class="row items-center">
          <q-avatar icon="warning" color="negative" text-color="white" />
          <span class="q-ml-sm text-h6">确认删除</span>
        </q-card-section>

        <q-card-section>
          您确定要删除这个行程吗？此操作无法撤销。
        </q-card-section>

        <q-card-actions align="right">
          <q-btn flat label="取消" color="primary" v-close-popup />
          <q-btn flat label="删除" color="negative" @click="deleteTrip" v-close-popup />
        </q-card-actions>
      </q-card>
    </q-dialog>

    <!-- 行程详情侧边抽屉 (移动设备) -->
    <q-dialog v-model="showItinerary" position="right" maximized>
      <q-card>
        <q-card-section>
          <div class="row items-center q-mb-lg">
            <div class="text-h6">行程安排</div>
            <q-space />
            <q-btn icon="close" flat round dense v-close-popup />
          </div>
          
          <q-timeline color="primary">
            <q-timeline-entry
              v-for="(day, index) in trip.itinerary"
              :key="index"
              :title="`第 ${index + 1} 天 · ${day.date}`"
              :subtitle="day.title"
              :icon="index + 1 === trip.currentDay ? 'location_on' : ''"
              :color="index + 1 === trip.currentDay ? 'green' : 'primary'"
            >
              <div>
                <div v-for="(activity, i) in day.activities" :key="i" class="q-mb-sm">
                  <div class="row items-start">
                    <div class="col-auto time-column">
                      <div class="text-subtitle2 text-weight-medium">{{ activity.time }}</div>
                    </div>
                    <q-separator vertical inset class="q-mx-md" />
                    <div class="col activity-content">
                      <div class="text-subtitle2 text-weight-medium">{{ activity.title }}</div>
                      <div class="text-caption text-grey-8">{{ activity.location }}</div>
                      <div class="q-mt-xs">{{ activity.description }}</div>
                    </div>
                  </div>
                </div>
              </div>
            </q-timeline-entry>
          </q-timeline>
        </q-card-section>
      </q-card>
    </q-dialog>

    <!-- 文档查看器对话框 -->
    <q-dialog v-model="documentViewOpen">
      <q-card style="width: 700px; max-width: 90vw;">
        <q-card-section class="row items-center">
          <div class="text-h6">{{ selectedDocument?.name }}</div>
          <q-space />
          <q-btn icon="close" flat round dense v-close-popup />
        </q-card-section>
        
        <q-separator />
        
        <q-card-section class="q-pa-none">
          <q-img
            v-if="selectedDocument?.type === 'image'"
            :src="'https://picsum.photos/800/1000'"
            style="height: 70vh"
            fit="contain"
          />
          <div v-else class="flex justify-center items-center" style="height: 70vh">
            <div class="text-center">
              <q-icon name="description" size="8rem" color="grey-4" />
              <div class="text-body1 q-mt-md">该文档预览功能尚未实现</div>
              <q-btn color="primary" outline class="q-mt-md" icon="download" label="下载文档" />
            </div>
          </div>
        </q-card-section>
      </q-card>
    </q-dialog>
  </q-layout>
</template>

<script>
export default {
  name: 'TripDetailPage',
  props: {
    id: {
      type: String,
      required: true
    }
  },
  data() {
    return {
      // 图片画廊相关
      photoGalleryOpen: false,
      fullscreenGallery: false,
      currentPhotoIndex: 0,
      galleryPhotos: [],
      
      // 删除确认
      deleteConfirmOpen: false,
      
      // 对话框控制
      showItinerary: false,
      documentViewOpen: false,
      selectedDocument: null,
      
      // 富文本编辑器
      editor: null,
      editorContent: '',
      
      // 旅行数据 - 更新为桐庐两日游数据
      trip: {
        id: this.id || '1', // 使用ID属性，如果没有则使用默认值
        destination: '桐庐',
        date: `${new Date().toLocaleDateString('zh-CN')} - ${new Date(Date.now() + 86400000).toLocaleDateString('zh-CN')}`,
        status: 'upcoming', // upcoming, ongoing, completed
        coverImage: 'https://images.unsplash.com/photo-1512453979798-5ea266f8880c',
        daysLeft: 0, // 今天出发
        currentDay: 0,
        totalDays: 2,
        accommodationDays: 1,
        travelers: 2,
        description: '这是一次桐庐两日游，我们将游览大奇山国家森林公园、马岭古道和江南龙门湾等景点。行程包括在大奇山国家森林公园观赏水帘飞瀑和竹林，在马岭古道徒步体验，以及在江南龙门湾体验各种水上活动。',
        rating: 0, // 仅完成状态可评分
        
        // 预算信息
        budget: {
          total: 1000,
          used: 0,
          breakdown: [
            { category: '交通', amount: 300 },
            { category: '住宿', amount: 200 },
            { category: '餐饮', amount: 300 },
            { category: '门票', amount: 200 },
          ]
        },
        
        // 景点列表
        attractions: [
          { name: '大奇山国家森林公园', location: '桐庐', image: 'https://images.unsplash.com/photo-1441974231531-c6227db76b6e', rating: 4.5 },
          { name: '马岭古道', location: '桐庐', image: 'https://images.unsplash.com/photo-1448375240586-882707db888b', rating: 4.3 },
          { name: '江南龙门湾', location: '桐庐', image: 'https://images.unsplash.com/photo-1501785888041-af3ef285b470', rating: 4.6 }
        ],
        
        // 待办事项
        todoList: [
          { title: '购买大奇山门票', completed: false, priority: 'high', dueDate: new Date().toLocaleDateString('zh-CN') },
          { title: '预订汉庭酒店', completed: false, priority: 'high', dueDate: new Date().toLocaleDateString('zh-CN') },
          { title: '购买汽车票', completed: true, priority: 'high', dueDate: new Date().toLocaleDateString('zh-CN') },
          { title: '准备徒步装备', completed: false, priority: 'medium', dueDate: new Date().toLocaleDateString('zh-CN') },
          { title: '检查天气预报', completed: false, priority: 'medium', dueDate: new Date().toLocaleDateString('zh-CN') }
        ],
        
        // 日程安排
        itinerary: [
          {
            date: new Date().toLocaleDateString('zh-CN'),
            title: 'Day1 - 大奇山国家森林公园与马岭古道',
            activities: [
              {
                time: '09:16',
                title: '从上海虹桥出发',
                location: '上海虹桥',
                description: '乘坐汽车前往桐庐，票价122元/人'
              },
              {
                time: '11:06',
                title: '抵达桐庐',
                location: '桐庐站',
                description: '到达桐庐汽车站'
              },
              {
                time: '11:30',
                title: '前往一味大院',
                location: '一味大院',
                description: '打车前往一味大院就餐，距离5.5km'
              },
              {
                time: '12:30',
                title: '前往酒店放行李',
                location: '汉庭酒店(杭州桐庐富春江一桥店)',
                description: '前往酒店放行李，距离2.4km'
              },
              {
                time: '13:30',
                title: '游览大奇山国家森林公园',
                location: '大奇山国家森林公园',
                description: '打卡点：水帘飞瀑有锦鲤果冻湖瀑布、竹林。门票46元/人，下山的丛林飞鼠项目60元/人（可选）。景区门口有智能柜可以存放行李，行李箱8元一小时，20元封顶。',
                photos: [
                  'https://images.unsplash.com/photo-1441974231531-c6227db76b6e',
                  'https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05'
                ]
              },
              {
                time: '17:30',
                title: '前往瑶琳路小吃街',
                location: '瑶琳路小吃街',
                description: '打车前往瑶琳路小吃街就餐，距离4.6km'
              },
              {
                time: '19:00',
                title: '返回酒店',
                location: '汉庭酒店(杭州桐庐富春江一桥店)',
                description: '返回酒店休息'
              }
            ]
          },
          {
            date: new Date(Date.now() + 86400000).toLocaleDateString('zh-CN'),
            title: 'Day2 - 江南龙门湾',
            activities: [
              {
                time: '08:00',
                title: '早餐',
                location: '酒店',
                description: '在酒店享用早餐'
              },
              {
                time: '09:00',
                title: '前往石舍村',
                location: '石舍村',
                description: '前往马岭古道起点石舍村，顺风车约26元'
              },
              {
                time: '09:30',
                title: '徒步马岭古道',
                location: '马岭古道',
                description: '全程11km，可以分三段进行，石舍村→郢坪村→芦苇村。石舍村观景台很出片，郢坪村非常古朴，芦苇村商业氛围。需要做好防晒，带足食物和水。',
                photos: [
                  'https://images.unsplash.com/photo-1448375240586-882707db888b'
                ]
              },
              {
                time: '13:00',
                title: '前往江南龙门湾',
                location: '江南龙门湾',
                description: '从芦苇村到江南龙门湾，距离3.1km'
              },
              {
                time: '14:00',
                title: '游览江南龙门湾',
                location: '江南龙门湾',
                description: '抖音团购票船72元/人，比现场买便宜8块钱，4选2联票115元/人。快艇120元/人，竹筏60元/人，游船80元/人，电动船80元/人，卡丁船60元/人。畅游小三峡选择快艇或游船，因为游船和竹筏路线不同。',
                photos: [
                  'https://images.unsplash.com/photo-1501785888041-af3ef285b470'
                ]
              },
              {
                time: '16:30',
                title: '前往桐庐站',
                location: '桐庐站',
                description: '前往火车站准备返程，距离16km'
              },
              {
                time: '18:00',
                title: '返回上海',
                location: '上海虹桥',
                description: '乘坐汽车返回上海'
              }
            ]
          }
        ],
        
        // 旅行笔记
        notes: [],
        
        // 当旅行完成后可以添加总结
        summary: {
          highlights: [],
          recommendations: [],
          tips: []
        },
        
        // 旅行伙伴信息
        companions: [
          { name: '旅伴1', email: 'companion1@example.com', phone: '138****1234' },
          { name: '旅伴2', email: 'companion2@example.com', phone: '139****5678' }
        ],
        
        // 紧急联系人信息
        emergencyContacts: [
          { name: '紧急联系人', relationship: '家人', phone: '135****4321' }
        ],
        
        // 文件和文档
        documents: [
          { name: '桐庐行程.pdf', type: 'pdf', size: '1.2MB' },
          { name: '酒店预订确认.pdf', type: 'pdf', size: '0.8MB' },
          { name: '大奇山国家森林公园门票.pdf', type: 'pdf', size: '0.5MB' },
          { name: '马岭古道地图.jpg', type: 'image', size: '2.3MB' }
        ]
      }
    }
  },
  computed: {
    // 根据状态显示不同的行动按钮
    primaryAction() {
      switch(this.trip.status) {
        case 'upcoming':
          return { label: '编辑行程', icon: 'edit', action: this.editTrip };
        case 'ongoing':
          return { label: '添加今日照片', icon: 'add_a_photo', action: this.addPhotos };
        case 'completed':
          return { label: '查看照片集', icon: 'photo_library', action: this.viewPhotoAlbum };
        default:
          return { label: '编辑行程', icon: 'edit', action: this.editTrip };
      }
    },
    
    // 行程进度
    tripProgress() {
      if(this.trip.status === 'completed') return 1;
      if(this.trip.status === 'upcoming') return 0;
      // 如果是进行中，根据当前天数计算进度
      return this.trip.currentDay / this.trip.totalDays;
    },
    
    // 格式化日期显示
    formattedDates() {
      // 这里可以添加日期格式化逻辑
      return this.trip.date;
    }
  },
  methods: {
    editTrip() {
      // 实现编辑行程功能
      this.$router.push(`/trip/edit/${this.trip.id}`);
    },
    shareTrip() {
      // 实现分享行程功能
      this.$q.notify({
        color: 'positive',
        message: '分享链接已复制到剪贴板',
        icon: 'share'
      });
    },
    addPhotos() {
      // 实现添加照片功能
      this.$q.notify({
        color: 'green',
        message: '照片上传功能尚未实现',
        icon: 'add_a_photo'
      });
    },
    addNote() {
      // 实现添加笔记功能
      this.$q.notify({
        color: 'orange',
        message: '笔记添加功能尚未实现',
        icon: 'edit_note'
      });
    },
    printItinerary() {
      // 实现打印行程功能
      window.print();
    },
    confirmDelete() {
      this.deleteConfirmOpen = true;
    },
    deleteTrip() {
      // 实现删除行程功能
      this.$q.notify({
        color: 'negative',
        message: '行程已删除',
        icon: 'delete'
      });
      this.$router.push('/trip');
    },
    openPhotoGallery(photos, index) {
      this.galleryPhotos = photos;
      this.currentPhotoIndex = index;
      this.photoGalleryOpen = true;
    },
    viewPhotoAlbum() {
      // 实现查看照片集功能
      this.$router.push(`/trip/albums/${this.trip.id}`);
    },
    toggleFavorite() {
      // 实现收藏功能
      this.trip.isFavorite = !this.trip.isFavorite;
      this.$q.notify({
        color: this.trip.isFavorite ? 'positive' : 'grey-7',
        message: this.trip.isFavorite ? '已添加到收藏' : '已从收藏中移除',
        icon: this.trip.isFavorite ? 'favorite' : 'favorite_border'
      });
    },
    exportTrip(format) {
      // 实现导出行程功能
      this.$q.notify({
        color: 'primary',
        message: `行程已导出为${format}格式`,
        icon: 'download'
      });
    },
    markAsCompleted() {
      // 将行程标记为已完成
      this.trip.status = 'completed';
      this.$q.notify({
        color: 'positive',
        message: '行程已标记为已完成',
        icon: 'check_circle'
      });
    },
    startTrip() {
      // 开始行程
      this.trip.status = 'ongoing';
      this.trip.currentDay = 1;
      this.$q.notify({
        color: 'green',
        message: '行程已开始，祝您旅途愉快！',
        icon: 'flight_takeoff'
      });
    },
    duplicateTrip() {
      // 复制行程
      this.$q.notify({
        color: 'primary',
        message: '行程已复制，请在"我的行程"中查看',
        icon: 'content_copy'
      });
    },
    sendToPhone() {
      // 将行程信息发送到手机
      this.$q.dialog({
        title: '发送到手机',
        message: '请输入手机号码',
        prompt: {
          model: '',
          type: 'tel'
        },
        cancel: true,
        persistent: true
      }).onOk(data => {
        this.$q.notify({
          color: 'positive',
          message: `行程信息已发送至 ${data}`,
          icon: 'phone_android'
        });
      });
    },
    // 添加新的旅行笔记
    createNewNote() {
      this.$q.dialog({
        title: '添加旅行笔记',
        message: '记录您的旅行体验',
        prompt: {
          model: {
            title: '',
            content: ''
          },
          type: 'text',
          isValid: val => val.title && val.title.length > 0,
        },
        cancel: true,
        persistent: true
      }).onOk(data => {
        const newNote = {
          title: data.title,
          date: new Date().toLocaleDateString('zh-CN', {year: 'numeric', month: 'long', day: 'numeric'}),
          content: data.content,
          photos: []
        };
        this.trip.notes.unshift(newNote);
        this.$q.notify({
          color: 'positive',
          message: '笔记已添加',
          icon: 'check'
        });
      });
    },
    // 显示天气预报
    showWeatherForecast() {
      this.$q.dialog({
        title: '东京天气预报',
        message: '未能获取天气数据，请检查网络连接',
        persistent: true
      });
    },
    // 查看交通路线
    viewTransportation(activity) {
      this.$q.dialog({
        title: `前往${activity.location}的路线`,
        message: '地图功能尚未实现',
        persistent: true
      });
    },
    // 查看文档
    viewDocument(doc) {
      this.selectedDocument = doc;
      this.documentViewOpen = true;
    },
    // 当前行程中的日期是否已过
    isDatePassed(date) {
      // 实现日期比较逻辑
      return false; // 示例返回
    },
    loadTripData(tripId) {
      console.log('加载行程数据:', tripId);
      // 这里可以添加从API或store加载数据的逻辑
      // 示例仅使用已有数据
    }
  },
  created() {
    // 根据ID加载行程数据
    this.loadTripData(this.id);
  },
  mounted() {
    // 页面加载后的逻辑
    console.log('Trip detail page mounted');
  }
}
</script>

<style scoped>
.container {
  max-width: 1200px;
  margin: 0 auto;
}

.trip-detail-page {
  background-color: #f5f5f5;
}

.bg-black-6 {
  background-color: rgba(0, 0, 0, 0.6);
}

.time-column {
  width: 80px;
  min-width: 80px;
}

.activity-photo {
  border-radius: 4px;
  object-fit: cover;
}

/* 日程时间线样式 */
:deep(.q-timeline__subtitle) {
  font-weight: 500;
  color: #1976d2;
}

:deep(.q-timeline__content) {
  padding-bottom: 24px;
}

/* 添加一些动画效果 */
.trip-card,
.ongoing-trip-card,
.completed-trip-card,
.q-card {
  transition: transform 0.3s, box-shadow 0.3s;
}

.trip-card:hover,
.ongoing-trip-card:hover,
.completed-trip-card:hover,
.q-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 8px 16px rgba(0, 0, 0, 0.1);
}

/* 提高地图容器悬停时的交互性 */
.map-container {
  cursor: pointer;
  border-radius: 8px;
  overflow: hidden;
  transition: transform 0.3s ease;
}

.map-container:hover {
  transform: scale(1.02);
}

/* 当前活动高亮 */
.current-activity {
  background-color: rgba(25, 118, 210, 0.08);
  border-left: 3px solid #1976d2;
  border-radius: 4px;
}

/* 旅行进度条样式 */
.progress-wrapper {
  height: 8px;
  border-radius: 4px;
  overflow: hidden;
  background: rgba(0, 0, 0, 0.1);
}

.progress-bar {
  height: 100%;
  background: linear-gradient(to right, #1976d2, #64b5f6);
  border-radius: 4px;
  transition: width 0.5s ease-in-out;
}

/* 优化打印样式 */
@media print {
  .q-header,
  .q-page-sticky,
  .map-container,
  .q-fab,
  .action-buttons {
    display: none !important;
  }
  
  .container {
    width: 100%;
    max-width: 100%;
  }
  
  .trip-content {
    padding: 0 !important;
  }
  
  .col-md-8,
  .col-md-4 {
    width: 100% !important;
    max-width: 100% !important;
    flex: 0 0 100% !important;
  }
  
  .q-card {
    box-shadow: none !important;
    border: 1px solid #ddd !important;
    margin-bottom: 20px !important;
  }
  
  .q-timeline__dot {
    background-color: #000 !important;
  }
  
  .page-break {
    page-break-before: always;
  }
}

/* 响应式调整 */
@media (max-width: 599px) {
  .time-column {
    width: 60px;
    min-width: 60px;
  }
  
  .trip-header img {
    max-height: 200px !important;
  }
  
  .text-h4 {
    font-size: 1.5rem !important;
  }
  
  .text-h6 {
    font-size: 1.1rem !important;
  }
}

/* 自定义标签样式 */
.custom-chip {
  font-size: 0.75rem;
  background-color: rgba(0, 0, 0, 0.05);
  padding: 2px 8px;
  border-radius: 12px;
  display: inline-block;
  margin-right: 4px;
  margin-bottom: 4px;
}

/* 照片画廊缩略图 */
.photo-thumbnail {
  width: 100%;
  aspect-ratio: 1;
  object-fit: cover;
  border-radius: 4px;
  transition: transform 0.2s;
}

.photo-thumbnail:hover {
  transform: scale(1.05);
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
}

/* 优化文档列表 */
.document-item {
  border-radius: 8px;
  transition: background-color 0.2s;
}

.document-item:hover {
  background-color: rgba(25, 118, 210, 0.05);
}

/* 优化笔记部分 */
.note-card {
  border-left: 3px solid #1976d2;
  padding-left: 12px;
  margin-bottom: 24px;
}

/* 优化活动内容布局 */
.activity-content {
  padding: 8px;
  border-radius: 4px;
}

.activity-content:hover {
  background-color: rgba(0, 0, 0, 0.02);
}

/* 添加一些装饰线条 */
.section-divider {
  height: 3px;
  width: 60px;
  background: linear-gradient(to right, #1976d2, transparent);
  border-radius: 3px;
  margin-bottom: 16px;
}
</style> 