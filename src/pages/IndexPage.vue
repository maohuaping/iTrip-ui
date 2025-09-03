<template>
  <q-page class="q-pa-md" style="min-height: 100vh;">
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
          <q-file
            v-model="selectedFile"
            label="选择图片文件"
            accept=".jpg,.jpeg,.png,.gif"
            max-file-size="10485760"
            @rejected="onRejected"
            outlined
            class="q-mb-md"
          >
            <template v-slot:prepend>
              <q-icon name="attach_file" />
            </template>
          </q-file>
          
          <div class="row q-gutter-sm">
            <q-btn
              label="上传并识别"
              color="primary"
              :loading="uploading"
              :disable="!selectedFile"
              @click="uploadFile"
              icon="upload"
            />
            <q-btn
              label="清除"
              color="grey"
              outline
              @click="clearFile"
              :disable="uploading"
            />
          </div>
        </q-card-section>
      </q-card>

      <!-- Results Section -->
      <q-card v-if="recognitionResult" class="q-pa-md q-mb-md">
        <q-card-section>
          <div class="text-h6">最新识别结果</div>
        </q-card-section>
        
        <q-card-section>
          <div class="row q-gutter-md">
            <!-- Image Display -->
            <div class="col-12 col-md-4">
              <q-img
                v-if="recognitionResult.imageUrl"
                :src="recognitionResult.imageUrl"
                style="max-height: 300px"
                fit="contain"
                class="rounded-borders"
              />
            </div>
            
            <!-- Parameters Display -->
            <div class="col-12 col-md-8">
              <div class="q-gutter-sm">
                <div class="row">
                  <div class="col-6">
                    <q-item dense>
                      <q-item-section>
                        <q-item-label caption>识别ID</q-item-label>
                        <q-item-label>{{ recognitionResult.id }}</q-item-label>
                      </q-item-section>
                    </q-item>
                  </div>
                  <div class="col-6">
                    <q-item dense>
                      <q-item-section>
                        <q-item-label caption>识别准确度</q-item-label>
                        <q-item-label>{{ recognitionResult.accuracy }}%</q-item-label>
                      </q-item-section>
                    </q-item>
                  </div>
                </div>
                
                <div class="row">
                  <div class="col-6">
                    <q-item dense>
                      <q-item-section>
                        <q-item-label caption>TAC</q-item-label>
                        <q-item-label>{{ recognitionResult.tac }}</q-item-label>
                      </q-item-section>
                    </q-item>
                  </div>
                  <div class="col-6">
                    <q-item dense>
                      <q-item-section>
                        <q-item-label caption>PLMN</q-item-label>
                        <q-item-label>{{ recognitionResult.plmn }}</q-item-label>
                      </q-item-section>
                    </q-item>
                  </div>
                </div>
                
                <div class="row">
                  <div class="col-6">
                    <q-item dense>
                      <q-item-section>
                        <q-item-label caption>工作模式</q-item-label>
                        <q-item-label>{{ recognitionResult.workMode }}</q-item-label>
                      </q-item-section>
                    </q-item>
                  </div>
                  <div class="col-6">
                    <q-item dense>
                      <q-item-section>
                        <q-item-label caption>PCI</q-item-label>
                        <q-item-label>{{ recognitionResult.pci }}</q-item-label>
                      </q-item-section>
                    </q-item>
                  </div>
                </div>
                
                <div class="row">
                  <div class="col-6">
                    <q-item dense>
                      <q-item-section>
                        <q-item-label caption>RSRQ</q-item-label>
                        <q-item-label>{{ recognitionResult.rsrq }}</q-item-label>
                      </q-item-section>
                    </q-item>
                  </div>
                  <div class="col-6">
                    <q-item dense>
                      <q-item-section>
                        <q-item-label caption>RSSI</q-item-label>
                        <q-item-label>{{ recognitionResult.rssi }}</q-item-label>
                      </q-item-section>
                    </q-item>
                  </div>
                </div>
                
                <div class="row">
                  <div class="col-6">
                    <q-item dense>
                      <q-item-section>
                        <q-item-label caption>SSB-RSRP</q-item-label>
                        <q-item-label>{{ recognitionResult.ssbRsrp }}</q-item-label>
                      </q-item-section>
                    </q-item>
                  </div>
                  <div class="col-6">
                    <q-item dense>
                      <q-item-section>
                        <q-item-label caption>SSB-SINR</q-item-label>
                        <q-item-label>{{ recognitionResult.ssbSinr }}</q-item-label>
                      </q-item-section>
                    </q-item>
                  </div>
                </div>
                
                <div class="row">
                  <div class="col-6">
                    <q-item dense>
                      <q-item-section>
                        <q-item-label caption>NR频段</q-item-label>
                        <q-item-label>{{ recognitionResult.nrBand }}</q-item-label>
                      </q-item-section>
                    </q-item>
                  </div>
                  <div class="col-6">
                    <q-item dense>
                      <q-item-section>
                        <q-item-label caption>NR功率</q-item-label>
                        <q-item-label>{{ recognitionResult.nrPower }}</q-item-label>
                      </q-item-section>
                    </q-item>
                  </div>
                </div>
                
                <div class="row">
                  <div class="col-6">
                    <q-item dense>
                      <q-item-section>
                        <q-item-label caption>NR-CQI</q-item-label>
                        <q-item-label>{{ recognitionResult.nrCqi }}</q-item-label>
                      </q-item-section>
                    </q-item>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          <!-- Neighbor Cell Information -->
          <q-separator class="q-my-md" />
          <div class="text-subtitle1 q-mb-sm">邻区信息</div>
          <div class="row q-gutter-sm">
            <div class="col-12 col-md-4">
              <q-item dense>
                <q-item-section>
                  <q-item-label caption>EARFCN-NBR</q-item-label>
                  <q-item-label class="text-caption">{{ recognitionResult.earfcnNbr }}</q-item-label>
                </q-item-section>
              </q-item>
            </div>
            <div class="col-12 col-md-4">
              <q-item dense>
                <q-item-section>
                  <q-item-label caption>PCI-NBR</q-item-label>
                  <q-item-label class="text-caption">{{ recognitionResult.pciNbr }}</q-item-label>
                </q-item-section>
              </q-item>
            </div>
            <div class="col-12 col-md-4">
              <q-item dense>
                <q-item-section>
                  <q-item-label caption>RSRP-NBR</q-item-label>
                  <q-item-label class="text-caption">{{ recognitionResult.rsrpNbr }}</q-item-label>
                </q-item-section>
              </q-item>
            </div>
          </div>
          
          <!-- Timestamps -->
          <q-separator class="q-my-md" />
          <div class="row q-gutter-sm">
            <div class="col-6">
              <q-item dense>
                <q-item-section>
                  <q-item-label caption>创建时间</q-item-label>
                  <q-item-label class="text-caption">{{ formatDateTime(recognitionResult.createdAt) }}</q-item-label>
                </q-item-section>
              </q-item>
            </div>
            <div class="col-6">
              <q-item dense>
                <q-item-section>
                  <q-item-label caption>更新时间</q-item-label>
                  <q-item-label class="text-caption">{{ formatDateTime(recognitionResult.updatedAt) }}</q-item-label>
                </q-item-section>
              </q-item>
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
            <q-btn
              color="primary"
              icon="refresh"
              label="刷新数据"
              dense
              unelevated
              :loading="loadingTable"
              @click="loadSignalParams"
            />
          </div>

          <q-table
            :rows="signalParamsList"
            :columns="tableColumns"
            :loading="loadingTable"
            row-key="id"
            flat
            bordered
            class="custom-signal-table"
            v-model:pagination="tablePagination"
            :rows-per-page-options="[5, 10, 20, 50]"
            :rows-per-page-label="'每页条数'"
            :no-data-label="'暂无数据'"
            :loading-label="'加载中...'"
            :pagination-label="getPaginationLabel"
            binary-state-sort
          >
            <!-- 自定义列模板 - ID -->
            <template v-slot:body-cell-id="props">
              <q-td :props="props" class="id-cell">
                <div class="id-content cursor-pointer" @click="copyToClipboard(props.value?.toString() || '')" 
                     title="点击复制ID">
                  {{ props.value }}
                </div>
              </q-td>
            </template>

            <!-- 自定义列模板 - 图片 -->
            <template v-slot:body-cell-imageUrl="props">
              <q-td :props="props" class="image-cell">
                <q-btn
                  v-if="props.value"
                  flat
                  round
                  dense
                  color="primary"
                  icon="image"
                  size="sm"
                  @click="viewImage(props.value)"
                  class="image-btn"
                >
                  <q-tooltip>查看图片</q-tooltip>
                </q-btn>
                <span v-else class="text-grey-5">无</span>
              </q-td>
            </template>
            
            <!-- 自定义列模板 - 准确度 -->
            <template v-slot:body-cell-accuracy="props">
              <q-td :props="props" class="accuracy-cell">
                <q-chip
                  :color="props.value >= 90 ? 'green' : props.value >= 70 ? 'orange' : 'red'"
                  text-color="white"
                  size="sm"
                  class="accuracy-chip"
                >
                  {{ props.value }}%
                </q-chip>
              </q-td>
            </template>

            <!-- 自定义列模板 - 邻区信息 -->
            <template v-slot:body-cell-neighborInfo="props">
              <q-td :props="props" class="neighbor-cell">
                <q-btn
                  flat
                  round
                  dense
                  color="info"
                  icon="info"
                  size="sm"
                  class="neighbor-btn"
                >
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
                  <q-btn
                    flat
                    round
                    dense
                    color="negative"
                    icon="delete"
                    size="sm"
                    @click="deleteSignalParam(props.row)"
                    class="action-btn delete-btn"
                  >
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
            <q-img
              :src="selectedImageUrl"
              fit="contain"
              style="max-height: 70vh"
            />
          </q-card-section>
        </q-card>
      </q-dialog>
    </div>
  </q-page>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useQuasar } from 'quasar';
import { getRfSignalParams } from 'src/api/rf-signal-params/rf-signal-params';
import type { SignalParamsVO } from 'src/api/api.schemas';

const $q = useQuasar();
const selectedFile = ref<File | null>(null);
const uploading = ref(false);
const recognitionResult = ref<SignalParamsVO | null>(null);
const signalParamsList = ref<SignalParamsVO[]>([]);
const loadingTable = ref(false);
const showImageDialog = ref(false);
const selectedImageUrl = ref('');

const rfSignalApi = getRfSignalParams();

// 表格分页配置
const tablePagination = ref({
  page: 1,
  rowsPerPage: 10,
  rowsNumber: 0
});

// 表格列定义
const tableColumns = [
  {
    name: 'id',
    label: 'ID',
    field: 'id',
    align: 'left' as const,
    sortable: true,
    style: 'width: 120px; min-width: 120px'
  },
  {
    name: 'tac',
    label: 'TAC',
    field: 'tac',
    align: 'center' as const,
    sortable: true,
    style: 'width: 100px'
  },
  {
    name: 'plmn',
    label: 'PLMN',
    field: 'plmn',
    align: 'center' as const,
    sortable: true,
    style: 'width: 100px'
  },
  {
    name: 'workMode',
    label: '工作模式',
    field: 'workMode',
    align: 'center' as const,
    sortable: true,
    style: 'width: 100px'
  },
  {
    name: 'pci',
    label: 'PCI',
    field: 'pci',
    align: 'center' as const,
    sortable: true,
    style: 'width: 80px'
  },
  {
    name: 'rsrq',
    label: 'RSRQ',
    field: 'rsrq',
    align: 'center' as const,
    sortable: true,
    style: 'width: 80px'
  },
  {
    name: 'rssi',
    label: 'RSSI',
    field: 'rssi',
    align: 'center' as const,
    sortable: true,
    style: 'width: 80px'
  },
  {
    name: 'ssbRsrp',
    label: 'SSB-RSRP',
    field: 'ssbRsrp',
    align: 'center' as const,
    sortable: true,
    style: 'width: 100px'
  },
  {
    name: 'ssbSinr',
    label: 'SSB-SINR',
    field: 'ssbSinr',
    align: 'center' as const,
    sortable: true,
    style: 'width: 100px'
  },
  {
    name: 'nrBand',
    label: 'NR频段',
    field: 'nrBand',
    align: 'center' as const,
    sortable: true,
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
  {
    name: 'neighborInfo',
    label: '邻区信息',
    field: 'neighborInfo',
    align: 'center' as const,
    sortable: false,
    style: 'width: 100px'
  },
  {
    name: 'imageUrl',
    label: '图片',
    field: 'imageUrl',
    align: 'center' as const,
    sortable: false,
    style: 'width: 80px'
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
  recognitionResult.value = null;
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
      recognitionResult.value = response.data.okData;
      $q.notify({
        type: 'positive',
        message: '信号参数识别成功！'
      });
      // Refresh the table data after successful upload
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
    if (response.data.isOk && response.data.okData) {
      signalParamsList.value = response.data.okData;
      // 更新分页信息
      tablePagination.value.rowsNumber = response.data.okData.length;
    } else {
      throw new Error(response.data.failMsg || '获取数据失败');
    }
  } catch (error: any) {
    console.error('Load signal params error:', error);
    $q.notify({
      type: 'negative',
      message: error.message || '获取信号参数列表失败'
    });
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

// Load data when component mounts
onMounted(() => {
  loadSignalParams();
});

const formatDateTime = (dateTime?: string) => {
  if (!dateTime) return '-';
  return new Date(dateTime).toLocaleString();
};
</script>

<style lang="scss" scoped>
@import 'src/css/quasar.variables.scss';

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
  :deep(td), :deep(th) {
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
    
    :deep(th), :deep(td) {
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
    
    :deep(th), :deep(td) {
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

