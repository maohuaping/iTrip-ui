<template>
  <q-page class="plan-trip-page">
    <!-- 简洁紧凑的页面头部 -->
    <div class="header-section bg-primary text-white q-pa-md">
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

    <!-- 底部导航栏 - 移动端优先 -->
    <div class="mobile-bottom-nav bg-white shadow-up-1 fixed-bottom q-py-sm" v-if="$q.screen.lt.md">
      <div class="row no-wrap justify-around">
        <div
          v-for="(step, index) in planSteps"
          :key="index"
          class="col text-center cursor-pointer"
          @click="currentStep = index + 1"
        >
          <q-icon
            :name="step.icon"
            :color="currentStep === index + 1 ? 'primary' : 'grey-7'"
            size="md"
          />
          <div class="text-caption" :class="currentStep === index + 1 ? 'text-primary' : 'text-grey-7'">
            {{ step.title }}
          </div>
        </div>
      </div>
    </div>

    <!-- 顶部标签导航 - PC端 -->
    <div class="desktop-tabs" v-if="$q.screen.gt.sm">
      <div class="container">
        <q-tabs
          v-model="currentStep"
          class="text-primary"
          indicator-color="primary"
          align="justify"
        >
          <q-tab v-for="(step, index) in planSteps" :key="index" :name="index + 1" :icon="step.icon" :label="step.title" />
        </q-tabs>
      </div>
    </div>

    <!-- 主内容区 - 带内容页面 -->
    <div class="container q-py-md content-wrapper">
      <q-tab-panels
        v-model="currentStep"
        animated
        swipeable
        transition-prev="slide-right"
        transition-next="slide-left"
        class="transparent"
      >
        <!-- 第一步：基本信息 -->
        <q-tab-panel name="1">
          <div class="text-h6 q-mb-md">行程基本信息</div>
          <q-form ref="tripForm" @submit="goToNextStep">
            <q-card flat bordered>
              <q-card-section>
                <q-input
                  filled
                  v-model="trip.name"
                  label="行程名称 *"
                  stack-label
                  :rules="[val => !!val || '请输入行程名称']"
                  class="q-mb-md"
                />
                
                <q-input
                  filled
                  v-model="trip.destination"
                  label="目的地 *"
                  stack-label
                  :rules="[val => !!val || '请输入目的地']"
                  class="q-mb-md"
                >
                  <template v-slot:prepend>
                    <q-icon name="place" />
                  </template>
                </q-input>
                
                <q-input
                  filled
                  v-model="trip.dateRange"
                  label="出行日期 *"
                  stack-label
                  readonly
                  :rules="[val => !!val || '请选择日期']"
                  class="q-mb-md"
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
                
                <q-select
                  filled
                  v-model="trip.travelers"
                  :options="travelerOptions"
                  label="旅行人数 *"
                  stack-label
                  :rules="[val => !!val || '请选择旅行人数']"
                  class="q-mb-md"
                >
                  <template v-slot:prepend>
                    <q-icon name="people" />
                  </template>
                </q-select>
                
                <q-select
                  filled
                  v-model="trip.tripType"
                  :options="tripTypeOptions"
                  label="旅行类型"
                  stack-label
                  class="q-mb-md"
                >
                  <template v-slot:prepend>
                    <q-icon name="category" />
                  </template>
                </q-select>
                
                <q-input
                  filled
                  v-model="trip.description"
                  type="textarea"
                  label="行程描述"
                  stack-label
                  autogrow
                />
              </q-card-section>
            </q-card>
            
            <div class="row justify-end q-mt-md">
              <q-btn 
                color="primary" 
                type="submit"
                label="下一步" 
                :disable="!trip.name || !trip.destination || !trip.dateRange"
              />
            </div>
          </q-form>
        </q-tab-panel>

        <!-- 第二步：行程安排 -->
        <q-tab-panel name="2">
          <div class="text-h6 q-mb-md">行程安排</div>
          <div class="text-subtitle2 q-mb-sm">您的行程天数：{{ getDaysBetween() }} 天</div>
          
          <div v-if="getDaysBetween() > 0">
            <q-card v-for="(day, index) in days" :key="index" flat bordered class="q-mb-md">
              <q-card-section class="bg-blue-1">
                <div class="text-h6">第 {{ index + 1 }} 天</div>
                <div class="text-subtitle2">{{ formatDate(day.date) }}</div>
              </q-card-section>
              
              <q-card-section>
                <q-list>
                  <q-item v-for="(activity, actIndex) in day.activities" :key="actIndex" class="q-mb-xs">
                    <q-item-section avatar>
                      <q-avatar color="primary" text-color="white">
                        <q-icon :name="getActivityIcon(activity.type)" />
                      </q-avatar>
                    </q-item-section>
                    <q-item-section>
                      <q-item-label>{{ activity.time }} - {{ activity.name }}</q-item-label>
                      <q-item-label caption v-if="activity.location">{{ activity.location }}</q-item-label>
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
                      <q-avatar color="primary" text-color="white">
                        <q-icon name="add" />
                      </q-avatar>
                    </q-item-section>
                    <q-item-section>
                      <q-item-label>添加活动</q-item-label>
                    </q-item-section>
                  </q-item>
                </q-list>
              </q-card-section>
            </q-card>
          </div>
          <div v-else class="text-center q-pa-md text-grey">
            请先在上方选择旅行日期
          </div>
          
          <div class="row justify-between q-mt-md">
            <q-btn outline color="primary" icon="arrow_back" label="上一步" @click="goToPrevStep" />
            <q-btn color="primary" label="下一步" @click="goToNextStep" />
          </div>
        </q-tab-panel>

        <!-- 第三步：预算规划 -->
        <q-tab-panel name="3">
          <div class="text-h6 q-mb-md">预算规划</div>
          
          <q-card flat bordered class="q-mb-md">
            <q-card-section>
              <div class="row q-col-gutter-md">
                <div class="col-12 col-md-6">
                  <q-input
                    filled
                    v-model.number="trip.budget.total"
                    type="number"
                    label="总预算"
                    stack-label
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
                    stack-label
                  >
                    <template v-slot:prepend>
                      <q-icon name="currency_exchange" />
                    </template>
                  </q-select>
                </div>
              </div>
            </q-card-section>
          </q-card>
          
          <div class="budget-categories q-mb-md">
            <q-card flat bordered v-for="(category, index) in budgetCategories" :key="index" class="q-mb-sm">
              <q-card-section class="q-pa-sm">
                <div class="row items-center no-wrap">
                  <div class="col-auto">
                    <q-avatar color="blue-1" text-color="primary">
                      <q-icon :name="category.icon" />
                    </q-avatar>
                  </div>
                  <div class="col q-px-md">
                    {{ category.name }}
                  </div>
                  <div class="col-auto">
                    <q-input
                      dense
                      v-model.number="trip.budget.categories[category.id]"
                      type="number"
                      suffix="元"
                      borderless
                      class="text-right"
                      style="min-width: 100px"
                    />
                  </div>
                </div>
              </q-card-section>
            </q-card>
          </div>
          
          <q-card flat bordered class="q-mb-md">
            <q-card-section>
              <div class="text-subtitle1">
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
          
          <div class="row justify-between q-mt-md">
            <q-btn outline color="primary" icon="arrow_back" label="上一步" @click="goToPrevStep" />
            <q-btn color="primary" label="下一步" @click="goToNextStep" />
          </div>
        </q-tab-panel>

        <!-- 第四步：旅行清单 -->
        <q-tab-panel name="4">
          <div class="text-h6 q-mb-md">旅行清单</div>
          
          <q-card flat bordered class="q-mb-md">
            <q-card-section>
              <q-input
                filled
                v-model="newItemText"
                label="添加物品或任务"
                stack-label
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
            </q-card-section>
          </q-card>
          
          <q-card flat bordered>
            <q-list>
              <q-item
                v-for="(item, index) in trip.todoList"
                :key="index"
                tag="label"
                v-ripple
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
          </q-card>
          
          <div class="row justify-between q-mt-md">
            <q-btn outline color="primary" icon="arrow_back" label="上一步" @click="goToPrevStep" />
            <q-btn color="positive" icon="check" label="完成规划" @click="saveTrip" />
          </div>
        </q-tab-panel>
      </q-tab-panels>
    </div>
    
    <!-- 活动编辑对话框 -->
    <q-dialog v-model="activityDialog.show" persistent>
      <q-card style="min-width: 300px; max-width: 95vw">
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
                stack-label
                :rules="[val => !!val || '请输入活动名称']"
              />
              
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
              >
                <template v-slot:prepend>
                  <q-icon name="access_time" />
                </template>
              </q-input>
              
              <q-input
                filled
                v-model="activityDialog.activity.location"
                label="地点"
                stack-label
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
                stack-label
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
                stack-label
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
      currentStep: "1",
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
      newItemText: ''
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
            position: 'bottom',
            timeout: 2000
          });
          
          // 在实际应用中，这里可能会导航到行程详情页面
          // this.$router.push(`/trip/detail/${tripId}`);
        } else {
          this.$q.notify({
            color: 'negative',
            textColor: 'white',
            icon: 'warning',
            message: '请填写必填信息',
            position: 'bottom'
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
  padding-bottom: 60px; /* 为移动端底部导航留出空间 */
}

.container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 16px;
}

.header-section {
  position: sticky;
  top: 0;
  z-index: 10;
}

.content-wrapper {
  margin-bottom: 56px; /* 为底部导航栏留出空间 */
}

/* 底部导航栏样式 */
.mobile-bottom-nav {
  height: 56px;
  border-top: 1px solid rgba(0, 0, 0, 0.1);
  z-index: 5;
}

.mobile-bottom-nav .q-icon {
  font-size: 1.5rem;
}

/* 卡片样式 */
.q-card {
  border-radius: 12px;
  transition: box-shadow 0.3s;
}

.q-card:hover {
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.05);
}

/* 预算类别卡片 */
.budget-categories .q-card {
  overflow: visible;
  transition: transform 0.2s, box-shadow 0.2s;
}

.budget-categories .q-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
}

/* 输入框样式 */
.q-field--filled .q-field__control {
  border-radius: 8px;
}

/* 删除线样式 */
.text-strike {
  text-decoration: line-through;
  color: #a0a0a0;
}

/* 面板切换动画 */
.q-tab-panels {
  background: transparent;
}

.q-tab-panel {
  padding: 16px 0;
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
  
  /* 行程天数卡片在移动端的样式 */
  .q-timeline__title {
    font-size: 1rem;
  }
  
  /* 底部导航文字大小 */
  .mobile-bottom-nav .text-caption {
    font-size: 0.65rem;
    margin-top: 2px;
  }
}

/* 阴影效果 */
.shadow-up-1 {
  box-shadow: 0 -2px 5px rgba(0,0,0,0.05);
}

/* 标签切换样式 */
.desktop-tabs .q-tabs {
  background-color: white;
  border-radius: 12px;
  box-shadow: 0 1px 3px rgba(0,0,0,0.05);
  margin-bottom: 16px;
}

/* 表单标签样式 */
.q-field--filled.q-field--labeled .q-field__native, 
.q-field--filled.q-field--labeled .q-field__prefix, 
.q-field--filled.q-field--labeled .q-field__suffix {
  padding-top: 24px;
}

/* 进度条美化 */
.q-linear-progress {
  border-radius: 4px;
  height: 8px;
}

/* 列表项动画 */
.q-item {
  transition: background-color 0.2s;
}

.q-item:hover {
  background-color: rgba(0, 0, 0, 0.03);
}
</style> 