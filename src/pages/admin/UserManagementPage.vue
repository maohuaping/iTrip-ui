<template>
    <div class="user-management-container">
        <!-- 页面头部 -->
        <div class="page-header">
            <div class="header-content">
                <div class="title-section">
                    <q-icon name="people" size="32px" class="title-icon" />
                    <div>
                        <h1 class="page-title">用户管理</h1>
                        <p class="page-subtitle">管理系统中的所有用户信息</p>
                    </div>
                </div>
                <div class="header-buttons">
                    <q-btn unelevated rounded color="positive" icon="file_download" label="导出数据" @click="exportUsers"
                        class="export-btn" />
                    <q-btn unelevated rounded color="primary" icon="add" label="添加用户" @click="showAddUserDialog = true"
                        class="add-btn" />
                </div>
            </div>
        </div>

        <!-- 搜索和筛选区域 -->
        <div class="search-section">
            <q-card class="search-card">
                <q-card-section class="q-pb-sm">
                    <div class="search-controls">
                        <q-input v-model="searchQuery" outlined rounded placeholder="搜索用户名、邮箱..." class="search-input"
                            @input="handleSearch" clearable>
                            <template v-slot:prepend>
                                <q-icon name="search" class="search-icon" />
                            </template>
                        </q-input>

                        <q-select v-model="statusFilter" outlined rounded :options="statusOptions" label="状态筛选"
                            class="status-filter" clearable @update:model-value="handleFilter" />

                        <q-select v-model="roleFilter" outlined rounded :options="roleOptions" label="角色筛选"
                            class="role-filter" clearable @update:model-value="handleFilter" />
                    </div>
                </q-card-section>
            </q-card>
        </div>

        <!-- 用户列表 -->
        <div class="users-section">
            <q-card class="users-card">
                <q-card-section class="q-pa-none">
                    <!-- 用户统计 -->
                    <div class="stats-bar">
                        <div class="stats-content">
                            <div class="stat-item">
                                <span class="stat-label">总用户数</span>
                                <span class="stat-value">{{ totalUsers }}</span>
                            </div>
                            <div class="stat-item">
                                <span class="stat-label">活跃用户</span>
                                <span class="stat-value active">{{ activeUsers }}</span>
                            </div>
                            <div class="stat-item">
                                <span class="stat-label">今日新增</span>
                                <span class="stat-value new">{{ todayNewUsers }}</span>
                            </div>
                        </div>
                    </div>

                    <!-- 批量操作栏 -->
                    <div v-if="selectedUsers.length > 0" class="batch-actions">
                        <div class="batch-info">
                            已选择 {{ selectedUsers.length }} 个用户
                        </div>
                        <div class="batch-buttons">
                            <q-btn flat dense color="negative" icon="delete" label="批量删除" @click="batchDeleteUsers"
                                class="batch-btn" />
                            <q-btn flat dense color="orange" icon="block" label="批量禁用"
                                @click="batchToggleStatus('inactive')" class="batch-btn" />
                            <q-btn flat dense color="positive" icon="check_circle" label="批量启用"
                                @click="batchToggleStatus('active')" class="batch-btn" />
                        </div>
                    </div>

                    <!-- 用户表格 -->
                    <q-table :rows="filteredUsers" :columns="columns" row-key="id" :loading="loading"
                        :pagination="pagination" @request="onRequest" selection="multiple"
                        v-model:selected="selectedUsers" class="users-table" flat separator="horizontal">
                        <!-- 头像列 -->
                        <template v-slot:body-cell-avatar="props">
                            <q-td :props="props">
                                <q-avatar size="40px" class="user-avatar">
                                    <img v-if="props.row.avatar" :src="props.row.avatar" :alt="props.row.username" />
                                    <q-icon v-else name="person" size="20px" />
                                </q-avatar>
                            </q-td>
                        </template>

                        <!-- 用户信息列 -->
                        <template v-slot:body-cell-userInfo="props">
                            <q-td :props="props">
                                <div class="user-info">
                                    <div class="username">{{ props.row.username }}</div>
                                    <div class="email">{{ props.row.email }}</div>
                                </div>
                            </q-td>
                        </template>

                        <!-- 角色列 -->
                        <template v-slot:body-cell-role="props">
                            <q-td :props="props">
                                <q-chip :color="getRoleColor(props.row.role)" text-color="white"
                                    :label="getRoleLabel(props.row.role)" size="sm" />
                            </q-td>
                        </template>

                        <!-- 状态列 -->
                        <template v-slot:body-cell-status="props">
                            <q-td :props="props">
                                <q-chip :color="props.row.status === 'active' ? 'positive' : 'negative'"
                                    text-color="white" :label="props.row.status === 'active' ? '活跃' : '禁用'" size="sm" />
                            </q-td>
                        </template>

                        <!-- 最后登录列 -->
                        <template v-slot:body-cell-lastLogin="props">
                            <q-td :props="props">
                                <div class="last-login">
                                    {{ formatDate(props.row.lastLogin) }}
                                </div>
                            </q-td>
                        </template>

                        <!-- 操作列 -->
                        <template v-slot:body-cell-actions="props">
                            <q-td :props="props">
                                <div class="action-buttons">
                                    <q-btn flat round dense color="primary" icon="edit" @click="editUser(props.row)"
                                        class="action-btn">
                                        <q-tooltip>编辑用户</q-tooltip>
                                    </q-btn>

                                    <q-btn flat round dense
                                        :color="props.row.status === 'active' ? 'negative' : 'positive'"
                                        :icon="props.row.status === 'active' ? 'block' : 'check_circle'"
                                        @click="toggleUserStatus(props.row)" class="action-btn">
                                        <q-tooltip>{{ props.row.status === 'active' ? '禁用用户' : '启用用户' }}</q-tooltip>
                                    </q-btn>

                                    <q-btn flat round dense color="negative" icon="delete"
                                        @click="deleteUser(props.row)" class="action-btn">
                                        <q-tooltip>删除用户</q-tooltip>
                                    </q-btn>
                                </div>
                            </q-td>
                        </template>
                    </q-table>
                </q-card-section>
            </q-card>
        </div>

        <!-- 添加/编辑用户对话框 -->
        <q-dialog v-model="showAddUserDialog" persistent>
            <q-card class="user-dialog">
                <q-card-section class="dialog-header">
                    <div class="text-h6">{{ editingUser ? '编辑用户' : '添加新用户' }}</div>
                </q-card-section>

                <q-card-section>
                    <q-form @submit="saveUser" class="user-form">
                        <div class="form-row">
                            <q-input v-model="userForm.username" label="用户名 *" outlined rounded
                                :rules="[val => !!val || '请输入用户名']" class="form-input" />

                            <q-input v-model="userForm.email" label="邮箱 *" type="email" outlined rounded
                                :rules="[val => !!val || '请输入邮箱', val => isValidEmail(val) || '请输入有效邮箱']"
                                class="form-input" />
                        </div>

                        <div class="form-row">
                            <q-select v-model="userForm.role" label="角色 *" :options="roleOptions" outlined rounded
                                :rules="[val => !!val || '请选择角色']" class="form-input" />

                            <q-select v-model="userForm.status" label="状态 *" :options="statusOptions" outlined rounded
                                :rules="[val => !!val || '请选择状态']" class="form-input" />
                        </div>

                        <q-input v-model="userForm.phone" label="手机号" outlined rounded class="form-input full-width" />

                        <q-input v-model="userForm.description" label="备注" type="textarea" outlined rounded rows="3"
                            class="form-input full-width" />
                    </q-form>
                </q-card-section>

                <q-card-actions align="right" class="dialog-actions">
                    <q-btn flat label="取消" @click="cancelUserEdit" class="cancel-btn" />
                    <q-btn unelevated rounded color="primary" label="保存" @click="saveUser" :loading="saving"
                        class="save-btn" />
                </q-card-actions>
            </q-card>
        </q-dialog>
    </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useQuasar, type QTableProps } from 'quasar';
import { userManagementApi, type User, type CreateUserRequest, type UserQueryParams } from 'src/api/user/userManagement';

const $q = useQuasar();

// 响应式数据
const loading = ref(false);
const saving = ref(false);
const searchQuery = ref('');
const statusFilter = ref(null);
const roleFilter = ref(null);
const showAddUserDialog = ref(false);
const editingUser = ref<User | null>(null);
const selectedUsers = ref<User[]>([]);

// 用户数据
const users = ref<any[]>([
    {
        id: 1,
        username: 'admin',
        email: 'admin@example.com',
        role: 'admin',
        status: 'active',
        phone: '13800138000',
        avatar: '',
        lastLogin: new Date('2024-01-15T10:30:00'),
        createdAt: new Date('2024-01-01T09:00:00'),
        description: '系统管理员'
    },
    {
        id: 2,
        username: 'user001',
        email: 'user001@example.com',
        role: 'user',
        status: 'active',
        phone: '13800138001',
        avatar: '',
        lastLogin: new Date('2024-01-14T16:45:00'),
        createdAt: new Date('2024-01-02T10:15:00'),
        description: '普通用户'
    },
    {
        id: 3,
        username: 'manager',
        email: 'manager@example.com',
        role: 'manager',
        status: 'inactive',
        phone: '13800138002',
        avatar: '',
        lastLogin: new Date('2024-01-10T14:20:00'),
        createdAt: new Date('2024-01-03T11:30:00'),
        description: '部门经理'
    },
    {
        id: 4,
        username: 'editor',
        email: 'editor@example.com',
        role: 'editor',
        status: 'active',
        phone: '13800138003',
        avatar: '',
        lastLogin: new Date('2024-01-15T08:15:00'),
        createdAt: new Date('2024-01-15T08:00:00'),
        description: '内容编辑'
    }
]);

// 用户表单
const userForm = ref({
    username: '',
    email: '',
    role: '',
    status: '',
    phone: '',
    description: ''
});

// 表格分页
const pagination = ref({
    sortBy: 'id',
    descending: false,
    page: 1,
    rowsPerPage: 10,
    rowsNumber: 0
});

// 选项数据
const statusOptions = [
    { label: '活跃', value: 'active' },
    { label: '禁用', value: 'inactive' }
];

const roleOptions = [
    { label: '管理员', value: 'admin' },
    { label: '经理', value: 'manager' },
    { label: '编辑', value: 'editor' },
    { label: '普通用户', value: 'user' }
];

// 表格列定义
const columns: QTableProps['columns'] = [
    {
        name: 'avatar',
        label: '头像',
        field: 'avatar',
        align: 'center',
        sortable: false,
        style: 'width: 80px'
    },
    {
        name: 'userInfo',
        label: '用户信息',
        field: 'username',
        align: 'left',
        sortable: true,
        style: 'width: 200px'
    },
    {
        name: 'role',
        label: '角色',
        field: 'role',
        align: 'center',
        sortable: true,
        style: 'width: 120px'
    },
    {
        name: 'status',
        label: '状态',
        field: 'status',
        align: 'center',
        sortable: true,
        style: 'width: 100px'
    },
    {
        name: 'phone',
        label: '手机号',
        field: 'phone',
        align: 'left',
        sortable: false,
        style: 'width: 140px'
    },
    {
        name: 'lastLogin',
        label: '最后登录',
        field: 'lastLogin',
        align: 'left',
        sortable: true,
        style: 'width: 160px'
    },
    {
        name: 'actions',
        label: '操作',
        field: 'actions',
        align: 'center',
        sortable: false,
        style: 'width: 150px'
    }
];

// 计算属性
const filteredUsers = computed(() => {
    let filtered = users.value;

    // 搜索过滤
    if (searchQuery.value) {
        const query = searchQuery.value.toLowerCase();
        filtered = filtered.filter(user =>
            user.username.toLowerCase().includes(query) ||
            user.email.toLowerCase().includes(query)
        );
    }

    // 状态过滤
    if (statusFilter.value) {
        filtered = filtered.filter(user => user.status === statusFilter.value);
    }

    // 角色过滤
    if (roleFilter.value) {
        filtered = filtered.filter(user => user.role === roleFilter.value);
    }

    return filtered;
});

const totalUsers = computed(() => users.value.length);
const activeUsers = computed(() => users.value.filter(user => user.status === 'active').length);
const todayNewUsers = computed(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return users.value.filter(user => user.createdAt >= today).length;
});

// 方法
const handleSearch = () => {
    // 搜索逻辑已在计算属性中处理
};

const handleFilter = () => {
    // 过滤逻辑已在计算属性中处理
};

const onRequest = (props: any) => {
    // 处理表格分页、排序等请求
    const { page, rowsPerPage, sortBy, descending } = props.pagination;

    loading.value = true;

    // 模拟API调用
    setTimeout(() => {
        pagination.value.page = page;
        pagination.value.rowsPerPage = rowsPerPage;
        pagination.value.sortBy = sortBy;
        pagination.value.descending = descending;
        pagination.value.rowsNumber = filteredUsers.value.length;

        loading.value = false;
    }, 500);
};

const editUser = (user: any) => {
    editingUser.value = user;
    userForm.value = { ...user };
    showAddUserDialog.value = true;
};

const deleteUser = (user: any) => {
    $q.dialog({
        title: '确认删除',
        message: `确定要删除用户 "${user.username}" 吗？此操作不可恢复。`,
        cancel: true,
        persistent: true,
        color: 'negative'
    }).onOk(() => {
        const index = users.value.findIndex(u => u.id === user.id);
        if (index !== -1) {
            users.value.splice(index, 1);
            $q.notify({
                type: 'positive',
                message: '用户删除成功',
                position: 'top'
            });
        }
    });
};

const toggleUserStatus = (user: any) => {
    const newStatus = user.status === 'active' ? 'inactive' : 'active';
    const action = newStatus === 'active' ? '启用' : '禁用';

    $q.dialog({
        title: `确认${action}`,
        message: `确定要${action}用户 "${user.username}" 吗？`,
        cancel: true,
        persistent: true
    }).onOk(() => {
        user.status = newStatus;
        $q.notify({
            type: 'positive',
            message: `用户${action}成功`,
            position: 'top'
        });
    });
};

const saveUser = () => {
    saving.value = true;

    // 模拟API调用
    setTimeout(() => {
        if (editingUser.value) {
            // 编辑用户
            const index = users.value.findIndex(u => u.id === editingUser.value!.id);
            if (index !== -1) {
                users.value[index] = { ...users.value[index], ...userForm.value };
            }
            $q.notify({
                type: 'positive',
                message: '用户更新成功',
                position: 'top'
            });
        } else {
            // 添加新用户
            const newUser = {
                id: Math.max(...users.value.map(u => u.id)) + 1,
                ...userForm.value,
                lastLogin: new Date(),
                createdAt: new Date(),
                avatar: ''
            };
            users.value.unshift(newUser);
            $q.notify({
                type: 'positive',
                message: '用户添加成功',
                position: 'top'
            });
        }

        saving.value = false;
        showAddUserDialog.value = false;
        resetForm();
    }, 1000);
};

const cancelUserEdit = () => {
    showAddUserDialog.value = false;
    resetForm();
};

const resetForm = () => {
    editingUser.value = null;
    userForm.value = {
        username: '',
        email: '',
        role: '',
        status: '',
        phone: '',
        description: ''
    };
};

const getRoleColor = (role: string) => {
    const colors: Record<string, string> = {
        admin: 'red',
        manager: 'orange',
        editor: 'blue',
        user: 'green'
    };
    return colors[role] || 'grey';
};

const getRoleLabel = (role: string) => {
    const labels: Record<string, string> = {
        admin: '管理员',
        manager: '经理',
        editor: '编辑',
        user: '普通用户'
    };
    return labels[role] || role;
};

const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('zh-CN', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit'
    }).format(date);
};

const isValidEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
};

// 批量操作方法
const batchDeleteUsers = () => {
    $q.dialog({
        title: '确认批量删除',
        message: `确定要删除选中的 ${selectedUsers.value.length} 个用户吗？此操作不可恢复。`,
        cancel: true,
        persistent: true,
        color: 'negative'
    }).onOk(async () => {
        loading.value = true;
        try {
            // TODO: 调用批量删除API
            // await userManagementApi.batchDeleteUsers(selectedUsers.value.map(u => u.id));

            // 模拟批量删除
            selectedUsers.value.forEach(selectedUser => {
                const index = users.value.findIndex(u => u.id === selectedUser.id);
                if (index !== -1) {
                    users.value.splice(index, 1);
                }
            });

            selectedUsers.value = [];

            $q.notify({
                type: 'positive',
                message: '批量删除成功',
                position: 'top'
            });
        } catch (error) {
            $q.notify({
                type: 'negative',
                message: '批量删除失败',
                position: 'top'
            });
        } finally {
            loading.value = false;
        }
    });
};

const batchToggleStatus = (status: 'active' | 'inactive') => {
    const action = status === 'active' ? '启用' : '禁用';

    $q.dialog({
        title: `确认批量${action}`,
        message: `确定要${action}选中的 ${selectedUsers.value.length} 个用户吗？`,
        cancel: true,
        persistent: true
    }).onOk(async () => {
        loading.value = true;
        try {
            // TODO: 调用批量状态更新API
            // await Promise.all(selectedUsers.value.map(user => 
            //   userManagementApi.toggleUserStatus(user.id, status)
            // ));

            // 模拟批量状态更新
            selectedUsers.value.forEach(selectedUser => {
                const user = users.value.find(u => u.id === selectedUser.id);
                if (user) {
                    user.status = status;
                }
            });

            selectedUsers.value = [];

            $q.notify({
                type: 'positive',
                message: `批量${action}成功`,
                position: 'top'
            });
        } catch (error) {
            $q.notify({
                type: 'negative',
                message: `批量${action}失败`,
                position: 'top'
            });
        } finally {
            loading.value = false;
        }
    });
};

const exportUsers = async () => {
    loading.value = true;
    try {
        // TODO: 调用导出API
        // const response = await userManagementApi.exportUsers({
        //   search: searchQuery.value,
        //   status: statusFilter.value,
        //   role: roleFilter.value
        // });

        // 模拟导出功能
        const exportData = filteredUsers.value.map(user => ({
            用户名: user.username,
            邮箱: user.email,
            角色: getRoleLabel(user.role),
            状态: user.status === 'active' ? '活跃' : '禁用',
            手机号: user.phone || '',
            最后登录: formatDate(user.lastLogin),
            创建时间: formatDate(user.createdAt),
            备注: user.description || ''
        }));

        // 创建CSV内容
        const headers = Object.keys(exportData[0] || {});
        const csvContent = [
            headers.join(','),
            ...exportData.map(row =>
                headers.map(header => `"${(row as any)[header] || ''}"`).join(',')
            )
        ].join('\n');

        // 下载文件
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        const url = URL.createObjectURL(blob);
        link.setAttribute('href', url);
        link.setAttribute('download', `用户数据_${new Date().toISOString().split('T')[0]}.csv`);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);

        $q.notify({
            type: 'positive',
            message: '数据导出成功',
            position: 'top'
        });
    } catch (error) {
        $q.notify({
            type: 'negative',
            message: '数据导出失败',
            position: 'top'
        });
    } finally {
        loading.value = false;
    }
};

// 加载用户数据的方法
const loadUsers = async (params?: UserQueryParams) => {
    loading.value = true;
    try {
        // TODO: 调用真实API
        // const response = await userManagementApi.getUserList(params);
        // users.value = response.data.data;
        // pagination.value.rowsNumber = response.data.total;

        // 目前使用模拟数据
        pagination.value.rowsNumber = users.value.length;
    } catch (error) {
        $q.notify({
            type: 'negative',
            message: '加载用户数据失败',
            position: 'top'
        });
    } finally {
        loading.value = false;
    }
};

// 生命周期
onMounted(() => {
    // 初始化数据
    loadUsers();
});
</script>

<style lang="scss" scoped>
@import 'src/css/quasar.variables.scss';

.user-management-container {
    padding: 24px;
    background: $cursor-bg;
    min-height: 100vh;
}

// 页面头部
.page-header {
    margin-bottom: 24px;

    .header-content {
        display: flex;
        justify-content: space-between;
        align-items: center;

        .title-section {
            display: flex;
            align-items: center;
            gap: 16px;

            .title-icon {
                color: $cursor-primary;
                background: rgba(148, 190, 206, 0.1);
                border-radius: 12px;
                padding: 8px;
            }

            .page-title {
                margin: 0;
                font-size: 28px;
                font-weight: 600;
                color: $cursor-text;
                line-height: 1.2;
            }

            .page-subtitle {
                margin: 4px 0 0 0;
                color: $cursor-muted;
                font-size: 14px;
            }
        }

        .header-buttons {
            display: flex;
            gap: 12px;
        }

        .export-btn,
        .add-btn {
            height: 44px;
            padding: 0 24px;
            font-weight: 500;
            color: white;

            &:hover {
                transform: translateY(-2px);
            }
        }

        .export-btn {
            background: linear-gradient(135deg, $cursor-success 0%, darken($cursor-success, 10%) 100%);
            box-shadow: 0 4px 12px rgba(16, 185, 129, 0.3);

            &:hover {
                box-shadow: 0 6px 16px rgba(16, 185, 129, 0.4);
            }
        }

        .add-btn {
            background: $gradient-primary;
            box-shadow: 0 4px 12px rgba(148, 190, 206, 0.3);

            &:hover {
                box-shadow: 0 6px 16px rgba(148, 190, 206, 0.4);
            }
        }
    }
}

// 搜索区域
.search-section {
    margin-bottom: 24px;

    .search-card {
        background: $cursor-surface;
        border-radius: 16px;
        border: 1px solid $cursor-border;
        box-shadow: $elevation-1;

        .search-controls {
            display: grid;
            grid-template-columns: 1fr auto auto;
            gap: 16px;
            align-items: end;

            .search-input {
                min-width: 300px;

                :deep(.q-field__control) {
                    background: rgba(148, 190, 206, 0.05);
                    border: 1px solid transparent;
                    transition: all 0.3s ease;

                    &:hover {
                        border-color: rgba(148, 190, 206, 0.2);
                    }
                }

                :deep(.q-field--focused .q-field__control) {
                    border-color: $cursor-primary;
                    box-shadow: 0 0 0 2px rgba(148, 190, 206, 0.15);
                }

                .search-icon {
                    color: $cursor-primary;
                }
            }

            .status-filter,
            .role-filter {
                min-width: 140px;

                :deep(.q-field__control) {
                    background: rgba(148, 190, 206, 0.05);
                }
            }
        }
    }
}

// 用户列表区域
.users-section {
    .users-card {
        background: $cursor-surface;
        border-radius: 16px;
        border: 1px solid $cursor-border;
        box-shadow: $elevation-2;
        overflow: hidden;

        .stats-bar {
            background: rgba(148, 190, 206, 0.05);
            border-bottom: 1px solid $cursor-border;
            padding: 20px 24px;

            .stats-content {
                display: flex;
                gap: 40px;

                .stat-item {
                    display: flex;
                    flex-direction: column;
                    align-items: center;

                    .stat-label {
                        font-size: 12px;
                        color: $cursor-muted;
                        margin-bottom: 4px;
                    }

                    .stat-value {
                        font-size: 20px;
                        font-weight: 600;
                        color: $cursor-text;

                        &.active {
                            color: $cursor-success;
                        }

                        &.new {
                            color: $cursor-accent;
                        }
                    }
                }
            }
        }

        .batch-actions {
            background: rgba(148, 190, 206, 0.08);
            border-bottom: 1px solid $cursor-border;
            padding: 12px 24px;
            display: flex;
            justify-content: space-between;
            align-items: center;

            .batch-info {
                color: $cursor-text;
                font-weight: 500;
                font-size: 14px;
            }

            .batch-buttons {
                display: flex;
                gap: 8px;

                .batch-btn {
                    height: 32px;
                    padding: 0 16px;
                    border-radius: 8px;
                    font-size: 12px;
                    font-weight: 500;

                    &:hover {
                        transform: translateY(-1px);
                    }
                }
            }
        }

        .users-table {
            :deep(.q-table__top) {
                padding: 16px 24px;
                border-bottom: 1px solid $cursor-border;
            }

            :deep(.q-table thead th) {
                background: rgba(148, 190, 206, 0.05);
                color: $cursor-text;
                font-weight: 600;
                border-bottom: 1px solid $cursor-border;
            }

            :deep(.q-table tbody td) {
                border-bottom: 1px solid rgba(148, 190, 206, 0.1);
                color: $cursor-text;
            }

            :deep(.q-table tbody tr:hover) {
                background: rgba(148, 190, 206, 0.05);
            }

            .user-avatar {
                background: rgba(148, 190, 206, 0.1);
                color: $cursor-primary;
            }

            .user-info {
                .username {
                    font-weight: 500;
                    color: $cursor-text;
                    margin-bottom: 2px;
                }

                .email {
                    font-size: 12px;
                    color: $cursor-muted;
                }
            }

            .last-login {
                font-size: 13px;
                color: $cursor-muted;
            }

            .action-buttons {
                display: flex;
                gap: 4px;
                justify-content: center;

                .action-btn {
                    width: 32px;
                    height: 32px;
                    border-radius: 8px;

                    &:hover {
                        background: rgba(148, 190, 206, 0.1);
                    }
                }
            }
        }
    }
}

// 对话框样式
.user-dialog {
    width: 600px;
    max-width: 90vw;
    border-radius: 16px;

    .dialog-header {
        background: rgba(148, 190, 206, 0.05);
        border-bottom: 1px solid $cursor-border;

        .text-h6 {
            color: $cursor-text;
            font-weight: 600;
        }
    }

    .user-form {
        .form-row {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 16px;
            margin-bottom: 16px;
        }

        .form-input {
            :deep(.q-field__control) {
                background: rgba(148, 190, 206, 0.05);
                border: 1px solid transparent;
                transition: all 0.3s ease;
            }

            :deep(.q-field--focused .q-field__control) {
                border-color: $cursor-primary;
                box-shadow: 0 0 0 2px rgba(148, 190, 206, 0.15);
            }

            &.full-width {
                grid-column: 1 / -1;
            }
        }
    }

    .dialog-actions {
        background: rgba(148, 190, 206, 0.02);
        border-top: 1px solid $cursor-border;

        .cancel-btn {
            color: $cursor-muted;

            &:hover {
                background: rgba(148, 190, 206, 0.1);
            }
        }

        .save-btn {
            background: $gradient-primary;
            color: white;

            &:hover {
                transform: translateY(-1px);
                box-shadow: 0 4px 12px rgba(148, 190, 206, 0.3);
            }
        }
    }
}

// 响应式设计
@media (max-width: 768px) {
    .user-management-container {
        padding: 16px;
    }

    .page-header .header-content {
        flex-direction: column;
        gap: 16px;
        align-items: stretch;
    }

    .search-section .search-controls {
        grid-template-columns: 1fr;
        gap: 12px;

        // 修复搜索输入框在手机端的宽度问题
        .search-input {
            min-width: unset;
            width: 100%;
        }

        // 修复筛选框在手机端的宽度问题
        .status-filter,
        .role-filter {
            min-width: unset;
            width: 100%;
        }
    }

    .stats-content {
        justify-content: space-around;
    }

    .user-dialog {
        .user-form .form-row {
            grid-template-columns: 1fr;
            gap: 12px;
        }
    }

    :deep(.q-table--horizontal-separator thead th),
    :deep(.q-table--horizontal-separator tbody td) {
        padding: 8px 4px;
        font-size: 12px;
    }
}

@media (max-width: 480px) {
    .user-management-container {
        padding: 12px;
    }

    .page-header .title-section {
        flex-direction: column;
        align-items: flex-start;
        gap: 8px;
    }

    .stats-content {
        flex-direction: column;
        gap: 16px;
    }

    // 为更小的屏幕进一步优化
    .search-section {
        .search-card {
            margin: 0 -4px; // 稍微扩展到边缘
        }

        .search-controls {
            padding: 0 4px; // 内部稍微留点边距
        }
    }
}
</style>
