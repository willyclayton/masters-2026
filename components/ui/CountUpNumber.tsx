"use client";

import { useEffect, useRef, useState } from "react";

interface CountUpNumberProps {
  end: number;
  duration?: number;
  decimals?: number;
  suffix?: string;
  className?: string;
}

export function CountUpNumber({
  end,
  duration = 800,
  decimals = 1,
  suffix = "%",
  className = "",
}: CountUpNumberProps) {
  const [value, setValue] = useState(0);
  const ref = useRef<HTMLSpanElement>(null);
  const hasAnimated = useRef(false);

  useEffect(() => {
    if (hasAnimated.current) return;
    hasAnimated.current = true;

    const start = performance.now();
    const animate = (now: number) => {
      const elapsed = now - start;
      const progress = Math.min(elapsed / duration, 1);
      // ease-out cubic
      const eased = 1 - Math.pow(1 - progress, 3);
      setValue(eased * end);

      if (progress < 1) {
        requestAnimationFrame(animate);
      } else {
        setValue(end);
      }
    };
    requestAnimationFrame(animate);
  }, [end, duration]);

  return (
    <span className={`tabular-nums ${className}`} ref={ref}>
      {value.toFixed(decimals)}
      {suffix}
    </span>
  );
}
