import { cn } from "@/lib/utils";

export function FormMessage({ error, success }: { error?: string; success?: string }) {
  if (!error && !success) return null;

  return (
    <p
      className={cn(
        "rounded-md border px-3 py-2 text-sm",
        error && "border-destructive/40 bg-destructive/10 text-destructive",
        success && "border-emerald-600/40 bg-emerald-600/10 text-emerald-700 dark:text-emerald-400",
      )}
      role={error ? "alert" : "status"}
    >
      {error ?? success}
    </p>
  );
}
