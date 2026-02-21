import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { compare } from "bcryptjs";
import { prisma } from "./db";

export const {
  handlers: { GET, POST },
  auth,
  signIn,
  signOut,
} = NextAuth({
  session: { strategy: "jwt" },
  pages: {
    signIn: "/admin/login",
  },
  providers: [
    CredentialsProvider({
      id: "staff-login",
      name: "Staff Login",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null;

        const staff = await prisma.staffUser.findUnique({
          where: { email: credentials.email as string },
        });

        if (!staff || !staff.isActive) return null;

        const isValid = await compare(
          credentials.password as string,
          staff.hashedPassword
        );

        if (!isValid) return null;

        return {
          id: staff.id,
          name: staff.name,
          email: staff.email,
          role: staff.role,
        };
      },
    }),
    CredentialsProvider({
      id: "customer-login",
      name: "Customer Login",
      credentials: {
        phone: { label: "Phone", type: "tel" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.phone || !credentials?.password) return null;

        const customer = await prisma.profile.findUnique({
          where: { phone: credentials.phone as string },
        });

        if (!customer || !customer.hashedPassword) return null;

        const isValid = await compare(
          credentials.password as string,
          customer.hashedPassword
        );

        if (!isValid) return null;

        return {
          id: customer.id,
          name: customer.name,
          email: customer.email || "",
          phone: customer.phone,
          role: "CUSTOMER",
        };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = (user as any).role;
        token.phone = (user as any).phone;
      }
      return token;
    },
    async session({ session, token }) {
      if (token) {
        session.user.id = token.id as string;
        (session.user as any).role = token.role;
        (session.user as any).phone = token.phone;
      }
      return session;
    },
    async authorized({ auth, request }) {
      const pathname = request.nextUrl.pathname;
      const isLoginPage = pathname === "/admin/login";
      const isAdmin = pathname.startsWith("/admin");
      const isLoggedIn = !!auth?.user;
      const isStaff = ["OWNER", "MANAGER", "STAFF"].includes(
        (auth?.user as any)?.role
      );

      // Always allow access to the login page
      if (isLoginPage) return true;

      if (isAdmin) {
        if (!isLoggedIn || !isStaff) return false;
        return true;
      }

      return true;
    },
  },
});
