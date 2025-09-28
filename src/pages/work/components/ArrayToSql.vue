<template>
    <section id="arrayToSql" class="q-mb-xl">
        <div class="q-pa-sm">
            <div class="row justify-between items-center q-mb-lg">
                <h2 class="text-h5 text-weight-bold q-my-none">
                    <q-icon name="transform" size="28px" class="q-mr-sm" />
                    数组转SQL IN格式工具
                </h2>
            </div>

            <!-- 数组转SQL IN格式工具 -->
            <q-card flat bordered class="array-to-sql-card q-mb-md">
                <q-card-section class="q-pa-sm">
                    <div class="row q-col-gutter-md">
                        <!-- 输入框 -->
                        <div class="col-12 col-md-6">
                            <q-input v-model="arrayInput" label="输入数组"
                                placeholder='["1", "2", "3"]'
                                outlined dense type="textarea" rows="4" class="light-field" clearable
                                @update:model-value="convertArrayToSql">
                                <template v-slot:prepend>
                                    <q-icon name="code" size="16px" />
                                </template>
                            </q-input>
                        </div>

                        <!-- 输出框 -->
                        <div class="col-12 col-md-6">
                            <q-input v-model="sqlOutput" label="SQL IN格式" outlined dense type="textarea" rows="4"
                                readonly class="light-field sql-output">
                                <template v-slot:prepend>
                                    <q-icon name="storage" size="16px" />
                                </template>
                                <template v-slot:append>
                                    <q-btn flat round dense :icon="sqlCopied ? 'check' : 'content_copy'"
                                        :color="sqlCopied ? 'positive' : 'grey-7'" @click="copySqlOutput"
                                        :disable="!sqlOutput" class="copy-btn">
                                        <q-tooltip>{{ sqlCopied ? '已复制!' : '复制SQL' }}</q-tooltip>
                                    </q-btn>
                                </template>
                            </q-input>
                        </div>
                    </div>

                </q-card-section>
            </q-card>
        </div>
    </section>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useQuasar } from 'quasar'

// 初始化
const $q = useQuasar()

// 数组转SQL工具相关状态
const arrayInput = ref('')
const sqlOutput = ref('')
const sqlCopied = ref(false)

// 数组转SQL IN格式
function convertArrayToSql() {
    if (!arrayInput.value.trim()) {
        sqlOutput.value = ''
        return
    }

    try {
        // 尝试解析JSON数组
        let parsedArray: any[]

        // 处理不同的输入格式
        const trimmedInput = arrayInput.value.trim()

        if (trimmedInput.startsWith('[') && trimmedInput.endsWith(']')) {
            // 标准JSON数组格式
            parsedArray = JSON.parse(trimmedInput)
        } else {
            // 尝试处理其他格式，比如逗号分隔的字符串
            const items = trimmedInput.split(',').map(item => item.trim().replace(/['"]/g, ''))
            parsedArray = items.filter(item => item.length > 0)
        }

        if (!Array.isArray(parsedArray)) {
            throw new Error('输入不是有效的数组格式')
        }

        if (parsedArray.length === 0) {
            sqlOutput.value = '()'
            return
        }

        // 转换为SQL IN格式，所有值都用单引号包围
        const sqlValues = parsedArray.map(item => `'${String(item).replace(/'/g, "''")}'`).join(',')
        sqlOutput.value = `(${sqlValues})`

        $q.notify({
            color: 'positive',
            message: `成功转换 ${parsedArray.length} 个值`,
            icon: 'check_circle',
            timeout: 1500
        })

    } catch (error) {
        console.error('转换失败:', error)
        sqlOutput.value = ''
        $q.notify({
            color: 'negative',
            message: '转换失败：请检查输入格式是否正确',
            icon: 'error',
            timeout: 2000
        })
    }
}

// 复制SQL输出
async function copySqlOutput() {
    if (!sqlOutput.value) {
        $q.notify({
            color: 'warning',
            message: '没有可复制的内容',
            icon: 'warning'
        })
        return
    }

    try {
        await navigator.clipboard.writeText(sqlOutput.value)
        sqlCopied.value = true

        $q.notify({
            color: 'positive',
            message: `已复制: ${sqlOutput.value}`,
            icon: 'content_copy',
            timeout: 2000
        })

        // 2秒后重置复制状态
        setTimeout(() => {
            sqlCopied.value = false
        }, 2000)

    } catch (error) {
        console.error('复制失败:', error)
        $q.notify({
            color: 'negative',
            message: '复制失败，请手动复制',
            icon: 'error'
        })
    }
}

defineOptions({
    name: 'ArrayToSql'
})
</script>

<style lang="scss" scoped>
// 保留必要的输入框样式
.light-field {

    .q-field__native,
    .q-field__prefix,
    .q-field__suffix,
    .q-field__input {
        color: $cursor-text !important;
    }

    .q-field__label {
        color: $cursor-muted !important;
    }

    &.q-field--outlined .q-field__control {
        background-color: $cursor-surface !important;
        border-color: $cursor-border !important;
    }
}

// 数组转SQL工具样式
.array-to-sql-card {
    background: var(--q-card-bg, $card-bg);
    border: 1px solid var(--q-border-color, $border-color);
    border-radius: 8px;

    .light-field {
        :deep(.q-field__control) {
            background: rgba(255, 255, 255, 0.02);
        }
    }

    .sql-output {
        :deep(.q-field__control) {
            background: rgba($cursor-primary, 0.05);
            border-color: rgba($cursor-primary, 0.2);
        }

        :deep(.q-field__native) {
            font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
            font-size: 13px;
            color: $cursor-primary;
            font-weight: 500;
        }
    }

    .copy-btn {
        opacity: 0.7;
        transition: opacity 0.3s ease;

        &:hover {
            opacity: 1;
        }
    }

    code {
        background: rgba($cursor-primary, 0.1);
        color: $cursor-primary;
        padding: 2px 4px;
        border-radius: 4px;
        font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
        font-size: 12px;
    }
}
</style>
