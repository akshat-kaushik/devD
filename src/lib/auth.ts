import CredentialsProvider from "next-auth/providers/credentials";
import Google from "next-auth/providers/google";
import bcrypt from "bcrypt";
import { JWTPayload, SignJWT, importJWK } from "jose";
import { NextAuthOptions } from "next-auth";
import prisma from "./prisma";
import { signUpSchema } from "@/schema/signupSchema";

const generateJWT = async (payload: JWTPayload): Promise<string> => {
  const secret = process.env.JWT_SECRET || "";

  const jwk = await importJWK({ k: secret, alg: "HS256", kty: "oct" });

  const jwt = await new SignJWT(payload)
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("365d")
    .sign(jwk);

  return jwt;
};

export const NEXT_AUTH: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        username: { label: "Username", type: "text", placeholder: "Username" },
        email: { label: "Email", type: "text", placeholder: "Email" },
        password: {
          label: "Password",
          type: "password",
          placeholder: "Password",
        },
      },
      async authorize(credentials: any): Promise<any> {
        const username = credentials.username;
        const email = credentials.email;
        const password = credentials.password;

        // try {
        //   signUpSchema.parse({ username, email, password });
        // } catch (e: any) {
        //   throw new Error(e.errors[0].message);
        // }

        try {
          const userDb = await prisma.user.findFirst({
            where: {
              OR: [{ username: username }, { email: email }],
            },
            select: {
              id: true,
              username: true,
              email: true,
              passwordHash: true,
            },
          });
          console.log("userDb", userDb);

          if (
            userDb &&
            password &&
            (await bcrypt.compare(credentials.password, userDb.passwordHash))
          ) {
            const jwt = await generateJWT({ id: userDb.id });

            await prisma.user.update({
              where: {
                id: userDb.id,
              },
              data: {
                token: jwt,
              },
            });

            return {
              id: userDb.id,
              username: userDb.username,
              email: userDb.email,
              token: jwt,
            };
          }

          const hashedPassword = await bcrypt.hash(password, 10);

          const user = await prisma.user.create({
            data: {
              username: username,
              email: email,
              passwordHash: hashedPassword,
            },
            select: {
              id: true,
              username: true,
              email: true,
            },
          });

          if (!user) return null;

          const jwt = await generateJWT({ id: user.id });

          await prisma.user.update({
            where: {
              id: user.id,
            },
            data: {
              token: jwt,
            },
          });

          return {
            id: user.id,
            username: user.username,
            email: user.email,
            token: jwt,
          };
        } catch (e) {
          console.error("Database error:", e);
          return null;
        }
      },
    }),
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID || "",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || "",
    }),
  ],
  secret: process.env.NEXTAUTH_SECRET || "",
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.username = user.username;
        token.email = user.email;
      }
      return token;
    },
    async session({ session, token }: any) {
      if (token) {
        session.user.id = token.id;
        session.user.username = token.username;
        session.user.email = token.email;
      }
      return session;
    },

    async signIn({ user, account, profile, email, credentials }) {
      if (account?.provider == "google") {
        console.log(user);
        try {
          const userDb = await prisma.user.upsert({
            where: {
              email: user.email,
            },
            update: {
              //@ts-ignore
              username: user.name,
              email: user.email,
              profileImage: user.image,
              passwordHash: "",
            },
            create: {
              email: user.email,
              //@ts-ignore
              username: user.name,
              profileImage: user.image,
              passwordHash: "",
            },
            select: {
              id: true,
              username: true,
              email: true,
            },
          });
          console.log(userDb,"from ggoollgle");
          return true;
        } catch (e) {
          console.error("Database error:", e);
          return false;
        }
      }
      return true;
    },
  },
};