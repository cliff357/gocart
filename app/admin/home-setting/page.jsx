'use client'

import { useState, useEffect, useRef } from 'react'
import { Upload, X, ImageIcon, Save, Loader2, Move, Film } from 'lucide-react'
import { FirebaseStorageService } from '@/lib/firebase/storage'
import { FirebaseFirestoreService } from '@/lib/firebase/firestore'
import toast from 'react-hot-toast'

export default function HomeSettingPage() {
    // Main Banner State
    const [mainBanner, setMainBanner] = useState(null)
    const [mainBannerPreview, setMainBannerPreview] = useState(null)
    const [mainBannerPosition, setMainBannerPosition] = useState({ x: 50, y: 50 })
    const [mainBannerUploading, setMainBannerUploading] = useState(false)
    const [mainBannerDimensions, setMainBannerDimensions] = useState(null)
    const mainBannerInputRef = useRef(null)

    // About Section Media State
    const [aboutMedia, setAboutMedia] = useState(null)
    const [aboutMediaPreview, setAboutMediaPreview] = useState(null)
    const [aboutMediaType, setAboutMediaType] = useState(null) // 'image', 'video', 'gif'
    const [aboutMediaUploading, setAboutMediaUploading] = useState(false)
    const aboutMediaInputRef = useRef(null)

    const [saving, setSaving] = useState(false)

    // Load existing data on mount
    useEffect(() => {
        loadSettings()
    }, [])

    const loadSettings = async () => {
        try {
            const result = await FirebaseFirestoreService.getDocument('settings', 'home')
            if (result.success && result.data) {
                // Load main banner
                if (result.data.banners?.main) {
                    setMainBanner(result.data.banners.main)
                    setMainBannerPreview(result.data.banners.main)
                }
                if (result.data.positions?.main) {
                    setMainBannerPosition(result.data.positions.main)
                }
                // Load about media
                if (result.data.aboutMedia) {
                    setAboutMedia(result.data.aboutMedia.url)
                    setAboutMediaPreview(result.data.aboutMedia.url)
                    setAboutMediaType(result.data.aboutMedia.type)
                }
            }
        } catch (error) {
            console.error('Error loading settings:', error)
        }
    }

    const handleMainBannerPositionChange = (axis, value) => {
        setMainBannerPosition(prev => ({
            ...prev,
            [axis]: parseInt(value)
        }))
    }

    const handleMainBannerSelect = async (event) => {
        const file = event.target.files?.[0]
        if (!file) return

        if (!file.type.startsWith('image/')) {
            toast.error('Please select an image file')
            return
        }

        const reader = new FileReader()
        reader.onload = (e) => {
            const img = new window.Image()
            img.onload = () => {
                setMainBannerDimensions({ width: img.width, height: img.height })
            }
            img.src = e.target.result
            setMainBannerPreview(e.target.result)
        }
        reader.readAsDataURL(file)

        setMainBannerUploading(true)
        try {
            const result = await FirebaseStorageService.uploadFile(
                file,
                'banners',
                `main_${Date.now()}.${file.name.split('.').pop()}`
            )
            
            if (result.success) {
                setMainBanner(result.url)
                toast.success('Main banner uploaded successfully')
            } else {
                toast.error('Failed to upload main banner')
            }
        } catch (error) {
            console.error('Upload error:', error)
            toast.error('Failed to upload main banner')
        } finally {
            setMainBannerUploading(false)
        }
    }

    const handleAboutMediaSelect = async (event) => {
        const file = event.target.files?.[0]
        if (!file) return

        // Determine file type
        let mediaType = null
        if (file.type.startsWith('video/')) {
            mediaType = 'video'
        } else if (file.type === 'image/gif') {
            mediaType = 'gif'
        } else if (file.type.startsWith('image/')) {
            mediaType = 'image'
        } else {
            toast.error('Please select an image, GIF, or video file')
            return
        }

        // Create preview
        const reader = new FileReader()
        reader.onload = (e) => {
            setAboutMediaPreview(e.target.result)
            setAboutMediaType(mediaType)
        }
        reader.readAsDataURL(file)

        setAboutMediaUploading(true)
        try {
            const result = await FirebaseStorageService.uploadFile(
                file,
                'about',
                `about_media_${Date.now()}.${file.name.split('.').pop()}`
            )
            
            if (result.success) {
                setAboutMedia(result.url)
                toast.success('About section media uploaded successfully')
            } else {
                toast.error('Failed to upload media')
            }
        } catch (error) {
            console.error('Upload error:', error)
            toast.error('Failed to upload media')
        } finally {
            setAboutMediaUploading(false)
        }
    }

    const handleRemoveMainBanner = () => {
        setMainBanner(null)
        setMainBannerPreview(null)
        setMainBannerDimensions(null)
        setMainBannerPosition({ x: 50, y: 50 })
        if (mainBannerInputRef.current) {
            mainBannerInputRef.current.value = ''
        }
    }

    const handleRemoveAboutMedia = () => {
        setAboutMedia(null)
        setAboutMediaPreview(null)
        setAboutMediaType(null)
        if (aboutMediaInputRef.current) {
            aboutMediaInputRef.current.value = ''
        }
    }

    const handleSave = async () => {
        setSaving(true)
        try {
            await FirebaseFirestoreService.setDocument('settings', 'home', {
                banners: {
                    main: mainBanner
                },
                positions: {
                    main: mainBannerPosition
                },
                aboutMedia: aboutMedia ? {
                    url: aboutMedia,
                    type: aboutMediaType
                } : null,
                updatedAt: new Date().toISOString()
            })
            toast.success('Settings saved successfully!')
        } catch (error) {
            console.error('Save error:', error)
            toast.error('Failed to save settings')
        } finally {
            setSaving(false)
        }
    }

    const renderAboutMediaPreview = () => {
        if (!aboutMediaPreview) return null

        if (aboutMediaType === 'video') {
            return (
                <video
                    src={aboutMediaPreview}
                    autoPlay
                    loop
                    muted
                    playsInline
                    className="w-full h-48 object-cover rounded-lg border border-slate-200"
                />
            )
        } else {
            return (
                <img
                    src={aboutMediaPreview}
                    alt="About Section Media"
                    className="w-full h-48 object-cover rounded-lg border border-slate-200"
                />
            )
        }
    }

    return (
        <div className="p-6 max-w-6xl">
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h1 className="text-2xl font-semibold text-slate-800">Home Page Settings</h1>
                    <p className="text-slate-500 mt-1">Manage the main banner and about section media</p>
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

            {/* Main Banner Section */}
            <div className="bg-white border border-slate-200 rounded-xl p-6 mb-6">
                <div className="flex items-start justify-between mb-4">
                    <div>
                        <h3 className="font-medium text-slate-800">Main Banner</h3>
                        <p className="text-sm text-slate-500">The large banner image on the home page hero section</p>
                        <div className="flex items-center gap-4 mt-2">
                            <span className="text-xs bg-slate-100 text-slate-600 px-2 py-1 rounded">
                                Recommended: 1920 x 800 px
                            </span>
                            <span className="text-xs bg-blue-100 text-blue-600 px-2 py-1 rounded">
                                Accepts: PNG, JPG, WebP
                            </span>
                            {mainBannerDimensions && (
                                <span className="text-xs bg-green-100 text-green-600 px-2 py-1 rounded">
                                    Current: {mainBannerDimensions.width} x {mainBannerDimensions.height} px
                                </span>
                            )}
                        </div>
                    </div>
                    {mainBannerPreview && (
                        <button
                            onClick={handleRemoveMainBanner}
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
                            ref={mainBannerInputRef}
                            type="file"
                            accept="image/*"
                            onChange={handleMainBannerSelect}
                            className="hidden"
                        />
                        
                        {mainBannerPreview ? (
                            <div className="relative group">
                                <img
                                    src={mainBannerPreview}
                                    alt="Main Banner"
                                    className="w-full h-48 object-cover rounded-lg border border-slate-200"
                                    style={{ objectPosition: `${mainBannerPosition.x}% ${mainBannerPosition.y}%` }}
                                />
                                <div 
                                    onClick={() => mainBannerInputRef.current?.click()}
                                    className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 flex items-center justify-center rounded-lg cursor-pointer transition"
                                >
                                    <span className="text-white text-sm">Click to change</span>
                                </div>
                                {mainBannerUploading && (
                                    <div className="absolute inset-0 bg-white/80 flex items-center justify-center rounded-lg">
                                        <Loader2 size={24} className="animate-spin text-green-600" />
                                    </div>
                                )}
                            </div>
                        ) : (
                            <div
                                onClick={() => mainBannerInputRef.current?.click()}
                                className="w-full h-48 border-2 border-dashed border-slate-300 rounded-lg flex flex-col items-center justify-center cursor-pointer hover:border-green-500 hover:bg-green-50/50 transition"
                            >
                                {mainBannerUploading ? (
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

                    {/* Position Controls */}
                    {mainBannerPreview && (
                        <div className="w-48 flex flex-col gap-4">
                            <div className="flex items-center gap-2">
                                <Move size={16} className="text-slate-400" />
                                <span className="text-sm text-slate-600 font-medium">Adjust Position</span>
                            </div>
                            <div>
                                <label className="text-xs text-slate-500 mb-1 block">
                                    Horizontal: {mainBannerPosition.x}%
                                </label>
                                <input
                                    type="range"
                                    min="0"
                                    max="100"
                                    value={mainBannerPosition.x}
                                    onChange={(e) => handleMainBannerPositionChange('x', e.target.value)}
                                    className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-green-600"
                                />
                                <div className="flex justify-between text-xs text-slate-400 mt-1">
                                    <span>Left</span>
                                    <span>Right</span>
                                </div>
                            </div>
                            <div>
                                <label className="text-xs text-slate-500 mb-1 block">
                                    Vertical: {mainBannerPosition.y}%
                                </label>
                                <input
                                    type="range"
                                    min="0"
                                    max="100"
                                    value={mainBannerPosition.y}
                                    onChange={(e) => handleMainBannerPositionChange('y', e.target.value)}
                                    className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-green-600"
                                />
                                <div className="flex justify-between text-xs text-slate-400 mt-1">
                                    <span>Top</span>
                                    <span>Bottom</span>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* About Section Media */}
            <div className="bg-white border border-slate-200 rounded-xl p-6">
                <div className="flex items-start justify-between mb-4">
                    <div>
                        <h3 className="font-medium text-slate-800">About LoyaultyClub - Media</h3>
                        <p className="text-sm text-slate-500">The video, image, or GIF shown in the About section</p>
                        <div className="flex items-center gap-4 mt-2">
                            <span className="text-xs bg-slate-100 text-slate-600 px-2 py-1 rounded">
                                Recommended: Square ratio
                            </span>
                            <span className="text-xs bg-purple-100 text-purple-600 px-2 py-1 rounded flex items-center gap-1">
                                <Film size={12} />
                                Accepts: Video (MP4, MOV), GIF, Images
                            </span>
                            {aboutMediaType && (
                                <span className="text-xs bg-green-100 text-green-600 px-2 py-1 rounded">
                                    Current type: {aboutMediaType.toUpperCase()}
                                </span>
                            )}
                        </div>
                    </div>
                    {aboutMediaPreview && (
                        <button
                            onClick={handleRemoveAboutMedia}
                            className="text-slate-400 hover:text-red-500 transition"
                        >
                            <X size={20} />
                        </button>
                    )}
                </div>

                <div className="flex-1">
                    <input
                        ref={aboutMediaInputRef}
                        type="file"
                        accept="image/*,video/*"
                        onChange={handleAboutMediaSelect}
                        className="hidden"
                    />
                    
                    {aboutMediaPreview ? (
                        <div className="relative group">
                            {renderAboutMediaPreview()}
                            <div 
                                onClick={() => aboutMediaInputRef.current?.click()}
                                className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 flex items-center justify-center rounded-lg cursor-pointer transition"
                            >
                                <span className="text-white text-sm">Click to change</span>
                            </div>
                            {aboutMediaUploading && (
                                <div className="absolute inset-0 bg-white/80 flex items-center justify-center rounded-lg">
                                    <Loader2 size={24} className="animate-spin text-green-600" />
                                </div>
                            )}
                        </div>
                    ) : (
                        <div
                            onClick={() => aboutMediaInputRef.current?.click()}
                            className="w-full h-48 border-2 border-dashed border-slate-300 rounded-lg flex flex-col items-center justify-center cursor-pointer hover:border-purple-500 hover:bg-purple-50/50 transition"
                        >
                            {aboutMediaUploading ? (
                                <Loader2 size={32} className="animate-spin text-purple-600" />
                            ) : (
                                <>
                                    <Film size={32} className="text-slate-400 mb-2" />
                                    <p className="text-sm text-slate-500">Click to upload video, GIF, or image</p>
                                    <p className="text-xs text-slate-400 mt-1">MP4, MOV, GIF, PNG, JPG, WebP</p>
                                </>
                            )}
                        </div>
                    )}
                </div>
            </div>

            {/* Live Preview Section */}
            <div className="mt-10">
                <h2 className="text-lg font-semibold text-slate-800 mb-4">Live Preview</h2>
                
                {/* Main Banner Preview */}
                <div className="bg-slate-100 rounded-xl p-6 mb-6">
                    <h3 className="text-sm font-medium text-slate-600 mb-3">Main Banner</h3>
                    <div className="bg-slate-200 rounded-2xl h-64 flex items-center justify-center overflow-hidden">
                        {mainBannerPreview ? (
                            <img 
                                src={mainBannerPreview} 
                                alt="Main Banner" 
                                className="w-full h-full object-cover" 
                                style={{ objectPosition: `${mainBannerPosition.x}% ${mainBannerPosition.y}%` }} 
                            />
                        ) : (
                            <div className="flex flex-col items-center text-slate-400">
                                <ImageIcon size={48} className="opacity-50" />
                                <span className="text-sm mt-2">Main Banner</span>
                            </div>
                        )}
                    </div>
                </div>

                {/* About Section Preview */}
                <div className="bg-slate-100 rounded-xl p-6">
                    <h3 className="text-sm font-medium text-slate-600 mb-3">About LoyaultyClub Section</h3>
                    <div className="flex gap-6 items-center rounded-2xl p-6" style={{ backgroundColor: '#F6AD3C' }}>
                        <div className="w-48 h-48 bg-black rounded-lg overflow-hidden flex-shrink-0">
                            {aboutMediaPreview ? (
                                aboutMediaType === 'video' ? (
                                    <video
                                        src={aboutMediaPreview}
                                        autoPlay
                                        loop
                                        muted
                                        playsInline
                                        className="w-full h-full object-cover"
                                    />
                                ) : (
                                    <img
                                        src={aboutMediaPreview}
                                        alt="About Media"
                                        className="w-full h-full object-cover"
                                    />
                                )
                            ) : (
                                <div className="w-full h-full flex items-center justify-center text-slate-400">
                                    <Film size={32} />
                                </div>
                            )}
                        </div>
                        <div className="text-white">
                            <p className="text-xs uppercase tracking-widest mb-2">About LoyaultyClub</p>
                            <h3 className="text-2xl font-bold mb-3">老友賣蘿柚企劃</h3>
                            <p className="text-sm font-semibold opacity-90">一個專注於本土手作同創意設計嘅平台...</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
