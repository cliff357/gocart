'use client'

import { useState, useEffect } from 'react'
import { FirebaseFirestoreService } from '@/lib/firebase/firestore'

const AboutSection = () => {
    const [mediaUrl, setMediaUrl] = useState('/about_us.mov')
    const [mediaType, setMediaType] = useState('video')

    useEffect(() => {
        loadAboutMedia()
    }, [])

    const loadAboutMedia = async () => {
        try {
            const result = await FirebaseFirestoreService.getDocument('settings', 'home')
            if (result.success && result.data?.aboutMedia) {
                setMediaUrl(result.data.aboutMedia.url)
                setMediaType(result.data.aboutMedia.type)
            }
        } catch (error) {
            console.error('Error loading about media:', error)
        }
    }

    const renderMedia = () => {
        if (mediaType === 'video') {
            return (
                <video 
                    src={mediaUrl}
                    autoPlay 
                    loop 
                    muted 
                    playsInline
                    className="w-full h-full object-cover"
                />
            )
        } else {
            return (
                <img 
                    src={mediaUrl}
                    alt="About LoyaultyClub"
                    className="w-full h-full object-cover"
                />
            )
        }
    }

    return (
        <section className="py-20 px-6" style={{ backgroundColor: '#F6AD3C' }}>
            <div className="max-w-7xl mx-auto">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
                    {/* Left - Media (Video/GIF/Image) */}
                    <div className="aspect-square rounded-lg overflow-hidden bg-black">
                        {renderMedia()}
                    </div>

                    {/* Right - About Content */}
                    <div className="space-y-6">
                        <p className="text-sm tracking-widest text-white uppercase">About LoyaultyClub</p>
                        <h2 className="text-3xl md:text-4xl font-bold text-white leading-tight">
                            老友賣蘿柚企劃
                        </h2>
                        <p className="text-white leading-relaxed font-semibold">
                            一個專注於本土手作同創意設計嘅平台。我哋致力將香港本地創作者嘅心血帶俾每一位支持者。
                        </p>
                        <p className="text-white leading-relaxed font-semibold">
                            每一件作品都承載住創作者嘅用心同故事，我哋希望透過呢個平台，連結更多志同道合嘅朋友，一齊支持本地創作。
                        </p>
                    </div>
                </div>
            </div>
        </section>
    )
}

export default AboutSection
