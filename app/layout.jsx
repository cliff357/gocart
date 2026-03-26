import { Outfit } from "next/font/google";
import { Toaster } from "react-hot-toast";
import { Analytics } from "@vercel/analytics/next";
import StoreProvider from "@/app/StoreProvider";
import FirebaseStatus from "@/components/FirebaseStatus";
import { AuthProvider } from "@/lib/context/AuthContext";
import "./globals.css";
// Initialize Firebase on app startup
import "@/lib/firebase/config";

const outfit = Outfit({ subsets: ["latin"], weight: ["400", "500", "600"] });

export const metadata = {
    title: "LoyaultyClub - 手作陶藝精品",
    description: "LoyaultyClub - 手工製作陶相架、陶盒子等精美陶藝產品",
    icons: {
        icon: [
            { url: '/favicon.ico', sizes: 'any' },
            { url: '/favicon-16x16.png', sizes: '16x16', type: 'image/png' },
            { url: '/favicon-32x32.png', sizes: '32x32', type: 'image/png' },
            { url: '/icon-192.png', sizes: '192x192', type: 'image/png' },
            { url: '/icon-512.png', sizes: '512x512', type: 'image/png' },
        ],
        shortcut: '/favicon.ico',
        apple: '/apple-touch-icon.png',
    },
    manifest: '/manifest.json',
};

export default function RootLayout({ children }) {
    return (
        <html lang="en">
            <head>
                <link rel="icon" href="/favicon.ico" sizes="any" />
                <link rel="icon" href="/favicon-32x32.png" type="image/png" sizes="32x32" />
                <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
                <link rel="manifest" href="/manifest.json" />
            </head>
            <body className={`${outfit.className} antialiased`}>
                <AuthProvider>
                    <StoreProvider>
                        <Toaster />
                        {children}
                        <FirebaseStatus />
                    </StoreProvider>
                </AuthProvider>
                {process.env.NODE_ENV === 'production' && <Analytics />}
            </body>
        </html>
    );
}
