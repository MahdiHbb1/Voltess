'use client';

import { Navbar } from '@/components/sections/Navbar';
import { Hero } from '@/components/sections/Hero';
import { Problem } from '@/components/sections/Problem';
import { HowItWorks } from '@/components/sections/HowItWorks';
import { Product } from '@/components/sections/Product';
import { VirtualKiosk } from '@/components/sections/VirtualKiosk';
import { AIEngine } from '@/components/sections/AIEngine';
import { TargetUsers } from '@/components/sections/TargetUsers';
import { Pricing } from '@/components/sections/Pricing';
import { FAQ } from '@/components/sections/FAQ';
import { Footer } from '@/components/sections/Footer';

export default function Home() {
  return (
    <main className="min-h-screen">
      <Navbar />
      <div className="pt-16">
        <Hero />
        <Problem />
        <HowItWorks />
        <Product />
        <VirtualKiosk />
        <AIEngine />
        <TargetUsers />
        <Pricing />
        <FAQ />
        <Footer />
      </div>
    </main>
  );
}
