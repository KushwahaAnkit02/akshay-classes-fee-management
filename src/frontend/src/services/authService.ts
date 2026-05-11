import { DEMO_CREDENTIALS, STORAGE_KEYS } from "@/config/constants";
import type { AuthUser, LoginCredentials, Role } from "@/types/auth";
import type { Student } from "@/types/student";
import { getData } from "@/utils/storage";

export function validateLogin(
  email: string,
  password: string,
  role: Role,
): AuthUser | null {
  const normalizedEmail = email.trim().toLowerCase();

  // Check admin demo credential
  if (
    role === "admin" &&
    normalizedEmail === DEMO_CREDENTIALS.admin.email &&
    password === DEMO_CREDENTIALS.admin.password
  ) {
    return {
      id: DEMO_CREDENTIALS.admin.id,
      email: DEMO_CREDENTIALS.admin.email,
      role: "admin",
      name: DEMO_CREDENTIALS.admin.name,
    };
  }

  // Check student demo credential
  if (
    role === "student" &&
    normalizedEmail === DEMO_CREDENTIALS.student.email &&
    password === DEMO_CREDENTIALS.student.password
  ) {
    return {
      id: DEMO_CREDENTIALS.student.id,
      email: DEMO_CREDENTIALS.student.email,
      role: "student",
      name: DEMO_CREDENTIALS.student.name,
    };
  }

  // Check dynamically created student accounts
  if (role === "student") {
    const students = getData<Student[]>(STORAGE_KEYS.AKSHAY_STUDENTS) ?? [];
    const student = students.find(
      (s) => s.email.toLowerCase() === normalizedEmail && s.isActive,
    );
    if (student) {
      // For demo purposes, password is the student's email prefix before @
      const expectedPassword = student.email.split("@")[0];
      if (password === expectedPassword || password === "student123") {
        return {
          id: student.id,
          email: student.email,
          role: "student",
          name: student.name,
        };
      }
    }
  }

  return null;
}

export function getCredentialsHint(role: LoginCredentials["role"]): {
  email: string;
  password: string;
} {
  if (role === "admin") {
    return {
      email: DEMO_CREDENTIALS.admin.email,
      password: DEMO_CREDENTIALS.admin.password,
    };
  }
  return {
    email: DEMO_CREDENTIALS.student.email,
    password: DEMO_CREDENTIALS.student.password,
  };
}
