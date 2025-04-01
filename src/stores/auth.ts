import { defineStore } from 'pinia';

export const useAuthStore = defineStore('auth', {
  state: () => ({
    token: localStorage.getItem('auth_token') || null,
    user: null
  }),
  
  getters: {
    isAuthenticated: (state) => !!state.token,
  },
  
  actions: {
    getToken() {
      return this.token;
    },
    
    setToken(token: string) {
      this.token = token;
      localStorage.setItem('auth_token', token);
    },
    
    clearToken() {
      this.token = null;
      localStorage.removeItem('auth_token');
    },
    
    // 登录、登出和刷新 token 的方法也可以在这里实现
  }
}); 