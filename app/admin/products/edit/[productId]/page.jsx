'use client'
/**
 * Admin Edit Product Page
 * 管理員編輯產品頁面
 */

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/lib/context/AuthContext';
import { useRouter, useParams } from 'next/navigation';
import { useDispatch } from 'react-redux';
import { fetchProducts } from '@/lib/features/product/productSlice';
import { toast } from 'react-hot-toast';
import { Upload, Save, X } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { storage } from '@/lib/firebase/config';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { productService, categoryService } from '@/lib/services/FirestoreService';

export default function EditProductPage() {
    const { isAdmin, loading } = useAuth();
    const router = useRouter();
    const params = useParams();
    const dispatch = useDispatch();
    const productId = params.productId;
    
    const [formData, setFormData] = useState({
        name: '',
        description: '',
        price: '',
        mrp: '',
        category: '',
        bestseller: false,
    });

    const [categories, setCategories] = useState([]);
    const [images, setImages] = useState([]); // File objects
    const [imagePreviews, setImagePreviews] = useState([]); // Preview URLs
    const [existingImages, setExistingImages] = useState([]); // Current product images
    const [uploading, setUploading] = useState(false);
    const [pageLoading, setPageLoading] = useState(true);

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

    // Load product and categories
    useEffect(() => {
        if (productId) {
            loadData();
        }
    }, [productId]);

    const loadData = async () => {
        try {
            setPageLoading(true);
            console.log('Loading product:', productId);
            
            const [product, categoriesRes] = await Promise.all([
                productService.getById(productId),
                categoryService.getAll()
            ]);
            
            console.log('Loaded product:', product);
            console.log('Loaded categories:', categoriesRes);
            
            if (!product) {
                toast.error('產品不存在');
                router.push('/admin/products/list');
                return;
            }

            // Set form data
            setFormData({
                name: product.name || '',
                description: product.description || '',
                price: product.price?.toString() || '',
                mrp: product.mrp?.toString() || '',
                category: product.category || '',
                bestseller: product.bestseller || false,
            });
            
            // Set existing images
            setExistingImages(product.images || []);
            setCategories(categoriesRes || []);
            
        } catch (error) {
            console.error('Failed to load product:', error);
            toast.error('載入產品失敗: ' + error.message);
            router.push('/admin/products/list');
        } finally {
            setPageLoading(false);
        }
    };

    // Show loading while fetching data
    if (pageLoading) {
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

    // Handle image selection (new images to upload)
    const handleImageChange = (e) => {
        const files = Array.from(e.target.files || []);
        if (files.length === 0) return;

        const maxFiles = 6;
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

    // Remove existing image
    const removeExistingImage = (index) => {
        setExistingImages(prev => prev.filter((_, i) => i !== index));
    };

    // Remove new image preview
    const removeNewImage = (index) => {
        try {
            URL.revokeObjectURL(imagePreviews[index]);
        } catch (e) {}
        
        setImages(prev => prev.filter((_, i) => i !== index));
        setImagePreviews(prev => prev.filter((_, i) => i !== index));
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

        if (existingImages.length === 0 && images.length === 0) {
            toast.error('請選擇至少一張產品圖片');
            return;
        }

        setUploading(true);

        try {
            // Upload new images if any
            let newImageUrls = [];
            if (images.length > 0) {
                toast.loading('上傳新圖片中...', { id: 'upload' });
                const uploadPromises = images.map(file => uploadImageToStorage(file));
                newImageUrls = await Promise.all(uploadPromises);
                toast.success('新圖片上傳成功', { id: 'upload' });
            }

            // Combine existing and new image URLs
            const allImageUrls = [...existingImages, ...newImageUrls];

            // Create product data
            const productData = {
                name: formData.name,
                description: formData.description,
                price: parseFloat(formData.price),
                mrp: formData.mrp ? parseFloat(formData.mrp) : parseFloat(formData.price),
                category: formData.category,
                bestseller: formData.bestseller,
                images: allImageUrls,
                inStock: true,
            };

            console.log('Updating product with data:', productData);
            console.log('Category being saved:', formData.category);

            // Update product in Firestore
            toast.loading('更新產品中...', { id: 'save' });
            await productService.update(productId, productData);
            toast.success('產品更新成功！', { id: 'save' });

            // Refresh Redux store to update public pages
            dispatch(fetchProducts());

            // Redirect to products list
            setTimeout(() => {
                router.push('/admin/products/list');
            }, 1500);

        } catch (error) {
            console.error('Error updating product:', error);
            toast.error('更新產品失敗：' + error.message);
        } finally {
            setUploading(false);
        }
    };

    const totalImages = existingImages.length + images.length;

    return (
        <div className="max-w-4xl mx-auto p-6">
            <div className="mb-8 flex items-center gap-4">
                <h1 className="text-3xl font-bold text-gray-800">編輯產品</h1>
                <Link
                    href="/admin/products/list"
                    className="text-indigo-600 hover:text-indigo-800 text-sm"
                >
                    ← 返回產品列表
                </Link>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6 bg-white p-8 rounded-lg shadow-md">
                {/* Current Images */}
                {existingImages.length > 0 && (
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            目前圖片
                        </label>
                        <div className="flex gap-3 mb-4">
                            {existingImages.map((imageUrl, idx) => (
                                <div key={idx} className="relative w-24 h-24">
                                    <Image
                                        src={imageUrl}
                                        alt={`Current ${idx + 1}`}
                                        fill
                                        className="object-cover rounded-lg border-2 border-gray-200"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => removeExistingImage(idx)}
                                        className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                                    >
                                        <X size={14} />
                                    </button>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* New Images */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        產品圖片 * ({totalImages}/6)
                    </label>
                    <div className="flex items-center gap-4">
                        {imagePreviews.map((src, idx) => (
                            <div key={idx} className="relative w-24 h-24">
                                <Image
                                    src={src}
                                    alt={`New ${idx + 1}`}
                                    fill
                                    className="object-cover rounded-lg border-2 border-green-200"
                                />
                                <button
                                    type="button"
                                    onClick={() => removeNewImage(idx)}
                                    className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                                >
                                    <X size={14} />
                                </button>
                            </div>
                        ))}

                        {totalImages < 6 && (
                            <label className="w-32 h-32 flex flex-col items-center justify-center border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-indigo-500 transition">
                                <Upload size={32} className="text-gray-400" />
                                <span className="text-xs text-gray-500 mt-2">新增圖片</span>
                                <input
                                    type="file"
                                    accept="image/*"
                                    multiple
                                    onChange={handleImageChange}
                                    className="hidden"
                                />
                            </label>
                        )}
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
                        產品分類 * (目前: {formData.category})
                    </label>
                    <select
                        name="category"
                        value={formData.category}
                        onChange={handleChange}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                        required
                    >
                        <option value="">請選擇分類</option>
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
                                更新中...
                            </>
                        ) : (
                            <>
                                <Save size={20} />
                                更新產品
                            </>
                        )}
                    </button>
                    <Link
                        href="/admin/products/list"
                        className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition flex items-center justify-center"
                    >
                        取消
                    </Link>
                </div>
            </form>
        </div>
    );
}