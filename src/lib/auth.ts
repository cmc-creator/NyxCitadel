import NextAuth, { type DefaultSession } from 'next-auth';
import Credentials from 'next-auth/providers/credentials';
import { prisma } from '@/lib/prisma';
import { compare } from 'bcryptjs';
import { z } from 'zod';
import type { UserRole } from '@prisma/client';
import { authConfig } from '@/auth.config';

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
      },
      async authorize(credentials: Partial<Record<"email" | "password", unknown>>) {
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
