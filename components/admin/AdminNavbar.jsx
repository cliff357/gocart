'use client'
import Link from "next/link"
import Logo from "../Logo"

const AdminNavbar = () => {


    return (
        <div className="flex items-center justify-between px-12 py-3 border-b border-slate-200 transition-all">
            <Link href="/" className="relative flex items-center gap-2">
                <Logo size={50} />
                <span className="text-xs font-semibold px-3 py-1 rounded-full text-white bg-green-500">
                    陶豬管理員
                </span>
            </Link>
            <div className="flex items-center gap-3">
                <p>Hi, 陶豬管理員</p>
            </div>
        </div>
    )
}

export default AdminNavbar