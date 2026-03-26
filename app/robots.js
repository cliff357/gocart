/**
 * Robots.txt for SEO
 */

export default function robots() {
    return {
        rules: [
            {
                userAgent: '*',
                allow: '/',
                disallow: ['/admin/', '/api/'],
            },
        ],
        sitemap: 'https://www.loyaultyclub.com/sitemap.xml',
    };
}
