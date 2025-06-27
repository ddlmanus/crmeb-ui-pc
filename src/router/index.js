import Vue from 'vue'
import VueRouter from 'vue-router'
import Layout from '@/layout'

Vue.use(VueRouter)

export const constantRoutes = [
  {
    path: '/login',
    component: () => import('@/views/auth/Login'),
    hidden: true
  },
  {
    path: '/',
    component: Layout,
    redirect: '/home',
    children: [
      {
        path: 'home',
        name: 'Home',
        component: () => import('@/views/home/index'),
        meta: { title: '首页', icon: 'home', breadcrumb: false }
      }
    ]
  },
  {
    path: '/product',
    component: Layout,
    meta: { title: '商品' },
    children: [
      {
        path: 'detail/:id',
        name: 'ProductDetail',
        component: () => import('@/views/product/Detail'),
        meta: { title: '商品详情' },
        props: true,
        hidden: true
      },
      {
        path: 'category/:categoryId?',
        name: 'ProductCategory',
        component: () => import('@/views/product/Category'),
        meta: { title: '商品分类' },
        props: true
      }
    ]
  },
  {
    path: '/cart',
    component: Layout,
    children: [
      {
        path: '',
        name: 'Cart',
        component: () => import('@/views/cart/Index'),
        meta: { title: '购物车', icon: 'cart' }
      }
    ]
  },
  {
    path: '/order',
    component: Layout,
    meta: { title: '订单' },
    children: [
      {
        path: 'confirm',
        name: 'OrderConfirm',
        component: () => import('@/views/order/Confirm'),
        meta: { title: '确认订单' },
        hidden: true
      },
      {
        path: 'list',
        name: 'OrderList',
        component: () => import('@/views/order/List'),
        meta: { title: '订单列表' },
        hidden: true
      },
      {
        path: 'detail/:orderSn',
        name: 'OrderDetail',
        component: () => import('@/views/order/Detail'),
        meta: { title: '订单详情' },
        props: true,
        hidden: true
      },
      {
        path: 'pay/:orderId',
        name: 'OrderPay',
        component: () => import('@/views/order/Pay.vue'),
        meta: { title: '订单支付' },
        props: true,
        hidden: true
      }
    ]
  },
  {
    path: '/user',
    component: Layout,
    meta: { title: '用户中心' },
    children: [
      {
        path: 'center',
        name: 'UserCenter',
        component: () => import('@/views/user/Center'),
        meta: { title: '用户中心' }
      },
      {
        path: 'address',
        name: 'UserAddress',
        component: () => import('@/views/user/Address'),
        meta: { title: '收货地址' },
        hidden: true
      }
    ]
  },
  {
    path: '/refund',
    component: Layout,
    meta: { title: '售后管理' },
    children: [
      {
        path: 'list',
        name: 'RefundList',
        component: () => import('@/views/refund/List.vue'),
        meta: { title: '售后列表' },
        hidden: true
      },
      {
        path: 'apply/:orderId',
        name: 'RefundApply',
        component: () => import('@/views/refund/Apply.vue'),
        meta: { title: '申请售后' },
        props: true,
        hidden: true
      }
    ]
  },
  {
    path: '/seckill',
    component: Layout,
    children: [
      {
        path: '',
        name: 'Seckill',
        component: () => import('@/views/seckill/Index'),
        meta: { title: '限时秒杀' }
      },
      {
        path: 'detail/:id',
        name: 'SeckillDetail',
        component: () => import('@/views/product/Detail'),
        meta: { title: '秒杀详情' },
        props: true,
        hidden: true
      }
    ]
  },
  {
    path: '/presale',
    component: Layout,
    children: [
      {
        path: '',
        name: 'Presale',
        component: () => import('@/views/presale/Index'),
        meta: { title: '限时预售' }
      },
      {
        path: 'detail/:id',
        name: 'PresaleDetail',
        component: () => import('@/views/product/Detail'),
        meta: { title: '预售详情' },
        props: true,
        hidden: true
      }
    ]
  },
  {
    path: '/news',
    component: Layout,
    children: [
      {
        path: '',
        name: 'News',
        component: () => import('@/views/news/Index'),
        meta: { title: '新闻列表' }
      }
    ]
  },
  {
    path: '/about',
    component: Layout,
    children: [
      {
        path: '',
        name: 'About',
        component: () => import('@/views/about/Index'),
        meta: { title: '关于我们' }
      }
    ]
  }
]

const createRouter = () => new VueRouter({
  mode: 'hash', // 改为hash模式，避免服务器配置问题
  base: process.env.BASE_URL,
  scrollBehavior: () => ({ y: 0 }),
  routes: constantRoutes
})

const router = createRouter()

export function resetRouter() {
  const newRouter = createRouter()
  router.matcher = newRouter.matcher
}

export default router 