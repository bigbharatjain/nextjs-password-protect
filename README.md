# NextJs Password Protect Package

A reusable password protection module for Next.js applications that provides a beautiful, customizable password protection screen with secure token-based authentication.

## Installation

```bash
npm install nextjs-password-protect
# or
yarn add nextjs-password-protect
# or
pnpm add nextjs-password-protect
```

## Features

- 🔒 Simple password-based authentication
- 🎨 Modern, responsive UI that automatically inherits your application's theme
- 🌓 Automatic theme support (light/dark mode) via CSS variables
- 🖼️ Custom brand logo support
- 💾 Optional localStorage persistence
- 🔐 Secure token-based authentication (prevents localStorage manipulation)
- ⚙️ Highly configurable
- 📦 Reusable package structure
- 🎯 TypeScript support

## Quick Start

### Step 1: Install the Package

```bash
npm install nextjs-password-protect
```

### Step 2: Create API Route

Copy the API route template to your Next.js app:

**Option A: Copy from node_modules**
```bash
cp node_modules/nextjs-password-protect/api-route-template.ts app/api/auth/verify/route.ts
```

**Option B: Create manually**

Create `app/api/auth/verify/route.ts`:

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { createHash, randomBytes } from 'crypto';

// In-memory token store (in production, consider using Redis or a database)
const tokenStore = new Map<string, { expiresAt: number; createdAt: number }>();

setInterval(() => {
  const now = Date.now();
  for (const [tokenHash, data] of tokenStore.entries()) {
    if (data.expiresAt < now) {
      tokenStore.delete(tokenHash);
    }
  }
}, 60000);

function generateToken(): string {
  return randomBytes(32).toString('hex');
}

function createTokenHash(token: string): string {
  return createHash('sha256').update(token).digest('hex');
}

export async function POST(request: NextRequest) {
  try {
    const { password, token } = await request.json();
    
    if (token) {
      const tokenHash = createTokenHash(token);
      const tokenData = tokenStore.get(tokenHash);
      
      if (!tokenData || tokenData.expiresAt < Date.now()) {
        return NextResponse.json(
          { success: false, error: 'Invalid or expired token' },
          { status: 401 }
        );
      }
      
      const expiresIn = 24 * 60 * 60 * 1000;
      tokenData.expiresAt = Date.now() + expiresIn;
      
      return NextResponse.json({ success: true, valid: true });
    }
    
    if (!password) {
      return NextResponse.json(
        { success: false, error: 'Password is required' },
        { status: 400 }
      );
    }
    
    const correctPassword = process.env.APP_PASSWORD || 'demo123';
    
    if (password !== correctPassword) {
      return NextResponse.json(
        { success: false, error: 'Incorrect password' },
        { status: 401 }
      );
    }
    
    const token = generateToken();
    const tokenHash = createTokenHash(token);
    const expiresIn = 24 * 60 * 60 * 1000;
    
    tokenStore.set(tokenHash, {
      expiresAt: Date.now() + expiresIn,
      createdAt: Date.now(),
    });
    
    return NextResponse.json({
      success: true,
      token,
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: 'Invalid request' },
      { status: 400 }
    );
  }
}
```

### Step 3: Configure Environment Variable

Create `.env.local` in your project root:

```env
APP_PASSWORD=your-secure-password-here
```

### Step 4: Use in Your App

Wrap your application content in `app/layout.tsx`:

```tsx
import { PasswordProtectWrapper } from 'nextjs-password-protect';

export default function RootLayout({ children }) {
  return (
    <html>
      <body>
        <PasswordProtectWrapper
          config={{
            logo: "/logo.svg", // Optional
            title: "Password Protected", // Optional
          }}
        >
          {children}
        </PasswordProtectWrapper>
      </body>
    </html>
  );
}
```

## Basic Usage

```tsx
import { PasswordProtectWrapper } from 'nextjs-password-protect';

export default function RootLayout({ children }) {
  return (
    <html>
      <body>
        <PasswordProtectWrapper
          config={{
            // Password validated via /api/auth/verify endpoint
            // Set APP_PASSWORD in .env.local (without NEXT_PUBLIC prefix)
          }}
        >
          {children}
        </PasswordProtectWrapper>
      </body>
    </html>
  );
}
```

## API Reference

### PasswordProtectWrapper

The main wrapper component that protects your application.

**Props:**
- `children`: ReactNode - The content to protect
- `config`: PasswordProtectConfig - Configuration object

### PasswordProtectConfig

| Property | Type | Default | Description |
|----------|------|---------|-------------|
| `password` | `string` | `undefined` | ⚠️ **Deprecated** - Password for client-side validation (visible in bundle). Omit to use secure server-side validation. |
| `apiEndpoint` | `string` | `"/api/auth/verify"` | API endpoint for server-side password validation |
| `logo` | `string \| ReactNode` | `undefined` | Optional brand logo (URL/path or React component) |
| `title` | `string` | `"Password Protected"` | Title text for the password screen |
| `description` | `string` | `"Please enter the password..."` | Description text |
| `placeholder` | `string` | `"Enter password"` | Placeholder for password input |
| `errorMessage` | `string` | `"Incorrect password..."` | Error message on wrong password |
| `className` | `string` | `undefined` | Custom className for container |
| `onSuccess` | `() => void` | `undefined` | Callback on successful authentication |
| `onError` | `() => void` | `undefined` | Callback on failed authentication |
| `storageKey` | `string` | `"password-protect-auth"` | localStorage key for persistence |
| `persistAuth` | `boolean` | `true` | Whether to persist auth state |

## Styling

The component automatically inherits your application's theme using CSS variables:
- `--background`: Background color (defaults to white)
- `--foreground`: Text color (defaults to dark gray)
- `--border`: Border color (defaults to light gray)

The component will automatically adapt to your application's theme (light/dark mode) without any additional configuration. You can customize the appearance using the `className` prop or by overriding styles.

**Note:** If your application uses different CSS variable names, you can override styles using the `className` prop or by providing custom CSS.

## Security Notes

⚠️ **Important Security Considerations:**

1. **Token-Based Authentication**: The package uses secure token-based authentication to prevent localStorage manipulation attacks. Tokens are:
   - Generated server-side using cryptographically secure random bytes
   - Hashed and stored server-side (only hash is stored, not the token)
   - Validated on every page load/refresh
   - Automatically expire after 24 hours
   - Cannot be forged by manually setting localStorage

2. **Server-Side Validation (Recommended)**: By default, the package uses server-side validation via API route. The password is stored in `APP_PASSWORD` (without `NEXT_PUBLIC` prefix) and never exposed to the client bundle.

3. **Client-Side Protection Limitation**: If using the legacy `password` prop in config, the password will be visible in the JavaScript bundle and localStorage can be manually manipulated. This is only suitable for casual access control, NOT for sensitive data.

4. **Token Storage**: Tokens are stored in-memory on the server. For production with multiple server instances, consider using Redis or a database for token storage.

5. **Password Storage**: Never commit passwords to version control. Always use environment variables in `.env.local` (which should be in `.gitignore`).

6. **HTTPS**: Always use HTTPS in production to prevent password and token interception during transmission.

7. **Not for Sensitive Data**: This is a basic password protection. For production applications with sensitive data, implement proper authentication systems (OAuth, JWT, etc.).

## Examples

See [EXAMPLE.md](./EXAMPLE.md) for detailed usage examples.

## Setup Guide

See [SETUP.md](./SETUP.md) for detailed setup instructions.

## License

MIT
