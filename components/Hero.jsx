'use client'
import React, { useState, useEffect } from 'react'
import CategoriesMarquee from './CategoriesMarquee'
import { FirebaseFirestoreService } from '@/lib/firebase/firestore'

const Hero = () => {

    const [banners, setBanners] = useState({
        main: null,
        top_right: null,
        bottom_right: null
    })
    const [positions, setPositions] = useState({
        main: { x: 50, y: 50 },
        top_right: { x: 50, y: 50 },
        bottom_right: { x: 50, y: 50 }
    })

    useEffect(() => {
        loadBanners()
    }, [])

    const loadBanners = async () => {
        try {
            const result = await FirebaseFirestoreService.getDocument('settings', 'home')
            if (result.success && result.data) {
                if (result.data.banners) {
                    setBanners(result.data.banners)
                }
                if (result.data.positions) {
                    setPositions(prev => ({ ...prev, ...result.data.positions }))
                }
            }
        } catch (error) {
            console.error('Error loading banners:', error)
        }
    }

    return (
        <div className='mx-6'>
            <div className='flex max-xl:flex-col gap-8 max-w-7xl mx-auto my-10'>
                <div className='relative flex-1 flex flex-col bg-slate-100 rounded-3xl xl:min-h-100 group overflow-hidden'>
                    {banners.main && (
                        <img src={banners.main} alt="Main Banner" className="absolute inset-0 w-full h-full object-cover" style={{ objectPosition: `${positions.main.x}% ${positions.main.y}%` }} />
                    )}
                </div>
                <div className='flex flex-col md:flex-row xl:flex-col gap-5 w-full xl:max-w-sm text-sm text-slate-600'>
                    <div className='flex-1 flex items-center justify-between w-full bg-slate-100 rounded-3xl p-6 px-8 group overflow-hidden relative min-h-32'>
                        {banners.top_right && (
                            <img src={banners.top_right} alt="Top Right Banner" className="absolute inset-0 w-full h-full object-cover" style={{ objectPosition: `${positions.top_right.x}% ${positions.top_right.y}%` }} />
                        )}
                    </div>
                    <div className='flex-1 flex items-center justify-between w-full bg-slate-100 rounded-3xl p-6 px-8 group overflow-hidden relative min-h-32'>
                        {banners.bottom_right && (
                            <img src={banners.bottom_right} alt="Bottom Right Banner" className="absolute inset-0 w-full h-full object-cover" style={{ objectPosition: `${positions.bottom_right.x}% ${positions.bottom_right.y}%` }} />
                        )}
                    </div>
                </div>
            </div>
            <CategoriesMarquee />
        </div>

    )
}

export default Hero