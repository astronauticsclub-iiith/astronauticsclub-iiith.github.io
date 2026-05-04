import Hero from "@/components/features/Landing/Hero";
import WhoWeAre from "@/components/features/Landing/WhoWeAre";
import BlogsShowcase from "@/components/features/Blog/BlogsShowcase";
import { WaveSeparator, CloudSeparator } from "@/components/ui";

export default function Home() {
    return (
        <div className="min-h-screen font-[family-name:var(--font-geist-sans)]">
            <Hero />
            <WaveSeparator />
            <WhoWeAre />
            <CloudSeparator cloudColor="#e0e0e0" />
            <BlogsShowcase />
        </div>
    );
}
