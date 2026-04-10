// ============================================
// SabaiApply Database Types
// Matches the Supabase schema exactly
// ============================================

// ---- ENUMS ----

export type UserRole = "student" | "faculty_admin" | "uni_admin";

export type ApplicationStatus =
  | "submitted"
  | "under_review"
  | "shortlisted"
  | "interview_scheduled"
  | "accepted"
  | "waitlisted"
  | "rejected"
  | "confirmed"
  | "withdrawn";

export type ScoreType =
  | "GAT"
  | "PAT"
  | "TGAT"
  | "TPAT"
  | "O-NET"
  | "SAT"
  | "IELTS"
  | "TOEFL";

export type DocType =
  | "transcript"
  | "id_copy"
  | "photo"
  | "certificate"
  | "portfolio";

export type PortfolioSource =
  | "sabaiapply"
  | "tcasfolio"
  | "ifolio"
  | "freestyle";

export type InterviewSlotStatus =
  | "available"
  | "booked"
  | "completed"
  | "no_show";

export type AdmissionRound = "1" | "2" | "4";

// ---- TABLE TYPES ----

export interface Profile {
  id: string;
  email: string;
  role: UserRole;
  full_name: string | null;
  created_at: string;
  updated_at: string;
}

export interface StudentProfile {
  id: string;
  user_id: string;
  first_name: string | null;
  last_name: string | null;
  first_name_th: string | null;
  last_name_th: string | null;
  dob: string | null;
  nationality: string | null;
  gender: string | null;
  phone: string | null;
  line_id: string | null;
  address: string | null;
  photo_url: string | null;
  created_at: string;
  updated_at: string;
}

export interface StudentEducation {
  id: string;
  student_id: string;
  school_name: string;
  gpa: number | null;
  graduation_year: number | null;
  transcript_url: string | null;
  created_at: string;
  updated_at: string;
}

export interface StudentScore {
  id: string;
  student_id: string;
  score_type: ScoreType;
  score_value: number;
  test_date: string | null;
  created_at: string;
}

export interface StudentDocument {
  id: string;
  student_id: string;
  doc_type: DocType;
  file_url: string;
  file_name: string;
  file_size: number | null;
  created_at: string;
}

export interface StudentPortfolio {
  id: string;
  student_id: string;
  title: string;
  source: PortfolioSource;
  content_json: Record<string, unknown>;
  external_url: string | null;
  pdf_url: string | null;
  created_at: string;
  updated_at: string;
}

export interface University {
  id: string;
  name: string;
  name_th: string | null;
  logo_url: string | null;
  website: string | null;
  created_at: string;
  updated_at: string;
}

export interface Faculty {
  id: string;
  university_id: string;
  name: string;
  name_th: string | null;
  created_at: string;
  updated_at: string;
}

export interface FacultyAdmin {
  id: string;
  user_id: string;
  faculty_id: string;
  is_primary: boolean;
  created_at: string;
}

export interface Program {
  id: string;
  faculty_id: string;
  name: string;
  name_th: string | null;
  degree_type: string;
  seats_round_1: number;
  seats_round_2: number;
  seats_round_4: number;
  tuition_per_semester: number | null;
  description: string | null;
  is_international: boolean;
  created_at: string;
  updated_at: string;
}

export interface ProgramRequirements {
  id: string;
  program_id: string;
  min_gpa: number | null;
  required_subjects: SubjectRequirement[];
  required_scores: ScoreRequirement[];
  required_documents: DocType[];
  custom_questions: CustomQuestion[];
  scoring_rubric: RubricItem[];
  deadline_round_1: string | null;
  deadline_round_2: string | null;
  deadline_round_4: string | null;
  created_at: string;
  updated_at: string;
}

export interface Application {
  id: string;
  student_id: string;
  program_id: string;
  round: AdmissionRound;
  status: ApplicationStatus;
  custom_answers: Record<string, string>;
  portfolio_id: string | null;
  submitted_at: string;
  reviewed_by: string | null;
  scores: Record<string, number>;
  total_score: number | null;
  waitlist_position: number | null;
  notes: string | null;
  updated_at: string;
}

export interface InterviewSlot {
  id: string;
  program_id: string;
  round: AdmissionRound;
  datetime: string;
  duration_minutes: number;
  location: string | null;
  application_id: string | null;
  status: InterviewSlotStatus;
  created_at: string;
}

// ---- JSONB FIELD TYPES ----

export interface SubjectRequirement {
  subject: string;
  min_gpa?: number;
}

export interface ScoreRequirement {
  score_type: ScoreType;
  min_value: number;
}

export interface CustomQuestion {
  id: string;
  question: string;
  max_length?: number;
  required: boolean;
}

export interface RubricItem {
  id: string;
  name: string;
  weight: number;
  auto_score: boolean;
  max_score: number;
}

// ---- JOINED / VIEW TYPES ----

export interface ProgramWithDetails extends Program {
  faculty: Faculty;
  university: University;
  requirements: ProgramRequirements | null;
}

export interface ApplicationWithDetails extends Application {
  program: ProgramWithDetails;
  student: StudentProfile;
  portfolio: StudentPortfolio | null;
  education: StudentEducation | null;
  scores_list: StudentScore[];
  documents: StudentDocument[];
}

export interface ApplicationForFaculty extends Application {
  student: StudentProfile;
  education: StudentEducation | null;
  scores_list: StudentScore[];
  documents: StudentDocument[];
  portfolio: StudentPortfolio | null;
}

// ---- INVITE ----

export interface Invite {
  id: string;
  email: string;
  role: UserRole;
  faculty_id: string | null;
  invited_by: string;
  token: string;
  accepted_at: string | null;
  expires_at: string;
  created_at: string;
}

// ---- INSERT TYPES ----

export type InsertProfile = Omit<Profile, "created_at" | "updated_at">;

export type InsertStudentProfile = Omit<
  StudentProfile,
  "id" | "created_at" | "updated_at"
>;

export type InsertStudentEducation = Omit<
  StudentEducation,
  "id" | "created_at" | "updated_at"
>;

export type InsertStudentScore = Omit<StudentScore, "id" | "created_at">;

export type InsertStudentDocument = Omit<StudentDocument, "id" | "created_at">;

export type InsertStudentPortfolio = Omit<
  StudentPortfolio,
  "id" | "created_at" | "updated_at"
>;

export type InsertUniversity = Omit<
  University,
  "id" | "created_at" | "updated_at"
>;

export type InsertFaculty = Omit<Faculty, "id" | "created_at" | "updated_at">;

export type InsertProgram = Omit<Program, "id" | "created_at" | "updated_at">;

export type InsertProgramRequirements = Omit<
  ProgramRequirements,
  "id" | "created_at" | "updated_at"
>;

export type InsertApplication = Omit<
  Application,
  "id" | "submitted_at" | "updated_at"
>;

export type InsertInterviewSlot = Omit<InterviewSlot, "id" | "created_at">;

export type InsertInvite = Omit<Invite, "id" | "token" | "accepted_at" | "expires_at" | "created_at">;

// ---- UPDATE TYPES ----

export type UpdateStudentProfile = Partial<
  Omit<StudentProfile, "id" | "user_id" | "created_at" | "updated_at">
>;

export type UpdateStudentEducation = Partial<
  Omit<StudentEducation, "id" | "student_id" | "created_at" | "updated_at">
>;

export type UpdateApplication = Partial<
  Pick<
    Application,
    "status" | "scores" | "total_score" | "waitlist_position" | "notes" | "reviewed_by"
  >
>;

export type UpdateProgram = Partial<
  Omit<Program, "id" | "faculty_id" | "created_at" | "updated_at">
>;

export type UpdateProgramRequirements = Partial<
  Omit<ProgramRequirements, "id" | "program_id" | "created_at" | "updated_at">
>;
