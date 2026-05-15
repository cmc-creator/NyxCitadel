import NextAuth, { type DefaultSession } from 'next-auth';
import Credentials from 'next-auth/providers/credentials';
import { prisma } from '@/lib/prisma';
import { compare } from 'bcryptjs';
import { z } from 'zod';
import type { UserRole } from '@prisma/client';
import { authConfig } from '@/auth.config';
import { verifySync } from 'otplib';

// Extend the session and JWT types to include role, facilityId, and department
declare module 'next-auth' {
  interface Session {
    user: {
      id: string;
      role: UserRole;
      facilityId: string;
      department: string | null;
    } & DefaultSession['user'];
  }

  interface User {
    role: UserRole;
    facilityId: string;
    department: string | null;
  }
}

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
  totpToken: z.string().optional(),
});

export const { handlers, auth, signIn, signOut } = NextAuth({
  basePath: '/api/nyx-auth',
  ...authConfig,
  session: { strategy: 'jwt', maxAge: 8 * 60 * 60 }, // 8-hour sessions
  providers: [
    Credentials({
      name: 'credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
        totpToken: { label: 'Auth Code', type: 'text' },
      },
      async authorize(credentials: Partial<Record<"email" | "password" | "totpToken", unknown>>) {
        const parsed = loginSchema.safeParse(credentials);
        if (!parsed.success) return null;

        const user = await prisma.user.findUnique({
          where: { email: parsed.data.email },
          select: {
            id: true, email: true, name: true, image: true, passwordHash: true,
            role: true, facilityId: true, department: true, isActive: true,
            totpEnabled: true, totpSecret: true, backupCodes: true,
          },
        });

        if (!user || !user.passwordHash || !user.isActive) return null;

        const passwordValid = await compare(
          parsed.data.password,
          user.passwordHash
        );

        if (!passwordValid) return null;

        // 2FA check
        if (user.totpEnabled && user.totpSecret) {
          const token = typeof parsed.data.totpToken === 'string' ? parsed.data.totpToken.replace(/\s/g, '') : '';
          if (!token) return null; // 2FA required but no code provided
          const verifyResult = verifySync({ token, secret: user.totpSecret });
          const isValidTotp = verifyResult.valid;
          // Also allow backup code
          if (!isValidTotp) {
            const codes = user.backupCodes ?? [];
            const backupMatch = codes.findIndex(bc => bc === token);
            if (backupMatch === -1) return null;
            // Consume backup code (one-time use)
            const remaining = codes.filter((_, i) => i !== backupMatch);
            await prisma.user.update({ where: { id: user.id }, data: { backupCodes: remaining } });
          }
        }

        // Update last login
        await prisma.user.update({
          where: { id: user.id },
          data: { lastLoginAt: new Date() },
        });

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          image: user.image,
          role: user.role,
          facilityId: user.facilityId,
          department: user.department ?? null,
        };
      },
    }),
  ],
});
