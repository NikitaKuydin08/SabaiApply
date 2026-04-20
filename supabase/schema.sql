-- ============================================
-- SabaiApply Database Schema (Loop-Proof Version)
-- Run this in Supabase SQL Editor
-- ============================================

-- ==========================================
-- 1. CUSTOM TYPES (ENUMS)
-- ==========================================

CREATE TYPE user_role AS ENUM ('student', 'faculty_admin', 'uni_admin');

CREATE TYPE application_status AS ENUM (
  'submitted', 'under_review', 'shortlisted', 'interview_scheduled',
  'accepted', 'waitlisted', 'rejected', 'confirmed', 'withdrawn'
);

CREATE TYPE score_type AS ENUM (
  'GAT', 'PAT', 'TGAT', 'TPAT', 'O-NET', 'SAT', 'IELTS', 'TOEFL'
);

CREATE TYPE doc_type AS ENUM (
  'transcript', 'id_copy', 'photo', 'certificate', 'portfolio'
);

CREATE TYPE portfolio_source AS ENUM (
  'sabaiapply', 'tcasfolio', 'ifolio', 'freestyle'
);

CREATE TYPE interview_slot_status AS ENUM (
  'available', 'booked', 'completed', 'no_show'
);

CREATE TYPE admission_round AS ENUM ('1', '2', '4');

-- ==========================================
-- 2. UNIVERSITY TABLES (Moved up for Foreign Key support)
-- ==========================================

CREATE TABLE universities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  name_th TEXT,
  logo_url TEXT,
  website TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE faculties (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  university_id UUID NOT NULL REFERENCES universities(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  name_th TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ==========================================
-- 3. PROFILES TABLE (extends Supabase Auth)
-- ==========================================

CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  role user_role NOT NULL DEFAULT 'student',
  university_id UUID REFERENCES universities(id) ON DELETE SET NULL, -- Added for uni_admin linkage
  full_name TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Link faculty admins to their faculty
CREATE TABLE faculty_admins (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  faculty_id UUID NOT NULL REFERENCES faculties(id) ON DELETE CASCADE,
  is_primary BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(user_id, faculty_id)
);

-- ==========================================
-- 4. STUDENT TABLES
-- ==========================================

CREATE TABLE student_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL UNIQUE REFERENCES profiles(id) ON DELETE CASCADE,
  first_name TEXT,
  last_name TEXT,
  first_name_th TEXT,
  last_name_th TEXT,
  dob DATE,
  nationality TEXT,
  gender TEXT,
  phone TEXT,
  line_id TEXT,
  address TEXT,
  photo_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE student_education (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id UUID NOT NULL REFERENCES student_profiles(id) ON DELETE CASCADE,
  school_name TEXT NOT NULL,
  gpa NUMERIC(4, 2),
  graduation_year INTEGER,
  transcript_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE student_scores (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id UUID NOT NULL REFERENCES student_profiles(id) ON DELETE CASCADE,
  score_type score_type NOT NULL,
  score_value NUMERIC(7, 2) NOT NULL,
  test_date DATE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE student_documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id UUID NOT NULL REFERENCES student_profiles(id) ON DELETE CASCADE,
  doc_type doc_type NOT NULL,
  file_url TEXT NOT NULL,
  file_name TEXT NOT NULL,
  file_size INTEGER,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE student_portfolios (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id UUID NOT NULL REFERENCES student_profiles(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  source portfolio_source NOT NULL DEFAULT 'sabaiapply',
  content_json JSONB DEFAULT '{}',
  external_url TEXT,
  pdf_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ==========================================
-- 5. PROGRAM TABLES
-- ==========================================

CREATE TABLE programs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  faculty_id UUID NOT NULL REFERENCES faculties(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  name_th TEXT,
  degree_type TEXT NOT NULL DEFAULT 'bachelor',
  seats_round_1 INTEGER DEFAULT 0,
  seats_round_2 INTEGER DEFAULT 0,
  seats_round_4 INTEGER DEFAULT 0,
  tuition_per_semester NUMERIC(10, 2),
  description TEXT,
  is_international BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE program_requirements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  program_id UUID NOT NULL UNIQUE REFERENCES programs(id) ON DELETE CASCADE,
  min_gpa NUMERIC(4, 2),
  required_subjects JSONB DEFAULT '[]',
  required_scores JSONB DEFAULT '[]',
  required_documents JSONB DEFAULT '[]',
  custom_questions JSONB DEFAULT '[]',
  scoring_rubric JSONB DEFAULT '[]',
  deadline_round_1 DATE,
  deadline_round_2 DATE,
  deadline_round_4 DATE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ==========================================
-- 6. APPLICATIONS
-- ==========================================

CREATE TABLE applications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id UUID NOT NULL REFERENCES student_profiles(id) ON DELETE CASCADE,
  program_id UUID NOT NULL REFERENCES programs(id) ON DELETE CASCADE,
  round admission_round NOT NULL,
  status application_status NOT NULL DEFAULT 'submitted',
  custom_answers JSONB DEFAULT '{}',
  portfolio_id UUID REFERENCES student_portfolios(id) ON DELETE SET NULL,
  submitted_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  reviewed_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
  scores JSONB DEFAULT '{}',
  total_score NUMERIC(7, 2),
  waitlist_position INTEGER,
  notes TEXT,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(student_id, program_id, round)
);

-- ==========================================
-- 7. INTERVIEW SLOTS
-- ==========================================

CREATE TABLE interview_slots (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  program_id UUID NOT NULL REFERENCES programs(id) ON DELETE CASCADE,
  round admission_round NOT NULL DEFAULT '1',
  datetime TIMESTAMPTZ NOT NULL,
  duration_minutes INTEGER NOT NULL DEFAULT 15,
  location TEXT,
  application_id UUID UNIQUE REFERENCES applications(id) ON DELETE SET NULL,
  status interview_slot_status NOT NULL DEFAULT 'available',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ==========================================
-- 8. INDEXES FOR PERFORMANCE
-- ==========================================

CREATE INDEX idx_student_profiles_user ON student_profiles(user_id);
CREATE INDEX idx_student_education_student ON student_education(student_id);
CREATE INDEX idx_student_scores_student ON student_scores(student_id);
CREATE INDEX idx_student_documents_student ON student_documents(student_id);
CREATE INDEX idx_student_portfolios_student ON student_portfolios(student_id);
CREATE INDEX idx_faculties_university ON faculties(university_id);
CREATE INDEX idx_programs_faculty ON programs(faculty_id);
CREATE INDEX idx_program_requirements_program ON program_requirements(program_id);
CREATE INDEX idx_applications_student ON applications(student_id);
CREATE INDEX idx_applications_program ON applications(program_id);
CREATE INDEX idx_applications_status ON applications(status);
CREATE INDEX idx_applications_round ON applications(round);
CREATE INDEX idx_interview_slots_program ON interview_slots(program_id);
CREATE INDEX idx_interview_slots_datetime ON interview_slots(datetime);
CREATE INDEX idx_faculty_admins_user ON faculty_admins(user_id);
CREATE INDEX idx_faculty_admins_faculty ON faculty_admins(faculty_id);

-- ==========================================
-- 9. AUTO-UPDATE updated_at TRIGGER
-- ==========================================

CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER set_updated_at BEFORE UPDATE ON profiles FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER set_updated_at BEFORE UPDATE ON student_profiles FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER set_updated_at BEFORE UPDATE ON student_education FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER set_updated_at BEFORE UPDATE ON student_portfolios FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER set_updated_at BEFORE UPDATE ON universities FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER set_updated_at BEFORE UPDATE ON faculties FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER set_updated_at BEFORE UPDATE ON programs FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER set_updated_at BEFORE UPDATE ON program_requirements FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER set_updated_at BEFORE UPDATE ON applications FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ==========================================
-- 10. AUTO-CREATE PROFILE ON SIGNUP
-- ==========================================

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, email, role)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'role', 'student')::public.user_role
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ==========================================
-- 11. SECURE ROLE-CHECK HELPERS (Bypasses RLS Loops)
-- ==========================================

-- 11.1 Gets the current user's role safely
CREATE OR REPLACE FUNCTION public.get_user_role()
RETURNS public.user_role
LANGUAGE plpgsql STABLE SECURITY DEFINER SET search_path = public AS $$
DECLARE
  found_role public.user_role;
BEGIN
  SELECT role INTO found_role FROM profiles WHERE id = auth.uid();
  RETURN found_role;
END;
$$;

-- 11.2 Checks if user is a uni_admin for a specific faculty
CREATE OR REPLACE FUNCTION public.is_uni_admin_for_faculty(target_faculty_id uuid)
RETURNS boolean
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM faculties f
    JOIN profiles p ON p.university_id = f.university_id
    WHERE f.id = target_faculty_id AND p.id = auth.uid() AND p.role = 'uni_admin'
  );
END;
$$;

-- 11.3 Checks if user is a faculty_admin for a specific faculty
CREATE OR REPLACE FUNCTION public.is_my_faculty(target_faculty_id uuid)
RETURNS boolean
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM faculty_admins
    WHERE user_id = auth.uid() AND faculty_id = target_faculty_id
  );
END;
$$;

-- 11.4 Checks if user has admin rights to a specific program
CREATE OR REPLACE FUNCTION public.can_manage_program(target_program_id uuid)
RETURNS boolean
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  prog_faculty_id uuid;
BEGIN
  SELECT faculty_id INTO prog_faculty_id FROM programs WHERE id = target_program_id;
  RETURN public.is_uni_admin_for_faculty(prog_faculty_id) OR public.is_my_faculty(prog_faculty_id);
END;
$$;

-- 11.5 Checks if an admin has rights to view a specific student's data
CREATE OR REPLACE FUNCTION public.check_is_admin_for_student(target_student_id uuid)
RETURNS boolean
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM applications a
    WHERE a.student_id = target_student_id
    AND public.can_manage_program(a.program_id)
  );
END;
$$;


-- ==========================================
-- 12. ROW LEVEL SECURITY (RLS)
-- ==========================================

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE student_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE student_education ENABLE ROW LEVEL SECURITY;
ALTER TABLE student_scores ENABLE ROW LEVEL SECURITY;
ALTER TABLE student_documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE student_portfolios ENABLE ROW LEVEL SECURITY;
ALTER TABLE universities ENABLE ROW LEVEL SECURITY;
ALTER TABLE faculties ENABLE ROW LEVEL SECURITY;
ALTER TABLE faculty_admins ENABLE ROW LEVEL SECURITY;
ALTER TABLE programs ENABLE ROW LEVEL SECURITY;
ALTER TABLE program_requirements ENABLE ROW LEVEL SECURITY;
ALTER TABLE applications ENABLE ROW LEVEL SECURITY;
ALTER TABLE interview_slots ENABLE ROW LEVEL SECURITY;

-- PROFILES
CREATE POLICY "Users can view own profile" ON profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON profiles FOR UPDATE USING (auth.uid() = id);

-- STUDENT PROFILES
CREATE POLICY "Students can view own student profile" ON student_profiles FOR SELECT USING (user_id = auth.uid());
CREATE POLICY "Students can insert own student profile" ON student_profiles FOR INSERT WITH CHECK (user_id = auth.uid());
CREATE POLICY "Students can update own student profile" ON student_profiles FOR UPDATE USING (user_id = auth.uid());
CREATE POLICY "Admins can view student profiles" ON student_profiles FOR SELECT USING (public.check_is_admin_for_student(id));

-- STUDENT EDUCATION
CREATE POLICY "Students can manage own education" ON student_education FOR ALL USING (student_id IN (SELECT id FROM student_profiles WHERE user_id = auth.uid()));
CREATE POLICY "Faculty admins can view student education" ON student_education FOR SELECT USING (public.check_is_admin_for_student(student_id));

-- STUDENT SCORES
CREATE POLICY "Students can manage own scores" ON student_scores FOR ALL USING (student_id IN (SELECT id FROM student_profiles WHERE user_id = auth.uid()));
CREATE POLICY "Faculty admins can view student scores" ON student_scores FOR SELECT USING (public.check_is_admin_for_student(student_id));

-- STUDENT DOCUMENTS
CREATE POLICY "Students can manage own documents" ON student_documents FOR ALL USING (student_id IN (SELECT id FROM student_profiles WHERE user_id = auth.uid()));
CREATE POLICY "Faculty admins can view student documents" ON student_documents FOR SELECT USING (public.check_is_admin_for_student(student_id));

-- STUDENT PORTFOLIOS
CREATE POLICY "Students can manage own portfolios" ON student_portfolios FOR ALL USING (student_id IN (SELECT id FROM student_profiles WHERE user_id = auth.uid()));
CREATE POLICY "Faculty admins can view student portfolios" ON student_portfolios FOR SELECT USING (public.check_is_admin_for_student(student_id));

-- UNIVERSITIES
CREATE POLICY "Anyone can view universities" ON universities FOR SELECT USING (true);
CREATE POLICY "Uni admins can manage universities" ON universities FOR ALL USING (public.get_user_role() = 'uni_admin');

-- FACULTIES
CREATE POLICY "Anyone can view faculties" ON faculties FOR SELECT USING (true);
CREATE POLICY "Admins can manage faculties" ON faculties FOR ALL USING (public.is_uni_admin_for_faculty(id) OR public.is_my_faculty(id));

-- FACULTY ADMINS
CREATE POLICY "Admins can view faculty_admins" ON faculty_admins FOR SELECT USING (user_id = auth.uid() OR public.is_uni_admin_for_faculty(faculty_id));
CREATE POLICY "Uni admins can manage faculty_admins" ON faculty_admins FOR ALL USING (public.is_uni_admin_for_faculty(faculty_id));

-- PROGRAMS
CREATE POLICY "Anyone can view programs" ON programs FOR SELECT USING (true);
CREATE POLICY "Faculty admins can manage their programs" ON programs FOR ALL USING (public.can_manage_program(id));

-- PROGRAM REQUIREMENTS
CREATE POLICY "Anyone can view program requirements" ON program_requirements FOR SELECT USING (true);
CREATE POLICY "Faculty admins can manage their program requirements" ON program_requirements FOR ALL USING (public.can_manage_program(program_id));

-- APPLICATIONS
CREATE POLICY "Students can view own applications" ON applications FOR SELECT USING (student_id IN (SELECT id FROM student_profiles WHERE user_id = auth.uid()));
CREATE POLICY "Students can insert applications" ON applications FOR INSERT WITH CHECK (student_id IN (SELECT id FROM student_profiles WHERE user_id = auth.uid()));
CREATE POLICY "Students can update own applications" ON applications FOR UPDATE USING (student_id IN (SELECT id FROM student_profiles WHERE user_id = auth.uid()));
CREATE POLICY "Faculty admins can view applications to their programs" ON applications FOR SELECT USING (public.can_manage_program(program_id));
CREATE POLICY "Faculty admins can update applications to their programs" ON applications FOR UPDATE USING (public.can_manage_program(program_id));

-- INTERVIEW SLOTS
CREATE POLICY "Faculty admins can manage interview slots" ON interview_slots FOR ALL USING (public.can_manage_program(program_id));
CREATE POLICY "Students can view available interview slots" ON interview_slots FOR SELECT USING (
  status = 'available' OR application_id IN (SELECT id FROM applications WHERE student_id IN (SELECT id FROM student_profiles WHERE user_id = auth.uid()))
);

-- ==========================================
-- 13. STORAGE BUCKETS
-- ==========================================

INSERT INTO storage.buckets (id, name, public)
VALUES
  ('documents', 'documents', false),
  ('portfolios', 'portfolios', false),
  ('photos', 'photos', true),
  ('logos', 'logos', true)
ON CONFLICT (id) DO NOTHING; -- Prevents errors if rerun

CREATE POLICY "Students can upload documents" ON storage.objects FOR INSERT WITH CHECK (bucket_id IN ('documents', 'portfolios', 'photos') AND (storage.foldername(name))[1] = auth.uid()::text);
CREATE POLICY "Students can view own documents" ON storage.objects FOR SELECT USING (bucket_id IN ('documents', 'portfolios', 'photos') AND (storage.foldername(name))[1] = auth.uid()::text);
CREATE POLICY "Faculty can view student documents" ON storage.objects FOR SELECT USING (bucket_id IN ('documents', 'portfolios') AND public.get_user_role() IN ('faculty_admin', 'uni_admin'));
CREATE POLICY "Anyone can view public photos and logos" ON storage.objects FOR SELECT USING (bucket_id IN ('photos', 'logos'));
CREATE POLICY "Admins can upload logos" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'logos' AND public.get_user_role() IN ('faculty_admin', 'uni_admin'));

-- ==========================================
-- 14. INVITES (Invite-Only Admin Registration)
-- ==========================================

CREATE TABLE invites (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT NOT NULL,
  role user_role NOT NULL DEFAULT 'faculty_admin',
  faculty_id UUID REFERENCES faculties(id) ON DELETE CASCADE,
  invited_by UUID NOT NULL REFERENCES profiles(id),
  token TEXT NOT NULL UNIQUE DEFAULT encode(gen_random_bytes(32), 'hex'),
  accepted_at TIMESTAMPTZ,
  expires_at TIMESTAMPTZ NOT NULL DEFAULT (now() + interval '7 days'),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_invites_token ON invites(token);
CREATE INDEX idx_invites_email ON invites(email);

ALTER TABLE invites ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can manage invites" ON invites FOR ALL USING (public.get_user_role() IN ('faculty_admin', 'uni_admin'));
CREATE POLICY "Anyone can view invite by token" ON invites FOR SELECT USING (true);