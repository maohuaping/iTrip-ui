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
      <q-card class="q-pa-md">
        <q-card-section>
          <div class="row items-center justify-between">
            <div class="text-h6">所有信号参数记录</div>
            <q-btn
              label="刷新数据"
              color="primary"
              outline
              icon="refresh"
              :loading="loadingTable"
              @click="loadSignalParams"
            />
          </div>
        </q-card-section>
        
        <q-card-section>
          <q-table
            :rows="signalParamsList"
            :columns="columns"
            :loading="loadingTable"
            row-key="id"
            flat
            bordered
            :pagination="{ rowsPerPage: 10 }"
            class="signal-params-table"
          >
            <template v-slot:body-cell-imageUrl="props">
              <q-td :props="props">
                <q-btn
                  v-if="props.value"
                  flat
                  dense
                  icon="image"
                  color="primary"
                  @click="viewImage(props.value)"
                >
                  <q-tooltip>查看图片</q-tooltip>
                </q-btn>
                <span v-else>-</span>
              </q-td>
            </template>
            
            <template v-slot:body-cell-accuracy="props">
              <q-td :props="props">
                <q-chip
                  :color="props.value >= 90 ? 'green' : props.value >= 70 ? 'orange' : 'red'"
                  text-color="white"
                  size="sm"
                >
                  {{ props.value }}%
                </q-chip>
              </q-td>
            </template>
            
            <template v-slot:body-cell-actions="props">
              <q-td :props="props">
                <q-btn
                  flat
                  dense
                  icon="delete"
                  color="negative"
                  @click="deleteSignalParam(props.row)"
                >
                  <q-tooltip>删除记录</q-tooltip>
                </q-btn>
              </q-td>
            </template>
            
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

// Table columns configuration
const columns = [
  {
    name: 'id',
    label: 'ID',
    field: 'id',
    align: 'left',
    sortable: true,
    style: 'width: 120px'
  },
  {
    name: 'tac',
    label: 'TAC',
    field: 'tac',
    align: 'center',
    sortable: true
  },
  {
    name: 'plmn',
    label: 'PLMN',
    field: 'plmn',
    align: 'center',
    sortable: true
  },
  {
    name: 'workMode',
    label: '工作模式',
    field: 'workMode',
    align: 'center',
    sortable: true
  },
  {
    name: 'pci',
    label: 'PCI',
    field: 'pci',
    align: 'center',
    sortable: true
  },
  {
    name: 'rsrq',
    label: 'RSRQ',
    field: 'rsrq',
    align: 'center',
    sortable: true
  },
  {
    name: 'rssi',
    label: 'RSSI',
    field: 'rssi',
    align: 'center',
    sortable: true
  },
  {
    name: 'ssbRsrp',
    label: 'SSB-RSRP',
    field: 'ssbRsrp',
    align: 'center',
    sortable: true
  },
  {
    name: 'ssbSinr',
    label: 'SSB-SINR',
    field: 'ssbSinr',
    align: 'center',
    sortable: true
  },
  {
    name: 'nrBand',
    label: 'NR频段',
    field: 'nrBand',
    align: 'center',
    sortable: true
  },
  {
    name: 'accuracy',
    label: '准确度',
    field: 'accuracy',
    align: 'center',
    sortable: true
  },
  {
    name: 'imageUrl',
    label: '图片',
    field: 'imageUrl',
    align: 'center'
  },
  {
    name: 'createdAt',
    label: '创建时间',
    field: 'createdAt',
    align: 'center',
    sortable: true,
    format: (val: string) => formatDateTime(val)
  },
  {
    name: 'actions',
    label: '操作',
    field: '',
    align: 'center'
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

// Load data when component mounts
onMounted(() => {
  loadSignalParams();
});

const formatDateTime = (dateTime?: string) => {
  if (!dateTime) return '-';
  return new Date(dateTime).toLocaleString();
};
</script>

<style scoped>
.signal-params-table :deep(.q-table__top),
.signal-params-table :deep(.q-table__bottom),
.signal-params-table :deep(thead tr:first-child th) {
  background-color: #f5f5f5;
}

.signal-params-table :deep(thead tr th) {
  position: sticky;
  z-index: 1;
}

.signal-params-table :deep(thead tr:first-child th) {
  top: 0;
}

.signal-params-table :deep(.q-table tbody tr:hover) {
  background-color: #f8f9fa;
}
</style>
