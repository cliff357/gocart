'use client'
import Loading from "@/components/Loading"
import OrdersAreaChart from "@/components/OrdersAreaChart"
import { CircleDollarSignIcon, ShoppingBasketIcon, TagsIcon } from "lucide-react"
import { useEffect, useState } from "react"
import { ProductApiService, OrderApiService } from "@/lib/services/ApiService"
import { useAuth } from "@/lib/context/AuthContext"
import { useRouter } from "next/navigation"
import toast from "react-hot-toast"

export default function AdminDashboard() {

    const currency = process.env.NEXT_PUBLIC_CURRENCY_SYMBOL || '$'
    const { isAdmin, loading: authLoading } = useAuth()
    const router = useRouter()

    const [loading, setLoading] = useState(true)
    const [dashboardData, setDashboardData] = useState({
        products: 0,
        revenue: 0,
        orders: 0,
        allOrders: [],
    })

    const dashboardCardsData = [
        { title: 'Total Products', value: dashboardData.products, icon: ShoppingBasketIcon },
        { title: 'Total Revenue', value: currency + dashboardData.revenue, icon: CircleDollarSignIcon },
        { title: 'Total Orders', value: dashboardData.orders, icon: TagsIcon },
    ]

    const fetchDashboardData = async () => {
        try {
            // 並行獲取所有數據
            const [productsRes, ordersRes] = await Promise.all([
                ProductApiService.getAllProducts(),
                OrderApiService.getAllOrders()
            ])

            const products = productsRes.data || []
            const allOrders = ordersRes.data || []

            // 計算總收入
            const revenue = allOrders.reduce((sum, order) => sum + (order.totalAmount || 0), 0)

            setDashboardData({
                products: products.length,
                revenue: revenue,
                orders: allOrders.length,
                allOrders: allOrders,
            })
        } catch (error) {
            console.error('❌ Failed to fetch dashboard data:', error)
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        fetchDashboardData()
    }, [])

    // 🔒 保護：檢查權限
    useEffect(() => {
        if (!authLoading && !isAdmin) {
            toast.error('需要管理員權限才能訪問此頁面')
            router.push('/')
        }
    }, [authLoading, isAdmin, router])

    // 等待權限檢查
    if (authLoading) return <Loading />
    
    // 非管理員：不顯示內容
    if (!isAdmin) return null

    // 等待數據加載
    if (loading) return <Loading />

    return (
        <div className="text-slate-500">
            <h1 className="text-2xl">Admin <span className="text-slate-800 font-medium">Dashboard</span></h1>

            {/* Cards */}
            <div className="flex flex-wrap gap-5 my-10 mt-4">
                {
                    dashboardCardsData.map((card, index) => (
                        <div key={index} className="flex items-center gap-10 border border-slate-200 p-3 px-6 rounded-lg">
                            <div className="flex flex-col gap-3 text-xs">
                                <p>{card.title}</p>
                                <b className="text-2xl font-medium text-slate-700">{card.value}</b>
                            </div>
                            <card.icon size={50} className=" w-11 h-11 p-2.5 text-slate-400 bg-slate-100 rounded-full" />
                        </div>
                    ))
                }
            </div>

            {/* Area Chart */}
            <OrdersAreaChart allOrders={dashboardData.allOrders} />
        </div>
    )
}