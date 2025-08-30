import { defineStore } from 'pinia';
import { ref, computed } from 'vue';

export const useAuthStore = defineStore('auth', () => {
  // 状态
  const token = ref<string | null>(localStorage.getItem('auth_token'));
  const user = ref<any>(null);

  // 计算属性
  const isAuthenticated = computed(() => !!token.value);

  // 方法
  const setToken = (newToken: string) => {
    token.value = newToken;
    localStorage.setItem('auth_token', newToken);
  };

  const setUser = (userData: any) => {
    user.value = userData;
    localStorage.setItem('user_data', JSON.stringify(userData));
  };

  const login = (authToken: string, userData?: any) => {
    setToken(authToken);
    if (userData) {
      setUser(userData);
    }
  };

  const logout = () => {
    token.value = null;
    user.value = null;
    localStorage.removeItem('auth_token');
    localStorage.removeItem('user_data');
  };

  const initAuth = () => {
    const savedToken = localStorage.getItem('auth_token');
    const savedUser = localStorage.getItem('user_data');
    
    if (savedToken) {
      token.value = savedToken;
    }
    
    if (savedUser) {
      try {
        user.value = JSON.parse(savedUser);
      } catch (error) {
        console.error('Failed to parse saved user data:', error);
        localStorage.removeItem('user_data');
      }
    }
  };

  // 检查token是否有效（可以添加token过期检查逻辑）
  const checkTokenValidity = () => {
    // TODO: 实现token过期检查逻辑
    // 例如：检查JWT token的exp字段
    return !!token.value;
  };

  return {
    // 状态
    token,
    user,
    // 计算属性
    isAuthenticated,
    // 方法
    setToken,
    setUser,
    login,
    logout,
    initAuth,
    checkTokenValidity
  };
});