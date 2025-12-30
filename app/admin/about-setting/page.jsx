'use client'

import { useState, useEffect } from 'react'
import { History, Plus, Trash2, Edit2, Check, X, Loader2, Save, GripVertical, ArrowUp, ArrowDown } from 'lucide-react'
import { FirebaseFirestoreService } from '@/lib/firebase/firestore'
import toast from 'react-hot-toast'

// Emoji options for timeline icons
const EMOJI_OPTIONS = ['🏠', '🎨', '💻', '🎪', '🎉', '🏆', '📦', '✨', '🚀', '💡', '🎁', '❤️', '🌟', '📸', '🛠️', '🎯']

// Default timeline data
const DEFAULT_TIMELINE = [
    {
        id: 1,
        date: '2024年1月',
        title: 'Studio 成立',
        description: '老友賣蘿柚企劃正式成立，開始創作陶藝作品。',
        icon: '🏠'
    },
    {
        id: 2,
        date: '2024年3月',
        title: '第一件作品完成',
        description: '完成第一件陶相架作品，開始探索更多可能性。',
        icon: '🎨'
    },
    {
        id: 3,
        date: '2024年6月',
        title: '網站上線',
        description: 'LoyaultyClub 網站正式上線，開始接受網上預訂。',
        icon: '💻'
    },
    {
        id: 4,
        date: '2024年9月',
        title: '第一次擺市集',
        description: '首次參與本地市集，同支持者面對面交流。',
        icon: '🎪'
    }
]

export default function AboutSettingPage() {
    const [timeline, setTimeline] = useState([])
    const [loading, setLoading] = useState(true)
    const [saving, setSaving] = useState(false)
    const [editingId, setEditingId] = useState(null)
    const [editForm, setEditForm] = useState({ date: '', title: '', description: '', icon: '🎨' })
    const [showAddForm, setShowAddForm] = useState(false)
    const [newEvent, setNewEvent] = useState({ date: '', title: '', description: '', icon: '🎨' })

    useEffect(() => {
        loadTimeline()
    }, [])

    const loadTimeline = async () => {
        setLoading(true)
        try {
            const result = await FirebaseFirestoreService.getDocument('settings', 'about')
            if (result.success && result.data?.timeline) {
                setTimeline(result.data.timeline)
            } else {
                setTimeline(DEFAULT_TIMELINE)
                await saveTimeline(DEFAULT_TIMELINE)
            }
        } catch (error) {
            console.error('Error loading timeline:', error)
            setTimeline(DEFAULT_TIMELINE)
        } finally {
            setLoading(false)
        }
    }

    const saveTimeline = async (items) => {
        setSaving(true)
        try {
            await FirebaseFirestoreService.setDocument('settings', 'about', {
                timeline: items,
                updatedAt: new Date().toISOString()
            })
            toast.success('時間線已儲存')
        } catch (error) {
            console.error('Error saving timeline:', error)
            toast.error('儲存失敗')
        } finally {
            setSaving(false)
        }
    }

    const handleAddEvent = async () => {
        if (!newEvent.date.trim() || !newEvent.title.trim()) {
            toast.error('請填寫日期同標題')
            return
        }

        const newItem = {
            id: Date.now(),
            ...newEvent
        }

        const updatedTimeline = [...timeline, newItem]
        setTimeline(updatedTimeline)
        await saveTimeline(updatedTimeline)
        setNewEvent({ date: '', title: '', description: '', icon: '🎨' })
        setShowAddForm(false)
    }

    const handleDeleteEvent = async (id) => {
        if (!confirm('確定要刪除呢個事件？')) return
        
        const updatedTimeline = timeline.filter(t => t.id !== id)
        setTimeline(updatedTimeline)
        await saveTimeline(updatedTimeline)
    }

    const handleStartEdit = (event) => {
        setEditingId(event.id)
        setEditForm({
            date: event.date,
            title: event.title,
            description: event.description || '',
            icon: event.icon || '🎨'
        })
    }

    const handleSaveEdit = async () => {
        if (!editForm.date.trim() || !editForm.title.trim()) {
            toast.error('請填寫日期同標題')
            return
        }

        const updatedTimeline = timeline.map(t =>
            t.id === editingId ? { ...t, ...editForm } : t
        )
        setTimeline(updatedTimeline)
        await saveTimeline(updatedTimeline)
        setEditingId(null)
    }

    const moveEvent = async (index, direction) => {
        const newIndex = index + direction
        if (newIndex < 0 || newIndex >= timeline.length) return

        const updatedTimeline = [...timeline]
        const [removed] = updatedTimeline.splice(index, 1)
        updatedTimeline.splice(newIndex, 0, removed)
        
        setTimeline(updatedTimeline)
        await saveTimeline(updatedTimeline)
    }

    return (
        <div className="p-6 max-w-4xl">
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h1 className="text-2xl font-semibold text-slate-800 flex items-center gap-3">
                        <History className="text-green-600" />
                        About Us 設定
                    </h1>
                    <p className="text-slate-500 mt-1">管理 About 頁面嘅時間線</p>
                </div>
                <div className="flex items-center gap-3">
                    {saving && <Loader2 size={18} className="animate-spin text-slate-400" />}
                    <button
                        onClick={() => setShowAddForm(true)}
                        className="flex items-center gap-2 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition"
                    >
                        <Plus size={18} />
                        新增事件
                    </button>
                </div>
            </div>

            {/* Add Form */}
            {showAddForm && (
                <div className="bg-white border border-slate-200 rounded-xl p-5 mb-6">
                    <h3 className="font-medium text-slate-800 mb-4">新增時間線事件</h3>
                    <div className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="text-sm text-slate-500 mb-1 block">日期</label>
                                <input
                                    type="text"
                                    placeholder="例如：2024年1月"
                                    value={newEvent.date}
                                    onChange={(e) => setNewEvent(prev => ({ ...prev, date: e.target.value }))}
                                    className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-green-500 outline-none"
                                />
                            </div>
                            <div>
                                <label className="text-sm text-slate-500 mb-1 block">Icon</label>
                                <div className="flex flex-wrap gap-2">
                                    {EMOJI_OPTIONS.map(emoji => (
                                        <button
                                            key={emoji}
                                            type="button"
                                            onClick={() => setNewEvent(prev => ({ ...prev, icon: emoji }))}
                                            className={`w-10 h-10 text-xl rounded-lg border transition ${
                                                newEvent.icon === emoji 
                                                    ? 'border-green-500 bg-green-50' 
                                                    : 'border-slate-200 hover:border-slate-300'
                                            }`}
                                        >
                                            {emoji}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>
                        <div>
                            <label className="text-sm text-slate-500 mb-1 block">標題</label>
                            <input
                                type="text"
                                placeholder="事件標題"
                                value={newEvent.title}
                                onChange={(e) => setNewEvent(prev => ({ ...prev, title: e.target.value }))}
                                className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-green-500 outline-none"
                            />
                        </div>
                        <div>
                            <label className="text-sm text-slate-500 mb-1 block">描述 (可選)</label>
                            <textarea
                                placeholder="事件描述"
                                value={newEvent.description}
                                onChange={(e) => setNewEvent(prev => ({ ...prev, description: e.target.value }))}
                                className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-green-500 outline-none resize-none h-20"
                            />
                        </div>
                        <div className="flex justify-end gap-3">
                            <button
                                onClick={() => {
                                    setShowAddForm(false)
                                    setNewEvent({ date: '', title: '', description: '', icon: '🎨' })
                                }}
                                className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-lg transition"
                            >
                                取消
                            </button>
                            <button
                                onClick={handleAddEvent}
                                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition"
                            >
                                新增
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {loading ? (
                <div className="flex items-center justify-center py-20">
                    <Loader2 size={32} className="animate-spin text-slate-400" />
                </div>
            ) : (
                <div className="space-y-4">
                    <p className="text-sm text-slate-400 mb-4">
                        共 {timeline.length} 個事件 · 使用箭嘴調整順序
                    </p>
                    
                    {timeline.map((event, index) => (
                        <div key={event.id} className="bg-white border border-slate-200 rounded-xl p-5">
                            {editingId === event.id ? (
                                <div className="space-y-4">
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="text-sm text-slate-500 mb-1 block">日期</label>
                                            <input
                                                type="text"
                                                value={editForm.date}
                                                onChange={(e) => setEditForm(prev => ({ ...prev, date: e.target.value }))}
                                                className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-green-500 outline-none"
                                            />
                                        </div>
                                        <div>
                                            <label className="text-sm text-slate-500 mb-1 block">Icon</label>
                                            <div className="flex flex-wrap gap-1">
                                                {EMOJI_OPTIONS.map(emoji => (
                                                    <button
                                                        key={emoji}
                                                        type="button"
                                                        onClick={() => setEditForm(prev => ({ ...prev, icon: emoji }))}
                                                        className={`w-8 h-8 text-lg rounded border transition ${
                                                            editForm.icon === emoji 
                                                                ? 'border-green-500 bg-green-50' 
                                                                : 'border-slate-200 hover:border-slate-300'
                                                        }`}
                                                    >
                                                        {emoji}
                                                    </button>
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                    <div>
                                        <label className="text-sm text-slate-500 mb-1 block">標題</label>
                                        <input
                                            type="text"
                                            value={editForm.title}
                                            onChange={(e) => setEditForm(prev => ({ ...prev, title: e.target.value }))}
                                            className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-green-500 outline-none"
                                        />
                                    </div>
                                    <div>
                                        <label className="text-sm text-slate-500 mb-1 block">描述</label>
                                        <textarea
                                            value={editForm.description}
                                            onChange={(e) => setEditForm(prev => ({ ...prev, description: e.target.value }))}
                                            className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-green-500 outline-none resize-none h-16"
                                        />
                                    </div>
                                    <div className="flex justify-end gap-2">
                                        <button
                                            onClick={() => setEditingId(null)}
                                            className="p-2 text-slate-400 hover:text-slate-600 transition"
                                        >
                                            <X size={18} />
                                        </button>
                                        <button
                                            onClick={handleSaveEdit}
                                            className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition"
                                        >
                                            <Check size={18} />
                                        </button>
                                    </div>
                                </div>
                            ) : (
                                <div className="flex items-start gap-4">
                                    {/* Order Controls */}
                                    <div className="flex flex-col gap-1">
                                        <button
                                            onClick={() => moveEvent(index, -1)}
                                            disabled={index === 0}
                                            className="p-1 text-slate-400 hover:text-slate-600 disabled:opacity-30 disabled:cursor-not-allowed transition"
                                        >
                                            <ArrowUp size={16} />
                                        </button>
                                        <button
                                            onClick={() => moveEvent(index, 1)}
                                            disabled={index === timeline.length - 1}
                                            className="p-1 text-slate-400 hover:text-slate-600 disabled:opacity-30 disabled:cursor-not-allowed transition"
                                        >
                                            <ArrowDown size={16} />
                                        </button>
                                    </div>

                                    {/* Icon */}
                                    <div className="w-12 h-12 bg-[#9E4F1E] rounded-full flex items-center justify-center text-2xl flex-shrink-0">
                                        {event.icon}
                                    </div>

                                    {/* Content */}
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-2 mb-1">
                                            <span className="text-sm text-[#9E4F1E] font-medium">{event.date}</span>
                                        </div>
                                        <h3 className="font-bold text-slate-800">{event.title}</h3>
                                        {event.description && (
                                            <p className="text-sm text-slate-500 mt-1">{event.description}</p>
                                        )}
                                    </div>

                                    {/* Actions */}
                                    <div className="flex items-center gap-1">
                                        <button
                                            onClick={() => handleStartEdit(event)}
                                            className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-50 rounded-lg transition"
                                        >
                                            <Edit2 size={16} />
                                        </button>
                                        <button
                                            onClick={() => handleDeleteEvent(event.id)}
                                            className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition"
                                        >
                                            <Trash2 size={16} />
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>
                    ))}

                    {timeline.length === 0 && (
                        <div className="text-center py-20 text-slate-400">
                            <History size={48} className="mx-auto mb-4 opacity-50" />
                            <p>暫無時間線事件</p>
                            <button
                                onClick={() => setShowAddForm(true)}
                                className="mt-4 text-green-600 hover:underline"
                            >
                                新增第一個事件
                            </button>
                        </div>
                    )}
                </div>
            )}

            {/* Preview Section */}
            <div className="mt-12 pt-8 border-t border-slate-200">
                <h2 className="text-lg font-semibold text-slate-800 mb-4">預覽</h2>
                <div className="bg-[#f5f0e8] rounded-xl p-8">
                    <div className="relative max-w-md mx-auto">
                        {/* Vertical Line */}
                        <div className="absolute left-6 top-0 w-0.5 h-full bg-[#9E4F1E]/30" />

                        {/* Timeline Items */}
                        <div className="space-y-6">
                            {timeline.slice(0, 4).map((item) => (
                                <div key={item.id} className="relative flex items-start gap-4 pl-12">
                                    {/* Icon */}
                                    <div className="absolute left-0 w-12 h-12 bg-[#9E4F1E] rounded-full flex items-center justify-center text-xl">
                                        {item.icon}
                                    </div>
                                    
                                    {/* Content */}
                                    <div className="bg-white rounded-xl p-4 shadow-sm flex-1">
                                        <span className="text-xs text-[#9E4F1E] font-medium">{item.date}</span>
                                        <h4 className="font-bold text-slate-800 text-sm">{item.title}</h4>
                                        {item.description && (
                                            <p className="text-slate-500 text-xs mt-1 line-clamp-2">{item.description}</p>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                    {timeline.length > 4 && (
                        <p className="text-center text-slate-400 text-sm mt-4">
                            ... 仲有 {timeline.length - 4} 個事件
                        </p>
                    )}
                </div>
            </div>
        </div>
    )
}
