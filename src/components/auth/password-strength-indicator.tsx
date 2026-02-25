'use client';

import { Check, X } from 'lucide-react';
import { cn } from '@/lib/utils';

interface PasswordRequirement {
  id: string;
  label: string;
  validator: (password: string) => boolean;
}

const PASSWORD_REQUIREMENTS: PasswordRequirement[] = [
  {
    id: 'length',
    label: 'Mínimo 8 caracteres',
    validator: (password: string) => password.length >= 8,
  },
  {
    id: 'uppercase',
    label: 'Al menos 1 mayúscula',
    validator: (password: string) => /[A-Z]/.test(password),
  },
  {
    id: 'lowercase',
    label: 'Al menos 1 minúscula',
    validator: (password: string) => /[a-z]/.test(password),
  },
  {
    id: 'number',
    label: 'Al menos 1 número',
    validator: (password: string) => /[0-9]/.test(password),
  },
];

interface PasswordStrengthIndicatorProps {
  password: string;
  className?: string;
}

export function PasswordStrengthIndicator({ password, className }: PasswordStrengthIndicatorProps) {
  const getRequirementStatus = (requirement: PasswordRequirement) => {
    return password.length > 0 ? requirement.validator(password) : null;
  };

  return (
    <div
      className={cn('rounded-lg border bg-muted/50 p-3 space-y-2', className)}
      data-testid="password-requirements"
    >
      <p className="text-xs font-medium text-muted-foreground">Requisitos de contraseña:</p>
      <ul className="space-y-1">
        {PASSWORD_REQUIREMENTS.map(requirement => {
          const status = getRequirementStatus(requirement);
          const isMet = status === true;
          const isNotMet = status === false;

          return (
            <li
              key={requirement.id}
              className={cn(
                'flex items-center gap-2 text-sm transition-colors',
                isMet && 'text-green-600',
                isNotMet && 'text-red-500',
                status === null && 'text-muted-foreground'
              )}
              data-testid={`requirement-${requirement.id}`}
              data-met={isMet ? 'true' : 'false'}
            >
              {isMet ? (
                <Check className="h-4 w-4 flex-shrink-0" />
              ) : isNotMet ? (
                <X className="h-4 w-4 flex-shrink-0" />
              ) : (
                <div className="h-4 w-4 flex-shrink-0 rounded-full border border-muted-foreground/50" />
              )}
              <span>{requirement.label}</span>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

// Export validation function for use in forms
export function validatePassword(password: string): { isValid: boolean; errors: string[] } {
  const errors: string[] = [];

  for (const requirement of PASSWORD_REQUIREMENTS) {
    if (!requirement.validator(password)) {
      errors.push(requirement.label);
    }
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
}

// Export requirements for external use
export { PASSWORD_REQUIREMENTS };
