import { z } from 'zod';

// Auth schemas
export const loginSchema = z.object({
  email: z.string().email('Email invalide'),
  password: z.string().min(6, 'Le mot de passe doit contenir au moins 6 caractères'),
  role: z.enum(['CLIENT', 'ADVISOR', 'DIRECTOR']).default('CLIENT'),
});

export const registerSchema = z.object({
  email: z.string().email('Email invalide'),
  password: z.string()
    .min(8, 'Le mot de passe doit contenir au moins 8 caractères')
    .regex(/[A-Z]/, 'Le mot de passe doit contenir au moins une majuscule')
    .regex(/[a-z]/, 'Le mot de passe doit contenir au moins une minuscule')
    .regex(/[0-9]/, 'Le mot de passe doit contenir au moins un chiffre'),
  confirmPassword: z.string(),
  firstName: z.string().min(2, 'Le prénom doit contenir au moins 2 caractères'),
  lastName: z.string().min(2, 'Le nom doit contenir au moins 2 caractères'),
  phoneNumber: z.string().optional(),
}).refine((data) => data.password === data.confirmPassword, {
  message: 'Les mots de passe ne correspondent pas',
  path: ['confirmPassword'],
});

// Bank account schemas
export const createBankAccountSchema = z.object({
  accountType: z.enum(['CHECKING', 'SAVINGS', 'INVESTMENT']),
  initialDeposit: z.number().min(0, 'Le dépôt initial doit être positif').optional(),
});

// Transaction schemas
export const depositSchema = z.object({
  accountId: z.string().min(1, 'Compte requis'),
  amount: z.number().min(1, 'Le montant doit être supérieur à 0'),
  description: z.string().optional(),
});

export const withdrawSchema = z.object({
  accountId: z.string().min(1, 'Compte requis'),
  amount: z.number().min(1, 'Le montant doit être supérieur à 0'),
  description: z.string().optional(),
});

export const transferSchema = z.object({
  fromAccountId: z.string().min(1, 'Compte source requis'),
  toAccountId: z.string().min(1, 'Compte destination requis'),
  amount: z.number().min(1, 'Le montant doit être supérieur à 0'),
  description: z.string().optional(),
});

// Stock order schemas
export const placeOrderSchema = z.object({
  stockId: z.string().min(1, 'Action requise'),
  type: z.enum(['BUY', 'SELL']),
  quantity: z.number().int().min(1, 'La quantité doit être au moins 1'),
  price: z.number().min(0.01, 'Le prix doit être supérieur à 0'),
  accountId: z.string().min(1, 'Compte requis'),
});

// Credit schemas
export const requestCreditSchema = z.object({
  amount: z.number().min(1000, 'Le montant minimum est de 1000€'),
  durationMonths: z.number().int().min(12, 'Durée minimale: 12 mois').max(360, 'Durée maximale: 360 mois'),
  reason: z.string().min(10, 'Veuillez expliquer la raison (minimum 10 caractères)'),
});

export const grantCreditSchema = z.object({
  clientId: z.string().min(1, 'Client requis'),
  amount: z.number().min(1000, 'Le montant minimum est de 1000€'),
  interestRate: z.number().min(0.1).max(20, 'Taux entre 0.1% et 20%'),
  durationMonths: z.number().int().min(12).max(360),
});

// Message schemas
export const sendMessageSchema = z.object({
  recipientId: z.string().min(1, 'Destinataire requis'),
  subject: z.string().min(3, 'Sujet requis (minimum 3 caractères)').optional(),
  content: z.string().min(1, 'Message requis'),
});

export const replyMessageSchema = z.object({
  conversationId: z.string().min(1, 'Conversation requise'),
  content: z.string().min(1, 'Message requis'),
});

// Profile update schema
export const updateProfileSchema = z.object({
  firstName: z.string().min(2, 'Prénom requis (minimum 2 caractères)').optional(),
  lastName: z.string().min(2, 'Nom requis (minimum 2 caractères)').optional(),
  phoneNumber: z.string().optional(),
  avatar: z.string().url('URL invalide').optional(),
});

// Director schemas
export const createStockSchema = z.object({
  symbol: z.string().min(1).max(10, 'Symbole trop long'),
  name: z.string().min(2, 'Nom requis'),
  companyName: z.string().min(2, 'Nom de société requis'),
  initialPrice: z.number().min(0.01, 'Prix initial requis'),
  isAvailable: z.boolean().default(true),
});

export const updateStockSchema = z.object({
  name: z.string().min(2, 'Nom requis').optional(),
  companyName: z.string().min(2, 'Nom de société requis').optional(),
  isAvailable: z.boolean().optional(),
});

export const createClientSchema = z.object({
  email: z.string().email('Email invalide'),
  password: z.string().min(8, 'Mot de passe trop court'),
  firstName: z.string().min(2, 'Prénom requis'),
  lastName: z.string().min(2, 'Nom requis'),
  phoneNumber: z.string().optional(),
});

// Type exports
export type LoginInput = z.infer<typeof loginSchema>;
export type RegisterInput = z.infer<typeof registerSchema>;
export type CreateBankAccountInput = z.infer<typeof createBankAccountSchema>;
export type DepositInput = z.infer<typeof depositSchema>;
export type WithdrawInput = z.infer<typeof withdrawSchema>;
export type TransferInput = z.infer<typeof transferSchema>;
export type PlaceOrderInput = z.infer<typeof placeOrderSchema>;
export type RequestCreditInput = z.infer<typeof requestCreditSchema>;
export type GrantCreditInput = z.infer<typeof grantCreditSchema>;
export type SendMessageInput = z.infer<typeof sendMessageSchema>;
export type ReplyMessageInput = z.infer<typeof replyMessageSchema>;
export type UpdateProfileInput = z.infer<typeof updateProfileSchema>;
export type CreateStockInput = z.infer<typeof createStockSchema>;
export type UpdateStockInput = z.infer<typeof updateStockSchema>;
export type CreateClientInput = z.infer<typeof createClientSchema>;
