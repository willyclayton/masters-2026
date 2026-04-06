"use client";

import type { Section } from "./MobileNav";

interface DesktopTabsProps {
  activeSection: Section;
  onSectionChange: (section: Section) => void;
}

const tabs: { id: Section; label: string }[] = [
  { id: "predictions", label: "AI Predictions" },
  { id: "players", label: "Player Profiles" },
  { id: "methodology", label: "Methodology & Live Data" },
];

export function DesktopTabs({
  activeSection,
  onSectionChange,
}: DesktopTabsProps) {
  return (
    <nav className="hidden border-b border-[var(--border-color)] bg-white md:block">
      <div className="mx-auto flex max-w-7xl items-center justify-center gap-1 px-4">
        {tabs.map((tab) => {
          const isActive = activeSection === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => onSectionChange(tab.id)}
              className={`relative px-5 py-3 text-sm font-medium transition-colors ${
                isActive
                  ? "text-masters-green"
                  : "text-[var(--text-muted)] hover:text-[var(--text-secondary)]"
              }`}
            >
              {tab.label}
              {isActive && (
                <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-masters-green" />
              )}
            </button>
          );
        })}
      </div>
    </nav>
  );
}
