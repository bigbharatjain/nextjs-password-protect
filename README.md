# Password Protect Package

A reusable password protection module for Next.js applications that provides a beautiful, customizable password protection screen.

## Features

- 🔒 Simple password-based authentication
- 🎨 Modern, responsive UI that automatically inherits your application's theme
- 🌓 Automatic theme support (light/dark mode) via CSS variables
- 🖼️ Custom brand logo support
- 💾 Optional localStorage persistence
- ⚙️ Highly configurable
- 📦 Reusable package structure
- 🎯 TypeScript support

## Installation

This package is designed to be used within your Next.js application.

1. **Copy the package** to your project (e.g., `src/packages/password-protect/`)
2. **Set up the API route** (see [Setup Guide](#setup-guide) below)
3. **Import and use** the component:

```typescript
import { PasswordProtectWrapper } from '@/packages/password-protect';
```

**📖 For detailed setup instructions, see [SETUP.md](./SETUP.md)**

## Quick Start

### Basic Usage (Secure - Server-Side Validation)

Wrap your application content with `PasswordProtectWrapper`. The password is validated server-side:

```tsx
import { PasswordProtectWrapper } from '@/packages/password-protect';

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

**Setup Required:**
1. Copy the API route template from `api-route-template.ts` to `app/api/auth/verify/route.ts` in your project
2. Set `APP_PASSWORD` in your `.env.local` file (without `NEXT_PUBLIC` prefix)

See [Setup Guide](#setup-guide) below for detailed instructions.

### With Custom Logo

```tsx
<PasswordProtectWrapper
  config={{
    password: "your-secure-password",
    logo: "/path/to/your/logo.svg", // or a React component
    title: "Welcome",
    description: "Enter your password to continue",
  }}
>
  {children}
</PasswordProtectWrapper>
```

### Advanced Configuration

```tsx
<PasswordProtectWrapper
  config={{
    password: "your-secure-password",
    logo: "/logo.svg",
    title: "Protected Area",
    description: "This area requires authentication",
    placeholder: "Enter your password",
    errorMessage: "Access denied. Please try again.",
    persistAuth: true, // Remember authentication in localStorage
    storageKey: "my-app-auth", // Custom storage key
    onSuccess: () => console.log("Access granted!"),
    onError: () => console.log("Access denied!"),
    className: "custom-class",
  }}
>
  {children}
</PasswordProtectWrapper>
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

### usePasswordProtect Hook

For advanced usage, you can use the hook directly:

```tsx
import { PasswordProtectProvider, usePasswordProtect } from '@/packages/password-protect';

function MyComponent() {
  const { isAuthenticated, authenticate, logout } = usePasswordProtect();
  
  // Use authentication state
  return (
    <div>
      {isAuthenticated ? (
        <button onClick={logout}>Logout</button>
      ) : (
        <PasswordProtect />
      )}
    </div>
  );
}
```

## Setup Guide

### Step 1: Create API Route

The API route is **not included** in the package bundle and must be created in each project. 

1. Copy the template file from the package:
   - Source: `packages/password-protect/api-route-template.ts`
   - Destination: `app/api/auth/verify/route.ts` (or your preferred path)

2. If you prefer a different endpoint path, update the `apiEndpoint` in your config:
   ```tsx
   <PasswordProtectWrapper
     config={{
       apiEndpoint: "/api/custom/path", // Custom endpoint
     }}
   >
   ```

### Step 2: Configure Environment Variable

Create a `.env.local` file in your project root:

```env
APP_PASSWORD=your-secure-password-here
```

**Important:** Use `APP_PASSWORD` (without `NEXT_PUBLIC_` prefix) to keep the password server-side only.

## Environment Variables

### Secure Server-Side Validation (Recommended)

For production use, store your password in a **server-side** environment variable (without `NEXT_PUBLIC` prefix):

```env
APP_PASSWORD=your-secure-password
```

**Important:** The `NEXT_PUBLIC_` prefix exposes variables to the client bundle. Use `APP_PASSWORD` (without prefix) for security.

The password will be validated server-side via the `/api/auth/verify` endpoint, keeping it secure and never exposing it to the client.

### Legacy Client-Side Mode (Not Recommended)

If you need client-side validation (password will be visible in bundle), you can still pass it directly:

```tsx
<PasswordProtectWrapper
  config={{
    password: "your-password", // ⚠️ Visible in client bundle
  }}
>
```

**Warning:** This is less secure as:
- The password will be visible in the JavaScript bundle
- localStorage can be manually set to bypass authentication
- No server-side token validation

For secure authentication, use server-side validation (omit the `password` prop).

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

## Package Structure

```
password-protect/
├── index.ts                 # Main exports
├── types.ts                 # TypeScript types
├── context.tsx              # React context and provider
├── PasswordProtect.tsx      # Password protection UI component
├── PasswordProtectWrapper.tsx # Wrapper component
├── api-route-template.ts   # Template for API route (copy to your project)
└── README.md               # This file
```

**Important:** The API route is **not bundled** with the package. You must:
1. Copy `api-route-template.ts` to `app/api/auth/verify/route.ts` in your project
2. Or create your own API route following the same pattern

## License

This package is part of your application and follows the same license terms.

