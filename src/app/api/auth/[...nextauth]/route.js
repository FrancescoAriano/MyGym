import NextAuth from "next-auth";
import { PrismaAdapter } from "@next-auth/prisma-adapter";
import CredentialsProvider from "next-auth/providers/credentials";
import prisma from "@/lib/prisma";
import bcrypt from "bcryptjs";

export const authOptions = {
  adapter: PrismaAdapter(prisma),
  providers: [
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "text" },
        password: { label: "Password", type: "password" },
        entity: { label: "Entity", type: "text" },
      },
      async authorize(credentials) {
        // 1. Basic input validation
        if (
          !credentials?.email ||
          !credentials?.password ||
          !credentials?.entity
        ) {
          throw new Error("Missing credentials");
        }

        if (credentials.entity !== "user" && credentials.entity !== "gym") {
          throw new Error("Invalid entity");
        }

        let accountType;

        // 2. Retrieve account
        if (credentials.entity === "gym") {
          accountType = await prisma.gym.findUnique({
            where: { email: credentials.email },
          });
        } else if (credentials.entity === "user") {
          accountType = await prisma.user.findUnique({
            where: { email: credentials.email },
          });
        }

        if (!accountType) {
          throw new Error("Account not found");
        }

        // 3. Pre-password validation checks
        if (credentials.entity === "gym") {
          if (accountType.emailVerified === false) {
            throw new Error("Email not verified");
          }
        } else if (credentials.entity === "user") {
          if (!accountType.hashedPassword) {
            throw new Error("Account not activated yet");
          }
        }

        // 4. Check password to prevent timing attacks
        const isPasswordValid = await bcrypt.compare(
          credentials.password,
          accountType.hashedPassword
        );

        if (!isPasswordValid) {
          throw new Error("Invalid credentials");
        }

        // 5. Post-password validation checks
        if (credentials.entity === "gym") {
          if (accountType.status === "PENDING") {
            throw new Error("This gym is pending approval");
          } else if (accountType.status === "REJECTED") {
            throw new Error("This gym registration has been rejected");
          } else if (accountType.status !== "APPROVED") {
            throw new Error("This gym account is not active");
          }
        }

        return { ...accountType, entityType: credentials.entity };
      },
    }),
  ],
  session: { strategy: "jwt" },
  pages: {
    signIn: "/login",
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.entityType = user.entityType;
        if (user.entityType === "gym") {
          token.role = "gym";
        } else {
          token.role = user.role;
        }
      }
      return token;
    },
    async session({ session, token }) {
      if (token && session.user) {
        session.user.id = token.id;
        session.user.role = token.role;
        session.user.entityType = token.entityType;
      }
      return session;
    },
  },
  secret: process.env.NEXTAUTH_SECRET,
};

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };
