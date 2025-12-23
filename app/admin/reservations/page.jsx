'use client'

import { useState, useEffect } from 'react'
import { CalendarCheck, Mail, Phone, User, Package, Clock, CheckCircle, XCircle, Loader2 } from 'lucide-react'
import { FirebaseFirestoreService } from '@/lib/firebase/firestore'
import toast from 'react-hot-toast'
import Image from 'next/image'

export default function ReservationsPage() {
    const [reservations, setReservations] = useState([])
    const [loading, setLoading] = useState(true)
    const [filter, setFilter] = useState('all') // all, pending, confirmed, cancelled

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
                status: newStatus
            })
            setReservations(prev => 
                prev.map(r => r.id === reservationId ? { ...r, status: newStatus } : r)
            )
            toast.success(`預訂狀態已更新為 ${getStatusLabel(newStatus)}`)
        } catch (error) {
            console.error('Error updating status:', error)
            toast.error('Failed to update status')
        }
    }

    const getStatusLabel = (status) => {
        switch (status) {
            case 'pending': return '待處理'
            case 'confirmed': return '已確認'
            case 'cancelled': return '已取消'
            default: return status
        }
    }

    const getStatusColor = (status) => {
        switch (status) {
            case 'pending': return 'bg-yellow-100 text-yellow-700'
            case 'confirmed': return 'bg-green-100 text-green-700'
            case 'cancelled': return 'bg-red-100 text-red-700'
            default: return 'bg-slate-100 text-slate-700'
        }
    }

    const filteredReservations = filter === 'all' 
        ? reservations 
        : reservations.filter(r => r.status === filter)

    const formatDate = (dateString) => {
        if (!dateString) return '-'
        const date = new Date(dateString)
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
            <div className="flex gap-2 mb-6">
                {[
                    { key: 'all', label: '全部' },
                    { key: 'pending', label: '待處理' },
                    { key: 'confirmed', label: '已確認' },
                    { key: 'cancelled', label: '已取消' }
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
                                <div className="flex items-center gap-3">
                                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(reservation.status)}`}>
                                        {getStatusLabel(reservation.status)}
                                    </span>
                                    
                                    {reservation.status === 'pending' && (
                                        <div className="flex gap-2">
                                            <button
                                                onClick={() => updateStatus(reservation.id, 'confirmed')}
                                                className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition"
                                                title="確認預訂"
                                            >
                                                <CheckCircle size={20} />
                                            </button>
                                            <button
                                                onClick={() => updateStatus(reservation.id, 'cancelled')}
                                                className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition"
                                                title="取消預訂"
                                            >
                                                <XCircle size={20} />
                                            </button>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    )
}
