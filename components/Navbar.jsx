'use client'
import { Search, Menu, X } from "lucide-react"; // ShoppingCart temporarily disabled
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
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
    const [isMobile, setIsMobile] = useState(false)
    // const cartCount = useSelector(state => state.cart.total) // Temporarily disabled

    // Check if device is mobile
    useEffect(() => {
        const checkMobile = () => {
            // Check user agent for mobile devices
            const userAgent = navigator.userAgent || navigator.vendor || window.opera
            const mobileRegex = /android|webos|iphone|ipad|ipod|blackberry|iemobile|opera mini/i
            const isMobileDevice = mobileRegex.test(userAgent.toLowerCase())
            
            // Also check screen width as fallback
            const isSmallScreen = window.innerWidth < 640
            
            setIsMobile(isMobileDevice || isSmallScreen)
        }
        
        checkMobile()
        window.addEventListener('resize', checkMobile)
        return () => window.removeEventListener('resize', checkMobile)
    }, [])

    const handleSearch = (e) => {
        e.preventDefault()
        router.push(`/shop?search=${search}`)
    }

    const closeMobileMenu = () => {
        setMobileMenuOpen(false)
    }

    return (
        <nav className="relative" style={{ backgroundColor: 'var(--color-background)' }}>
            <div className="mx-6">
                <div className="flex items-center justify-between max-w-7xl mx-auto py-4  transition-all">

                    <Link href="/" className="flex items-center">
                        <Logo size={60} className="hover:scale-105 transition-transform" />
                    </Link>

                    {/* Desktop Menu - hide on mobile devices */}
                    {!isMobile && (
                        <div className="flex items-center gap-4 lg:gap-8" style={{ color: 'var(--color-text)' }}>
                            <Link href="/">Home</Link>
                            <ShopDropdown />
                            <Link href="/about">About</Link>
                            <Link href="/contact">Contact</Link>

                            <form onSubmit={handleSearch} className="hidden xl:flex items-center w-xs text-sm gap-2 px-4 py-3 rounded-full" style={{ backgroundColor: 'var(--color-search-bar)' }}>
                                <Search size={18} style={{ color: 'var(--color-text)' }} />
                                <input className="w-full bg-transparent outline-none" style={{ color: 'var(--color-text)' }} type="text" placeholder="Search products" value={search} onChange={(e) => setSearch(e.target.value)} required />
                            </form>

                            {/* Cart temporarily hidden */}
                            {/* <Link href="/cart" className="relative flex items-center gap-2 text-slate-600">
                                <ShoppingCart size={18} />
                                Cart
                                <button className="absolute -top-1 left-3 text-[8px] text-white bg-slate-600 size-3.5 rounded-full">{cartCount}</button>
                            </Link> */}
                        </div>
                    )}

                    {/* Mobile Hamburger Button - show only on mobile devices */}
                    {isMobile && (
                        <button 
                            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                            className="p-2"
                            style={{ color: 'var(--color-text)' }}
                        >
                            {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
                        </button>
                    )}
                </div>
            </div>

            {/* Mobile Menu */}
            {isMobile && mobileMenuOpen && (
                <div className="absolute top-full left-0 right-0 z-50 border-t border-gray-200 shadow-lg" style={{ backgroundColor: 'var(--color-background)' }}>
                    <div className="flex flex-col py-4" style={{ color: 'var(--color-text)' }}>
                        <Link href="/" onClick={closeMobileMenu} className="px-6 py-3 hover:bg-slate-100">Home</Link>
                        <Link href="/shop" onClick={closeMobileMenu} className="px-6 py-3 hover:bg-slate-100">Shop</Link>
                        <Link href="/about" onClick={closeMobileMenu} className="px-6 py-3 hover:bg-slate-100">About</Link>
                        <Link href="/contact" onClick={closeMobileMenu} className="px-6 py-3 hover:bg-slate-100">Contact</Link>
                    </div>
                </div>
            )}

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
                    <Link href={`/shop?category=${encodeURIComponent(node.name)}`} className="text-sm hover:bg-slate-100 block px-2 py-1 rounded" style={{ color: 'var(--color-text)' }}>
                        {node.name}
                    </Link>
                </div>

                {/* Subcategories - separated visually, different hover style */}
                {node.children && node.children.length > 0 && (
                    <ul className="mt-1">
                        {node.children.map(child => (
                            <li key={child.id} className="pl-4 py-1">
                                <Link href={`/shop?category=${encodeURIComponent(child.name)}`} className="text-sm hover:bg-slate-100 block px-2 py-1 rounded" style={{ color: 'var(--color-text)' }}>
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

            <div className="invisible opacity-0 group-hover:visible group-hover:opacity-100 transition-opacity duration-150 absolute left-0 mt-0 -translate-y-1 w-56 border border-gray-200 rounded-md shadow-lg z-40 pointer-events-auto" style={{ backgroundColor: 'var(--color-dropdown)' }}>
                <ul className="py-2">
                    {renderTree(tree)}
                </ul>
            </div>
        </div>
    )
}