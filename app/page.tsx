"use client";

import { useState } from "react";
import { Header } from "@/components/layout/Header";
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
    <div className="flex min-h-screen flex-col">
      <Header onMenuToggle={() => setMobileNavOpen(true)} />
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
  );
}
