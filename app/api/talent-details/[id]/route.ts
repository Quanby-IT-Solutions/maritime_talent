import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/client";
import {
  PerformanceWithStudentSchema,
  UpdatePerformanceSchema,
  PerformanceApiResponseSchema,
  type PerformanceWithStudent,
} from "../types";

// GET /api/talent-details/[id] - Get single performance with student data
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    // Validate UUID format
    if (
      !/^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(
        id
      )
    ) {
      return NextResponse.json(
        {
          success: false,
          error: "Invalid performance ID format",
          message: "Performance ID must be a valid UUID",
        },
        { status: 400 }
      );
    }

    const supabase = createClient();

    const { data: performance, error } = await supabase
      .from("performances")
      .select(
        `
        performance_id,
        performance_type,
        title,
        duration,
        num_performers,
        group_members,
        created_at,
        student:students!inner (
          student_id,
          full_name,
          age,
          gender,
          school,
          course_year,
          contact_number,
          email,
          created_at,
          single_id,
          group_id,
          qr_id
        )
      `
      )
      .eq("performance_id", id)
      .single();

    if (error || !performance) {
      return NextResponse.json(
        {
          success: false,
          error: "Performance not found",
          message: `No performance found with ID: ${id}`,
        },
        { status: 404 }
      );
    }

    // Validate response data
    const validatedPerformance = PerformanceWithStudentSchema.safeParse({
      performance_id: performance.performance_id,
      performance_type: performance.performance_type,
      title: performance.title,
      duration: performance.duration,
      num_performers: performance.num_performers,
      group_members: performance.group_members,
      performance_created_at: performance.created_at,
      student: {
        student_id: performance.student.student_id,
        full_name: performance.student.full_name,
        age: performance.student.age,
        gender: performance.student.gender,
        school: performance.student.school,
        course_year: performance.student.course_year,
        contact_number: performance.student.contact_number,
        email: performance.student.email,
        student_created_at: performance.student.created_at,
        single_id: performance.student.single_id,
        group_id: performance.student.group_id,
        qr_id: performance.student.qr_id,
      },
    });

    if (!validatedPerformance.success) {
      return NextResponse.json(
        {
          success: false,
          error: "Data validation failed",
          message: validatedPerformance.error.issues
            .map((e) => e.message)
            .join(", "),
        },
        { status: 500 }
      );
    }

    const response = PerformanceApiResponseSchema.parse({
      success: true,
      data: validatedPerformance.data,
      message: "Performance retrieved successfully",
    });

    return NextResponse.json(response);
  } catch (error) {
    console.error("API Error:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Internal server error",
        message:
          error instanceof Error ? error.message : "Unknown error occurred",
      },
      { status: 500 }
    );
  }
}

// PUT /api/talent-details/[id] - Update performance
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();

    // Validate UUID format
    if (
      !/^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(
        id
      )
    ) {
      return NextResponse.json(
        {
          success: false,
          error: "Invalid performance ID format",
          message: "Performance ID must be a valid UUID",
        },
        { status: 400 }
      );
    }

    // Validate input data
    const validationResult = UpdatePerformanceSchema.safeParse({
      ...body,
      performance_id: id,
    });
    if (!validationResult.success) {
      return NextResponse.json(
        {
          success: false,
          error: "Invalid input data",
          message: validationResult.error.issues
            .map((e) => `${e.path.join(".")}: ${e.message}`)
            .join(", "),
        },
        { status: 400 }
      );
    }

    const { performance_id, ...updateData } = validationResult.data;
    const supabase = createClient();

    // Check if performance exists
    const { data: existingPerformance, error: checkError } = await supabase
      .from("performances")
      .select("performance_id")
      .eq("performance_id", id)
      .single();

    if (checkError || !existingPerformance) {
      return NextResponse.json(
        {
          success: false,
          error: "Performance not found",
          message: `No performance found with ID: ${id}`,
        },
        { status: 404 }
      );
    }

    // Update the performance
    const { data: updatedPerformance, error: updateError } = await supabase
      .from("performances")
      .update(updateData)
      .eq("performance_id", id)
      .select(
        `
        performance_id,
        performance_type,
        title,
        duration,
        num_performers,
        group_members,
        created_at,
        student:students!inner (
          student_id,
          full_name,
          age,
          gender,
          school,
          course_year,
          contact_number,
          email,
          created_at,
          single_id,
          group_id,
          qr_id
        )
      `
      )
      .single();

    if (updateError) {
      console.error("Update error:", updateError);
      return NextResponse.json(
        {
          success: false,
          error: "Failed to update performance",
          message: updateError.message,
        },
        { status: 500 }
      );
    }

    // Validate and format response
    const validatedPerformance = PerformanceWithStudentSchema.safeParse({
      performance_id: updatedPerformance.performance_id,
      performance_type: updatedPerformance.performance_type,
      title: updatedPerformance.title,
      duration: updatedPerformance.duration,
      num_performers: updatedPerformance.num_performers,
      group_members: updatedPerformance.group_members,
      performance_created_at: updatedPerformance.created_at,
      student: {
        student_id: updatedPerformance.student.student_id,
        full_name: updatedPerformance.student.full_name,
        age: updatedPerformance.student.age,
        gender: updatedPerformance.student.gender,
        school: updatedPerformance.student.school,
        course_year: updatedPerformance.student.course_year,
        contact_number: updatedPerformance.student.contact_number,
        email: updatedPerformance.student.email,
        student_created_at: updatedPerformance.student.created_at,
        single_id: updatedPerformance.student.single_id,
        group_id: updatedPerformance.student.group_id,
        qr_id: updatedPerformance.student.qr_id,
      },
    });

    if (!validatedPerformance.success) {
      return NextResponse.json(
        {
          success: false,
          error: "Response validation failed",
          message: validatedPerformance.error.issues
            .map((e) => e.message)
            .join(", "),
        },
        { status: 500 }
      );
    }

    const response = PerformanceApiResponseSchema.parse({
      success: true,
      data: validatedPerformance.data,
      message: "Performance updated successfully",
    });

    return NextResponse.json(response);
  } catch (error) {
    console.error("API Error:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Internal server error",
        message:
          error instanceof Error ? error.message : "Unknown error occurred",
      },
      { status: 500 }
    );
  }
}

// DELETE /api/talent-details/[id] - Delete performance
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    // Validate UUID format
    if (
      !/^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(
        id
      )
    ) {
      return NextResponse.json(
        {
          success: false,
          error: "Invalid performance ID format",
          message: "Performance ID must be a valid UUID",
        },
        { status: 400 }
      );
    }

    const supabase = createClient();

    // Check if performance exists
    const { data: existingPerformance, error: checkError } = await supabase
      .from("performances")
      .select("performance_id")
      .eq("performance_id", id)
      .single();

    if (checkError || !existingPerformance) {
      return NextResponse.json(
        {
          success: false,
          error: "Performance not found",
          message: `No performance found with ID: ${id}`,
        },
        { status: 404 }
      );
    }

    // Delete the performance
    const { error: deleteError } = await supabase
      .from("performances")
      .delete()
      .eq("performance_id", id);

    if (deleteError) {
      console.error("Delete error:", deleteError);
      return NextResponse.json(
        {
          success: false,
          error: "Failed to delete performance",
          message: deleteError.message,
        },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Performance deleted successfully",
    });
  } catch (error) {
    console.error("API Error:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Internal server error",
        message:
          error instanceof Error ? error.message : "Unknown error occurred",
      },
      { status: 500 }
    );
  }
}
