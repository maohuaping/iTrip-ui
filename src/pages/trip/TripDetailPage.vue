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
      
      // 旅行数据
      trip: {
        id: '123456',
        destination: '日本东京',
        date: '2023年12月15日 - 2023年12月22日',
        status: 'upcoming', // upcoming, ongoing, completed
        coverImage: 'https://images.unsplash.com/photo-1536098561742-ca998e48cbcc',
        daysLeft: 28,
        currentDay: 0,
        totalDays: 8,
        accommodationDays: 7,
        travelers: 2,
        description: '这是一次期待已久的东京之旅，我们将探索这座现代与传统并存的城市。行程包括参观东京塔、明治神宫、浅草寺等知名景点，还会在秋叶原体验电子产品天堂，在涩谷感受城市脉搏。此外，我们还安排了一日游前往富士山和箱根。',
        rating: 0, // 仅完成状态可评分
        
        // 预算信息
        budget: {
          total: 20000,
          used: 8000,
          breakdown: [
            { category: '交通 (机票)', amount: 8000 },
            { category: '住宿', amount: 5600 },
            { category: '餐饮', amount: 3200 },
            { category: '门票', amount: 1500 },
            { category: '购物', amount: 1500 },
            { category: '其他', amount: 200 }
          ]
        },
        
        // 景点列表
        attractions: [
          { name: '东京塔', location: '东京都港区芝公园4丁目', image: 'https://images.unsplash.com/photo-1536098561742-ca998e48cbcc?auto=format&fit=crop&w=80&h=80', rating: 4.5 },
          { name: '浅草寺', location: '东京都台东区浅草2丁目', image: 'https://images.unsplash.com/photo-1570459027562-4a916cc6f1ba?auto=format&fit=crop&w=80&h=80', rating: 4.3 },
          { name: '明治神宫', location: '东京都涩谷区代代木', image: 'https://images.unsplash.com/photo-1583084647979-b62a6e0f8dae?auto=format&fit=crop&w=80&h=80', rating: 4.7 },
          { name: '秋叶原', location: '东京都千代田区外神田', image: 'https://images.unsplash.com/photo-1542051841857-5f90071e7989?auto=format&fit=crop&w=80&h=80', rating: 4.2 },
          { name: '涩谷十字路口', location: '东京都涩谷区道玄坂', image: 'https://images.unsplash.com/photo-1532246420286-a0e5e4a4d00d?auto=format&fit=crop&w=80&h=80', rating: 4.4 },
          { name: '上野公园', location: '东京都台东区上野公园', image: 'https://images.unsplash.com/photo-1584029432120-8dfe81be585a?auto=format&fit=crop&w=80&h=80', rating: 4.1 },
          { name: '富士山', location: '山梨县和静冈县', image: 'https://images.unsplash.com/photo-1578271887552-5ac3a72752bc?auto=format&fit=crop&w=80&h=80', rating: 4.9 },
          { name: '箱根', location: '神奈川县足柄下郡', image: 'https://images.unsplash.com/photo-1671718761256-4df5c9dd0711?auto=format&fit=crop&w=80&h=80', rating: 4.6 }
        ],
        
        // 待办事项
        todoList: [
          { title: '购买机票', completed: true, priority: 'high', dueDate: '2023-11-15' },
          { title: '预订酒店', completed: true, priority: 'high', dueDate: '2023-11-20' },
          { title: '兑换日元', completed: false, priority: 'medium', dueDate: '2023-12-10' },
          { title: '购买旅行保险', completed: false, priority: 'high', dueDate: '2023-12-01' },
          { title: '整理行李', completed: false, priority: 'medium', dueDate: '2023-12-14' },
          { title: '下载离线地图', completed: false, priority: 'low', dueDate: null },
          { title: '购买电源转换器', completed: false, priority: 'medium', dueDate: '2023-12-05' },
          { title: '复印重要证件', completed: false, priority: 'medium', dueDate: '2023-12-10' }
        ],
        
        // 日程安排
        itinerary: [
          {
            date: '2023年12月15日',
            title: '出发 · 抵达东京',
            activities: [
              {
                time: '07:30',
                title: '在机场集合',
                location: '首都国际机场 T2',
                description: '提前2小时到达机场办理登机手续'
              },
              {
                time: '09:30',
                title: '搭乘航班',
                location: 'CA167 北京 → 东京',
                description: '飞行时间约3小时'
              },
              {
                time: '14:00',
                title: '抵达成田机场',
                location: '成田国际机场',
                description: '出关、取行李，购买N\'EX票前往东京市区'
              },
              {
                time: '16:30',
                title: '入住酒店',
                location: '东京新宿京王广场酒店',
                description: '办理入住手续，稍作休息'
              },
              {
                time: '18:30',
                title: '晚餐',
                location: '新宿歌舞伎町',
                description: '品尝当地美食，适应时差'
              }
            ]
          },
          {
            date: '2023年12月16日',
            title: '东京市区观光 (浅草寺 & 晴空塔)',
            activities: [
              {
                time: '08:00',
                title: '酒店早餐',
                location: '酒店内',
                description: '享用酒店提供的日式早餐'
              },
              {
                time: '09:30',
                title: '参观浅草寺',
                location: '浅草寺',
                description: '参观东京最古老的寺庙，体验日本传统文化',
                photos: [
                  'https://images.unsplash.com/photo-1570459027562-4a916cc6f1ba',
                  'https://images.unsplash.com/photo-1590237580089-b638d4df4282'
                ]
              },
              {
                time: '12:00',
                title: '午餐',
                location: '浅草寺附近',
                description: '品尝传统日式料理'
              },
              {
                time: '14:00',
                title: '游览晴空塔',
                location: '东京晴空塔',
                description: '登上晴空塔观景台，俯瞰东京全景',
                photos: [
                  'https://images.unsplash.com/photo-1540959733332-eab4deabeeaf'
                ]
              },
              {
                time: '17:30',
                title: '晚餐',
                location: '晴空塔美食街',
                description: '在美食街享用晚餐'
              },
              {
                time: '19:30',
                title: '返回酒店',
                location: '东京新宿京王广场酒店',
                description: '乘坐地铁返回酒店休息'
              }
            ]
          },
          {
            date: '2023年12月17日',
            title: '明治神宫 & 涩谷',
            activities: [
              {
                time: '08:30',
                title: '酒店早餐',
                location: '酒店内',
                description: '享用早餐'
              },
              {
                time: '09:30',
                title: '参观明治神宫',
                location: '明治神宫',
                description: '参观日本最重要的神道教神社之一',
                photos: [
                  'https://images.unsplash.com/photo-1583084647979-b62a6e0f8dae'
                ]
              },
              {
                time: '12:00',
                title: '午餐',
                location: '原宿',
                description: '在原宿地区品尝时尚小吃'
              },
              {
                time: '14:00',
                title: '涩谷十字路口',
                location: '涩谷站前',
                description: '体验全球最繁忙的人行横道，拍照留念',
                photos: [
                  'https://images.unsplash.com/photo-1532246420286-a0e5e4a4d00d'
                ]
              },
              {
                time: '15:30',
                title: '涩谷购物',
                location: '涩谷109',
                description: '在涩谷地区购物和探索'
              },
              {
                time: '18:30',
                title: '晚餐',
                location: '涩谷',
                description: '品尝当地特色料理'
              },
              {
                time: '20:30',
                title: '返回酒店',
                location: '东京新宿京王广场酒店',
                description: '乘坐地铁返回酒店'
              }
            ]
          },
          {
            date: '2023年12月18日',
            title: '秋叶原 & 上野公园',
            activities: [
              {
                time: '08:30',
                title: '酒店早餐',
                location: '酒店内',
                description: '享用早餐'
              },
              {
                time: '10:00',
                title: '参观秋叶原',
                location: '秋叶原电器街',
                description: '探索动漫与电子产品的天堂',
                photos: [
                  'https://images.unsplash.com/photo-1542051841857-5f90071e7989'
                ]
              },
              {
                time: '13:00',
                title: '午餐',
                location: '秋叶原',
                description: '在女仆咖啡厅或当地餐厅用餐'
              },
              {
                time: '14:30',
                title: '上野公园散步',
                location: '上野公园',
                description: '参观上野公园和上野动物园',
                photos: [
                  'https://images.unsplash.com/photo-1584029432120-8dfe81be585a'
                ]
              },
              {
                time: '17:00',
                title: '上野购物',
                location: '阿美横丁',
                description: '在阿美横丁购物和享用小吃'
              },
              {
                time: '19:00',
                title: '晚餐',
                location: '上野',
                description: '品尝当地特色料理'
              },
              {
                time: '21:00',
                title: '返回酒店',
                location: '东京新宿京王广场酒店',
                description: '乘坐地铁返回酒店'
              }
            ]
          },
          {
            date: '2023年12月19日',
            title: '富士山一日游',
            activities: [
              {
                time: '06:30',
                title: '集合出发',
                location: '酒店大堂',
                description: '与导游集合，乘坐巴士前往富士山'
              },
              {
                time: '10:00',
                title: '抵达富士山五合目',
                location: '富士山五合目',
                description: '参观富士山，拍照留念',
                photos: [
                  'https://images.unsplash.com/photo-1578271887552-5ac3a72752bc'
                ]
              },
              {
                time: '12:30',
                title: '午餐',
                location: '富士山游客中心',
                description: '享用特色午餐'
              },
              {
                time: '14:00',
                title: '游览箱根',
                location: '箱根',
                description: '参观箱根国立公园，体验温泉',
                photos: [
                  'https://images.unsplash.com/photo-1671718761256-4df5c9dd0711'
                ]
              },
              {
                time: '16:00',
                title: '箱根海盗船',
                location: '芦之湖',
                description: '乘坐海盗船游览芦之湖'
              },
              {
                time: '19:30',
                title: '返回东京',
                location: '东京新宿京王广场酒店',
                description: '乘坐巴士返回酒店'
              }
            ]
          },
          {
            date: '2023年12月20日',
            title: '东京迪士尼乐园',
            activities: [
              {
                time: '07:30',
                title: '出发前往迪士尼',
                location: '酒店',
                description: '乘坐地铁前往东京迪士尼乐园'
              },
              {
                time: '09:00',
                title: '到达迪士尼乐园',
                location: '东京迪士尼乐园',
                description: '全天游玩迪士尼乐园',
                photos: [
                  'https://images.unsplash.com/photo-1624811533744-f85a1c55248a'
                ]
              },
              {
                time: '12:30',
                title: '午餐',
                location: '迪士尼乐园内',
                description: '在园内餐厅用餐'
              },
              {
                time: '20:00',
                title: '观看烟花表演',
                location: '迪士尼乐园城堡前',
                description: '欣赏迪士尼经典烟花表演'
              },
              {
                time: '22:00',
                title: '返回酒店',
                location: '东京新宿京王广场酒店',
                description: '乘坐地铁返回酒店'
              }
            ]
          },
          {
            date: '2023年12月21日',
            title: '自由活动 & 购物',
            activities: [
              {
                time: '09:00',
                title: '酒店早餐',
                location: '酒店内',
                description: '享用早餐'
              },
              {
                time: '10:30',
                title: '银座购物',
                location: '银座',
                description: '在东京最著名的购物区购物',
                photos: [
                  'https://images.unsplash.com/photo-1551641506-ee5bf4cb45f1'
                ]
              },
              {
                time: '13:00',
                title: '午餐',
                location: '银座',
                description: '在高级餐厅享用午餐'
              },
              {
                time: '15:00',
                title: '六本木Hills',
                location: '六本木Hills',
                description: '参观六本木Hills，欣赏东京城市景观'
              },
              {
                time: '18:00',
                title: '告别晚宴',
                location: '新宿',
                description: '在日式烤肉店享用告别晚餐'
              },
              {
                time: '20:30',
                title: '返回酒店整理行李',
                location: '东京新宿京王广场酒店',
                description: '返回酒店，整理行李准备明天离开'
              }
            ]
          },
          {
            date: '2023年12月22日',
            title: '返程',
            activities: [
              {
                time: '07:30',
                title: '酒店早餐',
                location: '酒店内',
                description: '享用最后一次酒店早餐'
              },
              {
                time: '09:00',
                title: '退房',
                location: '东京新宿京王广场酒店',
                description: '办理退房手续'
              },
              {
                time: '10:00',
                title: '前往机场',
                location: '成田国际机场',
                description: '乘坐机场快线前往成田机场'
              },
              {
                time: '12:00',
                title: '机场办理手续',
                location: '成田国际机场',
                description: '办理登机手续，购买免税商品'
              },
              {
                time: '15:00',
                title: '搭乘航班',
                location: 'CA168 东京 → 北京',
                description: '飞行时间约3小时'
              },
              {
                time: '18:00',
                title: '抵达北京',
                location: '首都国际机场',
                description: '结束愉快的东京之旅'
              }
            ]
          }
        ],
        
        // 旅行笔记 (仅进行中或已完成旅行会有)
        notes: [
          // 如果是已完成或进行中的旅行，可以添加笔记示例
          /*
          {
            title: '初到东京的感受',
            date: '2023年12月15日',
            content: '第一天抵达东京，城市比想象中更加整洁有序。从机场到酒店的路上，能感受到浓厚的日本文化氛围。新宿站周边非常热闹，各种霓虹灯和广告牌让人目不暇接。期待接下来的行程！',
            photos: [
              'https://images.unsplash.com/photo-1540959733332-eab4deabeeaf',
              'https://images.unsplash.com/photo-1542931291-small-63ff1c1ea33'
            ]
          },
          {
            title: '浅草寺之行',
            date: '2023年12月16日',
            content: '今天参观了浅草寺，这座寺庙历史悠久，建筑风格独特。寺庙门口的大红灯笼非常壮观，仿佛穿越回了古代日本。在寺庙周边的商店街购买了一些小纪念品，还尝试了日本传统点心。下午登上了晴空塔，东京的全景尽收眼底，太震撼了！',
            photos: [
              'https://images.unsplash.com/photo-1570459027562-4a916cc6f1ba',
              'https://images.unsplash.com/photo-1590237580089-b638d4df4282',
              'https://images.unsplash.com/photo-1540959733332-eab4deabeeaf'
            ]
          }
          */
        ],
        
        // 当旅行完成后可以添加总结
        summary: {
          highlights: [],
          recommendations: [],
          tips: []
        },
        
        // 旅行伙伴信息
        companions: [
          { name: '张三', email: 'zhangsan@example.com', phone: '138****1234' },
          { name: '李四', email: 'lisi@example.com', phone: '139****5678' }
        ],
        
        // 紧急联系人信息
        emergencyContacts: [
          { name: '王五', relationship: '家人', phone: '135****4321' }
        ],
        
        // 文件和文档
        documents: [
          { name: '航班确认单.pdf', type: 'pdf', size: '1.2MB' },
          { name: '酒店预订.pdf', type: 'pdf', size: '0.8MB' },
          { name: '旅游保险.pdf', type: 'pdf', size: '1.5MB' },
          { name: '东京地铁图.jpg', type: 'image', size: '2.3MB' }
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
      this.$router.push(`/trip/planner/edit/${this.trip.id}`);
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