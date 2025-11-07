import { createRouter, createWebHistory } from 'vue-router'
import LoginView from '@/views/LoginView.vue'
import RegisterView from '@/views/RegisterView.vue'
import ForgotPasswordView from '@/views/ForgotPasswordView.vue'
import ResetPasswordView from '@/views/ResetPasswordView.vue'
import DashboardView from '@/views/DashboardView.vue'
import StatisticsView from '@/views/StatisticsView.vue'
import ReadersManagementView from '@/views/ReadersManagementView.vue'
import StaffManagementView from '@/views/StaffManagementView.vue'
import BooksManagementView from '@/views/BooksManagementView.vue'
import PublishersManagementView from '@/views/PublishersManagementView.vue'
import CategoriesManagementView from '@/views/CategoriesManagementView.vue'
import RoleManagementView from '@/views/RoleManagementView.vue'
import LoansManagementView from '@/views/LoansManagementView.vue'
import HealthMonitoringView from '@/views/HealthMonitoringView.vue'
import ReaderView from '@/views/ReaderView.vue'
import ProfileView from '@/views/ProfileView.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      redirect: '/login'
    },
    {
      path: '/login',
      name: 'login',
      component: LoginView,
      meta: { requiresAuth: false }
    },
    {
      path: '/register',
      name: 'register',
      component: RegisterView,
      meta: { requiresAuth: false }
    },
    {
      path: '/forgot-password',
      name: 'forgot-password',
      component: ForgotPasswordView,
      meta: { requiresAuth: false }
    },
    {
      path: '/reset-password',
      name: 'reset-password',
      component: ResetPasswordView,
      meta: { requiresAuth: false }
    },
    {
      path: '/dashboard',
      name: 'dashboard',
      component: DashboardView,
      meta: { requiresAuth: true, allowedRoles: ['ADMIN', 'LIBRARIAN'] }
    },
    {
      path: '/statistics',
      name: 'statistics',
      component: StatisticsView,
      meta: { requiresAuth: true, allowedRoles: ['ADMIN', 'LIBRARIAN'] }
    },
    {
      path: '/readers',
      name: 'readers',
      component: ReadersManagementView,
      meta: { requiresAuth: true, allowedRoles: ['ADMIN', 'LIBRARIAN'] }
    },
    {
      path: '/staff',
      name: 'staff',
      component: StaffManagementView,
      meta: { requiresAuth: true, allowedRoles: ['ADMIN'] }
    },
    {
      path: '/books',
      name: 'books',
      component: BooksManagementView,
      meta: { requiresAuth: true, allowedRoles: ['ADMIN', 'LIBRARIAN', 'STAFF'] }
    },
    {
      path: '/publishers',
      name: 'publishers',
      component: PublishersManagementView,
      meta: { requiresAuth: true, allowedRoles: ['ADMIN', 'LIBRARIAN'] }
    },
    {
      path: '/categories',
      name: 'categories',
      component: CategoriesManagementView,
      meta: { requiresAuth: true, allowedRoles: ['ADMIN', 'LIBRARIAN'] }
    },
    {
      path: '/roles',
      name: 'roles',
      component: RoleManagementView,
      meta: { requiresAuth: true, allowedRoles: ['ADMIN'] }
    },
    {
      path: '/loans',
      name: 'loans',
      component: LoansManagementView,
      meta: { requiresAuth: true, allowedRoles: ['ADMIN', 'LIBRARIAN'] }
    },
    {
      path: '/health',
      name: 'health',
      component: HealthMonitoringView,
      meta: { requiresAuth: true, allowedRoles: ['ADMIN'] }
    },
    {
      path: '/reader',
      name: 'reader',
      component: ReaderView,
      meta: { requiresAuth: true, allowedRoles: ['READER'] }
    },
    {
      path: '/profile',
      name: 'profile',
      component: ProfileView,
      meta: { requiresAuth: true }
    }
  ]
})

// Navigation guard để kiểm tra authentication và authorization
router.beforeEach((to, from, next) => {
  const token = localStorage.getItem('token')
  const userStr = localStorage.getItem('user')
  const isAuthenticated = !!(token && userStr)

  if (to.meta.requiresAuth && !isAuthenticated) {
    // Nếu route yêu cầu auth nhưng user chưa đăng nhập
    console.log('⚠️ Not authenticated, redirecting to login')
    next({ name: 'login' })
    return
  }
  
  if (to.name === 'login' && isAuthenticated) {
    // Nếu đã đăng nhập nhưng cố truy cập trang login, chuyển đến trang phù hợp với role
    const user = JSON.parse(userStr)
    const userRole = user.role || user.roles?.[0] || 'READER'
    
    if (userRole === 'READER') {
      next({ name: 'reader' })
    } else if (userRole === 'STAFF') {
      next({ name: 'books' })
    } else {
      next({ name: 'dashboard' })
    }
    return
  }
  
  if (isAuthenticated && to.meta.allowedRoles) {
    // Kiểm tra role nếu route có yêu cầu
    const user = JSON.parse(userStr)
    const userRole = user.role || user.roles?.[0] || 'READER'
    
    if (to.meta.allowedRoles.includes(userRole)) {
      next()
    } else {
      // Không có quyền, chuyển về trang phù hợp
      console.log(`⚠️ User role ${userRole} not allowed for route ${to.name}`)
      if (userRole === 'READER') {
        next({ name: 'reader' })
      } else if (userRole === 'STAFF') {
        next({ name: 'books' })
      } else {
        next({ name: 'dashboard' })
      }
    }
    return
  }
  
  next()
})

export default router
