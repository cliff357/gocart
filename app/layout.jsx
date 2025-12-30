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
            { url: '/icon.svg', type: 'image/svg+xml' },
            { url: '/favicon.svg', type: 'image/svg+xml' }
        ],
        shortcut: '/favicon.svg',
        apple: '/icon.svg',
    },
};

export default function RootLayout({ children }) {
    return (
        <html lang="en">
            <head>
                <link rel="icon" href="/icon.svg" type="image/svg+xml" />
                <link rel="alternate icon" href="/favicon.svg" type="image/svg+xml" />
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
