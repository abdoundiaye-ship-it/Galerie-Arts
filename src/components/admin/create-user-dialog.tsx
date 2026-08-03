"use client";

import * as React from "react";
import { useActionState } from "react";
import { useRouter } from "next/navigation";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { SubmitButton } from "@/components/auth/submit-button";
import { FormMessage } from "@/components/auth/form-message";
import { TempPasswordReveal } from "@/components/admin/temp-password-reveal";
import { createUserAction, type ActionState } from "@/lib/actions/admin-users";

const initialState: ActionState = {};

export function CreateUserDialog() {
  const [open, setOpen] = React.useState(false);
  const [state, formAction] = useActionState(createUserAction, initialState);
  const router = useRouter();

  function handleOpenChange(next: boolean) {
    setOpen(next);
    if (!next && state.success) router.refresh();
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button variant="gold">Creer un utilisateur</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Nouvel utilisateur</DialogTitle>
        </DialogHeader>

        {state.tempPassword ? (
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">{state.success}</p>
            <TempPasswordReveal password={state.tempPassword} />
            <Button className="w-full" onClick={() => handleOpenChange(false)}>
              Fermer
            </Button>
          </div>
        ) : (
          <form action={formAction} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="fullName">Nom complet</Label>
              <Input id="fullName" name="fullName" required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" name="email" type="email" required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="roleName">Role</Label>
              <Select name="roleName" defaultValue="visiteur">
                <SelectTrigger id="roleName">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="visiteur">Visiteur</SelectItem>
                  <SelectItem value="admin">Administrateur</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <FormMessage error={state.error} />
            <SubmitButton variant="gold" className="w-full">
              Creer le compte
            </SubmitButton>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}
