"use client";

import { useMemo, useState } from "react";

interface BrandLogoProps {
  size?: number;
  className?: string;
  priority?: boolean;
  showWordmark?: boolean;
}

const sources = [
  "/branding/feater-icon.png?v=1",
  "/branding/feater-logo.png?v=1",
  "/logo-feater-mark.png?v=4",
  "/logo-feater.png?v=4",
  "/icon-192.png?v=4",
];

export default function BrandLogo({ size = 56, className = "", priority = false, showWordmark = true }: BrandLogoProps) {
  const [sourceIndex, setSourceIndex] = useState(0);
  const currentSource = useMemo(() => sources[sourceIndex], [sourceIndex]);

  if (!currentSource && !showWordmark) {
    return <div className={`brand-logo-fallback ${className}`.trim()} aria-label="Feater">F</div>;
  }

  return (
    <div className={`brand-lockup ${className}`.trim()} aria-label="Feater">
      {currentSource ? (
        <img
          src={currentSource}
          alt="Feater"
          width={size}
          height={size}
          className="brand-logo"
          loading={priority ? "eager" : "lazy"}
          decoding="async"
          onError={() => setSourceIndex((prev) => prev + 1)}
        />
      ) : (
        <div className="brand-logo-fallback">F</div>
      )}

      {showWordmark && (
        <div className="brand-wordmark-wrap">
          <span className="brand-wordmark">Feater</span>
          <span className="brand-wordmark-sub">creator x restaurantes</span>
        </div>
      )}
    </div>
  );
}
