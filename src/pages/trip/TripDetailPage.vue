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
            style="max-height: 350px"
          >
            <template v-slot:loading>
              <q-skeleton type="QImg" />
            </template>
            <div class="absolute-bottom">
              <div class="container q-px-md q-pb-lg gradient-overlay">
                <div class="text-h4 text-bold text-white">{{ trip.destination }}</div>
                <div class="text-subtitle1 q-mt-sm text-white opacity-8">{{ trip.date }}</div>
                <div class="row items-center q-mt-md">
                  <q-chip
                    v-if="trip.status === 'upcoming'"
                    color="deep-orange"
                    text-color="white"
                    icon="flight_takeoff"
                    class="glossy"
                  >
                    {{ trip.daysLeft }} 天后出发
                  </q-chip>
                  <q-chip
                    v-if="trip.status === 'ongoing'"
                    color="light-green-7"
                    text-color="white"
                    icon="directions_car"
                    class="glossy"
                  >
                    进行中 (第 {{ trip.currentDay }} 天)
                  </q-chip>
                  <q-chip
                    v-if="trip.status === 'completed'"
                    color="blue-grey"
                    text-color="white"
                    icon="flag"
                    class="glossy"
                  >
                    已完成
                  </q-chip>
                  <q-space />
                  <q-rating
                    v-if="trip.status === 'completed'"
                    v-model="trip.rating"
                    size="1.5em"
                    color="amber"
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
            <!-- 快速操作按钮行 -->
            <div class="row q-mb-md action-buttons">
              <q-btn unelevated rounded color="primary" class="col q-mx-xs" icon="edit" label="编辑行程" @click="editTrip" />
              <q-btn unelevated rounded color="secondary" class="col q-mx-xs" icon="content_copy" label="复制行程" @click="duplicateTrip" />
              <q-btn unelevated rounded color="teal" class="col q-mx-xs" icon="directions" label="导航" @click="navigateToFirstLocation" />
            </div>
            
            <div class="row q-col-gutter-md">
              <!-- 左侧主要内容 -->
              <div class="col-12 col-md-8">
                <!-- 行程概览 -->
                <q-card flat bordered class="q-mb-md card-hover">
                  <q-card-section>
                    <div class="text-h6 text-primary q-mb-sm flex items-center">
                      <q-icon name="info" class="q-mr-xs" />
                      行程概览
                    </div>
                    <q-separator color="primary" class="q-mb-md" />
                    <p class="description-text">{{ trip.description }}</p>
                    
                    <div class="row q-col-gutter-md q-mt-lg">
                      <div class="col-6 col-sm-3">
                        <div class="stat-box text-center">
                          <q-icon name="event" size="2rem" color="primary" />
                          <div class="text-caption q-mt-sm">总天数</div>
                          <div class="text-subtitle1 text-weight-bold">{{ trip.totalDays }} 天</div>
                        </div>
                      </div>
                      <div class="col-6 col-sm-3">
                        <div class="stat-box text-center">
                          <q-icon name="people" size="2rem" color="green" />
                          <div class="text-caption q-mt-sm">旅行人数</div>
                          <div class="text-subtitle1 text-weight-bold">{{ trip.travelers }} 人</div>
                        </div>
                      </div>
                      <div class="col-6 col-sm-3">
                        <div class="stat-box text-center">
                          <q-icon name="place" size="2rem" color="orange" />
                          <div class="text-caption q-mt-sm">景点数量</div>
                          <div class="text-subtitle1 text-weight-bold">{{ trip.attractions.length }} 个</div>
                        </div>
                      </div>
                      <div class="col-6 col-sm-3">
                        <div class="stat-box text-center">
                          <q-icon name="hotel" size="2rem" color="purple" />
                          <div class="text-caption q-mt-sm">住宿天数</div>
                          <div class="text-subtitle1 text-weight-bold">{{ trip.accommodationDays }} 晚</div>
                        </div>
                      </div>
                    </div>
                  </q-card-section>
                </q-card>

                <!-- 日程安排 -->
                <q-card flat bordered class="q-mb-md card-hover">
                  <q-card-section class="q-pb-none">
                    <div class="text-h6 text-primary q-mb-md flex justify-between items-center">
                      <div class="flex items-center">
                        <q-icon name="date_range" class="q-mr-xs" />
                        <span>日程安排</span>
                      </div>
                      <q-btn dense flat round icon="tune" color="grey-7">
                        <q-tooltip>自定义显示</q-tooltip>
                      </q-btn>
                    </div>
                    
                    <q-tabs
                      v-model="activeDay"
                      dense
                      class="text-primary q-mb-md modern-tabs"
                      active-color="primary"
                      indicator-color="primary"
                      align="justify"
                      narrow-indicator
                      no-caps
                      outside-arrows
                      mobile-arrows
                    >
                      <q-tab 
                        v-for="(day, index) in trip.itinerary" 
                        :key="index"
                        :name="index"
                        :class="index + 1 === trip.currentDay ? 'current-day-tab' : ''"
                      >
                        <q-item dense class="q-pa-none">
                          <q-item-section>
                            <q-item-label>第{{ index + 1 }}天</q-item-label>
                            <q-item-label caption class="tab-subtitle">{{ formatDayDate(day.date) }}</q-item-label>
                          </q-item-section>
                        </q-item>
                      </q-tab>
                    </q-tabs>
                  </q-card-section>
                  
                  <q-separator />
                  
                  <q-card-section class="q-pt-md">
                    <q-tab-panels v-model="activeDay" animated transition-prev="slide-right" transition-next="slide-left">
                      <q-tab-panel 
                        v-for="(day, index) in trip.itinerary" 
                        :key="index" 
                        :name="index"
                        class="q-pa-none"
                      >
                        <div class="day-header q-mb-md">
                          <div class="text-subtitle1 text-weight-bold text-primary">{{ day.title }}</div>
                        </div>
                        
                        <div class="timeline-container">
                          <div 
                            v-for="(activity, i) in day.activities" 
                            :key="i"
                            class="timeline-item q-mb-md"
                            :class="{'timeline-item-current': index + 1 === trip.currentDay && 
                              i === getCurrentActivityIndex(day.activities)}"
                          >
                            <div class="timeline-content q-pa-md">
                              <div class="time-badge-corner">{{ activity.time }}</div>
                              
                              <!-- 添加活动类型标签 -->
                              <div class="activity-type-badge" :class="getActivityTypeClass(activity)">
                                {{ getActivityTypeLabel(activity) }}
                              </div>
                              
                              <div class="text-weight-medium text-subtitle1">{{ activity.title }}</div>
                              
                              <div class="location q-mt-xs">
                                <q-icon name="place" size="xs" color="deep-orange" class="q-mr-xs" />
                                <span class="text-caption">{{ activity.location }}</span>
                                
                                <!-- 添加导航按钮 -->
                                <q-btn
                                  v-if="i > 0"
                                  flat
                                  round
                                  dense
                                  color="teal"
                                  icon="directions"
                                  size="xs"
                                  class="navigation-btn q-ml-sm"
                                  @click="navigateBetweenLocations(day.activities[i-1], activity)"
                                >
                                  <q-tooltip>导航到这里</q-tooltip>
                                </q-btn>
                              </div>
                              
                              <q-separator class="q-my-sm" />
                              <div class="description">{{ activity.description }}</div>
                              
                              <div class="row q-mt-md q-gutter-sm" v-if="activity.photos && activity.photos.length">
                                <q-img
                                  v-for="(photo, photoIndex) in activity.photos.slice(0, 3)"
                                  :key="photoIndex"
                                  :src="photo"
                                  class="activity-photo"
                                  @click="openPhotoGallery(activity.photos, photoIndex)"
                                >
                                  <div v-if="activity.photos.length > 3 && photoIndex === 2" 
                                       class="absolute-full flex flex-center bg-black-6 text-white">
                                    +{{ activity.photos.length - 2 }}
                                  </div>
                                </q-img>
                              </div>
                              
                              <div class="activity-actions row q-mt-sm q-gutter-xs justify-end">
                                <q-btn flat round dense size="sm" color="teal" icon="directions" @click="viewTransportation(activity)">
                                  <q-tooltip>查看路线</q-tooltip>
                                </q-btn>
                                <q-btn flat round dense size="sm" color="purple" icon="add_a_photo" @click="addActivityPhotoPrompt(activity)">
                                  <q-tooltip>添加照片</q-tooltip>
                                </q-btn>
                                <q-btn flat round dense size="sm" color="orange" icon="note_add" @click="addActivityNote(activity)">
                                  <q-tooltip>添加笔记</q-tooltip>
                                </q-btn>
                                <q-btn flat round dense size="sm" color="primary" icon="edit" @click="editActivity(activity)">
                                  <q-tooltip>编辑</q-tooltip>
                                </q-btn>
                              </div>
                            </div>
                          </div>
                        </div>
                      </q-tab-panel>
                    </q-tab-panels>
                  </q-card-section>
                </q-card>

                <!-- 旅行笔记和照片 -->
                <q-card v-if="trip.notes && trip.notes.length" flat bordered class="q-mb-md card-hover">
                  <q-card-section>
                    <div class="text-h6 text-primary q-mb-sm flex items-center">
                      <q-icon name="book" class="q-mr-xs" />
                      旅行笔记
                    </div>
                    <q-separator color="primary" class="q-mb-md" />
                    
                    <div v-for="(note, index) in trip.notes" :key="index" class="note-card q-mb-lg">
                      <div class="row items-center q-mb-sm">
                        <div class="text-subtitle1 text-weight-medium text-primary">{{ note.title }}</div>
                        <q-space />
                        <div class="text-caption text-grey flex items-center">
                          <q-icon name="event" size="xs" class="q-mr-xs" />
                          {{ note.date }}
                        </div>
                      </div>
                      <p class="note-content">{{ note.content }}</p>
                      
                      <div class="row q-col-gutter-sm q-mt-md" v-if="note.photos && note.photos.length">
                        <div v-for="(photo, photoIndex) in note.photos" :key="photoIndex" class="col-4 col-sm-3">
                          <q-img
                            :src="photo"
                            :ratio="1"
                            class="rounded-borders cursor-pointer photo-thumbnail"
                            @click="openPhotoGallery(note.photos, photoIndex)"
                          />
                        </div>
                      </div>
                    </div>
                    
                    <div class="q-mt-md text-center" v-if="!trip.notes.length">
                      <q-icon name="photo_album" size="3rem" color="grey-4" />
                      <div class="text-body2 text-grey q-mt-sm">暂无旅行笔记</div>
                      <q-btn unelevated color="primary" class="q-mt-sm" icon-right="add" label="添加笔记" @click="addNote" />
                    </div>
                  </q-card-section>
                </q-card>
              </div>

              <!-- 右侧侧边栏 -->
              <div class="col-12 col-md-4">
                <!-- 预算信息 -->
                <q-card flat bordered class="q-mb-md card-hover">
                  <q-card-section>
                    <div class="text-h6 text-primary q-mb-sm flex items-center">
                      <q-icon name="account_balance_wallet" class="q-mr-xs" />
                      预算信息
                    </div>
                    <q-separator color="primary" class="q-mb-md" />
                    
                    <div class="text-center q-mb-lg">
                      <q-circular-progress
                        :value="(trip.budget.used / trip.budget.total) * 100"
                        size="120px"
                        :thickness="0.15"
                        color="primary"
                        track-color="grey-3"
                        class="q-ma-md"
                        show-value
                        font-size="16px"
                      >
                        {{ Math.round((trip.budget.used / trip.budget.total) * 100) }}%
                      </q-circular-progress>
                      <div class="text-subtitle1 text-weight-bold">
                        <span class="text-primary">¥{{ trip.budget.used.toLocaleString() }}</span> / 
                        <span>¥{{ trip.budget.total.toLocaleString() }}</span>
                      </div>
                      <div class="text-caption text-grey">已使用 / 总预算</div>
                    </div>
                    
                    <q-list separator class="rounded-borders">
                      <q-item v-for="(item, index) in trip.budget.breakdown" :key="index" class="budget-item">
                        <q-item-section avatar>
                          <q-icon :name="getBudgetIcon(item.category)" :color="getBudgetColor(item.category)" />
                        </q-item-section>
                        <q-item-section>
                          <q-item-label>{{ item.category }}</q-item-label>
                        </q-item-section>
                        <q-item-section side>
                          <q-item-label class="text-weight-medium">¥{{ item.amount.toLocaleString() }}</q-item-label>
                        </q-item-section>
                      </q-item>
                    </q-list>
                    
                    <div class="q-mt-md text-right">
                      <q-btn flat color="primary" icon="add" label="添加支出" />
                    </div>
                  </q-card-section>
                </q-card>
                
                <!-- 行程地图 -->
                <q-card flat bordered class="q-mb-md card-hover">
                  <q-card-section>
                    <div class="text-h6 text-primary q-mb-sm flex items-center">
                      <q-icon name="map" class="q-mr-xs" />
                      行程地图
                    </div>
                    <q-separator color="primary" class="q-mb-md" />
                    
                    <div class="map-container">
                      <q-img
                        src="https://maps.googleapis.com/maps/api/staticmap?center=Tonglu,China&zoom=11&size=600x300&markers=color:red|Tonglu,China&key=YOUR_API_KEY"
                        class="full-width rounded-borders"
                        style="height: 200px"
                      >
                        <div class="absolute-bottom text-subtitle2 text-center text-white gradient-overlay-bottom">
                          点击查看详细地图
                        </div>
                        <div class="absolute-top-right q-ma-sm">
                          <q-btn round color="white" text-color="primary" icon="open_in_new" size="sm">
                            <q-tooltip>打开地图</q-tooltip>
                          </q-btn>
                        </div>
                      </q-img>
                    </div>
                  </q-card-section>
                </q-card>
                
                <!-- 景点列表 -->
                <q-card flat bordered class="q-mb-md card-hover">
                  <q-card-section>
                    <div class="text-h6 text-primary q-mb-sm flex items-center justify-between">
                      <div class="flex items-center">
                        <q-icon name="attractions" class="q-mr-xs" />
                        <span>景点列表</span>
                      </div>
                      <q-btn flat round dense icon="open_in_new" size="sm" color="primary">
                        <q-tooltip>查看全部</q-tooltip>
                      </q-btn>
                    </div>
                    <q-separator color="primary" class="q-mb-md" />
                    
                    <div class="row q-col-gutter-sm">
                      <div v-for="(attraction, index) in trip.attractions" :key="index" class="col-12 col-sm-6 col-md-12">
                        <q-card class="attraction-card q-mb-sm" flat bordered @click="viewAttractionDetail(attraction)">
                          <q-item class="q-pa-none">
                            <q-item-section avatar class="q-pa-none">
                              <q-avatar square size="80px">
                                <q-img :src="attraction.image" />
                              </q-avatar>
                            </q-item-section>
                            <q-item-section>
                              <q-item-label class="text-weight-medium">{{ attraction.name }}</q-item-label>
                              <q-item-label caption class="flex items-center">
                                <q-icon name="place" size="xs" class="q-mr-xs" />
                                {{ attraction.location }}
                              </q-item-label>
                              <q-rating
                                v-model="attraction.rating"
                                size="1em"
                                color="amber"
                                icon="star"
                                readonly
                              />
                            </q-item-section>
                          </q-item>
                        </q-card>
                      </div>
                    </div>
                  </q-card-section>
                </q-card>
                
                <!-- 待办事项 -->
                <q-card v-if="trip.status === 'upcoming'" flat bordered class="q-mb-md card-hover">
                  <q-card-section>
                    <div class="text-h6 text-primary q-mb-sm flex items-center">
                      <q-icon name="checklist" class="q-mr-xs" />
                      待办事项
                    </div>
                    <q-separator color="primary" class="q-mb-md" />
                    
                    <q-list separator class="rounded-borders">
                      <q-item v-for="(task, index) in trip.todoList" :key="index" :class="{ 'completed-task': task.completed }">
                        <q-item-section avatar>
                          <q-checkbox v-model="task.completed" color="green" />
                        </q-item-section>
                        <q-item-section>
                          <q-item-label :class="{ 'text-strike text-grey': task.completed }">
                            {{ task.title }}
                          </q-item-label>
                          <q-item-label caption v-if="task.dueDate" class="flex items-center">
                            <q-icon name="event" size="xs" class="q-mr-xs" />
                            截止日期: {{ task.dueDate }}
                          </q-item-label>
                        </q-item-section>
                        <q-item-section side v-if="task.priority === 'high'">
                          <q-icon name="priority_high" color="negative" />
                        </q-item-section>
                      </q-item>
                    </q-list>
                    
                    <div class="text-center q-mt-md">
                      <q-btn unelevated color="primary" label="添加待办事项" icon="add" />
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
            icon="add"
            direction="up"
            glossy
            padding="sm"
          >
            <q-fab-action color="green" icon="add_a_photo" label="添加照片" @click="addPhotos">
              <q-tooltip anchor="center left" self="center right" :offset="[10, 0]">添加照片</q-tooltip>
            </q-fab-action>
            <q-fab-action color="orange" icon="edit_note" label="添加笔记" @click="addNote">
              <q-tooltip anchor="center left" self="center right" :offset="[10, 0]">添加笔记</q-tooltip>
            </q-fab-action>
            <q-fab-action color="blue" icon="print" label="打印行程" @click="printItinerary">
              <q-tooltip anchor="center left" self="center right" :offset="[10, 0]">打印行程</q-tooltip>
            </q-fab-action>
            <q-fab-action color="red" icon="delete" label="删除行程" @click="confirmDelete">
              <q-tooltip anchor="center left" self="center right" :offset="[10, 0]">删除行程</q-tooltip>
            </q-fab-action>
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

    <!-- 添加导航对话框 -->
    <q-dialog v-model="navigationDialogOpen" persistent>
      <q-card style="max-width: 500px; width: 90vw;">
        <q-card-section class="row items-center">
          <div class="text-h6">导航路线</div>
          <q-space />
          <q-btn icon="close" flat round dense v-close-popup />
        </q-card-section>
        
        <q-separator />
        
        <q-card-section class="q-pa-md">
          <div class="text-subtitle1 q-mb-md">从 {{ navigationData.from.location }} 到 {{ navigationData.to.location }}</div>
          
          <div class="navigation-details q-mb-md">
            <div class="row items-center q-mb-sm">
              <q-icon name="place" color="primary" size="sm" class="q-mr-sm" />
              <div class="text-weight-medium">{{ navigationData.from.title }}</div>
            </div>
            
            <div class="navigation-path q-px-md q-py-sm">
              <div class="route-info q-mb-sm">
                <div class="row justify-between items-center">
                  <div>
                    <q-icon name="directions_car" color="teal" class="q-mr-xs" />
                    <span class="text-weight-medium">驾车路线</span>
                  </div>
                  <div class="text-caption">
                    <span class="text-weight-bold">{{ navigationDistance }}</span> · 
                    约 <span class="text-weight-bold">{{ navigationDuration }}</span>
                  </div>
                </div>
              </div>
              
              <q-separator class="q-my-sm navigation-line" />
              
              <div class="route-info q-mb-sm">
                <div class="row justify-between items-center">
                  <div>
                    <q-icon name="directions_walk" color="light-green" class="q-mr-xs" />
                    <span class="text-weight-medium">步行路线</span>
                  </div>
                  <div class="text-caption">
                    <span class="text-weight-bold">{{ navigationWalkDistance }}</span> · 
                    约 <span class="text-weight-bold">{{ navigationWalkDuration }}</span>
                  </div>
                </div>
              </div>
            </div>
            
            <div class="row items-center q-mt-md">
              <q-icon name="flag" color="deep-orange" size="sm" class="q-mr-sm" />
              <div class="text-weight-medium">{{ navigationData.to.title }}</div>
            </div>
          </div>
          
          <div class="map-container q-mt-lg">
            <q-img
              src="https://maps.googleapis.com/maps/api/staticmap?size=400x200&path=color:0x1976D2|weight:5|Tonglu,China&markers=color:red|label:A|Tonglu,China&markers=color:red|label:B|Tonglu+Station,China&key=YOUR_API_KEY"
              class="full-width"
              style="height: 200px; border-radius: 8px"
            />
          </div>
        </q-card-section>
        
        <q-card-actions align="right" class="q-pa-md">
          <q-btn flat label="取消" color="grey-7" v-close-popup />
          <q-btn unelevated label="在地图中打开" color="primary" icon="open_in_new" @click="openInMaps" />
        </q-card-actions>
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
      
      // 添加这些新的变量
      activeDay: 0,
      
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
      },
      
      // 添加导航相关数据
      navigationDialogOpen: false,
      navigationData: {
        from: null,
        to: null
      },
      navigationDistance: '3.5 公里',
      navigationDuration: '15 分钟',
      navigationWalkDistance: '2.8 公里',
      navigationWalkDuration: '35 分钟'
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
    },
    // 添加这些新方法
    getCurrentActivityIndex(activities) {
      // 根据当前时间确定当前活动
      if (!activities || activities.length === 0) return -1;
      
      const now = new Date();
      const currentHour = now.getHours();
      const currentMinute = now.getMinutes();
      
      for (let i = activities.length - 1; i >= 0; i--) {
        const activity = activities[i];
        const [hour, minute] = activity.time.split(':').map(Number);
        
        if (hour < currentHour || (hour === currentHour && minute <= currentMinute)) {
          return i;
        }
      }
      
      return 0; // 如果当前时间早于所有活动，则返回第一个活动
    },
    
    addActivityNote(activity) {
      this.$q.dialog({
        title: '添加活动笔记',
        message: `为 "${activity.title}" 添加笔记`,
        prompt: {
          model: '',
          type: 'textarea'
        },
        cancel: true,
        persistent: true
      }).onOk(data => {
        this.$q.notify({
          color: 'positive',
          message: '笔记已添加',
          icon: 'done'
        });
      });
    },
    
    addActivityPhotoPrompt(activity) {
      // 在真实应用中，这里会打开文件选择器
      this.$q.notify({
        color: 'green',
        message: '照片上传功能尚未实现',
        icon: 'add_a_photo'
      });
    },
    
    editActivity(activity) {
      this.$q.notify({
        color: 'orange',
        message: '编辑活动功能尚未实现',
        icon: 'edit'
      });
    },
    
    formatDayDate(date) {
      // 简化日期显示
      const d = new Date(date);
      return `${d.getMonth() + 1}月${d.getDate()}日`;
    },
    
    getBudgetIcon(category) {
      // 根据预算类别返回相应图标
      const icons = {
        '交通': 'directions_car',
        '住宿': 'hotel',
        '餐饮': 'restaurant',
        '门票': 'confirmation_number',
        '购物': 'shopping_bag',
        '其他': 'miscellaneous_services'
      };
      return icons[category] || 'attach_money';
    },
    
    getBudgetColor(category) {
      // 根据预算类别返回相应颜色
      const colors = {
        '交通': 'blue',
        '住宿': 'purple',
        '餐饮': 'orange',
        '门票': 'teal',
        '购物': 'pink',
        '其他': 'grey'
      };
      return colors[category] || 'primary';
    },
    
    viewAttractionDetail(attraction) {
      this.$q.notify({
        color: 'primary',
        message: `查看${attraction.name}详情`,
        icon: 'place'
      });
    },
    
    navigateToFirstLocation() {
      if (this.trip.itinerary && this.trip.itinerary.length > 0 && 
          this.trip.itinerary[0].activities && this.trip.itinerary[0].activities.length > 0) {
        const firstLocation = this.trip.itinerary[0].activities[0].location;
        this.$q.notify({
          color: 'teal',
          message: `导航到${firstLocation}`,
          icon: 'directions'
        });
      }
    },
    
    // 获取活动类型标签
    getActivityTypeLabel(activity) {
      if (activity.title.includes('出发') || activity.title.includes('抵达') || 
          activity.title.includes('前往') || activity.title.includes('返回')) {
        return '出行';
      } else if (activity.title.includes('早餐') || activity.title.includes('午餐') || 
                 activity.title.includes('晚餐') || activity.title.includes('用餐') ||
                 activity.title.includes('大院') || activity.title.includes('小吃')) {
        return '用餐';
      } else if (activity.title.includes('游览') || activity.title.includes('徒步') || 
                 activity.title.includes('游玩') || activity.title.includes('观光')) {
        return '游览';
      } else if (activity.title.includes('酒店') || activity.title.includes('休息')) {
        return '住宿';
      } else {
        return '活动';
      }
    },
    
    // 获取活动类型样式类
    getActivityTypeClass(activity) {
      const type = this.getActivityTypeLabel(activity);
      switch (type) {
        case '出行': return 'transport';
        case '用餐': return 'meal';
        case '游览': return 'attraction';
        case '住宿': return 'rest';
        default: return 'activity';
      }
    },
    
    // 两个位置之间的导航
    navigateBetweenLocations(fromActivity, toActivity) {
      this.navigationData = {
        from: fromActivity,
        to: toActivity
      };
      
      // 这里应该调用地图API获取实际导航数据
      // 示例中使用固定数据
      
      // 根据距离估算时间和距离
      const locationNames = [fromActivity.location, toActivity.location].join(',').toLowerCase();
      
      if (locationNames.includes('酒店') && locationNames.includes('大奇山')) {
        this.navigationDistance = '5.2 公里';
        this.navigationDuration = '18 分钟';
        this.navigationWalkDistance = '4.5 公里';
        this.navigationWalkDuration = '55 分钟';
      } else if (locationNames.includes('酒店') && locationNames.includes('小吃街')) {
        this.navigationDistance = '3.1 公里';
        this.navigationDuration = '12 分钟';
        this.navigationWalkDistance = '2.8 公里';
        this.navigationWalkDuration = '35 分钟';
      } else if (locationNames.includes('石舍村') && locationNames.includes('马岭古道')) {
        this.navigationDistance = '0.8 公里';
        this.navigationDuration = '5 分钟';
        this.navigationWalkDistance = '0.8 公里';
        this.navigationWalkDuration = '10 分钟';
      } else {
        // 默认数据
        this.navigationDistance = '3.5 公里';
        this.navigationDuration = '15 分钟';
        this.navigationWalkDistance = '3.2 公里';
        this.navigationWalkDuration = '40 分钟';
      }
      
      this.navigationDialogOpen = true;
    },
    
    // 在地图应用中打开
    openInMaps() {
      const fromLocation = encodeURIComponent(this.navigationData.from.location);
      const toLocation = encodeURIComponent(this.navigationData.to.location);
      
      // 尝试打开高德地图
      const aMapUrl = `https://uri.amap.com/navigation?from=,,${fromLocation}&to=,,${toLocation}&mode=car&policy=1&src=mypage&coordinate=gaode&callnative=0`;
      
      // 这里应该有更复杂的逻辑来检测用户设备和打开相应的地图应用
      window.open(aMapUrl, '_blank');
      
      this.navigationDialogOpen = false;
      
      this.$q.notify({
        color: 'positive',
        message: '正在打开地图应用',
        icon: 'directions'
      });
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
  background-color: #f8f9fa;
  min-height: 100vh;
}

.gradient-overlay {
  background: linear-gradient(to top, rgba(0,0,0,0.8) 0%, rgba(0,0,0,0.4) 50%, rgba(0,0,0,0) 100%);
  padding-top: 50px;
}

.gradient-overlay-bottom {
  background: linear-gradient(to top, rgba(0,0,0,0.7) 0%, rgba(0,0,0,0.3) 70%, rgba(0,0,0,0) 100%);
  padding: 8px;
}

.opacity-8 {
  opacity: 0.8;
}

.card-hover {
  transition: all 0.3s ease;
  border-radius: 12px;
  border-color: #e0e0e0;
}

.card-hover:hover {
  transform: translateY(-5px);
  box-shadow: 0 8px 24px rgba(0,0,0,0.12);
}

.description-text {
  line-height: 1.6;
  color: #424242;
}

.stat-box {
  padding: 12px 8px;
  background-color: #f5f5f5;
  border-radius: 8px;
  transition: all 0.2s ease;
}

.stat-box:hover {
  background-color: #e3f2fd;
  transform: translateY(-3px);
}

.modern-tabs {
  background-color: #f5f5f5;
  border-radius: 8px;
  padding: 4px;
}

.tab-subtitle {
  font-size: 0.7rem;
  opacity: 0.7;
}

.current-day-tab {
  background-color: rgba(25, 118, 210, 0.1);
  border-radius: 4px;
}

.timeline-container {
  position: relative;
  padding-left: 12px;
}

.timeline-item {
  display: flex;
  position: relative;
  margin-bottom: 24px;
}

.timeline-item:before {
  content: '';
  position: absolute;
  left: 15px;
  top: 30px;
  bottom: -25px;
  width: 2px;
  background-color: rgba(25, 118, 210, 0.2);
  z-index: 1;
}

.timeline-item:last-child:before {
  display: none;
}

.timeline-content {
  flex: 1;
  background-color: white;
  border-radius: 12px;
  box-shadow: 0 3px 10px rgba(0, 0, 0, 0.1);
  position: relative;
  overflow: hidden;
  transition: all 0.3s ease;
  padding-top: 36px !important; /* 为角标留出空间 */
}

.timeline-content:hover {
  box-shadow: 0 6px 15px rgba(0, 0, 0, 0.15);
  transform: translateY(-2px);
}

.timeline-content:before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  width: 4px;
  height: 100%;
  background-color: #1976d2;
}

.timeline-item-current .timeline-content:before {
  background-color: #4caf50;
}

.timeline-content {
  background: linear-gradient(135deg, #ffffff 0%, #f8f9fa 100%);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.8);
}

.timeline-content::after {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 40px;
  background: linear-gradient(to bottom, rgba(0,0,0,0.03), transparent);
  pointer-events: none;
  z-index: 1;
}

.timeline-content .text-subtitle1 {
  font-weight: 600;
  color: #263238;
  font-size: 1.1rem;
  margin-bottom: 6px;
  position: relative;
  z-index: 2;
}

.location {
  color: #757575;
  display: flex;
  align-items: center;
  font-weight: 500;
  background-color: rgba(0,0,0,0.03);
  padding: 4px 8px;
  border-radius: 4px;
  display: inline-flex;
  margin-bottom: 10px;
}

.timeline-content .q-separator {
  opacity: 0.5;
  background: linear-gradient(to right, transparent, #1976d2, transparent);
  height: 1px;
}

.activity-photo {
  width: 100px;
  height: 75px;
  border-radius: 8px;
  object-fit: cover;
  cursor: pointer;
  transition: transform 0.2s;
  box-shadow: 0 2px 5px rgba(0,0,0,0.1);
}

.activity-photo:hover {
  transform: scale(1.05);
  box-shadow: 0 4px 8px rgba(0,0,0,0.2);
}

.description {
  font-size: 0.95rem;
  color: #424242;
  white-space: pre-line;
  line-height: 1.5;
  padding: 8px;
  background-color: rgba(0,0,0,0.02);
  border-radius: 8px;
  margin-bottom: 10px;
}

.timeline-content .q-btn {
  border-radius: 8px;
  transition: all 0.3s ease;
}

.timeline-content .q-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 8px rgba(0,0,0,0.1);
}

.note-card {
  border-left: 3px solid #1976d2;
  padding-left: 16px;
  margin-bottom: 24px;
  background-color: #fafafa;
  border-radius: 0 8px 8px 0;
  padding: 12px 16px 12px 16px;
  transition: all 0.3s ease;
}

.note-card:hover {
  background-color: #f0f7ff;
  transform: translateX(3px);
}

.note-content {
  font-size: 0.95rem;
  color: #424242;
  white-space: pre-line;
  line-height: 1.6;
}

.photo-thumbnail {
  transition: all 0.3s ease;
  border: 2px solid white;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
}

.photo-thumbnail:hover {
  transform: scale(1.05);
  box-shadow: 0 4px 12px rgba(0,0,0,0.2);
  z-index: 1;
}

.attraction-card {
  transition: all 0.3s ease;
  border-radius: 12px;
  overflow: hidden;
  cursor: pointer;
  border: 1px solid #e0e0e0;
}

.attraction-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 8px 16px rgba(0,0,0,0.1);
  border-color: #bbdefb;
}

.attraction-card:hover .q-item-section {
  background-color: rgba(25, 118, 210, 0.05);
}

.attraction-card:hover .q-item-label {
  color: #1976d2;
}

.completed-task {
  background-color: #f5f5f5;
  opacity: 0.8;
}

.completed-task:hover {
  background-color: #eeeeee;
}

.action-buttons {
  margin-bottom: 24px;
}

.action-buttons .q-btn {
  padding: 8px 12px;
  height: auto;
  transition: all 0.3s ease;
}

.action-buttons .q-btn:hover {
  transform: translateY(-3px);
  box-shadow: 0 5px 15px rgba(0,0,0,0.15);
}

.budget-item {
  border-radius: 8px;
  padding: 8px 12px;
  margin-bottom: 4px;
  transition: all 0.2s ease;
}

.budget-item:hover {
  background-color: #f5f5f5;
}

.budget-item .q-item-label {
  font-size: 0.95rem;
}

@keyframes fadeIn {
  from { opacity: 0; transform: translateY(20px); }
  to { opacity: 1; transform: translateY(0); }
}

@keyframes slideIn {
  from { opacity: 0; transform: translateX(-20px); }
  to { opacity: 1; transform: translateX(0); }
}

.timeline-item {
  animation: fadeIn 0.5s ease-out forwards;
  animation-delay: calc(var(--item-index, 0) * 0.1s);
  opacity: 0;
}

.stat-box {
  animation: fadeIn 0.5s ease-out forwards;
  animation-delay: calc(var(--item-index, 0) * 0.1s);
}

@media (max-width: 599px) {
  .action-buttons {
    flex-direction: column;
  }
  
  .action-buttons .q-btn {
    margin: 4px 0;
  }
  
  .timeline-content {
    padding-top: 32px !important;
  }
  
  .time-badge-corner {
    font-size: 0.75rem;
    padding: 3px 8px;
  }
  
  .timeline-content .text-subtitle1 {
    font-size: 1rem;
  }
  
  .activity-photo {
    width: 70px;
    height: 60px;
  }
  
  .text-h4 {
    font-size: 1.5rem !important;
  }
  
  .text-h6 {
    font-size: 1.1rem !important;
  }
  
  .stat-box {
    padding: 8px 4px;
  }
  
  .modern-tabs {
    padding: 2px;
  }
  
  .tab-subtitle {
    display: none;
  }
  
  .timeline-container {
    padding-left: 0;
  }
  
  .timeline-item:before {
    left: 10px;
  }
  
  :deep(.q-page-sticky) {
    bottom: 70px !important;
  }
  
  .trip-content {
    padding-bottom: 80px !important;
  }
}

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
  
  .card-hover {
    box-shadow: none !important;
    border: 1px solid #ddd !important;
    margin-bottom: 20px !important;
    transform: none !important;
  }
  
  .timeline-content:before {
    width: 2px !important;
  }
  
  .timeline-content {
    box-shadow: none !important;
    border: 1px solid #ddd !important;
  }
  
  .time-badge-corner {
    box-shadow: none !important;
    border: 1px solid #000 !important;
  }
  
  .timeline-item, .stat-box {
    opacity: 1 !important;
    transform: none !important;
    animation: none !important;
  }
  
  .page-break {
    page-break-before: always;
  }
}

.dark-mode .trip-detail-page {
  background-color: #121212;
}

.dark-mode .card-hover {
  background-color: #1e1e1e;
  border-color: #333;
}

.dark-mode .timeline-content {
  background-color: #1e1e1e;
  box-shadow: 0 3px 10px rgba(0, 0, 0, 0.3);
}

.dark-mode .time-badge-corner {
  background-color: #333;
  border-color: #555;
  color: #fff;
}

.dark-mode .description-text,
.dark-mode .description,
.dark-mode .note-content {
  color: #e0e0e0;
}

.dark-mode .stat-box {
  background-color: #333;
}

.dark-mode .stat-box:hover {
  background-color: #444;
}

:focus-visible {
  outline: 2px solid #1976d2;
  outline-offset: 2px;
}

.timeline-content:focus-visible,
.attraction-card:focus-visible,
.stat-box:focus-visible {
  outline: 2px solid #1976d2;
  outline-offset: 4px;
}

.loading-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(255, 255, 255, 0.7);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 10;
}

.loading-overlay .q-spinner {
  width: 50px;
  height: 50px;
}

.glossy {
  position: relative;
  overflow: hidden;
}

.glossy:after {
  content: '';
  position: absolute;
  top: -50%;
  left: -50%;
  width: 200%;
  height: 200%;
  background: linear-gradient(
    to bottom right, 
    rgba(255, 255, 255, 0.3) 0%, 
    rgba(255, 255, 255, 0) 50%, 
    rgba(255, 255, 255, 0) 100%
  );
  transform: rotate(30deg);
  pointer-events: none;
}

.card-hover {
  transform-origin: center bottom;
}

.card-hover:hover {
  animation: cardWiggle 0.5s ease-out;
}

@keyframes cardWiggle {
  0%, 100% { transform: translateY(-5px) rotate(0deg); }
  25% { transform: translateY(-7px) rotate(-0.5deg); }
  75% { transform: translateY(-7px) rotate(0.5deg); }
}

.q-icon {
  transition: transform 0.3s ease;
}

.q-btn:hover .q-icon, 
.stat-box:hover .q-icon {
  transform: rotate(10deg) scale(1.1);
}

.trip-detail-page {
  background: linear-gradient(135deg, #f8f9fa 0%, #ffffff 100%);
}

.activity-tag {
  display: inline-block;
  padding: 2px 8px;
  border-radius: 12px;
  font-size: 0.7rem;
  margin-right: 4px;
  font-weight: 500;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.activity-tag.transport {
  background-color: #e3f2fd;
  color: #1976d2;
}

.activity-tag.attraction {
  background-color: #e8f5e9;
  color: #388e3c;
}

.activity-tag.meal {
  background-color: #fff8e1;
  color: #ffa000;
}

.activity-tag.rest {
  background-color: #f3e5f5;
  color: #8e24aa;
}

.modern-tabs .q-tab {
  transition: transform 0.3s ease, background-color 0.3s ease;
}

.modern-tabs .q-tab:hover {
  transform: translateY(-2px);
  background-color: rgba(25, 118, 210, 0.05);
}

.modern-tabs .q-tab:active {
  transform: translateY(1px);
}

.map-container {
  position: relative;
  overflow: hidden;
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  transition: all 0.3s ease;
}

.map-container:hover {
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.15);
  transform: scale(1.02);
}

::-webkit-scrollbar {
  width: 8px;
  height: 8px;
}

::-webkit-scrollbar-track {
  background: #f1f1f1;
  border-radius: 4px;
}

::-webkit-scrollbar-thumb {
  background: #bdbdbd;
  border-radius: 4px;
}

::-webkit-scrollbar-thumb:hover {
  background: #9e9e9e;
}

/* 角标时间样式 */
.time-badge-corner {
  position: absolute;
  top: 0;
  right: 0;
  background-color: #1976d2;
  color: white;
  padding: 4px 10px;
  font-size: 0.8rem;
  font-weight: 500;
  border-radius: 0 12px 0 12px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  z-index: 2;
}

/* 活动类型标签 */
.activity-type-badge {
  position: absolute;
  top: 0;
  left: 0;
  padding: 4px 10px;
  font-size: 0.7rem;
  font-weight: 500;
  border-radius: 12px 0 12px 0;
  z-index: 2;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.activity-type-badge.transport {
  background-color: #e3f2fd;
  color: #1976d2;
}

.activity-type-badge.attraction {
  background-color: #e8f5e9;
  color: #388e3c;
}

.activity-type-badge.meal {
  background-color: #fff8e1;
  color: #ffa000;
}

.activity-type-badge.rest {
  background-color: #f3e5f5;
  color: #8e24aa;
}

.activity-type-badge.activity {
  background-color: #f5f5f5;
  color: #616161;
}

/* 导航按钮 */
.navigation-btn {
  transition: all 0.3s ease;
  opacity: 0.7;
}

.navigation-btn:hover {
  opacity: 1;
  transform: scale(1.2);
}

/* 操作按钮 */
.activity-actions {
  border-top: 1px dashed #e0e0e0;
  padding-top: 8px;
  margin-top: 8px !important;
}

.activity-actions .q-btn {
  transition: all 0.3s ease;
}

.activity-actions .q-btn:hover {
  transform: translateY(-3px);
  box-shadow: 0 3px 5px rgba(0,0,0,0.1);
}

/* 导航对话框样式 */
.navigation-details {
  background-color: #f5f5f5;
  border-radius: 8px;
  padding: 16px;
}

.navigation-path {
  border-left: 2px dashed #1976d2;
  margin-left: 12px;
}

.route-info {
  background-color: white;
  border-radius: 6px;
  padding: 8px;
  box-shadow: 0 2px 5px rgba(0,0,0,0.05);
}

.navigation-line {
  border-style: dashed;
  height: 20px;
  margin-left: 15px;
}

/* 更新的响应式样式 */
@media (max-width: 599px) {
  .timeline-container {
    padding-left: 0;
  }
  
  .activity-type-badge, .time-badge-corner {
    font-size: 0.65rem;
    padding: 3px 6px;
  }
  
  .route-info {
    padding: 6px;
  }
}

/* 暗色模式支持 */
.dark-mode .navigation-details {
  background-color: #1e1e1e;
}

.dark-mode .route-info {
  background-color: #333;
}

.dark-mode .activity-actions {
  border-top-color: #424242;
}

/* 卡片悬停效果增强 */
.timeline-content {
  transition: all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
}

.timeline-content:hover {
  transform: translateY(-5px) scale(1.01);
  box-shadow: 0 10px 20px rgba(0,0,0,0.1);
}
</style> 