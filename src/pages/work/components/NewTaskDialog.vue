<template>
  <q-dialog :model-value="modelValue" @update:model-value="$emit('update:modelValue', $event)">
    <q-card class="glass-card" style="min-width: 500px">
      <q-card-section class="bg-grey-2 q-pb-sm border-bottom">
        <div class="text-h6 text-dark">新建任务</div>
        <q-space />
        <q-btn icon="eva-close-outline" flat round dense v-close-popup class="absolute-top-right q-mt-sm q-mr-sm" color="grey-5" />
      </q-card-section>

      <q-card-section class="q-pt-md">
        <!-- 任务类型和编号 -->
        <div class="row q-col-gutter-md q-mb-md">
          <div class="col-5">
            <q-select 
              v-model="task.type" 
              :options="taskTypes" 
              label="任务类型" 
              outlined 
              dense 
              class="light-field"
            />
          </div>
          <div class="col-7">
            <q-input 
              v-model="task.id" 
              label="任务编号" 
              outlined 
              dense 
              class="light-field"
            />
          </div>
        </div>

        <!-- 任务标题 - 确保这个字段可见 -->
        <q-input 
          v-model="task.title" 
          label="任务标题" 
          outlined 
          dense 
          class="light-field q-mb-md"
          placeholder="请输入任务标题"
        />

        <!-- 关联文档 -->
        <div class="q-mb-md">
          <div class="row justify-between items-center q-mb-xs">
            <div class="text-subtitle2 text-dark">关联文档</div>
            <div class="text-caption text-grey-7">如需关联多个文档，请用逗号分隔</div>
          </div>
          
          <div class="row q-gutter-sm q-mb-sm">
            <div 
              class="doc-label doc-requirement cursor-pointer"
              :class="{ 'doc-active': task.docs.requirement }"
              @click="task.docs.requirement = !task.docs.requirement"
            >
              需求
            </div>
            
            <div 
              class="doc-label doc-design cursor-pointer"
              :class="{ 'doc-active': task.docs.design }"
              @click="task.docs.design = !task.docs.design"
            >
              设计
            </div>
          </div>
          
          <!-- 动态显示文档名称输入字段 -->
          <div class="q-gutter-y-sm">
            <q-input 
              v-if="task.docs.requirement"
              v-model="task.docNames.requirement" 
              label="需求文档名称" 
              outlined 
              dense 
              class="light-field requirement-field"
            />
            
            <q-input 
              v-if="task.docs.design"
              v-model="task.docNames.design" 
              label="设计文档名称" 
              outlined 
              dense 
              class="light-field design-field"
            />
          </div>
        </div>
      </q-card-section>

      <q-card-actions align="right" class="q-pb-md q-pr-md">
        <q-btn flat label="取消" color="grey-7" v-close-popup />
        <q-btn flat label="创建" color="blue-6" @click="createTask" v-close-popup />
      </q-card-actions>
    </q-card>
  </q-dialog>
</template>

<script setup lang="ts">
import { ref, defineProps, defineEmits } from 'vue'

const props = defineProps({
  modelValue: {
    type: Boolean,
    required: true
  }
})

const emit = defineEmits(['update:modelValue', 'create-task'])

// 任务类型选项
const taskTypes = [
  { label: '呼入任务', value: 'incoming' },
  { label: '呼出任务', value: 'outgoing' }
]

// 任务数据
const task = ref({
  title: '',
  type: { label: '呼入任务', value: 'incoming' }, // 设置默认值
  id: '',
  docs: {
    requirement: false,
    design: false
  },
  docNames: {
    requirement: '',
    design: ''
  }
})

// 创建任务方法
const createTask = () => {
  emit('create-task', { ...task.value })
  
  // 重置表单
  task.value = {
    title: '',
    type: { label: '呼入任务', value: 'incoming' },
    id: '',
    docs: {
      requirement: false,
      design: false
    },
    docNames: {
      requirement: '',
      design: ''
    }
  }
}

defineOptions({
  name: 'NewTaskDialog'
})
</script>

<style lang="scss" scoped>
// 亮色主题输入框样式
.light-field {
  .q-field__native, .q-field__prefix, .q-field__suffix, .q-field__input {
    color: #333 !important; // 深色文字
  }
  
  .q-field__label {
    color: rgba(0, 0, 0, 0.7) !important; // 深色标签
  }
  
  &.q-field--outlined .q-field__control {
    background-color: white !important;
    border-color: rgba(0, 0, 0, 0.2) !important;
  }
}

// 文档标签样式
.doc-label {
  display: inline-flex;
  padding: 4px 12px;
  border-radius: 16px;
  font-size: 0.8rem;
  transition: all 0.2s ease;
  
  &.doc-requirement {
    background: rgba(59, 130, 246, 0.2);
    color: #1e40af;
    
    &:hover {
      background: rgba(59, 130, 246, 0.3);
    }
    
    &.doc-active {
      background: rgba(59, 130, 246, 0.5);
      color: #1e40af;
      font-weight: 500;
    }
  }
  
  &.doc-design {
    background: rgba(168, 85, 247, 0.2);
    color: #6b21a8;
    
    &:hover {
      background: rgba(168, 85, 247, 0.3);
    }
    
    &.doc-active {
      background: rgba(168, 85, 247, 0.5);
      color: #6b21a8;
      font-weight: 500;
    }
  }
}

// 文档输入框样式
.requirement-field {
  :deep(.q-field__control) {
    border-color: rgba(59, 130, 246, 0.5) !important;
  }
}

.design-field {
  :deep(.q-field__control) {
    border-color: rgba(168, 85, 247, 0.5) !important;
  }
}

// 边框底部
.border-bottom {
  border-bottom: 1px solid rgba(0, 0, 0, 0.1);
}

// 玻璃卡片效果
.glass-card {
  background: white !important;
  border: 1px solid rgba(0, 0, 0, 0.1);
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
}

// 确保对话框内容可见
:deep(.q-dialog__inner) {
  max-height: 90vh;
  overflow-y: auto;
}

// 文本样式
.text-dark {
  color: #333 !important;
}

.text-subtitle2 {
  font-size: 1rem;
  font-weight: 500;
}

.text-caption {
  font-size: 0.8rem;
}
</style> 