// src/types/next-auth.d.ts
import { DefaultSession } from "next-auth"

declare module "next-auth" {
  interface Session {
    user: {
      id: string
      role: string
      wilayaId?: string
      wilaya?: {
        id: string
        name: string
        code: string
      }
    } & DefaultSession["user"]
  }

  interface User {
    role: string
    wilayaId?: string
    wilaya?: {
      id: string
      name: string
      code: string
    }
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    role?: string
    wilayaId?: string
    wilaya?: {
      id: string
      name: string
      code: string
    }
  }
}
