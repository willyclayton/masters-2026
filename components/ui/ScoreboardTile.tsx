"use client";

interface ScoreboardTileProps {
  children: React.ReactNode;
  variant?: "default" | "red" | "gold" | "dark";
  size?: "xs" | "sm" | "md" | "lg" | "xl";
  rotation?: number;
  className?: string;
  animated?: boolean;
  delay?: number;
}

const sizeClasses = {
  xs: "min-w-[28px] h-[24px] text-[11px] px-1",
  sm: "min-w-[34px] h-[30px] text-[13px] px-1.5",
  md: "min-w-[40px] h-[36px] text-[16px] px-2",
  lg: "min-w-[52px] h-[42px] text-[20px] px-2.5",
  xl: "min-w-[64px] h-[50px] text-[26px] px-3",
};

const variantClasses = {
  default: "text-[#1a1a1a]",
  red: "text-[#C0392B]",
  gold: "text-[#8B7535]",
  dark: "text-[#1a1a1a] bg-gradient-to-b from-[#e8e0d0] to-[#d4cbb8]",
};

export function ScoreboardTile({
  children,
  variant = "default",
  size = "md",
  rotation = 0,
  className = "",
  animated = false,
  delay = 0,
}: ScoreboardTileProps) {
  return (
    <span
      className={`
        scoreboard-tile inline-flex items-center justify-center font-extrabold
        rounded-[2px] relative select-none
        ${sizeClasses[size]}
        ${variantClasses[variant]}
        ${animated ? "tile-flip-in" : ""}
        ${className}
      `}
      style={{
        transform: `rotate(${rotation}deg)`,
        animationDelay: animated ? `${delay}ms` : undefined,
      }}
    >
      {children}
    </span>
  );
}
