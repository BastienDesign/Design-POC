"use client";

import { useState } from "react";
import { RiImageLine } from "@remixicon/react";

interface ImageWithFallbackProps {
  src: string | undefined;
  alt?: string;
  className?: string;
  fallbackClassName?: string;
}

export function ImageWithFallback({
  src,
  alt,
  className,
  fallbackClassName,
}: ImageWithFallbackProps) {
  const [error, setError] = useState(false);

  if (!src || error) {
    return (
      <div
        className={`flex items-center justify-center bg-muted text-muted-foreground ${fallbackClassName || className || ""}`}
      >
        <RiImageLine className="size-1/3 opacity-50" />
      </div>
    );
  }

  return (
    <img
      src={src}
      alt={alt}
      onError={() => setError(true)}
      className={`object-cover ${className || ""}`}
    />
  );
}
