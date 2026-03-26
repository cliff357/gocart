'use client'

import { useState, useEffect, useRef } from 'react'
import { CalendarCheck, Mail, Phone, User, Package, Clock, ChevronDown, Loader2, Info } from 'lucide-react'
import { FirebaseFirestoreService } from '@/lib/firebase/firestore'
import toast from 'react-hot-toast'
import Image from 'next/image'

// Status workflow configuration
const STATUS_CONFIG = [
    { key: 'pending', label: '待處理', color: 'bg-yellow-100 text-yellow-700', step: 1 },
    { key: 'confirmed', label: '已確認', color: 'bg-blue-100 text-blue-700', step: 2 },
    { key: 'paid', label: '已付款', color: 'bg-purple-100 text-purple-700', step: 3 },
    { key: 'shipped', label: '已寄出', color: 'bg-green-100 text-green-700', step: 4 },
]

const WORKFLOW_DESCRIPTION = `訂單流程：
1️⃣ 待處理 - 收到新訂單，等待處理
2️⃣ 已確認 - 已聯絡客人，發送付款 QR Code
3️⃣ 已付款 - 客人已完成付款，開始製作產品
4️⃣ 已寄出 - 產品製作完成，已寄出給客人`

export default function ReservationsPage() {
    const [reservations, setReservations] = useState([])
    const [loading, setLoading] = useState(true)
    const [filter, setFilter] = useState('all')
    const [openDropdown, setOpenDropdown] = useState(null)

    useEffect(() => {
        loadReservations()
    }, [])

    const loadReservations = async () => {
        setLoading(true)
        try {
            const result = await FirebaseFirestoreService.getCollection('reservations', {
                orderBy: [['createdAt', 'desc']]
            })
            console.log('Reservations result:', result)
            if (result.success) {
                setReservations(result.data)
            } else {
                console.error('Failed to load:', result.error)
            }
        } catch (error) {
            console.error('Error loading reservations:', error)
            toast.error('Failed to load reservations')
        } finally {
            setLoading(false)
        }
    }

    const updateStatus = async (reservationId, newStatus) => {
        try {
            await FirebaseFirestoreService.updateDocument('reservations', reservationId, {
                status: newStatus,
                statusUpdatedAt: new Date().toISOString()
            })
            setReservations(prev => 
                prev.map(r => r.id === reservationId ? { ...r, status: newStatus } : r)
            )
            const statusLabel = STATUS_CONFIG.find(s => s.key === newStatus)?.label || newStatus
            toast.success(`預訂狀態已更新為 ${statusLabel}`)
            setOpenDropdown(null)
        } catch (error) {
            console.error('Error updating status:', error)
            toast.error('Failed to update status')
        }
    }

    const getStatusLabel = (status) => {
        return STATUS_CONFIG.find(s => s.key === status)?.label || status
    }

    const getStatusColor = (status) => {
        return STATUS_CONFIG.find(s => s.key === status)?.color || 'bg-slate-100 text-slate-700'
    }

    const filteredReservations = filter === 'all' 
        ? reservations 
        : reservations.filter(r => r.status === filter)

    const formatDate = (dateValue) => {
        if (!dateValue) return '-'
        
        let date
        // Handle Firestore Timestamp
        if (dateValue?.toDate && typeof dateValue.toDate === 'function') {
            date = dateValue.toDate()
        } 
        // Handle Firestore Timestamp with seconds
        else if (dateValue?.seconds) {
            date = new Date(dateValue.seconds * 1000)
        }
        // Handle ISO string or other date formats
        else {
            date = new Date(dateValue)
        }
        
        if (isNaN(date.getTime())) return '-'
        
        return date.toLocaleDateString('zh-HK', { 
            year: 'numeric', 
            month: 'short', 
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        })
    }

    return (
        <div className="p-6">
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h1 className="text-2xl font-semibold text-slate-800 flex items-center gap-3">
                        <CalendarCheck className="text-green-600" />
                        預訂管理
                    </h1>
                    <p className="text-slate-500 mt-1">查看及管理所有預訂</p>
                </div>
                <button
                    onClick={loadReservations}
                    className="text-sm text-slate-600 hover:text-slate-800 transition"
                >
                    重新載入
                </button>
            </div>

            {/* Filter Tabs */}
            <div className="flex flex-wrap gap-2 mb-6">
                {[
                    { key: 'all', label: '全部' },
                    ...STATUS_CONFIG.map(s => ({ key: s.key, label: s.label }))
                ].map(tab => (
                    <button
                        key={tab.key}
                        onClick={() => setFilter(tab.key)}
                        className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
                            filter === tab.key 
                                ? 'bg-slate-800 text-white' 
                                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                        }`}
                    >
                        {tab.label}
                        {tab.key !== 'all' && (
                            <span className="ml-2 opacity-70">
                                ({reservations.filter(r => r.status === tab.key).length})
                            </span>
                        )}
                    </button>
                ))}
                
                {/* Workflow Info */}
                <div className="relative group ml-auto">
                    <button className="flex items-center gap-1 px-3 py-2 text-sm text-slate-500 hover:text-slate-700 transition">
                        <Info size={16} />
                        <span className="max-sm:hidden">訂單流程</span>
                    </button>
                    <div className="absolute right-0 top-full mt-2 w-80 bg-slate-800 text-white text-sm rounded-lg p-4 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-50 shadow-xl">
                        <p className="whitespace-pre-line">{WORKFLOW_DESCRIPTION}</p>
                    </div>
                </div>
            </div>

            {loading ? (
                <div className="flex items-center justify-center py-20">
                    <Loader2 size={32} className="animate-spin text-slate-400" />
                </div>
            ) : filteredReservations.length === 0 ? (
                <div className="text-center py-20 text-slate-400">
                    <CalendarCheck size={48} className="mx-auto mb-4 opacity-50" />
                    <p>暫無預訂</p>
                </div>
            ) : (
                <div className="grid gap-4">
                    {filteredReservations.map(reservation => (
                        <div key={reservation.id} className="bg-white border border-slate-200 rounded-xl p-5">
                            <div className="flex max-md:flex-col gap-6">
                                {/* Product Info */}
                                <div className="flex items-center gap-4 min-w-64">
                                    {reservation.productImage ? (
                                        <div className="w-16 h-16 bg-slate-100 rounded-lg overflow-hidden flex-shrink-0">
                                            <img 
                                                src={reservation.productImage} 
                                                alt={reservation.productName}
                                                className="w-full h-full object-cover"
                                            />
                                        </div>
                                    ) : (
                                        <div className="w-16 h-16 bg-slate-100 rounded-lg flex items-center justify-center flex-shrink-0">
                                            <Package size={24} className="text-slate-400" />
                                        </div>
                                    )}
                                    <div>
                                        <p className="font-medium text-slate-800">{reservation.productName}</p>
                                        <p className="text-sm text-green-600 font-medium">
                                            ${reservation.productPrice} × {reservation.quantity || 1}
                                        </p>
                                        {/* Display selected options */}
                                        {reservation.selectedOptions && Object.keys(reservation.selectedOptions).length > 0 && (
                                            <div className="mt-1.5 flex flex-wrap gap-1.5">
                                                {Object.entries(reservation.selectedOptions).map(([name, value]) => (
                                                    <span key={name} className="px-2 py-0.5 bg-blue-50 text-blue-700 text-xs rounded">
                                                        {name}: {value}
                                                    </span>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {/* Customer Info */}
                                <div className="flex-1 grid sm:grid-cols-2 gap-3">
                                    <div className="flex items-center gap-2 text-sm text-slate-600">
                                        <User size={16} className="text-slate-400" />
                                        <span>{reservation.name}</span>
                                    </div>
                                    {reservation.email && (
                                        <div className="flex items-center gap-2 text-sm text-slate-600">
                                            <Mail size={16} className="text-slate-400" />
                                            <a href={`mailto:${reservation.email}`} className="hover:text-slate-800">
                                                {reservation.email}
                                            </a>
                                        </div>
                                    )}
                                    {reservation.phone && (
                                        <div className="flex items-center gap-2 text-sm text-slate-600">
                                            <Phone size={16} className="text-slate-400" />
                                            <a href={`tel:${reservation.phone}`} className="hover:text-slate-800">
                                                {reservation.phone}
                                            </a>
                                        </div>
                                    )}
                                    <div className="flex items-center gap-2 text-sm text-slate-500">
                                        <Clock size={16} className="text-slate-400" />
                                        <span>{formatDate(reservation.createdAt)}</span>
                                    </div>
                                </div>

                                {/* Status & Actions */}
                                <div className="flex items-center gap-3 relative">
                                    {/* Status Dropdown */}
                                    <div className="relative">
                                        <button
                                            onClick={() => setOpenDropdown(openDropdown === reservation.id ? null : reservation.id)}
                                            className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium ${getStatusColor(reservation.status)} hover:opacity-80 transition`}
                                        >
                                            {getStatusLabel(reservation.status)}
                                            <ChevronDown size={14} />
                                        </button>
                                        
                                        {openDropdown === reservation.id && (
                                            <>
                                                <div 
                                                    className="fixed inset-0 z-40" 
                                                    onClick={() => setOpenDropdown(null)}
                                                />
                                                <div className="absolute right-0 top-full mt-2 w-48 bg-white border border-slate-200 rounded-lg shadow-lg z-50 py-1">
                                                    {STATUS_CONFIG.map(status => (
                                                        <button
                                                            key={status.key}
                                                            onClick={() => updateStatus(reservation.id, status.key)}
                                                            className={`w-full flex items-center gap-3 px-4 py-2 text-left text-sm hover:bg-slate-50 transition ${
                                                                reservation.status === status.key ? 'bg-slate-50' : ''
                                                            }`}
                                                        >
                                                            <span className={`w-2 h-2 rounded-full ${status.color.replace('text-', 'bg-').split(' ')[0]}`} />
                                                            <span>{status.label}</span>
                                                            <span className="text-slate-400 text-xs ml-auto">Step {status.step}</span>
                                                        </button>
                                                    ))}
                                                </div>
                                            </>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    )
}
