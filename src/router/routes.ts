import type { RouteRecordRaw } from 'vue-router';

const routes: RouteRecordRaw[] = [
  {
    path: '/',
    redirect: '/trip',
    meta: { requiresAuth: true }
  },
  {
    path: '/trip',
    component: () => import('layouts/CleanLayout.vue'),
    meta: { requiresAuth: true },
    children: [
      { 
        path: '', 
        component: () => import('pages/trip/TripPage.vue'),
        meta: { requiresAuth: true }
      },
      { 
        path: 'plan', 
        component: () => import('pages/trip/PlanTrip.vue'),
        meta: { requiresAuth: true }
      },
      { 
        path: 'detail/:id', 
        component: () => import('pages/trip/TripDetailPage.vue'),
        meta: { requiresAuth: true }
      },
      { 
        path: 'edit/:id', 
        component: () => import('pages/trip/TripEditPage.vue'),
        meta: { requiresAuth: true }
      },
      { 
        path: 'test', 
        component: () => import('pages/trip/TripPageTest.vue'),
        meta: { requiresAuth: true }
      }
    ]
  },
  {
    path: '/work',
    component: () => import('layouts/CleanLayout.vue'),
    meta: { requiresAuth: true },
    children: [
      { 
        path: '', 
        component: () => import('pages/work/WorkPage.vue'),
        meta: { requiresAuth: true }
      }
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
    meta: { requiresAuth: true },
    children: [
      { 
        path: '', 
        component: () => import('pages/holiday/HolidayPage.vue'),
        meta: { requiresAuth: true }
      }
    ]
  },
  {
    path: '/todo',
    component: () => import('layouts/CleanLayout.vue'),
    meta: { requiresAuth: true },
    children: [
      { 
        path: '', 
        component: () => import('pages/todo/index.vue'),
        meta: { requiresAuth: true }
      }
    ]
  },
  {
    path: '/ai',
    component: () => import('layouts/CleanLayout.vue'),
    meta: { requiresAuth: true },
    children: [
      { 
        path: '', 
        component: () => import('pages/ai/AiPage.vue'),
        meta: { requiresAuth: true }
      }
    ]
  },
  {
    path: '/tasks',
    component: () => import('layouts/CleanLayout.vue'),
    meta: { requiresAuth: true },
    children: [
      { 
        path: '', 
        component: () => import('pages/tasks/TaskManagement.vue'),
        meta: { requiresAuth: true }
      }
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
