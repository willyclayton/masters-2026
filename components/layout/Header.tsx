"use client";

import { Menu } from "lucide-react";
import { Button } from "@/components/ui/button";

interface HeaderProps {
  onMenuToggle: () => void;
}

export function Header({ onMenuToggle }: HeaderProps) {
  return (
    <header className="w-full bg-masters-green shadow-sm">
      <div className="mx-auto flex h-14 max-w-7xl items-center justify-between px-4">
        <Button
          variant="ghost"
          size="icon"
          className="text-white hover:bg-masters-green-dark md:hidden"
          onClick={onMenuToggle}
          aria-label="Open menu"
        >
          <Menu className="h-6 w-6" />
        </Button>

        <h1 className="font-heading text-lg font-bold tracking-tight text-white md:text-xl">
          The Green Jacket Lab
        </h1>

        <span className="text-xl" role="img" aria-label="Golf flag">
          ⛳
        </span>
      </div>
    </header>
  );
}
