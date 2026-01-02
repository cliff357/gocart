/**
 * Dynamic Sitemap for Google Search Console
 * 自動生成 sitemap.xml
 */

import { db } from '@/lib/firebase/config';
import { collection, getDocs } from 'firebase/firestore';

const BASE_URL = 'https://www.loyaultyclub.com';

export default async function sitemap() {
    // Static pages
    const staticPages = [
        {
            url: BASE_URL,
            lastModified: new Date(),
            changeFrequency: 'daily',
            priority: 1,
        },
        {
            url: `${BASE_URL}/shop`,
            lastModified: new Date(),
            changeFrequency: 'daily',
            priority: 0.9,
        },
        {
            url: `${BASE_URL}/about`,
            lastModified: new Date(),
            changeFrequency: 'monthly',
            priority: 0.7,
        },
        {
            url: `${BASE_URL}/privacy-policy`,
            lastModified: new Date(),
            changeFrequency: 'yearly',
            priority: 0.3,
        },
        {
            url: `${BASE_URL}/terms-of-service`,
            lastModified: new Date(),
            changeFrequency: 'yearly',
            priority: 0.3,
        },
    ];

    // Dynamic product pages
    let productPages = [];
    try {
        const productsSnapshot = await getDocs(collection(db, 'products'));
        productPages = productsSnapshot.docs.map((doc) => {
            const data = doc.data();
            return {
                url: `${BASE_URL}/product/${doc.id}`,
                lastModified: data.updatedAt?.toDate?.() || new Date(),
                changeFrequency: 'weekly',
                priority: 0.8,
            };
        });
    } catch (error) {
        console.error('Failed to fetch products for sitemap:', error);
    }

    // Dynamic category pages
    let categoryPages = [];
    try {
        const categoriesSnapshot = await getDocs(collection(db, 'categories'));
        categoryPages = categoriesSnapshot.docs
            .filter(doc => !doc.data().parentId) // Only main categories
            .map((doc) => ({
                url: `${BASE_URL}/shop?category=${doc.id}`,
                lastModified: new Date(),
                changeFrequency: 'weekly',
                priority: 0.7,
            }));
    } catch (error) {
        console.error('Failed to fetch categories for sitemap:', error);
    }

    return [...staticPages, ...productPages, ...categoryPages];
}
