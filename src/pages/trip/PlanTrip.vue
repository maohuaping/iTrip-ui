<template>
  <q-page class="plan-trip-page">
    <!-- 头部 - 更具视觉冲击力的渐变设计 -->
    <div class="header-section text-white q-pa-md">
      <div class="container">
        <div class="row items-center justify-between">
          <div class="col-auto">
            <q-btn flat round dense icon="arrow_back" color="white" to="/trip" />
          </div>
          <div class="col">
            <h1 class="text-h5 text-center q-my-none">旅行规划</h1>
          </div>
          <div class="col-auto">
            <q-btn flat round dense icon="save" color="white" @click="saveTrip" />
          </div>
        </div>
      </div>
    </div>

    <!-- 底部导航增加动画效果 -->
    <div class="mobile-bottom-nav bg-white shadow-up-1 fixed-bottom q-py-sm" v-if="$q.screen.lt.md">
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

    <!-- PC端标签导航 - 更现代的设计 -->
    <div class="desktop-tabs" v-if="$q.screen.gt.sm">
      <div class="container">
        <q-tabs
          v-model="currentStep"
          class="text-primary"
          indicator-color="primary"
          align="justify"
          active-color="primary"
          active-bg-color="blue-1"
          narrow-indicator
          dense
        >
          <q-route-tab v-for="(step, index) in planSteps" :key="index" :name="(index + 1).toString()">
            <div class="row items-center q-gutter-x-sm">
              <q-icon :name="step.icon" size="sm" />
              <div>{{ step.title }}</div>
            </div>
          </q-route-tab>
        </q-tabs>
      </div>
    </div>

    <!-- 主内容区 - 带过渡动画 -->
    <div class="container q-py-md content-wrapper">
      <q-tab-panels
        v-model="currentStep"
        animated
        swipeable
        transition-prev="scale"
        transition-next="scale"
        class="transparent"
      >
        <!-- 第一步：基本信息 -->
        <q-tab-panel name="1">
          <div class="section-header">
            <div class="text-h5 text-primary">
              <q-icon name="info" class="q-mr-sm" />
              行程基本信息
            </div>
            <div class="text-caption text-grey">第一步：填写您的旅行基本信息</div>
          </div>
          
          <q-form ref="tripForm" @submit="goToNextStep">
            <q-card flat bordered class="form-card q-mt-md">
              <q-card-section>
                <q-input
                  filled
                  v-model="trip.name"
                  label="行程名称 *"
                  stack-label
                  :rules="[val => !!val || '请输入行程名称']"
                  class="custom-input"
                >
                  <template v-slot:prepend>
                    <q-icon name="edit" color="primary" />
                  </template>
                </q-input>
                
                <q-input
                  filled
                  v-model="trip.destination"
                  label="目的地 *"
                  stack-label
                  :rules="[val => !!val || '请输入目的地']"
                  class="custom-input q-mt-md"
                >
                  <template v-slot:prepend>
                    <q-icon name="place" color="deep-orange" />
                  </template>
                  <template v-slot:append>
                    <q-btn round flat dense icon="travel_explore" color="primary" @click="showDestinationSuggestions = true">
                      <q-tooltip>浏览热门目的地</q-tooltip>
                    </q-btn>
                  </template>
                </q-input>
                
                <q-input
                  filled
                  v-model="trip.dateRange"
                  label="出行日期 *"
                  stack-label
                  readonly
                  :rules="[val => !!val || '请选择日期']"
                  class="custom-input q-mt-md"
                >
                  <template v-slot:prepend>
                    <q-icon name="event" color="green" />
                  </template>
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
                
                <div class="row q-col-gutter-md q-mt-md">
                  <div class="col-12 col-md-6">
                    <q-select
                      filled
                      v-model="trip.travelers"
                      :options="travelerOptions"
                      label="旅行人数 *"
                      stack-label
                      :rules="[val => !!val || '请选择旅行人数']"
                      class="custom-input"
                    >
                      <template v-slot:prepend>
                        <q-icon name="people" color="purple" />
                      </template>
                    </q-select>
                  </div>
                  
                  <div class="col-12 col-md-6">
                    <q-select
                      filled
                      v-model="trip.tripType"
                      :options="tripTypeOptions"
                      label="旅行类型"
                      stack-label
                      class="custom-input"
                    >
                      <template v-slot:prepend>
                        <q-icon name="category" color="blue" />
                      </template>
                    </q-select>
                  </div>
                </div>
                
                <q-input
                  filled
                  v-model="trip.description"
                  type="textarea"
                  label="行程描述"
                  stack-label
                  autogrow
                  class="custom-input q-mt-md"
                >
                  <template v-slot:prepend>
                    <q-icon name="description" color="teal" />
                  </template>
                </q-input>
              </q-card-section>
            </q-card>
            
            <div class="row justify-end q-mt-lg">
              <q-btn 
                color="primary" 
                type="submit"
                label="下一步" 
                :disable="!trip.name || !trip.destination || !trip.dateRange"
                class="next-btn"
                icon-right="arrow_forward"
              />
            </div>
          </q-form>
          
          <!-- 热门目的地推荐 -->
          <q-dialog v-model="showDestinationSuggestions" persistent>
            <q-card style="width: 90vw; max-width: 500px">
              <q-card-section class="row items-center">
                <div class="text-h6">热门目的地</div>
                <q-space />
                <q-btn icon="close" flat round dense v-close-popup />
              </q-card-section>
              
              <q-card-section class="scroll" style="max-height: 60vh">
                <div class="row q-col-gutter-sm">
                  <div v-for="(dest, index) in popularDestinations" :key="index" class="col-6">
                    <q-card class="destination-card cursor-pointer" flat @click="selectDestination(dest)">
                      <q-img :src="dest.image" height="120px">
                        <div class="absolute-bottom text-subtitle2 text-center bg-primary-7">
                          {{ dest.name }}
                        </div>
                      </q-img>
                    </q-card>
                  </div>
                </div>
              </q-card-section>
            </q-card>
          </q-dialog>
        </q-tab-panel>

        <!-- 第二步：行程安排 -->
        <q-tab-panel name="2">
          <div class="section-header">
            <div class="text-h5 text-primary">
              <q-icon name="map" class="q-mr-sm" />
              行程安排
            </div>
            <div class="text-caption text-grey">第二步：规划每天的活动安排</div>
          </div>
          
          <div class="stats-card q-mt-md q-pa-md bg-blue-1 rounded-borders">
            <div class="row items-center">
              <div class="col">
                <div class="text-h6">您的行程天数</div>
                <div class="text-subtitle1">共 {{ getDaysBetween() }} 天</div>
              </div>
              <div class="col-auto">
                <q-icon name="date_range" size="2.5rem" color="primary" />
              </div>
            </div>
          </div>
          
          <div v-if="getDaysBetween() > 0" class="q-mt-md">
            <q-card v-for="(day, index) in days" :key="index" flat bordered class="day-card q-mb-md">
              <q-card-section class="day-header">
                <div class="row items-center justify-between">
                  <div class="col">
                    <div class="text-h6">第 {{ index + 1 }} 天</div>
                    <div class="text-subtitle2">{{ formatDate(day.date) }}</div>
                  </div>
                  <div class="col-auto">
                    <q-avatar color="white" text-color="primary" size="md">
                      <q-icon name="today" />
                    </q-avatar>
                  </div>
                </div>
              </q-card-section>
              
              <q-separator />
              
              <q-card-section>
                <q-timeline color="secondary">
                  <q-timeline-entry
                    v-for="(activity, actIndex) in day.activities"
                    :key="actIndex"
                    :title="activity.name"
                    :subtitle="activity.time"
                    :icon="getActivityIcon(activity.type)"
                    :color="getActivityColor(activity.type)"
                  >
                    <div>
                      <div v-if="activity.location" class="q-mb-xs">
                        <q-icon name="place" size="xs" color="grey-7" /> {{ activity.location }}
                      </div>
                      <div v-if="activity.note" class="text-grey-8">{{ activity.note }}</div>
                      
                      <div class="row justify-end q-mt-sm">
                        <q-btn flat round dense icon="edit" color="primary" @click="editActivity(index, actIndex)" />
                        <q-btn flat round dense icon="delete" color="negative" @click="removeActivity(index, actIndex)" />
                      </div>
                    </div>
                  </q-timeline-entry>
                  
                  <q-timeline-entry
                    title="添加新活动"
                    icon="add"
                    color="primary"
                  >
                    <div>
                      <q-btn
                        label="添加活动"
                        color="primary"
                        outline
                        class="full-width"
                        @click="addNewActivity(index)"
                        icon="add_circle"
                      />
                    </div>
                  </q-timeline-entry>
                </q-timeline>
              </q-card-section>
            </q-card>
          </div>
          <div v-else class="no-data-placeholder">
            <q-icon name="event_busy" size="4rem" color="grey-5" />
            <div class="text-subtitle1 text-grey q-mt-sm">请先在基本信息步骤中选择旅行日期</div>
          </div>
          
          <div class="row justify-between q-mt-lg">
            <q-btn outline color="primary" icon="arrow_back" label="上一步" @click="goToPrevStep" class="nav-btn" />
            <q-btn color="primary" label="下一步" icon-right="arrow_forward" @click="goToNextStep" class="nav-btn" />
          </div>
        </q-tab-panel>

        <!-- 第三步：预算规划 -->
        <q-tab-panel name="3">
          <div class="section-header">
            <div class="text-h5 text-primary">
              <q-icon name="account_balance_wallet" class="q-mr-sm" />
              预算规划
            </div>
            <div class="text-caption text-grey">第三步：设置旅行预算</div>
          </div>
          
          <q-card flat bordered class="budget-card q-mt-md">
            <q-card-section class="bg-green-1">
              <div class="row items-center">
                <div class="col">
                  <div class="text-h6">总预算设置</div>
                </div>
                <div class="col-auto">
                  <q-icon name="savings" size="2rem" color="green" />
                </div>
              </div>
            </q-card-section>
            
            <q-card-section>
              <div class="row q-col-gutter-md">
                <div class="col-12 col-md-7">
                  <q-input
                    filled
                    v-model.number="trip.budget.total"
                    type="number"
                    label="总预算"
                    stack-label
                    class="custom-input"
                  >
                    <template v-slot:prepend>
                      <q-icon name="paid" color="green" />
                    </template>
                    <template v-slot:append>
                      <q-chip dense color="green" text-color="white">
                        {{ trip.budget.currency }}
                      </q-chip>
                    </template>
                  </q-input>
                </div>
                <div class="col-12 col-md-5">
                  <q-select
                    filled
                    v-model="trip.budget.currency"
                    :options="currencyOptions"
                    label="货币"
                    stack-label
                    class="custom-input"
                  >
                    <template v-slot:prepend>
                      <q-icon name="currency_exchange" color="blue" />
                    </template>
                  </q-select>
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
            <div class="text-caption text-grey">第四步：添加待办事项和物品清单</div>
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
            <q-btn color="positive" icon-right="check_circle" label="完成规划" @click="saveTrip" class="nav-btn" />
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
  name: 'PlanTripPage',
  data () {
    return {
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
        budget: {
          total: 0,
          currency: '¥',
          categories: {
            transportation: 0,
            accommodation: 0,
            food: 0,
            activities: 0,
            shopping: 0,
            other: 0
          }
        },
        todoList: []
      },
      days: [],
      travelerOptions: [
        { label: '1 成人', value: 1 },
        { label: '2 成人', value: 2 },
        { label: '2 成人, 1 儿童', value: '2-1' },
        { label: '2 成人, 2 儿童', value: '2-2' },
        { label: '3 成人', value: 3 },
        { label: '4 成人', value: 4 }
      ],
      tripTypeOptions: [
        { label: '休闲度假', value: 'leisure' },
        { label: '城市探索', value: 'city' },
        { label: '自然探险', value: 'nature' },
        { label: '美食之旅', value: 'food' },
        { label: '文化体验', value: 'culture' },
        { label: '家庭旅行', value: 'family' },
        { label: '奢华体验', value: 'luxury' },
        { label: '商务旅行', value: 'business' }
      ],
      currencyOptions: ['¥', '$', '€', '£'],
      budgetCategories: [
        { name: '交通费用', id: 'transportation', icon: 'flight' },
        { name: '住宿费用', id: 'accommodation', icon: 'hotel' },
        { name: '餐饮费用', id: 'food', icon: 'restaurant' },
        { name: '活动门票', id: 'activities', icon: 'attractions' },
        { name: '购物', id: 'shopping', icon: 'shopping_bag' },
        { name: '其他费用', id: 'other', icon: 'more_horiz' }
      ],
      activityTypeOptions: [
        { label: '景点游览', value: 'sightseeing' },
        { label: '用餐', value: 'dining' },
        { label: '交通', value: 'transportation' },
        { label: '住宿入住', value: 'checkin' },
        { label: '退房', value: 'checkout' },
        { label: '购物', value: 'shopping' },
        { label: '休闲活动', value: 'leisure' },
        { label: '其他', value: 'other' }
      ],
      activityDialog: {
        show: false,
        isEdit: false,
        dayIndex: null,
        activityIndex: null,
        activity: {
          name: '',
          time: '',
          location: '',
          type: { label: '景点游览', value: 'sightseeing' },
          note: ''
        }
      },
      newItemText: '',
      quickItems: [
        '护照', '充电器', '转换插头', '现金', '信用卡', 
        '墨镜', '防晒霜', '雨伞', '常用药', '洗漱用品'
      ],
      popularDestinations: [
        {
          name: '东京',
          image: 'https://images.unsplash.com/photo-1503899036084-c55cdd92da26'
        },
        {
          name: '巴黎',
          image: 'https://images.unsplash.com/photo-1502602898657-3e91760cbb34'
        },
        {
          name: '巴厘岛',
          image: 'https://images.unsplash.com/photo-1554481923-a6918bd997bc'
        },
        {
          name: '纽约',
          image: 'https://images.unsplash.com/photo-1496442226666-8d4d0e62e6e9'
        },
        {
          name: '伦敦',
          image: 'https://images.unsplash.com/photo-1533929736458-ca588d08c8be'
        },
        {
          name: '香港',
          image: 'https://images.unsplash.com/photo-1536599018102-9f803c140fc1'
        }
      ],
      budgetTips: [
        '旅行预算中建议为交通分配约30%',
        '住宿通常占据旅行预算的25-35%',
        '餐饮费用建议保持在预算的20%左右',
        '为意外支出预留10-15%的预算',
        '提前预订可以节省大量门票和住宿费用',
        '合理分配购物预算可以避免冲动消费'
      ]
    }
  },
  watch: {
    'trip.dateRange': {
      handler(newVal) {
        if (newVal && newVal.from && newVal.to) {
          this.generateDays();
        }
      },
      deep: true
    }
  },
  mounted() {
    // 加载页面时淡入动画效果
    document.body.classList.add('page-loaded');
  },
  methods: {
    // 进入下一步
    goToNextStep() {
      let nextStep = parseInt(this.currentStep) + 1;
      if (nextStep <= 4) {
        this.currentStep = nextStep.toString();
      }
    },
    
    // 返回上一步
    goToPrevStep() {
      let prevStep = parseInt(this.currentStep) - 1;
      if (prevStep >= 1) {
        this.currentStep = prevStep.toString();
      }
    },
    
    // 生成行程天数
    generateDays() {
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
    
    // 计算两个日期之间的天数
    getDaysBetween() {
      if (!this.trip.dateRange || !this.trip.dateRange.from || !this.trip.dateRange.to) {
        return 0;
      }
      
      const fromDate = new Date(this.trip.dateRange.from);
      const toDate = new Date(this.trip.dateRange.to);
      
      // 计算两个日期之间的天数差（包括起始日期）
      const diffTime = Math.abs(toDate - fromDate);
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
      
      return diffDays;
    },
    
    // 格式化日期
    formatDate(dateString) {
      const date = new Date(dateString);
      return date.toLocaleDateString('zh-CN', { month: 'short', day: 'numeric', weekday: 'short' });
    },
    
    // 格式化日期范围
    formatDateRange(dateRange) {
      if (!dateRange || !dateRange.from || !dateRange.to) {
        return '';
      }
      
      const fromDate = new Date(dateRange.from);
      const toDate = new Date(dateRange.to);
      
      return `${fromDate.toLocaleDateString('zh-CN')} - ${toDate.toLocaleDateString('zh-CN')}`;
    },
    
    // 获取活动图标
    getActivityIcon(type) {
      if (!type) return 'event';
      
      const iconMap = {
        sightseeing: 'photo_camera',
        dining: 'restaurant',
        transportation: 'commute',
        checkin: 'hotel',
        checkout: 'logout',
        shopping: 'shopping_bag',
        leisure: 'beach_access',
        other: 'event'
      };
      
      return iconMap[type.value] || 'event';
    },
    
    // 获取活动颜色
    getActivityColor(type) {
      if (!type) return 'primary';
      
      const colorMap = {
        sightseeing: 'deep-purple',
        dining: 'orange',
        transportation: 'blue',
        checkin: 'green',
        checkout: 'red',
        shopping: 'pink',
        leisure: 'teal',
        other: 'grey'
      };
      
      return colorMap[type.value] || 'primary';
    },
    
    // 添加新活动
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
          type: { label: '景点游览', value: 'sightseeing' },
          note: ''
        }
      };
    },
    
    // 编辑活动
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
    
    // 保存活动
    saveActivity() {
      const { dayIndex, activityIndex, activity, isEdit } = this.activityDialog;
      
      if (isEdit) {
        // 更新活动
        this.days[dayIndex].activities[activityIndex] = {...activity};
      } else {
        // 添加新活动
        this.days[dayIndex].activities.push({...activity});
        
        // 按时间排序
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
    
    // 删除活动
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
    
    // 计算已分配的预算总额
    getTotalAllocatedBudget() {
      let total = 0;
      for (const category in this.trip.budget.categories) {
        total += this.trip.budget.categories[category] || 0;
      }
      return total;
    },
    
    // 获取预算进度条值
    getBudgetProgressValue() {
      if (!this.trip.budget.total) return 0;
      const allocated = this.getTotalAllocatedBudget();
      return Math.min(allocated / this.trip.budget.total, 1);
    },
    
    // 获取预算进度条颜色
    getBudgetProgressColor() {
      const value = this.getBudgetProgressValue();
      
      if (value > 1) return 'negative';
      if (value > 0.9) return 'warning';
      return 'positive';
    },
    
    // 判断预算类别是否激活
    isActiveBudgetCategory(categoryId) {
      return this.activeBudgetCategory === categoryId;
    },
    
    // 获取预算类别颜色
    getBudgetCategoryColor(categoryId) {
      const colors = {
        transportation: 'blue',
        accommodation: 'green',
        food: 'orange',
        activities: 'purple',
        shopping: 'pink',
        other: 'grey'
      };
      
      return colors[categoryId] || 'primary';
    },
    
    // 获取预算类别百分比
    getBudgetCategoryPercentage(categoryId) {
      if (!this.trip.budget.total) return 0;
      
      const categoryAmount = this.trip.budget.categories[categoryId] || 0;
      return Math.round((categoryAmount / this.trip.budget.total) * 100);
    },
    
    // 获取预算提示
    getBudgetTip() {
      return this.budgetTips[Math.floor(Math.random() * this.budgetTips.length)];
    },
    
    // 添加待办事项
    addTodoItem() {
      if (!this.newItemText.trim()) return;
      
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
    
    // 快速添加常用物品
    quickAddItem(item) {
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
    
    // 删除待办事项
    removeTodoItem(index) {
      this.trip.todoList.splice(index, 1);
    },
    
    // 确认清除已完成事项
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
    
    // 清除已完成事项
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
    
    // 获取已完成事项数量
    getCompletedItemsCount() {
      return this.trip.todoList.filter(item => item.done).length;
    },
    
    // 获取完成率
    getCompletionRate() {
      if (!this.trip.todoList.length) return 0;
      
      return this.getCompletedItemsCount() / this.trip.todoList.length;
    },
    
    // 选择目的地
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
    
    // 保存行程
    saveTrip() {
      // 验证表单
      this.$refs.tripForm.validate().then(success => {
        if (success) {
          // 这里可以添加保存到数据库或本地存储的逻辑
          const tripData = JSON.parse(JSON.stringify(this.trip));
          tripData.days = this.days;
          
          console.log('保存行程:', tripData);
          
          // 显示保存成功通知
          this.$q.notify({
            color: 'positive',
            textColor: 'white',
            icon: 'save',
            message: '行程保存成功！',
            position: 'center',
            timeout: 2000,
            classes: 'save-notification'
          });
          
          // 在实际应用中，这里可能会导航到行程详情页面
          // this.$router.push(`/trip/detail/${tripId}`);
        } else {
          this.$q.notify({
            color: 'negative',
            textColor: 'white',
            icon: 'warning',
            message: '请填写必填信息',
            position: 'center'
          });
        }
      });
    }
  }
}
</script>

<style>
.plan-trip-page {
  background-color: #f5f7fa;
  padding-bottom: 70px; /* 为移动端底部导航留出空间 */
}

.container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 16px;
}

/* 页面加载动画 */
@keyframes fadeIn {
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
}

.page-loaded .plan-trip-page {
  animation: fadeIn 0.6s ease-out;
}

/* 头部导航栏样式 */
.header-section {
  background: linear-gradient(135deg, #1976d2 0%, #2196f3 100%);
  position: sticky;
  top: 0;
  z-index: 10;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
}

.content-wrapper {
  margin-bottom: 56px; /* 为底部导航栏留出空间 */
}

/* 底部导航栏样式 */
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

/* 卡片样式 */
.q-card {
  border-radius: 12px;
  transition: all 0.3s ease;
}

.q-card:hover {
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.05);
  transform: translateY(-2px);
}

/* 表单卡片 */
.form-card {
  background-color: #fff;
  overflow: hidden;
}

.custom-input {
  margin-bottom: 16px;
}

/* 导航按钮样式 */
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

/* 预算类别卡片 */
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

/* 预算提示条样式 */
.budget-tips {
  padding: 10px;
  border-radius: 8px;
  background-color: #fff8e1;
  display: flex;
  align-items: center;
  gap: 8px;
}

/* 行程天数卡片样式 */
.day-card {
  overflow: hidden;
}

.day-header {
  background: linear-gradient(to right, #e3f2fd, #bbdefb);
  padding: 12px 16px;
}

/* 清单样式 */
.checklist-card {
  background-color: white;
}

.completed-item {
  background-color: #f5f5f5;
  opacity: 0.8;
}

/* 输入框样式 */
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

/* 目的地卡片 */
.destination-card {
  border-radius: 8px;
  overflow: hidden;
  transition: transform 0.3s, box-shadow 0.3s;
}

.destination-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 8px 15px rgba(0, 0, 0, 0.15);
}

/* 路径指示器 */
.section-header {
  margin-bottom: 20px;
  padding-bottom: 10px;
  border-bottom: 1px solid rgba(0, 0, 0, 0.1);
}

/* 无数据占位符 */
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

/* 步骤区分背景色 */
.q-tab-panel[name="1"] {
  background-color: rgba(25, 118, 210, 0.03);
}

.q-tab-panel[name="2"] {
  background-color: rgba(63, 81, 181, 0.03);
}

.q-tab-panel[name="3"] {
  background-color: rgba(0, 150, 136, 0.03);
}

.q-tab-panel[name="4"] {
  background-color: rgba(76, 175, 80, 0.03);
}

/* 保存通知样式 */
.save-notification {
  font-weight: 500;
  font-size: 16px;
}

/* 各种圆角统一 */
.rounded-borders {
  border-radius: 8px;
}

.q-avatar {
  transition: transform 0.2s;
}

.q-avatar:hover {
  transform: scale(1.1);
}

/* 统计卡片样式 */
.stats-card {
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
}

/* 移动端优化样式 */
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
  
  /* 确保预算项目在小屏幕上的文字水平排列 */
  .budget-categories .row.items-center {
    flex-direction: row !important;
    flex-wrap: nowrap !important;
  }
  
  .budget-categories .q-card-section {
    padding: 8px 12px;
  }
  
  /* 移动端下的表单间距 */
  .q-form .q-field {
    margin-bottom: 12px;
  }
  
  /* 增大预算输入区域的可点击范围 */
  .budget-categories .q-input {
    padding: 4px 0;
  }
  
  /* 底部导航文字大小 */
  .mobile-bottom-nav .text-caption {
    font-size: 0.65rem;
    margin-top: 2px;
  }
  
  /* 移动端页面边距 */
  .container {
    padding: 0 12px;
  }
  
  /* 移动端按钮大小 */
  .nav-btn {
    min-height: 42px;
  }
  
  /* 移动端标题大小 */
  .section-header .text-h5 {
    font-size: 1.25rem;
  }
}

/* 平板设备优化 */
@media (min-width: 600px) and (max-width: 1023px) {
  .container {
    padding: 0 24px;
  }
  
  .section-header {
    margin-bottom: 30px;
  }
}

/* 动画效果 */
@keyframes pulse {
  0% { transform: scale(1); }
  50% { transform: scale(1.05); }
  100% { transform: scale(1); }
}

.q-btn:focus {
  animation: pulse 0.3s ease-in-out;
}

/* 特效样式 */
.bg-primary-7 {
  background-color: rgba(25, 118, 210, 0.7);
}
</style> 