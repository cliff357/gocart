'use client'
import Link from "next/link"
import { LogOut, User } from "lucide-react"
import { useAuth } from "@/lib/context/AuthContext"
import { logOut } from "@/lib/services/AuthService"
import { toast } from "react-hot-toast"
import { useRouter } from "next/navigation"
import Logo from "../Logo"

const AdminNavbar = () => {
    const { user } = useAuth();
    const router = useRouter();

    const handleLogout = async () => {
        const result = await logOut();
        if (result.success) {
            toast.success('已登出');
            router.push('/admin/login');
        } else {
            toast.error('登出失敗');
        }
    };

    return (
        <div className="flex items-center justify-between px-12 py-3 border-b border-slate-200 transition-all">
            <Link href="/" className="relative flex items-center gap-2">
                <Logo size={50} />
                <span className="text-xs font-semibold px-3 py-1 rounded-full text-white bg-green-500">
                    陶豬管理員
                </span>
            </Link>
            <div className="flex items-center gap-4">
                <div className="flex items-center gap-2 text-slate-700">
                    <User size={18} />
                    <p className="text-sm">{user?.displayName || user?.email}</p>
                </div>
                <button
                    onClick={handleLogout}
                    className="flex items-center gap-2 px-4 py-2 text-sm text-red-600 hover:bg-red-50 rounded-lg transition"
                >
                    <LogOut size={16} />
                    登出
                </button>
            </div>
        </div>
    )
}

export default AdminNavbar