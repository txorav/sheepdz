import NextAuth, { NextAuthOptions } from "next-auth"
import CredentialsProvider from "next-auth/providers/credentials"
import { JWT } from "next-auth/jwt"
import bcrypt from "bcryptjs"
import { prisma } from "@/lib/prisma"

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null
        }

        const user = await prisma.user.findUnique({
          where: {
            email: credentials.email as string
          },
          include: {
            wilaya: true
          }
        })

        if (!user) {
          return null
        }

        const isPasswordValid = await bcrypt.compare(
          credentials.password as string,
          user.password
        )

        if (!isPasswordValid) {
          return null
        }

        return {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
          wilayaId: user.wilayaId || undefined,
          wilaya: user.wilaya ? {
            id: user.wilaya.id,
            name: user.wilaya.name,
            code: user.wilaya.code
          } : undefined
        }
      }
    })
  ],
  session: {
    strategy: "jwt"
  },
  callbacks: {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    async jwt({ token, user }: { token: JWT; user?: any }) {
      if (user) {
        token.role = user.role
        token.wilayaId = user.wilayaId
        token.wilaya = user.wilaya
      }
      return token
    },
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    async session({ session, token }: { session: any; token: JWT }) {
      if (token && session.user) {
        session.user.id = token.sub!
        session.user.role = token.role as string
        session.user.wilayaId = token.wilayaId as string
        session.user.wilaya = token.wilaya as { id: string; name: string; code: string }
      }
      return session
    }
  },
  pages: {
    signIn: "/auth/signin"
  }
}

export const { handlers, signIn, signOut, auth } = NextAuth(authOptions)
