import React from 'react';
import { Navbar } from '@/components/sections/Navbar';
import { Hero } from '@/components/sections/Hero';
import { ProblemStrip } from '@/components/sections/ProblemStrip';
import { Problems } from '@/components/sections/Problems';
import { HowItWorks } from '@/components/sections/HowItWorks';
import { KiosVirtual } from '@/components/sections/KiosVirtual';
import { AIEngine } from '@/components/sections/AIEngine';
import { FeaturesPlus } from '@/components/sections/FeaturesPlus';
import { TargetUsers } from '@/components/sections/TargetUsers';
import { Pricing } from '@/components/sections/Pricing';
import { Privacy } from '@/components/sections/Privacy';
import { Roadmap } from '@/components/sections/Roadmap';
import { FAQSection } from '@/components/sections/FAQ';
import { CTAWaitlist } from '@/components/sections/CTAWaitlist';
import { Footer } from '@/components/sections/Footer';

export default function LandingPage() {
  return (
    <div className="min-h-screen">
      <Navbar />
      <main>
        <Hero />
        <ProblemStrip />
        <Problems />
        <HowItWorks />
        <KiosVirtual />
        <AIEngine />
        <FeaturesPlus />
        <TargetUsers />
        <Pricing />
        <Privacy />
        <Roadmap />
        <FAQSection />
        <CTAWaitlist />
      </main>
      <Footer />
    </div>
  );
}
