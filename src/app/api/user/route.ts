import { NextRequest, NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";
import { getServerSession } from "next-auth"
import prisma from "@/lib/prisma";

export async function GET(req: NextRequest) {
  const token = await getToken({ req });
  console.log(token,"from user api");
    // const user=await prisma.user.findUnique({
    //     where:{
    //       username:token?.username as string
    //     },
    //     select:{
    //       username:true,
    //       email:true,
    //       profileImage:true
    //     }
    // })
  if (token) {
    return NextResponse.json({
      name: token.username,
      google_name: token.name,
    });
  } else {
    return NextResponse.json({
      name: null,
    });
  }
}
