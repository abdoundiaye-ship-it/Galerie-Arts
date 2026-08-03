import Link from "next/link";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";

const links = [
  { href: "/admin", label: "Tableau de bord" },
  { href: "/admin/oeuvres", label: "Oeuvres" },
  { href: "/admin/categories", label: "Categories" },
  { href: "/admin/collections", label: "Collections" },
  { href: "/admin/demandes", label: "Demandes d'achat" },
  { href: "/admin/utilisateurs", label: "Utilisateurs" },
];

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  // Defense in depth: middleware already blocks non-admins from /admin/*,
  // but every admin data query in this subtree also assumes an admin
  // caller — re-check here so a page can never render past this point
  // without one, regardless of how the route was reached.
  const user = await getCurrentUser();
  if (!user || user.status !== "admin") redirect("/");

  return (
    <div className="container grid gap-8 py-10 lg:grid-cols-[220px_1fr]">
      <aside className="space-y-1">
        <p className="mb-3 font-serif text-lg font-semibold">Administration</p>
        <nav className="flex flex-col gap-1">
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="rounded-md px-3 py-2 text-sm font-medium text-foreground/80 hover:bg-accent hover:text-accent-foreground"
            >
              {link.label}
            </Link>
          ))}
        </nav>
      </aside>
      <div>{children}</div>
    </div>
  );
}
