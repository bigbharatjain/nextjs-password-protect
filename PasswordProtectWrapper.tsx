'use client';

import { ReactNode } from 'react';
import { PasswordProtectProvider, usePasswordProtect } from './context';
import { PasswordProtect } from './PasswordProtect';
import { PasswordProtectConfig } from './types';

interface PasswordProtectWrapperProps {
  children: ReactNode;
  config: PasswordProtectConfig;
}

function ProtectedContent({ children }: { children: ReactNode }) {
  const { isAuthenticated } = usePasswordProtect();

  // isAuthenticated will be false during initial verification
  // The provider handles the loading state
  if (!isAuthenticated) {
    return <PasswordProtect />;
  }

  return <>{children}</>;
}

export function PasswordProtectWrapper({ children, config }: PasswordProtectWrapperProps) {
  return (
    <PasswordProtectProvider config={config}>
      <ProtectedContent>{children}</ProtectedContent>
    </PasswordProtectProvider>
  );
}

