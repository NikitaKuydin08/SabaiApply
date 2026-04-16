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
  | "TOEFL"
  | "A-Level";

export type DocType =
  | "transcript"
  | "id_copy"
  | "photo"
  | "certificate"
  | "portfolio"
  | "passport_copy"
  | "student_id_card"
  | "name_change_cert"
  | "score_certificate"
  | "recommendation_letter";

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

export type PortfolioItemType =
  | "project"
  | "activity"
  | "competition"
  | "camp"
  | "course"
  | "language_test"
  | "award"
  | "other";

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
  prefix: string | null;
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
  id_type: string | null;
  id_number: string | null;
  contact_email: string | null;
  created_at: string;
  updated_at: string;
}

export interface StudentEducation {
  id: string;
  student_id: string;
  school_name: string;
  school_province: string | null;
  curriculum_type: string | null;
  study_plan: string | null;
  current_grade_level: string | null;
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
  sub_type: string | null;
  score_value: number;
  total_possible: number | null;
  test_date: string | null;
  cefr_level: string | null;
  certificate_url: string | null;
  certificate_file_name: string | null;
  created_at: string;
}

export interface StudentDocument {
  id: string;
  student_id: string;
  doc_type: DocType;
  file_url: string;
  file_name: string;
  file_size: number | null;
  description: string | null;
  metadata_json: Record<string, unknown>;
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
  essay: string | null;
  is_snapshot: boolean;
  parent_portfolio_id: string | null;
  created_at: string;
  updated_at: string;
}

export interface StudentFamily {
  id: string;
  student_id: string;
  father_prefix: string | null;
  father_first_name: string | null;
  father_last_name: string | null;
  father_first_name_th: string | null;
  father_last_name_th: string | null;
  father_occupation: string | null;
  father_education_level: string | null;
  father_phone: string | null;
  mother_prefix: string | null;
  mother_first_name: string | null;
  mother_last_name: string | null;
  mother_first_name_th: string | null;
  mother_last_name_th: string | null;
  mother_occupation: string | null;
  mother_education_level: string | null;
  mother_phone: string | null;
  has_guardian: boolean;
  guardian_relationship: string | null;
  guardian_prefix: string | null;
  guardian_first_name: string | null;
  guardian_last_name: string | null;
  guardian_first_name_th: string | null;
  guardian_last_name_th: string | null;
  guardian_occupation: string | null;
  guardian_education_level: string | null;
  guardian_phone: string | null;
  household_income: string | null;
  number_of_siblings: number | null;
  sibling_order: number | null;
  created_at: string;
  updated_at: string;
}

export interface StudentSubjectScore {
  id: string;
  student_id: string;
  score_system: string;
  subject_name: string;
  score_value: number;
  total_possible: number | null;
  grade: string | null;
  created_at: string;
}

export interface PortfolioItem {
  id: string;
  student_id: string;
  portfolio_id: string;
  item_type: PortfolioItemType;
  title: string;
  description: string | null;
  organizer: string | null;
  start_date: string | null;
  end_date: string | null;
  competition_level: string | null;
  result: string | null;
  test_type: string | null;
  test_score: number | null;
  test_total: number | null;
  cefr_level: string | null;
  details_json: Record<string, unknown>;
  sort_order: number;
  created_at: string;
  updated_at: string;
}

export interface PortfolioItemFile {
  id: string;
  item_id: string;
  file_url: string;
  file_name: string;
  file_type: string | null;
  file_size: number | null;
  sort_order: number;
  created_at: string;
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

export type InsertStudentFamily = Omit<
  StudentFamily,
  "id" | "created_at" | "updated_at"
>;

export type InsertStudentSubjectScore = Omit<StudentSubjectScore, "id" | "created_at">;

export type InsertPortfolioItem = Omit<
  PortfolioItem,
  "id" | "created_at" | "updated_at"
>;

export type InsertPortfolioItemFile = Omit<PortfolioItemFile, "id" | "created_at">;

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

export type UpdateStudentFamily = Partial<
  Omit<StudentFamily, "id" | "student_id" | "created_at" | "updated_at">
>;

export type UpdatePortfolioItem = Partial<
  Omit<PortfolioItem, "id" | "student_id" | "portfolio_id" | "created_at" | "updated_at">
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
