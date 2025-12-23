'use client'

import { Mail, MapPin } from 'lucide-react'

export default function ContactPage() {
    return (
        <div className="min-h-[60vh] flex items-center justify-center">
            <div className="text-center">
                <h1 className="text-3xl font-semibold text-slate-800 mb-8">CONTACT</h1>
                
                <div className="flex flex-col gap-4 text-slate-600">
                    <a href="mailto:myloyau@gmail.com" className="flex items-center justify-center gap-3 hover:text-slate-800 transition">
                        <Mail size={20} className="text-slate-400" />
                        <span>myloyau@gmail.com</span>
                    </a>
                    
                    <div className="flex items-center justify-center gap-3">
                        <MapPin size={20} className="text-slate-400" />
                        <span>D2 Place ONE 2/F The Space C40 ( Dec 24 - 28 13:00-20:00)</span>
                    </div>
                </div>
            </div>
        </div>
    )
}
