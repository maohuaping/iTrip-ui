<template>
  <q-page class="q-pa-md">
    <div class="q-gutter-md">
      <h4 class="text-center q-mb-lg">RF Signal Parameters Recognition</h4>
      
      <!-- File Upload Section -->
      <q-card class="q-pa-md">
        <q-card-section>
          <div class="text-h6">Upload Signal Parameters Image</div>
          <div class="text-subtitle2 text-grey-7 q-mb-md">
            Upload an image file to recognize RF signal parameters
          </div>
        </q-card-section>
        
        <q-card-section>
          <q-file
            v-model="selectedFile"
            label="Select image file"
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
              label="Upload & Recognize"
              color="primary"
              :loading="uploading"
              :disable="!selectedFile"
              @click="uploadFile"
              icon="upload"
            />
            <q-btn
              label="Clear"
              color="grey"
              outline
              @click="clearFile"
              :disable="uploading"
            />
          </div>
        </q-card-section>
      </q-card>

      <!-- Results Section -->
      <q-card v-if="recognitionResult" class="q-pa-md">
        <q-card-section>
          <div class="text-h6">Recognition Results</div>
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
                        <q-item-label caption>ID</q-item-label>
                        <q-item-label>{{ recognitionResult.id }}</q-item-label>
                      </q-item-section>
                    </q-item>
                  </div>
                  <div class="col-6">
                    <q-item dense>
                      <q-item-section>
                        <q-item-label caption>Accuracy</q-item-label>
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
                        <q-item-label caption>Work Mode</q-item-label>
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
                        <q-item-label caption>NR Band</q-item-label>
                        <q-item-label>{{ recognitionResult.nrBand }}</q-item-label>
                      </q-item-section>
                    </q-item>
                  </div>
                  <div class="col-6">
                    <q-item dense>
                      <q-item-section>
                        <q-item-label caption>NR Power</q-item-label>
                        <q-item-label>{{ recognitionResult.nrPower }}</q-item-label>
                      </q-item-section>
                    </q-item>
                  </div>
                </div>
                
                <div class="row">
                  <div class="col-6">
                    <q-item dense>
                      <q-item-section>
                        <q-item-label caption>NR CQI</q-item-label>
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
          <div class="text-subtitle1 q-mb-sm">Neighbor Cell Information</div>
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
                  <q-item-label caption>Created At</q-item-label>
                  <q-item-label class="text-caption">{{ formatDateTime(recognitionResult.createdAt) }}</q-item-label>
                </q-item-section>
              </q-item>
            </div>
            <div class="col-6">
              <q-item dense>
                <q-item-section>
                  <q-item-label caption>Updated At</q-item-label>
                  <q-item-label class="text-caption">{{ formatDateTime(recognitionResult.updatedAt) }}</q-item-label>
                </q-item-section>
              </q-item>
            </div>
          </div>
        </q-card-section>
      </q-card>
    </div>
  </q-page>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { useQuasar } from 'quasar';
import { getRfSignalParams } from 'src/api/rf-signal-params/rf-signal-params';
import type { SignalParamsVO } from 'src/api/api.schemas';

const $q = useQuasar();
const selectedFile = ref<File | null>(null);
const uploading = ref(false);
const recognitionResult = ref<SignalParamsVO | null>(null);

const rfSignalApi = getRfSignalParams();

const onRejected = (rejectedEntries: any[]) => {
  $q.notify({
    type: 'negative',
    message: `${rejectedEntries.length} file(s) rejected. Please check file size and format.`
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
      message: 'Please select a file first'
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
        message: 'Signal parameters recognized successfully!'
      });
    } else {
      throw new Error(response.data.failMsg || 'Recognition failed');
    }
  } catch (error: any) {
    console.error('Upload error:', error);
    $q.notify({
      type: 'negative',
      message: error.message || 'Failed to recognize signal parameters'
    });
  } finally {
    uploading.value = false;
  }
};

const formatDateTime = (dateTime?: string) => {
  if (!dateTime) return '-';
  return new Date(dateTime).toLocaleString();
};
</script>
