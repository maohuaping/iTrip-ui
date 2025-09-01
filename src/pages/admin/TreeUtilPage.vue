<template>
    <q-page class="q-pa-md">
        <div class="row q-gutter-md">
            <!-- 左侧输入区域 -->
            <div class="col-md-5 col-sm-12">
                <q-card>
                    <q-card-section>
                        <div class="text-h6 q-mb-md">JSON 输入</div>
                        <q-input v-model="jsonInput" type="textarea" rows="20" outlined placeholder="请输入树形JSON数据..."
                            @input="convertToTree" />
                        <div class="q-mt-md">
                            <q-btn color="primary" @click="convertToTree" :disable="!jsonInput">
                                转换为树形结构
                            </q-btn>
                            <q-btn color="secondary" outline class="q-ml-sm" @click="loadExample">
                                加载示例数据
                            </q-btn>
                            <q-btn color="negative" outline class="q-ml-sm" @click="clearData">
                                清空
                            </q-btn>
                        </div>
                    </q-card-section>
                </q-card>
            </div>

            <!-- 右侧显示区域 -->
            <div class="col-md-6 col-sm-12">
                <q-card>
                    <q-card-section>
                        <div class="text-h6 q-mb-md">
                            树形结构显示
                            <q-btn size="sm" flat icon="content_copy" @click="copyToClipboard" class="q-ml-sm"
                                :disable="!treeOutput">
                                复制
                            </q-btn>
                        </div>

                        <!-- 选项 -->
                        <div class="q-mb-md">
                            <q-checkbox v-model="showIds" label="显示 ID" @update:model-value="convertToTree" />
                            <q-checkbox v-model="useUnicodeChars" label="使用 Unicode 字符" class="q-ml-md"
                                @update:model-value="convertToTree" />
                        </div>

                        <div class="tree-output">
                            <pre v-if="treeOutput" class="tree-text">{{ treeOutput }}</pre>
                            <div v-else class="text-grey-6 text-center q-pa-xl">
                                请在左侧输入JSON数据
                            </div>
                        </div>
                    </q-card-section>
                </q-card>

                <!-- 错误提示 -->
                <q-card v-if="error" class="q-mt-md bg-red-1">
                    <q-card-section>
                        <div class="text-negative">
                            <q-icon name="error" class="q-mr-sm" />
                            {{ error }}
                        </div>
                    </q-card-section>
                </q-card>
            </div>
        </div>
    </q-page>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useQuasar } from 'quasar'

const $q = useQuasar()

const jsonInput = ref('')
const treeOutput = ref('')
const error = ref('')
const showIds = ref(false)
const useUnicodeChars = ref(true)

// 示例数据
const exampleData = `[
  {
    "id": "add_0",
    "label": "消保评价目录3",
    "duplicate": false,
    "children": [
      {
        "id": "add_1", 
        "label": "消保评价目录3.1",
        "duplicate": false,
        "children": [
          {
            "id": "add_3",
            "label": "消保评价目录3.11", 
            "duplicate": false,
            "children": [
              {
                "id": "add_4",
                "label": "消保评价目录3.111",
                "duplicate": false,
                "children": []
              },
              {
                "id": "add_5", 
                "label": "消保评价目录3.112",
                "duplicate": false,
                "children": []
              }
            ]
          }
        ]
      },
      {
        "id": "add_2",
        "label": "消保评价目录3.2", 
        "duplicate": false,
        "children": []
      }
    ]
  }
]`

interface TreeNode {
    id?: string
    label: string
    children?: TreeNode[]
    [key: string]: any
}

/**
 * 将JSON数组转换为树形显示字符串
 */
function jsonArrayToTreeString(nodes: TreeNode[], prefix = ''): string {
    if (!nodes || nodes.length === 0) {
        return ''
    }

    let result = ''

    for (let i = 0; i < nodes.length; i++) {
        const node = nodes[i]
        if (!node) continue

        const isLast = i === nodes.length - 1

        // 选择显示字符
        const branch = useUnicodeChars.value
            ? (isLast ? '└── ' : '├── ')
            : (isLast ? '`-- ' : '|-- ')

        // 添加当前节点
        result += prefix + branch + node.label

        // 可选显示ID
        if (showIds.value && node.id) {
            result += ` (id: ${node.id})`
        }

        result += '\n'

        // 处理子节点
        if (node.children && node.children.length > 0) {
            const childPrefix = prefix + (useUnicodeChars.value
                ? (isLast ? '    ' : '│   ')
                : (isLast ? '    ' : '|   '))
            result += jsonArrayToTreeString(node.children, childPrefix)
        }
    }

    return result
}

/**
 * 转换JSON为树形结构
 */
function convertToTree() {
    error.value = ''
    treeOutput.value = ''

    if (!jsonInput.value.trim()) {
        return
    }

    try {
        const data = JSON.parse(jsonInput.value)

        if (!Array.isArray(data)) {
            error.value = 'JSON数据必须是数组格式'
            return
        }

        treeOutput.value = jsonArrayToTreeString(data)

    } catch (e) {
        error.value = `JSON解析错误: ${e instanceof Error ? e.message : '未知错误'}`
    }
}

/**
 * 加载示例数据
 */
function loadExample() {
    jsonInput.value = exampleData
    convertToTree()
}

/**
 * 清空数据
 */
function clearData() {
    jsonInput.value = ''
    treeOutput.value = ''
    error.value = ''
}

/**
 * 复制到剪贴板
 */
async function copyToClipboard() {
    if (!treeOutput.value) return

    try {
        await navigator.clipboard.writeText(treeOutput.value)
        $q.notify({
            message: '已复制到剪贴板',
            type: 'positive',
            position: 'top'
        })
    } catch (e) {
        $q.notify({
            message: '复制失败',
            type: 'negative',
            position: 'top'
        })
    }
}

onMounted(() => {
    // 页面加载时可以自动加载示例数据
    // loadExample()
})
</script>

<style scoped>
.tree-output {
    max-height: 600px;
    overflow-y: auto;
    border: 1px solid #e0e0e0;
    border-radius: 4px;
    background-color: #f5f5f5;
}

.tree-text {
    font-family: 'Consolas', 'Monaco', 'Courier New', monospace;
    font-size: 14px;
    line-height: 1.4;
    margin: 0;
    padding: 16px;
    white-space: pre;
    background-color: transparent;
    color: #2d3748;
}

.q-input textarea {
    font-family: 'Consolas', 'Monaco', 'Courier New', monospace;
    font-size: 13px;
}

@media (max-width: 1023px) {
    .tree-output {
        max-height: 400px;
    }
}
</style>
