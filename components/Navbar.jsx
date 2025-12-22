'use client'
import { Search } from "lucide-react"; // ShoppingCart temporarily disabled
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import Logo from "./Logo"; // Import our new logo
import { categories as staticCategories } from "../assets/assets";
import { categoryService } from '@/lib/services/FirestoreService'
// import { useSelector } from "react-redux"; // Temporarily disabled

const Navbar = () => {

    const router = useRouter();

    const [search, setSearch] = useState('')
    // const cartCount = useSelector(state => state.cart.total) // Temporarily disabled

    const handleSearch = (e) => {
        e.preventDefault()
        router.push(`/shop?search=${search}`)
    }

    return (
        <nav className="relative bg-white">
            <div className="mx-6">
                <div className="flex items-center justify-between max-w-7xl mx-auto py-4  transition-all">

                    <Link href="/" className="flex items-center">
                        <Logo size={60} className="hover:scale-105 transition-transform" />
                    </Link>

                    {/* Desktop Menu */}
                    <div className="hidden sm:flex items-center gap-4 lg:gap-8 text-slate-600">
                        <Link href="/">Home</Link>
                        <ShopDropdown />
                        <Link href="/">About</Link>
                        <Link href="/">Contact</Link>

                        <form onSubmit={handleSearch} className="hidden xl:flex items-center w-xs text-sm gap-2 bg-slate-100 px-4 py-3 rounded-full">
                            <Search size={18} className="text-slate-600" />
                            <input className="w-full bg-transparent outline-none placeholder-slate-600" type="text" placeholder="Search products" value={search} onChange={(e) => setSearch(e.target.value)} required />
                        </form>

                        {/* Cart temporarily hidden */}
                        {/* <Link href="/cart" className="relative flex items-center gap-2 text-slate-600">
                            <ShoppingCart size={18} />
                            Cart
                            <button className="absolute -top-1 left-3 text-[8px] text-white bg-slate-600 size-3.5 rounded-full">{cartCount}</button>
                        </Link> */}

                    </div>
                </div>
            </div>
            <hr className="border-gray-300" />
        </nav>
    )
}

export default Navbar

// Small client component to fetch categories and render dropdown
function ShopDropdown() {
    const [tree, setTree] = useState([])

    useEffect(() => {
        let mounted = true
        const load = async () => {
            try {
                // try to fetch nested tree
                const res = await categoryService.getTree()
                if (!mounted) return
                if (res && res.length > 0) setTree(res)
                else setTree(staticCategories.map(name => ({ id: name, name, children: [] })))
            } catch (err) {
                console.error('Failed to load category tree for navbar', err)
                if (mounted) setTree(staticCategories.map(name => ({ id: name, name, children: [] })))
            }
        }
        load()
        return () => { mounted = false }
    }, [])

    const renderTree = (nodes) => {
        return nodes.map(node => (
            <li key={node.id} className="px-0 py-0">
                {/* Main category - use same presentation as subcategories */}
                <div className="pl-4 py-1">
                    <Link href={`/shop?category=${encodeURIComponent(node.name)}`} className="text-sm text-slate-600 hover:bg-slate-100 block px-2 py-1 rounded">
                        {node.name}
                    </Link>
                </div>

                {/* Subcategories - separated visually, different hover style */}
                {node.children && node.children.length > 0 && (
                    <ul className="mt-1">
                        {node.children.map(child => (
                            <li key={child.id} className="pl-4 py-1">
                                <Link href={`/shop?category=${encodeURIComponent(child.name)}`} className="text-sm text-slate-600 hover:bg-slate-100 block px-2 py-1 rounded">
                                    {child.name}
                                </Link>
                            </li>
                        ))}
                    </ul>
                )}
            </li>
        ))
    }

    return (
        <div className="relative group">
            <Link href="/shop" className="inline-flex items-center relative z-10">Shop</Link>

            <div className="invisible opacity-0 group-hover:visible group-hover:opacity-100 transition-opacity duration-150 absolute left-0 mt-0 -translate-y-1 w-56 bg-white border border-gray-200 rounded-md shadow-lg z-40 pointer-events-auto">
                <ul className="py-2">
                    {renderTree(tree)}
                </ul>
            </div>
        </div>
    )
}