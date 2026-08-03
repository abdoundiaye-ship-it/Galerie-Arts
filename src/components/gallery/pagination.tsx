import Link from "next/link";
import { Button } from "@/components/ui/button";

interface PaginationProps {
  page: number;
  pageSize: number;
  total: number;
  searchParams: Record<string, string | undefined>;
}

export function Pagination({ page, pageSize, total, searchParams }: PaginationProps) {
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  if (totalPages <= 1) return null;

  function hrefFor(targetPage: number) {
    const params = new URLSearchParams(
      Object.entries(searchParams).filter(([, v]) => v !== undefined) as [string, string][],
    );
    params.set("page", String(targetPage));
    return `/galerie?${params.toString()}`;
  }

  return (
    <nav className="flex items-center justify-center gap-2" aria-label="Pagination">
      <Button asChild variant="outline" size="sm" disabled={page <= 1}>
        <Link href={hrefFor(Math.max(1, page - 1))} aria-disabled={page <= 1}>
          Precedent
        </Link>
      </Button>
      <span className="text-sm text-muted-foreground">
        Page {page} / {totalPages}
      </span>
      <Button asChild variant="outline" size="sm" disabled={page >= totalPages}>
        <Link href={hrefFor(Math.min(totalPages, page + 1))} aria-disabled={page >= totalPages}>
          Suivant
        </Link>
      </Button>
    </nav>
  );
}
