'use client'
import { useState, useEffect } from "react";
import Link from "next/link";
import { categoryService } from '@/lib/services/FirestoreService';

const Footer = () => {

    const [categories, setCategories] = useState([]);

    useEffect(() => {
        const loadCategories = async () => {
            try {
                const cats = await categoryService.getAll();
                // 只取主分類（沒有 parentId 的）
                const mainCats = cats.filter(c => !c.parentId);
                setCategories(mainCats.slice(0, 4)); // 最多顯示 4 個
            } catch (err) {
                console.error('Failed to load categories for footer', err);
            }
        };
        loadCategories();
    }, []);

    const MailIcon = () => (<svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg"> <path d="M14.6654 4.66699L8.67136 8.48499C8.46796 8.60313 8.23692 8.66536 8.0017 8.66536C7.76647 8.66536 7.53544 8.60313 7.33203 8.48499L1.33203 4.66699M2.66536 2.66699H13.332C14.0684 2.66699 14.6654 3.26395 14.6654 4.00033V12.0003C14.6654 12.7367 14.0684 13.3337 13.332 13.3337H2.66536C1.92898 13.3337 1.33203 12.7367 1.33203 12.0003V4.00033C1.33203 3.26395 1.92898 2.66699 2.66536 2.66699Z" stroke="#90A1B9" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" /> </svg>)
    const MapPinIcon = () => (<svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg"> <path d="M13.3346 6.66634C13.3346 9.99501 9.64197 13.4617 8.40197 14.5323C8.28645 14.6192 8.14583 14.6662 8.0013 14.6662C7.85677 14.6662 7.71615 14.6192 7.60064 14.5323C6.36064 13.4617 2.66797 9.99501 2.66797 6.66634C2.66797 5.25185 3.22987 3.8953 4.23007 2.89511C5.23026 1.89491 6.58681 1.33301 8.0013 1.33301C9.41579 1.33301 10.7723 1.89491 11.7725 2.89511C12.7727 3.8953 13.3346 5.25185 13.3346 6.66634Z" stroke="#90A1B9" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" /> <path d="M8.0013 8.66634C9.10587 8.66634 10.0013 7.77091 10.0013 6.66634C10.0013 5.56177 9.10587 4.66634 8.0013 4.66634C6.89673 4.66634 6.0013 5.56177 6.0013 6.66634C6.0013 7.77091 6.89673 8.66634 8.0013 8.66634Z" stroke="#90A1B9" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" /> </svg>)

    // 動態生成 PRODUCTS 連結
    const productLinks = categories.map(cat => ({
        text: cat.name,
        path: `/shop?category=${encodeURIComponent(cat.name)}`,
        icon: null
    }));

    const linkSections = [
        {
            title: "PRODUCTS",
            links: productLinks.length > 0 ? productLinks : [
                { text: "載入中...", path: '/shop', icon: null }
            ]
        },
        {
            title: "WEBSITE",
            links: [
                { text: "Home", path: '/', icon: null },
                { text: "Privacy Policy", path: '/', icon: null },
            ]
        },
        {
            title: "CONTACT",
            links: [
                { text: "myloyau@gmail.com", path: 'mailto:myloyau@gmail.com', icon: MailIcon },
                { text: "D2 Place ONE 2/F The Space C40 ( Dec 24 - 28 13:00-20:00)", path: '/', icon: MapPinIcon }
            ]
        }
    ];

    return (
        <footer className="mx-6" style={{ backgroundColor: 'var(--color-background)' }}>
            <div className="max-w-7xl mx-auto">
                <div className="flex flex-col md:flex-row items-start justify-between gap-10 py-10 border-b border-slate-500/30" style={{ color: 'var(--color-text)' }}>
                    <div>
                        <p className="max-w-[410px] mt-6 text-sm">老友賣蘿柚企劃</p>
                    </div>
                    <div className="flex flex-wrap justify-between w-full md:w-[45%] gap-5 text-sm ">
                        {linkSections.map((section, index) => (
                            <div key={index}>
                                <h3 className="font-medium text-slate-700 md:mb-5 mb-3">{section.title}</h3>
                                <ul className="space-y-2.5">
                                    {section.links.map((link, i) => (
                                        <li key={i} className="flex items-center gap-2">
                                            {link.icon && <link.icon />}
                                            <Link href={link.path} className="hover:underline transition">{link.text}</Link>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        ))}
                    </div>
                </div>
                <p className="py-4 text-sm text-slate-500">
                    Copyright 2025 © LoyaultyClub All Right Reserved.
                </p>
            </div>
        </footer>
    );
};

export default Footer;