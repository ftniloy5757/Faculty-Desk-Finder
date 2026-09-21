import NextAuth, { NextAuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";

/**
 * Validates that an email strictly belongs to BRAC University.
 * Only allows emails ending with "@bracu.ac.bd" or ".bracu.ac.bd" (e.g. @g.bracu.ac.bd).
 */
export function isAuthorizedBracuEmail(email?: string | null): boolean {
  if (!email) return false;
  const normalized = email.toLowerCase().trim();
  return normalized.endsWith("@bracu.ac.bd") || normalized.endsWith(".bracu.ac.bd");
}

export const authOptions: NextAuthOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID as string,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET as string,
      authorization: {
        params: {
          prompt: "select_account",
        },
      },
    }),
  ],
  callbacks: {
    async signIn({ user }) {
      const email = user.email?.toLowerCase().trim();
      if (!isAuthorizedBracuEmail(email)) {
        // Strictly reject any email not ending with bracu.ac.bd
        return "/auth/error?error=AccessDenied";
      }
      return true;
    },
    async jwt({ token, user }) {
      if (user && user.email) {
        const email = user.email.toLowerCase().trim();
        if (isAuthorizedBracuEmail(email)) {
          if (email.endsWith("@g.bracu.ac.bd")) {
            token.role = "student";
          } else {
            token.role = "faculty";
          }
        }
      }
      return token;
    },
    async session({ session, token }) {
      if (session?.user) {
        (session.user as Record<string, unknown>).role = token.role;
      }
      return session;
    },
  },
  secret: process.env.NEXTAUTH_SECRET || "faculty-desk-finder-dev-secret",
  pages: {
    signIn: "/auth/signin",
    error: "/auth/error",
  },
};

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };
