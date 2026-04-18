// Standard faculties for major Thai universities
// Used to auto-populate when a university is created or restored

export interface FacultyPreset {
  name: string;
  name_th: string;
}

// Match by university name keyword (case-insensitive)
export const facultyPresets: Record<string, FacultyPreset[]> = {
  "kmitl": [
    { name: "Faculty of Engineering", name_th: "คณะวิศวกรรมศาสตร์" },
    { name: "Faculty of Architecture, Art and Design", name_th: "คณะสถาปัตยกรรมศาสตร์ ศิลปะและการออกแบบ" },
    { name: "Faculty of Industrial Education and Technology", name_th: "คณะครุศาสตร์อุตสาหกรรมและเทคโนโลยี" },
    { name: "Faculty of Science", name_th: "คณะวิทยาศาสตร์" },
    { name: "Faculty of Information Technology", name_th: "คณะเทคโนโลยีสารสนเทศ" },
    { name: "Faculty of Food Industry", name_th: "คณะอุตสาหกรรมอาหาร" },
    { name: "Faculty of Business Administration", name_th: "คณะบริหารธุรกิจ" },
    { name: "Faculty of Liberal Arts", name_th: "คณะศิลปศาสตร์" },
    { name: "Faculty of Medicine", name_th: "คณะแพทยศาสตร์" },
    { name: "Faculty of Dentistry", name_th: "คณะทันตแพทยศาสตร์" },
    { name: "Faculty of Nursing", name_th: "คณะพยาบาลศาสตร์" },
    { name: "Faculty of Agricultural Technology", name_th: "คณะเทคโนโลยีการเกษตร" },
    { name: "Nano Technology College", name_th: "วิทยาลัยนาโนเทคโนโลยี" },
    { name: "Advanced Manufacturing Innovation College", name_th: "วิทยาลัยนวัตกรรมการผลิตขั้นสูง" },
    { name: "International Aviation Industry College", name_th: "วิทยาลัยอุตสาหกรรมการบินนานาชาติ" },
    { name: "Musical Engineering College", name_th: "วิทยาลัยวิศวกรรมสังคีต" },
    { name: "KOSEN-KMITL Institute", name_th: "สถาบันโคเซน-สจล." },
  ],
  "chulalongkorn": [
    { name: "Faculty of Engineering", name_th: "คณะวิศวกรรมศาสตร์" },
    { name: "Faculty of Science", name_th: "คณะวิทยาศาสตร์" },
    { name: "Faculty of Medicine", name_th: "คณะแพทยศาสตร์" },
    { name: "Faculty of Arts", name_th: "คณะอักษรศาสตร์" },
    { name: "Faculty of Commerce and Accountancy", name_th: "คณะพาณิชยศาสตร์และการบัญชี" },
    { name: "Faculty of Architecture", name_th: "คณะสถาปัตยกรรมศาสตร์" },
    { name: "Faculty of Law", name_th: "คณะนิติศาสตร์" },
    { name: "Faculty of Education", name_th: "คณะครุศาสตร์" },
    { name: "Faculty of Communication Arts", name_th: "คณะนิเทศศาสตร์" },
    { name: "Faculty of Pharmaceutical Sciences", name_th: "คณะเภสัชศาสตร์" },
    { name: "Faculty of Dentistry", name_th: "คณะทันตแพทยศาสตร์" },
    { name: "Faculty of Veterinary Science", name_th: "คณะสัตวแพทยศาสตร์" },
    { name: "Faculty of Allied Health Sciences", name_th: "คณะสหเวชศาสตร์" },
    { name: "Faculty of Nursing", name_th: "คณะพยาบาลศาสตร์" },
    { name: "Faculty of Sports Science", name_th: "คณะวิทยาศาสตร์การกีฬา" },
    { name: "Faculty of Economics", name_th: "คณะเศรษฐศาสตร์" },
    { name: "Faculty of Political Science", name_th: "คณะรัฐศาสตร์" },
    { name: "Faculty of Fine and Applied Arts", name_th: "คณะศิลปกรรมศาสตร์" },
  ],
  "mahidol": [
    { name: "Faculty of Medicine Siriraj Hospital", name_th: "คณะแพทยศาสตร์ศิริราชพยาบาล" },
    { name: "Faculty of Medicine Ramathibodi Hospital", name_th: "คณะแพทยศาสตร์โรงพยาบาลรามาธิบดี" },
    { name: "Faculty of Science", name_th: "คณะวิทยาศาสตร์" },
    { name: "Faculty of Engineering", name_th: "คณะวิศวกรรมศาสตร์" },
    { name: "Faculty of Public Health", name_th: "คณะสาธารณสุขศาสตร์" },
    { name: "Faculty of Pharmacy", name_th: "คณะเภสัชศาสตร์" },
    { name: "Faculty of Nursing", name_th: "คณะพยาบาลศาสตร์" },
    { name: "Faculty of Dentistry", name_th: "คณะทันตแพทยศาสตร์" },
    { name: "Faculty of Tropical Medicine", name_th: "คณะเวชศาสตร์เขตร้อน" },
    { name: "Faculty of Veterinary Science", name_th: "คณะสัตวแพทยศาสตร์" },
    { name: "Faculty of Liberal Arts", name_th: "คณะศิลปศาสตร์" },
    { name: "Faculty of ICT", name_th: "คณะเทคโนโลยีสารสนเทศและการสื่อสาร" },
    { name: "Mahidol University International College", name_th: "วิทยาลัยนานาชาติ" },
  ],
  "thammasat": [
    { name: "Faculty of Law", name_th: "คณะนิติศาสตร์" },
    { name: "Faculty of Commerce and Accountancy", name_th: "คณะพาณิชยศาสตร์และการบัญชี" },
    { name: "Faculty of Political Science", name_th: "คณะรัฐศาสตร์" },
    { name: "Faculty of Economics", name_th: "คณะเศรษฐศาสตร์" },
    { name: "Faculty of Sociology and Anthropology", name_th: "คณะสังคมวิทยาและมานุษยวิทยา" },
    { name: "Faculty of Liberal Arts", name_th: "คณะศิลปศาสตร์" },
    { name: "Faculty of Journalism and Mass Communication", name_th: "คณะวารสารศาสตร์และสื่อสารมวลชน" },
    { name: "Faculty of Science and Technology", name_th: "คณะวิทยาศาสตร์และเทคโนโลยี" },
    { name: "Faculty of Engineering", name_th: "คณะวิศวกรรมศาสตร์" },
    { name: "Faculty of Medicine", name_th: "คณะแพทยศาสตร์" },
    { name: "Faculty of Dentistry", name_th: "คณะทันตแพทยศาสตร์" },
    { name: "Faculty of Nursing", name_th: "คณะพยาบาลศาสตร์" },
    { name: "Faculty of Public Health", name_th: "คณะสาธารณสุขศาสตร์" },
    { name: "Faculty of Architecture and Planning", name_th: "คณะสถาปัตยกรรมศาสตร์และการผังเมือง" },
  ],
  "kasetsart": [
    { name: "Faculty of Agriculture", name_th: "คณะเกษตร" },
    { name: "Faculty of Engineering", name_th: "คณะวิศวกรรมศาสตร์" },
    { name: "Faculty of Science", name_th: "คณะวิทยาศาสตร์" },
    { name: "Faculty of Forestry", name_th: "คณะวนศาสตร์" },
    { name: "Faculty of Fisheries", name_th: "คณะประมง" },
    { name: "Faculty of Veterinary Medicine", name_th: "คณะสัตวแพทยศาสตร์" },
    { name: "Faculty of Economics", name_th: "คณะเศรษฐศาสตร์" },
    { name: "Faculty of Education", name_th: "คณะศึกษาศาสตร์" },
    { name: "Faculty of Humanities", name_th: "คณะมนุษยศาสตร์" },
    { name: "Faculty of Social Sciences", name_th: "คณะสังคมศาสตร์" },
    { name: "Faculty of Business Administration", name_th: "คณะบริหารธุรกิจ" },
    { name: "Faculty of Architecture", name_th: "คณะสถาปัตยกรรมศาสตร์" },
  ],
};

// Get preset faculties by matching university name keywords
export function getFacultyPreset(universityName: string): FacultyPreset[] | null {
  const lower = universityName.toLowerCase();

  if (lower.includes("kmitl") || lower.includes("ladkrabang") || lower.includes("ลาดกระบัง")) {
    return facultyPresets.kmitl;
  }
  if (lower.includes("chulalongkorn") || lower.includes("จุฬาลงกรณ์")) {
    return facultyPresets.chulalongkorn;
  }
  if (lower.includes("mahidol") || lower.includes("มหิดล")) {
    return facultyPresets.mahidol;
  }
  if (lower.includes("thammasat") || lower.includes("ธรรมศาสตร์")) {
    return facultyPresets.thammasat;
  }
  if (lower.includes("kasetsart") || lower.includes("เกษตรศาสตร์")) {
    return facultyPresets.kasetsart;
  }

  return null;
}
