'use client'

import { ArrowLeft } from 'lucide-react'
import Link from 'next/link'

export default function PrivacyPolicyPage() {
    return (
        <div className="min-h-screen bg-[#f5f0e8]">
            <div className="max-w-4xl mx-auto px-6 py-16">
                <Link href="/" className="inline-flex items-center gap-2 text-slate-600 hover:text-slate-800 mb-8 transition">
                    <ArrowLeft size={18} />
                    返回首頁
                </Link>

                <h1 className="text-3xl font-bold text-slate-800 mb-8">Privacy Policy</h1>
                <p className="text-slate-500 mb-8">最後更新：2025年1月</p>

                <div className="prose prose-slate max-w-none space-y-8">
                    <section>
                        <h2 className="text-xl font-semibold text-slate-800 mb-4">1. 資料收集</h2>
                        <p className="text-slate-600 leading-relaxed">
                            當您使用 LoyaultyClub 網站預訂產品時，我們會收集以下個人資料：
                        </p>
                        <ul className="list-disc list-inside text-slate-600 mt-3 space-y-2">
                            <li>姓名</li>
                            <li>電郵地址</li>
                            <li>電話號碼</li>
                            <li>送貨地址（如適用）</li>
                        </ul>
                    </section>

                    <section>
                        <h2 className="text-xl font-semibold text-slate-800 mb-4">2. 資料用途</h2>
                        <p className="text-slate-600 leading-relaxed">
                            我們收集嘅資料只會用於以下用途：
                        </p>
                        <ul className="list-disc list-inside text-slate-600 mt-3 space-y-2">
                            <li>處理您嘅訂單同預訂</li>
                            <li>聯絡您確認訂單詳情</li>
                            <li>安排送貨或自取</li>
                            <li>發送訂單狀態更新</li>
                        </ul>
                    </section>

                    <section>
                        <h2 className="text-xl font-semibold text-slate-800 mb-4">3. 資料保護</h2>
                        <p className="text-slate-600 leading-relaxed">
                            我們重視您嘅私隱，會採取適當嘅技術同組織措施保護您嘅個人資料，防止未經授權嘅存取、使用或披露。
                        </p>
                    </section>

                    <section>
                        <h2 className="text-xl font-semibold text-slate-800 mb-4">4. 資料分享</h2>
                        <p className="text-slate-600 leading-relaxed">
                            我們唔會向第三方出售、出租或分享您嘅個人資料，除非：
                        </p>
                        <ul className="list-disc list-inside text-slate-600 mt-3 space-y-2">
                            <li>為咗完成您嘅訂單（例如送貨服務）</li>
                            <li>法律要求</li>
                            <li>得到您嘅明確同意</li>
                        </ul>
                    </section>

                    <section>
                        <h2 className="text-xl font-semibold text-slate-800 mb-4">5. Cookie 使用</h2>
                        <p className="text-slate-600 leading-relaxed">
                            本網站使用 Cookie 嚟改善您嘅瀏覽體驗。Cookie 係儲存喺您裝置上嘅小型文字檔案，用於記住您嘅偏好設定。
                        </p>
                    </section>

                    <section>
                        <h2 className="text-xl font-semibold text-slate-800 mb-4">6. 您嘅權利</h2>
                        <p className="text-slate-600 leading-relaxed">
                            您有權：
                        </p>
                        <ul className="list-disc list-inside text-slate-600 mt-3 space-y-2">
                            <li>查閱我們持有關於您嘅個人資料</li>
                            <li>要求更正錯誤嘅資料</li>
                            <li>要求刪除您嘅個人資料</li>
                        </ul>
                    </section>

                    <section>
                        <h2 className="text-xl font-semibold text-slate-800 mb-4">7. 聯絡我們</h2>
                        <p className="text-slate-600 leading-relaxed">
                            如果您對本私隱政策有任何疑問，請透過以下方式聯絡我們：
                        </p>
                        <p className="text-slate-600 mt-3">
                            電郵：<a href="mailto:loyaultyclub@gmail.com" className="text-[#9E4F1E] hover:underline">loyaultyclub@gmail.com</a>
                        </p>
                    </section>
                </div>
            </div>
        </div>
    )
}
