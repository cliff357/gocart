import { Outfit } from "next/font/google";
import { Toaster } from "react-hot-toast";
import StoreProvider from "@/app/StoreProvider";
import FirebaseStatus from "@/components/FirebaseStatus";
import "./globals.css";
// Initialize Firebase on app startup
import "@/lib/firebase/config";

const outfit = Outfit({ subsets: ["latin"], weight: ["400", "500", "600"] });

export const metadata = {
    title: "GoCart. - Shop smarter",
    description: "GoCart. - Shop smarter",
};

export default function RootLayout({ children }) {
    return (
        <html lang="en">
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
