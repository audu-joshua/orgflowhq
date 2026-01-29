import NextAuth, { NextAuthOptions } from "next-auth";
import { MongoDBAdapter } from "@auth/mongodb-adapter";
import clientPromise from "@/lib/mongodb";

import CredentialsProvider from "next-auth/providers/credentials";
import { User } from "@/models/User";
import { connectToDatabase } from "@/lib/mongodb";
import bcrypt from "bcryptjs";

export const authOptions: NextAuthOptions = {
    adapter: MongoDBAdapter(clientPromise),
    providers: [
        CredentialsProvider({
            name: "Credentials",
            credentials: {
                email: { label: "Email", type: "email" },
                password: { label: "Password", type: "password" }
            },
            async authorize(credentials) {
                await connectToDatabase();
                if (!credentials?.email || !credentials?.password) return null;

                // Find user and include password for comparison
                const user = await User.findOne({ email: credentials.email.toLowerCase() }).select("+password");
                if (!user || !user.password) return null;

                const isValid = await bcrypt.compare(credentials.password, user.password);
                if (!isValid) return null;

                return {
                    id: user._id.toString(),
                    email: user.email,
                    name: user.name || user.fullName,
                    role: user.role,
                    memberships: user.memberships
                };
            }
        })
    ],
    callbacks: {
        async session({ session, token }: any) {
            await connectToDatabase();
            // Find user and populate organization data in memberships
            const dbUser = await User.findOne({ email: session.user.email }).populate("memberships.organizationId");

            if (dbUser) {
                session.user.id = dbUser._id.toString();
                session.user.role = dbUser.role;
                session.user.memberships = dbUser.memberships.map((m: any) => ({
                    organizationId: m.organizationId?._id?.toString(),
                    name: m.organizationId?.name,
                    slug: m.organizationId?.slug,
                    role: m.role
                }));
            }
            return session;
        },
        async jwt({ token, user }: any) {
            if (user) {
                token.role = user.role;
                token.memberships = user.memberships;
            }
            return token;
        }
    },
    pages: {
        signIn: "/login",
        error: "/login",
    },
    session: {
        strategy: "jwt",
    },
};

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };
