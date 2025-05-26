import Hero from "@/components/features/Landing/Hero";
import WhoWeAre from "@/components/features/Landing/WhoWeAre";
import Separator from "@/components/ui/Separator";

export default function Home() {
  return (
    <div className="min-h-screen font-[family-name:var(--font-geist-sans)]">
      <Hero />
      <Separator />
      <WhoWeAre />
    </div>
  );
}
