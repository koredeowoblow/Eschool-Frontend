
export enum UserRole {
  SUPER_ADMIN = 'super_admin',
  SCHOOL_ADMIN = 'school_admin',
  TEACHER = 'teacher',
  STUDENT = 'student',
  GUARDIAN = 'guardian',
  FINANCE_OFFICER = 'finance_officer',
  EXAMS_OFFICER = 'exams_officer'
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole; // Primary mapped role
  roles: string[]; // Normalized snake_case role strings
  avatar?: string;
}

export interface Student {
  id: string;
  full_name: string;
  admission_number: string;
  status: boolean;
  class_room?: {
    id: number;
    name: string;
  };
  user?: {
    email: string;
    gender: string;
  };
  parent?: string;
  avatar?: string;
}

export interface Teacher {
  id: string;
  name: string;
  employee_number: string;
  designation: string;
  email: string;
  phone: string;
  subject?: string;
  status: 'Active' | 'On Leave' | 'Suspended';
  // Fix: Added missing qualification property to resolve TypeScript error in pages/Teachers.tsx
  qualification?: string;
}

export interface StaffMember {
  id: string;
  name: string;
  employee_number: string;
  designation: string;
  department: string;
  email: string;
  status: 'Active' | 'Inactive';
}

export interface ClassRoom {
  id: string;
  name: string;
  form_teacher?: string;
  students_count: number;
  subjects_count: number;
  section?: {
    id: number;
    name: string;
  };
}

export interface Subject {
  id: string;
  name: string;
  code: string;
  department: string;
  teacher?: string;
}

export interface Invoice {
  id: string;
  student_name: string;
  type: string;
  amount: number;
  status: 'Paid' | 'Unpaid' | 'Partial' | 'Overdue';
  due_date: string;
}

export interface DashboardStats {
  total_students: number;
  total_teachers: number;
  attendance_rate: number;
  revenue: number;
}
