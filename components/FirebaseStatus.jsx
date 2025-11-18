'use client'
import { useEffect, useState } from 'react'
import { getFirebaseStatus } from '@/lib/firebase/config'

export default function FirebaseStatus() {
    const [status, setStatus] = useState(null)
    const [showDetails, setShowDetails] = useState(false)

    useEffect(() => {
        // 延遲檢查，確保 Firebase 已初始化
        const timer = setTimeout(() => {
            const firebaseStatus = getFirebaseStatus()
            setStatus(firebaseStatus)
        }, 1000)

        return () => clearTimeout(timer)
    }, [])

    if (!status) return null

    const isHealthy = status.initialized && status.missingKeys.length === 0

    return (
        <div className="fixed bottom-4 right-4 z-50">
            {/* 狀態指示器 */}
            <button
                onClick={() => setShowDetails(!showDetails)}
                className="relative group"
                title={isHealthy ? 'Firebase 連接正常' : 'Firebase 連接異常'}
            >
                {/* 外圈動畫（只在正常時顯示） */}
                {isHealthy && (
                    <span className="absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75 animate-ping"></span>
                )}
                
                {/* 狀態點 */}
                <span className={`relative inline-flex rounded-full h-4 w-4 ${
                    isHealthy ? 'bg-green-500' : 'bg-red-500'
                }`}></span>
            </button>

            {/* 詳細資訊彈窗 */}
            {showDetails && (
                <div className="absolute bottom-8 right-0 bg-white dark:bg-slate-800 rounded-lg shadow-lg border border-slate-200 dark:border-slate-700 p-4 w-80 text-sm">
                    {/* 關閉按鈕 */}
                    <button
                        onClick={() => setShowDetails(false)}
                        className="absolute top-2 right-2 text-slate-400 hover:text-slate-600"
                    >
                        ✕
                    </button>

                    {/* 標題 */}
                    <div className="flex items-center gap-2 mb-3 pb-2 border-b border-slate-200 dark:border-slate-700">
                        <span className={`inline-flex rounded-full h-3 w-3 ${
                            isHealthy ? 'bg-green-500' : 'bg-red-500'
                        }`}></span>
                        <h3 className="font-semibold text-slate-800 dark:text-slate-200">
                            Firebase 狀態
                        </h3>
                    </div>

                    {/* 狀態詳情 */}
                    <div className="space-y-2 text-xs">
                        <StatusItem 
                            label="初始化" 
                            value={status.initialized ? '✅ 成功' : '❌ 失敗'} 
                            status={status.initialized}
                        />
                        <StatusItem 
                            label="專案 ID" 
                            value={status.projectId} 
                            status={status.projectId !== 'Not configured'}
                        />
                        <StatusItem 
                            label="配置來源" 
                            value={status.configSource} 
                            status={status.configSource !== 'None'}
                        />
                        <StatusItem 
                            label="Authentication" 
                            value={status.hasAuth ? '✅ 已連接' : '❌ 未連接'} 
                            status={status.hasAuth}
                        />
                        <StatusItem 
                            label="Firestore" 
                            value={status.hasDb ? '✅ 已連接' : '❌ 未連接'} 
                            status={status.hasDb}
                        />
                        <StatusItem 
                            label="Storage" 
                            value={status.hasStorage ? '✅ 已連接' : '❌ 未連接'} 
                            status={status.hasStorage}
                        />
                        
                        {/* 缺少的配置 */}
                        {status.missingKeys.length > 0 && (
                            <div className="mt-3 pt-2 border-t border-slate-200 dark:border-slate-700">
                                <p className="text-red-500 font-medium mb-1">缺少配置：</p>
                                <ul className="list-disc list-inside text-slate-600 dark:text-slate-400">
                                    {status.missingKeys.map(key => (
                                        <li key={key}>{key}</li>
                                    ))}
                                </ul>
                            </div>
                        )}
                    </div>

                    {/* 環境標籤 */}
                    <div className="mt-3 pt-2 border-t border-slate-200 dark:border-slate-700">
                        <span className="inline-block px-2 py-1 rounded text-xs font-medium bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300">
                            {process.env.NODE_ENV === 'production' ? '🚀 Production' : '🛠️ Development'}
                        </span>
                    </div>
                </div>
            )}
        </div>
    )
}

// 狀態項目組件
function StatusItem({ label, value, status }) {
    return (
        <div className="flex justify-between items-center">
            <span className="text-slate-600 dark:text-slate-400">{label}:</span>
            <span className={`font-medium ${
                status 
                    ? 'text-green-600 dark:text-green-400' 
                    : 'text-red-600 dark:text-red-400'
            }`}>
                {value}
            </span>
        </div>
    )
}
