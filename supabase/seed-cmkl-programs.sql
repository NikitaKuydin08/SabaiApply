-- ============================================
-- Seed CMKL University undergraduate programs
-- Run this in Supabase SQL Editor
-- Auto-detects CMKL university by name, creates "School of Engineering"
-- faculty if missing, then inserts the 4 undergrad programs.
-- Safe to re-run: uses ON CONFLICT-style NOT EXISTS guards.
-- ============================================

DO $$
DECLARE
  uni_id UUID;
  f_id UUID;
BEGIN
  -- Find CMKL university
  SELECT id INTO uni_id FROM universities
  WHERE name ILIKE '%cmkl%' OR name ILIKE '%carnegie mellon%'
  LIMIT 1;

  IF uni_id IS NULL THEN
    RAISE NOTICE 'CMKL university not found. Create it first on the admin portal.';
    RETURN;
  END IF;

  RAISE NOTICE 'Found CMKL university: %', uni_id;

  -- Ensure "School of Engineering" faculty exists
  SELECT id INTO f_id FROM faculties
  WHERE university_id = uni_id AND name ILIKE 'School of Engineering'
  LIMIT 1;

  IF f_id IS NULL THEN
    INSERT INTO faculties (university_id, name, name_th)
    VALUES (uni_id, 'School of Engineering', 'สำนักวิศวกรรมศาสตร์')
    RETURNING id INTO f_id;
    RAISE NOTICE 'Created faculty School of Engineering: %', f_id;
  ELSE
    RAISE NOTICE 'Faculty School of Engineering already exists: %', f_id;
  END IF;

  -- Insert undergrad programs (skip if name already exists for this faculty)
  INSERT INTO programs (faculty_id, name, name_th, degree_type, is_international, description)
  SELECT f_id, p.name, p.name_th, 'bachelor', true, p.description
  FROM (VALUES
    (
      'AI and Computer Engineering (AiCE)',
      'วิศวกรรมปัญญาประดิษฐ์และคอมพิวเตอร์',
      'For students who want to build intelligent systems through AI, software, cybersecurity, cloud, and game engineering.'
    ),
    (
      'B.Eng. in Artificial Intelligence and Computer Engineering (AiCE) and B.Eng. in Computer Innovation Engineering (CIE) CMKL x KMITL Dual Degree Program',
      'หลักสูตรปริญญาคู่ วิศวกรรมปัญญาประดิษฐ์และคอมพิวเตอร์ (AiCE) และ วิศวกรรมคอมพิวเตอร์เชิงนวัตกรรม (CIE) CMKL x KMITL',
      'Dual engineering degrees in AI and computer innovation through CMKL and KMITL.'
    ),
    (
      'Integrated Master and Bachelor (IMB)',
      'หลักสูตรบูรณาการปริญญาตรีและปริญญาโท',
      'For high-performing students who want to fast-track from bachelor''s to master''s study.'
    ),
    (
      'AI Innovation (Aii)',
      'นวัตกรรมปัญญาประดิษฐ์',
      'For students who want to build and launch AI products, ventures, and real-world solutions.'
    )
  ) AS p(name, name_th, description)
  WHERE NOT EXISTS (
    SELECT 1 FROM programs
    WHERE faculty_id = f_id AND name ILIKE p.name
  );

  RAISE NOTICE 'CMKL programs seeded.';
END $$;
