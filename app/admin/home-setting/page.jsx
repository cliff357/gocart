'use client'

import { useState, useEffect, useRef } from 'react'
import { Upload, X, ImageIcon, Save, Loader2 } from 'lucide-react'
import Image from 'next/image'
import { FirebaseStorageService } from '@/lib/firebase/storage'
import { FirebaseFirestoreService } from '@/lib/firebase/firestore'
import toast from 'react-hot-toast'

const BANNER_CONFIG = [
    {
        id: 'main',
        label: 'Main Banner (Left)',
        description: 'The large banner on the left side',
        recommendedSize: '800 x 600 px',
        aspectRatio: '4:3'
    },
    {
        id: 'top_right',
        label: 'Top Right Banner',
        description: 'Smaller banner on top right',
        recommendedSize: '400 x 300 px',
        aspectRatio: '4:3'
    },
    {
        id: 'bottom_right',
        label: 'Bottom Right Banner',
        description: 'Smaller banner on bottom right',
        recommendedSize: '400 x 300 px',
        aspectRatio: '4:3'
    }
]

export default function HomeSettingPage() {
    const [banners, setBanners] = useState({
        main: null,
        top_right: null,
        bottom_right: null
    })
    const [previews, setPreviews] = useState({
        main: null,
        top_right: null,
        bottom_right: null
    })
    const [uploading, setUploading] = useState({
        main: false,
        top_right: false,
        bottom_right: false
    })
    const [saving, setSaving] = useState(false)
    const [imageDimensions, setImageDimensions] = useState({
        main: null,
        top_right: null,
        bottom_right: null
    })
    
    const fileInputRefs = {
        main: useRef(null),
        top_right: useRef(null),
        bottom_right: useRef(null)
    }

    // Load existing banners on mount
    useEffect(() => {
        loadBanners()
    }, [])

    const loadBanners = async () => {
        try {
            const result = await FirebaseFirestoreService.getDocument('settings', 'home')
            if (result.success && result.data && result.data.banners) {
                setBanners(result.data.banners)
                setPreviews(result.data.banners)
            }
        } catch (error) {
            console.error('Error loading banners:', error)
        }
    }

    const handleFileSelect = async (bannerId, event) => {
        const file = event.target.files?.[0]
        if (!file) return

        // Validate file type
        if (!file.type.startsWith('image/')) {
            toast.error('Please select an image file')
            return
        }

        // Create preview and get dimensions
        const reader = new FileReader()
        reader.onload = (e) => {
            const img = new window.Image()
            img.onload = () => {
                setImageDimensions(prev => ({
                    ...prev,
                    [bannerId]: { width: img.width, height: img.height }
                }))
            }
            img.src = e.target.result
            setPreviews(prev => ({
                ...prev,
                [bannerId]: e.target.result
            }))
        }
        reader.readAsDataURL(file)

        // Upload to Firebase
        setUploading(prev => ({ ...prev, [bannerId]: true }))
        try {
            const result = await FirebaseStorageService.uploadFile(
                file,
                'banners',
                `${bannerId}_${Date.now()}.${file.name.split('.').pop()}`
            )
            
            if (result.success) {
                setBanners(prev => ({
                    ...prev,
                    [bannerId]: result.url
                }))
                toast.success('Image uploaded successfully')
            } else {
                toast.error('Failed to upload image')
            }
        } catch (error) {
            console.error('Upload error:', error)
            toast.error('Failed to upload image')
        } finally {
            setUploading(prev => ({ ...prev, [bannerId]: false }))
        }
    }

    const handleRemove = (bannerId) => {
        setBanners(prev => ({ ...prev, [bannerId]: null }))
        setPreviews(prev => ({ ...prev, [bannerId]: null }))
        setImageDimensions(prev => ({ ...prev, [bannerId]: null }))
        if (fileInputRefs[bannerId].current) {
            fileInputRefs[bannerId].current.value = ''
        }
    }

    const handleSave = async () => {
        setSaving(true)
        try {
            await FirebaseFirestoreService.setDocument('settings', 'home', {
                banners,
                updatedAt: new Date().toISOString()
            })
            toast.success('Banners saved successfully!')
        } catch (error) {
            console.error('Save error:', error)
            toast.error('Failed to save banners')
        } finally {
            setSaving(false)
        }
    }

    return (
        <div className="p-6 max-w-6xl">
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h1 className="text-2xl font-semibold text-slate-800">Home Page Settings</h1>
                    <p className="text-slate-500 mt-1">Manage the banner images on your home page</p>
                </div>
                <button
                    onClick={handleSave}
                    disabled={saving}
                    className="flex items-center gap-2 bg-green-600 text-white px-6 py-2.5 rounded-lg hover:bg-green-700 disabled:opacity-50 transition"
                >
                    {saving ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />}
                    Save Changes
                </button>
            </div>

            {/* Banner Upload Cards */}
            <div className="grid gap-6">
                {BANNER_CONFIG.map((config) => (
                    <div key={config.id} className="bg-white border border-slate-200 rounded-xl p-6">
                        <div className="flex items-start justify-between mb-4">
                            <div>
                                <h3 className="font-medium text-slate-800">{config.label}</h3>
                                <p className="text-sm text-slate-500">{config.description}</p>
                                <div className="flex items-center gap-4 mt-2">
                                    <span className="text-xs bg-slate-100 text-slate-600 px-2 py-1 rounded">
                                        Recommended: {config.recommendedSize}
                                    </span>
                                    <span className="text-xs bg-slate-100 text-slate-600 px-2 py-1 rounded">
                                        Aspect Ratio: {config.aspectRatio}
                                    </span>
                                    {imageDimensions[config.id] && (
                                        <span className="text-xs bg-blue-100 text-blue-600 px-2 py-1 rounded">
                                            Current: {imageDimensions[config.id].width} x {imageDimensions[config.id].height} px
                                        </span>
                                    )}
                                </div>
                            </div>
                            {previews[config.id] && (
                                <button
                                    onClick={() => handleRemove(config.id)}
                                    className="text-slate-400 hover:text-red-500 transition"
                                >
                                    <X size={20} />
                                </button>
                            )}
                        </div>

                        <div className="flex gap-6">
                            {/* Upload Area */}
                            <div className="flex-1">
                                <input
                                    ref={fileInputRefs[config.id]}
                                    type="file"
                                    accept="image/*"
                                    onChange={(e) => handleFileSelect(config.id, e)}
                                    className="hidden"
                                />
                                
                                {previews[config.id] ? (
                                    <div className="relative group">
                                        <img
                                            src={previews[config.id]}
                                            alt={config.label}
                                            className="w-full h-48 object-cover rounded-lg border border-slate-200"
                                        />
                                        <div 
                                            onClick={() => fileInputRefs[config.id].current?.click()}
                                            className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 flex items-center justify-center rounded-lg cursor-pointer transition"
                                        >
                                            <span className="text-white text-sm">Click to change</span>
                                        </div>
                                        {uploading[config.id] && (
                                            <div className="absolute inset-0 bg-white/80 flex items-center justify-center rounded-lg">
                                                <Loader2 size={24} className="animate-spin text-green-600" />
                                            </div>
                                        )}
                                    </div>
                                ) : (
                                    <div
                                        onClick={() => fileInputRefs[config.id].current?.click()}
                                        className="w-full h-48 border-2 border-dashed border-slate-300 rounded-lg flex flex-col items-center justify-center cursor-pointer hover:border-green-500 hover:bg-green-50/50 transition"
                                    >
                                        {uploading[config.id] ? (
                                            <Loader2 size={32} className="animate-spin text-green-600" />
                                        ) : (
                                            <>
                                                <Upload size={32} className="text-slate-400 mb-2" />
                                                <p className="text-sm text-slate-500">Click to upload image</p>
                                                <p className="text-xs text-slate-400 mt-1">PNG, JPG, WebP</p>
                                            </>
                                        )}
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Live Preview Section */}
            <div className="mt-10">
                <h2 className="text-lg font-semibold text-slate-800 mb-4">Live Preview</h2>
                <div className="bg-slate-100 rounded-xl p-6">
                    <div className="flex max-lg:flex-col gap-6">
                        {/* Main Banner Preview */}
                        <div className="flex-1 bg-green-200 rounded-2xl h-64 flex items-center justify-center overflow-hidden">
                            {previews.main ? (
                                <img src={previews.main} alt="Main Banner" className="w-full h-full object-cover" />
                            ) : (
                                <div className="flex flex-col items-center text-green-600">
                                    <ImageIcon size={48} className="opacity-50" />
                                    <span className="text-sm mt-2">Main Banner</span>
                                </div>
                            )}
                        </div>
                        
                        {/* Right Side Banners */}
                        <div className="flex flex-col sm:flex-row lg:flex-col gap-4 lg:w-72">
                            <div className="flex-1 bg-orange-200 rounded-2xl h-28 flex items-center justify-center overflow-hidden">
                                {previews.top_right ? (
                                    <img src={previews.top_right} alt="Top Right Banner" className="w-full h-full object-cover" />
                                ) : (
                                    <div className="flex flex-col items-center text-orange-600">
                                        <ImageIcon size={32} className="opacity-50" />
                                        <span className="text-xs mt-1">Top Right</span>
                                    </div>
                                )}
                            </div>
                            <div className="flex-1 bg-blue-200 rounded-2xl h-28 flex items-center justify-center overflow-hidden">
                                {previews.bottom_right ? (
                                    <img src={previews.bottom_right} alt="Bottom Right Banner" className="w-full h-full object-cover" />
                                ) : (
                                    <div className="flex flex-col items-center text-blue-600">
                                        <ImageIcon size={32} className="opacity-50" />
                                        <span className="text-xs mt-1">Bottom Right</span>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
