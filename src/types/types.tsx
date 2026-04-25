export type UserRole = "super_admin" | "admin" | "teacher" | "student" | "user";
export type UserStatus = "active" | "inactive";
export type GroupStatus = "planned" | "active" | "finished" | "archived";
export type EnrollmentStatus = "active" | "finished" | "left";
export type AttendanceStatus = "present" | "absent" | "late";
export type PaymentStatus = "pending" | "paid";
export type PaymentMethod = "cash" | "card";

export interface CourseCenter {
  id: string;
  name: string;
  slug?: string | null;
  description?: string | null;
  is_active?: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface TokenResponse {
  access_token: string;
  refresh_token?: string | null;
  token_type: string;
}

export interface User {
  id: string;
  full_name: string;
  email: string;
  phone?: string | null;
  phone_number?: string | null;
  notes?: string | null;
  specialization?: string | null;
  bio?: string | null;
  hired_at?: string | null;
  avatar?: string | null;
  role?: UserRole;
  roles?: UserRole[];
  course_center_id?: string | null;
  course_center_name?: string | null;
  course_center?: CourseCenter | null;
  status: UserStatus;
  is_superuser?: boolean;
  created_at: string;
  updated_at: string;
}

export interface Course {
  id: string;
  course_center_id: string;
  name: string;
  description: string | null;
  default_monthly_fee: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  fee_histories?: CourseFeeHistory[];
}

export interface CourseFeeHistory {
  id: string;
  amount: string;
  effective_from: string;
  created_at: string;
  updated_at: string;
}

export interface Room {
  id: string;
  course_center_id: string;
  name: string;
  capacity: number;
  location_note: string | null;
  created_at: string;
  updated_at: string;
}

export interface Group {
  id: string;
  course_center_id: string;
  name: string;
  course_id: string;
  teacher_id: string | null;
  room_id: string | null;
  monthly_fee: string;
  start_date: string;
  end_date: string | null;
  status: GroupStatus;
  schedule_summary: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
  course: Course;
  teacher?: User | null;
  room?: Room | null;
}

export interface StudentProfile {
  user_id: string;
  parent_name: string | null;
  parent_phone: string | null;
  notes: string | null;
  extra_info: string | null;
  created_by_teacher_id: string | null;
  telegram_chat_id?: string | null;
  telegram_username?: string | null;
  telegram_first_name?: string | null;
  telegram_connected_at?: string | null;
  telegram_last_credentials_sent_at?: string | null;
  created_at: string;
  updated_at: string;
}

export interface TelegramLinkStatus {
  bot_username: string | null;
  link_token: string | null;
  telegram_link_url: string | null;
  token_expires_at: string | null;
  is_connected: boolean;
  telegram_username: string | null;
  telegram_first_name: string | null;
  telegram_connected_at: string | null;
}

export interface TelegramSendCredentialsResponse {
  delivered: boolean;
  chat_id: string;
  sent_at: string;
}

export interface StudentDetail extends User {
  student_profile?: StudentProfile | null;
  active_group_ids?: string[];
  active_group_names?: string[];
}

export interface PaginatedResult<T> {
  items: T[];
  total: number;
  active_total?: number;
  page: number;
  limit: number;
  pages: number;
}

export interface TeacherProfile {
  user_id: string;
  specialization: string | null;
  bio: string | null;
  hired_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface TeacherDetail extends User {
  teacher_profile?: TeacherProfile | null;
}

export interface Enrollment {
  id: string;
  student_id: string;
  group_id: string;
  enrolled_at: string;
  left_at: string | null;
  status: EnrollmentStatus;
  created_at: string;
  updated_at: string;
  student: StudentDetail;
  group: Group;
}

export interface Lesson {
  id: string;
  group_id: string;
  lesson_number: number;
  lesson_date: string;
  topic: string | null;
  homework: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
  group: Group;
}

export interface Attendance {
  id: string;
  lesson_id: string;
  enrollment_id: string;
  student_id: string;
  para: number;
  status: AttendanceStatus;
  note: string | null;
  created_at: string;
  updated_at: string;
  student: StudentDetail;
}

export interface Grade {
  id: string;
  lesson_id: string;
  enrollment_id: string;
  student_id: string;
  teacher_id: string | null;
  score: string;
  note: string | null;
  created_at: string;
  updated_at: string;
  student: StudentDetail;
  teacher?: User | null;
}

export interface Payment {
  id: string;
  student_id: string;
  group_id: string;
  enrollment_id: string | null;
  amount: string;
  paid_at: string;
  month_for: string;
  method: PaymentMethod;
  status: PaymentStatus;
  note: string | null;
  created_at: string;
  updated_at: string;
  student: StudentDetail;
}
