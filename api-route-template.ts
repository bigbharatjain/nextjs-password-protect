/**
 * API Route Template for Password Protection
 * 
 * Copy this file to: app/api/auth/verify/route.ts (or your preferred path)
 * 
 * This route handles server-side password validation and token management,
 * keeping the password secure and preventing localStorage manipulation attacks.
 */

import { NextRequest, NextResponse } from 'next/server';
import { createHash, randomBytes } from 'crypto';

// In-memory token store (in production, consider using Redis or a database)
// Format: { tokenHash: { expiresAt: number, createdAt: number } }
const tokenStore = new Map<string, { expiresAt: number; createdAt: number }>();

// Clean up expired tokens periodically
setInterval(() => {
  const now = Date.now();
  for (const [tokenHash, data] of tokenStore.entries()) {
    if (data.expiresAt < now) {
      tokenStore.delete(tokenHash);
    }
  }
}, 60000); // Clean up every minute

function generateToken(): string {
  return randomBytes(32).toString('hex');
}

function createTokenHash(token: string): string {
  return createHash('sha256').update(token).digest('hex');
}

export async function POST(request: NextRequest) {
  try {
    const { password, token } = await request.json();
    
    // Token validation endpoint (prevents localStorage manipulation)
    if (token) {
      const tokenHash = createTokenHash(token);
      const tokenData = tokenStore.get(tokenHash);
      
      if (!tokenData) {
        return NextResponse.json(
          { success: false, error: 'Invalid token' },
          { status: 401 }
        );
      }
      
      if (tokenData.expiresAt < Date.now()) {
        tokenStore.delete(tokenHash);
        return NextResponse.json(
          { success: false, error: 'Token expired' },
          { status: 401 }
        );
      }
      
      // Token is valid, refresh expiration
      const expiresIn = 24 * 60 * 60 * 1000; // 24 hours
      tokenData.expiresAt = Date.now() + expiresIn;
      
      return NextResponse.json({ success: true, valid: true });
    }
    
    // Password validation endpoint
    if (!password) {
      return NextResponse.json(
        { success: false, error: 'Password is required' },
        { status: 400 }
      );
    }
    
    // Get password from server-side environment variable (NOT NEXT_PUBLIC)
    const correctPassword = process.env.APP_PASSWORD || 'demo123';
    
    if (password !== correctPassword) {
      return NextResponse.json(
        { success: false, error: 'Incorrect password' },
        { status: 401 }
      );
    }
    
    // Generate secure token
    const token = generateToken();
    const tokenHash = createTokenHash(token);
    const expiresIn = 24 * 60 * 60 * 1000; // 24 hours
    
    tokenStore.set(tokenHash, {
      expiresAt: Date.now() + expiresIn,
      createdAt: Date.now(),
    });
    
    return NextResponse.json({
      success: true,
      token, // Return plain token to client (hash is stored server-side)
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: 'Invalid request' },
      { status: 400 }
    );
  }
}

