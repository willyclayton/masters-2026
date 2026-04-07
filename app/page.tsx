"use client";

import { useState } from "react";
import { LiveDataProvider } from "@/lib/live-data-context";
import { Header } from "@/components/layout/Header";
import { LeaderboardTicker } from "@/components/layout/LeaderboardTicker";
import { MobileNav, type Section } from "@/components/layout/MobileNav";
import { DesktopTabs } from "@/components/layout/DesktopTabs";
import { Footer } from "@/components/layout/Footer";
import { Predictions } from "@/components/sections/Predictions";
import { PlayerProfiles } from "@/components/sections/PlayerProfiles";
import { Methodology } from "@/components/sections/Methodology";
import { BettingEdge } from "@/components/sections/BettingEdge";

export default function Home() {
  const [activeSection, setActiveSection] = useState<Section>("predictions");
  const [mobileNavOpen, setMobileNavOpen] = useState(false);

  return (
    <LiveDataProvider>
      <div className="flex min-h-screen flex-col">
        {/* Sticky top block: ticker + header together */}
        <div className="sticky top-0 z-50">
          <LeaderboardTicker />
          <Header onMenuToggle={() => setMobileNavOpen(true)} />
        </div>

        <MobileNav
          open={mobileNavOpen}
          onOpenChange={setMobileNavOpen}
          activeSection={activeSection}
          onSectionChange={setActiveSection}
        />
        <DesktopTabs
          activeSection={activeSection}
          onSectionChange={setActiveSection}
        />

        <main className="flex-1 pb-20">
          {activeSection === "predictions" && <Predictions />}
          {activeSection === "betting" && <BettingEdge />}
          {activeSection === "players" && <PlayerProfiles />}
          {activeSection === "methodology" && <Methodology />}
        </main>

        <Footer />
      </div>
    </LiveDataProvider>
  );
}
