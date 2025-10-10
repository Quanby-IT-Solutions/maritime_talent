import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/client";
import {
  PerformanceWithStudentQuerySchema,
  PaginatedPerformanceApiResponseSchema,
  PerformanceWithStudentSchema,
  CreatePerformanceSchema,
  PerformanceApiResponseSchema,
  type PerformanceWithStudent,
  type PaginatedPerformances,
} from "./types";

// GET /api/talent-details - Query performances with student data
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);

    // Parse and validate query parameters
    const queryParams = {
      page: searchParams.get("page") || "1",
      limit: searchParams.get("limit") || "10",
      search: searchParams.get("search") || undefined,
      performance_type: searchParams.get("performance_type") || undefined,
      school: searchParams.get("school") || undefined,
      sort: searchParams.get("sort") || undefined,
      order: searchParams.get("order") || undefined,
    };

    const queryResult =
      PerformanceWithStudentQuerySchema.safeParse(queryParams);

    if (!queryResult.success) {
      return NextResponse.json(
        {
          success: false,
          error: "Invalid query parameters",
          message: queryResult.error.issues
            .map((e) => `${e.path.join(".")}: ${e.message}`)
            .join(", "),
        },
        { status: 400 }
      );
    }

    const { page, limit, search, performance_type, school, sort, order } =
      queryResult.data;
    const supabase = createClient();

    // Build the base query with join
    let query = supabase.from("performances").select(
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
      `,
      { count: "exact" }
    );

    // Apply filters
    if (performance_type) {
      query = query.eq("performance_type", performance_type);
    }

    if (school) {
      query = query.eq("students.school", school);
    }

    if (search) {
      // Search across student name, school, and performance title
      // Use multiple filters instead of complex OR query
      query = query.or(`title.ilike.%${search}%`);
    }

    // Apply sorting
    const sortColumn =
      sort === "student_name"
        ? "students.full_name"
        : sort === "school"
        ? "students.school"
        : sort === "performance_title"
        ? "title"
        : sort === "performance_type"
        ? "performance_type"
        : "created_at";

    query = query.order(sortColumn, { ascending: order === "asc" });

    // Apply pagination
    const offset = (page - 1) * limit;
    query = query.range(offset, offset + limit - 1);

    const { data: performances, error, count } = await query;

    if (error) {
      console.error("Supabase query error:", error);
      return NextResponse.json(
        {
          success: false,
          error: "Database query failed",
          message: error.message,
        },
        { status: 500 }
      );
    }

    // Validate response data
    const validatedPerformances: PerformanceWithStudent[] = [];
    const validationErrors: string[] = [];

    performances?.forEach((performance: any, index: number) => {
      const result = PerformanceWithStudentSchema.safeParse({
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

      if (result.success) {
        validatedPerformances.push(result.data);
      } else {
        validationErrors.push(
          `Performance ${index + 1}: ${result.error.issues
            .map((e) => e.message)
            .join(", ")}`
        );
      }
    });

    // Calculate pagination
    const total = count || 0;
    const totalPages = Math.ceil(total / limit);
    const hasNext = page < totalPages;
    const hasPrev = page > 1;

    const response: PaginatedPerformances = {
      data: validatedPerformances,
      pagination: {
        page,
        limit,
        total,
        totalPages,
        hasNext,
        hasPrev,
      },
    };

    // Validate final response
    const validatedResponse = PaginatedPerformanceApiResponseSchema.safeParse({
      success: true,
      data: response,
      message:
        validationErrors.length > 0
          ? `Some data validation issues: ${validationErrors.join("; ")}`
          : undefined,
    });

    if (!validatedResponse.success) {
      return NextResponse.json(
        {
          success: false,
          error: "Response validation failed",
          message: validatedResponse.error.issues
            .map((e) => e.message)
            .join(", "),
        },
        { status: 500 }
      );
    }

    return NextResponse.json(validatedResponse.data);
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

// POST /api/talent-details - Create a new performance with student association
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Validate input data
    const validationResult = CreatePerformanceSchema.safeParse(body);
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

    const performanceData = validationResult.data;
    const supabase = createClient();

    // First, verify the student exists
    const { data: student, error: studentError } = await supabase
      .from("students")
      .select("student_id, full_name")
      .eq("student_id", performanceData.student_id)
      .single();

    if (studentError || !student) {
      return NextResponse.json(
        {
          success: false,
          error: "Student not found",
          message: `No student found with ID: ${performanceData.student_id}`,
        },
        { status: 404 }
      );
    }

    // Create the performance
    const { data: newPerformance, error: insertError } = await supabase
      .from("performances")
      .insert([performanceData])
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

    if (insertError) {
      console.error("Insert error:", insertError);
      return NextResponse.json(
        {
          success: false,
          error: "Failed to create performance",
          message: insertError.message,
        },
        { status: 500 }
      );
    }

    // Validate and format response
    const validatedPerformance = PerformanceWithStudentSchema.safeParse({
      performance_id: newPerformance.performance_id,
      performance_type: newPerformance.performance_type,
      title: newPerformance.title,
      duration: newPerformance.duration,
      num_performers: newPerformance.num_performers,
      group_members: newPerformance.group_members,
      performance_created_at: newPerformance.created_at,
      student: {
        student_id: newPerformance.student.student_id,
        full_name: newPerformance.student.full_name,
        age: newPerformance.student.age,
        gender: newPerformance.student.gender,
        school: newPerformance.student.school,
        course_year: newPerformance.student.course_year,
        contact_number: newPerformance.student.contact_number,
        email: newPerformance.student.email,
        student_created_at: newPerformance.student.created_at,
        single_id: newPerformance.student.single_id,
        group_id: newPerformance.student.group_id,
        qr_id: newPerformance.student.qr_id,
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
      message: "Performance created successfully",
    });

    return NextResponse.json(response, { status: 201 });
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
