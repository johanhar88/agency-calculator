import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";

const handler = NextAuth({
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        username: { label: "Username", type: "text", placeholder: "admin" },
        password: { label: "Password", type: "password", placeholder: "admin123" }
      },
      async authorize(credentials) {
        // Untuk contoh ini, kita hardcode username & password.
        // Di aplikasi nyata, Anda akan mengeceknya ke database Node.js Anda.
        if (credentials?.username === "admin" && credentials?.password === "admin123") {
          return { id: "1", name: "Admin Agency", email: "admin@agency.com" };
        }
        return null;
      }
    })
  ],
  pages: {
    signIn: '/', // Arahkan halaman login ke home
  },
  secret: process.env.NEXTAUTH_SECRET || "rahasia-super-aman-123",
});

export { handler as GET, handler as POST };