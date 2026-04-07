"use client";

import Image from "next/image";

interface GolferSilhouetteProps {
  size?: "sm" | "md" | "lg" | "xl";
  variant?: "filled" | "outline" | "gradient" | "ghost";
  className?: string;
}

const sizeMap = {
  sm: { width: 120, height: 150 },
  md: { width: 200, height: 250 },
  lg: { width: 280, height: 350 },
  xl: { width: 360, height: 450 },
};

const variantStyles: Record<string, string> = {
  filled: "opacity-100",
  outline: "opacity-60",
  gradient: "opacity-80",
  ghost: "opacity-[0.06]",
};

export function GolferSilhouette({
  size = "md",
  variant = "filled",
  className = "",
}: GolferSilhouetteProps) {
  const { width, height } = sizeMap[size];

  return (
    <Image
      src="/golfer-silhouette.webp"
      alt="Golfer silhouette"
      width={width}
      height={height}
      className={`select-none pointer-events-none invert brightness-0 ${variantStyles[variant] ?? ""} ${className}`}
      priority={false}
    />
  );
}
