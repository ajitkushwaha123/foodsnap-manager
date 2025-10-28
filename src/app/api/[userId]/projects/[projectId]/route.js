import dbConnect from "@/lib/dbConnect";
import Project from "@/model/Project";
import { NextResponse } from "next/server";

export const DELETE = async (req, { params }) => {
  try {
    await dbConnect();
    const { userId, projectId } = await params;
    if (!userId) {
      return NextResponse.json(
        { error: "Unauthorized", details: "User not authenticated" },
        { status: 401 }
      );
    }

    const deletedProject = await Project.findOneAndDelete({
      _id: projectId,
      userId,
    });

    if (!deletedProject) {
      return NextResponse.json(
        { error: "Not Found", details: "Subject not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { data: deletedProject, details: "Subject deleted successfully" },
      { status: 200 }
    );
  } catch (err) {
    return NextResponse.json(
      {
        error: "Failed to delete subject",
        details: err.message,
      },
      { status: 500 }
    );
  }
};
