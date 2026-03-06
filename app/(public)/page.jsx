'use client'
import Hero from "@/components/Hero";
import LatestProducts from "@/components/LatestProducts";
import AboutSection from "@/components/AboutSection";

export default function Home() {
    return (
        <div>
            <Hero />
            <LatestProducts />
            <AboutSection />
        </div>
    );
}
