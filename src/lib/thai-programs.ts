// Standard programs for major Thai university faculties
// Used to auto-populate when faculties are set up

export interface ProgramPreset {
  name: string;
  name_th: string;
  degree_type?: string;
  is_international?: boolean;
}

// Match by faculty name keyword (case-insensitive) within a university context
export const programPresets: Record<string, ProgramPreset[]> = {
  "kmitl_engineering": [
    { name: "Computer Engineering", name_th: "วิศวกรรมคอมพิวเตอร์" },
    { name: "Software Engineering", name_th: "วิศวกรรมซอฟต์แวร์" },
    { name: "Electrical Engineering", name_th: "วิศวกรรมไฟฟ้า" },
    { name: "Electronics Engineering", name_th: "วิศวกรรมอิเล็กทรอนิกส์" },
    { name: "Telecommunications Engineering", name_th: "วิศวกรรมโทรคมนาคม" },
    { name: "Mechanical Engineering", name_th: "วิศวกรรมเครื่องกล" },
    { name: "Civil Engineering", name_th: "วิศวกรรมโยธา" },
    { name: "Chemical Engineering", name_th: "วิศวกรรมเคมี" },
    { name: "Industrial Engineering", name_th: "วิศวกรรมอุตสาหการ" },
    { name: "Biomedical Engineering", name_th: "วิศวกรรมชีวการแพทย์" },
    { name: "Robotics and AI Engineering", name_th: "วิศวกรรมหุ่นยนต์และปัญญาประดิษฐ์" },
    { name: "Energy Engineering", name_th: "วิศวกรรมพลังงาน" },
    { name: "Financial Engineering", name_th: "วิศวกรรมการเงิน" },
    { name: "Food Engineering", name_th: "วิศวกรรมอาหาร" },
    { name: "Railway Transport Engineering", name_th: "วิศวกรรมระบบรางและการขนส่ง" },
    { name: "Control Engineering", name_th: "วิศวกรรมควบคุม" },
    { name: "Mechatronics Engineering", name_th: "วิศวกรรมเมคคาทรอนิกส์" },
    { name: "Smart Agricultural Engineering", name_th: "วิศวกรรมเกษตรอัจฉริยะ" },
    { name: "Electric Vehicle Engineering", name_th: "วิศวกรรมยานยนต์ไฟฟ้า" },
    { name: "AI Engineering", name_th: "วิศวกรรมปัญญาประดิษฐ์" },
    { name: "Engineering Management", name_th: "การจัดการวิศวกรรม" },
  ],
  "kmitl_architecture": [
    { name: "Architecture", name_th: "สถาปัตยกรรม" },
    { name: "Architecture (International)", name_th: "สถาปัตยกรรม (นานาชาติ)", is_international: true },
    { name: "Interior Architecture", name_th: "สถาปัตยกรรมภายใน" },
    { name: "Industrial Design", name_th: "การออกแบบอุตสาหกรรม" },
    { name: "Communication Design", name_th: "การออกแบบนิเทศศิลป์" },
    { name: "Film and Digital Media", name_th: "ภาพยนตร์และสื่อดิจิทัล" },
    { name: "Fine Arts", name_th: "ศิลปกรรม" },
    { name: "Photography", name_th: "การถ่ายภาพ" },
    { name: "Urban Design", name_th: "ผังเมือง" },
    { name: "Landscape Architecture", name_th: "ภูมิสถาปัตยกรรม" },
  ],
  "kmitl_science": [
    { name: "Mathematics", name_th: "คณิตศาสตร์" },
    { name: "Statistics", name_th: "สถิติ" },
    { name: "Applied Mathematics", name_th: "คณิตศาสตร์ประยุกต์" },
    { name: "Physics", name_th: "ฟิสิกส์" },
    { name: "Applied Physics", name_th: "ฟิสิกส์ประยุกต์" },
    { name: "Chemistry", name_th: "เคมี" },
    { name: "Applied Chemistry", name_th: "เคมีประยุกต์" },
    { name: "Biology", name_th: "ชีววิทยา" },
    { name: "Microbiology", name_th: "จุลชีววิทยา" },
    { name: "Environmental Science", name_th: "วิทยาศาสตร์สิ่งแวดล้อม" },
    { name: "Digital Technology and Integrated Innovation", name_th: "เทคโนโลยีดิจิทัลและนวัตกรรม" },
    { name: "Applied Microbiology (International)", name_th: "จุลชีววิทยาประยุกต์ (นานาชาติ)", is_international: true },
  ],
  "kmitl_it": [
    { name: "Information Technology", name_th: "เทคโนโลยีสารสนเทศ" },
    { name: "Data Science and Business Analytics", name_th: "วิทยาการข้อมูลและการวิเคราะห์ทางธุรกิจ" },
    { name: "Business IT (International)", name_th: "เทคโนโลยีสารสนเทศทางธุรกิจ (นานาชาติ)", is_international: true },
  ],
  "kmitl_food": [
    { name: "Food Science and Technology", name_th: "วิทยาศาสตร์และเทคโนโลยีการอาหาร" },
    { name: "Food Industrial Innovation", name_th: "นวัตกรรมอุตสาหกรรมอาหาร" },
    { name: "Food Service Industry Management", name_th: "การจัดการอุตสาหกรรมบริการอาหาร" },
    { name: "Food Service Science (International)", name_th: "วิทยาศาสตร์การบริการอาหาร (นานาชาติ)", is_international: true },
  ],
  "kmitl_business": [
    { name: "Innovation and Technology Marketing", name_th: "นวัตกรรมและการตลาดเทคโนโลยี", is_international: true },
    { name: "Global Business and Financial Management", name_th: "ธุรกิจระดับโลกและการจัดการการเงิน", is_international: true },
    { name: "Digital Logistics and Supply Chain Management", name_th: "โลจิสติกส์ดิจิทัลและการจัดการห่วงโซ่อุปทาน", is_international: true },
    { name: "Business Administration", name_th: "บริหารธุรกิจ" },
    { name: "Accounting", name_th: "การบัญชี" },
    { name: "Entrepreneurship (International)", name_th: "การเป็นผู้ประกอบการ (นานาชาติ)", is_international: true },
  ],
  "kmitl_liberal_arts": [
    { name: "English for Business Communication", name_th: "ภาษาอังกฤษเพื่อการสื่อสารธุรกิจ" },
    { name: "Japanese for Industrial Communication", name_th: "ภาษาญี่ปุ่นเพื่อการสื่อสารอุตสาหกรรม" },
    { name: "Chinese for Industrial Communication", name_th: "ภาษาจีนเพื่อการสื่อสารอุตสาหกรรม" },
    { name: "Innovative Industrial Psychology and Human Resource Management", name_th: "จิตวิทยานวัตกรรมอุตสาหกรรมและการจัดการทรัพยากรมนุษย์" },
    { name: "Industrial and Organizational Psychology", name_th: "จิตวิทยาอุตสาหกรรมและองค์การ" },
  ],
  "kmitl_medicine": [
    { name: "Doctor of Medicine (International)", name_th: "แพทยศาสตรบัณฑิต (นานาชาติ)", is_international: true },
  ],
  "kmitl_dentistry": [
    { name: "Doctor of Dental Surgery", name_th: "ทันตแพทยศาสตรบัณฑิต" },
  ],
  "kmitl_nursing": [
    { name: "Nursing Science", name_th: "พยาบาลศาสตร์" },
  ],
  "kmitl_agricultural": [
    { name: "Agricultural Science and Technology", name_th: "วิทยาศาสตร์และเทคโนโลยีการเกษตร" },
    { name: "Plant Production Technology", name_th: "เทคโนโลยีการผลิตพืช" },
    { name: "Animal Production Technology", name_th: "เทคโนโลยีการผลิตสัตว์" },
    { name: "Fisheries Science", name_th: "ประมง" },
    { name: "Agricultural Economics", name_th: "เศรษฐศาสตร์เกษตร" },
    { name: "Horticulture", name_th: "พืชสวน" },
    { name: "Plant Protection", name_th: "การอารักขาพืช" },
  ],
  "kmitl_industrial_education": [
    { name: "Electrical Engineering Education", name_th: "ครุศาสตร์วิศวกรรมไฟฟ้า" },
    { name: "Mechanical Engineering Education", name_th: "ครุศาสตร์วิศวกรรมเครื่องกล" },
    { name: "Civil Engineering Education", name_th: "ครุศาสตร์วิศวกรรมโยธา" },
    { name: "Industrial Engineering Education", name_th: "ครุศาสตร์วิศวกรรมอุตสาหการ" },
    { name: "Electronics and Telecommunications Education", name_th: "ครุศาสตร์อิเล็กทรอนิกส์และโทรคมนาคม" },
    { name: "Architecture Education", name_th: "ครุศาสตร์สถาปัตยกรรม" },
    { name: "Industrial Arts Education", name_th: "ครุศาสตร์ศิลปอุตสาหกรรม" },
  ],
  "kmitl_nano": [
    { name: "Nano Engineering", name_th: "วิศวกรรมนาโน" },
    { name: "Nanoscience and Nanotechnology", name_th: "วิทยาศาสตร์นาโนและนาโนเทคโนโลยี" },
  ],
  "kmitl_aviation": [
    { name: "Aviation Engineering and Commercial Pilot (International)", name_th: "วิศวกรรมการบินและนักบินพาณิชย์ (นานาชาติ)", is_international: true },
    { name: "Logistics Management (International)", name_th: "การจัดการโลจิสติกส์ (นานาชาติ)", is_international: true },
  ],
  "kmitl_manufacturing": [
    { name: "Smart Manufacturing Engineering", name_th: "วิศวกรรมการผลิตอัจฉริยะ" },
  ],
  "kmitl_musical": [
    { name: "Musical Engineering", name_th: "วิศวกรรมสังคีต" },
  ],
};

// Match faculty to its preset key based on name keywords
export function getProgramPreset(facultyName: string, universityName?: string): ProgramPreset[] | null {
  const fLower = facultyName.toLowerCase();
  const uLower = (universityName ?? "").toLowerCase();

  // Only apply KMITL presets if this is KMITL
  const isKmitl = uLower.includes("kmitl") || uLower.includes("ladkrabang") || uLower.includes("ลาดกระบัง");
  if (!isKmitl) return null;

  if (fLower.includes("engineering") && !fLower.includes("industrial education")) return programPresets.kmitl_engineering;
  if (fLower.includes("architecture") || fLower.includes("art") || fLower.includes("design")) return programPresets.kmitl_architecture;
  if (fLower.includes("industrial education") || fLower.includes("ครุศาสตร์")) return programPresets.kmitl_industrial_education;
  if (fLower.includes("science") && !fLower.includes("food")) return programPresets.kmitl_science;
  if (fLower.includes("information technology") || fLower.includes("เทคโนโลยีสารสนเทศ")) return programPresets.kmitl_it;
  if (fLower.includes("food")) return programPresets.kmitl_food;
  if (fLower.includes("business")) return programPresets.kmitl_business;
  if (fLower.includes("liberal arts") || fLower.includes("ศิลปศาสตร์")) return programPresets.kmitl_liberal_arts;
  if (fLower.includes("medicine") || fLower.includes("แพทย")) return programPresets.kmitl_medicine;
  if (fLower.includes("dentistry") || fLower.includes("ทันต")) return programPresets.kmitl_dentistry;
  if (fLower.includes("nursing") || fLower.includes("พยาบาล")) return programPresets.kmitl_nursing;
  if (fLower.includes("agricultural") || fLower.includes("เกษตร")) return programPresets.kmitl_agricultural;
  if (fLower.includes("nano")) return programPresets.kmitl_nano;
  if (fLower.includes("aviation")) return programPresets.kmitl_aviation;
  if (fLower.includes("manufacturing")) return programPresets.kmitl_manufacturing;
  if (fLower.includes("musical") || fLower.includes("สังคีต")) return programPresets.kmitl_musical;

  return null;
}
