/**
 * 子任务状态枚举
 */
export enum SubTaskStatus {
  /** 待开始 */
  PENDING = 'pending',
  /** 进行中 */
  IN_PROGRESS = 'in_progress',
  /** 已完成 */
  COMPLETED = 'completed',
  /** 已暂停 */
  PAUSED = 'paused',
  /** 已取消 */
  CANCELLED = 'cancelled',
  /** 已阻塞 */
  BLOCKED = 'blocked',
  /** 待审核 */
  UNDER_REVIEW = 'under_review',
  /** 已拒绝 */
  REJECTED = 'rejected'
}

/**
 * 子任务优先级枚举
 */
export enum SubTaskPriority {
  /** 低优先级 */
  LOW = 'low',
  /** 中优先级 */
  MEDIUM = 'medium',
  /** 高优先级 */
  HIGH = 'high',
  /** 紧急 */
  URGENT = 'urgent'
}

/**
 * 子任务类型枚举
 */
export enum SubTaskType {
  /** 开发任务 */
  DEVELOPMENT = 'development',
  /** 测试任务 */
  TESTING = 'testing',
  /** 设计任务 */
  DESIGN = 'design',
  /** 文档任务 */
  DOCUMENTATION = 'documentation',
  /** 会议任务 */
  MEETING = 'meeting',
  /** 审核任务 */
  REVIEW = 'review',
  /** 部署任务 */
  DEPLOYMENT = 'deployment',
  /** 其他任务 */
  OTHER = 'other'
}

/**
 * 状态显示配置
 */
export const TASK_STATUS_CONFIG = {
  [SubTaskStatus.PENDING]: {
    label: '待开始',
    color: 'grey-6',
    icon: 'schedule',
    bgColor: 'grey-1'
  },
  [SubTaskStatus.IN_PROGRESS]: {
    label: '进行中',
    color: 'blue',
    icon: 'play_circle',
    bgColor: 'blue-1'
  },
  [SubTaskStatus.COMPLETED]: {
    label: '已完成',
    color: 'green',
    icon: 'check_circle',
    bgColor: 'green-1'
  },
  [SubTaskStatus.PAUSED]: {
    label: '已暂停',
    color: 'orange',
    icon: 'pause_circle',
    bgColor: 'orange-1'
  },
  [SubTaskStatus.CANCELLED]: {
    label: '已取消',
    color: 'red',
    icon: 'cancel',
    bgColor: 'red-1'
  },
  [SubTaskStatus.BLOCKED]: {
    label: '已阻塞',
    color: 'deep-orange',
    icon: 'block',
    bgColor: 'deep-orange-1'
  },
  [SubTaskStatus.UNDER_REVIEW]: {
    label: '待审核',
    color: 'purple',
    icon: 'rate_review',
    bgColor: 'purple-1'
  },
  [SubTaskStatus.REJECTED]: {
    label: '已拒绝',
    color: 'red-8',
    icon: 'thumb_down',
    bgColor: 'red-2'
  }
} as const

/**
 * 优先级显示配置
 */
export const TASK_PRIORITY_CONFIG = {
  [SubTaskPriority.LOW]: {
    label: '低',
    color: 'green',
    icon: 'keyboard_arrow_down',
    weight: 1
  },
  [SubTaskPriority.MEDIUM]: {
    label: '中',
    color: 'orange',
    icon: 'remove',
    weight: 2
  },
  [SubTaskPriority.HIGH]: {
    label: '高',
    color: 'red',
    icon: 'keyboard_arrow_up',
    weight: 3
  },
  [SubTaskPriority.URGENT]: {
    label: '紧急',
    color: 'red-8',
    icon: 'priority_high',
    weight: 4
  }
} as const

/**
 * 任务类型显示配置
 */
export const TASK_TYPE_CONFIG = {
  [SubTaskType.DEVELOPMENT]: {
    label: '开发',
    color: 'blue',
    icon: 'code'
  },
  [SubTaskType.TESTING]: {
    label: '测试',
    color: 'green',
    icon: 'bug_report'
  },
  [SubTaskType.DESIGN]: {
    label: '设计',
    color: 'purple',
    icon: 'palette'
  },
  [SubTaskType.DOCUMENTATION]: {
    label: '文档',
    color: 'orange',
    icon: 'description'
  },
  [SubTaskType.MEETING]: {
    label: '会议',
    color: 'teal',
    icon: 'groups'
  },
  [SubTaskType.REVIEW]: {
    label: '审核',
    color: 'indigo',
    icon: 'rate_review'
  },
  [SubTaskType.DEPLOYMENT]: {
    label: '部署',
    color: 'red',
    icon: 'rocket_launch'
  },
  [SubTaskType.OTHER]: {
    label: '其他',
    color: 'grey',
    icon: 'more_horiz'
  }
} as const

/**
 * 子任务接口定义
 */
export interface SubTask {
  id: string
  title: string
  description?: string
  status: SubTaskStatus
  priority: SubTaskPriority
  type: SubTaskType
  assignee?: string
  reporter?: string
  createdAt: Date
  updatedAt: Date
  dueDate?: Date
  estimatedHours?: number
  actualHours?: number
  tags?: string[]
  parentTaskId?: string
  dependencies?: string[]
  attachments?: string[]
}

/**
 * 状态转换规则
 */
export const STATUS_TRANSITIONS = {
  [SubTaskStatus.PENDING]: [
    SubTaskStatus.IN_PROGRESS,
    SubTaskStatus.CANCELLED
  ],
  [SubTaskStatus.IN_PROGRESS]: [
    SubTaskStatus.COMPLETED,
    SubTaskStatus.PAUSED,
    SubTaskStatus.BLOCKED,
    SubTaskStatus.UNDER_REVIEW,
    SubTaskStatus.CANCELLED
  ],
  [SubTaskStatus.PAUSED]: [
    SubTaskStatus.IN_PROGRESS,
    SubTaskStatus.CANCELLED
  ],
  [SubTaskStatus.BLOCKED]: [
    SubTaskStatus.IN_PROGRESS,
    SubTaskStatus.CANCELLED
  ],
  [SubTaskStatus.UNDER_REVIEW]: [
    SubTaskStatus.COMPLETED,
    SubTaskStatus.REJECTED,
    SubTaskStatus.IN_PROGRESS
  ],
  [SubTaskStatus.REJECTED]: [
    SubTaskStatus.IN_PROGRESS,
    SubTaskStatus.CANCELLED
  ],
  [SubTaskStatus.COMPLETED]: [],
  [SubTaskStatus.CANCELLED]: []
} as const

/**
 * 获取可转换的状态列表
 */
export function getAvailableTransitions(currentStatus: SubTaskStatus): SubTaskStatus[] {
  return STATUS_TRANSITIONS[currentStatus] || []
}

/**
 * 检查状态转换是否有效
 */
export function isValidTransition(from: SubTaskStatus, to: SubTaskStatus): boolean {
  return getAvailableTransitions(from).includes(to)
}

/**
 * 获取状态配置
 */
export function getStatusConfig(status: SubTaskStatus) {
  return TASK_STATUS_CONFIG[status]
}

/**
 * 获取优先级配置
 */
export function getPriorityConfig(priority: SubTaskPriority) {
  return TASK_PRIORITY_CONFIG[priority]
}

/**
 * 获取任务类型配置
 */
export function getTypeConfig(type: SubTaskType) {
  return TASK_TYPE_CONFIG[type]
}