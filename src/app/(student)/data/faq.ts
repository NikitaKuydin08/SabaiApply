export type FAQCategory = "account" | "universities" | "applying" | "documents" | "general";

export interface FAQEntry {
  id: string;
  category: FAQCategory;
  question_en: string;
  question_th: string;
  answer_en: string;
  answer_th: string;
}

export const faqCategories: { key: FAQCategory; label_en: string; label_th: string }[] = [
  { key: "account", label_en: "Account", label_th: "บัญชี" },
  { key: "universities", label_en: "Universities", label_th: "มหาวิทยาลัย" },
  { key: "applying", label_en: "Applying", label_th: "การสมัคร" },
  { key: "documents", label_en: "Documents", label_th: "เอกสาร" },
  { key: "general", label_en: "General", label_th: "ทั่วไป" },
];

export const faqEntries: FAQEntry[] = [
  // ── Account ──
  {
    id: "acc-1",
    category: "account",
    question_en: "How do I create an account?",
    question_th: "ฉันจะสร้างบัญชีได้อย่างไร?",
    answer_en: "Click 'Sign up' on the homepage. Enter your email address, create a password, and confirm your email through the link we send you.",
    answer_th: "คลิก 'สมัครสมาชิก' ที่หน้าแรก กรอกอีเมล สร้างรหัสผ่าน และยืนยันอีเมลผ่านลิงก์ที่เราส่งให้",
  },
  {
    id: "acc-2",
    category: "account",
    question_en: "I forgot my password. How do I reset it?",
    question_th: "ฉันลืมรหัสผ่าน จะรีเซ็ตได้อย่างไร?",
    answer_en: "On the login page, click 'Forgot password?' and enter your email. We'll send you a link to create a new password.",
    answer_th: "ที่หน้าเข้าสู่ระบบ คลิก 'ลืมรหัสผ่าน?' แล้วกรอกอีเมล เราจะส่งลิงก์เพื่อสร้างรหัสผ่านใหม่",
  },
  {
    id: "acc-3",
    category: "account",
    question_en: "Can I change my email address?",
    question_th: "ฉันสามารถเปลี่ยนอีเมลได้ไหม?",
    answer_en: "Yes. Go to Settings in the dashboard sidebar, click 'Change my email', enter your current password and new email. A confirmation link will be sent to your new email.",
    answer_th: "ได้ ไปที่ตั้งค่าในแถบด้านข้าง คลิก 'เปลี่ยนอีเมล' กรอกรหัสผ่านปัจจุบันและอีเมลใหม่ ลิงก์ยืนยันจะถูกส่งไปที่อีเมลใหม่",
  },
  {
    id: "acc-4",
    category: "account",
    question_en: "How do I delete my account?",
    question_th: "ฉันจะลบบัญชีได้อย่างไร?",
    answer_en: "Go to Settings, select 'Delete my account'. Read the warning carefully, check the confirmation box, enter your password, and click Continue. This action is permanent.",
    answer_th: "ไปที่ตั้งค่า เลือก 'ลบบัญชี' อ่านคำเตือน ทำเครื่องหมายยืนยัน กรอกรหัสผ่าน แล้วคลิกดำเนินการต่อ การกระทำนี้ไม่สามารถย้อนกลับได้",
  },

  // ── Universities ──
  {
    id: "uni-1",
    category: "universities",
    question_en: "How can I add a university to my list?",
    question_th: "ฉันจะเพิ่มมหาวิทยาลัยในรายการได้อย่างไร?",
    answer_en: "Click 'Choose University' in the sidebar. Search by name or browse the full list. Click the 'Add' button next to any university you're interested in.",
    answer_th: "คลิก 'เลือกมหาวิทยาลัย' ในแถบด้านข้าง ค้นหาด้วยชื่อหรือดูรายการทั้งหมด คลิกปุ่ม 'เพิ่ม' ที่มหาวิทยาลัยที่สนใจ",
  },
  {
    id: "uni-2",
    category: "universities",
    question_en: "How many universities can I apply to?",
    question_th: "ฉันสามารถสมัครได้กี่มหาวิทยาลัย?",
    answer_en: "You can add and apply to multiple universities. There is no limit on SabaiApply, but check each admission round's rules for any restrictions.",
    answer_th: "คุณสามารถเพิ่มและสมัครได้หลายมหาวิทยาลัย ไม่จำกัดจำนวนบน SabaiApply แต่ตรวจสอบกฎของแต่ละรอบการรับสมัคร",
  },
  {
    id: "uni-3",
    category: "universities",
    question_en: "Can I remove a university from my list?",
    question_th: "ฉันสามารถลบมหาวิทยาลัยออกจากรายการได้ไหม?",
    answer_en: "Yes. Go to the University Search page and click 'Remove' next to the university you want to remove. If you haven't submitted an application yet, it will be removed immediately.",
    answer_th: "ได้ ไปที่หน้าค้นหามหาวิทยาลัย คลิก 'ลบ' ที่มหาวิทยาลัยที่ต้องการลบ หากยังไม่ส่งใบสมัครจะถูกลบทันที",
  },
  {
    id: "uni-4",
    category: "universities",
    question_en: "What information is available for each university?",
    question_th: "มีข้อมูลอะไรบ้างสำหรับแต่ละมหาวิทยาลัย?",
    answer_en: "Each university page will show programs offered, admission requirements, tuition fees, deadlines, and application instructions. This information is being added progressively.",
    answer_th: "หน้ามหาวิทยาลัยจะแสดงหลักสูตร ข้อกำหนดการรับสมัคร ค่าเล่าเรียน กำหนดส่ง และคำแนะนำการสมัคร ข้อมูลกำลังถูกเพิ่มเข้ามาเรื่อยๆ",
  },

  // ── Applying ──
  {
    id: "app-1",
    category: "applying",
    question_en: "How does the application process work?",
    question_th: "กระบวนการสมัครทำงานอย่างไร?",
    answer_en: "First, complete your profile (personal info, education, test scores). Then choose your universities. Finally, submit your application to each university — your profile data is automatically filled in.",
    answer_th: "ขั้นแรก กรอกโปรไฟล์ (ข้อมูลส่วนตัว การศึกษา คะแนนสอบ) จากนั้นเลือกมหาวิทยาลัย สุดท้ายส่งใบสมัคร — ข้อมูลโปรไฟล์จะถูกกรอกให้อัตโนมัติ",
  },
  {
    id: "app-2",
    category: "applying",
    question_en: "Can I edit my application after submitting?",
    question_th: "ฉันสามารถแก้ไขใบสมัครหลังจากส่งได้ไหม?",
    answer_en: "You can edit your application until the program's deadline. After the deadline, your submission is locked and cannot be changed.",
    answer_th: "คุณสามารถแก้ไขใบสมัครได้จนถึงกำหนดเส้นตาย หลังจากนั้นการเปลี่ยนแปลงจะถูกล็อค",
  },
  {
    id: "app-3",
    category: "applying",
    question_en: "How do I track my application status?",
    question_th: "ฉันจะติดตามสถานะใบสมัครได้อย่างไร?",
    answer_en: "Your dashboard shows all submitted applications with their current status: submitted, under review, shortlisted, accepted, or rejected. You'll also receive email notifications for status changes.",
    answer_th: "แดชบอร์ดแสดงใบสมัครทั้งหมดพร้อมสถานะปัจจุบัน: ส่งแล้ว กำลังพิจารณา ผ่านคัดเลือก ตอบรับ หรือไม่ผ่าน คุณจะได้รับอีเมลแจ้งเตือนเมื่อสถานะเปลี่ยน",
  },
  {
    id: "app-4",
    category: "applying",
    question_en: "What are the admission rounds?",
    question_th: "รอบการรับสมัครมีอะไรบ้าง?",
    answer_en: "Thai universities typically have Round 1 (Portfolio), Round 2 (Quota), and Round 4 (Direct Admission). Each round has different requirements and deadlines. Check each program for details.",
    answer_th: "มหาวิทยาลัยไทยมักมีรอบ 1 (พอร์ตฟอลิโอ) รอบ 2 (โควตา) และรอบ 4 (รับตรง) แต่ละรอบมีข้อกำหนดและกำหนดส่งต่างกัน ตรวจสอบรายละเอียดแต่ละหลักสูตร",
  },

  // ── Documents ──
  {
    id: "doc-1",
    category: "documents",
    question_en: "What documents do I need to apply?",
    question_th: "ฉันต้องใช้เอกสารอะไรบ้างในการสมัคร?",
    answer_en: "Most programs require: transcript, ID copy, test scores (GAT/PAT, TGAT/TPAT, or O-NET), and a portfolio. Some programs may require additional documents — check each program's requirements.",
    answer_th: "หลักสูตรส่วนใหญ่ต้องการ: สำเนาผลการเรียน สำเนาบัตรประชาชน คะแนนสอบ (GAT/PAT, TGAT/TPAT หรือ O-NET) และพอร์ตฟอลิโอ บางหลักสูตรอาจต้องการเอกสารเพิ่มเติม",
  },
  {
    id: "doc-2",
    category: "documents",
    question_en: "What file formats are accepted?",
    question_th: "รองรับไฟล์รูปแบบใดบ้าง?",
    answer_en: "We accept PDF, JPG, and PNG files. Maximum file size is 10MB per document. We recommend PDF for transcripts and certificates.",
    answer_th: "เรารองรับไฟล์ PDF, JPG และ PNG ขนาดไฟล์สูงสุด 10MB ต่อเอกสาร แนะนำ PDF สำหรับผลการเรียนและประกาศนียบัตร",
  },
  {
    id: "doc-3",
    category: "documents",
    question_en: "Can I update my documents after uploading?",
    question_th: "ฉันสามารถอัปเดตเอกสารหลังจากอัปโหลดได้ไหม?",
    answer_en: "Yes, you can replace any uploaded document at any time from your profile. If you've already submitted an application, the updated document will be used for future submissions.",
    answer_th: "ได้ คุณสามารถเปลี่ยนเอกสารที่อัปโหลดได้ตลอดเวลาจากโปรไฟล์ หากส่งใบสมัครไปแล้ว เอกสารที่อัปเดตจะถูกใช้สำหรับการส่งครั้งต่อไป",
  },

  // ── General ──
  {
    id: "gen-1",
    category: "general",
    question_en: "Is SabaiApply free to use?",
    question_th: "SabaiApply ใช้ฟรีไหม?",
    answer_en: "Yes, SabaiApply is completely free for students. We believe every student should have equal access to university applications.",
    answer_th: "ใช่ SabaiApply ใช้ฟรีสำหรับนักศึกษา เราเชื่อว่านักศึกษาทุกคนควรมีสิทธิ์เข้าถึงการสมัครมหาวิทยาลัยอย่างเท่าเทียม",
  },
  {
    id: "gen-2",
    category: "general",
    question_en: "What languages does SabaiApply support?",
    question_th: "SabaiApply รองรับภาษาอะไรบ้าง?",
    answer_en: "SabaiApply is available in English and Thai. You can switch languages at any time using the EN/TH toggle on any page.",
    answer_th: "SabaiApply รองรับภาษาอังกฤษและไทย คุณสามารถเปลี่ยนภาษาได้ตลอดเวลาโดยใช้ปุ่ม EN/TH บนทุกหน้า",
  },
  {
    id: "gen-3",
    category: "general",
    question_en: "How do I contact support?",
    question_th: "ฉันจะติดต่อฝ่ายสนับสนุนได้อย่างไร?",
    answer_en: "Use the 24/7 Support Chat button at the bottom of the help panel, or email us at support@sabaiapply.com. We typically respond within 24 hours.",
    answer_th: "ใช้ปุ่มแชทสนับสนุน 24/7 ที่ด้านล่างของแผงช่วยเหลือ หรืออีเมลเราที่ support@sabaiapply.com เราตอบกลับภายใน 24 ชั่วโมง",
  },
  {
    id: "gen-4",
    category: "general",
    question_en: "Is my data safe?",
    question_th: "ข้อมูลของฉันปลอดภัยไหม?",
    answer_en: "Yes. Your data is stored securely and encrypted. We never share your personal information with third parties without your consent. Only the universities you apply to can see your application data.",
    answer_th: "ใช่ ข้อมูลของคุณถูกจัดเก็บอย่างปลอดภัยและเข้ารหัส เราไม่เปิดเผยข้อมูลส่วนตัวให้บุคคลที่สามโดยไม่ได้รับความยินยอม เฉพาะมหาวิทยาลัยที่คุณสมัครเท่านั้นที่เห็นข้อมูลใบสมัคร",
  },
];

export function searchFAQ(query: string, locale: "en" | "th"): FAQEntry[] {
  if (!query.trim()) return faqEntries;

  const q = query.toLowerCase().trim();
  return faqEntries.filter((entry) => {
    const question = locale === "th" ? entry.question_th : entry.question_en;
    const answer = locale === "th" ? entry.answer_th : entry.answer_en;
    return question.toLowerCase().includes(q) || answer.toLowerCase().includes(q);
  });
}
