'use client'
/**
 * Admin Products List Page
 * 管理員產品列表頁面 - 顯示、編輯、刪除產品
 */

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/lib/context/AuthContext';
import { useRouter } from 'next/navigation';
import { useDispatch } from 'react-redux';
import { fetchProducts } from '@/lib/features/product/productSlice';
import { toast } from 'react-hot-toast';
import { Edit, Trash2, Eye, Filter, Plus } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { productService, categoryService } from '@/lib/services/FirestoreService';

export default function AdminProductsListPage() {
    const { isAdmin, loading } = useAuth();
    const router = useRouter();
    const dispatch = useDispatch();
    
    const [products, setProducts] = useState([]);
    const [categories, setCategories] = useState([]);
    const [selectedCategory, setSelectedCategory] = useState('all');
    const [productsLoading, setProductsLoading] = useState(true);
    const [deleteLoading, setDeleteLoading] = useState(null);

    // Redirect if not admin
    if (!loading && !isAdmin) {
        router.push('/');
        return null;
    }

    // Loading state
    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="w-12 h-12 rounded-full border-4 border-gray-300 border-t-indigo-500 animate-spin"></div>
            </div>
        );
    }

    // Load products and categories
    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        try {
            setProductsLoading(true);
            const [productsRes, categoriesRes] = await Promise.all([
                productService.getAll(),
                categoryService.getAll()
            ]);
            
            setProducts(productsRes || []);
            setCategories(categoriesRes || []);
        } catch (error) {
            console.error('Failed to load data:', error);
            toast.error('載入資料失敗');
        } finally {
            setProductsLoading(false);
        }
    };

    // Filter products by category
    const filteredProducts = selectedCategory === 'all' 
        ? products 
        : products.filter(product => product.category === selectedCategory);

    // Handle delete product
    const handleDelete = async (productId, productName) => {
        if (!confirm(`確定要刪除產品「${productName}」嗎？此操作無法恢復。`)) {
            return;
        }

        try {
            setDeleteLoading(productId);
            await productService.delete(productId);
            toast.success('產品已刪除');
            
            // Refresh Redux store to update public pages
            dispatch(fetchProducts());
            
            loadData(); // Reload admin list data
        } catch (error) {
            console.error('Failed to delete product:', error);
            toast.error('刪除產品失敗：' + error.message);
        } finally {
            setDeleteLoading(null);
        }
    };

    return (
        <div className="max-w-6xl mx-auto p-6">
            {/* Header */}
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h1 className="text-3xl font-bold text-gray-800">產品管理</h1>
                    <p className="text-gray-600 mt-1">管理所有產品：查看、編輯、刪除</p>
                </div>
                <Link
                    href="/admin/products"
                    className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition"
                >
                    <Plus size={18} />
                    新增產品
                </Link>
            </div>

            {/* Category Filter */}
            <div className="mb-6 flex items-center gap-4">
                <div className="flex items-center gap-2">
                    <Filter size={18} className="text-gray-500" />
                    <span className="text-sm font-medium text-gray-700">分類篩選：</span>
                </div>
                <select
                    value={selectedCategory}
                    onChange={(e) => setSelectedCategory(e.target.value)}
                    className="px-3 py-1 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                >
                    <option value="all">所有分類</option>
                    {categories.map(cat => (
                        <option key={cat.id || cat.name} value={cat.name}>
                            {cat.name}
                        </option>
                    ))}
                </select>
                <span className="text-sm text-gray-500">
                    ({filteredProducts.length} 個產品)
                </span>
            </div>

            {/* Products List */}
            {productsLoading ? (
                <div className="flex justify-center py-12">
                    <div className="w-8 h-8 rounded-full border-4 border-gray-300 border-t-indigo-500 animate-spin"></div>
                </div>
            ) : filteredProducts.length === 0 ? (
                <div className="text-center py-12">
                    <p className="text-gray-500">
                        {selectedCategory === 'all' ? '暫無產品' : `「${selectedCategory}」分類下暫無產品`}
                    </p>
                </div>
            ) : (
                <div className="bg-white rounded-lg shadow overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        產品
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        分類
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        價格
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        狀態
                                    </th>
                                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        操作
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {filteredProducts.map((product) => (
                                    <tr key={product.id} className="hover:bg-gray-50">
                                        <td className="px-6 py-4">
                                            <div className="flex items-center">
                                                {product.images && product.images.length > 0 ? (
                                                    <div className="relative w-16 h-16 mr-4">
                                                        <Image
                                                            src={product.images[0]}
                                                            alt={product.name}
                                                            fill
                                                            className="object-cover rounded-lg"
                                                        />
                                                    </div>
                                                ) : (
                                                    <div className="w-16 h-16 mr-4 bg-gray-200 rounded-lg flex items-center justify-center">
                                                        <span className="text-gray-400 text-xs">無圖片</span>
                                                    </div>
                                                )}
                                                <div>
                                                    <div className="text-sm font-medium text-gray-900">
                                                        {product.name}
                                                    </div>
                                                    <div className="text-sm text-gray-500 truncate max-w-xs">
                                                        {product.description}
                                                    </div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                                                {product.category}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="text-sm text-gray-900">
                                                ${product.price}
                                                {product.mrp && product.mrp !== product.price && (
                                                    <span className="text-gray-500 line-through ml-2">
                                                        ${product.mrp}
                                                    </span>
                                                )}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                                product.inStock
                                                    ? 'bg-green-100 text-green-800'
                                                    : 'bg-red-100 text-red-800'
                                            }`}>
                                                {product.inStock ? '有庫存' : '缺貨'}
                                            </span>
                                            {product.bestseller && (
                                                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800 ml-1">
                                                    熱銷
                                                </span>
                                            )}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                            <div className="flex justify-end gap-2">
                                                <Link
                                                    href={`/product/${product.id}`}
                                                    className="p-1 text-gray-400 hover:text-gray-600"
                                                    title="查看產品"
                                                >
                                                    <Eye size={16} />
                                                </Link>
                                                <Link
                                                    href={`/admin/products/edit/${product.id}`}
                                                    className="p-1 text-indigo-600 hover:text-indigo-900"
                                                    title="編輯產品"
                                                >
                                                    <Edit size={16} />
                                                </Link>
                                                <button
                                                    onClick={() => handleDelete(product.id, product.name)}
                                                    disabled={deleteLoading === product.id}
                                                    className="p-1 text-red-600 hover:text-red-900 disabled:opacity-50"
                                                    title="刪除產品"
                                                >
                                                    {deleteLoading === product.id ? (
                                                        <div className="w-4 h-4 border border-red-600 border-t-transparent rounded-full animate-spin"></div>
                                                    ) : (
                                                        <Trash2 size={16} />
                                                    )}
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}
        </div>
    );
}