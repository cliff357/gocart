'use client'

import { useState, useEffect } from 'react'
import { ClipboardList, Plus, Trash2, Edit2, Check, X, Loader2, GripVertical, Lightbulb } from 'lucide-react'
import { FirebaseFirestoreService } from '@/lib/firebase/firestore'
import toast from 'react-hot-toast'

// Default todo items for initial setup
const DEFAULT_TODOS = [
    {
        id: 'default_1',
        title: 'Claim 錢功能',
        description: '用黎比同事 claim 錢用，記錄支出同報銷',
        category: 'feature',
        priority: 'high',
        completed: false
    },
    {
        id: 'default_2',
        title: 'Monthly Revenue Report',
        description: '每個月自動生成收入報告',
        category: 'report',
        priority: 'high',
        completed: false
    },
    {
        id: 'default_3',
        title: 'Order Statistics',
        description: '統計每月有幾多張 order',
        category: 'report',
        priority: 'medium',
        completed: false
    },
    {
        id: 'default_4',
        title: 'Sales Report',
        description: '統計賣左幾多貨，邊啲貨最受歡迎',
        category: 'report',
        priority: 'medium',
        completed: false
    },
    {
        id: 'default_5',
        title: 'Production Tracking',
        description: '記錄整左幾多貨，生產進度',
        category: 'report',
        priority: 'medium',
        completed: false
    },
    {
        id: 'default_6',
        title: 'Stock Take',
        description: '庫存盤點功能',
        category: 'feature',
        priority: 'low',
        completed: false
    }
]

const CATEGORIES = [
    { key: 'feature', label: '功能', color: 'bg-blue-100 text-blue-700' },
    { key: 'report', label: '報表', color: 'bg-purple-100 text-purple-700' },
    { key: 'improvement', label: '改進', color: 'bg-green-100 text-green-700' },
    { key: 'other', label: '其他', color: 'bg-slate-100 text-slate-700' }
]

const PRIORITIES = [
    { key: 'high', label: '高', color: 'text-red-600' },
    { key: 'medium', label: '中', color: 'text-yellow-600' },
    { key: 'low', label: '低', color: 'text-slate-400' }
]

export default function TodoPage() {
    const [todos, setTodos] = useState([])
    const [loading, setLoading] = useState(true)
    const [saving, setSaving] = useState(false)
    const [editingId, setEditingId] = useState(null)
    const [editForm, setEditForm] = useState({ title: '', description: '', category: 'feature', priority: 'medium' })
    const [showAddForm, setShowAddForm] = useState(false)
    const [newTodo, setNewTodo] = useState({ title: '', description: '', category: 'feature', priority: 'medium' })
    const [draggedId, setDraggedId] = useState(null)
    const [dragOverId, setDragOverId] = useState(null)

    useEffect(() => {
        loadTodos()
    }, [])

    const loadTodos = async () => {
        setLoading(true)
        try {
            const result = await FirebaseFirestoreService.getDocument('settings', 'todoList')
            if (result.success && result.data?.items) {
                setTodos(result.data.items)
            } else {
                // Initialize with default todos
                setTodos(DEFAULT_TODOS)
                await saveTodos(DEFAULT_TODOS)
            }
        } catch (error) {
            console.error('Error loading todos:', error)
            setTodos(DEFAULT_TODOS)
        } finally {
            setLoading(false)
        }
    }

    const saveTodos = async (items) => {
        setSaving(true)
        try {
            await FirebaseFirestoreService.setDocument('settings', 'todoList', {
                items,
                updatedAt: new Date().toISOString()
            })
        } catch (error) {
            console.error('Error saving todos:', error)
            toast.error('Failed to save')
        } finally {
            setSaving(false)
        }
    }

    const handleAddTodo = async () => {
        if (!newTodo.title.trim()) {
            toast.error('請輸入標題')
            return
        }

        const newItem = {
            id: `todo_${Date.now()}`,
            ...newTodo,
            completed: false,
            createdAt: new Date().toISOString()
        }

        const updatedTodos = [...todos, newItem]
        setTodos(updatedTodos)
        await saveTodos(updatedTodos)
        setNewTodo({ title: '', description: '', category: 'feature', priority: 'medium' })
        setShowAddForm(false)
        toast.success('已新增項目')
    }

    const handleDeleteTodo = async (id) => {
        const updatedTodos = todos.filter(t => t.id !== id)
        setTodos(updatedTodos)
        await saveTodos(updatedTodos)
        toast.success('已刪除項目')
    }

    const handleToggleComplete = async (id) => {
        const updatedTodos = todos.map(t => 
            t.id === id ? { ...t, completed: !t.completed } : t
        )
        setTodos(updatedTodos)
        await saveTodos(updatedTodos)
    }

    const handleStartEdit = (todo) => {
        setEditingId(todo.id)
        setEditForm({
            title: todo.title,
            description: todo.description || '',
            category: todo.category || 'feature',
            priority: todo.priority || 'medium'
        })
    }

    const handleSaveEdit = async () => {
        if (!editForm.title.trim()) {
            toast.error('請輸入標題')
            return
        }

        const updatedTodos = todos.map(t => 
            t.id === editingId ? { ...t, ...editForm } : t
        )
        setTodos(updatedTodos)
        await saveTodos(updatedTodos)
        setEditingId(null)
        toast.success('已更新項目')
    }

    const getCategoryConfig = (category) => {
        return CATEGORIES.find(c => c.key === category) || CATEGORIES[3]
    }

    const getPriorityConfig = (priority) => {
        return PRIORITIES.find(p => p.key === priority) || PRIORITIES[1]
    }

    // Drag and drop handlers
    const handleDragStart = (e, todoId) => {
        setDraggedId(todoId)
        e.dataTransfer.effectAllowed = 'move'
    }

    const handleDragOver = (e, todoId) => {
        e.preventDefault()
        e.dataTransfer.dropEffect = 'move'
        if (todoId !== draggedId) {
            setDragOverId(todoId)
        }
    }

    const handleDragLeave = () => {
        setDragOverId(null)
    }

    const handleDrop = async (e, targetId) => {
        e.preventDefault()
        setDragOverId(null)

        if (!draggedId || draggedId === targetId) {
            setDraggedId(null)
            return
        }

        // Get incomplete todos only (we only sort incomplete ones)
        const incomplete = todos.filter(t => !t.completed)
        const completed = todos.filter(t => t.completed)

        const draggedIndex = incomplete.findIndex(t => t.id === draggedId)
        const targetIndex = incomplete.findIndex(t => t.id === targetId)

        if (draggedIndex === -1 || targetIndex === -1) {
            setDraggedId(null)
            return
        }

        // Reorder
        const reordered = [...incomplete]
        const [removed] = reordered.splice(draggedIndex, 1)
        reordered.splice(targetIndex, 0, removed)

        // Combine with completed todos
        const updatedTodos = [...reordered, ...completed]
        setTodos(updatedTodos)
        await saveTodos(updatedTodos)
        setDraggedId(null)
        toast.success('順序已更新')
    }

    const handleDragEnd = () => {
        setDraggedId(null)
        setDragOverId(null)
    }

    const incompleteTodos = todos.filter(t => !t.completed)
    const completedTodos = todos.filter(t => t.completed)

    return (
        <div className="p-6 max-w-4xl">
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h1 className="text-2xl font-semibold text-slate-800 flex items-center gap-3">
                        <ClipboardList className="text-green-600" />
                        功能許願樹 🌳
                    </h1>
                    <p className="text-slate-500 mt-1">許個願，記錄未來想要嘅功能同改進</p>
                </div>
                <div className="flex items-center gap-3">
                    {saving && <Loader2 size={18} className="animate-spin text-slate-400" />}
                    <button
                        onClick={() => setShowAddForm(true)}
                        className="flex items-center gap-2 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition"
                    >
                        <Plus size={18} />
                        新增項目
                    </button>
                </div>
            </div>

            {/* Add Form */}
            {showAddForm && (
                <div className="bg-white border border-slate-200 rounded-xl p-5 mb-6">
                    <h3 className="font-medium text-slate-800 mb-4">新增項目</h3>
                    <div className="space-y-4">
                        <input
                            type="text"
                            placeholder="標題"
                            value={newTodo.title}
                            onChange={(e) => setNewTodo(prev => ({ ...prev, title: e.target.value }))}
                            className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-green-500 outline-none"
                        />
                        <textarea
                            placeholder="描述 (可選)"
                            value={newTodo.description}
                            onChange={(e) => setNewTodo(prev => ({ ...prev, description: e.target.value }))}
                            className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-green-500 outline-none resize-none h-20"
                        />
                        <div className="flex gap-4">
                            <div className="flex-1">
                                <label className="text-sm text-slate-500 mb-1 block">類別</label>
                                <select
                                    value={newTodo.category}
                                    onChange={(e) => setNewTodo(prev => ({ ...prev, category: e.target.value }))}
                                    className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-green-500 outline-none"
                                >
                                    {CATEGORIES.map(cat => (
                                        <option key={cat.key} value={cat.key}>{cat.label}</option>
                                    ))}
                                </select>
                            </div>
                            <div className="flex-1">
                                <label className="text-sm text-slate-500 mb-1 block">優先級</label>
                                <select
                                    value={newTodo.priority}
                                    onChange={(e) => setNewTodo(prev => ({ ...prev, priority: e.target.value }))}
                                    className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-green-500 outline-none"
                                >
                                    {PRIORITIES.map(pri => (
                                        <option key={pri.key} value={pri.key}>{pri.label}</option>
                                    ))}
                                </select>
                            </div>
                        </div>
                        <div className="flex justify-end gap-3">
                            <button
                                onClick={() => {
                                    setShowAddForm(false)
                                    setNewTodo({ title: '', description: '', category: 'feature', priority: 'medium' })
                                }}
                                className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-lg transition"
                            >
                                取消
                            </button>
                            <button
                                onClick={handleAddTodo}
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
                <div className="space-y-6">
                    {/* Incomplete Todos */}
                    <div>
                        <h2 className="text-sm font-medium text-slate-500 mb-3 flex items-center gap-2">
                            <Lightbulb size={16} />
                            待開發 ({incompleteTodos.length})
                            <span className="text-xs text-slate-400 ml-2">拖拽排序</span>
                        </h2>
                        <div className="space-y-3">
                            {incompleteTodos.map((todo, index) => (
                                <div 
                                    key={todo.id} 
                                    draggable={editingId !== todo.id}
                                    onDragStart={(e) => handleDragStart(e, todo.id)}
                                    onDragOver={(e) => handleDragOver(e, todo.id)}
                                    onDragLeave={handleDragLeave}
                                    onDrop={(e) => handleDrop(e, todo.id)}
                                    onDragEnd={handleDragEnd}
                                    className={`bg-white border rounded-xl p-4 transition-all ${
                                        draggedId === todo.id 
                                            ? 'opacity-50 border-slate-300' 
                                            : dragOverId === todo.id 
                                                ? 'border-green-500 border-2 shadow-lg' 
                                                : 'border-slate-200'
                                    } ${editingId !== todo.id ? 'cursor-grab active:cursor-grabbing' : ''}`}
                                >
                                    {editingId === todo.id ? (
                                        <div className="space-y-3">
                                            <input
                                                type="text"
                                                value={editForm.title}
                                                onChange={(e) => setEditForm(prev => ({ ...prev, title: e.target.value }))}
                                                className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-green-500 outline-none"
                                            />
                                            <textarea
                                                value={editForm.description}
                                                onChange={(e) => setEditForm(prev => ({ ...prev, description: e.target.value }))}
                                                className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-green-500 outline-none resize-none h-16"
                                            />
                                            <div className="flex gap-3">
                                                <select
                                                    value={editForm.category}
                                                    onChange={(e) => setEditForm(prev => ({ ...prev, category: e.target.value }))}
                                                    className="px-3 py-2 border border-slate-200 rounded-lg text-sm"
                                                >
                                                    {CATEGORIES.map(cat => (
                                                        <option key={cat.key} value={cat.key}>{cat.label}</option>
                                                    ))}
                                                </select>
                                                <select
                                                    value={editForm.priority}
                                                    onChange={(e) => setEditForm(prev => ({ ...prev, priority: e.target.value }))}
                                                    className="px-3 py-2 border border-slate-200 rounded-lg text-sm"
                                                >
                                                    {PRIORITIES.map(pri => (
                                                        <option key={pri.key} value={pri.key}>{pri.label}</option>
                                                    ))}
                                                </select>
                                                <div className="flex-1" />
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
                                            <div className="flex items-center gap-2">
                                                <GripVertical size={16} className="text-slate-300 cursor-grab" />
                                                <button
                                                    onClick={() => handleToggleComplete(todo.id)}
                                                    className="mt-0 w-5 h-5 border-2 border-slate-300 rounded hover:border-green-500 transition flex-shrink-0"
                                                />
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-center gap-2 mb-1">
                                                    <span className="font-medium text-slate-800">{todo.title}</span>
                                                    <span className={`px-2 py-0.5 rounded-full text-xs ${getCategoryConfig(todo.category).color}`}>
                                                        {getCategoryConfig(todo.category).label}
                                                    </span>
                                                    <span className={`text-xs ${getPriorityConfig(todo.priority).color}`}>
                                                        ● {getPriorityConfig(todo.priority).label}
                                                    </span>
                                                </div>
                                                {todo.description && (
                                                    <p className="text-sm text-slate-500">{todo.description}</p>
                                                )}
                                            </div>
                                            <div className="flex items-center gap-1">
                                                <button
                                                    onClick={() => handleStartEdit(todo)}
                                                    className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-50 rounded-lg transition"
                                                >
                                                    <Edit2 size={16} />
                                                </button>
                                                <button
                                                    onClick={() => handleDeleteTodo(todo.id)}
                                                    className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition"
                                                >
                                                    <Trash2 size={16} />
                                                </button>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            ))}
                            {incompleteTodos.length === 0 && (
                                <div className="text-center py-10 text-slate-400">
                                    <ClipboardList size={32} className="mx-auto mb-2 opacity-50" />
                                    <p>暫無待開發項目</p>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Completed Todos */}
                    {completedTodos.length > 0 && (
                        <div>
                            <h2 className="text-sm font-medium text-slate-400 mb-3">
                                已完成 ({completedTodos.length})
                            </h2>
                            <div className="space-y-2">
                                {completedTodos.map(todo => (
                                    <div key={todo.id} className="bg-slate-50 border border-slate-100 rounded-xl p-4">
                                        <div className="flex items-center gap-4">
                                            <button
                                                onClick={() => handleToggleComplete(todo.id)}
                                                className="w-5 h-5 bg-green-500 rounded flex items-center justify-center flex-shrink-0"
                                            >
                                                <Check size={14} className="text-white" />
                                            </button>
                                            <span className="flex-1 text-slate-400 line-through">{todo.title}</span>
                                            <button
                                                onClick={() => handleDeleteTodo(todo.id)}
                                                className="p-2 text-slate-300 hover:text-red-600 hover:bg-red-50 rounded-lg transition"
                                            >
                                                <Trash2 size={16} />
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            )}
        </div>
    )
}
