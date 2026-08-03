import type { Metadata } from "next";
import { getAllUsersForAdmin } from "@/lib/data/users";
import { getCurrentUser } from "@/lib/auth";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { UserRowActions } from "@/components/admin/user-row-actions";
import { CreateUserDialog } from "@/components/admin/create-user-dialog";
import { ROLE_LABELS } from "@/lib/constants";
import { formatDate } from "@/lib/utils";

export const metadata: Metadata = { title: "Utilisateurs" };

export default async function AdminUsersPage() {
  const [users, currentUser] = await Promise.all([getAllUsersForAdmin(), getCurrentUser()]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="font-serif text-2xl font-semibold">Utilisateurs ({users.length})</h1>
        <CreateUserDialog />
      </div>

      <div className="overflow-hidden rounded-lg border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nom</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Role</TableHead>
              <TableHead>Statut</TableHead>
              <TableHead>Inscrit le</TableHead>
              <TableHead>Derniere connexion</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {users.map((user) => (
              <TableRow key={user.id}>
                <TableCell className="font-medium">{user.fullName ?? "—"}</TableCell>
                <TableCell>{user.email}</TableCell>
                <TableCell>
                  <Badge variant={user.roleName === "admin" ? "gold" : "outline"}>
                    {ROLE_LABELS[user.roleName] ?? user.roleName}
                  </Badge>
                </TableCell>
                <TableCell>
                  <Badge variant={user.isActive ? "success" : "secondary"}>
                    {user.isActive ? "Actif" : "Inactif"}
                  </Badge>
                </TableCell>
                <TableCell>{formatDate(user.createdAt)}</TableCell>
                <TableCell>{user.lastSignInAt ? formatDate(user.lastSignInAt) : "Jamais"}</TableCell>
                <TableCell>
                  <UserRowActions user={user} isSelf={user.id === currentUser?.id} />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
