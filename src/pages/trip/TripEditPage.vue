<template>
  <q-page class="trip-edit-page">
    <!-- 沉浸式头部设计 -->
    <div class="immersive-header" :style="headerStyle">
      <div class="header-overlay">
        <div class="container">
          <div class="row items-center justify-between q-py-md">
            <div class="col-auto">
              <q-btn flat round dense icon="arrow_back" color="white" to="/trip" />
            </div>
            <div class="col">
              <h1 class="text-h5 text-center text-white q-my-none">{{ trip.name || '规划您的旅行' }}</h1>
              <p v-if="getDaysBetween() > 0" class="text-center text-white q-my-sm">
                {{ formatDateRange(trip.dateRange) }} · {{ getDaysBetween() }}天
              </p>
            </div>
            <div class="col-auto">
              <q-btn flat round dense icon="save" color="white" @click="showSaveDialog" />
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 进度指示器 -->
    <div class="progress-container bg-white q-py-sm shadow-1">
      <div class="container">
        <div class="progress-bar">
          <div class="progress-value" :style="`width: ${completionPercentage}%`"></div>
        </div>
        <div class="text-caption text-center q-mt-xs">
          完成度: {{ completionPercentage }}%
        </div>
      </div>
    </div>

    <!-- 主导航 - 桌面和平板 -->
    <div class="desktop-tabs q-mt-md" v-if="$q.screen.gt.sm">
      <div class="container">
        <div class="row q-col-gutter-md">
          <div 
            v-for="(step, index) in planSteps" 
            :key="index"
            class="col"
          >
            <q-card 
              :class="[
                'step-card cursor-pointer', 
                {'step-card-active': currentStep === (index + 1).toString()}
              ]"
              @click="currentStep = (index + 1).toString()"
              flat
              bordered
            >
              <q-card-section class="text-center">
                <q-avatar 
                  :color="currentStep === (index + 1).toString() ? 'primary' : 'grey-3'"
                  :text-color="currentStep === (index + 1).toString() ? 'white' : 'grey'"
                  size="md"
                >
                  {{ index + 1 }}
                </q-avatar>
                <div 
                  class="text-subtitle1 q-mt-sm"
                  :class="currentStep === (index + 1).toString() ? 'text-primary' : 'text-grey'"
                >
                  {{ step.title }}
                </div>
                <q-icon 
                  :name="step.icon" 
                  size="md"
                  :color="currentStep === (index + 1).toString() ? 'primary' : 'grey'"
                />
              </q-card-section>
            </q-card>
          </div>
        </div>
      </div>
    </div>

    <!-- 底部导航 - 移动端 -->
    <div class="mobile-bottom-nav bg-white shadow-up-2 fixed-bottom" v-if="$q.screen.lt.md">
      <div class="row no-wrap justify-around">
        <div
          v-for="(step, index) in planSteps"
          :key="index"
          class="col text-center cursor-pointer nav-item"
          @click="currentStep = (index + 1).toString()"
          :class="{'nav-item-active': currentStep === (index + 1).toString()}"
        >
          <q-icon
            :name="step.icon"
            :color="currentStep === (index + 1).toString() ? 'primary' : 'grey-7'"
            size="md"
          />
          <div class="text-caption" :class="currentStep === (index + 1).toString() ? 'text-primary' : 'text-grey-7'">
            {{ step.title }}
          </div>
        </div>
      </div>
    </div>

    <!-- 主内容区 -->
    <div class="container q-py-lg content-wrapper">
      <div v-if="loading" class="flex flex-center q-pa-xl">
        <q-spinner-dots color="primary" size="80px" />
        <div class="text-subtitle1 q-ml-md">正在加载行程数据...</div>
      </div>
      
      <q-tab-panels
        v-else
        v-model="currentStep"
        animated
        swipeable
        transition-prev="slide-right"
        transition-next="slide-left"
        class="transparent"
      >
        <!-- 第一步：基本信息 -->
        <q-tab-panel name="1">
          <div class="step-header">
            <div class="step-number">1</div>
            <div class="text-h5 text-primary q-ml-md">
              行程基本信息
            </div>
          </div>
          <div class="text-subtitle1 q-mb-lg text-grey-8">为您的旅行设定基本信息框架</div>
          
          <q-form ref="tripForm" @submit="goToNextStep" class="q-gutter-y-md">
            <!-- 行程名称 -->
            <div class="custom-field">
              <div class="field-label">
                <q-icon name="edit" color="primary" size="sm" class="q-mr-xs" />
                <div>行程名称</div>
                <q-badge color="red-5" class="q-ml-xs">必填</q-badge>
              </div>
              <q-input
                filled
                v-model="trip.name"
                placeholder="如: 东京文化探索之旅"
                :rules="[val => !!val || '请输入行程名称']"
                class="custom-input"
                hide-bottom-space
              />
            </div>
            
            <!-- 目的地 -->
            <div class="custom-field">
              <div class="field-label">
                <q-icon name="place" color="deep-orange" size="sm" class="q-mr-xs" />
                <div>目的地</div>
                <q-badge color="red-5" class="q-ml-xs">必填</q-badge>
              </div>
              <q-input
                filled
                v-model="trip.destination"
                placeholder="如: 东京"
                :rules="[val => !!val || '请输入目的地']"
                class="custom-input"
                hide-bottom-space
              >
                <template v-slot:append>
                  <q-btn round flat dense icon="travel_explore" color="primary" @click="showDestinationSuggestions = true">
                    <q-tooltip>浏览热门目的地</q-tooltip>
                  </q-btn>
                </template>
              </q-input>
              
              <!-- 热门目的地建议卡 -->
              <q-card v-if="!trip.destination" bordered flat class="suggestions-card q-mt-sm">
                <q-card-section class="q-pb-none">
                  <div class="text-subtitle2">热门目的地:</div>
                </q-card-section>
                <q-card-section class="q-pt-sm">
                  <div class="row q-col-gutter-sm">
                    <div class="col-4 col-sm-3 col-md-2" v-for="(dest, index) in popularDestinationsSuggestions" :key="index">
                      <q-chip
                        clickable
                        outline
                        color="primary"
                        class="full-width justify-center"
                        @click="trip.destination = dest"
                      >
                        {{ dest }}
                      </q-chip>
                    </div>
                  </div>
                </q-card-section>
              </q-card>
            </div>
            
            <!-- 旅行日期 -->
            <div class="custom-field">
              <div class="field-label">
                <q-icon name="event" color="green" size="sm" class="q-mr-xs" />
                <div>旅行日期</div>
                <q-badge color="red-5" class="q-ml-xs">必填</q-badge>
              </div>
              <q-input
                filled
                v-model="trip.dateRange"
                placeholder="选择日期范围"
                readonly
                :rules="[val => !!val || '请选择日期']"
                class="custom-input"
                hide-bottom-space
              >
                <template v-slot:append>
                  <q-icon name="event" class="cursor-pointer" color="primary">
                    <q-popup-proxy ref="qDateProxy" transition-show="scale" transition-hide="scale">
                      <q-date
                        v-model="trip.dateRange"
                        range
                        color="primary"
                        @update:model-value="() => $refs.qDateProxy.hide()"
                      />
                    </q-popup-proxy>
                  </q-icon>
                </template>
              </q-input>
              
              <!-- 旅行天数信息卡 -->
              <q-card v-if="getDaysBetween() > 0" flat bordered class="stats-card q-mt-sm">
                <q-card-section class="q-pa-sm">
                  <div class="row items-center">
                    <q-icon name="date_range" size="md" color="primary" class="q-mr-sm" />
                    <div>
                      <div class="text-subtitle2">旅行天数: {{ getDaysBetween() }} 天</div>
                      <div class="text-caption text-grey">{{ formatDateRange(trip.dateRange) }}</div>
                    </div>
                  </div>
                </q-card-section>
              </q-card>
            </div>
            
            <!-- 旅行人数和类型 -->
            <div class="row q-col-gutter-md">
              <div class="col-12 col-md-6">
                <div class="custom-field">
                  <div class="field-label">
                    <q-icon name="people" color="purple" size="sm" class="q-mr-xs" />
                    <div>旅行人数</div>
                    <q-badge color="red-5" class="q-ml-xs">必填</q-badge>
                  </div>
                  <q-select
                    filled
                    v-model="trip.travelers"
                    :options="travelerOptions"
                    placeholder="选择旅行人数"
                    :rules="[val => !!val || '请选择旅行人数']"
                    class="custom-input"
                    hide-bottom-space
                    emit-value
                    map-options
                  />
                </div>
              </div>
              
              <div class="col-12 col-md-6">
                <div class="custom-field">
                  <div class="field-label">
                    <q-icon name="category" color="blue" size="sm" class="q-mr-xs" />
                    <div>旅行类型</div>
                  </div>
                  <q-select
                    filled
                    v-model="trip.tripType"
                    :options="tripTypeOptions"
                    placeholder="选择旅行类型"
                    class="custom-input"
                    hide-bottom-space
                  />
                </div>
              </div>
            </div>
            
            <!-- 旅行描述 -->
            <div class="custom-field">
              <div class="field-label">
                <q-icon name="description" color="teal" size="sm" class="q-mr-xs" />
                <div>行程描述</div>
              </div>
              <q-input
                filled
                v-model="trip.description"
                type="textarea"
                placeholder="描述一下您的旅行计划和期望..."
                autogrow
                class="custom-input"
                hide-bottom-space
              />
            </div>
            
            <!-- 主题选择 -->
            <div class="custom-field">
              <div class="field-label">
                <q-icon name="palette" color="indigo" size="sm" class="q-mr-xs" />
                <div>行程主题色</div>
              </div>
              <div class="row q-gutter-sm q-mt-sm justify-center">
                <q-btn
                  v-for="(theme, index) in themeColors"
                  :key="index"
                  round
                  :color="theme.color"
                  :icon="trip.themeColor === theme.color ? 'check' : ''"
                  @click="selectThemeColor(theme.color)"
                  size="md"
                >
                  <q-tooltip>{{ theme.name }}</q-tooltip>
                </q-btn>
              </div>
            </div>
            
            <!-- AI行程助手 -->
            <q-card class="ai-assistant-card q-mt-lg" bordered>
              <q-card-section>
                <div class="row items-start no-wrap">
                  <q-avatar color="primary" text-color="white" icon="smart_toy" size="md" class="q-mr-md" />
                  <div>
                    <div class="text-subtitle1 q-mb-sm">AI行程助手</div>
                    <div class="text-body2">
                      根据您目前的信息，我可以帮助您生成完整的行程建议，包括景点、餐厅和活动安排。
                    </div>
                    <div class="row q-mt-md justify-end">
                      <q-btn color="primary" label="生成行程建议" icon-right="assistant" flat @click="showAiSuggestions" />
                    </div>
                  </div>
                </div>
              </q-card-section>
            </q-card>
            
            <!-- 下一步按钮 -->
            <div class="row justify-end q-mt-lg">
              <q-btn 
                :color="trip.themeColor || 'primary'" 
                type="submit"
                label="下一步" 
                :disable="!trip.name || !trip.destination || !trip.dateRange || !trip.travelers"
                class="next-btn"
                unelevated
                rounded
                icon-right="arrow_forward"
              />
            </div>
          </q-form>
          
          <!-- 热门目的地对话框 -->
          <q-dialog v-model="showDestinationSuggestions" persistent>
            <q-card class="destination-dialog">
              <q-card-section class="row items-center">
                <div class="text-h6">探索热门目的地</div>
                <q-space />
                <q-btn icon="close" flat round dense v-close-popup />
              </q-card-section>
              
              <q-separator />
              
              <q-card-section>
                <q-input filled v-model="destinationSearch" label="搜索目的地" dense>
                  <template v-slot:append>
                    <q-icon name="search" />
                  </template>
                </q-input>
              </q-card-section>
              
              <q-tabs
                v-model="destinationTab"
                dense
                class="text-grey"
                active-color="primary"
                indicator-color="primary"
                align="justify"
                narrow-indicator
              >
                <q-tab name="domestic" label="国内" />
                <q-tab name="asia" label="亚洲" />
                <q-tab name="europe" label="欧洲" />
                <q-tab name="america" label="美洲" />
              </q-tabs>
              
              <q-separator />
              
              <q-tab-panels v-model="destinationTab" animated>
                <q-tab-panel name="domestic" class="scroll" style="max-height: 60vh">
                  <div class="row q-col-gutter-md">
                    <div v-for="(dest, index) in popularDestinations.domestic" :key="index" class="col-6 col-md-4">
                      <q-card class="destination-card cursor-pointer" flat @click="selectDestination(dest)">
                        <q-img :src="dest.image" height="140px">
                          <div class="absolute-bottom text-subtitle2 text-center bg-primary-7 text-white">
                            {{ dest.name }}
                          </div>
                        </q-img>
                      </q-card>
                    </div>
                  </div>
                </q-tab-panel>
                
                <q-tab-panel name="asia">
                  <div class="row q-col-gutter-md">
                    <div v-for="(dest, index) in popularDestinations.asia" :key="index" class="col-6 col-md-4">
                      <q-card class="destination-card cursor-pointer" flat @click="selectDestination(dest)">
                        <q-img :src="dest.image" height="140px">
                          <div class="absolute-bottom text-subtitle2 text-center bg-primary-7 text-white">
                            {{ dest.name }}
                          </div>
                        </q-img>
                      </q-card>
                    </div>
                  </div>
                </q-tab-panel>
                
                <!-- 其他大洲的面板类似 -->
              </q-tab-panels>
            </q-card>
          </q-dialog>
        </q-tab-panel>

        <!-- 第二步：行程安排 -->
        <q-tab-panel name="2">
          <div class="step-header">
            <div class="step-number">2</div>
            <div class="text-h5 text-primary q-ml-md">
              行程安排
            </div>
          </div>
          <div class="text-subtitle1 q-mb-lg text-grey-8">规划您的每日活动和时间表</div>
          
          <!-- 日历视图切换 -->
          <div class="view-toggle q-mb-md">
            <q-btn-toggle
              v-model="itineraryView"
              :options="[
                {label: '列表视图', value: 'list', icon: 'view_list'},
                {label: '日历视图', value: 'calendar', icon: 'calendar_month'}
              ]"
              :color="trip.themeColor || 'primary'"
              text-color="white"
              unelevated
              rounded
              dense
            />
          </div>
          
          <div v-if="getDaysBetween() > 0">
            <!-- 日历视图 -->
            <div v-if="itineraryView === 'calendar'" class="calendar-view q-mb-xl">
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
                          @click="editActivity(dayIndex, findActivityIndex(day.activities, activity))"
                        >
                          <div class="activity-time text-caption">{{ activity.time }}</div>
                          <div class="activity-name text-body2">{{ activity.name }}</div>
                          <div v-if="activity.location" class="activity-location text-caption">
                            <q-icon name="place" size="xs" /> {{ activity.location }}
                          </div>
                        </div>
                        
                        <q-btn
                          v-if="getActivitiesForTimeSlot(day.activities, timeSlot).length === 0"
                          class="add-activity-btn"
                          icon="add"
                          color="grey-5"
                          round
                          flat
                          dense
                          @click="addNewActivityForTimeSlot(dayIndex, timeSlot)"
                        />
                      </div>
                    </div>
                    
                    <div class="add-activity-row">
                      <q-btn
                        label="添加活动"
                        :color="trip.themeColor || 'primary'"
                        outline
                        rounded
                        size="sm"
                        icon="add"
                        @click="addNewActivity(dayIndex)"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            <!-- 列表视图 -->
            <div v-else class="list-view">
              <q-card v-for="(day, index) in days" :key="index" flat bordered class="day-card q-mb-md">
                <q-card-section class="day-header">
                  <div class="row items-center justify-between">
                    <div class="col">
                      <div class="text-h6">第 {{ index + 1 }} 天</div>
                      <div class="text-subtitle2">{{ formatDate(day.date) }}</div>
                    </div>
                    <div class="col-auto">
                      <q-btn 
                        :color="trip.themeColor || 'primary'" 
                        round 
                        flat 
                        icon="add" 
                        @click="addNewActivity(index)"
                      >
                        <q-tooltip>添加活动</q-tooltip>
                      </q-btn>
                    </div>
                  </div>
                </q-card-section>
                
                <q-card-section class="q-pt-none" v-if="day.activities.length === 0">
                  <div class="empty-day-placeholder">
                    <q-icon name="event_available" size="3rem" color="grey-4" />
                    <div class="text-subtitle1 text-grey-6 q-mt-sm">暂无活动安排</div>
                    <q-btn
                      :color="trip.themeColor || 'primary'"
                      outline
                      label="添加活动"
                      icon="add"
                      class="q-mt-sm"
                      @click="addNewActivity(index)"
                    />
                  </div>
                </q-card-section>
                
                <q-card-section v-else class="q-pa-none">
                  <q-list separator>
                    <q-item 
                      v-for="(activity, actIndex) in day.activities" 
                      :key="actIndex"
                      clickable
                      v-ripple
                      @click="editActivity(index, actIndex)"
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
                          <div v-if="activity.note" class="q-mt-xs">{{ activity.note }}</div>
                        </q-item-label>
                      </q-item-section>
                      
                      <q-item-section side>
                        <div class="row q-gutter-sm">
                          <q-btn flat round dense icon="edit" color="primary" @click.stop="editActivity(index, actIndex)" />
                          <q-btn flat round dense icon="delete" color="negative" @click.stop="removeActivity(index, actIndex)" />
                        </div>
                      </q-item-section>
                    </q-item>
                  </q-list>
                </q-card-section>
              </q-card>
            </div>
            
            <!-- AI行程建议 -->
            <q-card class="ai-assistant-card q-mt-lg" bordered>
              <q-card-section>
                <div class="row items-start no-wrap">
                  <q-avatar color="primary" text-color="white" icon="smart_toy" size="md" class="q-mr-md" />
                  <div>
                    <div class="text-subtitle1 q-mb-sm">行程建议</div>
                    <div class="text-body2">
                      AI助手可以帮您完善行程，根据旅行天数和目的地提供景点和活动建议。
                    </div>
                    <div class="row q-mt-md justify-end">
                      <q-btn color="primary" label="获取行程建议" icon-right="assistant" flat @click="getItinerarySuggestions" />
                    </div>
                  </div>
                </div>
              </q-card-section>
            </q-card>
          </div>
          <div v-else class="no-data-placeholder">
            <q-icon name="event_busy" size="4rem" color="grey-5" />
            <div class="text-subtitle1 text-grey q-mt-sm">请先在基本信息步骤中选择旅行日期</div>
          </div>
          
          <div class="row justify-between q-mt-xl">
            <q-btn 
              outline 
              :color="trip.themeColor || 'primary'" 
              icon="arrow_back" 
              label="上一步" 
              @click="goToPrevStep" 
              class="nav-btn"
              rounded
            />
            <q-btn 
              :color="trip.themeColor || 'primary'" 
              label="下一步" 
              icon-right="arrow_forward" 
              @click="goToNextStep" 
              class="nav-btn"
              unelevated
              rounded
            />
          </div>
        </q-tab-panel>

        <!-- 第三步：预算规划 -->
        <q-tab-panel name="3">
          <div class="step-header">
            <div class="step-number">3</div>
            <div class="text-h5 text-primary q-ml-md">
              预算规划
            </div>
          </div>
          <div class="text-subtitle1 q-mb-lg text-grey-8">规划并分配您的旅行预算</div>
          
          <!-- 总预算设置卡片 -->
          <q-card bordered class="budget-card">
            <q-card-section class="bg-green-1">
              <div class="row items-center q-gutter-md">
                <q-icon name="account_balance_wallet" color="green" size="md" />
                <div class="text-h6 text-green">总预算设置</div>
              </div>
            </q-card-section>
            
            <q-card-section>
              <div class="row q-col-gutter-md">
                <div class="col-12 col-md-8">
                  <q-input
                    filled
                    v-model.number="trip.budget.total"
                    type="number"
                    label="总预算金额"
                    stack-label
                  >
                    <template v-slot:prepend>
                      <q-icon name="paid" color="green" />
                    </template>
                    <template v-slot:append>
                      <q-btn-dropdown flat dense color="primary" :label="trip.budget.currency">
                        <q-list>
                          <q-item 
                            v-for="currency in currencyOptions" 
                            :key="currency" 
                            clickable 
                            v-close-popup
                            @click="trip.budget.currency = currency"
                          >
                            <q-item-section>{{ currency }}</q-item-section>
                          </q-item>
                        </q-list>
                      </q-btn-dropdown>
                    </template>
                  </q-input>
                </div>
                
                <div class="col-12 col-md-4">
                  <q-card flat bordered class="text-center q-pa-md">
                    <div class="text-subtitle1 text-weight-medium">已分配预算</div>
                    <div class="text-subtitle1">
                      <span class="text-weight-bold">{{ getTotalAllocatedBudget() }}</span> 
                      {{ trip.budget.currency }} / 
                      <span>{{ trip.budget.total || 0 }}</span>
                      {{ trip.budget.currency }}
                    </div>
                  </q-card>
                </div>
              </div>
            </q-card-section>
          </q-card>
          
          <div class="text-h6 q-mt-lg q-mb-md">预算分配</div>
          
          <div class="budget-categories">
            <q-card v-for="(category, index) in budgetCategories" :key="index" 
                   flat bordered class="budget-category-card q-mb-sm"
                   :class="{'budget-category-card-active': isActiveBudgetCategory(category.id)}">
              <q-card-section class="q-pa-md">
                <div class="row items-center no-wrap">
                  <div class="col-auto">
                    <q-avatar :color="getBudgetCategoryColor(category.id) + '-1'" :text-color="getBudgetCategoryColor(category.id)">
                      <q-icon :name="category.icon" />
                    </q-avatar>
                  </div>
                  <div class="col q-px-md">
                    <div class="budget-category-name">{{ category.name }}</div>
                    <div class="text-caption text-grey" v-if="trip.budget.categories[category.id] > 0">
                      占总预算的 {{ getBudgetCategoryPercentage(category.id) }}%
                    </div>
                  </div>
                  <div class="col-auto">
                    <q-input
                      dense
                      v-model.number="trip.budget.categories[category.id]"
                      type="number"
                      :suffix="trip.budget.currency"
                      borderless
                      class="budget-input text-right"
                      @focus="activeBudgetCategory = category.id"
                      @blur="activeBudgetCategory = null"
                    />
                  </div>
                </div>
              </q-card-section>
            </q-card>
          </div>
          
          <q-card flat bordered class="budget-summary-card q-mt-lg">
            <q-card-section>
              <div class="row items-center justify-between q-mb-sm">
                <div class="text-subtitle1 text-weight-medium">已分配预算</div>
                <div class="text-subtitle1">
                  <span class="text-weight-bold">{{ getTotalAllocatedBudget() }}</span> 
                  {{ trip.budget.currency }} / 
                  <span>{{ trip.budget.total || 0 }}</span>
                  {{ trip.budget.currency }}
                </div>
              </div>
              
              <q-linear-progress
                :value="getBudgetProgressValue()"
                size="15px"
                :color="getBudgetProgressColor()"
                track-color="grey-3"
                class="q-mt-sm rounded-borders"
              >
                <div class="absolute-full flex flex-center">
                  <q-badge color="white" text-color="black" :label="`${Math.round(getBudgetProgressValue() * 100)}%`" />
                </div>
              </q-linear-progress>
              
              <div class="budget-tips q-mt-md text-grey-8" v-if="trip.budget.total > 0">
                <q-icon name="lightbulb" color="warning" /> 
                提示: {{ getBudgetTip() }}
              </div>
            </q-card-section>
          </q-card>
          
          <div class="row justify-between q-mt-lg">
            <q-btn outline color="primary" icon="arrow_back" label="上一步" @click="goToPrevStep" class="nav-btn" />
            <q-btn color="primary" label="下一步" icon-right="arrow_forward" @click="goToNextStep" class="nav-btn" />
          </div>
        </q-tab-panel>

        <!-- 第四步：旅行清单 -->
        <q-tab-panel name="4">
          <div class="section-header">
            <div class="text-h5 text-primary">
              <q-icon name="checklist" class="q-mr-sm" />
              旅行清单
            </div>
            <div class="text-caption text-grey">编辑您的待办事项和物品清单</div>
          </div>
          
          <q-card flat bordered class="checklist-input-card q-mt-md">
            <q-card-section>
              <q-input
                filled
                v-model="newItemText"
                label="添加物品或任务"
                stack-label
                @keyup.enter="addTodoItem"
                class="custom-input"
                placeholder="例如: 护照、充电器、防晒霜..."
              >
                <template v-slot:prepend>
                  <q-icon name="add_task" color="primary" />
                </template>
                <template v-slot:append>
                  <q-btn
                    round
                    color="primary"
                    icon="add"
                    size="sm"
                    @click="addTodoItem"
                  />
                </template>
              </q-input>
              
              <div class="quick-items q-mt-sm" v-if="!trip.todoList.length">
                <div class="text-caption text-grey q-mb-xs">快速添加常用物品:</div>
                <div class="row q-col-gutter-sm">
                  <div class="col-auto" v-for="(item, index) in quickItems" :key="index">
                    <q-chip
                      clickable
                      color="blue-1"
                      text-color="primary"
                      icon="add"
                      @click="quickAddItem(item)"
                    >
                      {{ item }}
                    </q-chip>
                  </div>
                </div>
              </div>
            </q-card-section>
          </q-card>
          
          <div class="checklist-stats q-mt-md" v-if="trip.todoList.length > 0">
            <div class="row q-col-gutter-md">
              <div class="col-6 col-md-3">
                <q-card flat bordered class="text-center q-pa-sm">
                  <div class="text-h6 text-primary">{{ trip.todoList.length }}</div>
                  <div class="text-caption">总事项</div>
                </q-card>
              </div>
              <div class="col-6 col-md-3">
                <q-card flat bordered class="text-center q-pa-sm">
                  <div class="text-h6 text-positive">{{ getCompletedItemsCount() }}</div>
                  <div class="text-caption">已完成</div>
                </q-card>
              </div>
              <div class="col-12 col-md-6">
                <q-card flat bordered class="q-pa-sm">
                  <q-linear-progress
                    :value="getCompletionRate()"
                    color="positive"
                    size="8px"
                    class="q-mb-xs"
                  />
                  <div class="text-caption text-center">
                    完成率: {{ Math.round(getCompletionRate() * 100) }}%
                  </div>
                </q-card>
              </div>
            </div>
          </div>
          
          <q-card flat bordered class="checklist-card q-mt-md" v-if="trip.todoList.length > 0">
            <q-card-section class="q-pa-none">
              <q-list separator>
                <q-item
                  v-for="(item, index) in trip.todoList"
                  :key="index"
                  tag="label"
                  v-ripple
                  :class="{'completed-item': item.done}"
                >
                  <q-item-section side>
                    <q-checkbox v-model="item.done" color="primary" />
                  </q-item-section>
                  <q-item-section>
                    <q-item-label :class="{'text-strike': item.done}">{{ item.text }}</q-item-label>
                  </q-item-section>
                  <q-item-section side>
                    <q-btn
                      flat
                      round
                      dense
                      icon="delete"
                      color="grey-7"
                      @click.stop="removeTodoItem(index)"
                    />
                  </q-item-section>
                </q-item>
              </q-list>
            </q-card-section>
            
            <q-card-actions align="right">
              <q-btn flat color="negative" @click="confirmClearCompleted" label="清除已完成" />
            </q-card-actions>
          </q-card>
          
          <div class="no-data-placeholder" v-if="trip.todoList.length === 0">
            <q-icon name="checklist" size="4rem" color="grey-5" />
            <div class="text-subtitle1 text-grey q-mt-sm">添加旅行所需物品和待办事项</div>
          </div>
          
          <div class="row justify-between q-mt-lg">
            <q-btn outline color="primary" icon="arrow_back" label="上一步" @click="goToPrevStep" class="nav-btn" />
            <q-btn color="positive" icon-right="check_circle" label="保存更改" @click="updateTrip" class="nav-btn" />
          </div>
        </q-tab-panel>
      </q-tab-panels>
    </div>
    
    <!-- 活动编辑对话框 -->
    <q-dialog v-model="activityDialog.show" persistent transition-show="scale" transition-hide="scale">
      <q-card style="min-width: 350px; max-width: 95vw">
        <q-card-section class="bg-primary text-white">
          <div class="text-h6">{{ activityDialog.isEdit ? '编辑活动' : '添加活动' }}</div>
        </q-card-section>

        <q-card-section class="q-pt-lg">
          <q-form @submit="saveActivity">
            <div class="q-gutter-md">
              <q-input
                filled
                v-model="activityDialog.activity.name"
                label="活动名称 *"
                stack-label
                :rules="[val => !!val || '请输入活动名称']"
                class="custom-input"
              >
                <template v-slot:prepend>
                  <q-icon name="event_note" color="primary" />
                </template>
              </q-input>
              
              <q-input
                filled
                v-model="activityDialog.activity.time"
                label="时间 *"
                stack-label
                mask="##:##"
                :rules="[
                  val => !!val || '请输入时间',
                  val => /^([01]?[0-9]|2[0-3]):[0-5][0-9]$/.test(val) || '请输入有效的时间格式 (HH:MM)'
                ]"
                class="custom-input"
              >
                <template v-slot:prepend>
                  <q-icon name="access_time" color="orange" />
                </template>
              </q-input>
              
              <q-input
                filled
                v-model="activityDialog.activity.location"
                label="地点"
                stack-label
                class="custom-input"
              >
                <template v-slot:prepend>
                  <q-icon name="place" color="deep-orange" />
                </template>
              </q-input>
              
              <q-select
                filled
                v-model="activityDialog.activity.type"
                :options="activityTypeOptions"
                label="活动类型"
                stack-label
                class="custom-input"
              >
                <template v-slot:prepend>
                  <q-icon name="category" color="purple" />
                </template>
              </q-select>
              
              <q-input
                filled
                v-model="activityDialog.activity.note"
                type="textarea"
                label="备注"
                stack-label
                class="custom-input"
                autogrow
              >
                <template v-slot:prepend>
                  <q-icon name="notes" color="teal" />
                </template>
              </q-input>
            </div>
            
            <q-card-actions align="right" class="q-mt-md">
              <q-btn flat label="取消" color="negative" v-close-popup />
              <q-btn flat label="保存" color="primary" type="submit" />
            </q-card-actions>
          </q-form>
        </q-card-section>
      </q-card>
    </q-dialog>
  </q-page>
</template>

<script>
export default {
  name: 'TripEditPage',
  data () {
    return {
      tripId: null,
      loading: true,
      currentStep: "1",
      activeBudgetCategory: null,
      showDestinationSuggestions: false,
      planSteps: [
        { title: '基本信息', icon: 'info' },
        { title: '行程安排', icon: 'map' },
        { title: '预算', icon: 'account_balance_wallet' },
        { title: '清单', icon: 'checklist' }
      ],
      trip: {
        name: '',
        destination: '',
        dateRange: '',
        travelers: null,
        tripType: null,
        description: '',
        themeColor: 'primary',
        budget: {
          total: 0,
          currency: '¥',
          categories: {
            transportation: 0,
            accommodation: 0,
            food: 0,
            activities: 0,
          }
        }
      },
      itineraryView: 'list',
      timeSlots: ['08:00', '10:00', '12:00', '14:00', '16:00', '18:00', '20:00'],
      destinationSearch: '',
      destinationTab: 'domestic',
      newItemText: '',
      completionPercentage: 0,
      themeColors: [
        { name: '经典蓝', color: 'primary' },
        { name: '活力绿', color: 'green' },
        { name: '热情橙', color: 'orange' },
        { name: '浪漫紫', color: 'purple' },
        { name: '天空蓝', color: 'light-blue' },
        { name: '深沉褐', color: 'brown' }
      ],
      popularDestinationsSuggestions: ['东京', '巴黎', '伦敦', '纽约', '北京', '香港', '曼谷', '新加坡'],
      popularDestinations: {
        domestic: [
          { name: '北京', image: 'https://images.unsplash.com/photo-1599571234909-27943af8aada?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80' },
          { name: '上海', image: 'https://images.unsplash.com/photo-1537272431819-28a69f4f3094?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80' },
          { name: '杭州', image: 'https://images.unsplash.com/photo-1585675258296-7a42c5de191a?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80' },
          { name: '成都', image: 'https://images.unsplash.com/photo-1592403878412-ebbeef22199a?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80' },
          { name: '三亚', image: 'https://images.unsplash.com/photo-1593255116149-23aa84d0387e?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80' },
          { name: '西安', image: 'https://images.unsplash.com/photo-1555998322-88525abd5d7c?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80' }
        ],
        asia: [
          { name: '东京', image: 'https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80' },
          { name: '首尔', image: 'https://images.unsplash.com/photo-1538485399081-7191377e8241?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80' },
          { name: '曼谷', image: 'https://images.unsplash.com/photo-1563492065599-3520f775eeed?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80' },
          { name: '新加坡', image: 'https://images.unsplash.com/photo-1565967511849-76a60a516170?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80' }
        ]
      },
      travelerOptions: [
        { label: '1人', value: 1 },
        { label: '2人', value: 2 },
        { label: '3人', value: 3 },
        { label: '4人', value: 4 },
        { label: '5人', value: 5 },
        { label: '6人', value: 6 },
        { label: '7人', value: 7 },
        { label: '8人', value: 8 },
        { label: '9人', value: 9 },
        { label: '10人', value: 10 }
      ],
      tripTypeOptions: ['单人旅行', '情侣旅行', '家庭旅行', '朋友旅行', '商务旅行'],
      currencyOptions: ['¥', '$', '€', '£', '₹'],
      budgetCategories: [
        { id: 'transportation', name: '交通', icon: 'directions_bus' },
        { id: 'accommodation', name: '住宿', icon: 'hotel' },
        { id: 'food', name: '餐饮', icon: 'restaurant' },
        { id: 'activities', name: '活动', icon: 'event' }
      ],
      activityTypeOptions: ['景点游览', '餐饮美食', '住宿安排', '交通出行', '购物娱乐', '文化体验', '休闲放松', '其他'],
      quickItems: ['护照', '充电器', '防晒霜', '旅行指南', '药品', '钱包', '手机', '相机', '笔记本电脑', '旅行保险'],
      activityDialog: {
        show: false,
        isEdit: false,
        activity: {
          name: '',
          time: '',
          location: '',
          type: '',
          note: ''
        }
      }
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
  watch: {
    currentStep() {
      this.updateCompletionPercentage();
    },
    'trip.name'() {
      this.updateCompletionPercentage();
    },
    'trip.destination'() {
      this.updateCompletionPercentage();
    },
    'trip.dateRange'() {
      this.updateCompletionPercentage();
    },
    'trip.travelers'() {
      this.updateCompletionPercentage();
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
          message: '未找到行程ID，无法编辑',
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
        
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        this.loadMockData();
        
        this.generateDays();
        
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
          categories: {
            transportation: 4000,
            accommodation: 5000,
            food: 3000,
            activities: 2000
          }
        },
        todoList: [
          { text: '预订机票', done: true },
          { text: '预订酒店', done: true },
          { text: '兑换日元', done: false },
          { text: '购买电源转换器', done: false },
          { text: '准备护照和签证', done: true }
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
            }
          ]
        }
      ];
    },
    goToNextStep() {
      let nextStep = parseInt(this.currentStep) + 1;
      if (nextStep <= 4) {
        this.currentStep = nextStep.toString();
      }
    },
    goToPrevStep() {
      let prevStep = parseInt(this.currentStep) - 1;
      if (prevStep >= 1) {
        this.currentStep = prevStep.toString();
      }
    },
    updateTrip() {
      if (!this.trip.name || !this.trip.destination || !this.trip.dateRange) {
        this.$q.notify({
          color: 'negative',
          textColor: 'white',
          icon: 'warning',
          message: '请填写必填信息',
          position: 'center'
        });
        return;
      }
      
      const tripData = JSON.parse(JSON.stringify(this.trip));
      tripData.days = this.days;
      
      console.log('更新行程:', tripData);
      
      setTimeout(() => {
        this.$q.notify({
          color: 'positive',
          textColor: 'white',
          icon: 'save',
          message: '行程更新成功！',
          position: 'center',
          timeout: 2000,
          classes: 'save-notification'
        });
        
        this.$router.push(`/trip/detail/${this.tripId}`);
      }, 1000);
    },
    generateDays() {
      if (this.days && this.days.length > 0) {
        return;
      }
      
      this.days = [];
      
      if (!this.trip.dateRange || !this.trip.dateRange.from || !this.trip.dateRange.to) {
        return;
      }
      
      const fromDate = new Date(this.trip.dateRange.from);
      const toDate = new Date(this.trip.dateRange.to);
      const dayCount = this.getDaysBetween();
      
      for (let i = 0; i < dayCount; i++) {
        const currentDate = new Date(fromDate);
        currentDate.setDate(fromDate.getDate() + i);
        
        this.days.push({
          date: currentDate.toISOString().split('T')[0],
          activities: []
        });
      }
    },
    selectDestination(destination) {
      this.trip.destination = destination.name;
      this.showDestinationSuggestions = false;
      
      this.$q.notify({
        color: 'positive',
        textColor: 'white',
        icon: 'place',
        message: `已选择 ${destination.name} 作为目的地`,
        position: 'bottom',
        timeout: 1500
      });
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
    addNewActivity(dayIndex) {
      this.activityDialog = {
        show: true,
        isEdit: false,
        dayIndex,
        activityIndex: null,
        activity: {
          name: '',
          time: '',
          location: '',
          type: '景点游览',
          note: ''
        }
      };
    },
    editActivity(dayIndex, activityIndex) {
      const activity = {...this.days[dayIndex].activities[activityIndex]};
      this.activityDialog = {
        show: true,
        isEdit: true,
        dayIndex,
        activityIndex,
        activity
      };
    },
    saveActivity() {
      const { dayIndex, activityIndex, activity, isEdit } = this.activityDialog;
      
      if (isEdit) {
        this.days[dayIndex].activities[activityIndex] = {...activity};
      } else {
        this.days[dayIndex].activities.push({...activity});
        
        this.days[dayIndex].activities.sort((a, b) => {
          if (a.time < b.time) return -1;
          if (a.time > b.time) return 1;
          return 0;
        });
      }
      
      this.$q.notify({
        color: 'positive',
        message: isEdit ? '活动已更新' : '活动已添加',
        icon: isEdit ? 'edit' : 'add_circle',
        position: 'bottom',
        timeout: 1000
      });
      
      this.activityDialog.show = false;
    },
    removeActivity(dayIndex, activityIndex) {
      this.$q.dialog({
        title: '确认删除',
        message: '您确定要删除这个活动吗？',
        cancel: true,
        persistent: true
      }).onOk(() => {
        this.days[dayIndex].activities.splice(activityIndex, 1);
        
        this.$q.notify({
          color: 'negative',
          message: '活动已删除',
          icon: 'delete',
          position: 'bottom',
          timeout: 1000
        });
      });
    },
    getTotalAllocatedBudget() {
      let total = 0;
      for (const category in this.trip.budget.categories) {
        total += this.trip.budget.categories[category] || 0;
      }
      return total;
    },
    getBudgetProgressValue() {
      if (!this.trip.budget.total) return 0;
      const allocated = this.getTotalAllocatedBudget();
      return Math.min(allocated / this.trip.budget.total, 1);
    },
    getBudgetProgressColor() {
      const value = this.getBudgetProgressValue();
      
      if (value > 1) return 'negative';
      if (value > 0.9) return 'warning';
      return 'positive';
    },
    isActiveBudgetCategory(categoryId) {
      return this.activeBudgetCategory === categoryId;
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
    getBudgetCategoryPercentage(categoryId) {
      if (!this.trip.budget.total) return 0;
      
      const categoryAmount = this.trip.budget.categories[categoryId] || 0;
      return Math.round((categoryAmount / this.trip.budget.total) * 100);
    },
    getBudgetTip() {
      const tips = [
        '合理的预算分配有助于避免超支',
        '住宿费用通常占旅行预算的30%左右',
        '提前预订可以节省大量费用',
        '为意外支出预留10-15%的预算',
        '交通费用通常会比预期高一些'
      ];
      
      return tips[Math.floor(Math.random() * tips.length)];
    },
    getCompletedItemsCount() {
      if (!this.trip.todoList) return 0;
      return this.trip.todoList.filter(item => item.done).length;
    },
    getCompletionRate() {
      if (!this.trip.todoList || !this.trip.todoList.length) return 0;
      
      return this.getCompletedItemsCount() / this.trip.todoList.length;
    },
    addTodoItem() {
      if (!this.newItemText.trim()) return;
      
      if (!this.trip.todoList) {
        this.trip.todoList = [];
      }
      
      this.trip.todoList.push({
        text: this.newItemText.trim(),
        done: false
      });
      
      this.newItemText = '';
      
      this.$q.notify({
        color: 'positive',
        message: '已添加到清单',
        icon: 'add_task',
        position: 'bottom',
        timeout: 1000
      });
    },
    quickAddItem(item) {
      if (!this.trip.todoList) {
        this.trip.todoList = [];
      }
      
      this.trip.todoList.push({
        text: item,
        done: false
      });
      
      this.$q.notify({
        color: 'positive',
        message: `已添加: ${item}`,
        icon: 'add_task',
        position: 'bottom',
        timeout: 1000
      });
    },
    removeTodoItem(index) {
      this.trip.todoList.splice(index, 1);
    },
    confirmClearCompleted() {
      if (!this.getCompletedItemsCount()) {
        this.$q.notify({
          color: 'warning',
          message: '没有已完成的事项',
          icon: 'info',
          position: 'bottom'
        });
        return;
      }
      
      this.$q.dialog({
        title: '确认清除',
        message: '您确定要清除所有已完成的事项吗？',
        cancel: true,
        persistent: true
      }).onOk(() => {
        this.clearCompletedItems();
      });
    },
    clearCompletedItems() {
      this.trip.todoList = this.trip.todoList.filter(item => !item.done);
      
      this.$q.notify({
        color: 'positive',
        message: '已清除完成事项',
        icon: 'cleaning_services',
        position: 'bottom',
        timeout: 1000
      });
    },
    updateCompletionPercentage() {
      let completed = 0;
      let total = 4;
      
      if (this.trip.name && this.trip.destination && this.trip.dateRange && this.trip.travelers) {
        completed++;
      }
      
      if (this.days && this.days.some(day => day.activities.length > 0)) {
        completed++;
      }
      
      if (this.trip.budget.total > 0 && this.getTotalAllocatedBudget() > 0) {
        completed++;
      }
      
      if (this.trip.todoList && this.trip.todoList.length > 0) {
        completed++;
      }
      
      this.completionPercentage = Math.round((completed / total) * 100);
    },
    selectThemeColor(color) {
      this.trip.themeColor = color;
    },
    formatDateRange(dateRange) {
      if (!dateRange || !dateRange.from || !dateRange.to) return '';
      
      const fromDate = new Date(dateRange.from);
      const toDate = new Date(dateRange.to);
      
      return `${fromDate.getFullYear()}年${fromDate.getMonth() + 1}月${fromDate.getDate()}日 - ${toDate.getMonth() + 1}月${toDate.getDate()}日`;
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
    addNewActivityForTimeSlot(dayIndex, timeSlot) {
      this.activityDialog = {
        show: true,
        isEdit: false,
        dayIndex,
        activityIndex: null,
        activity: {
          name: '',
          time: timeSlot,
          location: '',
          type: '景点游览',
          note: ''
        }
      };
    },
    showAiSuggestions() {
      this.$q.dialog({
        title: 'AI行程建议',
        message: '是否基于您的目的地和日期生成完整行程建议？',
        persistent: true,
        ok: {
          label: '生成建议',
          color: this.trip.themeColor || 'primary',
          flat: false
        },
        cancel: {
          label: '取消',
          color: 'grey',
          flat: true
        }
      }).onOk(() => {
        this.generateAiSuggestions();
      });
    },
    getItinerarySuggestions() {
      this.$q.dialog({
        title: 'AI行程建议',
        message: '是否为您的剩余空白天数生成活动建议？',
        persistent: true,
        ok: {
          label: '生成建议',
          color: this.trip.themeColor || 'primary',
          flat: false
        },
        cancel: {
          label: '取消',
          color: 'grey',
          flat: true
        }
      }).onOk(() => {
        this.generateItinerarySuggestions();
      });
    },
    generateAiSuggestions() {
      this.$q.loading.show({
        message: 'AI正在生成行程建议...'
      });
      
      setTimeout(() => {
        this.$q.loading.hide();
        
        this.$q.notify({
          color: 'positive',
          icon: 'assistant',
          message: 'AI行程建议已生成！',
          position: 'center',
          timeout: 2000
        });
      }, 2000);
    },
    generateItinerarySuggestions() {
      this.$q.loading.show({
        message: 'AI正在为您分析最佳行程安排...'
      });
      
      setTimeout(() => {
        this.$q.loading.hide();
        
        this.$q.notify({
          color: 'positive',
          icon: 'assistant',
          message: '行程建议已生成！',
          position: 'center',
          timeout: 2000
        });
      }, 2000);
    },
    showSaveDialog() {
      this.$q.dialog({
        title: '保存行程',
        message: '是否保存当前行程编辑？',
        persistent: true,
        ok: {
          label: '保存',
          color: 'positive',
          flat: false
        },
        cancel: {
          label: '取消',
          color: 'grey',
          flat: true
        }
      }).onOk(() => {
        this.updateTrip();
      });
    }
  }
}
</script>

<style>
.trip-edit-page {
  background-color: #f5f7fa;
  padding-bottom: 70px;
}

.container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 16px;
}

@keyframes fadeIn {
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
}

.page-loaded .trip-edit-page {
  animation: fadeIn 0.6s ease-out;
}

.header-section {
  background: linear-gradient(135deg, #1976d2 0%, #2196f3 100%);
  position: sticky;
  top: 0;
  z-index: 10;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
}

.content-wrapper {
  margin-bottom: 56px;
}

.mobile-bottom-nav {
  height: 60px;
  border-top: 1px solid rgba(0, 0, 0, 0.1);
  z-index: 5;
  box-shadow: 0 -2px 10px rgba(0, 0, 0, 0.05);
}

.mobile-bottom-nav .q-icon {
  font-size: 1.5rem;
}

.nav-item {
  position: relative;
  padding: 6px 0;
  transition: transform 0.2s;
}

.nav-item:active {
  transform: scale(0.95);
}

.nav-item-active::after {
  content: '';
  position: absolute;
  bottom: 0;
  left: 50%;
  transform: translateX(-50%);
  width: 20px;
  height: 3px;
  background-color: var(--q-primary);
  border-radius: 3px;
}

.q-card {
  border-radius: 12px;
  transition: all 0.3s ease;
}

.q-card:hover {
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.05);
  transform: translateY(-2px);
}

.form-card {
  background-color: #fff;
  overflow: hidden;
}

.custom-input {
  margin-bottom: 16px;
}

.nav-btn {
  transition: transform 0.2s, box-shadow 0.2s;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
}

.nav-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.15);
}

.next-btn {
  min-width: 120px;
  font-weight: 500;
}

.budget-category-card {
  overflow: visible;
  transition: transform 0.2s, box-shadow 0.2s;
}

.budget-category-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
}

.budget-category-card-active {
  box-shadow: 0 0 0 2px var(--q-primary);
  transform: translateY(-2px);
}

.budget-category-name {
  font-weight: 500;
}

.budget-input {
  min-width: 110px;
  font-weight: 500;
  font-size: 1.05rem;
}

.budget-tips {
  padding: 10px;
  border-radius: 8px;
  background-color: #fff8e1;
  display: flex;
  align-items: center;
  gap: 8px;
}

.day-card {
  overflow: hidden;
}

.day-header {
  background: linear-gradient(to right, #e3f2fd, #bbdefb);
  padding: 12px 16px;
}

.checklist-card {
  background-color: white;
}

.completed-item {
  background-color: #f5f5f5;
  opacity: 0.8;
}

.q-field--filled .q-field__control {
  border-radius: 8px;
  background-color: #f5f5f5;
}

.q-field--filled:hover .q-field__control {
  background-color: #eeeeee;
}

.q-field--focused .q-field__control {
  box-shadow: 0 0 0 2px rgba(25, 118, 210, 0.2);
}

.destination-card {
  border-radius: 8px;
  overflow: hidden;
  transition: transform 0.3s, box-shadow 0.3s;
}

.destination-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 8px 15px rgba(0, 0, 0, 0.15);
}

.section-header {
  margin-bottom: 20px;
  padding-bottom: 10px;
  border-bottom: 1px solid rgba(0, 0, 0, 0.1);
}

.no-data-placeholder {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 40px 20px;
  background-color: white;
  border-radius: 12px;
  margin: 20px 0;
  text-align: center;
}

.loading-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 400px;
  background-color: rgba(255, 255, 255, 0.5);
  border-radius: 12px;
}

.save-notification {
  font-weight: 500;
  font-size: 16px;
}

.rounded-borders {
  border-radius: 8px;
}

@media (max-width: 599px) {
  .q-card {
    margin-bottom: 12px;
  }
  
  .q-card-section {
    padding: 12px;
  }
  
  .q-item {
    min-height: 48px;
    padding: 8px 12px;
  }
  
  .budget-categories .row.items-center {
    flex-direction: row !important;
    flex-wrap: nowrap !important;
  }
  
  .budget-categories .q-card-section {
    padding: 8px 12px;
  }
  
  .q-form .q-field {
    margin-bottom: 12px;
  }
  
  .budget-categories .q-input {
    padding: 4px 0;
  }
  
  .mobile-bottom-nav .text-caption {
    font-size: 0.65rem;
    margin-top: 2px;
  }
  
  .container {
    padding: 0 12px;
  }
  
  .nav-btn {
    min-height: 42px;
  }
  
  .section-header .text-h5 {
    font-size: 1.25rem;
  }
}

@media (min-width: 600px) and (max-width: 1023px) {
  .container {
    padding: 0 24px;
  }
  
  .section-header {
    margin-bottom: 30px;
  }
}

.bg-primary-7 {
  background-color: rgba(25, 118, 210, 0.7);
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

.step-card {
  background-color: white;
  transition: all 0.3s ease;
}

.step-card-active {
  box-shadow: 0 8px 16px rgba(0, 0, 0, 0.1);
  transform: translateY(-5px);
  border-color: var(--q-primary);
}

.step-header {
  display: flex;
  align-items: center;
  margin-bottom: 24px;
}

.step-number {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background-color: var(--q-primary);
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 20px;
  font-weight: bold;
}

.custom-field {
  margin-bottom: 24px;
}

.field-label {
  display: flex;
  align-items: center;
  margin-bottom: 8px;
  font-weight: 500;
}

.calendar-view {
  background-color: white;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.05);
  padding: 16px;
  border: 1px solid rgba(0, 0, 0, 0.1);
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

.activity-accommodation {
  background-color: #e8f5e9;
  border-left-color: #4caf50;
}

.activity-food {
  background-color: #fff8e1;
  border-left-color: #ffc107;
}

.activity-transportation {
  background-color: #e1f5fe;
  border-left-color: #03a9f4;
}

.activity-sightseeing {
  background-color: #f3e5f5;
  border-left-color: #9c27b0;
}

.activity-shopping {
  background-color: #fce4ec;
  border-left-color: #e91e63;
}

.add-activity-btn {
  opacity: 0.3;
  transition: opacity 0.2s ease;
}

.timeslot-content:hover .add-activity-btn {
  opacity: 1;
}

.add-activity-row {
  text-align: center;
  padding: 16px 0;
}

.activity-item-accommodation {
  border-left: 4px solid #4caf50;
}

.activity-item-food {
  border-left: 4px solid #ff9800;
}

.activity-item-transportation {
  border-left: 4px solid #2196f3;
}

.activity-item-sightseeing {
  border-left: 4px solid #9c27b0;
}

.empty-day-placeholder {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 40px 0;
  text-align: center;
}

.ai-assistant-card {
  background-color: #f5f7ff;
  transition: all 0.3s ease;
}

.ai-assistant-card:hover {
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.08);
}

.destination-dialog {
  width: 90vw;
  max-width: 800px;
}

.suggestions-card {
  background-color: #f5f7fa;
}

.budget-category-card {
  border-left: 4px solid transparent;
}

.budget-category-card-active {
  border-left-color: var(--q-primary);
}

@media (max-width: 599px) {
  .immersive-header {
    height: 150px;
  }
  
  .step-header {
    margin-bottom: 16px;
  }
  
  .custom-field {
    margin-bottom: 16px;
  }
  
  .calendar-day {
    min-width: 100px;
  }
  
  .timeslot-time {
    width: 40px;
    font-size: 0.7rem;
  }
  
  .activity-item {
    padding: 4px 6px;
    font-size: 0.8rem;
  }
  
  .content-wrapper {
    margin-bottom: 90px;
  }
  
  .mobile-bottom-nav {
    height: 70px;
    padding: 8px 0;
  }

  .trip-edit-page {
    padding-bottom: 90px;
  }
}
</style>
