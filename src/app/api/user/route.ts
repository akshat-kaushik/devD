import { getServerSession } from "next-auth";
import { NextResponse,NextRequest } from "next/server";

export  async function GET(){
    const session=await getServerSession();
    console.log(session);
    return NextResponse.json({
        success:true,
        data:"hello world"
    });
}