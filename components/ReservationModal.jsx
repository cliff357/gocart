'use client'

import { useState } from 'react'
import { X, Loader2, CheckCircle } from 'lucide-react'
import { FirebaseFirestoreService } from '@/lib/firebase/firestore'
import toast from 'react-hot-toast'

export default function ReservationModal({ isOpen, onClose, product, selectedOptions = {} }) {
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        phone: '',
        quantity: 1
    })
    const [submitting, setSubmitting] = useState(false)
    const [submitted, setSubmitted] = useState(false)

    const handleChange = (e) => {
        setFormData(prev => ({
            ...prev,
            [e.target.name]: e.target.value
        }))
    }

    const handleSubmit = async (e) => {
        e.preventDefault()
        
        // Validate at least email or phone is provided
        if (!formData.email && !formData.phone) {
            toast.error('請填寫電郵或電話')
            return
        }
        if (!formData.name) {
            toast.error('請填寫姓名')
            return
        }
        if (!formData.quantity || formData.quantity < 1) {
            toast.error('數量必須至少為 1')
            return
        }

        setSubmitting(true)
        try {
            await FirebaseFirestoreService.createDocument('reservations', {
                name: formData.name,
                email: formData.email || null,
                phone: formData.phone || null,
                quantity: parseInt(formData.quantity),
                productId: product.id,
                productName: product.name,
                productPrice: product.price,
                productImage: product.images?.[0] || null,
                selectedOptions: Object.keys(selectedOptions).length > 0 ? selectedOptions : null,
                status: 'pending',
                createdAt: new Date().toISOString()
            })
            
            // Send email notification to admin
            try {
                await fetch('/api/notifications/new-order', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        productName: product.name,
                        productPrice: product.price,
                        quantity: parseInt(formData.quantity),
                        customerName: formData.name,
                        customerEmail: formData.email || null,
                        customerPhone: formData.phone || null,
                        selectedOptions: Object.keys(selectedOptions).length > 0 ? selectedOptions : null,
                        productImage: product.images?.[0] || null
                    })
                })
            } catch (emailError) {
                console.error('Email notification failed:', emailError)
                // Don't fail the reservation if email fails
            }
            
            setSubmitted(true)
            toast.success('預訂成功！')
        } catch (error) {
            console.error('Reservation error:', error)
            toast.error('預訂失敗，請稍後再試')
        } finally {
            setSubmitting(false)
        }
    }

    const handleClose = () => {
        setFormData({ name: '', email: '', phone: '', quantity: 1 })
        setSubmitted(false)
        onClose()
    }

    if (!isOpen) return null

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl max-w-md w-full p-6 relative animate-in fade-in zoom-in duration-200">
                <button 
                    onClick={handleClose}
                    className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 transition"
                >
                    <X size={20} />
                </button>

                {submitted ? (
                    <div className="text-center py-8">
                        <CheckCircle size={48} className="text-green-500 mx-auto mb-4" />
                        <h3 className="text-xl font-semibold text-slate-800 mb-2">預訂成功！</h3>
                        <p className="text-slate-500 mb-6">我們會盡快聯絡你確認預訂。</p>
                        <button
                            onClick={handleClose}
                            className="bg-slate-800 text-white px-6 py-2.5 rounded-lg hover:bg-slate-900 transition"
                        >
                            關閉
                        </button>
                    </div>
                ) : (
                    <>
                        <h3 className="text-xl font-semibold text-slate-800 mb-2">預訂產品</h3>
                        <p className="text-slate-500 text-sm mb-2">{product?.name}</p>
                        
                        {/* Display selected options */}
                        {Object.keys(selectedOptions).length > 0 && (
                            <div className="mb-4 p-3 bg-blue-50 rounded-lg border border-blue-100">
                                <p className="text-sm font-medium text-blue-800 mb-1">已選擇：</p>
                                <div className="flex flex-wrap gap-2">
                                    {Object.entries(selectedOptions).map(([name, value]) => (
                                        <span key={name} className="text-sm text-blue-700">
                                            {name}: <span className="font-medium">{value}</span>
                                        </span>
                                    ))}
                                </div>
                            </div>
                        )}

                        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">
                                    數量 <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="number"
                                    name="quantity"
                                    min="1"
                                    value={formData.quantity}
                                    onChange={handleChange}
                                    className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                                    required
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">
                                    姓名 <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="text"
                                    name="name"
                                    value={formData.name}
                                    onChange={handleChange}
                                    className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                                    placeholder="請輸入姓名"
                                    required
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">
                                    電郵
                                </label>
                                <input
                                    type="email"
                                    name="email"
                                    value={formData.email}
                                    onChange={handleChange}
                                    className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                                    placeholder="example@email.com"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">
                                    電話
                                </label>
                                <input
                                    type="tel"
                                    name="phone"
                                    value={formData.phone}
                                    onChange={handleChange}
                                    className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                                    placeholder="請輸入電話號碼"
                                />
                            </div>

                            <p className="text-xs text-slate-400">* 請至少填寫電郵或電話其中一項</p>

                            <button
                                type="submit"
                                disabled={submitting}
                                className="mt-2 bg-green-600 text-white py-3 rounded-lg font-medium hover:bg-green-700 disabled:opacity-50 transition flex items-center justify-center gap-2"
                            >
                                {submitting ? (
                                    <>
                                        <Loader2 size={18} className="animate-spin" />
                                        提交中...
                                    </>
                                ) : (
                                    '確認預訂'
                                )}
                            </button>
                        </form>
                    </>
                )}
            </div>
        </div>
    )
}
