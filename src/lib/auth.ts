import CredentialsProvider from "next-auth/providers/credentials";
import Google from "next-auth/providers/google";
import { JWT } from "next-auth/jwt";
import bcrypt from "bcrypt";
import { JWTPayload, SignJWT, importJWK } from "jose";
import { NextAuthOptions } from "next-auth";
import prisma from "./prisma";

interface User {
  id: string;
  name: string;
  email: string;
  token?: string;
}

interface token extends JWT {
  uid: string;
  jwtToken: string;
}

const generateJWT = async (payload:JWTPayload): Promise<any> => {
  const secret = process.env.JWT_SECRET || "";

  const jwk = await importJWK({ k: secret, alg: "HS256", kty: "oct" });

  const jwt=await new SignJWT(payload).setProtectedHeader({alg: "HS256"})
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
          console.log("User found in db ", userDb);

          const hashedPassword = await bcrypt.hash(password, 10);

          if (
            userDb &&
            password &&
            (await bcrypt.compare(credentials.password, userDb.passwordHash))
          ) {
            console.log("User found in db ");
            const jwt= await generateJWT({
              id: userDb.id,
            });

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
          console.log("User not found in db ");

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

          const jwt  = await generateJWT({
            id: user.id,
          });

          await prisma.user.update({
            where: {
              id: user.id,
            },
            data: {
              token: jwt,
            },
          });
          console.log("User created in db ");

          return {
            id: user.id,
            username: user.username,
            email: user.email,
            token: jwt,
          };
        } catch (e) {
          console.log(e);
          return `Db error ${e}`;
        }
      },
    }),
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID || "",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || "",
    }),
  ],
  secret: process.env.NEXTAUTH_SECRET || "secr3t",
  callbacks:{
    async session({session, token}:any){
      session.jwt=token.jwt;
      session.id=token.id;
      console.log("session",session);
      return session;
    },
    async jwt({token,user}){
      if(user){
        token.id=user.id;
        
      }
      return token;
    }
  }
};
