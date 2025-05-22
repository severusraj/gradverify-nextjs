import { z } from "zod";

// User schemas
export const userSchema = z.object({
  name: z.string().min(2).max(100),
  email: z.string().email().max(255),
  role: z.enum(["ADMIN", "FACULTY"]),
  password: z.string().min(8)
    .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/, 
      "Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character"),
});

export const userUpdateSchema = userSchema.partial().omit({ email: true });

export const userSearchSchema = z.object({
  search: z.string().optional(),
  role: z.enum(["ADMIN", "FACULTY"]).optional(),
  page: z.string().optional().transform(val => parseInt(val || "1")),
  limit: z.string().optional().transform(val => parseInt(val || "10")),
});

// Student schemas
export const studentProfileSchema = z.object({
  studentId: z.string().min(1),
  program: z.string().min(1),
  department: z.string().min(1),
  dob: z.string().min(1),
  pob: z.string().min(1),
});

export const studentStatusSchema = z.object({
  status: z.enum(["PENDING", "APPROVED", "REJECTED"]),
  rejectionReason: z.string().optional(),
});

export const studentSearchSchema = z.object({
  search: z.string().optional(),
  status: z.enum(["PENDING", "APPROVED", "REJECTED"]).optional(),
  department: z.string().optional(),
  program: z.string().optional(),
  page: z.string().optional().transform(val => parseInt(val || "1")),
  limit: z.string().optional().transform(val => parseInt(val || "10")),
});

// File upload schemas
export const fileUploadSchema = z.object({
  type: z.enum(["PSA", "GRADUATION_PHOTO", "AWARD"]),
  file: z.instanceof(File),
});

// Date range schema
export const dateRangeSchema = z.object({
  startDate: z.string().optional(),
  endDate: z.string().optional(),
}); 