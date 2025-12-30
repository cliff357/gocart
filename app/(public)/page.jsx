'use client'
import Hero from "@/components/Hero";
import LatestProducts from "@/components/LatestProducts";
import AboutSection from "@/components/AboutSection";

// TODO: Newsletter功能暫時移除，之後需要加返

export default function Home() {
    return (
        <div>
            <Hero />
            <LatestProducts />
            <AboutSection />
        </div>
    );
}
