import { STORAGE_KEYS } from "@/config/constants";
import type {
  CreateStudentForm,
  Student,
  UpdateStudentForm,
} from "@/types/student";
import { generateId } from "@/utils/generateId";
import { getData, setData } from "@/utils/storage";

export function getStudents(): Student[] {
  return getData<Student[]>(STORAGE_KEYS.AKSHAY_STUDENTS) ?? [];
}

export function getStudentById(id: string): Student | null {
  return getStudents().find((s) => s.id === id) ?? null;
}

export function getStudentByEmail(email: string): Student | null {
  return (
    getStudents().find((s) => s.email.toLowerCase() === email.toLowerCase()) ??
    null
  );
}

export function addStudent(data: CreateStudentForm): Student {
  const students = getStudents();
  const now = new Date().toISOString();
  const student: Student = {
    id: generateId(),
    name: data.name,
    email: data.email,
    class_: data.class_,
    course: data.course,
    monthlyFee: data.monthlyFee,
    joinedDate: data.joinedDate,
    feeStartDate: data.feeStartDate,
    isActive: true,
    createdAt: now,
    updatedAt: now,
  };
  setData(STORAGE_KEYS.AKSHAY_STUDENTS, [...students, student]);
  return student;
}

export function updateStudent(id: string, data: UpdateStudentForm): Student {
  const students = getStudents();
  const idx = students.findIndex((s) => s.id === id);
  if (idx === -1) throw new Error(`Student ${id} not found`);
  const updated: Student = {
    ...students[idx],
    ...data,
    updatedAt: new Date().toISOString(),
  };
  students[idx] = updated;
  setData(STORAGE_KEYS.AKSHAY_STUDENTS, students);
  return updated;
}

export function deleteStudent(id: string): void {
  const students = getStudents().filter((s) => s.id !== id);
  setData(STORAGE_KEYS.AKSHAY_STUDENTS, students);
}
