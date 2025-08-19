<template>
    <section id="toolBox" class="q-mb-xl">
        <div class="q-pa-sm">
            <div class="row justify-between items-center q-mb-lg">
                <h2 class="text-h5 text-weight-bold q-my-none text-cursor-text">
                    <q-icon name="auto_awesome" size="28px" class="q-mr-sm" color="cursor-primary" />
                    工具箱
                </h2>
            </div>

            <!-- 随机号码生成器 -->
            <div class="q-mb-lg">
                <div class="text-h6 q-mb-md text-cursor-text">
                    <q-icon name="phone" size="24px" class="q-mr-sm" color="cursor-primary" />
                    随机号码生成器
                </div>

                <!-- 号码展示区域 -->
                <div v-if="phoneList.length" class="phone-display-area">
                    <div class="row items-center justify-between q-mb-sm">
                        <div class="text-subtitle2 text-cursor-muted">
                            已生成 {{ phoneList.length }} 个随机号码：
                        </div>
                        <q-btn color="primary" size="sm" icon="refresh" @click="generateRandomPhones"
                            :loading="isLoading" dense round unelevated />
                    </div>
                    <div class="q-gutter-y-sm">
                        <div v-for="(phoneData, index) in phoneList" :key="index" class="phone-item-wrapper-horizontal">
                            <div class="row q-gutter-sm items-center">
                                <!-- 手机号 -->
                                <div class="phone-item-horizontal">
                                    <div class="item-label-horizontal text-cursor-muted">手机号</div>
                                    <q-chip :label="phoneData.phone" color="cursor-primary" text-color="white"
                                        class="phone-chip" clickable
                                        @click="phoneData.phone && copyPhone(phoneData.phone)"
                                        icon-right="content_copy">
                                    </q-chip>
                                </div>
                                <!-- 证件号 -->
                                <div class="phone-item-horizontal">
                                    <div class="item-label-horizontal text-cursor-muted">证件号</div>
                                    <q-chip :label="phoneData.idNo" color="cursor-secondary" text-color="white"
                                        class="phone-chip" clickable
                                        @click="phoneData.idNo && copyPhone(phoneData.idNo)" icon-right="content_copy">
                                    </q-chip>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- 空状态 -->
                <div v-else class="empty-state text-center q-pa-md">
                    <div class="row items-center justify-center q-gutter-sm">
                        <q-icon name="phone_disabled" size="32px" color="cursor-muted" />
                        <span class="text-cursor-muted">点击生成随机号码</span>
                        <q-btn color="primary" size="sm" icon="refresh" @click="generateRandomPhones"
                            :loading="isLoading" dense round unelevated />
                    </div>
                </div>
            </div>
        </div>
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


</script>

<style scoped>
.phone-display-area {
    background: var(--q-cursor-surface);
    border-radius: 8px;
    padding: 16px;
    border: 1px solid var(--q-cursor-border);
}

.phone-item-wrapper-horizontal {
    margin-bottom: 8px;
}

.phone-item-horizontal {
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    gap: 4px;
}

.item-label-horizontal {
    font-size: 11px;
    font-weight: 500;
    margin-bottom: 2px;
}

.phone-chip {
    cursor: pointer;
    transition: all 0.2s ease;
}

.phone-chip:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
}

.empty-state {
    background: var(--q-cursor-surface);
    border-radius: 8px;
    border: 2px dashed var(--q-cursor-border);
}

.text-cursor-text {
    color: var(--q-cursor-text);
}

.text-cursor-muted {
    color: var(--q-cursor-muted);
}
</style>
