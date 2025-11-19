import { Outfit } from "next/font/google";
import { Toaster } from "react-hot-toast";
import StoreProvider from "@/app/StoreProvider";
import FirebaseStatus from "@/components/FirebaseStatus";
import "./globals.css";
// Initialize Firebase on app startup
import "@/lib/firebase/config";

const outfit = Outfit({ subsets: ["latin"], weight: ["400", "500", "600"] });

export const metadata = {
    title: "MyLoYauMarket - Shop smarter",
    description: "MyLoYauMarket - Your trusted online marketplace",
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
                <StoreProvider>
                    <Toaster />
                    {children}
                    <FirebaseStatus />
                </StoreProvider>
            </body>
        </html>
    );
}
