'use client';

import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { registerSchema, RegisterInput } from '@/lib/validations';
import { FormField } from '../molecules/FormField';
import { Button } from '../atoms/Button';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { useLocale } from 'next-intl';

export function RegisterForm() {
  const { register: registerUser } = useAuth();
  const router = useRouter();
  const locale = useLocale();
  const [isLoading, setIsLoading] = useState(false);
  const [apiError, setApiError] = useState<string>('');
  const [successMessage, setSuccessMessage] = useState<string>('');

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterInput>({
    resolver: zodResolver(registerSchema),
  });

  const onSubmit = async (data: RegisterInput) => {
    setIsLoading(true);
    setApiError('');
    setSuccessMessage('');

    try {
      await registerUser({
        email: data.email,
        password: data.password,
        firstName: data.firstName,
        lastName: data.lastName,
        phoneNumber: data.phoneNumber,
      });
      
      setSuccessMessage('Compte créé avec succès ! Redirection...');
      
      // Redirect to client dashboard after successful registration
      setTimeout(() => {
        router.push(`/${locale}/dashboard/client`);
      }, 1500);
    } catch (error: any) {
      setApiError(error.response?.data?.message || 'Erreur lors de l\'inscription');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {apiError && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg animate-slide-down">
          {apiError}
        </div>
      )}

      {successMessage && (
        <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg animate-slide-down">
          {successMessage}
        </div>
      )}

      <div className="grid grid-cols-2 gap-4">
        <FormField
          name="firstName"
          label="Prénom"
          type="text"
          placeholder="Jean"
          register={register}
          error={errors.firstName}
          autoComplete="given-name"
        />

        <FormField
          name="lastName"
          label="Nom"
          type="text"
          placeholder="Dupont"
          register={register}
          error={errors.lastName}
          autoComplete="family-name"
        />
      </div>

      <FormField
        name="email"
        label="Email"
        type="email"
        placeholder="jean.dupont@email.com"
        register={register}
        error={errors.email}
        autoComplete="email"
      />

      <FormField
        name="phoneNumber"
        label="Téléphone (optionnel)"
        type="tel"
        placeholder="06 12 34 56 78"
        register={register}
        error={errors.phoneNumber}
        autoComplete="tel"
      />

      <FormField
        name="password"
        label="Mot de passe"
        type="password"
        placeholder="8 caractères minimum"
        register={register}
        error={errors.password}
        autoComplete="new-password"
      />

      <FormField
        name="confirmPassword"
        label="Confirmer le mot de passe"
        type="password"
        placeholder="Répétez votre mot de passe"
        register={register}
        error={errors.confirmPassword}
        autoComplete="new-password"
      />

      <div className="flex items-start gap-3 pt-2">
        <input 
          type="checkbox" 
          id="terms" 
          required
          className="mt-1 h-4 w-4 text-primary-600 rounded border-gray-300 focus:ring-primary-500" 
        />
        <label htmlFor="terms" className="text-sm text-gray-600">
          J'accepte les <a href="#" className="text-primary-700 underline">Conditions Générales d'Utilisation</a> et la <a href="#" className="text-primary-700 underline">Politique de Confidentialité</a>.
        </label>
      </div>

      <Button
        type="submit"
        fullWidth
        isLoading={isLoading}
        disabled={isLoading}
        className="py-4 text-lg"
      >
        {isLoading ? 'Création en cours...' : 'Créer mon compte'}
      </Button>
    </form>
  );
}
