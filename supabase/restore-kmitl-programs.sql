-- ============================================
-- Restore all standard KMITL programs
-- Run this in Supabase SQL Editor
-- Auto-detects KMITL university + faculties by name
-- ============================================

DO $$
DECLARE
  uni_id UUID;
  f_id UUID;
BEGIN
  -- Find KMITL university
  SELECT id INTO uni_id FROM universities
  WHERE name ILIKE '%kmitl%' OR name ILIKE '%ladkrabang%' OR name_th LIKE '%ลาดกระบัง%'
  LIMIT 1;

  IF uni_id IS NULL THEN
    RAISE NOTICE 'KMITL university not found';
    RETURN;
  END IF;

  RAISE NOTICE 'Found KMITL university: %', uni_id;

  -- ── ENGINEERING ──
  SELECT id INTO f_id FROM faculties
  WHERE university_id = uni_id AND name ILIKE 'Faculty of Engineering'
  LIMIT 1;

  IF f_id IS NOT NULL THEN
    INSERT INTO programs (faculty_id, name, name_th, degree_type, is_international)
    SELECT f_id, p.name, p.name_th, 'bachelor', p.is_international
    FROM (VALUES
      ('Computer Engineering', 'วิศวกรรมคอมพิวเตอร์', false),
      ('Software Engineering', 'วิศวกรรมซอฟต์แวร์', false),
      ('Electrical Engineering', 'วิศวกรรมไฟฟ้า', false),
      ('Electronics Engineering', 'วิศวกรรมอิเล็กทรอนิกส์', false),
      ('Telecommunications Engineering', 'วิศวกรรมโทรคมนาคม', false),
      ('Mechanical Engineering', 'วิศวกรรมเครื่องกล', false),
      ('Civil Engineering', 'วิศวกรรมโยธา', false),
      ('Chemical Engineering', 'วิศวกรรมเคมี', false),
      ('Industrial Engineering', 'วิศวกรรมอุตสาหการ', false),
      ('Biomedical Engineering', 'วิศวกรรมชีวการแพทย์', false),
      ('Robotics and AI Engineering', 'วิศวกรรมหุ่นยนต์และปัญญาประดิษฐ์', false),
      ('Energy Engineering', 'วิศวกรรมพลังงาน', false),
      ('Financial Engineering', 'วิศวกรรมการเงิน', false),
      ('Food Engineering', 'วิศวกรรมอาหาร', false),
      ('Railway Transport Engineering', 'วิศวกรรมระบบรางและการขนส่ง', false),
      ('Control Engineering', 'วิศวกรรมควบคุม', false),
      ('Mechatronics Engineering', 'วิศวกรรมเมคคาทรอนิกส์', false),
      ('Smart Agricultural Engineering', 'วิศวกรรมเกษตรอัจฉริยะ', false),
      ('Electric Vehicle Engineering', 'วิศวกรรมยานยนต์ไฟฟ้า', false),
      ('AI Engineering', 'วิศวกรรมปัญญาประดิษฐ์', false),
      ('Engineering Management', 'การจัดการวิศวกรรม', false)
    ) AS p(name, name_th, is_international)
    WHERE NOT EXISTS (
      SELECT 1 FROM programs WHERE faculty_id = f_id AND LOWER(name) = LOWER(p.name)
    );
  END IF;

  -- ── ARCHITECTURE, ART AND DESIGN ──
  SELECT id INTO f_id FROM faculties
  WHERE university_id = uni_id AND (name ILIKE '%architecture%' OR name ILIKE '%art%design%')
  LIMIT 1;

  IF f_id IS NOT NULL THEN
    INSERT INTO programs (faculty_id, name, name_th, degree_type, is_international)
    SELECT f_id, p.name, p.name_th, 'bachelor', p.is_international
    FROM (VALUES
      ('Architecture', 'สถาปัตยกรรม', false),
      ('Architecture (International)', 'สถาปัตยกรรม (นานาชาติ)', true),
      ('Interior Architecture', 'สถาปัตยกรรมภายใน', false),
      ('Industrial Design', 'การออกแบบอุตสาหกรรม', false),
      ('Communication Design', 'การออกแบบนิเทศศิลป์', false),
      ('Film and Digital Media', 'ภาพยนตร์และสื่อดิจิทัล', false),
      ('Fine Arts', 'ศิลปกรรม', false),
      ('Photography', 'การถ่ายภาพ', false),
      ('Urban Design', 'ผังเมือง', false),
      ('Landscape Architecture', 'ภูมิสถาปัตยกรรม', false)
    ) AS p(name, name_th, is_international)
    WHERE NOT EXISTS (
      SELECT 1 FROM programs WHERE faculty_id = f_id AND LOWER(name) = LOWER(p.name)
    );
  END IF;

  -- ── INDUSTRIAL EDUCATION ──
  SELECT id INTO f_id FROM faculties
  WHERE university_id = uni_id AND name ILIKE '%industrial education%'
  LIMIT 1;

  IF f_id IS NOT NULL THEN
    INSERT INTO programs (faculty_id, name, name_th, degree_type, is_international)
    SELECT f_id, p.name, p.name_th, 'bachelor', false
    FROM (VALUES
      ('Electrical Engineering Education', 'ครุศาสตร์วิศวกรรมไฟฟ้า'),
      ('Mechanical Engineering Education', 'ครุศาสตร์วิศวกรรมเครื่องกล'),
      ('Civil Engineering Education', 'ครุศาสตร์วิศวกรรมโยธา'),
      ('Industrial Engineering Education', 'ครุศาสตร์วิศวกรรมอุตสาหการ'),
      ('Electronics and Telecommunications Education', 'ครุศาสตร์อิเล็กทรอนิกส์และโทรคมนาคม'),
      ('Architecture Education', 'ครุศาสตร์สถาปัตยกรรม'),
      ('Industrial Arts Education', 'ครุศาสตร์ศิลปอุตสาหกรรม')
    ) AS p(name, name_th)
    WHERE NOT EXISTS (
      SELECT 1 FROM programs WHERE faculty_id = f_id AND LOWER(name) = LOWER(p.name)
    );
  END IF;

  -- ── SCIENCE ──
  SELECT id INTO f_id FROM faculties
  WHERE university_id = uni_id AND name ILIKE 'Faculty of Science'
  LIMIT 1;

  IF f_id IS NOT NULL THEN
    INSERT INTO programs (faculty_id, name, name_th, degree_type, is_international)
    SELECT f_id, p.name, p.name_th, 'bachelor', p.is_international
    FROM (VALUES
      ('Mathematics', 'คณิตศาสตร์', false),
      ('Statistics', 'สถิติ', false),
      ('Applied Mathematics', 'คณิตศาสตร์ประยุกต์', false),
      ('Physics', 'ฟิสิกส์', false),
      ('Applied Physics', 'ฟิสิกส์ประยุกต์', false),
      ('Chemistry', 'เคมี', false),
      ('Applied Chemistry', 'เคมีประยุกต์', false),
      ('Biology', 'ชีววิทยา', false),
      ('Microbiology', 'จุลชีววิทยา', false),
      ('Environmental Science', 'วิทยาศาสตร์สิ่งแวดล้อม', false),
      ('Digital Technology and Integrated Innovation', 'เทคโนโลยีดิจิทัลและนวัตกรรม', false),
      ('Applied Microbiology (International)', 'จุลชีววิทยาประยุกต์ (นานาชาติ)', true)
    ) AS p(name, name_th, is_international)
    WHERE NOT EXISTS (
      SELECT 1 FROM programs WHERE faculty_id = f_id AND LOWER(name) = LOWER(p.name)
    );
  END IF;

  -- ── INFORMATION TECHNOLOGY ──
  SELECT id INTO f_id FROM faculties
  WHERE university_id = uni_id AND (name ILIKE '%information technology%' OR name_th LIKE '%เทคโนโลยีสารสนเทศ%')
  LIMIT 1;

  IF f_id IS NOT NULL THEN
    INSERT INTO programs (faculty_id, name, name_th, degree_type, is_international)
    SELECT f_id, p.name, p.name_th, 'bachelor', p.is_international
    FROM (VALUES
      ('Information Technology', 'เทคโนโลยีสารสนเทศ', false),
      ('Data Science and Business Analytics', 'วิทยาการข้อมูลและการวิเคราะห์ทางธุรกิจ', false),
      ('Business IT (International)', 'เทคโนโลยีสารสนเทศทางธุรกิจ (นานาชาติ)', true)
    ) AS p(name, name_th, is_international)
    WHERE NOT EXISTS (
      SELECT 1 FROM programs WHERE faculty_id = f_id AND LOWER(name) = LOWER(p.name)
    );
  END IF;

  -- ── FOOD INDUSTRY ──
  SELECT id INTO f_id FROM faculties
  WHERE university_id = uni_id AND name ILIKE '%food%'
  LIMIT 1;

  IF f_id IS NOT NULL THEN
    INSERT INTO programs (faculty_id, name, name_th, degree_type, is_international)
    SELECT f_id, p.name, p.name_th, 'bachelor', p.is_international
    FROM (VALUES
      ('Food Science and Technology', 'วิทยาศาสตร์และเทคโนโลยีการอาหาร', false),
      ('Food Industrial Innovation', 'นวัตกรรมอุตสาหกรรมอาหาร', false),
      ('Food Service Industry Management', 'การจัดการอุตสาหกรรมบริการอาหาร', false),
      ('Food Service Science (International)', 'วิทยาศาสตร์การบริการอาหาร (นานาชาติ)', true)
    ) AS p(name, name_th, is_international)
    WHERE NOT EXISTS (
      SELECT 1 FROM programs WHERE faculty_id = f_id AND LOWER(name) = LOWER(p.name)
    );
  END IF;

  -- ── BUSINESS ADMINISTRATION ──
  SELECT id INTO f_id FROM faculties
  WHERE university_id = uni_id AND name ILIKE '%business%'
  LIMIT 1;

  IF f_id IS NOT NULL THEN
    INSERT INTO programs (faculty_id, name, name_th, degree_type, is_international)
    SELECT f_id, p.name, p.name_th, 'bachelor', p.is_international
    FROM (VALUES
      ('Innovation and Technology Marketing', 'นวัตกรรมและการตลาดเทคโนโลยี', true),
      ('Global Business and Financial Management', 'ธุรกิจระดับโลกและการจัดการการเงิน', true),
      ('Digital Logistics and Supply Chain Management', 'โลจิสติกส์ดิจิทัลและการจัดการห่วงโซ่อุปทาน', true),
      ('Business Administration', 'บริหารธุรกิจ', false),
      ('Accounting', 'การบัญชี', false),
      ('Entrepreneurship (International)', 'การเป็นผู้ประกอบการ (นานาชาติ)', true)
    ) AS p(name, name_th, is_international)
    WHERE NOT EXISTS (
      SELECT 1 FROM programs WHERE faculty_id = f_id AND LOWER(name) = LOWER(p.name)
    );
  END IF;

  -- ── LIBERAL ARTS ──
  SELECT id INTO f_id FROM faculties
  WHERE university_id = uni_id AND (name ILIKE '%liberal arts%' OR name_th LIKE '%ศิลปศาสตร์%')
  LIMIT 1;

  IF f_id IS NOT NULL THEN
    INSERT INTO programs (faculty_id, name, name_th, degree_type, is_international)
    SELECT f_id, p.name, p.name_th, 'bachelor', false
    FROM (VALUES
      ('English for Business Communication', 'ภาษาอังกฤษเพื่อการสื่อสารธุรกิจ'),
      ('Japanese for Industrial Communication', 'ภาษาญี่ปุ่นเพื่อการสื่อสารอุตสาหกรรม'),
      ('Chinese for Industrial Communication', 'ภาษาจีนเพื่อการสื่อสารอุตสาหกรรม'),
      ('Innovative Industrial Psychology and Human Resource Management', 'จิตวิทยานวัตกรรมอุตสาหกรรมและการจัดการทรัพยากรมนุษย์'),
      ('Industrial and Organizational Psychology', 'จิตวิทยาอุตสาหกรรมและองค์การ')
    ) AS p(name, name_th)
    WHERE NOT EXISTS (
      SELECT 1 FROM programs WHERE faculty_id = f_id AND LOWER(name) = LOWER(p.name)
    );
  END IF;

  -- ── MEDICINE ──
  SELECT id INTO f_id FROM faculties
  WHERE university_id = uni_id AND (name ILIKE '%medicine%' OR name_th LIKE '%แพทย%')
  LIMIT 1;

  IF f_id IS NOT NULL THEN
    INSERT INTO programs (faculty_id, name, name_th, degree_type, is_international)
    VALUES (f_id, 'Doctor of Medicine (International)', 'แพทยศาสตรบัณฑิต (นานาชาติ)', 'doctor', true)
    ON CONFLICT DO NOTHING;
  END IF;

  -- ── DENTISTRY ──
  SELECT id INTO f_id FROM faculties
  WHERE university_id = uni_id AND (name ILIKE '%dentistry%' OR name_th LIKE '%ทันต%')
  LIMIT 1;

  IF f_id IS NOT NULL THEN
    INSERT INTO programs (faculty_id, name, name_th, degree_type, is_international)
    VALUES (f_id, 'Doctor of Dental Surgery', 'ทันตแพทยศาสตรบัณฑิต', 'doctor', false)
    ON CONFLICT DO NOTHING;
  END IF;

  -- ── NURSING ──
  SELECT id INTO f_id FROM faculties
  WHERE university_id = uni_id AND (name ILIKE '%nursing%' OR name_th LIKE '%พยาบาล%')
  LIMIT 1;

  IF f_id IS NOT NULL THEN
    INSERT INTO programs (faculty_id, name, name_th, degree_type, is_international)
    VALUES (f_id, 'Nursing Science', 'พยาบาลศาสตร์', 'bachelor', false)
    ON CONFLICT DO NOTHING;
  END IF;

  -- ── AGRICULTURAL TECHNOLOGY ──
  SELECT id INTO f_id FROM faculties
  WHERE university_id = uni_id AND (name ILIKE '%agricultural%' OR name_th LIKE '%เกษตร%')
  LIMIT 1;

  IF f_id IS NOT NULL THEN
    INSERT INTO programs (faculty_id, name, name_th, degree_type, is_international)
    SELECT f_id, p.name, p.name_th, 'bachelor', false
    FROM (VALUES
      ('Agricultural Science and Technology', 'วิทยาศาสตร์และเทคโนโลยีการเกษตร'),
      ('Plant Production Technology', 'เทคโนโลยีการผลิตพืช'),
      ('Animal Production Technology', 'เทคโนโลยีการผลิตสัตว์'),
      ('Fisheries Science', 'ประมง'),
      ('Agricultural Economics', 'เศรษฐศาสตร์เกษตร'),
      ('Horticulture', 'พืชสวน'),
      ('Plant Protection', 'การอารักขาพืช')
    ) AS p(name, name_th)
    WHERE NOT EXISTS (
      SELECT 1 FROM programs WHERE faculty_id = f_id AND LOWER(name) = LOWER(p.name)
    );
  END IF;

  -- ── NANO TECHNOLOGY COLLEGE ──
  SELECT id INTO f_id FROM faculties
  WHERE university_id = uni_id AND name ILIKE '%nano%'
  LIMIT 1;

  IF f_id IS NOT NULL THEN
    INSERT INTO programs (faculty_id, name, name_th, degree_type, is_international)
    SELECT f_id, p.name, p.name_th, 'bachelor', false
    FROM (VALUES
      ('Nano Engineering', 'วิศวกรรมนาโน'),
      ('Nanoscience and Nanotechnology', 'วิทยาศาสตร์นาโนและนาโนเทคโนโลยี')
    ) AS p(name, name_th)
    WHERE NOT EXISTS (
      SELECT 1 FROM programs WHERE faculty_id = f_id AND LOWER(name) = LOWER(p.name)
    );
  END IF;

  -- ── AVIATION COLLEGE ──
  SELECT id INTO f_id FROM faculties
  WHERE university_id = uni_id AND name ILIKE '%aviation%'
  LIMIT 1;

  IF f_id IS NOT NULL THEN
    INSERT INTO programs (faculty_id, name, name_th, degree_type, is_international)
    SELECT f_id, p.name, p.name_th, 'bachelor', true
    FROM (VALUES
      ('Aviation Engineering and Commercial Pilot (International)', 'วิศวกรรมการบินและนักบินพาณิชย์ (นานาชาติ)'),
      ('Logistics Management (International)', 'การจัดการโลจิสติกส์ (นานาชาติ)')
    ) AS p(name, name_th)
    WHERE NOT EXISTS (
      SELECT 1 FROM programs WHERE faculty_id = f_id AND LOWER(name) = LOWER(p.name)
    );
  END IF;

  -- ── MANUFACTURING COLLEGE ──
  SELECT id INTO f_id FROM faculties
  WHERE university_id = uni_id AND name ILIKE '%manufacturing%'
  LIMIT 1;

  IF f_id IS NOT NULL THEN
    INSERT INTO programs (faculty_id, name, name_th, degree_type, is_international)
    VALUES (f_id, 'Smart Manufacturing Engineering', 'วิศวกรรมการผลิตอัจฉริยะ', 'bachelor', false)
    ON CONFLICT DO NOTHING;
  END IF;

  -- ── MUSICAL ENGINEERING COLLEGE ──
  SELECT id INTO f_id FROM faculties
  WHERE university_id = uni_id AND (name ILIKE '%musical%' OR name_th LIKE '%สังคีต%')
  LIMIT 1;

  IF f_id IS NOT NULL THEN
    INSERT INTO programs (faculty_id, name, name_th, degree_type, is_international)
    VALUES (f_id, 'Musical Engineering', 'วิศวกรรมสังคีต', 'bachelor', false)
    ON CONFLICT DO NOTHING;
  END IF;

  RAISE NOTICE 'Done! All KMITL programs restored.';
END $$;

-- Check results
SELECT
  f.name AS faculty_name,
  COUNT(p.id) AS program_count
FROM faculties f
LEFT JOIN programs p ON p.faculty_id = f.id
WHERE f.university_id = (
  SELECT id FROM universities
  WHERE name ILIKE '%kmitl%' OR name_th LIKE '%ลาดกระบัง%'
  LIMIT 1
)
GROUP BY f.name
ORDER BY f.name;
