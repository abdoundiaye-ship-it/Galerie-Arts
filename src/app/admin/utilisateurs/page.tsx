import type { Metadata } from "next";
import { getAllUsersForAdmin } from "@/lib/data/users";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { UserRowActions } from "@/components/admin/user-row-actions";
import { PROFILE_STATUS_LABELS } from "@/lib/constants";
import { formatDate } from "@/lib/utils";

export const metadata: Metadata = { title: "Utilisateurs" };

const STATUS_VARIANT: Record<string, "success" | "secondary" | "outline" | "destructive"> = {
  admin: "success",
  client_autorise: "success",
  en_attente_validation: "secondary",
  rejete: "destructive",
};

export default async function AdminUsersPage() {
  const users = await getAllUsersForAdmin();

  return (
    <div className="space-y-6">
      <h1 className="font-serif text-2xl font-semibold">Utilisateurs ({users.length})</h1>

      <div className="overflow-hidden rounded-lg border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nom</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Statut</TableHead>
              <TableHead>Inscrit le</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {users.map((user) => (
              <TableRow key={user.id}>
                <TableCell className="font-medium">{user.fullName ?? "—"}</TableCell>
                <TableCell>{user.email}</TableCell>
                <TableCell>
                  <Badge variant={STATUS_VARIANT[user.status] ?? "outline"}>
                    {PROFILE_STATUS_LABELS[user.status]}
                  </Badge>
                </TableCell>
                <TableCell>{formatDate(user.createdAt)}</TableCell>
                <TableCell>
                  <UserRowActions user={user} />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
