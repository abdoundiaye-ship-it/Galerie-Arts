"use client";

import * as React from "react";
import { Check, Copy } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export function TempPasswordReveal({ password }: { password: string }) {
  const [copied, setCopied] = React.useState(false);

  async function handleCopy() {
    await navigator.clipboard.writeText(password);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <div className="space-y-2 rounded-md border border-gold-500/50 bg-gold-500/10 p-3">
      <p className="text-sm font-medium">Mot de passe temporaire (affiche une seule fois) :</p>
      <div className="flex gap-2">
        <Input readOnly value={password} className="font-mono" onFocus={(e) => e.target.select()} />
        <Button type="button" variant="outline" size="icon" onClick={handleCopy} aria-label="Copier">
          {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
        </Button>
      </div>
      <p className="text-xs text-muted-foreground">
        Communiquez-le a la personne concernee ; elle pourra le changer via son profil ou &quot;mot de
        passe oublie&quot;.
      </p>
    </div>
  );
}
