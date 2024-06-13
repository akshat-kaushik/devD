import { NextResponse,NextMiddleware,NextRequest } from "next/server"

export type ControllerType = {
  (
    req: NextRequest,
    res: NextResponse,
    next: NextMiddleware
  ): Promise<void | Response>;
};



