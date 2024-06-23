import { NextResponse } from "next/server";
import type { NextMiddleware, NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";
import { ControllerType } from "./types/types";
import ErrorHandler from "./utils/error";
import { STATUS_CODES } from "http";

interface CustomNextRequest extends NextRequest {
  userId?: number;
}

export async function middleware(req: CustomNextRequest) {
  const token = await getToken({ req });
  const url = req.nextUrl;
  console.log("middleware hit");
  console.log(url.pathname);
  console.log(token);

  if (url.pathname.startsWith("/api")) {
    if (!token) throw new ErrorHandler("Unauthorized", 401);
    req.userId = token?.id;
  }

  if (
    token &&
    (url.pathname.startsWith("/sign-in") || url.pathname.startsWith("/sign-up"))
  ) {
    return NextResponse.redirect("/");
  }
}

export const config = {
  matcher: [
    "/api/auth/[...nextauth]",
    "/api/auth/signin",
    "/api/auth/signout",
    "/api/user",
  ],
};

export const TryCatch =
  (func: ControllerType) =>
  async (
    req: NextRequest,
    res: NextResponse,
    next: NextMiddleware
  ): Promise<void> => {
    try {
      await Promise.resolve(func(req, res, next));
    } catch (error) {
      next(error, req);
    }
  };

export const errorMiddleware = (err: ErrorHandler) => {
  err.message = err.message || "Internal Server Error";
  err.statusCode = err.statusCode || 500; 

  const errorResponse = {
    success: false,
    message: err.message,
  };
  return NextResponse.json(errorResponse, { status: err.statusCode });
};
