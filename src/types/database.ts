// Auto-generated types will go here after connecting Supabase
// Run: npx supabase gen types typescript --project-id YOUR_PROJECT_ID > src/types/database.ts

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
