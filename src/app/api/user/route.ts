import { NextRequest, NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";
import { getServerSession } from "next-auth"
import prisma from "@/lib/prisma";

export async function GET(req: NextRequest) {
  const token = await getToken({ req });
    const post=await prisma.post.findMany({
        where:{
        }
    })
  if (token) {
    return NextResponse.json({
      name: token.username,
    });
  } else {
    return NextResponse.json({
      name: null,
    });
  }
}
