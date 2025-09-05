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



      <!-- Data Analysis Charts -->
      <q-card flat bordered class="analysis-card q-mb-lg">
        <q-card-section class="q-pa-sm">
          <div class="row justify-between items-center q-mb-md q-pa-sm">
            <div class="text-h6 text-weight-bold">
              <q-icon name="analytics" size="28px" class="q-mr-sm" />
              信号参数分析图表
            </div>
            <div class="row q-gutter-sm">
              <q-select v-model="chartTimeRange" :options="timeRangeOptions" label="时间范围" dense outlined
                style="min-width: 120px" @update:model-value="updateCharts" />
              <q-select v-model="chartType" :options="chartTypeOptions" label="图表类型" dense outlined
                style="min-width: 120px" @update:model-value="updateCharts" />
            </div>
          </div>

          <div class="row q-gutter-md">
            <!-- 信号强度趋势图 -->
            <div class="col-12 col-md-6">
              <div class="chart-container">
                <div class="chart-title">信号强度趋势</div>
                <div ref="signalTrendChart" style="height: 300px;"></div>
              </div>
            </div>

            <!-- 信号质量分布图 -->
            <div class="col-12 col-md-6">
              <div class="chart-container">
                <div class="chart-title">信号质量分布</div>
                <div ref="qualityDistChart" style="height: 300px;"></div>
              </div>
            </div>
          </div>

          <div class="row q-gutter-md q-mt-md">
            <!-- 邻区信息统计 -->
            <div class="col-12 col-md-6">
              <div class="chart-container">
                <div class="chart-title">工作模式分布</div>
                <div ref="workModeChart" style="height: 300px;"></div>
              </div>
            </div>

            <!-- 准确度统计 -->
            <div class="col-12 col-md-6">
              <div class="chart-container">
                <div class="chart-title">识别准确度统计</div>
                <div ref="accuracyChart" style="height: 300px;"></div>
              </div>
            </div>
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
            <q-btn color="primary" icon="refresh" label="刷新数据" dense unelevated :loading="loadingTable"
              @click="loadSignalParams" />
          </div>

          <q-table :rows="signalParamsList" :columns="tableColumns" :loading="loadingTable" row-key="id" flat bordered
            class="custom-signal-table" v-model:pagination="tablePagination" :rows-per-page-options="[5, 10, 20, 50]"
            :rows-per-page-label="'每页条数'" :no-data-label="'暂无数据'" :loading-label="'加载中...'"
            :pagination-label="getPaginationLabel" binary-state-sort>
            <!-- 自定义列模板 - ID -->
            <template v-slot:body-cell-id="props">
              <q-td :props="props" class="id-cell">
                <div class="id-content cursor-pointer" @click="copyToClipboard(props.row.id?.toString() || '')"
                  :title="`点击复制完整ID: ${props.row.id}`">
                  {{ props.value ? props.value.toString().slice(-4) : '-' }}
                </div>
              </q-td>
            </template>

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

            <!-- 自定义列模板 - 准确度 -->
            <template v-slot:body-cell-accuracy="props">
              <q-td :props="props" class="accuracy-cell">
                <q-chip :color="props.value >= 90 ? 'green' : props.value >= 70 ? 'orange' : 'red'" text-color="white"
                  size="sm" class="accuracy-chip">
                  {{ props.value }}%
                </q-chip>
              </q-td>
            </template>

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
                  <q-btn flat round dense color="negative" icon="delete" size="sm" @click="deleteSignalParam(props.row)"
                    class="action-btn delete-btn">
                    <q-tooltip>删除记录</q-tooltip>
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
    </div>
  </q-page>
</template>

<script setup lang="ts">
import { ref, onMounted, nextTick } from 'vue';
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
import { LineChart, BarChart, PieChart } from 'echarts/charts';
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
  UniversalTransition,
  CanvasRenderer
]);

const $q = useQuasar();
const selectedFile = ref<File | null>(null);
const uploading = ref(false);
const signalParamsList = ref<SignalParamsVO[]>([]);
const loadingTable = ref(false);
const showImageDialog = ref(false);
const selectedImageUrl = ref('');

const rfSignalApi = getRfSignalParams();

// 图表相关状态
const chartTimeRange = ref('24h');
const chartType = ref('line');
const signalTrendChart = ref<HTMLElement>();
const qualityDistChart = ref<HTMLElement>();
const workModeChart = ref<HTMLElement>();
const accuracyChart = ref<HTMLElement>();

let signalTrendChartInstance: echarts.ECharts | null = null;
let qualityDistChartInstance: echarts.ECharts | null = null;
let workModeChartInstance: echarts.ECharts | null = null;
let accuracyChartInstance: echarts.ECharts | null = null;

// 图表配置选项
const timeRangeOptions = [
  { label: '最近1小时', value: '1h' },
  { label: '最近24小时', value: '24h' },
  { label: '最近7天', value: '7d' },
  { label: '最近30天', value: '30d' }
];

const chartTypeOptions = [
  { label: '折线图', value: 'line' },
  { label: '柱状图', value: 'bar' },
  { label: '散点图', value: 'scatter' }
];

// 表格分页配置
const tablePagination = ref({
  page: 1,
  rowsPerPage: 10,
  rowsNumber: 0
});

// 表格列定义 - 按重要性和变化频率排序
const tableColumns = [
  {
    name: 'id',
    label: 'ID',
    field: 'id',
    align: 'left' as const,
    sortable: true,
    style: 'width: 80px; min-width: 80px',
    format: (val: any) => val ? val.toString().slice(-4) : '-'
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
  // 核心信号参数 - 最重要且变化频繁的参数
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
    name: 'rsrq',
    label: 'RSRQ',
    field: 'rsrq',
    align: 'center' as const,
    sortable: true,
    style: 'width: 80px',
    format: (val: any) => val ?? '-'
  },
  {
    name: 'hasScc',
    label: 'SCC状态',
    field: 'hasScc',
    align: 'center' as const,
    sortable: true,
    style: 'width: 80px',
    format: (val: any) => {
      if (val === null || val === undefined) return '-';
      return val === true ? '存在' : '不存在';
    }
  },
  {
    name: 'neighborInfo',
    label: '邻区信息',
    field: 'neighborInfo',
    align: 'center' as const,
    sortable: false,
    style: 'width: 100px'
  },
  {
    name: 'accuracy',
    label: '准确度',
    field: 'accuracy',
    align: 'center' as const,
    sortable: true,
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
    name: 'nrCqi',
    label: 'NR-CQI',
    field: 'nrCqi',
    align: 'center' as const,
    sortable: true,
    style: 'width: 80px',
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
    label: '创建时间',
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

      // 刷新表格数据
      await loadSignalParams();
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

// Load all signal parameters
const loadSignalParams = async () => {
  loadingTable.value = true;

  try {
    const response = await rfSignalApi.querySignalParam();

    if (response.data && response.data.isOk && response.data.okData) {
      signalParamsList.value = response.data.okData;
      // 更新分页信息
      tablePagination.value.rowsNumber = response.data.okData.length;

      if (response.data.okData.length > 0) {
        $q.notify({
          type: 'positive',
          message: `成功加载 ${response.data.okData.length} 条信号参数记录`,
          timeout: 2000
        });
        // 更新图表
        updateCharts();
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


// View image in dialog
const viewImage = (imageUrl: string) => {
  selectedImageUrl.value = imageUrl;
  showImageDialog.value = true;
};

// Delete signal parameter record
const deleteSignalParam = async (row: SignalParamsVO) => {
  if (!row.id) return;

  $q.dialog({
    title: '确认删除',
    message: `确定要删除ID为 ${row.id} 的信号参数记录吗？`,
    cancel: true,
    persistent: true
  }).onOk(async () => {
    try {
      const response = await rfSignalApi.deleteSignalParams(row.id!);
      if (response.data.isOk) {
        $q.notify({
          type: 'positive',
          message: '删除成功！'
        });
        // Refresh the table data
        await loadSignalParams();
      } else {
        throw new Error(response.data.failMsg || '删除失败');
      }
    } catch (error: any) {
      console.error('Delete error:', error);
      $q.notify({
        type: 'negative',
        message: error.message || '删除失败'
      });
    }
  });
};

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

// 自定义分页标签函数
const getPaginationLabel = (firstRowIndex: number, endRowIndex: number, totalRowsNumber: number) => {
  if (totalRowsNumber === 0) {
    return '暂无数据';
  }

  const currentPage = Math.ceil(firstRowIndex / tablePagination.value.rowsPerPage);
  const totalPages = Math.ceil(totalRowsNumber / tablePagination.value.rowsPerPage);

  return `第 ${currentPage} 页，共 ${totalPages} 页 (显示第 ${firstRowIndex}-${endRowIndex} 条，总计 ${totalRowsNumber} 条)`;
};

// 初始化图表
const initCharts = async () => {
  await nextTick();

  if (signalTrendChart.value) {
    signalTrendChartInstance = echarts.init(signalTrendChart.value);
  }
  if (qualityDistChart.value) {
    qualityDistChartInstance = echarts.init(qualityDistChart.value);
  }
  if (workModeChart.value) {
    workModeChartInstance = echarts.init(workModeChart.value);
  }
  if (accuracyChart.value) {
    accuracyChartInstance = echarts.init(accuracyChart.value);
  }

  updateCharts();
};

// 更新图表数据
const updateCharts = () => {
  if (!signalParamsList.value.length) return;

  updateSignalTrendChart();
  updateQualityDistChart();
  updateWorkModeChart();
  updateAccuracyChart();
};

// 更新信号强度趋势图
const updateSignalTrendChart = () => {
  if (!signalTrendChartInstance) return;

  const data = signalParamsList.value
    .filter(item => item.createdAt && item.rssi !== undefined && item.ssbRsrp !== undefined)
    .sort((a, b) => new Date(a.createdAt!).getTime() - new Date(b.createdAt!).getTime())
    .map(item => ({
      time: new Date(item.createdAt!).toLocaleString(),
      rssi: item.rssi,
      ssbRsrp: item.ssbRsrp
    }));

  const option = {
    title: {
      text: '信号强度变化趋势',
      textStyle: { fontSize: 14 }
    },
    tooltip: {
      trigger: 'axis',
      axisPointer: { type: 'cross' }
    },
    legend: {
      data: ['RSSI', 'SSB-RSRP']
    },
    xAxis: {
      type: 'category',
      data: data.map(d => d.time),
      axisLabel: { rotate: 45 }
    },
    yAxis: {
      type: 'value',
      name: '信号强度 (dBm)'
    },
    series: [
      {
        name: 'RSSI',
        type: chartType.value,
        data: data.map(d => d.rssi),
        smooth: true,
        lineStyle: { color: '#1976d2' }
      },
      {
        name: 'SSB-RSRP',
        type: chartType.value,
        data: data.map(d => d.ssbRsrp),
        smooth: true,
        lineStyle: { color: '#388e3c' }
      }
    ]
  };

  signalTrendChartInstance.setOption(option);
};

// 更新信号质量分布图
const updateQualityDistChart = () => {
  if (!qualityDistChartInstance) return;

  const rssiRanges = [
    { name: '优秀 (>-70)', min: -70, max: 0 },
    { name: '良好 (-70~-85)', min: -85, max: -70 },
    { name: '一般 (-85~-100)', min: -100, max: -85 },
    { name: '较差 (<-100)', min: -150, max: -100 }
  ];

  const distribution = rssiRanges.map(range => ({
    name: range.name,
    value: signalParamsList.value.filter(item =>
      item.rssi !== undefined &&
      item.rssi > range.min &&
      item.rssi <= range.max
    ).length
  }));

  const option = {
    title: {
      text: 'RSSI信号质量分布',
      textStyle: { fontSize: 14 }
    },
    tooltip: {
      trigger: 'item',
      formatter: '{a} <br/>{b}: {c} ({d}%)'
    },
    series: [
      {
        name: '信号质量',
        type: 'pie',
        radius: '60%',
        data: distribution,
        emphasis: {
          itemStyle: {
            shadowBlur: 10,
            shadowOffsetX: 0,
            shadowColor: 'rgba(0, 0, 0, 0.5)'
          }
        }
      }
    ]
  };

  qualityDistChartInstance.setOption(option);
};

// 更新工作模式分布图
const updateWorkModeChart = () => {
  if (!workModeChartInstance) return;

  const modeCount = signalParamsList.value.reduce((acc, item) => {
    const mode = item.workMode || '未知';
    acc[mode] = (acc[mode] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const data = Object.entries(modeCount).map(([name, value]) => ({ name, value }));

  const option = {
    title: {
      text: '工作模式分布',
      textStyle: { fontSize: 14 }
    },
    tooltip: {
      trigger: 'item'
    },
    xAxis: {
      type: 'category',
      data: data.map(d => d.name)
    },
    yAxis: {
      type: 'value',
      name: '数量'
    },
    series: [
      {
        name: '数量',
        type: 'bar',
        data: data.map(d => d.value),
        itemStyle: {
          color: '#ff9800'
        }
      }
    ]
  };

  workModeChartInstance.setOption(option);
};

// 更新准确度统计图
const updateAccuracyChart = () => {
  if (!accuracyChartInstance) return;

  const accuracyRanges = [
    { name: '90-100%', min: 90, max: 100 },
    { name: '80-90%', min: 80, max: 90 },
    { name: '70-80%', min: 70, max: 80 },
    { name: '<70%', min: 0, max: 70 }
  ];

  const distribution = accuracyRanges.map(range => ({
    name: range.name,
    value: signalParamsList.value.filter(item =>
      item.accuracy !== undefined &&
      item.accuracy >= range.min &&
      item.accuracy < range.max
    ).length
  }));

  const option = {
    title: {
      text: '识别准确度分布',
      textStyle: { fontSize: 14 }
    },
    tooltip: {
      trigger: 'item'
    },
    xAxis: {
      type: 'category',
      data: distribution.map(d => d.name)
    },
    yAxis: {
      type: 'value',
      name: '数量'
    },
    series: [
      {
        name: '数量',
        type: 'bar',
        data: distribution.map(d => d.value),
        itemStyle: {
          color: '#4caf50'
        }
      }
    ]
  };

  accuracyChartInstance.setOption(option);
};

// Load data when component mounts
onMounted(async () => {
  await loadSignalParams();
  await initCharts();
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

/* ID列样式 */
.id-cell {
  padding: 12px 8px;
}

.id-content {
  font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
  font-size: 12px;
  font-weight: 500;
  color: $cursor-text;
  transition: color 0.2s ease;
  cursor: pointer;

  &:hover {
    color: $cursor-primary;
    text-decoration: underline;
  }
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

/* 准确度列样式 */
.accuracy-cell {
  padding: 8px;
  text-align: center;
}

.accuracy-chip {
  font-weight: 600;
  min-width: 60px;
  font-size: 12px;
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

  &.delete-btn {
    color: $cursor-error;

    &:hover {
      background-color: rgba($cursor-error, 0.1);
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

  .id-content {
    font-size: 11px;
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

  .id-content {
    font-size: 10px;
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
</style>
