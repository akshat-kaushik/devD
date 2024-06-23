import { NextResponse, NextMiddleware, NextRequest } from "next/server";

export type ControllerType = {
  (
    req: NextRequest,
    res: NextResponse,
    next: NextMiddleware
  ): Promise<void | Response>;
};

export type DoubtType = {
  id?: number;
  title: string;
  description: string;
  image?: string;
  video?: string;
  link?: string;
  tags: Array<string>;
};
