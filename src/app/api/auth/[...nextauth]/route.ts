import NextAuth, { NextAuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";

export const authOptions: NextAuthOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID as string,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET as string,
    }),
  ],
  callbacks: {
    async signIn({ user }) {
      const email = user.email?.toLowerCase().trim();
      if (!email) return false;

      // Only allow BRACU domains
      if (
        email.endsWith("@bracu.ac.bd") ||
        email.endsWith("@g.bracu.ac.bd")
      ) {
        return true;
      }

      // Reject all other domains
      return "/auth/error?error=AccessDenied";
    },
    async jwt({ token, user }) {
      if (user && user.email) {
        const email = user.email.toLowerCase().trim();
        if (email.endsWith("@g.bracu.ac.bd")) {
          token.role = "student";
        } else if (email.endsWith("@bracu.ac.bd")) {
          token.role = "faculty";
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
