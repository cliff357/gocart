'use client'

import { useState, useEffect, useRef } from 'react'
import { FirebaseFirestoreService } from '@/lib/firebase/firestore'

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

// Timeline Item Component with scroll animation
function TimelineItem({ item, index }) {
    const [isVisible, setIsVisible] = useState(false)
    const ref = useRef(null)

    useEffect(() => {
        const observer = new IntersectionObserver(
            ([entry]) => {
                if (entry.isIntersecting) {
                    setIsVisible(true)
                    observer.unobserve(entry.target)
                }
            },
            {
                threshold: 0.2,
                rootMargin: '0px 0px -50px 0px'
            }
        )

        if (ref.current) {
            observer.observe(ref.current)
        }

        return () => {
            if (ref.current) {
                observer.unobserve(ref.current)
            }
        }
    }, [])

    const isLeft = index % 2 === 0

    return (
        <div 
            ref={ref}
            className={`relative flex items-center ${isLeft ? 'flex-row' : 'flex-row-reverse'}`}
        >
            {/* Content */}
            <div 
                className={`w-5/12 ${isLeft ? 'text-right pr-8' : 'text-left pl-8'}`}
                style={{
                    opacity: isVisible ? 1 : 0,
                    transform: isVisible 
                        ? 'translateX(0)' 
                        : isLeft 
                            ? 'translateX(-60px)' 
                            : 'translateX(60px)',
                    transition: 'all 0.6s cubic-bezier(0.4, 0, 0.2, 1)',
                    transitionDelay: '0.1s'
                }}
            >
                <div className={`bg-white rounded-2xl p-6 shadow-sm border border-slate-100 hover:shadow-md transition-shadow ${isLeft ? 'ml-auto' : 'mr-auto'}`}>
                    <span className="text-sm text-[#9E4F1E] font-medium">{item.date}</span>
                    <h3 className="text-lg font-bold text-slate-800 mt-1">{item.title}</h3>
                    <p className="text-slate-500 text-sm mt-2">{item.description}</p>
                </div>
            </div>

            {/* Center Icon */}
            <div 
                className="absolute left-1/2 transform -translate-x-1/2 w-12 h-12 bg-[#9E4F1E] rounded-full flex items-center justify-center text-2xl shadow-lg z-10"
                style={{
                    opacity: isVisible ? 1 : 0,
                    transform: `translateX(-50%) scale(${isVisible ? 1 : 0.5})`,
                    transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
                    transitionDelay: '0.2s'
                }}
            >
                {item.icon}
            </div>

            {/* Empty Space */}
            <div className="w-5/12" />
        </div>
    )
}

export default function AboutPage() {
    const [timeline, setTimeline] = useState(DEFAULT_TIMELINE)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        loadTimeline()
    }, [])

    const loadTimeline = async () => {
        try {
            const result = await FirebaseFirestoreService.getDocument('settings', 'about')
            if (result.success && result.data?.timeline) {
                setTimeline(result.data.timeline)
            }
        } catch (error) {
            console.error('Error loading timeline:', error)
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="min-h-screen bg-[#f5f0e8]">
            {/* Hero Section */}
            <div className="py-20 px-6 text-center" style={{ backgroundColor: '#F6AD3C' }}>
                <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
                    老友賣蘿柚企劃
                </h1>
                <p className="text-white/90 text-lg max-w-2xl mx-auto font-semibold">
                    一個專注於本土手作同創意設計嘅平台
                </p>
            </div>

            {/* Timeline Section */}
            <div className="max-w-4xl mx-auto px-6 py-20">
                <h2 className="text-2xl font-bold text-slate-800 text-center mb-4">我哋嘅故事</h2>
                <p className="text-slate-500 text-center mb-16">由開始到依家，每一步都係珍貴嘅回憶</p>

                {/* Timeline */}
                <div className="relative">
                    {/* Vertical Line */}
                    <div className="absolute left-1/2 transform -translate-x-1/2 w-0.5 h-full bg-[#9E4F1E]/30" />

                    {/* Timeline Items */}
                    <div className="space-y-12">
                        {timeline.map((item, index) => (
                            <TimelineItem key={item.id} item={item} index={index} />
                        ))}
                    </div>

                    {/* End Dot */}
                    <div className="absolute left-1/2 transform -translate-x-1/2 -bottom-4 w-4 h-4 bg-[#9E4F1E] rounded-full" />
                </div>

                {/* More to come */}
                <p className="text-center text-slate-400 text-sm mt-16 italic">更多故事，陸續更新...</p>
            </div>

            {/* About Content */}
            <div className="py-20 px-6" style={{ backgroundColor: '#9E4F1E' }}>
                <div className="max-w-3xl mx-auto text-center text-white">
                    <h2 className="text-2xl font-bold mb-6">關於我哋</h2>
                    <p className="text-white/80 leading-relaxed mb-4">
                        LoyaultyClub（老友賣蘿柚企劃）係一個專注於本土手作同創意設計嘅平台。
                    </p>
                    <p className="text-white/80 leading-relaxed mb-4">
                        我哋致力將香港本地創作者嘅心血帶俾每一位支持者。每一件作品都承載住創作者嘅用心同故事。
                    </p>
                    <p className="text-white/80 leading-relaxed">
                        希望透過呢個平台，連結更多志同道合嘅朋友，一齊支持本地創作。
                    </p>
                </div>
            </div>
        </div>
    )
}
