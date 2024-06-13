import { NextResponse } from "next/server";
import type { NextMiddleware, NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";
import { ControllerType } from "./types/types";
import ErrorHandler from "./utils/error";

export async function middleware(req: NextRequest) {
  const token = await getToken({ req });
  const url = req.nextUrl;

  if (
    token &&
    (url.pathname.startsWith("/sign-in") ||
      url.pathname.startsWith("/sign-up")) 
  )
    return NextResponse.redirect("/");
}

export const config = {
  matcher: [
    "/api/auth/[...nextauth]",
    "/api/auth/signin",
    "/api/auth/signout",
    "/"
  ],
};

export const TryCatch = (func: ControllerType) => async (
  req: NextRequest,
  res: NextResponse,
  next: NextMiddleware
) => {
  try {
    return await func(req, res, next);
  } catch (error) {
    console.error(error);
    return next;
  }
};


export const errorMiddleware = (err: ErrorHandler, res: NextResponse) => {
  err.message ||= "Internal Server Error";
  err.statusCode ||= 500;

  if (err.name === "CastError") err.message = "Invalid ID";

  const errorResponse = {
    success: false,
    message: err.message,
  };
  return NextResponse.json(errorResponse, { status: err.statusCode });
};