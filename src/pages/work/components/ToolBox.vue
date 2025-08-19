<template>
    <section id="toolBox" class="q-mb-xl">
        <div class="q-pa-sm">
            <div class="row justify-between items-center q-mb-lg">
                <h2 class="text-h5 text-weight-bold q-my-none">
                    <q-icon name="auto_awesome" size="28px" class="q-mr-sm" />
                    工具箱
                </h2>
            </div>

            <!-- 随机号码生成器 -->
            <div class="q-mb-lg">
                <div class="text-h6 q-mb-md">
                    <q-icon name="phone" size="24px" class="q-mr-sm" />
                    随机号码生成器
                </div>

                <div class="row q-gutter-md q-mb-md">
                    <q-btn color="primary" size="md" icon="refresh" label="生成随机号码" @click="generateRandomPhones"
                        :loading="isLoading" class="q-px-md" unelevated rounded />
                    <q-btn color="secondary" size="md" icon="content_copy" label="复制全部" @click="copyAllPhones"
                        :disable="!phoneList.length" class="q-px-md" unelevated rounded />
                </div>

                <!-- 号码展示区域 -->
                <div v-if="phoneList.length" class="phone-display-area">
                    <div class="text-subtitle2 q-mb-sm text-grey-7">
                        已生成 {{ phoneList.length }} 个随机号码：
                    </div>
                    <div class="row q-gutter-sm">
                        <div v-for="(phoneData, index) in phoneList" :key="index" class="phone-item">
                            <q-chip :label="`${phoneData.phone} (${phoneData.idNo})`" color="blue-1" text-color="blue-9"
                                class="phone-chip" clickable
                                @click="copyPhone(`${phoneData.phone} (${phoneData.idNo})`)" icon-right="content_copy">
                            </q-chip>
                        </div>
                    </div>
                </div>

                <!-- 空状态 -->
                <div v-else class="empty-state text-center q-pa-lg">
                    <q-icon name="phone_disabled" size="48px" color="grey-4" />
                    <div class="text-grey-6 q-mt-sm">点击按钮生成随机号码</div>
                </div>
            </div>
        </div>

        <!-- 复制成功提示 -->
        <q-dialog v-model="showCopySuccess" position="top">
            <q-banner class="bg-positive text-white">
                <template v-slot:avatar>
                    <q-icon name="check_circle" />
                </template>
                复制成功！
            </q-banner>
        </q-dialog>
    </section>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useQuasar } from 'quasar'
import { getTool } from '../../../api/tool/tool'
import type { GetRandomPhoneVO } from '../../../api/api.schemas'

// 响应式数据
const $q = useQuasar()
const isLoading = ref(false)
const phoneList = ref<GetRandomPhoneVO[]>([])
const showCopySuccess = ref(false)

// 获取工具API
const toolApi = getTool()

// 生成随机号码
const generateRandomPhones = async () => {
    try {
        isLoading.value = true
        const response = await toolApi.getRandomPhone()

        if (response.data?.isOk && response.data.okData) {
            // 每次调用接口只返回一个号码，将新号码添加到列表中
            phoneList.value.push(response.data.okData)
            $q.notify({
                type: 'positive',
                message: `成功生成新的随机号码`,
                position: 'top'
            })
        } else {
            $q.notify({
                type: 'negative',
                message: response.data?.failMsg || '生成随机号码失败',
                position: 'top'
            })
        }
    } catch (error) {
        console.error('生成随机号码出错:', error)
        $q.notify({
            type: 'negative',
            message: '网络错误，请稍后重试',
            position: 'top'
        })
    } finally {
        isLoading.value = false
    }
}

// 复制单个号码
const copyPhone = async (phone: string) => {
    try {
        await navigator.clipboard.writeText(phone)
        showCopySuccess.value = true
        setTimeout(() => {
            showCopySuccess.value = false
        }, 2000)

        $q.notify({
            type: 'positive',
            message: `已复制号码: ${phone}`,
            position: 'top'
        })
    } catch (error) {
        console.error('复制失败:', error)
        $q.notify({
            type: 'negative',
            message: '复制失败，请手动复制',
            position: 'top'
        })
    }
}

// 复制所有号码
const copyAllPhones = async () => {
    if (!phoneList.value.length) return

    try {
        const allPhones = phoneList.value.map(item => `${item.phone} (${item.idNo})`).join('\n')
        await navigator.clipboard.writeText(allPhones)
        showCopySuccess.value = true
        setTimeout(() => {
            showCopySuccess.value = false
        }, 2000)

        $q.notify({
            type: 'positive',
            message: `已复制全部 ${phoneList.value.length} 个号码`,
            position: 'top'
        })
    } catch (error) {
        console.error('复制失败:', error)
        $q.notify({
            type: 'negative',
            message: '复制失败，请手动复制',
            position: 'top'
        })
    }
}
</script>

<style scoped>
.phone-display-area {
    background: #f8f9fa;
    border-radius: 8px;
    padding: 16px;
    border: 1px solid #e9ecef;
}

.phone-item {
    display: inline-block;
}

.phone-chip {
    cursor: pointer;
    transition: all 0.2s ease;
}

.phone-chip:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
}

.copy-icon {
    opacity: 0.7;
    transition: opacity 0.2s ease;
}

.copy-icon:hover {
    opacity: 1;
}

.empty-state {
    background: #f8f9fa;
    border-radius: 8px;
    border: 2px dashed #dee2e6;
}
</style>