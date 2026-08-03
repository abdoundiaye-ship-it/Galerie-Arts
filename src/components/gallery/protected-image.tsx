"use client";

import * as React from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Expand, X } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface ProtectedImageProps {
  reference: string;
  alt: string;
  className?: string;
  /** Click-to-enlarge lightbox. Disabled for small grid thumbnails. */
  enlargeable?: boolean;
}

// Deliberately NOT an <img src="..."> pointing at Storage: bytes are
// fetched once from the protected API route (which enforces publication
// state + mints a fresh watermark per request) and painted as a CSS
// background-image. This makes "right click -> save image as" resolve to
// nothing useful, though — like every web-based protection — it cannot
// stop an actual screenshot of the rendered page.
export function ProtectedImage({ reference, alt, className, enlargeable = true }: ProtectedImageProps) {
  const [objectUrl, setObjectUrl] = React.useState<string | null>(null);
  const [error, setError] = React.useState(false);
  const [isEnlarged, setIsEnlarged] = React.useState(false);
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

  React.useEffect(() => {
    if (!isEnlarged) return;
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") setIsEnlarged(false);
    }
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isEnlarged]);

  function blockAction(event: React.SyntheticEvent) {
    event.preventDefault();
    toast({ description: "Cette image est protegee." });
  }

  const canEnlarge = enlargeable && Boolean(objectUrl);

  return (
    <>
      <div
        role="img"
        aria-label={alt}
        className={`protected-image group relative select-none bg-cover bg-center ${canEnlarge ? "cursor-zoom-in" : ""} ${className ?? ""}`}
        style={objectUrl ? { backgroundImage: `url(${objectUrl})` } : undefined}
        onContextMenu={blockAction}
        onDragStart={blockAction}
        onClick={() => canEnlarge && setIsEnlarged(true)}
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
        {canEnlarge && (
          <span className="pointer-events-none absolute bottom-3 right-3 flex items-center gap-1.5 rounded-full bg-black/60 px-3 py-1.5 text-xs text-white opacity-0 backdrop-blur transition-opacity duration-300 group-hover:opacity-100">
            <Expand className="h-3.5 w-3.5" /> Agrandir
          </span>
        )}
      </div>

      <AnimatePresence>
        {isEnlarged && objectUrl && (
          <motion.div
            className="fixed inset-0 z-[100] flex items-center justify-center bg-black/90 p-4 backdrop-blur-sm sm:p-10"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={() => setIsEnlarged(false)}
          >
            <motion.div
              className="h-full w-full max-w-5xl"
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              transition={{ type: "spring", stiffness: 300, damping: 28 }}
              onClick={(event) => event.stopPropagation()}
            >
              {/* Plain div, not motion.div: framer-motion reserves
                  onDragStart for its own drag-gesture callback signature,
                  which conflicts with the native DOM event handler here. */}
              <div
                role="img"
                aria-label={alt}
                className="protected-image h-full w-full select-none bg-contain bg-center bg-no-repeat"
                style={{ backgroundImage: `url(${objectUrl})` }}
                onContextMenu={blockAction}
                onDragStart={blockAction}
                draggable={false}
              />
            </motion.div>
            <button
              type="button"
              aria-label="Fermer l'agrandissement"
              className="absolute right-4 top-4 rounded-full bg-white/10 p-2 text-white transition-colors hover:bg-white/20"
              onClick={() => setIsEnlarged(false)}
            >
              <X className="h-5 w-5" />
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
