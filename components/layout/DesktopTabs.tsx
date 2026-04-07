"use client";

import type { Section } from "./MobileNav";

interface DesktopTabsProps {
  activeSection: Section;
  onSectionChange: (section: Section) => void;
}

const tabs: { id: Section; label: string }[] = [
  { id: "predictions", label: "AI Predictions" },
  { id: "betting", label: "Betting Edge" },
  { id: "players", label: "Player Profiles" },
  { id: "methodology", label: "Methodology & Live Data" },
];

export function DesktopTabs({
  activeSection,
  onSectionChange,
}: DesktopTabsProps) {
  return (
    <nav className="hidden border-b-2 border-[var(--masters-green-dark,#004D3C)] bg-[#004D3C] md:block">
      <div className="mx-auto flex max-w-7xl items-center justify-center gap-2 px-4 py-2">
        {tabs.map((tab, i) => {
          const isActive = activeSection === tab.id;
          const rotation = [0.5, -0.3, 0.4, -0.5][i];
          return (
            <button
              key={tab.id}
              onClick={() => onSectionChange(tab.id)}
              className={`
                relative px-4 py-2 text-xs font-bold tracking-wider uppercase transition-all rounded-[2px]
                ${
                  isActive
                    ? "scoreboard-tile text-[#006B54]"
                    : "text-white/60 hover:text-white/90 bg-transparent"
                }
              `}
              style={isActive ? { transform: `rotate(${rotation}deg)` } : undefined}
            >
              {tab.label}
            </button>
          );
        })}
      </div>
    </nav>
  );
}
