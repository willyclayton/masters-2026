interface InitialsAvatarProps {
  initials: string;
  size?: "sm" | "md" | "lg";
  className?: string;
}

const sizes = {
  sm: "h-8 w-8 text-xs",
  md: "h-10 w-10 text-sm",
  lg: "h-16 w-16 text-xl",
};

export function InitialsAvatar({
  initials,
  size = "md",
  className = "",
}: InitialsAvatarProps) {
  return (
    <div
      className={`flex shrink-0 items-center justify-center rounded-full bg-masters-green font-semibold text-white ${sizes[size]} ${className}`}
    >
      {initials}
    </div>
  );
}
