interface BrandLogoProps {
  size?: number;
  showWordmark?: boolean;
  priority?: boolean;
}

export default function BrandLogo({ size = 56, showWordmark = true }: BrandLogoProps) {
  return (
    <div className="brand-lockup" aria-label="Feater">
      <img
        src="/icon-192.png"
        alt="Feater"
        width={size}
        height={size}
        className="brand-logo"
        loading="eager"
        decoding="async"
      />

      {showWordmark && (
        <div className="brand-wordmark-wrap">
          <span className="brand-wordmark">Feater</span>
          <span className="brand-wordmark-sub">criadores &lt;-&gt; restaurantes</span>
        </div>
      )}
    </div>
  );
}
