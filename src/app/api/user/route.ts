import { getSession } from "next-auth/react";
import { NextResponse,NextRequest } from "next/server";

export function GET(){
    const session=getSession();
    console.log(session);
    return NextResponse.json({
        success:true,
        data:"hello world"
    });
}