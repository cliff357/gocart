'use client'

import { Mail, MapPin, Instagram } from 'lucide-react'

export default function ContactPage() {
    return (
        <div className="min-h-[60vh] flex items-center justify-center">
            <div className="text-center">
                <h1 className="text-3xl font-semibold text-slate-800 mb-8">CONTACT</h1>
                
                <div className="flex flex-col gap-4 text-slate-600">
                    <a href="mailto:loyaultyclub@gmail.com" className="flex items-center justify-center gap-3 hover:text-slate-800 transition">
                        <Mail size={20} className="text-slate-400" />
                        <span>loyaultyclub@gmail.com</span>
                    </a>
                    
                    <div className="flex items-center justify-center gap-3">
                        <MapPin size={20} className="text-slate-400" />
                        <span>D2 Place ONE 2/F The Space C40 ( Dec 24 - 28 13:00-20:00)</span>
                    </div>

                    <a href="https://www.instagram.com/loyaultyclub?igsh=cTc4dWdjdzNqMmt1" target="_blank" rel="noopener noreferrer" className="flex items-center justify-center gap-3 hover:text-slate-800 transition">
                        <Instagram size={20} className="text-slate-400" />
                        <span>@loyaultyclub</span>
                    </a>

                    <a href="https://www.threads.com/@loyaultyclub?igshid=NTc4MTIwNjQ2YQ==" target="_blank" rel="noopener noreferrer" className="flex items-center justify-center gap-3 hover:text-slate-800 transition">
                        <svg className="text-slate-400" width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                            <path d="M12.186 24h-.007c-3.581-.024-6.334-1.205-8.184-3.509C2.35 18.44 1.5 15.586 1.472 12.01v-.017c.03-3.579.879-6.43 2.525-8.482C5.845 1.205 8.6.024 12.18 0h.014c2.746.02 5.043.725 6.826 2.098 1.677 1.29 2.858 3.13 3.509 5.467l-2.04.569c-1.104-3.96-3.898-5.984-8.304-6.015-2.91.022-5.11.936-6.54 2.717C4.307 6.504 3.616 8.914 3.589 12c.027 3.086.718 5.496 2.057 7.164 1.43 1.783 3.631 2.698 6.54 2.717 2.623-.02 4.358-.631 5.8-2.045 1.647-1.613 1.618-3.593 1.09-4.798-.31-.71-.873-1.3-1.634-1.75-.192 1.352-.622 2.446-1.284 3.272-.886 1.102-2.14 1.704-3.73 1.79-1.202.065-2.361-.218-3.259-.801-1.063-.689-1.685-1.74-1.752-2.96-.065-1.17.408-2.253 1.332-3.05.857-.74 2.063-1.201 3.49-1.334.987-.092 1.942-.04 2.853.157-.092-.627-.262-1.2-.51-1.714-.417-.86-1.087-1.467-1.99-1.802-.94-.35-2.093-.39-3.43-.12l-.458-1.976c1.677-.334 3.156-.275 4.394.177 1.253.457 2.194 1.304 2.798 2.52.388.783.642 1.7.762 2.747 1.068.353 1.996.883 2.755 1.603 1.19 1.127 1.835 2.603 1.868 4.27.034 1.747-.548 3.408-1.682 4.805-1.4 1.725-3.612 2.805-6.587 3.212-.52.071-1.054.107-1.6.11zm-.982-7.166c.108.022.22.04.336.052.939.094 1.715-.043 2.31-.409.587-.36.958-.926 1.102-1.682.137-.713.06-1.478-.23-2.279-.453.066-.913.17-1.383.315-.864.265-1.571.648-2.047 1.106-.51.491-.715 1.053-.684 1.633.02.323.123.59.308.806.188.22.442.376.764.464l.006-.003-.482-.003z"/>
                        </svg>
                        <span>@loyaultyclub</span>
                    </a>
                </div>
            </div>
        </div>
    )
}
