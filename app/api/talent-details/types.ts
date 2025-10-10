import { z } from "zod";

// Base UUID validation
const UUIDSchema = z.string().uuid("Invalid UUID format");

// Performance type enum based on database schema
export const PerformanceTypeSchema = z.enum([
  "Singing",
  "Dancing",
  "Musical Instrument",
  "Spoken Word/Poetry",
  "Theatrical/Drama",
  "Other",
]);

// User role enum
export const UserRoleSchema = z.enum(["user", "admin", "moderator"]);

// Core table schemas based on database structure

// Users table schema
export const UserSchema = z.object({
  user_id: UUIDSchema,
  email: z.string().email("Valid email is required"),
  password_hash: z.string(),
  full_name: z.string().min(1, "Full name is required"),
  role: UserRoleSchema.default("user"),
  created_at: z.string().datetime().nullable(),
});

// Students table schema
export const StudentSchema = z.object({
  student_id: UUIDSchema,
  full_name: z.string().min(1, "Full name is required"),
  age: z.number().int().min(16).max(30).nullable(),
  gender: z.string().nullable(),
  school: z.string().nullable(),
  course_year: z.string().nullable(),
  contact_number: z.string().nullable(),
  email: z.string().email().nullable(),
  created_at: z.string().datetime().nullable(),
  single_id: UUIDSchema.nullable(),
  group_id: UUIDSchema.nullable(),
  qr_id: UUIDSchema.nullable(),
});

// Performances table schema
export const PerformanceSchema = z.object({
  performance_id: UUIDSchema,
  student_id: UUIDSchema,
  performance_type: PerformanceTypeSchema,
  title: z.string().nullable(),
  duration: z.string().nullable(),
  num_performers: z.number().int().min(1).nullable(),
  group_members: z.string().nullable(),
  created_at: z.string().datetime().nullable(),
});

// Query schemas for API endpoints

// Performance query parameters
export const PerformanceQuerySchema = z.object({
  page: z.coerce.number().min(1).default(1),
  limit: z.coerce.number().min(1).max(100).default(10),
  search: z.string().optional(),
  performance_type: PerformanceTypeSchema.optional(),
  student_id: UUIDSchema.optional(),
  sort: z
    .enum(["title", "performance_type", "created_at", "student_name"])
    .default("created_at"),
  order: z.enum(["asc", "desc"]).default("desc"),
});

// Student query parameters
export const StudentQuerySchema = z.object({
  page: z.coerce.number().min(1).default(1),
  limit: z.coerce.number().min(1).max(100).default(10),
  search: z.string().optional(),
  school: z.string().optional(),
  has_performance: z.coerce.boolean().optional(),
  sort: z.enum(["full_name", "school", "created_at"]).default("created_at"),
  order: z.enum(["asc", "desc"]).default("desc"),
});

// Combined performance with student data query schema
export const PerformanceWithStudentQuerySchema = z.object({
  page: z.coerce.number().min(1).default(1),
  limit: z.coerce.number().min(1).max(100).default(10),
  search: z.string().optional(), // Searches across student name, school, performance title
  performance_type: PerformanceTypeSchema.optional(),
  school: z.string().optional(),
  sort: z
    .enum([
      "student_name",
      "school",
      "performance_type",
      "performance_title",
      "created_at",
    ])
    .default("created_at"),
  order: z.enum(["asc", "desc"]).default("desc"),
});

// Response schemas for joined data

// Performance with nested student data
export const PerformanceWithStudentSchema = z.object({
  performance_id: UUIDSchema,
  performance_type: z.string(),
  title: z.string().nullable(),
  duration: z.string().nullable(),
  num_performers: z.number().nullable(),
  group_members: z.string().nullable(),
  performance_created_at: z.string().nullable(),
  // Nested student data
  student: z.object({
    student_id: UUIDSchema,
    full_name: z.string(),
    age: z.number().nullable(),
    gender: z.string().nullable(),
    school: z.string().nullable(),
    course_year: z.string().nullable(),
    contact_number: z.string().nullable(),
    email: z.string().nullable(),
    student_created_at: z.string().nullable(),
    single_id: UUIDSchema.nullable(),
    group_id: UUIDSchema.nullable(),
    qr_id: UUIDSchema.nullable(),
  }),
});

// Student with nested performances array
export const StudentWithPerformancesSchema = z.object({
  student_id: UUIDSchema,
  full_name: z.string(),
  age: z.number().nullable(),
  gender: z.string().nullable(),
  school: z.string().nullable(),
  course_year: z.string().nullable(),
  contact_number: z.string().nullable(),
  email: z.string().nullable(),
  student_created_at: z.string().datetime().nullable(),
  single_id: UUIDSchema.nullable(),
  group_id: UUIDSchema.nullable(),
  qr_id: UUIDSchema.nullable(),
  // Nested performances array
  performances: z.array(
    z.object({
      performance_id: UUIDSchema,
      performance_type: z.string(),
      title: z.string().nullable(),
      duration: z.string().nullable(),
      num_performers: z.number().nullable(),
      group_members: z.string().nullable(),
      performance_created_at: z.string().datetime().nullable(),
    })
  ),
});

// Pagination schema
export const PaginationSchema = z.object({
  page: z.number(),
  limit: z.number(),
  total: z.number(),
  totalPages: z.number(),
  hasNext: z.boolean(),
  hasPrev: z.boolean(),
});

// Paginated response schemas
export const PaginatedPerformancesSchema = z.object({
  data: z.array(PerformanceWithStudentSchema),
  pagination: PaginationSchema,
});

export const PaginatedStudentsSchema = z.object({
  data: z.array(StudentWithPerformancesSchema),
  pagination: PaginationSchema,
});

// API Response wrapper
export const ApiResponseSchema = z.object({
  success: z.boolean(),
  message: z.string().optional(),
  error: z.string().optional(),
});

export const PerformanceApiResponseSchema = ApiResponseSchema.extend({
  data: PerformanceWithStudentSchema.optional(),
});

export const PaginatedPerformanceApiResponseSchema = ApiResponseSchema.extend({
  data: PaginatedPerformancesSchema.optional(),
});

export const StudentApiResponseSchema = ApiResponseSchema.extend({
  data: StudentWithPerformancesSchema.optional(),
});

export const PaginatedStudentApiResponseSchema = ApiResponseSchema.extend({
  data: PaginatedStudentsSchema.optional(),
});

// Create/Update schemas (input validation)

export const CreatePerformanceSchema = z.object({
  student_id: UUIDSchema,
  performance_type: PerformanceTypeSchema,
  title: z.string().max(255).optional(),
  duration: z.string().max(50).optional(),
  num_performers: z.number().int().min(1).max(50).optional(),
  group_members: z.string().max(1000).optional(),
});

export const UpdatePerformanceSchema = CreatePerformanceSchema.partial().extend(
  {
    performance_id: UUIDSchema,
  }
);

export const CreateStudentSchema = z.object({
  full_name: z.string().min(1, "Full name is required").max(255),
  age: z
    .number()
    .int()
    .min(16, "Minimum age is 16")
    .max(30, "Maximum age is 30")
    .optional(),
  gender: z.string().max(50).optional(),
  school: z.string().max(255).optional(),
  course_year: z.string().max(100).optional(),
  contact_number: z.string().max(20).optional(),
  email: z.string().email("Valid email is required").max(100).optional(),
  single_id: UUIDSchema.optional(),
  group_id: UUIDSchema.optional(),
  qr_id: UUIDSchema.optional(),
});

export const UpdateStudentSchema = CreateStudentSchema.partial().extend({
  student_id: UUIDSchema,
});

// TypeScript type exports
export type User = z.infer<typeof UserSchema>;
export type Student = z.infer<typeof StudentSchema>;
export type Performance = z.infer<typeof PerformanceSchema>;

export type PerformanceQuery = z.infer<typeof PerformanceQuerySchema>;
export type StudentQuery = z.infer<typeof StudentQuerySchema>;
export type PerformanceWithStudentQuery = z.infer<
  typeof PerformanceWithStudentQuerySchema
>;

export type PerformanceWithStudent = z.infer<
  typeof PerformanceWithStudentSchema
>;
export type StudentWithPerformances = z.infer<
  typeof StudentWithPerformancesSchema
>;

export type PaginatedPerformances = z.infer<typeof PaginatedPerformancesSchema>;
export type PaginatedStudents = z.infer<typeof PaginatedStudentsSchema>;

export type CreatePerformance = z.infer<typeof CreatePerformanceSchema>;
export type UpdatePerformance = z.infer<typeof UpdatePerformanceSchema>;
export type CreateStudent = z.infer<typeof CreateStudentSchema>;
export type UpdateStudent = z.infer<typeof UpdateStudentSchema>;

export type ApiResponse = z.infer<typeof ApiResponseSchema>;
export type PerformanceApiResponse = z.infer<
  typeof PerformanceApiResponseSchema
>;
export type PaginatedPerformanceApiResponse = z.infer<
  typeof PaginatedPerformanceApiResponseSchema
>;
export type StudentApiResponse = z.infer<typeof StudentApiResponseSchema>;
export type PaginatedStudentApiResponse = z.infer<
  typeof PaginatedStudentApiResponseSchema
>;

// Supabase query helper types for type-safe database operations
export interface SupabasePerformanceQuery {
  select: string;
  from: "performances";
  joins?: {
    table: "students";
    on: "performances.student_id = students.student_id";
  }[];
  where?: Record<string, any>;
  order?: { column: string; ascending: boolean }[];
  limit?: number;
  offset?: number;
}

export interface SupabaseStudentQuery {
  select: string;
  from: "students";
  joins?: {
    table: "performances";
    on: "students.student_id = performances.student_id";
  }[];
  where?: Record<string, any>;
  order?: { column: string; ascending: boolean }[];
  limit?: number;
  offset?: number;
}

// Error types
export interface ValidationError {
  field: string;
  message: string;
}

export interface ApiError {
  message: string;
  status: number;
  errors?: ValidationError[];
}
