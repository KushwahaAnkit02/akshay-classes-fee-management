import * as studentSvc from "@/services/studentService";
import type {
  CreateStudentForm,
  Student,
  UpdateStudentForm,
} from "@/types/student";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

export function useStudents() {
  return useQuery<Student[]>({
    queryKey: ["students"],
    queryFn: () => Promise.resolve(studentSvc.getStudents()),
    staleTime: 0,
  });
}

export function useAddStudent() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (form: CreateStudentForm) =>
      Promise.resolve(studentSvc.addStudent(form)),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["students"] }),
  });
}

export function useUpdateStudent() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateStudentForm }) =>
      Promise.resolve(studentSvc.updateStudent(id, data)),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["students"] }),
  });
}

export function useDeleteStudent() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => Promise.resolve(studentSvc.deleteStudent(id)),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["students"] }),
  });
}
