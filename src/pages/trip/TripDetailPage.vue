<template>
  <q-page class="trip-detail-page">
    <!-- 1. 现代化标题设计 - 沉浸式头部 -->
    <div class="immersive-header" :style="headerStyle">
      <div class="header-overlay">
        <div class="container">
          <div class="row items-center justify-between q-py-md">
            <div class="col-auto">
              <q-btn flat round dense icon="arrow_back" color="white" to="/trip" />
            </div>
            <div class="col">
              <h1 class="text-h5 text-center text-white q-my-none">{{ trip.name }}</h1>
              <p v-if="getDaysBetween() > 0" class="text-center text-white q-my-sm">
                {{ formatDateRange(trip.dateRange) }} · {{ getDaysBetween() }}天
              </p>
            </div>
            <div class="col-auto">
              <q-btn flat round dense icon="edit" color="white" :to="`/trip/edit/${trip.id}`" />
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 2. 进度指示与进度展示 -->
    <div class="progress-container bg-white q-py-sm shadow-1">
      <div class="container">
        <div class="progress-bar">
          <div class="progress-value" :style="`width: ${completionPercentage}%`"></div>
        </div>
        <div class="text-caption text-center q-mt-xs">
          行程准备度: {{ completionPercentage }}%
        </div>
        <div class="progress-steps q-mt-md q-px-md hide-on-mobile">
          <div 
            v-for="(step, index) in progressSteps" 
            :key="index"
            class="step"
            :class="{'step-active': step.isCompleted}"
          >
            <div class="step-name">{{ step.name }}</div>
            <q-icon :name="step.isCompleted ? 'check_circle' : 'radio_button_unchecked'" 
                   :color="step.isCompleted ? 'positive' : 'grey-5'" />
          </div>
        </div>
      </div>
    </div>

    <!-- 主内容区 -->
    <div class="container q-py-lg">
      <div v-if="loading" class="flex flex-center q-pa-xl">
        <q-spinner-dots color="primary" size="80px" />
        <div class="text-subtitle1 q-ml-md">正在加载行程数据...</div>
      </div>
      
      <div v-else>
        <!-- 移动端导航标签 -->
        <div class="mobile-tabs q-mb-md" v-if="$q.screen.lt.md">
          <q-tabs
            v-model="mobileTab"
            dense
            class="bg-white"
            active-color="primary"
            indicator-color="primary"
            align="justify"
            narrow-indicator
          >
            <q-tab name="itinerary" icon="map" label="行程" />
            <q-tab name="budget" icon="account_balance_wallet" label="预算" />
            <q-tab name="todo" icon="checklist" label="清单" />
            <q-tab name="ai" icon="smart_toy" label="助手" />
          </q-tabs>
        </div>
      
        <!-- 桌面布局 - 两列 -->
        <div class="row q-col-gutter-md" v-if="$q.screen.gt.sm">
          <!-- 左侧信息栏 -->
          <div class="col-12 col-md-4">
            <!-- 基本信息卡片 -->
            <q-card class="info-card q-mb-md" bordered>
              <q-card-section class="bg-primary-1">
                <div class="text-h6 text-primary">
                  <q-icon name="info" class="q-mr-sm" />
                  行程信息
                </div>
              </q-card-section>
              
              <q-card-section>
                <div class="info-item">
                  <q-icon name="place" color="deep-orange" size="sm" />
                  <span class="info-label">目的地:</span>
                  <span class="info-value">{{ trip.destination }}</span>
                </div>
                
                <div class="info-item">
                  <q-icon name="event" color="green" size="sm" />
                  <span class="info-label">日期:</span>
                  <span class="info-value">{{ formatDateRange(trip.dateRange) }}</span>
                </div>
                
                <div class="info-item">
                  <q-icon name="people" color="purple" size="sm" />
                  <span class="info-label">人数:</span>
                  <span class="info-value">{{ trip.travelers }}人</span>
                </div>
                
                <div class="info-item">
                  <q-icon name="category" color="blue" size="sm" />
                  <span class="info-label">类型:</span>
                  <span class="info-value">{{ trip.tripType }}</span>
                </div>
                
                <div class="info-item" v-if="trip.description">
                  <q-icon name="description" color="teal" size="sm" />
                  <span class="info-label">描述:</span>
                  <div class="info-description q-mt-xs">{{ trip.description }}</div>
                </div>
              </q-card-section>
              
              <q-card-actions align="right">
                <q-btn flat color="primary" label="编辑信息" icon="edit" :to="`/trip/edit/${trip.id}`" />
              </q-card-actions>
            </q-card>
            
            <!-- 预算卡片 -->
            <q-card class="budget-card q-mb-md" bordered>
              <q-card-section class="bg-green-1">
                <div class="text-h6 text-green">
                  <q-icon name="account_balance_wallet" class="q-mr-sm" />
                  预算概览
                </div>
              </q-card-section>
              
              <q-card-section>
                <div class="budget-overview">
                  <div class="text-h5 text-weight-bold text-center text-primary">
                    {{ trip.budget.total.toLocaleString() }} {{ trip.budget.currency }}
                  </div>
                  <div class="text-caption text-center q-mb-md">总预算</div>
                  
                  <div class="row q-col-gutter-md">
                    <div class="col-6">
                      <q-card flat bordered class="budget-stat-card text-center q-pa-sm">
                        <div class="text-h6 text-positive">{{ getSpentBudget().toLocaleString() }}</div>
                        <div class="text-caption">已花费</div>
                      </q-card>
                    </div>
                    <div class="col-6">
                      <q-card flat bordered class="budget-stat-card text-center q-pa-sm">
                        <div class="text-h6 text-primary">{{ getRemainingBudget().toLocaleString() }}</div>
                        <div class="text-caption">剩余预算</div>
                      </q-card>
                    </div>
                  </div>
                </div>
                
                <q-linear-progress
                  :value="getBudgetProgressValue()"
                  size="15px"
                  :color="getBudgetProgressColor()"
                  track-color="grey-3"
                  class="q-mt-lg rounded-borders"
                >
                  <div class="absolute-full flex flex-center">
                    <q-badge color="white" text-color="black" :label="`${Math.round(getBudgetProgressValue() * 100)}%`" />
                  </div>
                </q-linear-progress>
                
                <div class="category-budget q-mt-lg">
                  <div class="text-subtitle2 q-mb-sm">预算分配</div>
                  
                  <div v-for="(category, index) in budgetCategories" :key="index" class="category-item q-mb-sm">
                    <div class="row items-center justify-between">
                      <div class="col-auto">
                        <q-avatar :color="getBudgetCategoryColor(category.id) + '-1'" :text-color="getBudgetCategoryColor(category.id)" size="sm">
                          <q-icon :name="category.icon" />
                        </q-avatar>
                        <span class="q-ml-sm">{{ category.name }}</span>
                      </div>
                      <div class="col-auto">
                        {{ trip.budget.categories[category.id].toLocaleString() }} {{ trip.budget.currency }}
                      </div>
                    </div>
                    <q-linear-progress
                      :value="getCategoryPercentage(category.id)"
                      size="5px"
                      :color="getBudgetCategoryColor(category.id)"
                      class="q-mt-xs"
                    />
                  </div>
                </div>
              </q-card-section>
              
              <q-card-actions align="right">
                <q-btn flat color="primary" label="查看详情" icon="visibility" @click="showBudgetDetails = true" />
              </q-card-actions>
            </q-card>
            
            <!-- 旅行清单 -->
            <q-card class="checklist-card" bordered>
              <q-card-section class="bg-blue-1">
                <div class="text-h6 text-blue">
                  <q-icon name="checklist" class="q-mr-sm" />
                  旅行清单
                </div>
              </q-card-section>
              
              <q-card-section>
                <div class="checklist-stats q-mb-md" v-if="trip.todoList.length > 0">
                  <q-linear-progress
                    :value="getCompletionRate()"
                    color="positive"
                    size="8px"
                    class="q-mb-xs"
                  />
                  <div class="text-caption text-center">
                    完成率: {{ Math.round(getCompletionRate() * 100) }}%
                    ({{ getCompletedItemsCount() }}/{{ trip.todoList.length }})
                  </div>
                </div>
                
                <div v-if="trip.todoList.length > 0" class="checklist-items">
                  <q-list separator>
                    <q-item
                      v-for="(item, index) in trip.todoList"
                      :key="index"
                      tag="label"
                      v-ripple
                      :class="{'completed-item': item.done}"
                    >
                      <q-item-section side>
                        <q-checkbox v-model="item.done" color="primary" @update:model-value="updateTodoItem" />
                      </q-item-section>
                      <q-item-section>
                        <q-item-label :class="{'text-strike': item.done}">{{ item.text }}</q-item-label>
                      </q-item-section>
                    </q-item>
                  </q-list>
                </div>
                
                <div v-else class="text-center q-pa-md">
                  <q-icon name="checklist" size="2rem" color="grey-5" />
                  <div class="text-grey q-mt-sm">暂无待办事项</div>
                </div>
              </q-card-section>
              
              <q-card-actions align="right">
                <q-btn flat color="primary" label="编辑清单" icon="edit" :to="`/trip/edit/${trip.id}?tab=4`" />
              </q-card-actions>
            </q-card>
          </div>
          
          <!-- 右侧内容区 -->
          <div class="col-12 col-md-8">
            <!-- 行程安排 -->
            <q-card class="itinerary-card q-mb-md" bordered>
              <q-card-section class="bg-primary-1">
                <div class="row items-center justify-between">
                  <div class="text-h6 text-primary">
                    <q-icon name="map" class="q-mr-sm" />
                    行程安排
                  </div>
                  
                  <div>
                    <q-btn
                      flat
                      round
                      size="sm"
                      :icon="itineraryView === 'list' ? 'calendar_month' : 'view_list'"
                      color="primary"
                      @click="toggleItineraryView()"
                      :title="itineraryView === 'list' ? '切换到日历视图' : '切换到列表视图'"
                    />
                  </div>
                </div>
              </q-card-section>
              
              <q-separator />
              
              <!-- 日历视图 -->
              <q-card-section v-if="itineraryView === 'calendar'" class="calendar-view">
                <div class="calendar-header row q-mb-sm">
                  <div 
                    v-for="(day, index) in days" 
                    :key="index"
                    class="col calendar-day-header text-center"
                  >
                    <div class="text-subtitle1 text-weight-medium">第{{ index + 1 }}天</div>
                    <div class="text-caption">{{ formatDate(day.date) }}</div>
                  </div>
                </div>
                
                <div class="calendar-body">
                  <div class="row" style="min-height: 400px">
                    <div 
                      v-for="(day, dayIndex) in days" 
                      :key="dayIndex"
                      class="col calendar-day"
                    >
                      <div 
                        v-for="(timeSlot, timeIndex) in timeSlots" 
                        :key="timeIndex"
                        class="calendar-timeslot"
                      >
                        <div class="timeslot-time text-caption text-grey-8">{{ timeSlot }}</div>
                        
                        <div class="timeslot-content">
                          <div 
                            v-for="(activity, actIndex) in getActivitiesForTimeSlot(day.activities, timeSlot)"
                            :key="actIndex"
                            class="activity-item"
                            :class="`activity-${getActivityTypeClass(activity.type)}`"
                            @click="showActivityDetails(dayIndex, findActivityIndex(day.activities, activity))"
                          >
                            <div class="activity-time text-caption">{{ activity.time }}</div>
                            <div class="activity-name text-body2">{{ activity.name }}</div>
                            <div v-if="activity.location" class="activity-location text-caption">
                              <q-icon name="place" size="xs" /> {{ activity.location }}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </q-card-section>
              
              <!-- 列表视图 -->
              <q-card-section v-else-if="itineraryView === 'list'" class="q-pa-none">
                <q-tabs
                  v-model="selectedDay"
                  dense
                  class="text-grey"
                  active-color="primary"
                  indicator-color="primary"
                  align="justify"
                  narrow-indicator
                >
                  <q-tab 
                    v-for="(day, index) in days" 
                    :key="index"
                    :name="index"
                    :label="`第${index + 1}天`"
                  />
                </q-tabs>
                
                <q-separator />
                
                <q-tab-panels v-model="selectedDay" animated>
                  <q-tab-panel v-for="(day, index) in days" :key="index" :name="index" class="q-pa-none">
                    <div class="text-subtitle1 q-pa-md bg-grey-1">
                      {{ formatDate(day.date) }}
                    </div>
                    
                    <q-list separator>
                      <q-item 
                        v-for="(activity, actIndex) in day.activities.sort((a, b) => a.time.localeCompare(b.time))" 
                        :key="actIndex"
                        clickable
                        v-ripple
                        @click="showActivityDetails(index, actIndex)"
                        :class="`activity-item-${getActivityTypeClass(activity.type)}`"
                      >
                        <q-item-section avatar>
                          <q-avatar :color="`${getActivityColor(activity.type)}-2`" :text-color="getActivityColor(activity.type)">
                            <q-icon :name="getActivityIcon(activity.type)" />
                          </q-avatar>
                        </q-item-section>
                        
                        <q-item-section>
                          <q-item-label>{{ activity.name }}</q-item-label>
                          <q-item-label caption lines="2">
                            <div class="row items-center q-gutter-x-sm">
                              <div><q-icon name="access_time" size="xs" /> {{ activity.time }}</div>
                              <div v-if="activity.location"><q-icon name="place" size="xs" /> {{ activity.location }}</div>
                            </div>
                          </q-item-label>
                        </q-item-section>
                        
                        <q-item-section side>
                          <q-icon name="chevron_right" color="grey-5" />
                        </q-item-section>
                      </q-item>
                    </q-list>
                    
                    <div v-if="day.activities.length === 0" class="text-center q-pa-lg">
                      <q-icon name="event_busy" size="2rem" color="grey-5" />
                      <div class="text-grey q-mt-sm">当天暂无安排</div>
                    </div>
                  </q-tab-panel>
                </q-tab-panels>
              </q-card-section>
              
              <q-card-actions align="right">
                <q-btn flat color="primary" label="编辑行程" icon="edit" :to="`/trip/edit/${trip.id}?tab=2`" />
              </q-card-actions>
            </q-card>
            
            <!-- 智能建议系统 -->
            <q-card class="recommendations-card q-mb-md" bordered>
              <q-card-section class="bg-purple-1">
                <div class="text-h6 text-purple">
                  <q-icon name="lightbulb" class="q-mr-sm" />
                  智能建议
                </div>
              </q-card-section>
              
              <q-card-section>
                <div v-if="recommendations.length > 0">
                  <q-list>
                    <q-item 
                      v-for="(recommendation, index) in recommendations" 
                      :key="index"
                      class="recommendation-item"
                      :class="`recommendation-${recommendation.type}`"
                    >
                      <q-item-section avatar>
                        <q-avatar :color="getRecommendationColor(recommendation.type)">
                          <q-icon :name="getRecommendationIcon(recommendation.type)" color="white" />
                        </q-avatar>
                      </q-item-section>
                      
                      <q-item-section>
                        <q-item-label>{{ recommendation.content }}</q-item-label>
                      </q-item-section>
                      
                      <q-item-section side>
                        <div class="row q-gutter-xs">
                          <q-btn flat round dense icon="thumb_up" color="positive" @click="acceptRecommendation(index)" />
                          <q-btn flat round dense icon="thumb_down" color="negative" @click="dismissRecommendation(index)" />
                        </div>
                      </q-item-section>
                    </q-item>
                  </q-list>
                </div>
                
                <div v-else class="text-center q-pa-lg">
                  <q-icon name="lightbulb" size="2rem" color="grey-5" />
                  <div class="text-grey q-mt-sm">暂无智能建议</div>
                </div>
              </q-card-section>
            </q-card>
            
            <!-- AI助手交互区域 -->
            <q-card class="ai-assistant-card" bordered>
              <q-card-section class="bg-blue-1">
                <div class="text-h6 text-blue">
                  <q-icon name="smart_toy" class="q-mr-sm" />
                  旅行助手
                </div>
              </q-card-section>
              
              <q-card-section>
                <div class="ai-response q-mb-md" v-if="aiResponse">
                  <div class="row no-wrap">
                    <q-avatar color="primary" text-color="white" icon="smart_toy" size="md" class="q-mr-md self-start" />
                    <div class="ai-message bg-grey-2 rounded-borders q-pa-md">{{ aiResponse }}</div>
                  </div>
                </div>
                
                <div class="ai-query">
                  <q-input 
                    v-model="aiQuery" 
                    filled 
                    placeholder="询问任何与行程相关的问题..."
                    @keyup.enter="submitAiQuery"
                    class="custom-input"
                  >
                    <template v-slot:append>
                      <q-btn round dense flat icon="send" color="primary" @click="submitAiQuery" />
                    </template>
                  </q-input>
                </div>
                
                <div class="ai-suggestions q-mt-md">
                  <div class="text-caption q-mb-xs">常见问题:</div>
                  <div class="row q-col-gutter-sm wrap">
                    <div class="col-auto" v-for="(suggestion, index) in aiSuggestions" :key="index">
                      <q-chip
                        clickable
                        color="primary-1"
                        text-color="primary"
                        @click="useAiSuggestion(suggestion)"
                        class="suggestion-chip"
                      >
                        {{ suggestion }}
                      </q-chip>
                    </div>
                  </div>
                </div>
              </q-card-section>
            </q-card>
          </div>
        </div>
        
        <!-- 移动端布局 - 选项卡切换 -->
        <div v-if="$q.screen.lt.md">
          <q-tab-panels v-model="mobileTab" animated class="transparent" keep-alive>
            <!-- 行程面板 -->
            <q-tab-panel name="itinerary" class="q-pa-none">
              <!-- 基本信息卡片 - 移动端简化版 -->
              <q-card class="info-card q-mb-md" flat bordered>
                <q-card-section class="q-pa-sm">
                  <div class="row q-col-gutter-sm">
                    <div class="col-6">
                      <div class="mobile-info-item">
                        <q-icon name="place" color="deep-orange" size="sm" />
                        <div class="info-label">目的地</div>
                        <div class="info-value">{{ trip.destination }}</div>
                      </div>
                    </div>
                    <div class="col-6">
                      <div class="mobile-info-item">
                        <q-icon name="people" color="purple" size="sm" />
                        <div class="info-label">人数</div>
                        <div class="info-value">{{ trip.travelers }}人</div>
                      </div>
                    </div>
                    <div class="col-6">
                      <div class="mobile-info-item">
                        <q-icon name="event" color="green" size="sm" />
                        <div class="info-label">类型</div>
                        <div class="info-value">{{ trip.tripType }}</div>
                      </div>
                    </div>
                    <div class="col-6">
                      <div class="mobile-info-item">
                        <q-icon name="date_range" color="blue" size="sm" />
                        <div class="info-label">天数</div>
                        <div class="info-value">{{ getDaysBetween() }}天</div>
                      </div>
                    </div>
                  </div>
                </q-card-section>
              </q-card>
              
              <!-- 行程安排 -->
              <q-card class="itinerary-card q-mb-md" flat bordered>
                <q-card-section class="bg-primary-1 q-py-sm">
                  <div class="row items-center justify-between">
                    <div class="text-subtitle1 text-primary">
                      <q-icon name="map" class="q-mr-xs" />
                      行程安排
                    </div>
                    
                    <div>
                      <q-btn
                        flat
                        round
                        size="sm"
                        :icon="itineraryView === 'list' ? 'calendar_month' : 'view_list'"
                        color="primary"
                        @click="toggleItineraryView()"
                        :title="itineraryView === 'list' ? '切换到日历视图' : '切换到列表视图'"
                      />
                    </div>
                  </div>
                </q-card-section>
                
                <q-separator />
                
                <!-- 移动端日历视图 - 滚动式 -->
                <q-card-section v-if="itineraryView === 'calendar'" class="calendar-view-mobile">
                  <!-- 使用与列表视图相同的 q-tabs 组件 -->
                  <q-tabs
                    v-model="selectedDay"
                    dense
                    class="text-grey"
                    active-color="primary"
                    indicator-color="primary"
                    align="justify"
                    narrow-indicator
                    scrollable
                  >
                    <q-tab 
                      v-for="(day, index) in days" 
                      :key="index"
                      :name="index"
                      :label="`第${index + 1}天`"
                    />
                  </q-tabs>
                  
                  <div class="text-subtitle1 q-pa-md bg-grey-1">
                    {{ days[selectedDay] ? formatDate(days[selectedDay].date) : '' }}
                  </div>
                  
                  <div class="calendar-day-activities" v-if="days[selectedDay]">
                    <div 
                      v-for="(timeSlot, timeIndex) in timeSlots" 
                      :key="timeIndex"
                      class="calendar-timeslot-mobile"
                    >
                      <div class="timeslot-time text-caption text-grey-8">{{ timeSlot }}</div>
                      
                      <div class="timeslot-content">
                        <div 
                          v-for="(activity, actIndex) in getActivitiesForTimeSlot(days[selectedDay].activities, timeSlot)"
                          :key="actIndex"
                          class="activity-item"
                          :class="`activity-${getActivityTypeClass(activity.type)}`"
                          @click="showActivityDetails(selectedDay, findActivityIndex(days[selectedDay].activities, activity))"
                        >
                          <div class="activity-time text-caption">{{ activity.time }}</div>
                          <div class="activity-name text-body2">{{ activity.name }}</div>
                          <div v-if="activity.location" class="activity-location text-caption">
                            <q-icon name="place" size="xs" /> {{ activity.location }}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </q-card-section>
                
                <!-- 移动端列表视图 -->
                <q-card-section v-else-if="itineraryView === 'list'" class="q-pa-none">
                  <q-tabs
                    v-model="selectedDay"
                    dense
                    class="text-grey"
                    active-color="primary"
                    indicator-color="primary"
                    align="justify"
                    narrow-indicator
                    scrollable
                  >
                    <q-tab 
                      v-for="(day, index) in days" 
                      :key="index"
                      :name="index"
                      :label="`第${index + 1}天`"
                    />
                  </q-tabs>
                  
                  <q-separator />
                  
                  <q-tab-panels v-model="selectedDay" animated>
                    <q-tab-panel v-for="(day, index) in days" :key="index" :name="index" class="q-pa-none">
                      <div class="text-subtitle1 q-pa-md bg-grey-1">
                        {{ formatDate(day.date) }}
                      </div>
                      
                      <q-list separator>
                        <q-item 
                          v-for="(activity, actIndex) in day.activities.sort((a, b) => a.time.localeCompare(b.time))" 
                          :key="actIndex"
                          clickable
                          v-ripple
                          @click="showActivityDetails(index, actIndex)"
                          :class="`activity-item-${getActivityTypeClass(activity.type)}`"
                        >
                          <q-item-section avatar>
                            <q-avatar :color="`${getActivityColor(activity.type)}-2`" :text-color="getActivityColor(activity.type)">
                              <q-icon :name="getActivityIcon(activity.type)" />
                            </q-avatar>
                          </q-item-section>
                          
                          <q-item-section>
                            <q-item-label>{{ activity.name }}</q-item-label>
                            <q-item-label caption lines="2">
                              <div class="row items-center q-gutter-x-sm">
                                <div><q-icon name="access_time" size="xs" /> {{ activity.time }}</div>
                                <div v-if="activity.location"><q-icon name="place" size="xs" /> {{ activity.location }}</div>
                              </div>
                            </q-item-label>
                          </q-item-section>
                          
                          <q-item-section side>
                            <q-icon name="chevron_right" color="grey-5" />
                          </q-item-section>
                        </q-item>
                      </q-list>
                      
                      <div v-if="day.activities.length === 0" class="text-center q-pa-lg">
                        <q-icon name="event_busy" size="2rem" color="grey-5" />
                        <div class="text-grey q-mt-sm">当天暂无安排</div>
                      </div>
                    </q-tab-panel>
                  </q-tab-panels>
                </q-card-section>
              </q-card>
            </q-tab-panel>
            
            <!-- 预算面板 -->
            <q-tab-panel name="budget" class="q-pa-none">
              <q-card class="budget-card q-mb-md" flat bordered>
                <q-card-section class="bg-green-1 q-py-sm">
                  <div class="text-subtitle1 text-green">
                    <q-icon name="account_balance_wallet" class="q-mr-xs" />
                    预算概览
                  </div>
                </q-card-section>
                
                <q-card-section>
                  <div class="budget-overview">
                    <div class="text-h5 text-weight-bold text-center text-primary">
                      {{ trip.budget.total.toLocaleString() }} {{ trip.budget.currency }}
                    </div>
                    <div class="text-caption text-center q-mb-md">总预算</div>
                    
                    <div class="row q-col-gutter-md">
                      <div class="col-6">
                        <q-card flat bordered class="budget-stat-card text-center q-pa-sm">
                          <div class="text-h6 text-positive">{{ getSpentBudget().toLocaleString() }}</div>
                          <div class="text-caption">已花费</div>
                        </q-card>
                      </div>
                      <div class="col-6">
                        <q-card flat bordered class="budget-stat-card text-center q-pa-sm">
                          <div class="text-h6 text-primary">{{ getRemainingBudget().toLocaleString() }}</div>
                          <div class="text-caption">剩余预算</div>
                        </q-card>
                      </div>
                    </div>
                  </div>
                  
                  <q-linear-progress
                    :value="getBudgetProgressValue()"
                    size="15px"
                    :color="getBudgetProgressColor()"
                    track-color="grey-3"
                    class="q-mt-lg rounded-borders"
                  >
                    <div class="absolute-full flex flex-center">
                      <q-badge color="white" text-color="black" :label="`${Math.round(getBudgetProgressValue() * 100)}%`" />
                    </div>
                  </q-linear-progress>
                  
                  <div class="category-budget q-mt-lg">
                    <div class="text-subtitle2 q-mb-sm">预算分配</div>
                    
                    <div v-for="(category, index) in budgetCategories" :key="index" class="category-item q-mb-sm">
                      <div class="row items-center justify-between">
                        <div class="col-auto">
                          <q-avatar :color="getBudgetCategoryColor(category.id) + '-1'" :text-color="getBudgetCategoryColor(category.id)" size="sm">
                            <q-icon :name="category.icon" />
                          </q-avatar>
                          <span class="q-ml-sm">{{ category.name }}</span>
                        </div>
                        <div class="col-auto">
                          {{ trip.budget.categories[category.id].toLocaleString() }} {{ trip.budget.currency }}
                        </div>
                      </div>
                      <q-linear-progress
                        :value="getCategoryPercentage(category.id)"
                        size="5px"
                        :color="getBudgetCategoryColor(category.id)"
                        class="q-mt-xs"
                      />
                    </div>
                  </div>
                </q-card-section>
                
                <q-card-actions align="right">
                  <q-btn flat color="primary" label="编辑预算" icon="edit" :to="`/trip/edit/${trip.id}?tab=3`" />
                </q-card-actions>
              </q-card>
            </q-tab-panel>
            
            <!-- 清单面板 -->
            <q-tab-panel name="todo" class="q-pa-none">
              <q-card class="checklist-card" flat bordered>
                <q-card-section class="bg-blue-1 q-py-sm">
                  <div class="text-subtitle1 text-blue">
                    <q-icon name="checklist" class="q-mr-xs" />
                    旅行清单
                  </div>
                </q-card-section>
                
                <q-card-section>
                  <div class="checklist-stats q-mb-md" v-if="trip.todoList.length > 0">
                    <q-linear-progress
                      :value="getCompletionRate()"
                      color="positive"
                      size="8px"
                      class="q-mb-xs"
                    />
                    <div class="text-caption text-center">
                      完成率: {{ Math.round(getCompletionRate() * 100) }}%
                      ({{ getCompletedItemsCount() }}/{{ trip.todoList.length }})
                    </div>
                  </div>
                  
                  <div v-if="trip.todoList.length > 0" class="checklist-items">
                    <q-list separator>
                      <q-item
                        v-for="(item, index) in trip.todoList"
                        :key="index"
                        tag="label"
                        v-ripple
                        :class="{'completed-item': item.done}"
                      >
                        <q-item-section side>
                          <q-checkbox v-model="item.done" color="primary" @update:model-value="updateTodoItem" />
                        </q-item-section>
                        <q-item-section>
                          <q-item-label :class="{'text-strike': item.done}">{{ item.text }}</q-item-label>
                        </q-item-section>
                      </q-item>
                    </q-list>
                  </div>
                  
                  <div v-else class="text-center q-pa-md">
                    <q-icon name="checklist" size="2rem" color="grey-5" />
                    <div class="text-grey q-mt-sm">暂无待办事项</div>
                  </div>
                </q-card-section>
                
                <q-card-actions align="right">
                  <q-btn flat color="primary" label="编辑清单" icon="edit" :to="`/trip/edit/${trip.id}?tab=4`" />
                </q-card-actions>
              </q-card>
            </q-tab-panel>
            
            <!-- 助手面板 -->
            <q-tab-panel name="ai" class="q-pa-none">
              <q-card class="ai-assistant-card" flat bordered>
                <q-card-section class="bg-blue-1 q-py-sm">
                  <div class="text-subtitle1 text-blue">
                    <q-icon name="smart_toy" class="q-mr-xs" />
                    旅行助手
                  </div>
                </q-card-section>
                
                <q-card-section>
                  <div class="ai-response q-mb-md" v-if="aiResponse">
                    <div class="row no-wrap">
                      <q-avatar color="primary" text-color="white" icon="smart_toy" size="md" class="q-mr-md self-start" />
                      <div class="ai-message bg-grey-2 rounded-borders q-pa-md">{{ aiResponse }}</div>
                    </div>
                  </div>
                  
                  <div class="ai-query">
                    <q-input 
                      v-model="aiQuery" 
                      filled 
                      placeholder="询问任何与行程相关的问题..."
                      @keyup.enter="submitAiQuery"
                      class="custom-input"
                    >
                      <template v-slot:append>
                        <q-btn round dense flat icon="send" color="primary" @click="submitAiQuery" />
                      </template>
                    </q-input>
                  </div>
                  
                  <div class="ai-suggestions q-mt-md">
                    <div class="text-caption q-mb-xs">常见问题:</div>
                    <div class="row q-col-gutter-sm wrap">
                      <div class="col-auto" v-for="(suggestion, index) in aiSuggestions" :key="index">
                        <q-chip
                          clickable
                          color="primary-1"
                          text-color="primary"
                          @click="useAiSuggestion(suggestion)"
                          class="suggestion-chip"
                        >
                          {{ suggestion }}
                        </q-chip>
                      </div>
                    </div>
                  </div>
                </q-card-section>
              </q-card>
              
              <!-- 智能建议系统 - 移动端版本 -->
              <q-card class="recommendations-card q-mt-md" flat bordered>
                <q-card-section class="bg-purple-1 q-py-sm">
                  <div class="text-subtitle1 text-purple">
                    <q-icon name="lightbulb" class="q-mr-xs" />
                    智能建议
                  </div>
                </q-card-section>
                
                <q-card-section>
                  <div v-if="recommendations.length > 0">
                    <q-list>
                      <q-item 
                        v-for="(recommendation, index) in recommendations" 
                        :key="index"
                        class="recommendation-item"
                        :class="`recommendation-${recommendation.type}`"
                      >
                        <q-item-section avatar>
                          <q-avatar :color="getRecommendationColor(recommendation.type)">
                            <q-icon :name="getRecommendationIcon(recommendation.type)" color="white" />
                          </q-avatar>
                        </q-item-section>
                        
                        <q-item-section>
                          <q-item-label>{{ recommendation.content }}</q-item-label>
                        </q-item-section>
                        
                        <q-item-section side>
                          <div class="row q-gutter-xs">
                            <q-btn flat round dense icon="thumb_up" color="positive" @click="acceptRecommendation(index)" />
                            <q-btn flat round dense icon="thumb_down" color="negative" @click="dismissRecommendation(index)" />
                          </div>
                        </q-item-section>
                      </q-item>
                    </q-list>
                  </div>
                  
                  <div v-else class="text-center q-pa-md">
                    <q-icon name="lightbulb" size="2rem" color="grey-5" />
                    <div class="text-grey q-mt-sm">暂无智能建议</div>
                  </div>
                </q-card-section>
              </q-card>
            </q-tab-panel>
          </q-tab-panels>
        </div>
      </div>
    </div>
    
    <!-- 活动详情对话框 -->
    <q-dialog v-model="activityDialog.show" persistent>
      <q-card style="min-width: 350px; max-width: 95vw">
        <q-card-section :class="`bg-${getActivityColor(activityDialog.activity.type)} text-white`">
          <div class="text-h6">
            <q-icon :name="getActivityIcon(activityDialog.activity.type)" class="q-mr-sm" />
            {{ activityDialog.activity.name }}
          </div>
          <div class="text-subtitle2">
            第{{ activityDialog.dayIndex + 1 }}天 · {{ formatDate(days[activityDialog.dayIndex]?.date) }}
          </div>
        </q-card-section>

        <q-card-section class="q-pt-md">
          <div class="row q-col-gutter-md">
            <div class="col-12 col-sm-6">
              <div class="text-caption text-grey">时间</div>
              <div class="text-subtitle1">
                <q-icon name="access_time" size="xs" /> {{ activityDialog.activity.time }}
              </div>
            </div>
            
            <div class="col-12 col-sm-6" v-if="activityDialog.activity.location">
              <div class="text-caption text-grey">地点</div>
              <div class="text-subtitle1">
                <q-icon name="place" size="xs" /> {{ activityDialog.activity.location }}
              </div>
            </div>
            
            <div class="col-12" v-if="activityDialog.activity.note">
              <div class="text-caption text-grey">备注</div>
              <div class="text-body1">{{ activityDialog.activity.note }}</div>
            </div>
          </div>
        </q-card-section>

        <q-card-actions align="right">
          <q-btn flat label="关闭" color="primary" v-close-popup />
          <q-btn flat label="编辑" color="primary" :to="`/trip/edit/${trip.id}?tab=2&day=${activityDialog.dayIndex}`" />
        </q-card-actions>
      </q-card>
    </q-dialog>
    
    <!-- 清单详情对话框 -->
    <q-dialog v-model="showTodoListDialog">
      <q-card style="width: 95vw; max-width: 600px">
        <q-card-section class="bg-blue-1">
          <div class="text-h6 text-blue">旅行清单</div>
        </q-card-section>
        
        <q-card-section>
          <div class="checklist-stats q-mb-md" v-if="trip.todoList.length > 0">
            <q-linear-progress
              :value="getCompletionRate()"
              color="positive"
              size="8px"
              class="q-mb-xs"
            />
            <div class="text-caption text-center">
              完成率: {{ Math.round(getCompletionRate() * 100) }}%
              ({{ getCompletedItemsCount() }}/{{ trip.todoList.length }})
            </div>
          </div>
          
          <q-list separator>
            <q-item
              v-for="(item, index) in trip.todoList"
              :key="index"
              tag="label"
              v-ripple
              :class="{'completed-item': item.done}"
            >
              <q-item-section side>
                <q-checkbox v-model="item.done" color="primary" @update:model-value="updateTodoItem" />
              </q-item-section>
              <q-item-section>
                <q-item-label :class="{'text-strike': item.done}">{{ item.text }}</q-item-label>
              </q-item-section>
            </q-item>
          </q-list>
        </q-card-section>
        
        <q-card-actions align="right">
          <q-btn flat label="关闭" color="primary" v-close-popup />
          <q-btn flat label="编辑清单" icon="edit" color="primary" :to="`/trip/edit/${trip.id}?tab=4`" v-close-popup />
        </q-card-actions>
      </q-card>
    </q-dialog>
    
    <!-- 预算详情对话框 -->
    <q-dialog v-model="showBudgetDetails">
      <q-card style="width: 95vw; max-width: 600px">
        <q-card-section class="bg-green-1">
          <div class="text-h6 text-green">预算详情</div>
        </q-card-section>
        
        <q-card-section>
          <div class="text-h5 text-weight-bold text-center q-mb-lg">
            {{ trip.budget.total.toLocaleString() }} {{ trip.budget.currency }}
            <div class="text-caption">总预算</div>
          </div>
          
          <div class="row q-col-gutter-md q-mb-lg">
            <div class="col-6">
              <q-card flat bordered class="text-center q-pa-md">
                <div class="text-h6 text-positive">{{ getSpentBudget().toLocaleString() }}</div>
                <div class="text-caption">已花费</div>
              </q-card>
            </div>
            <div class="col-6">
              <q-card flat bordered class="text-center q-pa-md">
                <div class="text-h6 text-primary">{{ getRemainingBudget().toLocaleString() }}</div>
                <div class="text-caption">剩余预算</div>
              </q-card>
            </div>
          </div>
          
          <div class="text-subtitle1 q-mb-md">预算分配</div>
          
          <div v-for="(category, index) in budgetCategories" :key="index" class="q-mb-md">
            <div class="row items-center justify-between q-mb-xs">
              <div class="col-auto">
                <q-avatar :color="getBudgetCategoryColor(category.id) + '-1'" :text-color="getBudgetCategoryColor(category.id)" size="sm">
                  <q-icon :name="category.icon" />
                </q-avatar>
                <span class="q-ml-sm">{{ category.name }}</span>
              </div>
              <div class="col-auto">
                {{ trip.budget.categories[category.id].toLocaleString() }} {{ trip.budget.currency }}
              </div>
            </div>
            <q-linear-progress
              :value="getCategoryPercentage(category.id)"
              size="8px"
              :color="getBudgetCategoryColor(category.id)"
            />
          </div>
        </q-card-section>
        
        <q-card-actions align="right">
          <q-btn flat label="关闭" color="primary" v-close-popup />
          <q-btn flat label="编辑预算" icon="edit" color="primary" :to="`/trip/edit/${trip.id}?tab=3`" v-close-popup />
        </q-card-actions>
      </q-card>
    </q-dialog>
  </q-page>
</template>

<script>
export default {
  name: 'TripDetailPage',
  data() {
    return {
      tripId: null,
      loading: true,
      completionPercentage: 75,
      itineraryView: 'list',
      selectedDay: 0,
      mobileTab: 'itinerary',
      maxDisplayTodoItems: 4,
      aiQuery: '',
      aiResponse: '',
      showTodoListDialog: false,
      showBudgetDetails: false,
      showRecommendationsDialog: false,
      timeSlots: ['08:00', '10:00', '12:00', '14:00', '16:00', '18:00', '20:00'],
      progressSteps: [
        { name: '计划', isCompleted: true },
        { name: '预订', isCompleted: true },
        { name: '准备', isCompleted: false },
        { name: '出发', isCompleted: false }
      ],
      budgetCategories: [
        { id: 'transportation', name: '交通', icon: 'directions_bus' },
        { id: 'accommodation', name: '住宿', icon: 'hotel' },
        { id: 'food', name: '餐饮', icon: 'restaurant' },
        { id: 'activities', name: '活动', icon: 'event' }
      ],
      aiSuggestions: [
        '附近有哪些好评餐厅?',
        '如何优化我的行程安排?',
        '当地有什么特色活动?',
        '如何节省预算?'
      ],
      activityDialog: {
        show: false,
        dayIndex: 0,
        activity: {}
      },
      trip: {
        id: '',
        name: '',
        destination: '',
        dateRange: {
          from: '',
          to: ''
        },
        travelers: 0,
        tripType: '',
        description: '',
        budget: {
          total: 0,
          currency: '¥',
          spentAmount: 0,
          categories: {
            transportation: 0,
            accommodation: 0,
            food: 0,
            activities: 0
          }
        },
        todoList: []
      },
      days: [],
      recommendations: []
    }
  },
  computed: {
    headerStyle() {
      let bgImage = 'https://images.unsplash.com/photo-1452421822248-d4c2b47f0c81?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80';
      
      if (this.trip.destination) {
        const destinationMap = {
          '东京': 'https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80',
          '北京': 'https://images.unsplash.com/photo-1599571234909-27943af8aada?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80',
          '巴黎': 'https://images.unsplash.com/photo-1502602898657-3e91760cbb34?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80',
          '纽约': 'https://images.unsplash.com/photo-1496442226666-8d4d0e62e6e9?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80',
        };
        
        if (destinationMap[this.trip.destination]) {
          bgImage = destinationMap[this.trip.destination];
        }
      }
      
      return {
        backgroundImage: `url(${bgImage})`
      };
    }
  },
  mounted() {
    this.initTripData();
  },
  methods: {
    async initTripData() {
      this.tripId = this.$route.params.id;
      
      if (!this.tripId) {
        this.$q.notify({
          color: 'negative',
          message: '未找到行程ID',
          icon: 'error',
          position: 'top'
        });
        this.$router.push('/trip');
        return;
      }
      
      await this.fetchTripData();
    },
    async fetchTripData() {
      try {
        this.loading = true;
        
        // 模拟API请求延迟
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // 加载模拟数据
        this.loadMockData();
        
        // 设置页面标题
        document.title = `${this.trip.name} - 行程详情`;
        
        this.calculateCompletionPercentage();
        this.generateRecommendations();
        
        this.loading = false;
      } catch (error) {
        console.error('获取行程数据失败:', error);
        this.$q.notify({
          color: 'negative',
          message: '获取行程数据失败，请重试',
          icon: 'error',
          position: 'top'
        });
        this.loading = false;
      }
    },
    loadMockData() {
      this.trip = {
        id: this.tripId,
        name: '日本东京之旅',
        destination: '东京',
        dateRange: {
          from: '2023-08-15',
          to: '2023-08-20'
        },
        travelers: 2,
        tripType: '情侣旅行',
        description: '这是一次情侣东京旅行，计划游览主要景点和体验当地美食文化。',
        budget: {
          total: 15000,
          currency: '¥',
          spentAmount: 5600,
          categories: {
            transportation: 4000,
            accommodation: 5000,
            food: 3000,
            activities: 3000
          }
        },
        todoList: [
          { text: '预订机票', done: true },
          { text: '预订酒店', done: true },
          { text: '兑换日元', done: false },
          { text: '购买电源转换器', done: false },
          { text: '准备护照和签证', done: true },
          { text: '购买旅行保险', done: false },
          { text: '下载离线地图', done: true }
        ]
      };
      
      this.days = [
        {
          date: '2023-08-15',
          activities: [
            {
              name: '抵达东京',
              time: '14:30',
              location: '成田国际机场',
              type: '交通出行',
              note: '预定接机服务'
            },
            {
              name: '酒店入住',
              time: '16:00',
              location: '新宿希尔顿酒店',
              type: '住宿安排',
              note: '提前确认预订'
            },
            {
              name: '晚餐',
              time: '18:30',
              location: '新宿站附近拉面店',
              type: '餐饮美食',
              note: '品尝当地特色拉面'
            }
          ]
        },
        {
          date: '2023-08-16',
          activities: [
            {
              name: '早餐',
              time: '08:00',
              location: '酒店餐厅',
              type: '餐饮美食',
              note: ''
            },
            {
              name: '游览浅草寺',
              time: '10:00',
              location: '浅草寺',
              type: '景点游览',
              note: '参观东京最古老的寺庙'
            },
            {
              name: '午餐',
              time: '12:30',
              location: '浅草附近餐厅',
              type: '餐饮美食',
              note: '尝试当地小吃'
            },
            {
              name: '东京晴空塔',
              time: '14:30',
              location: '晴空塔',
              type: '景点游览',
              note: '登顶观赏东京全景'
            }
          ]
        },
        {
          date: '2023-08-17',
          activities: [
            {
              name: '早餐',
              time: '08:30',
              location: '酒店餐厅',
              type: '餐饮美食',
              note: ''
            },
            {
              name: '游览明治神宫',
              time: '10:30',
              location: '明治神宫',
              type: '景点游览',
              note: '体验日本传统神社文化'
            }
          ]
        },
        {
          date: '2023-08-18',
          activities: []
        },
        {
          date: '2023-08-19',
          activities: [
            {
              name: '购物',
              time: '10:00',
              location: '银座',
              type: '购物娱乐',
              note: '购买伴手礼'
            }
          ]
        },
        {
          date: '2023-08-20',
          activities: [
            {
              name: '退房',
              time: '10:00',
              location: '酒店',
              type: '住宿安排',
              note: ''
            },
            {
              name: '返程',
              time: '15:30',
              location: '成田国际机场',
              type: '交通出行',
              note: '提前3小时到达机场'
            }
          ]
        }
      ];
    },
    generateRecommendations() {
      // 分析行程数据，生成智能建议
      this.recommendations = [
        {
          type: 'time-saving',
          content: '您的第二天行程过于紧凑，建议调整下午的活动时间或减少一个景点。'
        },
        {
          type: 'budget',
          content: '餐饮预算可能超支，建议寻找更多经济型餐厅选择。'
        },
        {
          type: 'weather',
          content: '行程第三天可能有雨，建议准备室内备选方案或雨具。'
        },
        {
          type: 'activity',
          content: '第四天暂无安排，建议添加东京迪士尼乐园或台场购物中心游览。'
        }
      ];
    },
    calculateCompletionPercentage() {
      // 计算行程完成度
      let steps = 0;
      let completed = 0;
      
      // 计算基本信息完成度
      if (this.trip.name && this.trip.destination && this.trip.dateRange.from && this.trip.dateRange.to) {
        completed += 1;
      }
      steps += 1;
      
      // 计算行程安排完成度
      const totalDays = this.getDaysBetween();
      let daysWithActivities = 0;
      this.days.forEach(day => {
        if (day.activities.length > 0) {
          daysWithActivities += 1;
        }
      });
      
      if (daysWithActivities > 0) {
        completed += (daysWithActivities / totalDays);
      }
      steps += 1;
      
      // 计算预算完成度
      if (this.trip.budget.total > 0) {
        completed += 1;
      }
      steps += 1;
      
      // 计算清单完成度
      if (this.trip.todoList.length > 0) {
        completed += (this.getCompletedItemsCount() / this.trip.todoList.length);
      }
      steps += 1;
      
      this.completionPercentage = Math.round((completed / steps) * 100);
    },
    getDaysBetween() {
      if (!this.trip.dateRange || !this.trip.dateRange.from || !this.trip.dateRange.to) {
        return 0;
      }
      
      const fromDate = new Date(this.trip.dateRange.from);
      const toDate = new Date(this.trip.dateRange.to);
      
      const diffTime = Math.abs(toDate - fromDate);
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
      
      return diffDays;
    },
    formatDate(dateString) {
      const date = new Date(dateString);
      return date.toLocaleDateString('zh-CN', { month: 'short', day: 'numeric', weekday: 'short' });
    },
    formatDateRange(dateRange) {
      if (!dateRange || !dateRange.from || !dateRange.to) return '';
      
      const fromDate = new Date(dateRange.from);
      const toDate = new Date(dateRange.to);
      
      return `${fromDate.getFullYear()}年${fromDate.getMonth() + 1}月${fromDate.getDate()}日 - ${toDate.getMonth() + 1}月${toDate.getDate()}日`;
    },
    getActivityIcon(type) {
      const iconMap = {
        '景点游览': 'photo_camera',
        '餐饮美食': 'restaurant',
        '住宿安排': 'hotel',
        '交通出行': 'commute',
        '购物娱乐': 'shopping_bag',
        '文化体验': 'museum',
        '休闲放松': 'spa',
        '其他': 'more_horiz'
      };
      
      return iconMap[type] || 'event';
    },
    getActivityColor(type) {
      const colorMap = {
        '景点游览': 'deep-purple',
        '餐饮美食': 'orange',
        '住宿安排': 'green',
        '交通出行': 'blue',
        '购物娱乐': 'pink',
        '文化体验': 'indigo',
        '休闲放松': 'teal',
        '其他': 'grey'
      };
      
      return colorMap[type] || 'primary';
    },
    getActivityTypeClass(type) {
      const classMap = {
        '景点游览': 'sightseeing',
        '餐饮美食': 'food',
        '住宿安排': 'accommodation',
        '交通出行': 'transportation',
        '购物娱乐': 'shopping',
        '文化体验': 'culture',
        '休闲放松': 'relaxation',
        '其他': 'other'
      };
      
      return classMap[type] || 'other';
    },
    getRecommendationIcon(type) {
      const iconMap = {
        'time-saving': 'schedule',
        'budget': 'savings',
        'weather': 'wb_cloudy',
        'activity': 'local_activity',
        'safety': 'security',
        'food': 'restaurant_menu'
      };
      
      return iconMap[type] || 'tips_and_updates';
    },
    getRecommendationColor(type) {
      const colorMap = {
        'time-saving': 'blue',
        'budget': 'green',
        'weather': 'cyan',
        'activity': 'purple',
        'safety': 'red',
        'food': 'orange'
      };
      
      return colorMap[type] || 'primary';
    },
    getCompletedItemsCount() {
      if (!this.trip.todoList) return 0;
      return this.trip.todoList.filter(item => item.done).length;
    },
    getCompletionRate() {
      if (!this.trip.todoList || !this.trip.todoList.length) return 0;
      
      return this.getCompletedItemsCount() / this.trip.todoList.length;
    },
    getDisplayedTodoItems() {
      if (!this.trip.todoList) return [];
      return this.trip.todoList.slice(0, this.maxDisplayTodoItems);
    },
    showActivityDetails(dayIndex, activityIndex) {
      this.activityDialog = {
        show: true,
        dayIndex,
        activity: {...this.days[dayIndex].activities[activityIndex]}
      };
    },
    getSpentBudget() {
      return this.trip.budget.spentAmount || 0;
    },
    getRemainingBudget() {
      return this.trip.budget.total - this.getSpentBudget();
    },
    getBudgetProgressValue() {
      if (!this.trip.budget.total) return 0;
      return Math.min(this.getSpentBudget() / this.trip.budget.total, 1);
    },
    getBudgetProgressColor() {
      const value = this.getBudgetProgressValue();
      
      if (value > 0.9) return 'negative';
      if (value > 0.7) return 'warning';
      return 'positive';
    },
    getBudgetCategoryColor(categoryId) {
      const colors = {
        transportation: 'blue',
        accommodation: 'green',
        food: 'orange',
        activities: 'purple'
      };
      
      return colors[categoryId] || 'primary';
    },
    getCategoryPercentage(categoryId) {
      if (!this.trip.budget.total) return 0;
      
      const categoryAmount = this.trip.budget.categories[categoryId] || 0;
      return categoryAmount / this.trip.budget.total;
    },
    acceptRecommendation(index) {
      this.$q.notify({
        color: 'positive',
        message: '已接受建议',
        icon: 'thumb_up',
        position: 'bottom'
      });
      
      this.recommendations.splice(index, 1);
    },
    dismissRecommendation(index) {
      this.$q.notify({
        color: 'grey',
        message: '已忽略建议',
        icon: 'thumb_down',
        position: 'bottom'
      });
      
      this.recommendations.splice(index, 1);
    },
    submitAiQuery() {
      if (!this.aiQuery.trim()) return;
      
      // 模拟AI助手响应
      this.aiResponse = "正在分析您的问题...";
      
      // 模拟API响应延迟
      setTimeout(() => {
        if (this.aiQuery.includes('餐厅') || this.aiQuery.includes('美食')) {
          this.aiResponse = "根据您的行程，东京的推荐餐厅有：1. 新宿区的「一蘭拉面」- 著名连锁拉面店；2. 浅草附近的「天丼てんや」- 性价比高的天妇罗盖饭；3. 银座的「寿司大」- 正宗日式寿司体验。建议提前预约热门餐厅。";
        } else if (this.aiQuery.includes('天气')) {
          this.aiResponse = "根据天气预报，您行程期间东京天气如下：8月15-16日晴朗，气温28-32°C；8月17日有小雨，建议携带雨具；8月18-20日多云，气温26-30°C。建议做好防晒和防雨准备。";
        } else if (this.aiQuery.includes('预算') || this.aiQuery.includes('节省')) {
          this.aiResponse = "节省东京旅行预算的建议：1. 使用地铁一日/三日券；2. 选择便利店早餐；3. 午餐尝试食堂或定食；4. 购物可前往奥特莱斯；5. 利用免税店和退税服务；6. 考虑购买景点套票。";
        } else {
          this.aiResponse = `关于"${this.aiQuery}"，根据您的东京行程，我建议您参考东京官方旅游网站获取最新信息，或咨询酒店前台。您还需要了解其他方面的信息吗？`;
        }
        
        this.aiQuery = '';
      }, 1500);
    },
    useAiSuggestion(suggestion) {
      this.aiQuery = suggestion;
      this.submitAiQuery();
    },
    getActivitiesForTimeSlot(activities, timeSlot) {
      const [hours] = timeSlot.split(':').map(Number);
      const startHour = hours - 1;
      const endHour = hours + 1;
      
      return activities.filter(activity => {
        const [actHours] = activity.time.split(':').map(Number);
        return actHours >= startHour && actHours < endHour;
      });
    },
    findActivityIndex(activities, targetActivity) {
      return activities.findIndex(activity => 
        activity.name === targetActivity.name && 
        activity.time === targetActivity.time
      );
    },
    updateTodoItem() {
      // 在实际应用中，这里应该有更新后端数据的逻辑
      this.calculateCompletionPercentage();
      
      this.$q.notify({
        color: 'positive',
        message: '清单已更新',
        icon: 'check',
        position: 'bottom',
        timeout: 1000
      });
    },
    toggleItineraryView() {
      this.itineraryView = this.itineraryView === 'list' ? 'calendar' : 'list';
    }
  }
}
</script>

<style>
.trip-detail-page {
  background-color: #f5f7fa;
}

.container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 16px;
}

.immersive-header {
  height: 200px;
  background-size: cover;
  background-position: center;
  position: relative;
}

.header-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(to bottom, rgba(0,0,0,0.5), rgba(0,0,0,0.7));
  display: flex;
  align-items: center;
  z-index: 1;
}

.progress-container {
  position: sticky;
  top: 0;
  z-index: 9;
}

.progress-bar {
  height: 6px;
  background-color: #e0e0e0;
  border-radius: 3px;
  overflow: hidden;
}

.progress-value {
  height: 100%;
  background: linear-gradient(90deg, #1976d2, #42a5f5);
  border-radius: 3px;
  transition: width 0.6s ease;
}

.progress-steps {
  display: flex;
  justify-content: space-between;
  padding: 8px 0;
}

.step {
  text-align: center;
  position: relative;
  flex: 1;
}

.step-name {
  font-size: 0.8rem;
  color: #757575;
  margin-bottom: 5px;
}

.step-active .step-name {
  color: #4caf50;
  font-weight: 500;
}

.info-card, .budget-card, .itinerary-card, .recommendations-card, .checklist-card, .ai-assistant-card {
  border-radius: 12px;
  overflow: hidden;
  transition: all 0.3s ease;
}

.info-card:hover, .budget-card:hover, .itinerary-card:hover, .recommendations-card:hover, .checklist-card:hover, .ai-assistant-card:hover {
  transform: translateY(-3px);
  box-shadow: 0 8px 16px rgba(0, 0, 0, 0.1);
}

.info-item {
  margin-bottom: 12px;
  display: flex;
  align-items: flex-start;
}

.info-item .q-icon {
  margin-right: 8px;
  margin-top: 3px;
}

.info-label {
  font-weight: 500;
  margin-right: 8px;
  color: #757575;
}

.info-value {
  font-weight: 400;
}

.info-description {
  margin-left: 24px;
  color: #616161;
  line-height: 1.5;
}

.budget-stat-card {
  background-color: white;
  transition: all 0.3s ease;
}

.budget-stat-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.08);
}

.category-item {
  padding: 8px;
  border-radius: 8px;
  transition: background-color 0.2s;
}

.category-item:hover {
  background-color: #f5f5f5;
}

.calendar-view {
  background-color: white;
  border-radius: 8px;
  overflow: hidden;
}

.calendar-day-header {
  padding: 8px;
  border-bottom: 1px solid #eee;
  background-color: #f9f9f9;
}

.calendar-day {
  border-right: 1px solid #eee;
  min-width: 120px;
}

.calendar-day:last-child {
  border-right: none;
}

.calendar-timeslot {
  padding: 8px;
  border-bottom: 1px solid #f0f0f0;
  min-height: 60px;
  display: flex;
}

.timeslot-time {
  width: 50px;
  flex-shrink: 0;
}

.timeslot-content {
  flex-grow: 1;
  position: relative;
}

.activity-item {
  background-color: #e3f2fd;
  border-radius: 4px;
  padding: 8px;
  margin-bottom: 4px;
  cursor: pointer;
  transition: all 0.2s ease;
  border-left: 3px solid #2196f3;
}

.activity-item:hover {
  transform: translateY(-2px);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.activity-sightseeing {
  background-color: #f3e5f5;
  border-left-color: #9c27b0;
}

.activity-food {
  background-color: #fff8e1;
  border-left-color: #ffc107;
}

.activity-accommodation {
  background-color: #e8f5e9;
  border-left-color: #4caf50;
}

.activity-transportation {
  background-color: #e1f5fe;
  border-left-color: #03a9f4;
}

.activity-shopping {
  background-color: #fce4ec;
  border-left-color: #e91e63;
}

.activity-item-sightseeing {
  border-left: 4px solid #9c27b0;
}

.activity-item-food {
  border-left: 4px solid #ff9800;
}

.activity-item-accommodation {
  border-left: 4px solid #4caf50;
}

.activity-item-transportation {
  border-left: 4px solid #2196f3;
}

.activity-item-shopping {
  border-left: 4px solid #e91e63;
}

.recommendation-item {
  margin-bottom: 8px;
  border-radius: 8px;
  transition: all 0.2s ease;
}

.recommendation-item:hover {
  background-color: #f5f5f5;
}

.recommendation-time-saving {
  border-left: 3px solid #2196f3;
}

.recommendation-budget {
  border-left: 3px solid #4caf50;
}

.recommendation-weather {
  border-left: 3px solid #00bcd4;
}

.recommendation-activity {
  border-left: 3px solid #9c27b0;
}

.ai-message {
  position: relative;
  max-width: 80%;
}

.ai-message::before {
  content: '';
  position: absolute;
  top: 10px;
  left: -8px;
  width: 0;
  height: 0;
  border-top: 8px solid transparent;
  border-bottom: 8px solid transparent;
  border-right: 8px solid #e0e0e0;
}

.completed-item {
  background-color: #f5f5f5;
  opacity: 0.8;
}

.rounded-borders {
  border-radius: 8px;
}

/* 移动端优化样式 */
.mobile-tabs {
  position: sticky;
  top: 56px;
  z-index: 8;
  border-radius: 0 0 8px 8px;
  overflow: hidden;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.1);
}

.mobile-info-item {
  background-color: #f5f5f5;
  padding: 8px;
  border-radius: 8px;
  text-align: center;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.mobile-info-item .info-label {
  margin-right: 0;
  margin-top: 4px;
  font-size: 0.75rem;
}

.mobile-info-item .info-value {
  font-weight: 500;
  margin-top: 2px;
}

.calendar-view-mobile {
  padding: 0;
}

.calendar-timeslot-mobile {
  display: flex;
  border-bottom: 1px solid #f0f0f0;
  padding: 8px 4px;
}

.calendar-timeslot-mobile .timeslot-time {
  width: 40px;
  flex-shrink: 0;
  padding-top: 6px;
}

.calendar-timeslot-mobile .timeslot-content {
  flex-grow: 1;
}

.suggestion-chip {
  margin-bottom: 8px;
}

.hide-on-mobile {
  display: flex;
}

/* 移动端响应式适配 */
@media (max-width: 599px) {
  .immersive-header {
    height: 150px;
  }
  
  .container {
    padding: 0 8px;
  }
  
  .trip-detail-page .q-card {
    margin-bottom: 8px;
    border-radius: 8px;
  }
  
  .hide-on-mobile {
    display: none;
  }
  
  .activity-item {
    padding: 4px 6px;
    font-size: 0.8rem;
  }
  
  .ai-message {
    max-width: 100%;
  }
  
  .q-card-section {
    padding: 12px;
  }
  
  .q-card-actions {
    padding: 8px;
  }
  
  .info-card, .budget-card, .itinerary-card, .recommendations-card, .checklist-card, .ai-assistant-card {
    box-shadow: none !important;
  }
  
  .info-card:hover, .budget-card:hover, .itinerary-card:hover, .recommendations-card:hover, .checklist-card:hover, .ai-assistant-card:hover {
    transform: none;
  }
  
  .category-item {
    padding: 4px;
  }
  
  .suggestion-chip {
    width: 100%;
  }
  
  .ai-response-mobile {
    max-height: 35vh;
    overflow-y: auto;
  }
}

.bg-primary-1 {
  background-color: rgba(25, 118, 210, 0.1);
}

.bg-green-1 {
  background-color: rgba(76, 175, 80, 0.1);
}

.bg-blue-1 {
  background-color: rgba(33, 150, 243, 0.1);
}

.bg-purple-1 {
  background-color: rgba(156, 39, 176, 0.1);
}

@keyframes fadeIn {
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
}

.trip-detail-page .q-card {
  animation: fadeIn 0.5s ease-out;
}

/* 平板设备适配 */
@media (min-width: 600px) and (max-width: 1023px) {
  .container {
    padding: 0 16px;
  }
  
  .calendar-day {
    min-width: 110px;
  }
}

/* 深色模式适配 */
.body--dark .trip-detail-page {
  background-color: #121212;
}

.body--dark .bg-primary-1 {
  background-color: rgba(30, 136, 229, 0.2);
}

.body--dark .bg-green-1 {
  background-color: rgba(102, 187, 106, 0.2);
}

.body--dark .bg-blue-1 {
  background-color: rgba(66, 165, 245, 0.2);
}

.body--dark .bg-purple-1 {
  background-color: rgba(171, 71, 188, 0.2);
}

.body--dark .mobile-info-item {
  background-color: #333;
}

.body--dark .q-tabs {
  background-color: #1d1d1d;
}

/* 移动端安全区域适配 */
@supports (padding-bottom: env(safe-area-inset-bottom)) {
  .mobile-tabs {
    padding-bottom: env(safe-area-inset-bottom);
  }
}

/* 打印优化 */
@media print {
  .trip-detail-page {
    background-color: white;
  }
  
  .immersive-header {
    height: auto;
    min-height: 100px;
  }
  
  .q-btn {
    display: none;
  }
  
  .header-overlay {
    background: rgba(0,0,0,0.7);
  }
  
  .container {
    max-width: 100%;
    padding: 0;
  }
  
  .q-card {
    box-shadow: none !important;
    border: 1px solid #ddd;
    page-break-inside: avoid;
  }
  
  .progress-container,
  .ai-assistant-card,
  .recommendations-card,
  .mobile-tabs {
    display: none;
  }
  
  .row {
    display: block;
  }
  
  .col-12, .col-md-4, .col-md-8 {
    width: 100%;
    max-width: 100%;
    flex: 0 0 100%;
  }
}
</style>
