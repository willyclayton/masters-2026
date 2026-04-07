"use client";

import { Menu } from "lucide-react";
import { Button } from "@/components/ui/button";

interface HeaderProps {
  onMenuToggle: () => void;
}

export function Header({ onMenuToggle }: HeaderProps) {
  return (
    <header className="board-surface w-full shadow-md">
      <div className="relative mx-auto flex h-14 max-w-7xl items-center justify-between px-4">
        <Button
          variant="ghost"
          size="icon"
          className="text-white hover:bg-white/10 md:hidden"
          onClick={onMenuToggle}
          aria-label="Open menu"
        >
          <Menu className="h-6 w-6" />
        </Button>

        <h1 className="font-heading text-lg font-bold tracking-tight text-white md:text-xl board-header-paint">
          The Green Jacket Lab
        </h1>

        <span
          className="scoreboard-tile inline-flex items-center justify-center text-sm font-extrabold text-[#1a1a1a] rounded-[2px] min-w-[32px] h-[28px] px-1.5"
          style={{ transform: "rotate(-1deg)" }}
          role="img"
          aria-label="Golf flag"
        >
          ⛳
        </span>
      </div>
    </header>
  );
}
