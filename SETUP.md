# Setup Guide - Password Protect Package

This guide will help you set up the password protection package in a new project.

## Quick Setup (3 Steps)

### Step 1: Copy the Package

Copy the `password-protect` package directory to your project:
- From: `src/packages/password-protect/`
- To: `src/packages/password-protect/` (or your preferred location)

### Step 2: Create API Route

The API route must be created in your Next.js app (it's not part of the package bundle).

**Option A: Copy the Template**
1. Copy `api-route-template.ts` from the package
2. Create the directory: `app/api/auth/verify/`
3. Paste and rename to `route.ts`

**Option B: Create Manually**

Create `app/api/auth/verify/route.ts`:

```typescript
import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { password } = await request.json();
    const correctPassword = process.env.APP_PASSWORD || 'demo123';
    
    if (!password) {
      return NextResponse.json(
        { success: false, error: 'Password is required' },
        { status: 400 }
      );
    }
    
    if (password === correctPassword) {
      return NextResponse.json({ success: true });
    }
    
    return NextResponse.json(
      { success: false, error: 'Incorrect password' },
      { status: 401 }
    );
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

**Important:** 
- Use `APP_PASSWORD` (without `NEXT_PUBLIC_` prefix)
- Never commit `.env.local` to version control
- Add `.env.local` to `.gitignore`

### Step 4: Integrate in Your App

Wrap your app content in `app/layout.tsx`:

```tsx
import { PasswordProtectWrapper } from '@/packages/password-protect';

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

## Custom API Endpoint

If you want to use a different endpoint path:

1. Create the route at your custom path (e.g., `app/api/custom/auth/route.ts`)
2. Update the config:

```tsx
<PasswordProtectWrapper
  config={{
    apiEndpoint: "/api/custom/auth",
  }}
>
```

## Verification

1. Start your dev server: `npm run dev`
2. Visit your app - you should see the password protection screen
3. Enter the password from `APP_PASSWORD`
4. You should gain access to the app

## Troubleshooting

**Password not working?**
- Check that `APP_PASSWORD` is set in `.env.local`
- Restart your dev server after changing `.env.local`
- Check browser console for API errors

**API route not found?**
- Verify the route exists at `app/api/auth/verify/route.ts`
- Check that the file exports a `POST` function
- Ensure Next.js can find the route (check file structure)

**Package not found?**
- Verify the package is in the correct location
- Check your import path matches the package location
- Ensure TypeScript paths are configured if using `@/packages/`

## Security Features

The package includes token-based authentication that prevents localStorage manipulation:

- **Secure Tokens**: Tokens are generated server-side using cryptographically secure random bytes
- **Server-Side Validation**: Tokens are validated on every page load/refresh
- **Token Expiration**: Tokens automatically expire after 24 hours
- **No LocalStorage Bypass**: Manually setting localStorage won't work - tokens must be validated server-side

## Security Reminders

✅ **DO:**
- Use `APP_PASSWORD` (server-side only)
- Keep `.env.local` in `.gitignore`
- Use HTTPS in production
- Restart server after changing environment variables
- Use server-side validation (omit `password` prop) for secure authentication

❌ **DON'T:**
- Use `NEXT_PUBLIC_APP_PASSWORD` (exposed to client)
- Commit passwords to version control
- Use client-side validation (`password` prop) for sensitive data
- Use this for highly sensitive applications (use proper auth instead)

