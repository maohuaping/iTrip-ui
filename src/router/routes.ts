import type { RouteRecordRaw } from 'vue-router';

const routes: RouteRecordRaw[] = [
  {
    path: '/',
    component: () => import('layouts/MainLayout.vue'),
    children: [
      { path: '', component: () => import('pages/IndexPage.vue') },
      // 其他需要 MainLayout 的路由...
    ],
  },
  {
    path: '/work',
    component: () => import('layouts/CleanLayout.vue'),
    children: [
      { path: '', component: () => import('pages/work/WorkPage.vue') }
    ]
  },
  {
    path: '/trip',
    component: () => import('layouts/CleanLayout.vue'),
    children: [
      { path: '', component: () => import('pages/trip/TripPage.vue') },
    ]
  },
  {
    path: '/login',
    component: () => import('pages/auth/LoginPage.vue'),
    meta: { requiresAuth: false }
  },
  {
    path: '/holiday',
    component: () => import('layouts/HolidayLayout.vue'),
    children: [
      { path: '', component: () => import('pages/holiday/HolidayPage.vue') }
    ]
  },


  // Always leave this as last one,
  // but you can also remove it
  {
    path: '/:catchAll(.*)*',
    component: () => import('pages/ErrorNotFound.vue'),
  },
];

export default routes;
