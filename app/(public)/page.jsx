'use client'
import Hero from "@/components/Hero";
import OurSpecs from "@/components/OurSpec";
import LatestProducts from "@/components/LatestProducts";

// TODO: Newsletter功能暫時移除，之後需要加返

export default function Home() {
    return (
        <div>
            <Hero />
            <LatestProducts />
            <OurSpecs />
        </div>
    );
}
