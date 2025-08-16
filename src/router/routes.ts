import type { RouteRecordRaw } from 'vue-router';

const routes: RouteRecordRaw[] = [
  {
    path: '/',
    // component: () => import('layouts/MainLayout.vue'),
    // children: [
    //   { path: '', component: () => import('pages/IndexPage.vue') },
    //   // 其他需要 MainLayout 的路由...
    // ],
    redirect: '/trip'
  },
  {
    path: '/trip',
    component: () => import('layouts/CleanLayout.vue'),
    children: [
      { path: '', component: () => import('pages/trip/TripPage.vue') },
      { path: 'plan', component: () => import('pages/trip/PlanTrip.vue') },
      { path: 'detail/:id', component: () => import('pages/trip/TripDetailPage.vue') },
      { path: 'edit/:id', component: () => import('pages/trip/TripEditPage.vue') },
      { path: 'test', component: () => import('pages/trip/TripPageTest.vue') }
    ]
  },
  {
    path: '/work',
    component: () => import('layouts/CleanLayout.vue'),
    children: [
      { path: '', component: () => import('pages/work/WorkPage.vue') }
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
  {
    path: '/todo',
    component: () => import('layouts/CleanLayout.vue'),
    children: [
      { path: '', component: () => import('pages/todo/index.vue') }
    ]
  },
  {
    path: '/ai',
    component: () => import('layouts/CleanLayout.vue'),
    children: [
      { path: '', component: () => import('pages/ai/AiPage.vue') }
    ]
  },
  {
    path: '/tasks',
    component: () => import('layouts/CleanLayout.vue'),
    children: [
      { path: '', component: () => import('pages/tasks/TaskManagement.vue') }
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
