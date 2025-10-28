import dbConnect from "@/lib/dbConnect";
import Project from "@/model/Project";
import { NextResponse } from "next/server";

export const GET = async (req, { params }) => {
  try {
    await dbConnect();

    const { userId } = await params;

    if (!userId) {
      return NextResponse.json(
        { error: "Unauthorized", details: "User not authenticated" },
        { status: 401 }
      );
    }

    const projects = await Project.find({ userId }).sort({ createdAt: -1 });

    return NextResponse.json(
      { data: projects, details: "Projects fetched successfully" },
      { status: 200 }
    );
  } catch (err) {
    console.error("❌ Error fetching projects:", err);
    return NextResponse.json(
      { error: "Failed to fetch projects", details: err.message },
      { status: 500 }
    );
  }
};

export const POST = async (req, { params }) => {
  try {
    await dbConnect();
    const { userId } = await params;

    if (!userId) {
      return NextResponse.json(
        { error: "Unauthorized", details: "User not authenticated" },
        { status: 401 }
      );
    }

    const { title } = await req.json();

    if (!title || title.trim().length < 2) {
      return NextResponse.json(
        {
          error: "Invalid title",
          details: "Project title must be at least 2 characters",
        },
        { status: 400 }
      );
    }

    const newProject = new Project({
      userId,
      title: title.trim(),
    });

    const savedProject = await newProject.save();

    return NextResponse.json(
      { data: savedProject, details: "Project created successfully" },
      { status: 201 }
    );
  } catch (err) {
    console.error("❌ Error creating project:", err);
    return NextResponse.json(
      { error: "Failed to create project", details: err.message },
      { status: 500 }
    );
  }
};
