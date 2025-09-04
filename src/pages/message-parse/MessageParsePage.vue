<template>
    <q-page class="q-pa-md" style="min-height: 100vh; overflow-y: auto;">
        <div class="q-gutter-md" style="max-width: 1400px; margin: 0 auto;">
            <h4 class="text-center q-mb-lg">消息解析系统</h4>

            <!-- File Upload Section -->
            <q-card class="q-pa-md">
                <q-card-section>
                    <div class="text-h6">上传消息图片</div>
                    <div class="text-subtitle2 text-grey-7 q-mb-md">
                        上传图片文件来解析其中的人员、公司和产品信息
                    </div>
                </q-card-section>

                <q-card-section>
                    <q-file v-model="selectedFile" label="选择图片文件" accept=".jpg,.jpeg,.png,.gif" max-file-size="10485760"
                        @rejected="onRejected" @input="onFileSelected" outlined class="q-mb-md">
                        <template v-slot:prepend>
                            <q-icon name="attach_file" />
                        </template>
                    </q-file>

                    <div class="row q-gutter-sm">
                        <q-btn label="上传并解析" color="primary" :loading="uploading" :disable="!selectedFile"
                            @click="uploadAndParse" icon="upload" />
                        <q-btn label="清除" color="grey" outline @click="clearFile" :disable="uploading" />
                    </div>
                </q-card-section>

                <!-- 解析结果展示区域 -->
                <q-card-section v-if="parseResult" class="result-section">
                    <q-separator class="q-mb-md" />
                    <div class="text-h6 q-mb-md">
                        <q-icon name="analytics" class="q-mr-sm" />
                        解析结果
                    </div>

                    <q-card flat bordered class="result-card">
                        <q-card-section>
                            <div class="row q-gutter-sm q-mb-md">
                                <q-chip v-if="parseResult.parseStatus === 'SUCCESS'" color="positive" text-color="white"
                                    icon="check_circle" size="md">
                                    解析成功
                                </q-chip>
                                <q-chip v-else color="negative" text-color="white" icon="error" size="md">
                                    解析失败
                                </q-chip>
                            </div>

                            <div v-if="parseResult.parseStatus === 'SUCCESS'" class="results-grid">
                                <div v-if="parseResult.persons && parseResult.persons.length > 0" class="result-item">
                                    <div class="result-label">
                                        <q-icon name="person" class="q-mr-xs" />
                                        人员信息
                                    </div>
                                    <div class="result-content">
                                        <q-chip v-for="person in parseResult.persons" :key="person" color="blue"
                                            text-color="white" size="sm" class="q-mr-xs q-mb-xs">
                                            {{ person }}
                                        </q-chip>
                                    </div>
                                </div>

                                <div v-if="parseResult.companies && parseResult.companies.length > 0"
                                    class="result-item">
                                    <div class="result-label">
                                        <q-icon name="business" class="q-mr-xs" />
                                        公司信息
                                    </div>
                                    <div class="result-content">
                                        <q-chip v-for="company in parseResult.companies" :key="company" color="green"
                                            text-color="white" size="sm" class="q-mr-xs q-mb-xs">
                                            {{ company }}
                                        </q-chip>
                                    </div>
                                </div>

                                <div v-if="parseResult.products && parseResult.products.length > 0" class="result-item">
                                    <div class="result-label">
                                        <q-icon name="inventory" class="q-mr-xs" />
                                        产品信息
                                    </div>
                                    <div class="result-content">
                                        <q-chip v-for="product in parseResult.products" :key="product" color="orange"
                                            text-color="white" size="sm" class="q-mr-xs q-mb-xs">
                                            {{ product }}
                                        </q-chip>
                                    </div>
                                </div>

                                <div v-if="parseResult.rawText" class="result-item full-width">
                                    <div class="result-label">
                                        <q-icon name="text_fields" class="q-mr-xs" />
                                        原始识别文本
                                    </div>
                                    <div class="result-content">
                                        <div class="raw-text-container">
                                            {{ parseResult.rawText }}
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div v-else-if="parseResult.failReason" class="text-negative">
                                <q-icon name="error" class="q-mr-xs" />
                                <strong>失败原因:</strong> {{ parseResult.failReason }}
                            </div>
                        </q-card-section>
                    </q-card>
                </q-card-section>
            </q-card>

            <!-- History Records Table -->
            <q-card flat bordered class="history-table-card q-mb-lg">
                <q-card-section class="q-pa-sm">
                    <div class="row justify-between items-center q-mb-md q-pa-sm">
                        <div class="text-h6 text-weight-bold">
                            <q-icon name="history" size="28px" class="q-mr-sm" />
                            解析历史记录
                        </div>
                        <div class="row q-gutter-sm">
                            <q-input v-model.number="pagination.page" type="number" label="页码" outlined dense
                                style="width: 80px" min="1" />
                            <q-select v-model="pagination.rowsPerPage" :options="[10, 20, 50, 100]" label="每页条数"
                                outlined dense style="width: 100px" />
                            <q-btn color="primary" icon="refresh" label="刷新数据" dense unelevated :loading="loading"
                                @click="loadHistory" />
                        </div>
                    </div>

                    <q-table :rows="historyList" :columns="tableColumns" :loading="loading" row-key="id" flat bordered
                        class="custom-history-table" v-model:pagination="tablePagination"
                        :rows-per-page-options="[10, 20, 50, 100]" :rows-per-page-label="'每页条数'"
                        :no-data-label="'暂无解析记录'" :loading-label="'加载中...'" :pagination-label="getPaginationLabel"
                        binary-state-sort>
                        <!-- 自定义列模板 - ID -->
                        <template v-slot:body-cell-id="props">
                            <q-td :props="props" class="id-cell">
                                <div class="id-content cursor-pointer"
                                    @click="copyToClipboard(props.value?.toString() || '')" title="点击复制ID">
                                    {{ props.value }}
                                </div>
                            </q-td>
                        </template>

                        <!-- 自定义列模板 - 解析状态 -->
                        <template v-slot:body-cell-parseStatus="props">
                            <q-td :props="props" class="status-cell">
                                <q-chip :color="props.value === 'SUCCESS' ? 'positive' : 'negative'" text-color="white"
                                    size="sm" class="status-chip">
                                    {{ props.value === 'SUCCESS' ? '成功' : '失败' }}
                                </q-chip>
                            </q-td>
                        </template>

                        <!-- 自定义列模板 - 人员信息 -->
                        <template v-slot:body-cell-persons="props">
                            <q-td :props="props" class="info-cell">
                                <div v-if="props.value && props.value.length > 0" class="info-content">
                                    <q-chip v-for="person in props.value.slice(0, 2)" :key="person" color="blue"
                                        text-color="white" size="sm" class="q-mr-xs q-mb-xs">
                                        {{ person }}
                                    </q-chip>
                                    <span v-if="props.value.length > 2" class="text-caption text-grey">
                                        +{{ props.value.length - 2 }}
                                    </span>
                                </div>
                                <span v-else class="text-grey-5">无</span>
                            </q-td>
                        </template>

                        <!-- 自定义列模板 - 公司信息 -->
                        <template v-slot:body-cell-companies="props">
                            <q-td :props="props" class="info-cell">
                                <div v-if="props.value && props.value.length > 0" class="info-content">
                                    <q-chip v-for="company in props.value.slice(0, 2)" :key="company" color="green"
                                        text-color="white" size="sm" class="q-mr-xs q-mb-xs">
                                        {{ company }}
                                    </q-chip>
                                    <span v-if="props.value.length > 2" class="text-caption text-grey">
                                        +{{ props.value.length - 2 }}
                                    </span>
                                </div>
                                <span v-else class="text-grey-5">无</span>
                            </q-td>
                        </template>

                        <!-- 自定义列模板 - 产品信息 -->
                        <template v-slot:body-cell-products="props">
                            <q-td :props="props" class="info-cell">
                                <div v-if="props.value && props.value.length > 0" class="info-content">
                                    <q-chip v-for="product in props.value.slice(0, 2)" :key="product" color="orange"
                                        text-color="white" size="sm" class="q-mr-xs q-mb-xs">
                                        {{ product }}
                                    </q-chip>
                                    <span v-if="props.value.length > 2" class="text-caption text-grey">
                                        +{{ props.value.length - 2 }}
                                    </span>
                                </div>
                                <span v-else class="text-grey-5">无</span>
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

                        <!-- 自定义列模板 - 操作 -->
                        <template v-slot:body-cell-actions="props">
                            <q-td :props="props" class="actions-cell">
                                <div class="action-buttons">
                                    <q-btn flat round dense color="primary" icon="visibility" size="sm"
                                        @click="viewDetail(props.row)" class="action-btn view-btn">
                                        <q-tooltip>查看详情</q-tooltip>
                                    </q-btn>
                                    <q-btn flat round dense color="negative" icon="delete" size="sm"
                                        @click="deleteRecord(props.row)" class="action-btn delete-btn">
                                        <q-tooltip>删除记录</q-tooltip>
                                    </q-btn>
                                </div>
                            </q-td>
                        </template>

                        <!-- 空状态 -->
                        <template v-slot:no-data>
                            <div class="full-width flex justify-center items-center"
                                style="min-height: 300px; padding: 60px 20px;">
                                <div class="text-center">
                                    <q-icon name="history" size="64px" color="grey-5" class="q-mb-md" />
                                    <div class="text-h6 text-grey-6 q-mb-sm">暂无解析记录</div>
                                    <div class="text-body2 text-grey-5">上传图片来开始解析消息</div>
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

            <!-- 详情对话框 -->
            <q-dialog v-model="showDetailDialog" full-width>
                <q-card style="max-width: 900px">
                    <q-card-section class="row items-center q-pb-none">
                        <div class="text-h6">解析详情</div>
                        <q-space />
                        <q-btn icon="close" flat round dense @click="showDetailDialog = false" />
                    </q-card-section>

                    <q-card-section v-if="detailItem">
                        <div class="row q-gutter-md">
                            <!-- 原始图片 -->
                            <div class="col-12 col-md-6">
                                <div class="text-subtitle2 q-mb-sm">原始图片:</div>
                                <q-img v-if="detailItem.imageUrl" :src="detailItem.imageUrl"
                                    style="max-width: 100%; max-height: 400px;" class="rounded-borders detail-image" />
                                <div v-else class="no-image-placeholder">
                                    <q-icon name="image" size="48px" color="grey-4" />
                                    <div class="text-grey-5">无图片</div>
                                </div>
                            </div>

                            <!-- 解析结果 -->
                            <div class="col-12 col-md-6">
                                <div class="text-subtitle2 q-mb-sm">解析信息:</div>

                                <q-list dense class="detail-list">
                                    <q-item>
                                        <q-item-section>
                                            <q-item-label>解析状态</q-item-label>
                                            <q-item-label caption>
                                                <q-chip
                                                    :color="detailItem.parseStatus === 'SUCCESS' ? 'positive' : 'negative'"
                                                    text-color="white" size="sm">
                                                    {{ detailItem.parseStatus === 'SUCCESS' ? '解析成功' : '解析失败' }}
                                                </q-chip>
                                            </q-item-label>
                                        </q-item-section>
                                    </q-item>

                                    <q-item v-if="detailItem.persons && detailItem.persons.length > 0">
                                        <q-item-section>
                                            <q-item-label>人员信息</q-item-label>
                                            <q-item-label caption>
                                                <q-chip v-for="person in detailItem.persons" :key="person" color="blue"
                                                    text-color="white" size="sm" class="q-mr-xs q-mb-xs">
                                                    {{ person }}
                                                </q-chip>
                                            </q-item-label>
                                        </q-item-section>
                                    </q-item>

                                    <q-item v-if="detailItem.companies && detailItem.companies.length > 0">
                                        <q-item-section>
                                            <q-item-label>公司信息</q-item-label>
                                            <q-item-label caption>
                                                <q-chip v-for="company in detailItem.companies" :key="company"
                                                    color="green" text-color="white" size="sm" class="q-mr-xs q-mb-xs">
                                                    {{ company }}
                                                </q-chip>
                                            </q-item-label>
                                        </q-item-section>
                                    </q-item>

                                    <q-item v-if="detailItem.products && detailItem.products.length > 0">
                                        <q-item-section>
                                            <q-item-label>产品信息</q-item-label>
                                            <q-item-label caption>
                                                <q-chip v-for="product in detailItem.products" :key="product"
                                                    color="orange" text-color="white" size="sm" class="q-mr-xs q-mb-xs">
                                                    {{ product }}
                                                </q-chip>
                                            </q-item-label>
                                        </q-item-section>
                                    </q-item>

                                    <q-item v-if="detailItem.createTime">
                                        <q-item-section>
                                            <q-item-label>创建时间</q-item-label>
                                            <q-item-label caption>{{ formatDate(detailItem.createTime) }}</q-item-label>
                                        </q-item-section>
                                    </q-item>

                                    <q-item v-if="detailItem.remark">
                                        <q-item-section>
                                            <q-item-label>备注</q-item-label>
                                            <q-item-label caption>{{ detailItem.remark }}</q-item-label>
                                        </q-item-section>
                                    </q-item>
                                </q-list>

                                <!-- 原始文本 -->
                                <div v-if="detailItem.rawText" class="q-mt-md">
                                    <div class="text-subtitle2 q-mb-sm">原始识别文本:</div>
                                    <div class="raw-text-detail">
                                        {{ detailItem.rawText }}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </q-card-section>
                </q-card>
            </q-dialog>

            <!-- Image Preview Dialog -->
            <q-dialog v-model="showImageDialog">
                <q-card style="max-width: 80vw; max-height: 80vh;">
                    <q-card-section class="row items-center q-pb-none">
                        <div class="text-h6">图片预览</div>
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
import { ref, onMounted } from 'vue'
import { useQuasar } from 'quasar'
import { getMessageParse } from 'src/api/message-parse/message-parse'
import type { MessageParseResultVO } from 'src/api/api.schemas'

const $q = useQuasar()
const messageParse = getMessageParse()

// 上传相关
const selectedFile = ref<File | null>(null)
const uploading = ref(false)
const parseResult = ref<MessageParseResultVO | null>(null)

// 历史记录相关
const historyList = ref<MessageParseResultVO[]>([])
const loading = ref(false)
const pagination = ref({
    page: 1,
    rowsPerPage: 10
})

// 表格分页配置
const tablePagination = ref({
    page: 1,
    rowsPerPage: 10,
    rowsNumber: 0
})

// 详情对话框
const showDetailDialog = ref(false)
const detailItem = ref<MessageParseResultVO | null>(null)

// 图片预览对话框
const showImageDialog = ref(false)
const selectedImageUrl = ref('')

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
        name: 'parseStatus',
        label: '状态',
        field: 'parseStatus',
        align: 'center' as const,
        sortable: true,
        style: 'width: 100px'
    },
    {
        name: 'persons',
        label: '人员信息',
        field: 'persons',
        align: 'left' as const,
        sortable: false,
        style: 'width: 200px'
    },
    {
        name: 'companies',
        label: '公司信息',
        field: 'companies',
        align: 'left' as const,
        sortable: false,
        style: 'width: 200px'
    },
    {
        name: 'products',
        label: '产品信息',
        field: 'products',
        align: 'left' as const,
        sortable: false,
        style: 'width: 200px'
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
        name: 'createTime',
        label: '创建时间',
        field: 'createTime',
        align: 'center' as const,
        sortable: true,
        format: (val: string) => formatDate(val),
        style: 'width: 160px'
    },
    {
        name: 'actions',
        label: '操作',
        field: 'actions',
        align: 'center' as const,
        sortable: false,
        style: 'width: 100px'
    }
]

const onRejected = (rejectedEntries: any[]) => {
    $q.notify({
        type: 'negative',
        message: `${rejectedEntries.length} 个文件被拒绝。请检查文件大小和格式。`
    })
}

// 文件选择处理
const onFileSelected = (file: File | null) => {
    if (file) {
        selectedFile.value = file
        // 清除之前的解析结果
        parseResult.value = null
    } else {
        selectedFile.value = null
        parseResult.value = null
    }
}

const clearFile = () => {
    selectedFile.value = null
    parseResult.value = null
}

// 上传并解析
const uploadAndParse = async () => {
    if (!selectedFile.value) {
        $q.notify({
            type: 'negative',
            message: '请选择要上传的图片文件'
        })
        return
    }

    uploading.value = true
    try {
        const response = await messageParse.parseMessageFromImage(
            { imageFile: selectedFile.value }
        )

        if (response.data.isOk && response.data.okData) {
            parseResult.value = response.data.okData
            $q.notify({
                type: 'positive',
                message: '图片解析完成！'
            })
            // 解析成功后刷新历史记录
            loadHistory()
        } else {
            $q.notify({
                type: 'negative',
                message: response.data.failMsg || '解析失败'
            })
        }
    } catch (error) {
        console.error('Upload error:', error)
        $q.notify({
            type: 'negative',
            message: '上传失败，请检查网络连接'
        })
    } finally {
        uploading.value = false
    }
}

// 加载历史记录
const loadHistory = async () => {
    loading.value = true
    try {
        const response = await messageParse.getParseHistory({
            pageNum: pagination.value.page,
            pageSize: pagination.value.rowsPerPage
        })

        if (response.data.isOk && response.data.okData) {
            historyList.value = response.data.okData
            tablePagination.value.rowsNumber = response.data.okData.length

            if (response.data.okData.length > 0) {
                $q.notify({
                    type: 'positive',
                    message: `成功加载 ${response.data.okData.length} 条解析记录`,
                    timeout: 2000
                })
            }
        } else {
            $q.notify({
                type: 'negative',
                message: response.data.failMsg || '加载历史记录失败'
            })
        }
    } catch (error) {
        console.error('Load history error:', error)
        $q.notify({
            type: 'negative',
            message: '加载失败，请检查网络连接'
        })
    } finally {
        loading.value = false
    }
}

// 查看详情
const viewDetail = async (item: MessageParseResultVO) => {
    if (!item.id) return

    try {
        const response = await messageParse.getParseResultById(item.id)
        if (response.data.isOk && response.data.okData) {
            detailItem.value = response.data.okData
            showDetailDialog.value = true
        } else {
            $q.notify({
                type: 'negative',
                message: response.data.failMsg || '获取详情失败'
            })
        }
    } catch (error) {
        console.error('Get detail error:', error)
        $q.notify({
            type: 'negative',
            message: '获取详情失败'
        })
    }
}

// 查看图片
const viewImage = (imageUrl: string) => {
    selectedImageUrl.value = imageUrl
    showImageDialog.value = true
}

// 删除记录
const deleteRecord = (item: MessageParseResultVO) => {
    if (!item.id) return

    $q.dialog({
        title: '确认删除',
        message: '确定要删除这条解析记录吗？此操作不可恢复。',
        cancel: true,
        persistent: true
    }).onOk(async () => {
        try {
            const response = await messageParse.deleteParseResult(item.id!)
            if (response.data.isOk) {
                $q.notify({
                    type: 'positive',
                    message: '删除成功'
                })
                // 重新加载历史记录
                loadHistory()
            } else {
                $q.notify({
                    type: 'negative',
                    message: response.data.failMsg || '删除失败'
                })
            }
        } catch (error) {
            console.error('Delete error:', error)
            $q.notify({
                type: 'negative',
                message: '删除失败'
            })
        }
    })
}

// 复制文本到剪贴板
const copyToClipboard = (text: string): void => {
    navigator.clipboard.writeText(text)
        .then(() => {
            $q.notify({
                message: '已复制到剪贴板',
                color: 'positive',
                position: 'top',
                timeout: 1000
            })
        })
        .catch((error: Error) => {
            console.error('复制失败:', error)
        })
}

// 自定义分页标签函数
const getPaginationLabel = (firstRowIndex: number, endRowIndex: number, totalRowsNumber: number) => {
    if (totalRowsNumber === 0) {
        return '暂无数据'
    }

    const currentPage = Math.ceil(firstRowIndex / tablePagination.value.rowsPerPage)
    const totalPages = Math.ceil(totalRowsNumber / tablePagination.value.rowsPerPage)

    return `第 ${currentPage} 页，共 ${totalPages} 页 (显示第 ${firstRowIndex}-${endRowIndex} 条，总计 ${totalRowsNumber} 条)`
}

// 格式化日期
const formatDate = (dateString: string | undefined) => {
    if (!dateString) return '-'
    const date = new Date(dateString)
    return date.toLocaleString('zh-CN')
}

// 组件挂载时加载历史记录
onMounted(() => {
    loadHistory()
})
</script>

<style lang="scss" scoped>
@import 'src/css/quasar.variables.scss';


/* 结果展示区域 */
.result-section {
    background: $cursor-bg;
    border-radius: 8px;
    margin-top: 8px;
}

.result-card {
    border: 1px solid $cursor-border;
}

.results-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
    gap: 16px;
}

.result-item {
    padding: 12px;
    border: 1px solid $cursor-border;
    border-radius: 8px;
    background: $cursor-surface;

    &.full-width {
        grid-column: 1 / -1;
    }
}

.result-label {
    font-weight: 600;
    color: $cursor-text;
    margin-bottom: 8px;
    display: flex;
    align-items: center;
}

.result-content {
    display: flex;
    flex-wrap: wrap;
    gap: 4px;
}

.raw-text-container {
    background: $cursor-bg;
    border: 1px solid $cursor-border;
    border-radius: 6px;
    padding: 12px;
    font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
    font-size: 13px;
    line-height: 1.5;
    white-space: pre-wrap;
    word-break: break-word;
    max-height: 200px;
    overflow-y: auto;
}

/* 历史记录表格卡片样式 */
.history-table-card {
    border-radius: 12px;
    box-shadow: $elevation-2;
    background: $cursor-surface;
    border: 1px solid $cursor-border;
}

/* 自定义表格样式 */
.custom-history-table {
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

/* 状态列样式 */
.status-cell {
    padding: 8px;
    text-align: center;
}

.status-chip {
    font-weight: 600;
    min-width: 60px;
    font-size: 12px;
}

/* 信息列样式 */
.info-cell {
    padding: 8px;
    max-width: 200px;
}

.info-content {
    display: flex;
    flex-wrap: wrap;
    gap: 4px;
    align-items: center;
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

    &.view-btn {
        color: $cursor-primary;

        &:hover {
            background-color: rgba($cursor-primary, 0.1);
        }
    }

    &.delete-btn {
        color: $cursor-error;

        &:hover {
            background-color: rgba($cursor-error, 0.1);
            transform: translateY(-1px) scale(1.05);
        }
    }
}

/* 详情对话框样式 */
.detail-image {
    border: 1px solid $cursor-border;
    border-radius: 8px;
}

.no-image-placeholder {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 60px 20px;
    border: 2px dashed $cursor-border;
    border-radius: 8px;
    background: $cursor-bg;
}

.detail-list {
    border: 1px solid $cursor-border;
    border-radius: 8px;
    background: $cursor-surface;
}

.raw-text-detail {
    background: $cursor-bg;
    border: 1px solid $cursor-border;
    border-radius: 6px;
    padding: 12px;
    font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
    font-size: 13px;
    line-height: 1.5;
    white-space: pre-wrap;
    word-break: break-word;
    max-height: 300px;
    overflow-y: auto;
}

/* 表格标题样式 */
.text-h6 {
    color: $cursor-text;
}

/* 响应式设计 */
@media (max-width: 1200px) {
    .custom-history-table {
        font-size: 13px;

        :deep(th),
        :deep(td) {
            padding: 8px 6px;
        }
    }

    .id-content {
        font-size: 11px;
    }

    .results-grid {
        grid-template-columns: 1fr;
    }
}

@media (max-width: 768px) {
    .custom-history-table {
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
.custom-history-table :deep(.q-table__container) {
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
.custom-history-table :deep(.q-table__no-data) {
    color: $cursor-muted;
}

/* 加载状态样式 */
.custom-history-table :deep(.q-inner-loading) {
    background: rgba($cursor-bg, 0.8);
}
</style>