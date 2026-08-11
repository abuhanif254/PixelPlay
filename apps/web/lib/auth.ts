import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: "Mock Login",
      credentials: {
        username: { label: "Username", type: "text", placeholder: "player1" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        // Mock user for testing the UI
        if (credentials?.username === "player1" && credentials?.password === "password") {
          return { id: "1", name: "Player One", email: "player1@pixelplay.com" };
        }
        return null;
      }
    })
  ],
  pages: {
    signIn: '/login', // We would create a custom login page here
  },
  session: {
    strategy: "jwt"
  },
  callbacks: {
    async session({ session, token }) {
      if (session.user && token.sub) {
        // @ts-ignore
        session.user.id = token.sub;
      }
      return session;
    }
  }
};
