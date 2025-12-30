'use client'

import { ArrowLeft } from 'lucide-react'
import Link from 'next/link'

export default function TermsOfServicePage() {
    return (
        <div className="min-h-screen bg-[#f5f0e8]">
            <div className="max-w-4xl mx-auto px-6 py-16">
                <Link href="/" className="inline-flex items-center gap-2 text-slate-600 hover:text-slate-800 mb-8 transition">
                    <ArrowLeft size={18} />
                    返回首頁
                </Link>

                <h1 className="text-3xl font-bold text-slate-800 mb-8">Terms of Service</h1>
                <p className="text-slate-500 mb-8">最後更新：2025年1月</p>

                <div className="prose prose-slate max-w-none space-y-8">
                    <section>
                        <h2 className="text-xl font-semibold text-slate-800 mb-4">1. 服務簡介</h2>
                        <p className="text-slate-600 leading-relaxed">
                            歡迎使用 LoyaultyClub（老友賣蘿柚企劃）。本網站提供手作陶藝產品嘅展示同預訂服務。使用本網站即表示您同意遵守以下條款。
                        </p>
                    </section>

                    <section>
                        <h2 className="text-xl font-semibold text-slate-800 mb-4">2. 產品預訂</h2>
                        <ul className="list-disc list-inside text-slate-600 space-y-2">
                            <li>所有產品均為手工製作，每件作品可能會有輕微差異</li>
                            <li>預訂後我們會透過您提供嘅聯絡方式確認訂單</li>
                            <li>確認訂單後需要完成付款，我們會提供付款方式（如 PayMe、FPS 等）</li>
                            <li>製作時間視乎產品而定，我們會喺確認訂單時通知預計完成時間</li>
                        </ul>
                    </section>

                    <section>
                        <h2 className="text-xl font-semibold text-slate-800 mb-4">3. 付款條款</h2>
                        <ul className="list-disc list-inside text-slate-600 space-y-2">
                            <li>確認訂單後需要喺指定時間內完成付款</li>
                            <li>逾期未付款嘅訂單可能會被取消</li>
                            <li>付款後請保留付款證明以便核對</li>
                        </ul>
                    </section>

                    <section>
                        <h2 className="text-xl font-semibold text-slate-800 mb-4">4. 取貨 / 送貨</h2>
                        <ul className="list-disc list-inside text-slate-600 space-y-2">
                            <li>產品完成後我們會通知您取貨或安排送貨</li>
                            <li>送貨費用另計（如適用）</li>
                            <li>自取地點同時間會喺確認訂單時安排</li>
                        </ul>
                    </section>

                    <section>
                        <h2 className="text-xl font-semibold text-slate-800 mb-4">5. 退換政策</h2>
                        <ul className="list-disc list-inside text-slate-600 space-y-2">
                            <li>由於產品為手工製作，一般情況下唔接受退換</li>
                            <li>如果產品有明顯瑕疵或損壞，請喺收貨後 3 日內聯絡我們</li>
                            <li>我們會視乎情況安排更換或退款</li>
                        </ul>
                    </section>

                    <section>
                        <h2 className="text-xl font-semibold text-slate-800 mb-4">6. 知識產權</h2>
                        <p className="text-slate-600 leading-relaxed">
                            本網站上所有內容，包括但不限於文字、圖片、設計同標誌，均屬 LoyaultyClub 所有。未經書面許可，不得複製、分發或用於商業用途。
                        </p>
                    </section>

                    <section>
                        <h2 className="text-xl font-semibold text-slate-800 mb-4">7. 免責聲明</h2>
                        <ul className="list-disc list-inside text-slate-600 space-y-2">
                            <li>網站上嘅產品圖片僅供參考，實際產品可能會有輕微差異</li>
                            <li>我們會盡力確保網站資訊準確，但唔保證完全無誤</li>
                            <li>對於因使用本網站而造成嘅任何損失，我們唔承擔責任</li>
                        </ul>
                    </section>

                    <section>
                        <h2 className="text-xl font-semibold text-slate-800 mb-4">8. 條款修改</h2>
                        <p className="text-slate-600 leading-relaxed">
                            我們保留隨時修改本服務條款嘅權利。修改後嘅條款會喺網站上公佈，繼續使用本網站即表示您接受修改後嘅條款。
                        </p>
                    </section>

                    <section>
                        <h2 className="text-xl font-semibold text-slate-800 mb-4">9. 聯絡我們</h2>
                        <p className="text-slate-600 leading-relaxed">
                            如果您對本服務條款有任何疑問，請透過以下方式聯絡我們：
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
