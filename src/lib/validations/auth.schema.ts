import { z } from "zod";

export const signUpSchema = z.object({
  fullName: z.string().trim().min(2, "Le nom complet est requis").max(200),
  email: z.string().trim().email("Adresse email invalide"),
  phone: z.string().trim().max(30).optional().or(z.literal("")),
  password: z
    .string()
    .min(8, "8 caracteres minimum")
    .regex(/[a-z]/, "Une minuscule est requise")
    .regex(/[A-Z]/, "Une majuscule est requise")
    .regex(/[0-9]/, "Un chiffre est requis"),
});

export const signInSchema = z.object({
  email: z.string().trim().email("Adresse email invalide"),
  password: z.string().min(1, "Mot de passe requis"),
});

export const requestPasswordResetSchema = z.object({
  email: z.string().trim().email("Adresse email invalide"),
});

export const resetPasswordSchema = z
  .object({
    password: z
      .string()
      .min(8, "8 caracteres minimum")
      .regex(/[a-z]/, "Une minuscule est requise")
      .regex(/[A-Z]/, "Une majuscule est requise")
      .regex(/[0-9]/, "Un chiffre est requis"),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Les mots de passe ne correspondent pas",
    path: ["confirmPassword"],
  });

export type SignUpInput = z.infer<typeof signUpSchema>;
export type SignInInput = z.infer<typeof signInSchema>;
export type RequestPasswordResetInput = z.infer<typeof requestPasswordResetSchema>;
export type ResetPasswordInput = z.infer<typeof resetPasswordSchema>;
