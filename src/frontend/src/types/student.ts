export interface Student {
  id: string;
  name: string;
  email: string;
  class_: string;
  course: string;
  monthlyFee: number;
  joinedDate: string;
  feeStartDate: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  profileId?: string;
}

export interface CreateStudentForm {
  name: string;
  email: string;
  class_: string;
  course: string;
  monthlyFee: number;
  joinedDate: string;
  feeStartDate: string;
}

export interface UpdateStudentForm {
  name?: string;
  email?: string;
  class_?: string;
  course?: string;
  monthlyFee?: number;
  isActive?: boolean;
}
