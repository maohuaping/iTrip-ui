<template>
  <q-page class="plan-trip-page">
    <div class="planning-header bg-primary text-white q-pa-md">
      <div class="container">
        <div class="row justify-between items-center">
          <div class="col-12 col-md-6">
            <h1 class="text-h4 q-mb-sm">开始规划您的旅行</h1>
            <p class="text-subtitle1">定制专属于您的完美旅程</p>
          </div>
          <div class="col-12 col-md-6 text-center text-md-right q-mt-sm q-mt-md-none">
            <q-btn flat round icon="arrow_back" color="white" to="/trip" />
            <q-btn unelevated color="white" text-color="primary" label="保存行程" class="q-ml-md" @click="saveTrip" />
          </div>
        </div>
      </div>
    </div>

    <div class="container q-py-lg">
      <div class="row q-col-gutter-lg">
        <!-- 左侧行程规划 -->
        <div class="col-12 col-lg-8">
          <!-- 第一步：基本信息 -->
          <q-card class="q-mb-md">
            <q-card-section>
              <div class="text-h6 q-mb-md">
                <q-icon name="info" class="q-mr-sm" color="primary" />
                行程基本信息
              </div>
              <q-form ref="tripForm" class="row q-col-gutter-md">
                <div class="col-12">
                  <q-input
                    filled
                    v-model="trip.name"
                    label="行程名称 *"
                    hint="为您的旅行起个名字"
                    :rules="[val => !!val || '请输入行程名称']"
                  />
                </div>
                <div class="col-12 col-md-6">
                  <q-input
                    filled
                    v-model="trip.destination"
                    label="目的地 *"
                    hint="您计划去哪里"
                    :rules="[val => !!val || '请输入目的地']"
                  >
                    <template v-slot:prepend>
                      <q-icon name="place" />
                    </template>
                  </q-input>
                </div>
                <div class="col-12 col-md-6">
                  <q-input
                    filled
                    v-model="trip.dateRange"
                    label="出行日期 *"
                    hint="您计划何时出发"
                    readonly
                    :rules="[val => !!val || '请选择日期']"
                  >
                    <template v-slot:prepend>
                      <q-icon name="event" />
                    </template>
                    <template v-slot:append>
                      <q-icon name="event" class="cursor-pointer">
                        <q-popup-proxy ref="qDateProxy" transition-show="scale" transition-hide="scale">
                          <q-date
                            v-model="trip.dateRange"
                            range
                            minimal
                            @update:model-value="() => $refs.qDateProxy.hide()"
                          />
                        </q-popup-proxy>
                      </q-icon>
                    </template>
                  </q-input>
                </div>
                <div class="col-12 col-md-6">
                  <q-select
                    filled
                    v-model="trip.travelers"
                    :options="travelerOptions"
                    label="旅行人数 *"
                    hint="您的同行人数"
                    :rules="[val => !!val || '请选择旅行人数']"
                  >
                    <template v-slot:prepend>
                      <q-icon name="people" />
                    </template>
                  </q-select>
                </div>
                <div class="col-12 col-md-6">
                  <q-select
                    filled
                    v-model="trip.tripType"
                    :options="tripTypeOptions"
                    label="旅行类型"
                    hint="您计划的旅行风格"
                  >
                    <template v-slot:prepend>
                      <q-icon name="category" />
                    </template>
                  </q-select>
                </div>
                <div class="col-12">
                  <q-input
                    filled
                    v-model="trip.description"
                    type="textarea"
                    label="行程描述"
                    hint="简单描述您的旅行计划"
                  />
                </div>
              </q-form>
            </q-card-section>
          </q-card>

          <!-- 第二步：行程安排 -->
          <q-card class="q-mb-md">
            <q-card-section>
              <div class="text-h6 q-mb-md">
                <q-icon name="map" class="q-mr-sm" color="primary" />
                行程安排
              </div>

              <div class="text-subtitle1 q-mb-sm">您的行程天数：{{ getDaysBetween() }} 天</div>
              
              <div v-if="getDaysBetween() > 0">
                <q-timeline color="primary">
                  <q-timeline-entry
                    v-for="(day, index) in days"
                    :key="index"
                    :title="`第 ${index + 1} 天 (${formatDate(day.date)})`"
                    icon="today"
                  >
                    <div class="q-pa-md">
                      <q-list bordered separator>
                        <q-item v-for="(activity, actIndex) in day.activities" :key="actIndex">
                          <q-item-section avatar>
                            <q-icon :name="getActivityIcon(activity.type)" color="primary" />
                          </q-item-section>
                          <q-item-section>
                            <q-item-label>{{ activity.time }} - {{ activity.name }}</q-item-label>
                            <q-item-label caption>{{ activity.location }}</q-item-label>
                            <q-item-label caption v-if="activity.note">{{ activity.note }}</q-item-label>
                          </q-item-section>
                          <q-item-section side>
                            <div class="row items-center">
                              <q-btn flat round dense icon="edit" size="sm" @click="editActivity(index, actIndex)" />
                              <q-btn flat round dense icon="delete" size="sm" @click="removeActivity(index, actIndex)" />
                            </div>
                          </q-item-section>
                        </q-item>

                        <q-item clickable @click="addNewActivity(index)" class="text-primary">
                          <q-item-section avatar>
                            <q-icon name="add_circle" color="primary" />
                          </q-item-section>
                          <q-item-section>
                            <q-item-label>添加活动</q-item-label>
                          </q-item-section>
                        </q-item>
                      </q-list>
                    </div>
                  </q-timeline-entry>
                </q-timeline>
              </div>
              <div v-else class="text-center q-pa-md text-grey">
                请先在上方选择旅行日期
              </div>
            </q-card-section>
          </q-card>

          <!-- 第三步：预算规划 -->
          <q-card class="q-mb-md">
            <q-card-section>
              <div class="text-h6 q-mb-md">
                <q-icon name="account_balance_wallet" class="q-mr-sm" color="primary" />
                预算规划
              </div>
              
              <div class="row q-col-gutter-md">
                <div class="col-12 col-md-6">
                  <q-input
                    filled
                    v-model.number="trip.budget.total"
                    type="number"
                    label="总预算"
                    suffix="元"
                  >
                    <template v-slot:prepend>
                      <q-icon name="paid" />
                    </template>
                  </q-input>
                </div>
                <div class="col-12 col-md-6">
                  <q-select
                    filled
                    v-model="trip.budget.currency"
                    :options="currencyOptions"
                    label="货币"
                  >
                    <template v-slot:prepend>
                      <q-icon name="currency_exchange" />
                    </template>
                  </q-select>
                </div>
              </div>
              
              <q-list bordered separator class="q-mt-md">
                <q-item v-for="(category, index) in budgetCategories" :key="index">
                  <q-item-section avatar>
                    <q-icon :name="category.icon" color="primary" />
                  </q-item-section>
                  <q-item-section>
                    <q-item-label>{{ category.name }}</q-item-label>
                  </q-item-section>
                  <q-item-section side>
                    <q-input
                      dense
                      v-model.number="trip.budget.categories[category.id]"
                      type="number"
                      suffix="元"
                      input-class="text-right"
                      style="width: 120px"
                    />
                  </q-item-section>
                </q-item>
              </q-list>
              
              <div class="text-subtitle1 q-mt-md">
                已分配预算：{{ getTotalAllocatedBudget() }} 元 / {{ trip.budget.total || 0 }} 元
              </div>
              <q-linear-progress
                :value="getBudgetProgressValue()"
                size="10px"
                :color="getBudgetProgressColor()"
                class="q-mt-sm"
              />
            </q-card-section>
          </q-card>

          <!-- 第四步：备忘清单 -->
          <q-card>
            <q-card-section>
              <div class="text-h6 q-mb-md">
                <q-icon name="checklist" class="q-mr-sm" color="primary" />
                旅行清单
              </div>
              
              <div class="q-mb-md">
                <div class="row items-center">
                  <div class="col">
                    <q-input
                      filled
                      v-model="newItemText"
                      label="添加物品或任务"
                      dense
                      @keyup.enter="addTodoItem"
                    >
                      <template v-slot:append>
                        <q-btn
                          round
                          dense
                          flat
                          icon="add"
                          @click="addTodoItem"
                        />
                      </template>
                    </q-input>
                  </div>
                </div>
              </div>
              
              <q-list bordered separator>
                <q-item
                  v-for="(item, index) in trip.todoList"
                  :key="index"
                  tag="label"
                  v-ripple
                >
                  <q-item-section side>
                    <q-checkbox v-model="item.done" />
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
                      @click.stop="removeTodoItem(index)"
                    />
                  </q-item-section>
                </q-item>
                
                <q-item v-if="trip.todoList.length === 0">
                  <q-item-section class="text-grey text-center">
                    添加旅行所需物品和待办事项
                  </q-item-section>
                </q-item>
              </q-list>
            </q-card-section>
          </q-card>
        </div>
        
        <!-- 右侧信息栏 -->
        <div class="col-12 col-lg-4">
          <!-- 行程概览 -->
          <q-card class="q-mb-md sticky-top">
            <q-img src="https://images.unsplash.com/photo-1469854523086-cc02fe5d8800" height="150px">
              <div class="absolute-full text-subtitle1 flex flex-center" style="background-color: rgba(0, 0, 0, 0.5)">
                <div class="text-center text-white">
                  <div class="text-h6 q-mb-sm">{{ trip.name || '您的旅行计划' }}</div>
                  <q-badge color="primary" v-if="trip.dateRange">
                    <q-icon name="date_range" size="xs" class="q-mr-xs" />
                    {{ formatDateRange(trip.dateRange) }}
                  </q-badge>
                </div>
              </div>
            </q-img>
            <q-card-section>
              <q-list dense>
                <q-item v-if="trip.destination">
                  <q-item-section avatar>
                    <q-icon name="place" color="primary" />
                  </q-item-section>
                  <q-item-section>
                    <q-item-label>目的地</q-item-label>
                    <q-item-label caption>{{ trip.destination }}</q-item-label>
                  </q-item-section>
                </q-item>
                
                <q-item v-if="trip.travelers">
                  <q-item-section avatar>
                    <q-icon name="people" color="primary" />
                  </q-item-section>
                  <q-item-section>
                    <q-item-label>旅行人数</q-item-label>
                    <q-item-label caption>{{ trip.travelers.label }}</q-item-label>
                  </q-item-section>
                </q-item>
                
                <q-item v-if="trip.tripType">
                  <q-item-section avatar>
                    <q-icon name="category" color="primary" />
                  </q-item-section>
                  <q-item-section>
                    <q-item-label>旅行类型</q-item-label>
                    <q-item-label caption>{{ trip.tripType.label }}</q-item-label>
                  </q-item-section>
                </q-item>
                
                <q-item v-if="trip.budget.total">
                  <q-item-section avatar>
                    <q-icon name="account_balance_wallet" color="primary" />
                  </q-item-section>
                  <q-item-section>
                    <q-item-label>预算</q-item-label>
                    <q-item-label caption>{{ trip.budget.total }} {{ trip.budget.currency }}</q-item-label>
                  </q-item-section>
                </q-item>
              </q-list>
            </q-card-section>
            
            <q-card-actions vertical>
              <q-btn color="primary" label="保存行程" class="full-width" @click="saveTrip" />
              <q-btn outline color="negative" label="重置" class="full-width q-mt-sm" @click="confirmReset" />
            </q-card-actions>
          </q-card>
          
          <!-- 旅行小贴士 -->
          <q-card class="q-mb-md">
            <q-card-section>
              <div class="text-h6 q-mb-md">
                <q-icon name="lightbulb" class="q-mr-sm text-warning" />
                旅行小贴士
              </div>
              <q-list dense separator>
                <q-item v-for="(tip, index) in travelTips" :key="index">
                  <q-item-section avatar>
                    <q-icon name="tips_and_updates" color="warning" />
                  </q-item-section>
                  <q-item-section>
                    <q-item-label>{{ tip }}</q-item-label>
                  </q-item-section>
                </q-item>
              </q-list>
            </q-card-section>
          </q-card>
          
          <!-- 热门推荐 -->
          <q-card>
            <q-card-section>
              <div class="text-h6 q-mb-md">
                <q-icon name="recommend" class="q-mr-sm text-primary" />
                热门目的地
              </div>
              <div class="row q-col-gutter-sm">
                <div class="col-6" v-for="(dest, index) in popularDestinations" :key="index">
                  <q-card flat bordered class="cursor-pointer" @click="selectDestination(dest)">
                    <q-img :src="dest.image" :ratio="1">
                      <div class="absolute-bottom text-subtitle2 text-center bg-transparent">
                        <q-chip
                          color="primary"
                          text-color="white"
                          size="sm"
                        >
                          {{ dest.name }}
                        </q-chip>
                      </div>
                    </q-img>
                  </q-card>
                </div>
              </div>
            </q-card-section>
          </q-card>
        </div>
      </div>
    </div>
    
    <!-- 活动编辑对话框 -->
    <q-dialog v-model="activityDialog.show" persistent>
      <q-card style="min-width: 350px">
        <q-card-section>
          <div class="text-h6">{{ activityDialog.isEdit ? '编辑活动' : '添加活动' }}</div>
        </q-card-section>

        <q-card-section>
          <q-form @submit="saveActivity">
            <div class="q-gutter-md">
              <q-input
                filled
                v-model="activityDialog.activity.name"
                label="活动名称 *"
                :rules="[val => !!val || '请输入活动名称']"
              />
              
              <q-input
                filled
                v-model="activityDialog.activity.time"
                label="时间 *"
                mask="##:##"
                :rules="[
                  val => !!val || '请输入时间',
                  val => /^([01]?[0-9]|2[0-3]):[0-5][0-9]$/.test(val) || '请输入有效的时间格式 (HH:MM)'
                ]"
              >
                <template v-slot:prepend>
                  <q-icon name="access_time" />
                </template>
              </q-input>
              
              <q-input
                filled
                v-model="activityDialog.activity.location"
                label="地点"
              >
                <template v-slot:prepend>
                  <q-icon name="place" />
                </template>
              </q-input>
              
              <q-select
                filled
                v-model="activityDialog.activity.type"
                :options="activityTypeOptions"
                label="活动类型"
              >
                <template v-slot:prepend>
                  <q-icon name="category" />
                </template>
              </q-select>
              
              <q-input
                filled
                v-model="activityDialog.activity.note"
                type="textarea"
                label="备注"
              />
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
      travelTips: [
        '提前至少3个月预订国际航班可以节省费用',
        '准备一个紧急联系人列表并分享您的行程',
        '购买旅行保险以应对突发情况',
        '检查目的地的天气预报来准备合适的衣物',
        '出行前确认护照和签证的有效期',
        '准备一个基本的急救包',
        '下载离线地图，以防没有网络连接'
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
        }
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
  methods: {
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
    
    // 添加待办事项
    addTodoItem() {
      if (!this.newItemText.trim()) return;
      
      this.trip.todoList.push({
        text: this.newItemText.trim(),
        done: false
      });
      
      this.newItemText = '';
    },
    
    // 删除待办事项
    removeTodoItem(index) {
      this.trip.todoList.splice(index, 1);
    },
    
    // 选择推荐目的地
    selectDestination(destination) {
      this.trip.destination = destination.name;
      this.$q.notify({
        color: 'positive',
        textColor: 'white',
        icon: 'check_circle',
        message: `已选择 ${destination.name} 作为目的地`
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
            message: '行程保存成功！'
          });
          
          // 在实际应用中，这里可能会导航到行程详情页面
          // this.$router.push(`/trip/detail/${tripId}`);
        } else {
          this.$q.notify({
            color: 'negative',
            textColor: 'white',
            icon: 'warning',
            message: '请填写必填信息'
          });
        }
      });
    },
    
    // 确认重置
    confirmReset() {
      this.$q.dialog({
        title: '确认重置',
        message: '您确定要重置所有行程信息吗？这将清除所有已输入的数据。',
        cancel: true,
        persistent: true
      }).onOk(() => {
        this.resetForm();
      });
    },
    
    // 重置表单
    resetForm() {
      this.trip = {
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
      };
      
      this.days = [];
      this.newItemText = '';
      
      this.$q.notify({
        color: 'info',
        textColor: 'white',
        icon: 'refresh',
        message: '行程已重置'
      });
    }
  },
  created() {
    // 从本地存储或者服务器加载草稿数据
    // 这里可以添加加载保存的草稿行程的逻辑
  }
}
</script>

<style scoped>
.container {
  max-width: 1200px;
  margin: 0 auto;
}

.planning-header {
  position: sticky;
  top: 0;
  z-index: 10;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
}

.sticky-top {
  position: sticky;
  top: 80px;
}

/* 动画效果 */
.destination-card {
  transition: transform 0.3s, box-shadow 0.3s;
}

.destination-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.1);
}

/* 删除线样式 */
.text-strike {
  text-decoration: line-through;
  color: #a0a0a0;
}

/* 移动端适配 */
@media (max-width: 599px) {
  .sticky-top {
    position: static;
  }
  
  .row.no-wrap {
    flex-wrap: wrap !important;
  }
  
  .q-timeline__entry {
    padding-left: 40px !important;
  }
  
  .q-timeline__subtitle {
    padding-top: 8px;
  }
}

/* 时间线样式美化 */
.q-timeline__entry {
  margin-bottom: 10px;
}

.q-timeline__dot {
  width: 40px;
  height: 40px;
}

/* 表单控件间距 */
.q-field {
  margin-bottom: 12px;
}
</style> 