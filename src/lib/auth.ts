import NextAuth, { type DefaultSession } from 'next-auth';
import Credentials from 'next-auth/providers/credentials';
import { prisma } from '@/lib/prisma';
import { compare } from 'bcryptjs';
import { z } from 'zod';
import type { UserRole } from '@prisma/client';
import { authConfig } from '@/auth.config';
import { authenticator } from 'otplib';

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
        totpToken: { label: 'Authenticator Code', type: 'text' },
      },
      async authorize(credentials: Partial<Record<"email" | "password" | "totpToken", unknown>>) {
        const parsed = loginSchema.safeParse(credentials);
        if (!parsed.success) return null;

        const user = await prisma.user.findUnique({
          where: { email: parsed.data.email },
        });

        if (!user || !user.passwordHash || !user.isActive) return null;

        const passwordValid = await compare(
          parsed.data.password,
          user.passwordHash
        );

        if (!passwordValid) return null;

        // Enforce TOTP if enabled
        if (user.totpEnabled) {
          const token = parsed.data.totpToken?.trim() ?? '';
          if (!token) return null;

          // Check backup codes first
          if (user.backupCodes.includes(token.toUpperCase())) {
            // Consume the backup code
            await prisma.user.update({
              where: { id: user.id },
              data: { backupCodes: user.backupCodes.filter(c => c !== token.toUpperCase()) },
            });
          } else {
            // Verify TOTP
            const isValid = user.totpSecret
              ? authenticator.verify({ token, secret: user.totpSecret })
              : false;
            if (!isValid) return null;
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
