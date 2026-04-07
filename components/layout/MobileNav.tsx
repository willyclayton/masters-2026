"use client";

import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { BarChart3, Users, BookOpen, TrendingUp, Trophy } from "lucide-react";

export type Section = "predictions" | "players" | "methodology" | "betting" | "champion";

interface MobileNavProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  activeSection: Section;
  onSectionChange: (section: Section) => void;
}

const navItems: { id: Section; label: string; icon: React.ElementType }[] = [
  { id: "predictions", label: "AI Predictions", icon: BarChart3 },
  { id: "betting", label: "Betting Edge", icon: TrendingUp },
  { id: "players", label: "Player Profiles", icon: Users },
  { id: "methodology", label: "Methodology & Live Data", icon: BookOpen },
  { id: "champion", label: "Champion DNA", icon: Trophy },
];

export function MobileNav({
  open,
  onOpenChange,
  activeSection,
  onSectionChange,
}: MobileNavProps) {
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="left" className="w-72 p-0 bg-[#004D3C]">
        <SheetHeader className="border-b border-white/10 px-6 py-4">
          <SheetTitle className="font-masters-italic text-lg text-white board-header-paint">
            The Green Jacket Lab
          </SheetTitle>
        </SheetHeader>
        <nav className="flex flex-col py-2">
          {navItems.map((item, i) => {
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
                    ? "border-l-4 border-[#C8A951] bg-white/10 text-white"
                    : "border-l-4 border-transparent text-white/60 hover:text-white/80 hover:bg-white/5"
                }`}
              >
                <Icon className="h-5 w-5" />
                {item.label}
              </button>
            );
          })}
        </nav>
        <div className="absolute bottom-6 left-6 right-6">
          <p className="text-xs text-white/30">
            2026 Masters Tournament
          </p>
          <p className="text-xs text-white/30">
            April 9–12 · Augusta National
          </p>
        </div>
      </SheetContent>
    </Sheet>
  );
}
