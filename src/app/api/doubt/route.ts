import { DoubtController } from "./doubtController";
import { NextRequest, NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";

async function handler(req: NextRequest) {
  const token = await getToken({ req });
  const doubtsController = new DoubtController(token, req);

  switch (req.method) {
    case "GET":
      try {
        const data = await doubtsController.getAll();
        return NextResponse.json(
          {
            data: data,
          },
          { status: 200 }
        );
      } catch (e) {
        console.log(e, "error getting doubts");
        return NextResponse.json(
          { message: "Something went wrong" },
          { status: 500 }
        );
      }

    case "POST":
      try {
        const data = await doubtsController.createDoubt();
        return NextResponse.json(
          {
            data: data,
          },
          { status: 200 }
        );
      } catch (e) {
        console.log(e, "error getting doubts");
        return NextResponse.json(
          { message: "Something went wrong" },
          { status: 500 }
        );
      }

    case "PUT":
      try {
        const data = await doubtsController.updateDoubt();
        return NextResponse.json(
          {
            data: data,
          },
          { status: 200 }
        );
      } catch (e) {
        console.log(e, "error getting doubts");
        if (e instanceof Error) {
          if (e.message == "Doubt not found") {
            return NextResponse.json(
              { message: "Doubt not found" },
              { status: 404 }
            );
          }
          if (e.message == "id is required") {
            return NextResponse.json(
              { message: "id is required" },
              { status: 400 }
            );
          }
        }
      }

    case "DELETE":
      try {
        await doubtsController.deleteDoubt();
        return NextResponse.json(
          {
            message: "Doubt deleted successfully",
          },
          { status: 200 }
        );
      } catch (e) {
        console.log(e, "error getting doubts");
        if (e instanceof Error) {
          if (e.message == "Doubt not found") {
            return NextResponse.json(
              { message: "Doubt not found" },
              { status: 404 }
            );
          }
          if (e.message == "id is required") {
            return NextResponse.json(
              { message: "id is required" },
              { status: 400 }
            );
          }
        }
      }
  }
}

export { handler as GET, handler as POST, handler as PUT, handler as DELETE };
