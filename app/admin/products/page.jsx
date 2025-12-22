'use client'
/**
 * Admin Add Product Page
 * 管理員添加產品頁面
 */

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/lib/context/AuthContext';
import { useRouter } from 'next/navigation';
import { toast } from 'react-hot-toast';
import { Upload, Plus, X } from 'lucide-react';
import Image from 'next/image';
import { storage } from '@/lib/firebase/config';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { productService, categoryService } from '@/lib/services/FirestoreService';

export default function AddProductPage() {
    const { isAdmin, loading } = useAuth();
    const router = useRouter();
    
    const [formData, setFormData] = useState({
        name: '',
        description: '',
        price: '',
        mrp: '',
        category: '',
        bestseller: false,
    });

    const [categories, setCategories] = useState([])
    const [catsLoading, setCatsLoading] = useState(true)
    
    const [images, setImages] = useState([]); // Array of File
    const [imagePreviews, setImagePreviews] = useState([]); // Array of preview URLs
    const [uploading, setUploading] = useState(false);

    // fetch categories from Firestore
    useEffect(() => {
        let mounted = true
        const load = async () => {
            try {
                setCatsLoading(true)
                const cats = await categoryService.getAll()
                if (!mounted) return
                setCategories(cats || [])
                // set default category if none selected
                if (!formData.category && (cats || []).length > 0) {
                    setFormData(prev => ({ ...prev, category: cats[0].name }))
                }
            } catch (err) {
                console.error('Failed to load categories', err)
            } finally {
                if (mounted) setCatsLoading(false)
            }
        }
        load()
        return () => { mounted = false }
    }, [])

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

    // Handle form input change
    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
    };

    // Handle image selection
    const handleImageChange = (e) => {
        const files = Array.from(e.target.files || []);
        if (files.length === 0) return;

        const maxFiles = 6; // limit number of uploads at once
        const accepted = [];
        const previews = [];

        for (let i = 0; i < files.length && accepted.length < maxFiles; i++) {
            const file = files[i];
            if (!file.type.startsWith('image/')) {
                toast.error(`${file.name} 不是圖片檔案`);
                continue;
            }
            if (file.size > 10 * 1024 * 1024) {
                toast.error(`${file.name} 大小不能超過 10MB`);
                continue;
            }
            accepted.push(file);
            previews.push(URL.createObjectURL(file));
        }

        if (accepted.length === 0) return;

        setImages(prev => [...prev, ...accepted]);
        setImagePreviews(prev => [...prev, ...previews]);
    };



    // Upload image to Firebase Storage
    const uploadImageToStorage = async (file) => {
        try {
            if (!storage) {
                throw new Error('Firebase Storage 未初始化');
            }
            
            const timestamp = Date.now();
            const filename = `products/${timestamp}_${file.name}`;
            const storageRef = ref(storage, filename);
            
            console.log('📤 Uploading image to:', filename);
            await uploadBytes(storageRef, file);
            
            const downloadURL = await getDownloadURL(storageRef);
            console.log('✅ Image uploaded:', downloadURL);
            
            return downloadURL;
        } catch (error) {
            console.error('❌ Image upload failed:', error);
            throw error;
        }
    };

    // Handle form submit
    const handleSubmit = async (e) => {
        e.preventDefault();

        // Validation
        if (!formData.name || !formData.description || !formData.price) {
            toast.error('請填寫所有必填欄位');
            return;
        }

        if (!images || images.length === 0) {
            toast.error('請選擇至少一張產品圖片');
            return;
        }

        setUploading(true);

        try {
            // 1. Upload images
            toast.loading('上傳圖片中...', { id: 'upload' });
            const uploadPromises = images.map(file => uploadImageToStorage(file));
            const imageUrls = await Promise.all(uploadPromises);
            toast.success('圖片上傳成功', { id: 'upload' });

            // 2. Create product data
            const productData = {
                name: formData.name,
                description: formData.description,
                price: parseFloat(formData.price),
                mrp: formData.mrp ? parseFloat(formData.mrp) : parseFloat(formData.price),
                category: formData.category,
                bestseller: formData.bestseller,
                images: imageUrls,
                inStock: true,
                userId: 'admin', // 可以改成當前用戶 ID
                storeId: 'admin_store', // 可以改成實際 store ID
            };

            // 3. Save to Firestore
            toast.loading('保存產品中...', { id: 'save' });
            await productService.create(productData);
            toast.success('產品添加成功！', { id: 'save' });

            // 4. Reset form
            setFormData({
                name: '',
                description: '',
                price: '',
                mrp: '',
                category: '陶相架',
                bestseller: false,
            });
            setImages([]);
            setImagePreviews([]);

            // 5. Redirect to products list
            setTimeout(() => {
                router.push('/admin');
            }, 1500);

        } catch (error) {
            console.error('Error adding product:', error);
            toast.error('添加產品失敗：' + error.message);
        } finally {
            setUploading(false);
        }
    };

    return (
        <div className="max-w-4xl mx-auto p-6">
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-gray-800">添加新產品</h1>
                <p className="text-gray-600 mt-2">填寫產品資訊並上傳圖片</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6 bg-white p-8 rounded-lg shadow-md">
                {/* Product Image */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        產品圖片 *
                    </label>
                    <div className="flex items-start gap-4">
                        <div className="flex items-center gap-3">
                            {imagePreviews && imagePreviews.length > 0 && imagePreviews.map((src, idx) => (
                                <div key={src + idx} className="relative w-24 h-24">
                                    <Image
                                        src={src}
                                        alt={`Preview ${idx + 1}`}
                                        fill
                                        className="object-cover rounded-lg border-2 border-gray-200"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => {
                                            // remove image at idx
                                            setImages(prev => prev.filter((_, i) => i !== idx));
                                            setImagePreviews(prev => {
                                                try { URL.revokeObjectURL(prev[idx]); } catch (e) {}
                                                return prev.filter((_, i) => i !== idx);
                                            });
                                        }}
                                        className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                                    >
                                        <X size={14} />
                                    </button>
                                </div>
                            ))}

                            {/* Add more / upload tile */}
                            <label className="w-32 h-32 flex flex-col items-center justify-center border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-indigo-500 transition">
                                <Upload size={32} className="text-gray-400" />
                                <span className="text-xs text-gray-500 mt-2">上傳圖片</span>
                                <input
                                    type="file"
                                    accept="image/*"
                                    multiple
                                    onChange={handleImageChange}
                                    className="hidden"
                                />
                            </label>
                        </div>
                        <div className="text-sm text-gray-500">
                            <p>• 支援 JPG, PNG, GIF</p>
                            <p>• 單張最大 10MB，最多 6 張</p>
                            <p>• 建議尺寸 800x800</p>
                        </div>
                    </div>
                </div>

                {/* Product Name */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        產品名稱 *
                    </label>
                    <input
                        type="text"
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        placeholder="輸入產品名稱"
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                        required
                    />
                </div>

                {/* Product Description */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        產品描述 *
                    </label>
                    <textarea
                        name="description"
                        value={formData.description}
                        onChange={handleChange}
                        placeholder="輸入產品描述"
                        rows={4}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                        required
                    />
                </div>

                {/* Price & MRP */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            售價 (HKD) *
                        </label>
                        <input
                            type="number"
                            name="price"
                            value={formData.price}
                            onChange={handleChange}
                            placeholder="請輸入售價"
                            min="0"
                            step="0.01"
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                            required
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            原價 (HKD)
                        </label>
                        <input
                            type="number"
                            name="mrp"
                            value={formData.mrp}
                            onChange={handleChange}
                            placeholder="請輸入原價"
                            min="0"
                            step="0.01"
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                        />
                    </div>
                </div>

                {/* Category */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        產品分類 *
                    </label>
                    <select
                        name="category"
                        value={formData.category}
                        onChange={handleChange}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                        required
                    >
                        {categories.map(cat => (
                            <option key={cat.id || cat.name} value={cat.name}>{cat.name}</option>
                        ))}
                    </select>
                </div>

                {/* Bestseller */}
                <div className="flex items-center gap-2">
                    <input
                        type="checkbox"
                        name="bestseller"
                        checked={formData.bestseller}
                        onChange={handleChange}
                        className="w-4 h-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
                    />
                    <label className="text-sm font-medium text-gray-700">
                        標記為熱銷產品
                    </label>
                </div>

                {/* Submit Button */}
                <div className="flex gap-4 pt-4">
                    <button
                        type="submit"
                        disabled={uploading}
                        className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition disabled:bg-gray-400 disabled:cursor-not-allowed"
                    >
                        {uploading ? (
                            <>
                                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                上傳中...
                            </>
                        ) : (
                            <>
                                <Plus size={20} />
                                添加產品
                            </>
                        )}
                    </button>
                    <button
                        type="button"
                        onClick={() => router.push('/admin')}
                        className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition"
                    >
                        取消
                    </button>
                </div>
            </form>
        </div>
    );
}
