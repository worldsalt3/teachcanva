"use client";

import { useState } from "react";
import { Star } from "lucide-react";
import { cn } from "@/lib/utils";

export interface StarRatingProps {
  value?: number;
  onChange?: (value: number) => void;
  size?: number;
  className?: string;
}

/** Interactive 5-star rating input. */
export function StarRating({
  value = 0,
  onChange,
  size = 34,
  className,
}: StarRatingProps) {
  const [hover, setHover] = useState(0);
  const active = hover || value;

  return (
    <div className={cn("flex items-center gap-2", className)} role="radiogroup">
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          role="radio"
          aria-checked={value === star}
          aria-label={`${star} star${star > 1 ? "s" : ""}`}
          onMouseEnter={() => setHover(star)}
          onMouseLeave={() => setHover(0)}
          onClick={() => onChange?.(star)}
          className="tap transition-transform active:scale-90"
        >
          <Star
            style={{ width: size, height: size }}
            className={cn(
              "transition-colors",
              star <= active
                ? "fill-teal text-teal"
                : "fill-transparent text-fg-faint",
            )}
          />
        </button>
      ))}
    </div>
  );
}
