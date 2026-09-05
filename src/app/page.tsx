'use client'

import { SiteHeader } from '@/components/site-header'
import { SiteFooter } from '@/components/site-footer'
import { HeroSection } from '@/components/sections/hero'
import { OrbitalSection } from '@/components/sections/orbital'
import { WorksSection } from '@/components/sections/works'
import { ShelfSection } from '@/components/sections/shelf'
import { DomainsSection } from '@/components/sections/domains'
import { AboutSection } from '@/components/sections/about'
import { ConnectSection } from '@/components/sections/connect'

export default function Home() {
  return (
    <div className="relative flex min-h-screen flex-col bg-background">
      <SiteHeader />
      <main className="flex-1">
        <HeroSection />
        <OrbitalSection />
        <WorksSection />
        <ShelfSection />
        <DomainsSection />
        <AboutSection />
        <ConnectSection />
      </main>
      <SiteFooter />
    </div>
  )
}
