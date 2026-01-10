'use client';

import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { loginSchema, LoginInput } from '@/lib/validations';
import { FormField } from '../molecules/FormField';
import { Button } from '../atoms/Button';
import { Select } from '../atoms/Select';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { useLocale } from 'next-intl';

export function LoginForm() {
  const { login } = useAuth();
  const router = useRouter();
  const locale = useLocale();
  const [isLoading, setIsLoading] = useState(false);
  const [apiError, setApiError] = useState<string>('');

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginInput>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      role: 'CLIENT',
    },
  });

  const onSubmit = async (data: LoginInput) => {
    setIsLoading(true);
    setApiError('');

    try {
      await login(data.email, data.password, data.role);
      
      // Redirect based on role
      const redirectPaths: Record<string, string> = {
        CLIENT: '/dashboard/client',
        ADVISOR: '/dashboard/advisor',
        DIRECTOR: '/dashboard/director',
      };
      
      const targetPath = redirectPaths[data.role] || '/dashboard/client';
      router.push(`/${locale}${targetPath}`);
    } catch (error: any) {
      setApiError(error.response?.data?.message || 'Erreur de connexion');
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

      <Select
        label="Se connecter en tant que"
        {...register('role')}
        error={errors.role?.message}
        options={[
          { value: 'CLIENT', label: 'Client' },
          { value: 'ADVISOR', label: 'Conseiller' },
          { value: 'DIRECTOR', label: 'Directeur' },
        ]}
      />

      <FormField
        name="email"
        label="Email"
        type="email"
        placeholder="exemple@email.com"
        register={register}
        error={errors.email}
        autoComplete="email"
      />

      <FormField
        name="password"
        label="Mot de passe"
        type="password"
        placeholder="••••••••"
        register={register}
        error={errors.password}
        autoComplete="current-password"
      />

      <Button
        type="submit"
        fullWidth
        isLoading={isLoading}
        disabled={isLoading}
      >
        Se connecter
      </Button>
    </form>
  );
}
