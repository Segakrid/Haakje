import { z } from 'zod'

// Fishing Rod validation
export const fishingRodSchema = z.object({
  name: z.string().min(1, 'Naam is verplicht'),
  brand: z.string().min(1, 'Merk is verplicht'),
  model: z.string().min(1, 'Model is verplicht'),
  length: z.number().min(0.1, 'Lengte moet minimaal 0.1m zijn').nullable().optional(),
  weight: z.number().min(0.01, 'Gewicht moet minimaal 0.01kg zijn').nullable().optional(),
  material: z.string().nullable().optional(),
  description: z.string().nullable().optional(),
})

export type FishingRodFormData = z.infer<typeof fishingRodSchema>

// Catch validation
export const catchSchema = z.object({
  fish_species_id: z.string().min(1, 'Vissoort is verplicht'),
  bait_type_id: z.string().min(1, 'Aassoort is verplicht'),
  fishing_rod_id: z.string().nullable().optional(),
  weight_kg: z.number().min(0.01, 'Gewicht moet minimaal 0.01kg zijn').nullable().optional(),
  length_cm: z.number().min(1, 'Lengte moet minimaal 1cm zijn').nullable().optional(),
  location: z.string().min(1, 'Locatie is verplicht'),
  latitude: z.number().nullable().optional(),
  longitude: z.number().nullable().optional(),
  notes: z.string().nullable().optional(),
  images: z.array(z.instanceof(File)).nullable().optional(),
})

export type CatchFormData = z.infer<typeof catchSchema>

// User profile validation
export const profileSchema = z.object({
  name: z.string().min(1, 'Naam is verplicht'),
  email: z.string().email('Ongeldig emailadres'),
})

export type ProfileFormData = z.infer<typeof profileSchema>

// Auth validation
export const loginSchema = z.object({
  email: z.string().email('Ongeldig emailadres'),
  password: z.string().min(6, 'Wachtwoord moet minimaal 6 tekens zijn'),
})

export type LoginFormData = z.infer<typeof loginSchema>

export const registerSchema = z.object({
  email: z.string().email('Ongeldig emailadres'),
  password: z.string().min(6, 'Wachtwoord moet minimaal 6 tekens zijn'),
  name: z.string().min(1, 'Naam is verplicht'),
})

export type RegisterFormData = z.infer<typeof registerSchema>

export const forgotPasswordSchema = z.object({
  email: z.string().email('Ongeldig emailadres'),
})

export type ForgotPasswordFormData = z.infer<typeof forgotPasswordSchema>

export const resetPasswordSchema = z
  .object({
    password: z.string().min(6, 'Wachtwoord moet minimaal 6 tekens zijn'),
    confirmPassword: z.string().min(6, 'Wachtwoord moet minimaal 6 tekens zijn'),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Wachtwoorden komen niet overeen',
    path: ['confirmPassword'],
  })

export type ResetPasswordFormData = z.infer<typeof resetPasswordSchema>
