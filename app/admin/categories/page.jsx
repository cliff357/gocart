"use client"
import React, { useEffect, useState } from 'react'
import { categoryService } from '@/lib/services/FirestoreService'
import { toast } from 'react-hot-toast'
import { Plus, Trash, Edit } from 'lucide-react'

export default function CategoriesAdminPage() {
    const [categories, setCategories] = useState([]) // flat list
    const [tree, setTree] = useState([]) // nested tree
    const [loading, setLoading] = useState(true)
    const [name, setName] = useState('')
    const [editingId, setEditingId] = useState(null)
    const [editingName, setEditingName] = useState('')
    const [editingParentId, setEditingParentId] = useState(null)
    const [newParentId, setNewParentId] = useState(null)

    const buildTree = (flat) => {
        const map = {}
        flat.forEach(item => (map[item.id] = { ...item, children: [] }))
        const roots = []
        Object.values(map).forEach(node => {
            if (node.parentId && map[node.parentId]) {
                map[node.parentId].children.push(node)
            } else {
                roots.push(node)
            }
        })
        return roots
    }

    const fetchCategories = async () => {
        try {
            setLoading(true)
            const cats = await categoryService.getAll()
            const flat = cats || []
            setCategories(flat)
            setTree(buildTree(flat))
        } catch (error) {
            console.error('Error fetching categories', error)
            toast.error('載入分類失敗')
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        fetchCategories()
    }, [])

    const handleAdd = async (e) => {
        e.preventDefault()
        if (!name.trim()) return toast.error('請輸入分類名稱')
        try {
            const payload = { name: name.trim() }
            if (newParentId) payload.parentId = newParentId
            await categoryService.create(payload)
            toast.success('已新增分類')
            setName('')
            setNewParentId(null)
            fetchCategories()
        } catch (error) {
            console.error(error)
            toast.error('新增失敗')
        }
    }

    const handleDelete = async (id) => {
        if (!confirm('確定刪除？')) return
        try {
            await categoryService.delete(id)
            toast.success('已刪除')
            fetchCategories()
        } catch (error) {
            console.error(error)
            toast.error('刪除失敗')
        }
    }

    const startEdit = (cat) => {
        setEditingId(cat.id)
        setEditingName(cat.name)
        setEditingParentId(cat.parentId || null)
    }

    const cancelEdit = () => {
        setEditingId(null)
        setEditingName('')
        setEditingParentId(null)
    }

    const submitEdit = async (e) => {
        e.preventDefault()
        if (!editingName.trim()) return toast.error('請輸入名稱')
        try {
            await categoryService.update(editingId, { name: editingName.trim(), parentId: editingParentId || null })
            toast.success('已更新')
            cancelEdit()
            fetchCategories()
        } catch (error) {
            console.error(error)
            toast.error('更新失敗')
        }
    }

    const renderNode = (node, level = 0) => {
        return (
            <li key={node.id} className="border px-3 py-2 rounded">
                <div className="flex items-center justify-between">
                    <div className="text-slate-700" style={{ marginLeft: level * 16 }}>{node.name}</div>
                    <div className="flex items-center gap-2">
                        <button onClick={() => startEdit(node)} className="px-2 py-1 border rounded flex items-center gap-2">
                            <Edit size={14} /> 編輯
                        </button>
                        <button onClick={() => handleDelete(node.id)} className="px-2 py-1 bg-red-500 text-white rounded flex items-center gap-2">
                            <Trash size={14} /> 刪除
                        </button>
                    </div>
                </div>
                {node.children && node.children.length > 0 && (
                    <ul className="mt-2 space-y-2">
                        {node.children.map(child => renderNode(child, level + 1))}
                    </ul>
                )}
            </li>
        )
    }

    return (
        <div className="max-w-4xl mx-auto p-6">
            <div className="mb-6">
                <h1 className="text-2xl font-semibold">管理分類</h1>
                <p className="text-sm text-slate-600">在這裡新增、編輯或刪除產品分類（儲存在 Firebase）</p>
            </div>

            <div className="bg-white p-6 rounded shadow-sm">
                <form onSubmit={editingId ? submitEdit : handleAdd} className="flex flex-col gap-3 mb-4">
                    <div className="flex gap-2">
                        <input
                            className="flex-1 px-4 py-2 border rounded"
                            placeholder={editingId ? '編輯分類名稱' : '新增分類名稱'}
                            value={editingId ? editingName : name}
                            onChange={(e) => editingId ? setEditingName(e.target.value) : setName(e.target.value)}
                        />
                        <button className="px-4 py-2 bg-indigo-600 text-white rounded flex items-center gap-2">
                            <Plus size={16} /> {editingId ? '更新' : '新增'}
                        </button>
                        {editingId && (
                            <button type="button" onClick={cancelEdit} className="px-3 py-2 border rounded">取消</button>
                        )}
                    </div>

                    <div className="flex items-center gap-2">
                        <label className="text-sm">上級分類：</label>
                        <select className="px-3 py-2 border rounded" value={editingId ? (editingParentId || '') : (newParentId || '')} onChange={(e) => {
                            const v = e.target.value || null
                            if (editingId) setEditingParentId(v)
                            else setNewParentId(v)
                        }}>
                            <option value="">(無)</option>
                            {categories.map(cat => (
                                <option key={cat.id} value={cat.id}>{cat.name}</option>
                            ))}
                        </select>
                    </div>
                </form>

                {loading ? (
                    <div>載入中...</div>
                ) : (
                    <ul className="space-y-2">
                        {categories.length === 0 && <li className="text-sm text-slate-500">沒有分類</li>}
                        {tree.map(node => renderNode(node, 0))}
                    </ul>
                )}
            </div>
        </div>
    )
}
