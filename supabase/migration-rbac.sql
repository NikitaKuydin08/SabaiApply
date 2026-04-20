-- ============================================
-- RBAC Migration: Role-Based Access Control
-- Run this in Supabase SQL Editor
-- ============================================

-- ==========================================
-- 1. ADD super_admin TO ENUM
-- ==========================================

ALTER TYPE user_role ADD VALUE IF NOT EXISTS 'super_admin';

-- ==========================================
-- 2. ADD university_id TO profiles AND invites
-- ==========================================

ALTER TABLE profiles ADD COLUMN IF NOT EXISTS university_id UUID REFERENCES universities(id) ON DELETE SET NULL;
CREATE INDEX IF NOT EXISTS idx_profiles_university ON profiles(university_id);

ALTER TABLE invites ADD COLUMN IF NOT EXISTS university_id UUID REFERENCES universities(id) ON DELETE CASCADE;

-- ==========================================
-- 3. UPDATE handle_new_user() TRIGGER
-- ==========================================

CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO profiles (id, email, role, university_id)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'role', 'student')::user_role,
    (NEW.raw_user_meta_data->>'university_id')::uuid
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ==========================================
-- 4. BACKFILL university_id FOR EXISTING ADMINS
-- ==========================================

UPDATE profiles SET university_id = (
  SELECT f.university_id FROM faculty_admins fa
  JOIN faculties f ON fa.faculty_id = f.id
  WHERE fa.user_id = profiles.id LIMIT 1
) WHERE role IN ('uni_admin', 'faculty_admin') AND university_id IS NULL;

-- ==========================================
-- 5. DROP ALL EXISTING RLS POLICIES
-- ==========================================

-- profiles
DROP POLICY IF EXISTS "Users can view own profile" ON profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
DROP POLICY IF EXISTS "Super admins can view all profiles" ON profiles;
DROP POLICY IF EXISTS "Super admins can update all profiles" ON profiles;

-- student_profiles
DROP POLICY IF EXISTS "Students can view own student profile" ON student_profiles;
DROP POLICY IF EXISTS "Students can insert own student profile" ON student_profiles;
DROP POLICY IF EXISTS "Students can update own student profile" ON student_profiles;
DROP POLICY IF EXISTS "Faculty admins can view student profiles" ON student_profiles;

-- student_education
DROP POLICY IF EXISTS "Students can manage own education" ON student_education;
DROP POLICY IF EXISTS "Faculty admins can view student education" ON student_education;

-- student_scores
DROP POLICY IF EXISTS "Students can manage own scores" ON student_scores;
DROP POLICY IF EXISTS "Faculty admins can view student scores" ON student_scores;

-- student_documents
DROP POLICY IF EXISTS "Students can manage own documents" ON student_documents;
DROP POLICY IF EXISTS "Faculty admins can view student documents" ON student_documents;

-- student_portfolios
DROP POLICY IF EXISTS "Students can manage own portfolios" ON student_portfolios;
DROP POLICY IF EXISTS "Faculty admins can view student portfolios" ON student_portfolios;

-- universities
DROP POLICY IF EXISTS "Anyone can view universities" ON universities;
DROP POLICY IF EXISTS "Uni admins can manage universities" ON universities;

-- faculties
DROP POLICY IF EXISTS "Anyone can view faculties" ON faculties;
DROP POLICY IF EXISTS "Admins can manage faculties" ON faculties;

-- faculty_admins
DROP POLICY IF EXISTS "Admins can view faculty_admins" ON faculty_admins;
DROP POLICY IF EXISTS "Uni admins can manage faculty_admins" ON faculty_admins;

-- programs
DROP POLICY IF EXISTS "Anyone can view programs" ON programs;
DROP POLICY IF EXISTS "Faculty admins can manage their programs" ON programs;

-- program_requirements
DROP POLICY IF EXISTS "Anyone can view program requirements" ON program_requirements;
DROP POLICY IF EXISTS "Faculty admins can manage their program requirements" ON program_requirements;

-- applications
DROP POLICY IF EXISTS "Students can view own applications" ON applications;
DROP POLICY IF EXISTS "Students can insert applications" ON applications;
DROP POLICY IF EXISTS "Students can update own applications" ON applications;
DROP POLICY IF EXISTS "Faculty admins can view applications to their programs" ON applications;
DROP POLICY IF EXISTS "Faculty admins can update applications to their programs" ON applications;

-- interview_slots
DROP POLICY IF EXISTS "Faculty admins can manage interview slots" ON interview_slots;
DROP POLICY IF EXISTS "Students can view available interview slots" ON interview_slots;

-- invites
DROP POLICY IF EXISTS "Admins can manage invites" ON invites;
DROP POLICY IF EXISTS "Anyone can view invite by token" ON invites;

-- ==========================================
-- 6. CREATE NEW SCOPED RLS POLICIES
-- ==========================================

-- ── PROFILES ──

CREATE POLICY "Users can view own profile"
  ON profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  USING (auth.uid() = id);

CREATE POLICY "Super admins can view all profiles"
  ON profiles FOR SELECT
  USING (EXISTS (SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.role = 'super_admin'));

CREATE POLICY "Super admins can update all profiles"
  ON profiles FOR UPDATE
  USING (EXISTS (SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.role = 'super_admin'));

-- ── UNIVERSITIES ──

CREATE POLICY "Students can view all universities"
  ON universities FOR SELECT
  USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'student'));

CREATE POLICY "Super admins have full access to universities"
  ON universities FOR ALL
  USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'super_admin'));

CREATE POLICY "Uni admins can view their own university"
  ON universities FOR SELECT
  USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'uni_admin' AND university_id = universities.id));

CREATE POLICY "Uni admins can update their own university"
  ON universities FOR UPDATE
  USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'uni_admin' AND university_id = universities.id));

CREATE POLICY "Faculty admins can view their university"
  ON universities FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM faculty_admins fa
    JOIN faculties f ON fa.faculty_id = f.id
    WHERE fa.user_id = auth.uid() AND f.university_id = universities.id
  ));

-- ── FACULTIES ──

CREATE POLICY "Students can view all faculties"
  ON faculties FOR SELECT
  USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'student'));

CREATE POLICY "Super admins have full access to faculties"
  ON faculties FOR ALL
  USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'super_admin'));

CREATE POLICY "Uni admins can manage faculties in their university"
  ON faculties FOR ALL
  USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'uni_admin' AND university_id = faculties.university_id));

CREATE POLICY "Faculty admins can view their assigned faculties"
  ON faculties FOR SELECT
  USING (EXISTS (SELECT 1 FROM faculty_admins fa WHERE fa.user_id = auth.uid() AND fa.faculty_id = faculties.id));

-- ── FACULTY_ADMINS ──

CREATE POLICY "Super admins have full access to faculty_admins"
  ON faculty_admins FOR ALL
  USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'super_admin'));

CREATE POLICY "Uni admins can manage faculty_admins in their university"
  ON faculty_admins FOR ALL
  USING (EXISTS (
    SELECT 1 FROM faculties f
    JOIN profiles p ON p.university_id = f.university_id
    WHERE f.id = faculty_admins.faculty_id AND p.id = auth.uid() AND p.role = 'uni_admin'
  ));

CREATE POLICY "Faculty admins can view their own assignments"
  ON faculty_admins FOR SELECT
  USING (user_id = auth.uid());

-- ── PROGRAMS ──

CREATE POLICY "Students can view all programs"
  ON programs FOR SELECT
  USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'student'));

CREATE POLICY "Super admins have full access to programs"
  ON programs FOR ALL
  USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'super_admin'));

CREATE POLICY "Uni admins can manage programs in their university"
  ON programs FOR ALL
  USING (EXISTS (
    SELECT 1 FROM faculties f
    JOIN profiles p ON p.university_id = f.university_id
    WHERE f.id = programs.faculty_id AND p.id = auth.uid() AND p.role = 'uni_admin'
  ));

CREATE POLICY "Faculty admins can manage programs in their faculty"
  ON programs FOR ALL
  USING (EXISTS (SELECT 1 FROM faculty_admins fa WHERE fa.user_id = auth.uid() AND fa.faculty_id = programs.faculty_id));

-- ── PROGRAM_REQUIREMENTS ──

CREATE POLICY "Students can view all program requirements"
  ON program_requirements FOR SELECT
  USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'student'));

CREATE POLICY "Super admins have full access to program_requirements"
  ON program_requirements FOR ALL
  USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'super_admin'));

CREATE POLICY "Uni admins can manage program_requirements in their university"
  ON program_requirements FOR ALL
  USING (EXISTS (
    SELECT 1 FROM programs p
    JOIN faculties f ON p.faculty_id = f.id
    JOIN profiles pr ON pr.university_id = f.university_id
    WHERE p.id = program_requirements.program_id AND pr.id = auth.uid() AND pr.role = 'uni_admin'
  ));

CREATE POLICY "Faculty admins can manage program_requirements in their faculty"
  ON program_requirements FOR ALL
  USING (EXISTS (
    SELECT 1 FROM programs p
    JOIN faculty_admins fa ON fa.faculty_id = p.faculty_id
    WHERE p.id = program_requirements.program_id AND fa.user_id = auth.uid()
  ));

-- ── STUDENT PROFILES ──

CREATE POLICY "Students can view own student profile"
  ON student_profiles FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Students can insert own student profile"
  ON student_profiles FOR INSERT WITH CHECK (user_id = auth.uid());

CREATE POLICY "Students can update own student profile"
  ON student_profiles FOR UPDATE USING (user_id = auth.uid());

CREATE POLICY "Super admins can view all student profiles"
  ON student_profiles FOR SELECT
  USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'super_admin'));

CREATE POLICY "Admins can view student profiles who applied to their programs"
  ON student_profiles FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM applications a
    JOIN programs p ON a.program_id = p.id
    JOIN faculties f ON p.faculty_id = f.id
    WHERE a.student_id = student_profiles.id
    AND (
      EXISTS (SELECT 1 FROM profiles pr WHERE pr.id = auth.uid() AND pr.role = 'uni_admin' AND pr.university_id = f.university_id)
      OR
      EXISTS (SELECT 1 FROM faculty_admins fa WHERE fa.user_id = auth.uid() AND fa.faculty_id = f.id)
    )
  ));

-- ── STUDENT EDUCATION ──

CREATE POLICY "Students can manage own education"
  ON student_education FOR ALL
  USING (student_id IN (SELECT id FROM student_profiles WHERE user_id = auth.uid()));

CREATE POLICY "Super admins can view all student education"
  ON student_education FOR SELECT
  USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'super_admin'));

CREATE POLICY "Admins can view student education for their applicants"
  ON student_education FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM applications a
    JOIN programs p ON a.program_id = p.id
    JOIN faculties f ON p.faculty_id = f.id
    WHERE a.student_id = student_education.student_id
    AND (
      EXISTS (SELECT 1 FROM profiles pr WHERE pr.id = auth.uid() AND pr.role = 'uni_admin' AND pr.university_id = f.university_id)
      OR
      EXISTS (SELECT 1 FROM faculty_admins fa WHERE fa.user_id = auth.uid() AND fa.faculty_id = f.id)
    )
  ));

-- ── STUDENT SCORES ──

CREATE POLICY "Students can manage own scores"
  ON student_scores FOR ALL
  USING (student_id IN (SELECT id FROM student_profiles WHERE user_id = auth.uid()));

CREATE POLICY "Super admins can view all student scores"
  ON student_scores FOR SELECT
  USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'super_admin'));

CREATE POLICY "Admins can view student scores for their applicants"
  ON student_scores FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM applications a
    JOIN programs p ON a.program_id = p.id
    JOIN faculties f ON p.faculty_id = f.id
    WHERE a.student_id = student_scores.student_id
    AND (
      EXISTS (SELECT 1 FROM profiles pr WHERE pr.id = auth.uid() AND pr.role = 'uni_admin' AND pr.university_id = f.university_id)
      OR
      EXISTS (SELECT 1 FROM faculty_admins fa WHERE fa.user_id = auth.uid() AND fa.faculty_id = f.id)
    )
  ));

-- ── STUDENT DOCUMENTS ──

CREATE POLICY "Students can manage own documents"
  ON student_documents FOR ALL
  USING (student_id IN (SELECT id FROM student_profiles WHERE user_id = auth.uid()));

CREATE POLICY "Super admins can view all student documents"
  ON student_documents FOR SELECT
  USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'super_admin'));

CREATE POLICY "Admins can view student documents for their applicants"
  ON student_documents FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM applications a
    JOIN programs p ON a.program_id = p.id
    JOIN faculties f ON p.faculty_id = f.id
    WHERE a.student_id = student_documents.student_id
    AND (
      EXISTS (SELECT 1 FROM profiles pr WHERE pr.id = auth.uid() AND pr.role = 'uni_admin' AND pr.university_id = f.university_id)
      OR
      EXISTS (SELECT 1 FROM faculty_admins fa WHERE fa.user_id = auth.uid() AND fa.faculty_id = f.id)
    )
  ));

-- ── STUDENT PORTFOLIOS ──

CREATE POLICY "Students can manage own portfolios"
  ON student_portfolios FOR ALL
  USING (student_id IN (SELECT id FROM student_profiles WHERE user_id = auth.uid()));

CREATE POLICY "Super admins can view all student portfolios"
  ON student_portfolios FOR SELECT
  USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'super_admin'));

CREATE POLICY "Admins can view student portfolios for their applicants"
  ON student_portfolios FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM applications a
    JOIN programs p ON a.program_id = p.id
    JOIN faculties f ON p.faculty_id = f.id
    WHERE a.student_id = student_portfolios.student_id
    AND (
      EXISTS (SELECT 1 FROM profiles pr WHERE pr.id = auth.uid() AND pr.role = 'uni_admin' AND pr.university_id = f.university_id)
      OR
      EXISTS (SELECT 1 FROM faculty_admins fa WHERE fa.user_id = auth.uid() AND fa.faculty_id = f.id)
    )
  ));

-- ── APPLICATIONS ──

CREATE POLICY "Students can view own applications"
  ON applications FOR SELECT
  USING (student_id IN (SELECT id FROM student_profiles WHERE user_id = auth.uid()));

CREATE POLICY "Students can insert applications"
  ON applications FOR INSERT
  WITH CHECK (student_id IN (SELECT id FROM student_profiles WHERE user_id = auth.uid()));

CREATE POLICY "Students can update own applications"
  ON applications FOR UPDATE
  USING (student_id IN (SELECT id FROM student_profiles WHERE user_id = auth.uid()));

CREATE POLICY "Super admins have full access to applications"
  ON applications FOR ALL
  USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'super_admin'));

CREATE POLICY "Uni admins can view applications to their university"
  ON applications FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM programs p
    JOIN faculties f ON p.faculty_id = f.id
    JOIN profiles pr ON pr.university_id = f.university_id
    WHERE p.id = applications.program_id AND pr.id = auth.uid() AND pr.role = 'uni_admin'
  ));

CREATE POLICY "Uni admins can update applications to their university"
  ON applications FOR UPDATE
  USING (EXISTS (
    SELECT 1 FROM programs p
    JOIN faculties f ON p.faculty_id = f.id
    JOIN profiles pr ON pr.university_id = f.university_id
    WHERE p.id = applications.program_id AND pr.id = auth.uid() AND pr.role = 'uni_admin'
  ));

CREATE POLICY "Faculty admins can view applications to their faculty"
  ON applications FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM programs p
    JOIN faculty_admins fa ON fa.faculty_id = p.faculty_id
    WHERE p.id = applications.program_id AND fa.user_id = auth.uid()
  ));

CREATE POLICY "Faculty admins can update applications to their faculty"
  ON applications FOR UPDATE
  USING (EXISTS (
    SELECT 1 FROM programs p
    JOIN faculty_admins fa ON fa.faculty_id = p.faculty_id
    WHERE p.id = applications.program_id AND fa.user_id = auth.uid()
  ));

-- ── INTERVIEW SLOTS ──

CREATE POLICY "Super admins have full access to interview_slots"
  ON interview_slots FOR ALL
  USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'super_admin'));

CREATE POLICY "Uni admins can manage interview_slots in their university"
  ON interview_slots FOR ALL
  USING (EXISTS (
    SELECT 1 FROM programs p
    JOIN faculties f ON p.faculty_id = f.id
    JOIN profiles pr ON pr.university_id = f.university_id
    WHERE p.id = interview_slots.program_id AND pr.id = auth.uid() AND pr.role = 'uni_admin'
  ));

CREATE POLICY "Faculty admins can manage interview_slots in their faculty"
  ON interview_slots FOR ALL
  USING (EXISTS (
    SELECT 1 FROM programs p
    JOIN faculty_admins fa ON fa.faculty_id = p.faculty_id
    WHERE p.id = interview_slots.program_id AND fa.user_id = auth.uid()
  ));

CREATE POLICY "Students can view available or their booked interview slots"
  ON interview_slots FOR SELECT
  USING (
    status = 'available'
    OR application_id IN (
      SELECT id FROM applications
      WHERE student_id IN (SELECT id FROM student_profiles WHERE user_id = auth.uid())
    )
  );

-- ── INVITES ──

CREATE POLICY "Anyone can view invite by token"
  ON invites FOR SELECT
  USING (true);

CREATE POLICY "Super admins can manage all invites"
  ON invites FOR ALL
  USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'super_admin'));

CREATE POLICY "Uni admins can manage invites for their university"
  ON invites FOR ALL
  USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'uni_admin')
    AND (
      faculty_id IS NULL
      OR EXISTS (
        SELECT 1 FROM faculties f
        JOIN profiles p ON p.university_id = f.university_id
        WHERE f.id = invites.faculty_id AND p.id = auth.uid()
      )
    )
  );

-- ==========================================
-- 7. SEED SUPER ADMIN
-- ==========================================

UPDATE profiles SET role = 'super_admin' WHERE email = 'mubinaibrahim3@gmail.com';
