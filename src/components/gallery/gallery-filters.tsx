"use client";

import * as React from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { SORT_OPTIONS } from "@/lib/constants";
import type { CategoryRow } from "@/types";

interface GalleryFiltersProps {
  categories: CategoryRow[];
  years: number[];
}

const AVAILABILITY_OPTIONS = [
  { value: "disponible", label: "Disponible" },
  { value: "reserve", label: "Reserve" },
  { value: "vendu", label: "Vendu" },
];

export function GalleryFilters({ categories, years }: GalleryFiltersProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [q, setQ] = React.useState(searchParams.get("q") ?? "");
  const [author, setAuthor] = React.useState(searchParams.get("author") ?? "");
  const [technique, setTechnique] = React.useState(searchParams.get("technique") ?? "");

  function updateParam(key: string, value: string) {
    const params = new URLSearchParams(searchParams.toString());
    if (value) params.set(key, value);
    else params.delete(key);
    params.delete("page");
    router.push(`/galerie?${params.toString()}`);
  }

  function handleTextSubmit(event: React.FormEvent) {
    event.preventDefault();
    const params = new URLSearchParams(searchParams.toString());
    const setOrDelete = (key: string, value: string) => {
      if (value) params.set(key, value);
      else params.delete(key);
    };
    setOrDelete("q", q);
    setOrDelete("author", author);
    setOrDelete("technique", technique);
    params.delete("page");
    router.push(`/galerie?${params.toString()}`);
  }

  function resetFilters() {
    setQ("");
    setAuthor("");
    setTechnique("");
    router.push("/galerie");
  }

  return (
    <div className="space-y-4 rounded-lg border border-border/60 bg-card p-4">
      <form onSubmit={handleTextSubmit} className="grid gap-3 sm:grid-cols-3">
        <Input
          placeholder="Mot-cle (titre, technique...)"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          aria-label="Recherche par mot-cle"
        />
        <Input
          placeholder="Auteur"
          value={author}
          onChange={(e) => setAuthor(e.target.value)}
          aria-label="Recherche par auteur"
        />
        <Input
          placeholder="Technique"
          value={technique}
          onChange={(e) => setTechnique(e.target.value)}
          aria-label="Recherche par technique"
        />
        <Button type="submit" variant="gold" className="sm:col-span-3">
          Rechercher
        </Button>
      </form>

      <div className="grid gap-3 sm:grid-cols-4">
        <Select
          value={searchParams.get("category") ?? "all"}
          onValueChange={(v) => updateParam("category", v === "all" ? "" : v)}
        >
          <SelectTrigger aria-label="Filtrer par categorie">
            <SelectValue placeholder="Categorie" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Toutes les categories</SelectItem>
            {categories.map((category) => (
              <SelectItem key={category.id} value={category.slug}>
                {category.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select
          value={searchParams.get("year") ?? "all"}
          onValueChange={(v) => updateParam("year", v === "all" ? "" : v)}
        >
          <SelectTrigger aria-label="Filtrer par annee">
            <SelectValue placeholder="Annee" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Toutes les annees</SelectItem>
            {years.map((year) => (
              <SelectItem key={year} value={String(year)}>
                {year}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select
          value={searchParams.get("availability") ?? "all"}
          onValueChange={(v) => updateParam("availability", v === "all" ? "" : v)}
        >
          <SelectTrigger aria-label="Filtrer par disponibilite">
            <SelectValue placeholder="Disponibilite" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Toutes disponibilites</SelectItem>
            {AVAILABILITY_OPTIONS.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select
          value={searchParams.get("sort") ?? "recent"}
          onValueChange={(v) => updateParam("sort", v)}
        >
          <SelectTrigger aria-label="Trier">
            <SelectValue placeholder="Trier par" />
          </SelectTrigger>
          <SelectContent>
            {SORT_OPTIONS.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <Button variant="ghost" size="sm" onClick={resetFilters}>
        Reinitialiser les filtres
      </Button>
    </div>
  );
}
