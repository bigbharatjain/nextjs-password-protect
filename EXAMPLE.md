# Password Protect - Usage Examples

## Example 1: Basic Implementation

```tsx
// app/layout.tsx
import { PasswordProtectWrapper } from '@/packages/password-protect';

export default function RootLayout({ children }) {
  return (
    <html>
      <body>
        <PasswordProtectWrapper
          config={{
            password: "mySecurePassword123",
          }}
        >
          {children}
        </PasswordProtectWrapper>
      </body>
    </html>
  );
}
```

## Example 2: Secure Server-Side Validation (Recommended)

```tsx
// app/layout.tsx
import { PasswordProtectWrapper } from '@/packages/password-protect';

export default function RootLayout({ children }) {
  return (
    <html>
      <body>
        <PasswordProtectWrapper
          config={{
            // Password validated server-side via /api/auth/verify
            // Set APP_PASSWORD in .env.local (without NEXT_PUBLIC prefix)
            logo: "/logo.svg",
          }}
        >
          {children}
        </PasswordProtectWrapper>
      </body>
    </html>
  );
}
```

**Environment Variable (.env.local):**
```env
APP_PASSWORD=your-secure-password-here
```

**API Route (already included):** `/api/auth/verify/route.ts`

## Example 3: Custom Branding

```tsx
import { PasswordProtectWrapper } from '@/packages/password-protect';
import Image from 'next/image';

export default function RootLayout({ children }) {
  return (
    <html>
      <body>
        <PasswordProtectWrapper
          config={{
            password: "secure123",
            logo: (
              <Image
                src="/company-logo.png"
                alt="Company Logo"
                width={120}
                height={40}
                priority
              />
            ),
            title: "Welcome to Our Platform",
            description: "Enter your access code to continue",
            placeholder: "Access Code",
            errorMessage: "Invalid access code. Please contact support.",
          }}
        >
          {children}
        </PasswordProtectWrapper>
      </body>
    </html>
  );
}
```

## Example 4: Advanced Usage with Callbacks

```tsx
import { PasswordProtectWrapper } from '@/packages/password-protect';
import { useRouter } from 'next/navigation';

export default function RootLayout({ children }) {
  const router = useRouter();

  return (
    <html>
      <body>
        <PasswordProtectWrapper
          config={{
            password: "admin123",
            logo: "/logo.svg",
            persistAuth: true,
            storageKey: "app-auth-token",
            onSuccess: () => {
              console.log("User authenticated successfully");
              // Track analytics, etc.
            },
            onError: () => {
              console.log("Authentication failed");
              // Log security event, etc.
            },
          }}
        >
          {children}
        </PasswordProtectWrapper>
      </body>
    </html>
  );
}
```

## Example 5: Manual Control with Hook

```tsx
'use client';

import { PasswordProtectProvider, usePasswordProtect, PasswordProtect } from '@/packages/password-protect';

function AppContent({ children }) {
  const { isAuthenticated, logout } = usePasswordProtect();

  return (
    <>
      {isAuthenticated && (
        <header>
          <button onClick={logout}>Logout</button>
        </header>
      )}
      {children}
    </>
  );
}

export default function RootLayout({ children }) {
  return (
    <html>
      <body>
        <PasswordProtectProvider
          config={{
            password: "secure123",
            logo: "/logo.svg",
          }}
        >
          <AppContent>{children}</AppContent>
        </PasswordProtectProvider>
      </body>
    </html>
  );
}
```

## Environment Variables Setup

Create a `.env.local` file in your project root:

```env
# ✅ SECURE: Server-side variable (not exposed to client)
APP_PASSWORD=your-secure-password-here

# ❌ INSECURE: Client-side variable (exposed in bundle)
# NEXT_PUBLIC_APP_PASSWORD=your-password
```

**Important Security Notes:**
- Use `APP_PASSWORD` (without `NEXT_PUBLIC_` prefix) for secure server-side validation
- Variables with `NEXT_PUBLIC_` prefix are exposed to the client JavaScript bundle
- Never commit `.env.local` to version control. Add it to `.gitignore`
- The password is validated via `/api/auth/verify` API route (included in package)

