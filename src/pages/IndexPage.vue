<template>
  <q-page class="q-pa-md" style="min-height: 100vh; overflow-y: auto;">
    <div class="q-gutter-md" style="max-width: 1200px; margin: 0 auto;">
      <h4 class="text-center q-mb-lg">射频信号参数识别</h4>

      <!-- File Upload Section -->
      <q-card class="q-pa-md">
        <q-card-section>
          <div class="text-h6">上传信号参数图片</div>
          <div class="text-subtitle2 text-grey-7 q-mb-md">
            上传图片文件来识别射频信号参数
          </div>
        </q-card-section>

        <q-card-section>
          <q-file v-model="selectedFile" label="选择图片文件" accept=".jpg,.jpeg,.png,.gif" max-file-size="10485760"
            @rejected="onRejected" outlined class="q-mb-md">
            <template v-slot:prepend>
              <q-icon name="attach_file" />
            </template>
          </q-file>

          <div class="row q-gutter-sm">
            <q-btn label="上传并识别" color="primary" :loading="uploading" :disable="!selectedFile" @click="uploadFile"
              icon="upload" />
            <q-btn label="清除" color="grey" outline @click="clearFile" :disable="uploading" />
          </div>
        </q-card-section>
      </q-card>



      <!-- Signal Parameters Data Table -->
      <q-card flat bordered class="signal-table-card q-mb-lg">
        <q-card-section class="q-pa-sm">
          <div class="row justify-between items-center q-mb-md q-pa-sm">
            <div class="text-h6 text-weight-bold">
              <q-icon name="signal_cellular_alt" size="28px" class="q-mr-sm" />
              所有信号参数记录
            </div>
            <div class="row q-gutter-sm items-center">
              <!-- 日期筛选控件 -->
              <q-btn-group flat>
                <q-btn 
                  :color="selectedDateFilter === 'today' ? 'primary' : 'grey-7'" 
                  :text-color="selectedDateFilter === 'today' ? 'white' : 'grey-8'"
                  :label="`今天 (${dateCounts.today})`"
                  size="sm" 
                  @click="setDateFilter('today')" 
                  :disable="loadingTable" 
                />
                <q-btn 
                  :color="selectedDateFilter === 'yesterday' ? 'primary' : 'grey-7'" 
                  :text-color="selectedDateFilter === 'yesterday' ? 'white' : 'grey-8'"
                  :label="`昨天 (${dateCounts.yesterday})`"
                  size="sm" 
                  @click="setDateFilter('yesterday')" 
                  :disable="loadingTable" 
                />
                <q-btn 
                  :color="selectedDateFilter === 'dayBefore' ? 'primary' : 'grey-7'" 
                  :text-color="selectedDateFilter === 'dayBefore' ? 'white' : 'grey-8'"
                  :label="`前天 (${dateCounts.dayBefore})`"
                  size="sm" 
                  @click="setDateFilter('dayBefore')" 
                  :disable="loadingTable" 
                />
                <q-btn 
                  :color="selectedDateFilter === 'all' ? 'primary' : 'grey-7'" 
                  :text-color="selectedDateFilter === 'all' ? 'white' : 'grey-8'"
                  :label="`全部 (${dateCounts.all})`"
                  size="sm" 
                  @click="setDateFilter('all')" 
                  :disable="loadingTable" 
                />
              </q-btn-group>
            </div>
          </div>

          <!-- 数据表格 -->
          <q-table 
            :rows="signalParamsList" 
            :columns="tableColumns" 
            :loading="loadingTable" 
            row-key="id" 
            flat 
            bordered
            class="custom-signal-table" 
            :no-data-label="'暂无数据'" 
            :loading-label="'加载中...'"
            binary-state-sort 
            :pagination="{ rowsPerPage: 0 }"
            hide-pagination
          >

            <!-- 自定义列模板 - 图片 -->
            <template v-slot:body-cell-imageUrl="props">
              <q-td :props="props" class="image-cell">
                <q-btn v-if="props.value" flat round dense color="primary" icon="image" size="sm"
                  @click="viewImage(props.value)" class="image-btn">
                  <q-tooltip>查看图片</q-tooltip>
                </q-btn>
                <span v-else class="text-grey-5">无</span>
              </q-td>
            </template>


            <!-- 自定义列模板 - SCC状态 -->
            <template v-slot:body-cell-hasScc="props">
              <q-td :props="props" class="scc-cell">
                <q-icon v-if="props.value === true" name="check" color="positive" size="18px" />
                <q-icon v-else-if="props.value === false" name="close" color="negative" size="18px" />
                <span v-else class="text-grey-5">-</span>
              </q-td>
            </template>

            <!-- 下行速率列正常显示 -->

            <!-- 自定义列模板 - 邻区信息 -->
            <template v-slot:body-cell-neighborInfo="props">
              <q-td :props="props" class="neighbor-cell">
                <q-btn flat round dense color="info" icon="info" size="sm" class="neighbor-btn">
                  <q-tooltip class="neighbor-tooltip">
                    <div class="neighbor-details">
                      <div><strong>EARFCN-NBR:</strong> {{ props.row.earfcnNbr || '-' }}</div>
                      <div><strong>PCI-NBR:</strong> {{ props.row.pciNbr || '-' }}</div>
                      <div><strong>RSRP-NBR:</strong> {{ props.row.rsrpNbr || '-' }}</div>
                    </div>
                  </q-tooltip>
                </q-btn>
              </q-td>
            </template>

            <!-- 自定义列模板 - 操作 -->
            <template v-slot:body-cell-actions="props">
              <q-td :props="props" class="actions-cell">
                <div class="action-buttons">
                  <q-btn flat round dense color="primary" icon="speed" size="sm" @click="openEditDownSpeedDialog(props.row)"
                    class="action-btn edit-speed-btn">
                    <q-tooltip>编辑下行速率</q-tooltip>
                  </q-btn>
                </div>
              </q-td>
            </template>

            <!-- 空状态 -->
            <template v-slot:no-data>
              <div class="full-width flex justify-center items-center" style="min-height: 300px; padding: 60px 20px;">
                <div class="text-center">
                  <q-icon name="signal_cellular_alt" size="64px" color="grey-5" class="q-mb-md" />
                  <div class="text-h6 text-grey-6 q-mb-sm">暂无信号参数数据</div>
                  <div class="text-body2 text-grey-5">上传图片来识别射频信号参数</div>
                </div>
              </div>
            </template>

            <!-- 加载状态 -->
            <template v-slot:loading>
              <q-inner-loading showing color="primary" />
            </template>
          </q-table>
        </q-card-section>
      </q-card>

      <!-- Data Analysis Charts -->
      <q-card flat bordered class="analysis-card q-mb-lg">
        <q-card-section class="q-pa-sm">
          <div class="row justify-between items-center q-mb-md q-pa-sm">
            <div class="text-h6 text-weight-bold">
              <q-icon name="analytics" size="28px" class="q-mr-sm" />
              信号参数分析图表
            </div>
            <div class="row q-gutter-sm">
              <q-select v-model="chartType" :options="chartTypeOptions" label="图表类型" dense outlined
                style="min-width: 120px" @update:model-value="updateCharts" emit-value map-options />
            </div>
          </div>

          <div class="row q-gutter-md">
            <!-- 信号强度趋势图 -->
            <div class="col-12">
              <div class="chart-container">
                <div class="chart-title">信号强度趋势</div>
                <div ref="signalTrendChart" style="height: 300px;"></div>
              </div>
            </div>
          </div>
        </q-card-section>
      </q-card>

      <!-- Image Preview Dialog -->
      <q-dialog v-model="showImageDialog">
        <q-card style="max-width: 80vw; max-height: 80vh;">
          <q-card-section class="row items-center q-pb-none">
            <div class="text-h6">信号参数图片</div>
            <q-space />
            <q-btn icon="close" flat round dense v-close-popup />
          </q-card-section>

          <q-card-section>
            <q-img :src="selectedImageUrl" fit="contain" style="max-height: 70vh" />
          </q-card-section>
        </q-card>
      </q-dialog>

      <!-- Edit Down Speed Dialog -->
      <q-dialog v-model="showEditDownSpeedDialog" persistent>
        <q-card style="min-width: 400px;">
          <q-card-section class="row items-center q-pb-none">
            <div class="text-h6">编辑下行速率</div>
            <q-space />
            <q-btn icon="close" flat round dense v-close-popup />
          </q-card-section>

          <q-card-section>
            <div class="q-mb-md text-body2 text-grey-7">
              记录时间: {{ editingRecord?.createdAt ? formatDateTime(editingRecord.createdAt) : '-' }}
            </div>
            <q-input
              v-model="editDownSpeedValue"
              type="number"
              label="下行速率"
              suffix="Mbps"
              outlined
              :rules="[
                val => val !== null && val !== '' || '请输入下行速率',
                val => val >= 0 || '速率不能为负数',
                val => val <= 10000 || '速率值过大'
              ]"
              ref="editDownSpeedInput"
            />
          </q-card-section>

          <q-card-actions align="right">
            <q-btn flat label="取消" color="grey" v-close-popup />
            <q-btn 
              label="保存" 
              color="primary" 
              @click="saveDownSpeedFromDialog" 
              :loading="savingDownSpeed"
              :disable="!editDownSpeedValue || parseFloat(editDownSpeedValue) < 0"
            />
          </q-card-actions>
        </q-card>
      </q-dialog>
    </div>
  </q-page>
</template>

<script setup lang="ts">
import { ref, onMounted, nextTick, onUnmounted, computed } from 'vue';
import { useQuasar } from 'quasar';
import { getRfSignalParams } from 'src/api/rf-signal-params/rf-signal-params';
import type { SignalParamsVO } from 'src/api/api.schemas';
import * as echarts from 'echarts/core';
import {
  TitleComponent,
  ToolboxComponent,
  TooltipComponent,
  GridComponent,
  LegendComponent
} from 'echarts/components';
import { LineChart, BarChart, PieChart, ScatterChart } from 'echarts/charts';
import { UniversalTransition } from 'echarts/features';
import { CanvasRenderer } from 'echarts/renderers';

echarts.use([
  TitleComponent,
  ToolboxComponent,
  TooltipComponent,
  GridComponent,
  LegendComponent,
  LineChart,
  BarChart,
  PieChart,
  ScatterChart,
  UniversalTransition,
  CanvasRenderer
]);

const $q = useQuasar();
const selectedFile = ref<File | null>(null);
const uploading = ref(false);
const signalParamsList = ref<SignalParamsVO[]>([]);
const loadingTable = ref(false);

// UI状态
const showImageDialog = ref(false);
const selectedImageUrl = ref('');

// 日期筛选相关状态
const selectedDateFilter = ref<'today' | 'yesterday' | 'dayBefore' | 'all'>('today');

// 各日期的数据数量统计
const dateCounts = ref({
  today: 0,
  yesterday: 0,
  dayBefore: 0,
  all: 0
});

// 下行速率编辑相关状态
const showEditDownSpeedDialog = ref(false);
const editingRecord = ref<any>(null);
const editDownSpeedValue = ref('');
const savingDownSpeed = ref(false);
const editDownSpeedInput = ref<any>(null);

// 获取日期字符串的辅助函数 (YYYY-MM-DD格式)
const getTodayString = (): string => {
  const today = new Date();
  return today.toISOString().split('T')[0] || '';
};

const getYesterdayString = (): string => {
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  return yesterday.toISOString().split('T')[0] || '';
};

const getDayBeforeString = (): string => {
  const dayBefore = new Date();
  dayBefore.setDate(dayBefore.getDate() - 2);
  return dayBefore.toISOString().split('T')[0] || '';
};

const rfSignalApi = getRfSignalParams();

// 图表相关状态
const chartType = ref('line');
const signalTrendChart = ref<HTMLElement>();

let signalTrendChartInstance: echarts.ECharts | null = null;

// 图表配置选项
const chartTypeOptions = [
  { label: '折线图', value: 'line' },
  { label: '柱状图', value: 'bar' },
  { label: '散点图', value: 'scatter' }
];

// 移除了分页配置，现在使用简单的客户端分页

// 表格列定义 - 按重要性和变化频率排序
const tableColumns = [
  {
    name: 'time',
    label: '时间',
    field: 'createdAt',
    align: 'center' as const,
    sortable: true,
    style: 'width: 80px; min-width: 80px',
    format: (val: string) => val ? new Date(val).toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit', hour12: false }) : '-'
  },
  {
    name: 'plmn',
    label: 'PLMN',
    field: 'plmnDesc',
    align: 'center' as const,
    sortable: true,
    style: 'width: 100px',
    format: (val: any) => val ?? '-'
  },
  {
    name: 'hasScc',
    label: 'SCC',
    field: 'hasScc',
    align: 'center' as const,
    sortable: true,
    style: 'width: 60px'
  },
  {
    name: 'downSpeed',
    label: '下行速率',
    field: 'downSpeed',
    align: 'center' as const,
    sortable: true,
    style: 'width: 120px',
    format: (val: any) => val ? `${val} Mbps` : '-'
  },
  // 核心信号参数 - 最重要且变化频繁的参数
  {
    name: 'ssbRsrp',
    label: 'SSB-RSRP',
    field: 'ssbRsrp',
    align: 'center' as const,
    sortable: true,
    style: 'width: 100px',
    format: (val: any) => val ?? '-'
  },
  {
    name: 'ssbSinr',
    label: 'SSB-SINR',
    field: 'ssbSinr',
    align: 'center' as const,
    sortable: true,
    style: 'width: 100px',
    format: (val: any) => val ?? '-'
  },
  {
    name: 'rssi',
    label: 'RSSI',
    field: 'rssi',
    align: 'center' as const,
    sortable: true,
    style: 'width: 80px',
    format: (val: any) => val ?? '-'
  },
  {
    name: 'rsrq',
    label: 'RSRQ',
    field: 'rsrq',
    align: 'center' as const,
    sortable: true,
    style: 'width: 80px',
    format: (val: any) => val ?? '-'
  },
  {
    name: 'nrCqi',
    label: 'NR-CQI',
    field: 'nrCqi',
    align: 'center' as const,
    sortable: true,
    style: 'width: 80px',
    format: (val: any) => val ?? '-'
  },
  {
    name: 'neighborInfo',
    label: '邻区信息',
    field: 'neighborInfo',
    align: 'center' as const,
    sortable: false,
    style: 'width: 100px'
  },
  // 辅助信息
  {
    name: 'imageUrl',
    label: '图片',
    field: 'imageUrl',
    align: 'center' as const,
    sortable: false,
    style: 'width: 80px'
  },
  // 网络配置参数 - 相对稳定的参数
  {
    name: 'workMode',
    label: '工作模式',
    field: 'workMode',
    align: 'center' as const,
    sortable: true,
    style: 'width: 100px',
    format: (val: any) => val ?? '-'
  },
  {
    name: 'pci',
    label: 'PCI',
    field: 'pci',
    align: 'center' as const,
    sortable: true,
    style: 'width: 80px',
    format: (val: any) => val ?? '-'
  },
  {
    name: 'nrBand',
    label: 'NR频段',
    field: 'nrBand',
    align: 'center' as const,
    sortable: true,
    style: 'width: 100px',
    format: (val: any) => val ?? '-'
  },
  {
    name: 'tac',
    label: 'TAC',
    field: 'tac',
    align: 'center' as const,
    sortable: true,
    style: 'width: 100px',
    format: (val: any) => val ?? '-'
  },
  {
    name: 'createdAt',
    label: '记录时间',
    field: 'createdAt',
    align: 'center' as const,
    sortable: true,
    format: (val: string) => formatDateTime(val),
    style: 'width: 160px'
  },
  {
    name: 'actions',
    label: '操作',
    field: 'actions',
    align: 'center' as const,
    sortable: false,
    style: 'width: 80px'
  }
];

const onRejected = (rejectedEntries: any[]) => {
  $q.notify({
    type: 'negative',
    message: `${rejectedEntries.length} 个文件被拒绝。请检查文件大小和格式。`
  });
};

const clearFile = () => {
  selectedFile.value = null;
};

const uploadFile = async () => {
  if (!selectedFile.value) {
    $q.notify({
      type: 'negative',
      message: '请先选择一个文件'
    });
    return;
  }

  uploading.value = true;

  try {
    const response = await rfSignalApi.recognizeSignalParams(
      { imageFile: selectedFile.value },
      { recognitionMode: 'auto' }
    );

    if (response.data.isOk && response.data.okData) {
      $q.notify({
        type: 'positive',
        message: '信号参数识别成功！'
      });

      // 清除选中的文件
      selectedFile.value = null;

      // 刷新表格数据和数量统计
      await Promise.all([
        loadSignalData(), // 刷新当前显示的数据
        loadAllDateCounts() // 刷新所有日期的数量统计
      ]);
    } else {
      throw new Error(response.data.failMsg || '识别失败');
    }
  } catch (error: any) {
    console.error('Upload error:', error);
    $q.notify({
      type: 'negative',
      message: error.message || '识别信号参数失败'
    });
  } finally {
    uploading.value = false;
  }
};

// 加载数据函数（已移除分页功能）
const loadSignalData = async () => {
  console.log('加载信号数据，筛选条件:', selectedDateFilter.value);
  
  loadingTable.value = true;

  try {
    // 构建查询参数，使用新的参数结构
    const queryParams: any = {};

    // 根据选中的日期筛选条件设置参数
    if (selectedDateFilter.value === 'today') {
      queryParams.dateFilter = 'today';
    } else if (selectedDateFilter.value === 'yesterday') {
      queryParams.dateFilter = 'custom';
      queryParams.startDate = getYesterdayString();
      queryParams.endDate = getYesterdayString();
    } else if (selectedDateFilter.value === 'dayBefore') {
      queryParams.dateFilter = 'custom';
      queryParams.startDate = getDayBeforeString();
      queryParams.endDate = getDayBeforeString();
    } else if (selectedDateFilter.value === 'all') {
      queryParams.dateFilter = 'all';
    }
    
    console.log('API请求参数:', queryParams);
    
    const response = await rfSignalApi.querySignalParam(queryParams);

    if (response.data && response.data.isOk && response.data.okData) {
      const dataList = response.data.okData;
      
      console.log('响应数据:', dataList);
      
      signalParamsList.value = dataList || [];
      
      console.log('更新后的数据列表长度:', signalParamsList.value.length);

      if (dataList && dataList.length > 0) {
        $q.notify({
          type: 'positive',
          message: `成功加载 ${dataList.length} 条记录`,
          timeout: 2000
        });
        // 更新图表
        updateCharts();
      } else {
        $q.notify({
          type: 'info',
          message: '当前筛选条件下暂无数据',
          timeout: 2000
        });
      }
    } else {
      throw new Error(response.data?.failMsg || '获取数据失败');
    }
  } catch (error: any) {
    console.error('Load signal params error:', error);

    // 检查是否是网络错误
    if (error.code === 'ECONNREFUSED' || error.message.includes('Network Error')) {
      $q.notify({
        type: 'negative',
        message: '无法连接到服务器，请确保后端服务正在运行',
        timeout: 5000
      });
    } else {
      $q.notify({
        type: 'negative',
        message: error.message || '获取信号参数列表失败',
        timeout: 3000
      });
    }
  } finally {
    loadingTable.value = false;
  }
};

// 加载所有日期的数据数量统计
const loadAllDateCounts = async () => {
  try {
    // 并行加载各个日期的数据数量
    const [todayResponse, yesterdayResponse, dayBeforeResponse, allResponse] = await Promise.all([
      // 今天
      rfSignalApi.querySignalParam({ dateFilter: 'today' }),
      // 昨天
      rfSignalApi.querySignalParam({ 
        dateFilter: 'custom', 
        startDate: getYesterdayString(), 
        endDate: getYesterdayString() 
      }),
      // 前天
      rfSignalApi.querySignalParam({ 
        dateFilter: 'custom', 
        startDate: getDayBeforeString(), 
        endDate: getDayBeforeString() 
      }),
      // 全部
      rfSignalApi.querySignalParam({ dateFilter: 'all' })
    ]);

    // 更新各日期的数据数量
    dateCounts.value.today = todayResponse.data?.isOk ? (todayResponse.data.okData?.length || 0) : 0;
    dateCounts.value.yesterday = yesterdayResponse.data?.isOk ? (yesterdayResponse.data.okData?.length || 0) : 0;
    dateCounts.value.dayBefore = dayBeforeResponse.data?.isOk ? (dayBeforeResponse.data.okData?.length || 0) : 0;
    dateCounts.value.all = allResponse.data?.isOk ? (allResponse.data.okData?.length || 0) : 0;

    console.log('数据数量统计:', dateCounts.value);
  } catch (error) {
    console.error('加载数据数量统计失败:', error);
    // 如果加载失败，保持默认值0
  }
};

// 兼容性：保持原有的loadSignalParams函数
const loadSignalParams = async () => {
  await loadSignalData();
};

// 日期筛选相关函数
const setDateFilter = async (filterType: 'today' | 'yesterday' | 'dayBefore' | 'all') => {
  selectedDateFilter.value = filterType;
  
  // 重新加载数据
  await loadSignalData();
};

// 下行速率编辑相关函数
const openEditDownSpeedDialog = (row: any) => {
  editingRecord.value = row;
  editDownSpeedValue.value = row.downSpeed || '';
  showEditDownSpeedDialog.value = true;
  
  // 使用nextTick确保DOM更新后再聚焦
  nextTick(() => {
    if (editDownSpeedInput.value) {
      editDownSpeedInput.value.focus();
    }
  });
};

const saveDownSpeedFromDialog = async () => {
  if (!editDownSpeedValue.value || parseFloat(editDownSpeedValue.value) < 0) {
    $q.notify({
      type: 'negative',
      message: '请输入有效的下行速率值'
    });
    return;
  }

  savingDownSpeed.value = true;

  try {
    // 调用更新下行速率的API
    const response = await rfSignalApi.updateDownSpeed({
      id: editingRecord.value.id,
      downSpeed: editDownSpeedValue.value
    });

    if (response.data.isOk) {
      // 更新本地数据
      const targetRow = signalParamsList.value.find(item => item.id === editingRecord.value.id);
      if (targetRow) {
        (targetRow as any).downSpeed = editDownSpeedValue.value;
      }

      $q.notify({
        type: 'positive',
        message: '下行速率更新成功！'
      });

      // 关闭对话框
      showEditDownSpeedDialog.value = false;
      editingRecord.value = null;
      editDownSpeedValue.value = '';
    } else {
      throw new Error(response.data.failMsg || '更新失败');
    }
  } catch (error: any) {
    console.error('Update down speed error:', error);
    $q.notify({
      type: 'negative',
      message: error.message || '更新下行速率失败'
    });
  } finally {
    savingDownSpeed.value = false;
  }
};


// View image in dialog
const viewImage = (imageUrl: string) => {
  selectedImageUrl.value = imageUrl;
  showImageDialog.value = true;
};

// 移除了删除功能

// 复制文本到剪贴板
const copyToClipboard = (text: string): void => {
  navigator.clipboard.writeText(text)
    .then(() => {
      $q.notify({
        message: '已复制到剪贴板',
        color: 'positive',
        position: 'top',
        timeout: 1000
      });
    })
    .catch((error: Error) => {
      console.error('复制失败:', error);
    });
};

// 移除了分页标签函数，现在使用Quasar默认的客户端分页

// 初始化图表
const initCharts = async () => {
  await nextTick();

  if (signalTrendChart.value) {
    signalTrendChartInstance = echarts.init(signalTrendChart.value);
  }

  updateCharts();
};

// 更新图表数据
const updateCharts = () => {
  if (!signalParamsList.value.length) return;

  updateSignalTrendChart();
};

// 更新信号强度趋势图
const updateSignalTrendChart = () => {
  if (!signalTrendChartInstance) return;

  const data = signalParamsList.value
    .filter(item => item.createdAt && item.rssi !== undefined && item.ssbRsrp !== undefined)
    .sort((a, b) => new Date(a.createdAt!).getTime() - new Date(b.createdAt!).getTime())
    .map(item => ({
      time: new Date(item.createdAt!).toLocaleString('zh-CN', { 
        month: '2-digit', 
        day: '2-digit', 
        hour: '2-digit', 
        minute: '2-digit' 
      }),
      rssi: Math.abs(item.rssi!), // 取绝对值便于显示
      ssbRsrp: Math.abs(item.ssbRsrp!)
    }));

  const option = {
    title: {
      show: false // 在移动端隐藏标题节省空间
    },
    tooltip: {
      trigger: chartType.value === 'scatter' ? 'item' : 'axis',
      axisPointer: chartType.value === 'scatter' ? undefined : { type: 'cross' },
      textStyle: { fontSize: 12 },
      formatter: (params: any) => {
        if (chartType.value === 'scatter') {
          // 散点图的tooltip格式
          if (Array.isArray(params)) {
            let result = `${params[0].name}<br/>`;
            params.forEach((param: any) => {
              result += `${param.seriesName}: -${param.value} dBm<br/>`;
            });
            return result;
          } else {
            return `${params.name}<br/>${params.seriesName}: -${params.value} dBm`;
          }
        } else {
          // 折线图和柱状图的tooltip格式
          let result = `${params[0].axisValue}<br/>`;
          params.forEach((param: any) => {
            result += `${param.seriesName}: -${param.value} dBm<br/>`;
          });
          return result;
        }
      }
    },
    legend: {
      data: ['RSSI', 'SSB-RSRP'],
      textStyle: { fontSize: 11 },
      itemWidth: 15,
      itemHeight: 10,
      top: 5
    },
    grid: {
      left: '8%',
      right: '8%',
      top: '15%',
      bottom: '15%',
      containLabel: true
    },
    xAxis: {
      type: 'category',
      data: data.map(d => d.time),
      axisLabel: { 
        rotate: 30,
        fontSize: 10,
        interval: 'auto',
        formatter: (value: string) => {
          // 在移动端只显示时分
          return value.split(' ')[1] || value;
        }
      },
      axisTick: { alignWithLabel: true }
    },
    yAxis: {
      type: 'value',
      name: '信号强度',
      nameTextStyle: { fontSize: 11 },
      min: 70, // 设置最小值为70
      max: 100, // 设置最大值为100
      axisLabel: { 
        fontSize: 10,
        formatter: (value: number) => `-${value}`
      }
    },
    series: [
      {
        name: 'RSSI',
        type: chartType.value,
        data: chartType.value === 'scatter' 
          ? data.map((d, index) => ({ name: d.time, value: d.rssi }))
          : data.map(d => d.rssi),
        smooth: chartType.value === 'line',
        lineStyle: chartType.value === 'line' ? { color: '#1976d2', width: 2 } : undefined,
        itemStyle: { color: '#1976d2' },
        symbol: 'circle',
        symbolSize: chartType.value === 'scatter' ? 8 : 4
      },
      {
        name: 'SSB-RSRP',
        type: chartType.value,
        data: chartType.value === 'scatter' 
          ? data.map((d, index) => ({ name: d.time, value: d.ssbRsrp }))
          : data.map(d => d.ssbRsrp),
        smooth: chartType.value === 'line',
        lineStyle: chartType.value === 'line' ? { color: '#388e3c', width: 2 } : undefined,
        itemStyle: { color: '#388e3c' },
        symbol: 'circle',
        symbolSize: chartType.value === 'scatter' ? 8 : 4
      }
    ]
  };

  signalTrendChartInstance.setOption(option, true);
};


// 添加响应式处理
const handleResize = () => {
  if (signalTrendChartInstance) signalTrendChartInstance.resize();
};

// Load data when component mounts
onMounted(async () => {
  // 初始化日期筛选状态为今天
  selectedDateFilter.value = 'today';
  
  // 并行加载：1) 今天的数据 2) 所有日期的数量统计
  await Promise.all([
    loadSignalData(), // 加载今天的详细数据
    loadAllDateCounts() // 加载所有日期的数量统计
  ]);
  
  await initCharts();
  
  // 添加窗口大小变化监听
  window.addEventListener('resize', handleResize);
});

// 组件卸载时清理
onUnmounted(() => {
  window.removeEventListener('resize', handleResize);
  if (signalTrendChartInstance) signalTrendChartInstance.dispose();
});

const formatDateTime = (dateTime?: string) => {
  if (!dateTime) return '-';
  return new Date(dateTime).toLocaleString();
};
</script>

<style lang="scss" scoped>
@import 'src/css/quasar.variables.scss';

/* 分析图表卡片样式 */
.analysis-card {
  border-radius: 12px;
  box-shadow: $elevation-2;
  background: $cursor-surface;
  border: 1px solid $cursor-border;
}

.chart-container {
  background: $cursor-surface;
  border-radius: 8px;
  padding: 16px;
  border: 1px solid $cursor-border;
}

.chart-title {
  font-size: 16px;
  font-weight: 600;
  color: $cursor-text;
  margin-bottom: 12px;
  text-align: center;
}

/* 信号参数表格卡片样式 */
.signal-table-card {
  border-radius: 12px;
  box-shadow: $elevation-2;
  background: $cursor-surface;
  border: 1px solid $cursor-border;
}

/* 自定义表格样式 */
.custom-signal-table {
  border-radius: 8px;
  background: $cursor-surface;

  /* 隐藏默认的表格顶部和底部 */
  :deep(.q-table__top) {
    display: none;
  }

  :deep(.q-table__bottom) {
    display: none;
  }

  /* 表头样式 */
  :deep(thead tr:first-child th) {
    background-color: $cursor-bg;
    font-weight: 600;
    color: $cursor-text;
    border-bottom: 2px solid $cursor-border;
    font-size: 14px;
    padding: 12px 8px;
    text-align: center;
  }

  /* 表格行样式 */
  :deep(tbody tr) {
    background-color: $cursor-surface;
    border-bottom: 1px solid $cursor-border;

    &:hover {
      background-color: $hover-bg;
    }
  }

  /* 表格单元格 */
  :deep(td),
  :deep(th) {
    border-right: 1px solid $cursor-border;
    color: $cursor-text;

    &:last-child {
      border-right: none;
    }
  }

  /* 表格容器 */
  :deep(.q-table__container) {
    background: $cursor-surface;
    border: 1px solid $cursor-border;
    border-radius: 8px;
  }
}

/* 时间列样式 */
.time-cell {
  padding: 12px 8px;
  font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
  font-size: 13px;
  font-weight: 500;
  color: $cursor-text;
}

/* 图片列样式 */
.image-cell {
  padding: 8px;
  text-align: center;
}

.image-btn {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  transition: all 0.2s ease;
  color: $cursor-primary;

  &:hover {
    background-color: rgba($cursor-primary, 0.1);
    transform: scale(1.1);
  }
}


/* SCC状态列样式 */
.scc-cell {
  padding: 8px;
  text-align: center;
}

.scc-cell .q-icon {
  transition: transform 0.2s ease;
}

.scc-cell .q-icon:hover {
  transform: scale(1.1);
}

/* 邻区信息列样式 */
.neighbor-cell {
  padding: 8px;
  text-align: center;
}

.neighbor-btn {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  transition: all 0.2s ease;
  color: $cursor-info;

  &:hover {
    background-color: rgba($cursor-info, 0.1);
    transform: scale(1.1);
  }
}

.neighbor-tooltip {
  max-width: 300px;
  background: $cursor-bg;
  color: $cursor-text;
  border: 1px solid $cursor-border;
}

.neighbor-details {
  font-size: 14px;
  line-height: 1.6;

  div {
    margin-bottom: 4px;
    color: $cursor-text;

    &:last-child {
      margin-bottom: 0;
    }
  }

  strong {
    color: $cursor-primary;
  }
}

/* 移除了下行速率列的编辑样式，现在正常显示 */

/* 操作列样式 */
.actions-cell {
  padding: 8px 12px;
  text-align: center;
}

.action-buttons {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 4px;
}

.action-btn {
  width: 32px;
  height: 32px;
  border-radius: 6px;
  transition: all 0.2s ease;

  &:hover {
    transform: translateY(-1px);
    box-shadow: $elevation-1;
  }

  &:active {
    transform: translateY(0);
  }

  &.edit-speed-btn {
    color: $cursor-primary;

    &:hover {
      background-color: rgba($cursor-primary, 0.1);
      transform: translateY(-1px) scale(1.05);
    }
  }
}

/* 表格标题样式 */
.text-h6 {
  color: $cursor-text;
}

/* 响应式设计 */
@media (max-width: 1200px) {
  .custom-signal-table {
    font-size: 13px;

    :deep(th),
    :deep(td) {
      padding: 8px 6px;
    }
  }

}

@media (max-width: 768px) {
  .custom-signal-table {
    font-size: 12px;

    :deep(th),
    :deep(td) {
      padding: 6px 4px;
    }

    .action-btn {
      width: 28px;
      height: 28px;

      :deep(.q-icon) {
        font-size: 16px;
      }
    }
  }

}

/* 表格滚动条样式 */
.custom-signal-table :deep(.q-table__container) {
  &::-webkit-scrollbar {
    height: 8px;
  }

  &::-webkit-scrollbar-track {
    background: $cursor-border;
    border-radius: 4px;
  }

  &::-webkit-scrollbar-thumb {
    background: $cursor-muted;
    border-radius: 4px;

    &:hover {
      background: $cursor-text;
    }
  }
}

/* 空状态样式 */
.custom-signal-table :deep(.q-table__no-data) {
  color: $cursor-muted;
}

/* 加载状态样式 */
.custom-signal-table :deep(.q-inner-loading) {
  background: rgba($cursor-bg, 0.8);
}

/* 日期筛选控件样式 */
.q-btn-group {
  border-radius: 6px;
  overflow: hidden;
  box-shadow: $elevation-1;
}

.q-btn-group .q-btn {
  border-radius: 0;
  transition: all 0.2s ease;
  
  &:first-child {
    border-top-left-radius: 6px;
    border-bottom-left-radius: 6px;
  }
  
  &:last-child {
    border-top-right-radius: 6px;
    border-bottom-right-radius: 6px;
  }
  
  &:hover {
    transform: translateY(-1px);
    box-shadow: $elevation-2;
  }
}
</style>
