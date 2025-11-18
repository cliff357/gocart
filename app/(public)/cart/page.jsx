'use client'
import PageTitle from "@/components/PageTitle";
import Link from "next/link";

export default function Cart() {
    return (
        <div className="min-h-[80vh] mx-6 flex flex-col items-center justify-center text-slate-600">
            <div className="text-center space-y-6">
                <div className="text-6xl">🛍️</div>
                <h1 className="text-2xl sm:text-4xl font-semibold text-slate-800">購物車功能即將推出</h1>
                <p className="text-lg max-w-md mx-auto">
                    我們正在努力開發購物車功能，敬請期待！目前您可以瀏覽我們的產品。
                </p>
                <Link 
                    href="/shop" 
                    className="inline-block bg-slate-800 text-white px-8 py-3 rounded-lg hover:bg-slate-900 transition"
                >
                    瀏覽產品
                </Link>
            </div>
        </div>
    )
}