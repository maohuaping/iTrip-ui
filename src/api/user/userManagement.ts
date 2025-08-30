/**
 * 用户管理API
 * 提供用户管理相关的CRUD操作
 */
import { customInstance } from '../../boot/orval-client';

// 用户数据类型定义
export interface User {
  id: number;
  username: string;
  email: string;
  role: 'admin' | 'manager' | 'editor' | 'user';
  status: 'active' | 'inactive';
  phone?: string;
  avatar?: string;
  lastLogin?: Date;
  createdAt: Date;
  updatedAt?: Date;
  description?: string;
}

export interface CreateUserRequest {
  username: string;
  email: string;
  role: string;
  status: string;
  phone?: string;
  description?: string;
}

export interface UpdateUserRequest extends Partial<CreateUserRequest> {
  id: number;
}

export interface UserListResponse {
  data: User[];
  total: number;
  page: number;
  pageSize: number;
}

export interface UserQueryParams {
  page?: number;
  pageSize?: number;
  search?: string;
  role?: string;
  status?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

// 用户管理API方法
export const userManagementApi = {
  /**
   * 获取用户列表
   */
  getUserList: (params?: UserQueryParams) => {
    return customInstance<UserListResponse>({
      url: '/api/admin/users',
      method: 'GET',
      params
    });
  },

  /**
   * 获取单个用户信息
   */
  getUserById: (id: number) => {
    return customInstance<User>({
      url: `/api/admin/users/${id}`,
      method: 'GET'
    });
  },

  /**
   * 创建新用户
   */
  createUser: (data: CreateUserRequest) => {
    return customInstance<User>({
      url: '/api/admin/users',
      method: 'POST',
      data
    });
  },

  /**
   * 更新用户信息
   */
  updateUser: (data: UpdateUserRequest) => {
    return customInstance<User>({
      url: `/api/admin/users/${data.id}`,
      method: 'PUT',
      data
    });
  },

  /**
   * 删除用户
   */
  deleteUser: (id: number) => {
    return customInstance<{ success: boolean }>({
      url: `/api/admin/users/${id}`,
      method: 'DELETE'
    });
  },

  /**
   * 切换用户状态（启用/禁用）
   */
  toggleUserStatus: (id: number, status: 'active' | 'inactive') => {
    return customInstance<User>({
      url: `/api/admin/users/${id}/status`,
      method: 'PATCH',
      data: { status }
    });
  },

  /**
   * 重置用户密码
   */
  resetUserPassword: (id: number) => {
    return customInstance<{ newPassword: string }>({
      url: `/api/admin/users/${id}/reset-password`,
      method: 'POST'
    });
  },

  /**
   * 批量删除用户
   */
  batchDeleteUsers: (ids: number[]) => {
    return customInstance<{ success: boolean; deletedCount: number }>({
      url: '/api/admin/users/batch-delete',
      method: 'POST',
      data: { ids }
    });
  },

  /**
   * 导出用户数据
   */
  exportUsers: (params?: UserQueryParams) => {
    return customInstance<Blob>({
      url: '/api/admin/users/export',
      method: 'GET',
      params,
      responseType: 'blob'
    });
  },

  /**
   * 获取用户统计信息
   */
  getUserStats: () => {
    return customInstance<{
      totalUsers: number;
      activeUsers: number;
      todayNewUsers: number;
      roleDistribution: Record<string, number>;
      monthlyGrowth: Array<{ month: string; count: number }>;
    }>({
      url: '/api/admin/users/stats',
      method: 'GET'
    });
  }
};

// 导出类型和API
export type {
  User,
  CreateUserRequest,
  UpdateUserRequest,
  UserListResponse,
  UserQueryParams
};

export default userManagementApi;
