import React from 'react';
import { View, Text } from 'react-native';

export interface BadgeProps {
  label: string | number;
  variant?: 'default' | 'accent' | 'success' | 'warning' | 'error';
  size?: 'sm' | 'md';
  className?: string;
}

export const Badge: React.FC<BadgeProps> = ({
  label,
  variant = 'default',
  size = 'md',
  className = '',
}) => {
  const variantClasses = {
    default: 'bg-bg-tertiary',
    accent: 'bg-accent-primary',
    success: 'bg-success',
    warning: 'bg-warning',
    error: 'bg-error',
  };

  const textVariantClasses = {
    default: 'text-text-secondary',
    accent: 'text-white',
    success: 'text-white',
    warning: 'text-white',
    error: 'text-white',
  };

  const sizeClasses = {
    sm: 'px-2 py-0.5',
    md: 'px-3 py-1',
  };

  const textSizeClasses = {
    sm: 'text-xs',
    md: 'text-sm',
  };

  return (
    <View
      className={`rounded-full ${variantClasses[variant]} ${sizeClasses[size]} ${className}`}
    >
      <Text className={`${textSizeClasses[size]} ${textVariantClasses[variant]} font-semibold`}>
        {label}
      </Text>
    </View>
  );
};

