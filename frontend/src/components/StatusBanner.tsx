import React from 'react';

interface StatusBannerProps {
  variant: 'ok' | 'warn' | 'info';
  message: string;
}

export const StatusBanner: React.FC<StatusBannerProps> = ({ variant, message }) => {
  const className = `status-banner ${variant === 'ok' ? 'status-ok' : variant === 'warn' ? 'status-warn' : 'status-info'}`;
  return <div className={className}>{message}</div>;
};
