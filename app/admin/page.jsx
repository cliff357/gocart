'use client'
import Loading from "@/components/Loading"
import OrdersAreaChart from "@/components/OrdersAreaChart"
import { CircleDollarSignIcon, ShoppingBasketIcon, TagsIcon, Info, Eye, EyeOff } from "lucide-react"
import { useEffect, useState } from "react"
import { ProductApiService, OrderApiService } from "@/lib/services/ApiService"
import { useAuth } from "@/lib/context/AuthContext"
import { useRouter } from "next/navigation"
import { auth } from "@/lib/firebase/config"
import toast from "react-hot-toast"

export default function AdminDashboard() {

    const currency = process.env.NEXT_PUBLIC_CURRENCY_SYMBOL || '$'
    const { isAdmin, loading: authLoading, user, userDoc } = useAuth()
    const router = useRouter()

    const [loading, setLoading] = useState(true)
    const [showDebug, setShowDebug] = useState(false)
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

            {/* Debug Toggle */}
            <div className="mb-4">
                <button
                    onClick={() => setShowDebug(!showDebug)}
                    className="flex items-center gap-2 px-3 py-1 text-sm bg-slate-100 hover:bg-slate-200 rounded-lg transition"
                >
                    {showDebug ? <EyeOff size={16} /> : <Eye size={16} />}
                    {showDebug ? 'Hide' : 'Show'} Debug Info
                </button>
            </div>

            {/* Debug Information Panel */}
            {showDebug && (
                <div className="mb-8 p-4 bg-gray-50 border border-gray-200 rounded-lg">
                    <div className="flex items-center gap-2 mb-4">
                        <Info className="text-blue-600" size={20} />
                        <h2 className="text-lg font-medium text-gray-800">🔥 Firebase Debug Information</h2>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                        {/* Firebase Configuration */}
                        <div className="p-3 bg-white rounded border">
                            <h3 className="font-medium text-gray-800 mb-2">📋 Firebase Configuration</h3>
                            <div className="space-y-1 font-mono text-xs">
                                <div><span className="text-blue-600">Project ID:</span> {process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID}</div>
                                <div><span className="text-blue-600">Auth Domain:</span> {process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN}</div>
                                <div><span className="text-blue-600">API Key:</span> {process.env.NEXT_PUBLIC_FIREBASE_API_KEY?.slice(0, 20)}...</div>
                            </div>
                        </div>

                        {/* Current User Status */}
                        <div className="p-3 bg-white rounded border">
                            <h3 className="font-medium text-gray-800 mb-2">👤 Current User Status</h3>
                            <div className="space-y-1 font-mono text-xs">
                                <div><span className="text-blue-600">Authenticated:</span> {user ? '✅ Yes' : '❌ No'}</div>
                                <div><span className="text-blue-600">Email:</span> {user?.email || 'N/A'}</div>
                                <div><span className="text-blue-600">UID:</span> {user?.uid || 'N/A'}</div>
                                <div><span className="text-blue-600">Is Admin:</span> {isAdmin ? '✅ Yes' : '❌ No'}</div>
                            </div>
                        </div>

                        {/* User Document */}
                        <div className="p-3 bg-white rounded border">
                            <h3 className="font-medium text-gray-800 mb-2">📄 User Document</h3>
                            <div className="space-y-1 font-mono text-xs">
                                {userDoc ? (
                                    <>
                                        <div><span className="text-blue-600">Document Found:</span> ✅ Yes</div>
                                        <div><span className="text-blue-600">isAdmin Field:</span> {userDoc.isAdmin ? '✅ true' : '❌ false'}</div>
                                        <div><span className="text-blue-600">Role Field:</span> {userDoc.role || 'N/A'}</div>
                                        <div><span className="text-blue-600">Email Match:</span> {userDoc.email === user?.email ? '✅ Match' : '⚠️ Mismatch'}</div>
                                    </>
                                ) : (
                                    <div><span className="text-red-600">Document Found:</span> ❌ No (This is the problem!)</div>
                                )}
                            </div>
                        </div>

                        {/* Runtime Information */}
                        <div className="p-3 bg-white rounded border">
                            <h3 className="font-medium text-gray-800 mb-2">⚡ Runtime Information</h3>
                            <div className="space-y-1 font-mono text-xs">
                                <div><span className="text-blue-600">Auth Loading:</span> {authLoading ? '⏳ Loading' : '✅ Loaded'}</div>
                                <div><span className="text-blue-600">Current URL:</span> {typeof window !== 'undefined' ? window.location.hostname : 'N/A'}</div>
                                <div><span className="text-blue-600">Firebase App:</span> {auth?.app?.name || 'N/A'}</div>
                                <div><span className="text-blue-600">Timestamp:</span> {new Date().toLocaleString()}</div>
                            </div>
                        </div>
                    </div>

                    {/* Raw Data (Expandable) */}
                    <details className="mt-4">
                        <summary className="cursor-pointer font-medium text-gray-700 hover:text-gray-900">🔍 Raw Data (Click to expand)</summary>
                        <div className="mt-2 p-3 bg-gray-100 rounded text-xs font-mono overflow-auto max-h-40">
                            <div><strong>User Object:</strong></div>
                            <pre>{JSON.stringify(user, null, 2)}</pre>
                            <div className="mt-2"><strong>User Document:</strong></div>
                            <pre>{JSON.stringify(userDoc, null, 2)}</pre>
                        </div>
                    </details>
                </div>
            )}

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