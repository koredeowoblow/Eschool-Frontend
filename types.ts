
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
  school?: {
    id: string;
    name: string;
  };
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
  avg_score?: number;
  attendance_rate?: number;
  position?: number;
  balance?: number;
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
  qualification?: string;
  hire_date?: string;
  assignments_count?: number;
}

export interface StaffMember {
  id: string;
  name: string;
  employee_number: string;
  designation: string;
  department: string;
  email: string;
  phone?: string;
  status: 'Active' | 'Inactive';
}

export interface Plan {
  id: string;
  name: string;
  price: number;
  description: string;
  no_of_students: number;
  no_of_teachers: number;
  no_of_guardians: number;
  no_of_staff: number;
  is_active: boolean;
}

export interface School {
  id: string;
  name: string;
  email: string;
  phone: string;
  slug: string;
  address: string;
  city: string;
  state: string;
  area: string;
  contact_person: string;
  contact_person_phone: string;
  users_count: number;
  students_count: number;
  teachers_count: number;
  plan?: string;
  school_plan?: {
    id: string;
    name: string;
  };
  status: string;
  is_active: boolean;
  status_label?: string; // Legacy field support
}

export interface ClassRoom {
  id: string;
  name: string;
  form_teacher?: string;
  students_count: number;
  subjects_count: number;
  assignments_count?: number;
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
  classes_count?: number;
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
  platform?: {
    total_schools: number;
    active_schools: number;
    total_users: number;
    total_students: number;
    total_teachers: number;
    total_revenue: number;
  };
  student?: {
    attendance: number;
    assignments: number;
    avg_marks: number;
    upcoming_assignments: any[];
  };
  teacher?: {
    classes: number;
    students: number;
    assignments: number;
    academic: {
      upcoming_assignments: any[];
    };
  };
  general?: {
    students: number;
    teachers: number;
    classes: number;
    assignments: number;
    attendance_today: number;
    recent_registrations: number;
    collectable_fees: number;
  };
  finance?: {
    payments: {
      total_amount: number;
    };
    outstanding_balance: number;
  };
  charts?: Record<string, { labels: string[], data: number[] }>;
}
