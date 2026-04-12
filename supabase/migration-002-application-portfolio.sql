-- ============================================
-- SabaiApply Migration 002: Application Form & Portfolio Builder
-- Run this in Supabase SQL Editor AFTER the initial schema
-- ============================================

-- ==========================================
-- 1. EXTEND ENUMS
-- ==========================================

ALTER TYPE score_type ADD VALUE IF NOT EXISTS 'A-Level';

ALTER TYPE doc_type ADD VALUE IF NOT EXISTS 'passport_copy';
ALTER TYPE doc_type ADD VALUE IF NOT EXISTS 'student_id_card';
ALTER TYPE doc_type ADD VALUE IF NOT EXISTS 'name_change_cert';
ALTER TYPE doc_type ADD VALUE IF NOT EXISTS 'score_certificate';
ALTER TYPE doc_type ADD VALUE IF NOT EXISTS 'recommendation_letter';

-- ==========================================
-- 2. ALTER EXISTING TABLES
-- ==========================================

-- student_profiles: add identity fields
ALTER TABLE student_profiles ADD COLUMN IF NOT EXISTS prefix TEXT;
ALTER TABLE student_profiles ADD COLUMN IF NOT EXISTS id_type TEXT;
ALTER TABLE student_profiles ADD COLUMN IF NOT EXISTS id_number TEXT;
ALTER TABLE student_profiles ADD COLUMN IF NOT EXISTS contact_email TEXT;

-- student_education: add detailed fields
ALTER TABLE student_education ADD COLUMN IF NOT EXISTS school_province TEXT;
ALTER TABLE student_education ADD COLUMN IF NOT EXISTS curriculum_type TEXT;
ALTER TABLE student_education ADD COLUMN IF NOT EXISTS study_plan TEXT;
ALTER TABLE student_education ADD COLUMN IF NOT EXISTS current_grade_level TEXT;

-- student_scores: add certificate and sub-type support
ALTER TABLE student_scores ADD COLUMN IF NOT EXISTS sub_type TEXT;
ALTER TABLE student_scores ADD COLUMN IF NOT EXISTS total_possible NUMERIC(7,2);
ALTER TABLE student_scores ADD COLUMN IF NOT EXISTS cefr_level TEXT;
ALTER TABLE student_scores ADD COLUMN IF NOT EXISTS certificate_url TEXT;
ALTER TABLE student_scores ADD COLUMN IF NOT EXISTS certificate_file_name TEXT;

-- student_documents: add metadata
ALTER TABLE student_documents ADD COLUMN IF NOT EXISTS description TEXT;
ALTER TABLE student_documents ADD COLUMN IF NOT EXISTS metadata_json JSONB DEFAULT '{}';

-- student_portfolios: add snapshot support
ALTER TABLE student_portfolios ADD COLUMN IF NOT EXISTS is_snapshot BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE student_portfolios ADD COLUMN IF NOT EXISTS parent_portfolio_id UUID REFERENCES student_portfolios(id) ON DELETE SET NULL;
ALTER TABLE student_portfolios ADD COLUMN IF NOT EXISTS essay TEXT;

-- ==========================================
-- 3. NEW TABLE: student_family
-- ==========================================

CREATE TABLE IF NOT EXISTS student_family (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id UUID NOT NULL UNIQUE REFERENCES student_profiles(id) ON DELETE CASCADE,
  -- Father
  father_prefix TEXT,
  father_first_name TEXT,
  father_last_name TEXT,
  father_first_name_th TEXT,
  father_last_name_th TEXT,
  father_occupation TEXT,
  father_education_level TEXT,
  father_phone TEXT,
  -- Mother
  mother_prefix TEXT,
  mother_first_name TEXT,
  mother_last_name TEXT,
  mother_first_name_th TEXT,
  mother_last_name_th TEXT,
  mother_occupation TEXT,
  mother_education_level TEXT,
  mother_phone TEXT,
  -- Guardian (if different from parents)
  has_guardian BOOLEAN NOT NULL DEFAULT false,
  guardian_relationship TEXT,
  guardian_prefix TEXT,
  guardian_first_name TEXT,
  guardian_last_name TEXT,
  guardian_first_name_th TEXT,
  guardian_last_name_th TEXT,
  guardian_occupation TEXT,
  guardian_education_level TEXT,
  guardian_phone TEXT,
  -- Household
  household_income TEXT,
  number_of_siblings INTEGER DEFAULT 0,
  sibling_order INTEGER,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ==========================================
-- 4. NEW TABLE: student_subject_scores
-- ==========================================

CREATE TABLE IF NOT EXISTS student_subject_scores (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id UUID NOT NULL REFERENCES student_profiles(id) ON DELETE CASCADE,
  score_system TEXT NOT NULL,
  subject_name TEXT NOT NULL,
  score_value NUMERIC(7,2) NOT NULL,
  total_possible NUMERIC(7,2),
  grade TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ==========================================
-- 5. NEW TABLE: portfolio_items
-- ==========================================

CREATE TABLE IF NOT EXISTS portfolio_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id UUID NOT NULL REFERENCES student_profiles(id) ON DELETE CASCADE,
  portfolio_id UUID NOT NULL REFERENCES student_portfolios(id) ON DELETE CASCADE,
  item_type TEXT NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  organizer TEXT,
  start_date DATE,
  end_date DATE,
  -- Competition-specific
  competition_level TEXT,
  result TEXT,
  -- Language test specific
  test_type TEXT,
  test_score NUMERIC(7,2),
  test_total NUMERIC(7,2),
  cefr_level TEXT,
  -- Flexible
  details_json JSONB DEFAULT '{}',
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ==========================================
-- 6. NEW TABLE: portfolio_item_files
-- ==========================================

CREATE TABLE IF NOT EXISTS portfolio_item_files (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  item_id UUID NOT NULL REFERENCES portfolio_items(id) ON DELETE CASCADE,
  file_url TEXT NOT NULL,
  file_name TEXT NOT NULL,
  file_type TEXT,
  file_size INTEGER,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ==========================================
-- 7. INDEXES
-- ==========================================

CREATE INDEX IF NOT EXISTS idx_student_family_student ON student_family(student_id);
CREATE INDEX IF NOT EXISTS idx_student_subject_scores_student ON student_subject_scores(student_id);
CREATE INDEX IF NOT EXISTS idx_portfolio_items_portfolio ON portfolio_items(portfolio_id);
CREATE INDEX IF NOT EXISTS idx_portfolio_items_student ON portfolio_items(student_id);
CREATE INDEX IF NOT EXISTS idx_portfolio_item_files_item ON portfolio_item_files(item_id);

-- ==========================================
-- 8. TRIGGERS
-- ==========================================

CREATE TRIGGER set_updated_at BEFORE UPDATE ON student_family
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER set_updated_at BEFORE UPDATE ON portfolio_items
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ==========================================
-- 9. ROW LEVEL SECURITY
-- ==========================================

ALTER TABLE student_family ENABLE ROW LEVEL SECURITY;
ALTER TABLE student_subject_scores ENABLE ROW LEVEL SECURITY;
ALTER TABLE portfolio_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE portfolio_item_files ENABLE ROW LEVEL SECURITY;

-- student_family
CREATE POLICY "Students can manage own family info"
  ON student_family FOR ALL
  USING (
    student_id IN (SELECT id FROM student_profiles WHERE user_id = auth.uid())
  );

CREATE POLICY "Faculty admins can view student family info"
  ON student_family FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('faculty_admin', 'uni_admin')
    )
  );

-- student_subject_scores
CREATE POLICY "Students can manage own subject scores"
  ON student_subject_scores FOR ALL
  USING (
    student_id IN (SELECT id FROM student_profiles WHERE user_id = auth.uid())
  );

CREATE POLICY "Faculty admins can view student subject scores"
  ON student_subject_scores FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('faculty_admin', 'uni_admin')
    )
  );

-- portfolio_items
CREATE POLICY "Students can manage own portfolio items"
  ON portfolio_items FOR ALL
  USING (
    student_id IN (SELECT id FROM student_profiles WHERE user_id = auth.uid())
  );

CREATE POLICY "Faculty admins can view portfolio items"
  ON portfolio_items FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('faculty_admin', 'uni_admin')
    )
  );

-- portfolio_item_files
CREATE POLICY "Students can manage own portfolio files"
  ON portfolio_item_files FOR ALL
  USING (
    item_id IN (
      SELECT id FROM portfolio_items
      WHERE student_id IN (SELECT id FROM student_profiles WHERE user_id = auth.uid())
    )
  );

CREATE POLICY "Faculty admins can view portfolio files"
  ON portfolio_item_files FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('faculty_admin', 'uni_admin')
    )
  );
