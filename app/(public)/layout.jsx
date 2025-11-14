'use client'
import Banner from "@/components/Banner";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

export default function PublicLayout({ children }) {

    return (
        <>
            {/* Banner temporarily hidden */}
            {/* <Banner /> */}
            <Navbar />
            {children}
            <Footer />
        </>
    );
}
