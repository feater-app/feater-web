"use client";

import { useState } from "react";

interface InstagramConnectButtonProps {
  nextPath: string;
  disabled?: boolean;
}

export default function InstagramConnectButton({ nextPath, disabled = false }: InstagramConnectButtonProps) {
  const [loading, setLoading] = useState(false);

  const connectInstagram = async () => {
    if (disabled) return;
    setLoading(true);

    const target = `/api/instagram/connect?next=${encodeURIComponent(nextPath)}`;
    window.location.assign(target);
  };

  return (
    <button type="button" onClick={connectInstagram} className="btn-primary w-full" disabled={loading || disabled}>
      {loading ? "Conectando..." : "Conectar Instagram"}
    </button>
  );
}
