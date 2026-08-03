"use client";

import * as React from "react";
import { useToast } from "@/hooks/use-toast";

interface ProtectedImageProps {
  reference: string;
  alt: string;
  className?: string;
}

// Deliberately NOT an <img src="..."> pointing at Storage: bytes are
// fetched once from the protected API route (which enforces publication
// state + mints a fresh watermark per request) and painted as a CSS
// background-image. This makes "right click -> save image as" resolve to
// nothing useful, though — like every web-based protection — it cannot
// stop an actual screenshot of the rendered page.
export function ProtectedImage({ reference, alt, className }: ProtectedImageProps) {
  const [objectUrl, setObjectUrl] = React.useState<string | null>(null);
  const [error, setError] = React.useState(false);
  const { toast } = useToast();

  React.useEffect(() => {
    let cancelled = false;
    let currentUrl: string | null = null;

    fetch(`/api/images/${encodeURIComponent(reference)}`, { cache: "no-store" })
      .then((res) => {
        if (!res.ok) throw new Error("image indisponible");
        return res.blob();
      })
      .then((blob) => {
        if (cancelled) return;
        currentUrl = URL.createObjectURL(blob);
        setObjectUrl(currentUrl);
      })
      .catch(() => {
        if (!cancelled) setError(true);
      });

    return () => {
      cancelled = true;
      if (currentUrl) URL.revokeObjectURL(currentUrl);
    };
  }, [reference]);

  function blockAction(event: React.SyntheticEvent) {
    event.preventDefault();
    toast({ description: "Cette image est protegee." });
  }

  return (
    <div
      role="img"
      aria-label={alt}
      className={`protected-image select-none bg-cover bg-center ${className ?? ""}`}
      style={objectUrl ? { backgroundImage: `url(${objectUrl})` } : undefined}
      onContextMenu={blockAction}
      onDragStart={blockAction}
      draggable={false}
    >
      {!objectUrl && !error && (
        <div className="flex h-full w-full items-center justify-center text-sm text-muted-foreground">
          Chargement...
        </div>
      )}
      {error && (
        <div className="flex h-full w-full items-center justify-center text-sm text-muted-foreground">
          Image indisponible
        </div>
      )}
    </div>
  );
}
