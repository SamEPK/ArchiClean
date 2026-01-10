'use client';

import React from 'react';
import { UseFormRegister, FieldError } from 'react-hook-form';
import { Input, InputProps } from '../atoms/Input';

interface FormFieldProps extends Omit<InputProps, 'error'> {
  name: string;
  register: UseFormRegister<any>;
  error?: FieldError;
  validation?: Record<string, any>;
}

export function FormField({
  name,
  register,
  error,
  validation,
  ...inputProps
}: FormFieldProps) {
  return (
    <Input
      {...inputProps}
      {...register(name, validation)}
      error={error?.message}
    />
  );
}
