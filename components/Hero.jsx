'use client'
import React, { useState, useEffect } from 'react'
import { FirebaseFirestoreService } from '@/lib/firebase/firestore'

const Hero = () => {

    const [banner, setBanner] = useState(null)
    const [position, setPosition] = useState({ x: 50, y: 50 })

    useEffect(() => {
        loadBanner()
    }, [])

    const loadBanner = async () => {
        try {
            const result = await FirebaseFirestoreService.getDocument('settings', 'home')
            if (result.success && result.data) {
                if (result.data.banners?.main) {
                    setBanner(result.data.banners.main)
                }
                if (result.data.positions?.main) {
                    setPosition(result.data.positions.main)
                }
            }
        } catch (error) {
            console.error('Error loading banner:', error)
        }
    }

    return (
        <div className='mx-6'>
            <div className='max-w-7xl mx-auto my-10'>
                <div className='relative w-full bg-slate-100 rounded-3xl overflow-hidden' style={{ minHeight: '400px' }}>
                    {banner && (
                        <img 
                            src={banner} 
                            alt="Banner" 
                            className="absolute inset-0 w-full h-full object-cover" 
                            style={{ objectPosition: `${position.x}% ${position.y}%` }} 
                        />
                    )}
                </div>
            </div>
        </div>
    )
}

export default Hero