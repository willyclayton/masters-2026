"use client";

import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { BarChart3, Users, BookOpen } from "lucide-react";

export type Section = "predictions" | "players" | "methodology";

interface MobileNavProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  activeSection: Section;
  onSectionChange: (section: Section) => void;
}

const navItems: { id: Section; label: string; icon: React.ElementType }[] = [
  { id: "predictions", label: "AI Predictions", icon: BarChart3 },
  { id: "players", label: "Player Profiles", icon: Users },
  { id: "methodology", label: "Methodology & Live Data", icon: BookOpen },
];

export function MobileNav({
  open,
  onOpenChange,
  activeSection,
  onSectionChange,
}: MobileNavProps) {
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="left" className="w-72 bg-white p-0">
        <SheetHeader className="border-b border-[var(--border-color)] px-6 py-4">
          <SheetTitle className="font-heading text-lg text-masters-green">
            The Green Jacket Lab
          </SheetTitle>
        </SheetHeader>
        <nav className="flex flex-col py-2">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeSection === item.id;
            return (
              <button
                key={item.id}
                onClick={() => {
                  onSectionChange(item.id);
                  onOpenChange(false);
                }}
                className={`flex items-center gap-3 px-6 py-3 text-left text-sm font-medium transition-colors ${
                  isActive
                    ? "border-l-4 border-masters-green bg-masters-green-light text-masters-green"
                    : "border-l-4 border-transparent text-[var(--text-secondary)] hover:bg-gray-50"
                }`}
              >
                <Icon className="h-5 w-5" />
                {item.label}
              </button>
            );
          })}
        </nav>
        <div className="absolute bottom-6 left-6 right-6">
          <p className="text-xs text-[var(--text-muted)]">
            2026 Masters Tournament
          </p>
          <p className="text-xs text-[var(--text-muted)]">
            April 9–12 · Augusta National
          </p>
        </div>
      </SheetContent>
    </Sheet>
  );
}
