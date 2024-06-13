import "next-auth";

declare module "next-auth" {
  interface User {
    username: string;
    email: string;
  }
}

declare module "next-auth/session" {
    interface Session {
        user: {
        username: string;
        email: string;
        };
    }
}