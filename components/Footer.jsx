'use client'
import { useState, useEffect } from "react";
import Link from "next/link";
import { categoryService } from '@/lib/services/FirestoreService';

const Footer = () => {

    const [categories, setCategories] = useState([]);
    const [email, setEmail] = useState('');

    useEffect(() => {
        const loadCategories = async () => {
            try {
                const cats = await categoryService.getAll();
                const mainCats = cats.filter(c => !c.parentId);
                setCategories(mainCats.slice(0, 4));
            } catch (err) {
                console.error('Failed to load categories for footer', err);
            }
        };
        loadCategories();
    }, []);

    const handleSubscribe = (e) => {
        e.preventDefault();
        // TODO: Add newsletter subscription logic
        alert('感謝訂閱！');
        setEmail('');
    };

    return (
        <footer className="text-white" style={{ backgroundColor: '#9E4F1E' }}>
            {/* Main Footer Content */}
            <div className="max-w-7xl mx-auto px-6 py-16">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
                    
                    {/* About Section */}
                    <div className="lg:col-span-2">
                        <h3 className="text-lg font-bold mb-4 tracking-wider">ABOUT LOYAULTYCLUB</h3>
                        <p className="text-white/70 text-sm leading-relaxed max-w-md">
                            老友賣蘿柚企劃 — 一個專注於本土手作同創意設計嘅平台。我哋致力將香港本地創作者嘅心血帶俾每一位支持者。
                        </p>
                    </div>

                    {/* Links Section */}
                    <div>
                        <h3 className="text-lg font-bold mb-4 tracking-wider">QUICK LINKS</h3>
                        <ul className="space-y-2 text-sm text-white/70">
                            <li><Link href="/" className="hover:text-white transition">Home</Link></li>
                            <li><Link href="/shop" className="hover:text-white transition">Shop</Link></li>
                            <li><Link href="/contact" className="hover:text-white transition">Contact</Link></li>
                            <li><Link href="/about" className="hover:text-white transition">About</Link></li>
                        </ul>
                    </div>
                </div>

                {/* Social Media Icons */}
                <div className="flex items-center gap-6 mt-12 pt-8 border-t border-white/20">
                    <a href="https://www.instagram.com/loyaultyclub?igsh=cTc4dWdjdzNqMmt1" target="_blank" rel="noopener noreferrer" className="text-white/70 hover:text-white transition">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect>
                            <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path>
                            <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line>
                        </svg>
                    </a>
                    <a href="https://www.threads.com/@loyaultyclub?igshid=NTc4MTIwNjQ2YQ==" target="_blank" rel="noopener noreferrer" className="text-white/70 hover:text-white transition">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                            <path d="M12.186 24h-.007c-3.581-.024-6.334-1.205-8.184-3.509C2.35 18.44 1.5 15.586 1.472 12.01v-.017c.03-3.579.879-6.43 2.525-8.482C5.845 1.205 8.6.024 12.18 0h.014c2.746.02 5.043.725 6.826 2.098 1.677 1.29 2.858 3.13 3.509 5.467l-2.04.569c-1.104-3.96-3.898-5.984-8.304-6.015-2.91.022-5.11.936-6.54 2.717C4.307 6.504 3.616 8.914 3.589 12c.027 3.086.718 5.496 2.057 7.164 1.43 1.783 3.631 2.698 6.54 2.717 2.623-.02 4.358-.631 5.8-2.045 1.647-1.613 1.618-3.593 1.09-4.798-.31-.71-.873-1.3-1.634-1.75-.192 1.352-.622 2.446-1.284 3.272-.886 1.102-2.14 1.704-3.73 1.79-1.202.065-2.361-.218-3.259-.801-1.063-.689-1.685-1.74-1.752-2.96-.065-1.17.408-2.253 1.332-3.05.857-.74 2.063-1.201 3.49-1.334.987-.092 1.942-.04 2.853.157-.092-.627-.262-1.2-.51-1.714-.417-.86-1.087-1.467-1.99-1.802-.94-.35-2.093-.39-3.43-.12l-.458-1.976c1.677-.334 3.156-.275 4.394.177 1.253.457 2.194 1.304 2.798 2.52.388.783.642 1.7.762 2.747 1.068.353 1.996.883 2.755 1.603 1.19 1.127 1.835 2.603 1.868 4.27.034 1.747-.548 3.408-1.682 4.805-1.4 1.725-3.612 2.805-6.587 3.212-.52.071-1.054.107-1.6.11zm-.982-7.166c.108.022.22.04.336.052.939.094 1.715-.043 2.31-.409.587-.36.958-.926 1.102-1.682.137-.713.06-1.478-.23-2.279-.453.066-.913.17-1.383.315-.864.265-1.571.648-2.047 1.106-.51.491-.715 1.053-.684 1.633.02.323.123.59.308.806.188.22.442.376.764.464l.006-.003-.482-.003z"/>
                        </svg>
                    </a>
                    <a href="mailto:loyaultyclub@gmail.com" className="text-white/70 hover:text-white transition">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path>
                            <polyline points="22,6 12,13 2,6"></polyline>
                        </svg>
                    </a>
                </div>
            </div>

            {/* Bottom Bar */}
            <div className="border-t border-white/20">
                <div className="max-w-7xl mx-auto px-6 py-4">
                    <p className="text-white/50 text-xs text-center">
                        © 2025 LOYAULTYCLUB. All Rights Reserved.
                    </p>
                </div>
            </div>
        </footer>
    );
};

export default Footer;