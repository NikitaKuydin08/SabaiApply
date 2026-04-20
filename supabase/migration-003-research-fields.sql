-- ============================================
-- SabaiApply Migration 003: Additional fields from university research
-- Based on KMITL iFolio + Chula ISE admission requirements
-- Run in Supabase SQL Editor AFTER migration-002
-- ============================================

-- ==========================================
-- 1. NEW SCORE TYPES
-- ==========================================

ALTER TYPE score_type ADD VALUE IF NOT EXISTS 'Duolingo';
ALTER TYPE score_type ADD VALUE IF NOT EXISTS 'CU-TEP';
ALTER TYPE score_type ADD VALUE IF NOT EXISTS 'AAT';
ALTER TYPE score_type ADD VALUE IF NOT EXISTS 'ATS';
ALTER TYPE score_type ADD VALUE IF NOT EXISTS 'ACT';
ALTER TYPE score_type ADD VALUE IF NOT EXISTS 'IB';

-- ==========================================
-- 2. NEW DOCUMENT TYPES
-- ==========================================

ALTER TYPE doc_type ADD VALUE IF NOT EXISTS 'high_school_diploma';
ALTER TYPE doc_type ADD VALUE IF NOT EXISTS 'high_school_equivalency';
ALTER TYPE doc_type ADD VALUE IF NOT EXISTS 'student_status_cert';
ALTER TYPE doc_type ADD VALUE IF NOT EXISTS 'gpa_equivalency_cert';
ALTER TYPE doc_type ADD VALUE IF NOT EXISTS 'english_proficiency_cert';

-- ==========================================
-- 3. NEW FIELDS ON student_profiles
-- ==========================================

ALTER TABLE student_profiles ADD COLUMN IF NOT EXISTS religion TEXT;
ALTER TABLE student_profiles ADD COLUMN IF NOT EXISTS former_name TEXT;
ALTER TABLE student_profiles ADD COLUMN IF NOT EXISTS nickname TEXT;
ALTER TABLE student_profiles ADD COLUMN IF NOT EXISTS mailing_address TEXT;
ALTER TABLE student_profiles ADD COLUMN IF NOT EXISTS first_language TEXT;
ALTER TABLE student_profiles ADD COLUMN IF NOT EXISTS language_at_home TEXT;
