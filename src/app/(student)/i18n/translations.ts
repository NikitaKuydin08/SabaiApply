// Student-side i18n translations
// Isolated from uni-side — no shared keys

export type Locale = "en" | "th";

const translations = {
  // ── Login ──
  "login.title": { en: "Welcome back", th: "ยินดีต้อนรับกลับ" },
  "login.subtitle": { en: "Log in to your student account", th: "เข้าสู่ระบบบัญชีนักศึกษา" },
  "login.email": { en: "Email Address", th: "อีเมล" },
  "login.password": { en: "Password", th: "รหัสผ่าน" },
  "login.submit": { en: "Log in", th: "เข้าสู่ระบบ" },
  "login.submitting": { en: "Logging in...", th: "กำลังเข้าสู่ระบบ..." },
  "login.noAccount": { en: "Don't have an account?", th: "ยังไม่มีบัญชี?" },
  "login.signUpLink": { en: "Sign up", th: "สมัครสมาชิก" },
  "login.emailPlaceholder": { en: "you@example.com", th: "you@example.com" },
  "login.passwordPlaceholder": { en: "Your password", th: "รหัสผ่านของคุณ" },

  // ── Signup ──
  "signup.title": { en: "Create your account", th: "สร้างบัญชีของคุณ" },
  "signup.subtitle": { en: "Start your university application journey", th: "เริ่มต้นเส้นทางการสมัครมหาวิทยาลัย" },
  "signup.email": { en: "Email Address", th: "อีเมล" },
  "signup.confirmEmail": { en: "Re-type Email Address", th: "พิมพ์อีเมลอีกครั้ง" },
  "signup.password": { en: "Password", th: "รหัสผ่าน" },
  "signup.confirmPassword": { en: "Re-type Password", th: "พิมพ์รหัสผ่านอีกครั้ง" },
  "signup.submit": { en: "Sign up", th: "สมัครสมาชิก" },
  "signup.submitting": { en: "Creating account...", th: "กำลังสร้างบัญชี..." },
  "signup.hasAccount": { en: "Already have an account?", th: "มีบัญชีอยู่แล้ว?" },
  "signup.loginLink": { en: "Log in", th: "เข้าสู่ระบบ" },
  "signup.emailsMustMatch": { en: "Emails must match", th: "อีเมลต้องตรงกัน" },
  "signup.passwordsMustMatch": { en: "Passwords must match", th: "รหัสผ่านต้องตรงกัน" },
  "signup.emailPlaceholder": { en: "you@example.com", th: "you@example.com" },
  "signup.retypePlaceholder": { en: "Re-type your email", th: "พิมพ์อีเมลอีกครั้ง" },
  "signup.errorEmailsNoMatch": { en: "Emails do not match.", th: "อีเมลไม่ตรงกัน" },
  "signup.errorPasswordNotMet": { en: "Password does not meet all requirements.", th: "รหัสผ่านไม่ตรงตามข้อกำหนด" },
  "signup.errorPasswordsNoMatch": { en: "Passwords do not match.", th: "รหัสผ่านไม่ตรงกัน" },

  // ── Password Rules ──
  "pw.length": { en: "10-32 characters", th: "10-32 ตัวอักษร" },
  "pw.uppercase": { en: "At least one upper case", th: "ตัวพิมพ์ใหญ่อย่างน้อย 1 ตัว" },
  "pw.lowercase": { en: "At least one lower case", th: "ตัวพิมพ์เล็กอย่างน้อย 1 ตัว" },
  "pw.number": { en: "At least one number", th: "ตัวเลขอย่างน้อย 1 ตัว" },
  "pw.special": { en: "At least one special character", th: "อักขระพิเศษอย่างน้อย 1 ตัว" },
  "pw.noSpaces": { en: "No space characters", th: "ห้ามมีช่องว่าง" },

  // ── Dashboard ──
  "dash.title": { en: "Dashboard", th: "แดชบอร์ด" },
  "dash.goodMorning": { en: "Good morning", th: "สวัสดีตอนเช้า" },
  "dash.goodAfternoon": { en: "Good afternoon", th: "สวัสดีตอนบ่าย" },
  "dash.goodEvening": { en: "Good evening", th: "สวัสดีตอนเย็น" },
  "dash.goodNight": { en: "Good night", th: "ราตรีสวัสดิ์" },

  // ── Sidebar ──
  "nav.dashboard": { en: "Dashboard", th: "แดชบอร์ด" },
  "nav.explore": { en: "Explore", th: "สำรวจ" },
  "nav.chooseUni": { en: "Choose University", th: "เลือกมหาวิทยาลัย" },
  "nav.apply": { en: "Apply", th: "สมัคร" },
  "nav.myApplication": { en: "My Application Form", th: "แบบฟอร์มสมัครของฉัน" },
  "nav.myUniversities": { en: "My Universities", th: "มหาวิทยาลัยของฉัน" },
  "nav.settings": { en: "Settings", th: "ตั้งค่า" },
  "nav.signOut": { en: "Sign out", th: "ออกจากระบบ" },
  "nav.back": { en: "Back", th: "กลับ" },
  "nav.overview": { en: "Overview", th: "ภาพรวม" },
  "nav.addUni": { en: "Add a university", th: "เพิ่มมหาวิทยาลัย" },

  // ── My Application ──
  "app.title": { en: "My Application", th: "ใบสมัครของฉัน" },
  "app.progress": { en: "Overall progress", th: "ความคืบหน้าโดยรวม" },
  "app.personal": { en: "Personal Information", th: "ข้อมูลส่วนตัว" },
  "app.family": { en: "Family", th: "ครอบครัว" },
  "app.education": { en: "Education", th: "การศึกษา" },
  "app.testScores": { en: "Test Scores", th: "คะแนนสอบ" },
  "app.documents": { en: "Documents", th: "เอกสาร" },

  // ── My Universities ──
  "uni.title": { en: "My Universities", th: "มหาวิทยาลัยของฉัน" },
  "uni.empty": { en: "Nothing here yet! Add some universities to your list to get started.", th: "ยังไม่มีรายการ! เพิ่มมหาวิทยาลัยเพื่อเริ่มต้น" },
  "uni.searchBtn": { en: "Search universities", th: "ค้นหามหาวิทยาลัย" },
  "uni.addMore": { en: "Add more", th: "เพิ่มอีก" },
  "uni.viewAll": { en: "View all", th: "ดูทั้งหมด" },
  "uni.more": { en: "more", th: "เพิ่มเติม" },
  "uni.onList": { en: "on your list", th: "ในรายการของคุณ" },
  "uni.one": { en: "university", th: "มหาวิทยาลัย" },
  "uni.many": { en: "universities", th: "มหาวิทยาลัย" },
  "uni.notStarted": { en: "Not started", th: "ยังไม่เริ่ม" },
  "uni.inProgress": { en: "In progress", th: "กำลังดำเนินการ" },
  "uni.submitted": { en: "Submitted", th: "ส่งแล้ว" },
  "uni.yourUnis": { en: "Your Universities", th: "มหาวิทยาลัยของคุณ" },
  "uni.noUnis": { en: "You haven't added any universities yet.", th: "คุณยังไม่ได้เพิ่มมหาวิทยาลัย" },
  "uni.addMoreBtn": { en: "Add more universities", th: "เพิ่มมหาวิทยาลัยอีก" },

  // ── University Search ──
  "search.title": { en: "University Search", th: "ค้นหามหาวิทยาลัย" },
  "search.label": { en: "University or City Name", th: "ชื่อมหาวิทยาลัยหรือเมือง" },
  "search.placeholder": { en: "Search by name or city...", th: "ค้นหาด้วยชื่อหรือเมือง..." },
  "search.result": { en: "result", th: "ผลลัพธ์" },
  "search.results": { en: "results", th: "ผลลัพธ์" },
  "search.sortBy": { en: "Sort by: Name", th: "เรียงตาม: ชื่อ" },
  "search.add": { en: "Add", th: "เพิ่ม" },
  "search.remove": { en: "Remove", th: "ลบ" },
  "search.noResults": { en: "No universities found matching your search.", th: "ไม่พบมหาวิทยาลัยที่ตรงกับการค้นหา" },
  "search.moreFilters": { en: "More filters", th: "ตัวกรองเพิ่มเติม" },
  "search.filtersTitle": { en: "Filters", th: "ตัวกรอง" },
  "search.city": { en: "City", th: "เมือง" },
  "search.cityPlaceholder": { en: "e.g. Bangkok, Chiang Mai", th: "เช่น กรุงเทพฯ, เชียงใหม่" },
  "search.distance": { en: "Distance from zip code", th: "ระยะทางจากรหัสไปรษณีย์" },
  "search.distancePlaceholder": { en: "e.g. 10100", th: "เช่น 10100" },
  "search.clearFilters": { en: "Clear filters", th: "ล้างตัวกรอง" },
  "search.show": { en: "Show", th: "แสดง" },

  // ── Help & Support ──
  "help.title": { en: "Help & support", th: "ช่วยเหลือและสนับสนุน" },
  "help.searchPlaceholder": { en: "Search FAQs", th: "ค้นหาคำถามที่พบบ่อย" },
  "help.searchHint": { en: "Search takes you to the student solution center", th: "ค้นหาจะพาคุณไปยังศูนย์ช่วยเหลือนักศึกษา" },
  "help.chat": { en: "24/7 Support Chat", th: "แชทสนับสนุน 24/7" },
  "help.readMore": { en: "Read full answer", th: "อ่านคำตอบเต็ม" },
  "help.showLess": { en: "Show less", th: "แสดงน้อยลง" },
  "help.faq1q": { en: "How can I add a university to my list?", th: "ฉันจะเพิ่มมหาวิทยาลัยในรายการได้อย่างไร?" },
  "help.faq1a": { en: "Select Choose University from the sidebar and browse available programs. Click the + button on any university you're interested in.", th: "เลือก \"เลือกมหาวิทยาลัย\" จากแถบด้านข้าง แล้วกดปุ่ม + ที่มหาวิทยาลัยที่คุณสนใจ" },
  "help.faq2q": { en: "What documents do I need to apply?", th: "ฉันต้องใช้เอกสารอะไรบ้างในการสมัคร?" },
  "help.faq2a": { en: "Most programs require transcripts, ID copy, test scores, and a portfolio. Check each program's specific requirements page for details.", th: "หลักสูตรส่วนใหญ่ต้องการสำเนาผลการเรียน สำเนาบัตรประชาชน คะแนนสอบ และพอร์ตฟอลิโอ ตรวจสอบข้อกำหนดของแต่ละหลักสูตร" },
  "help.faq3q": { en: "Can I edit my application after submitting?", th: "ฉันสามารถแก้ไขใบสมัครหลังจากส่งได้ไหม?" },
  "help.faq3a": { en: "You can edit your application until the program's deadline. After that, changes are locked and your submission is final.", th: "คุณสามารถแก้ไขใบสมัครได้จนถึงกำหนดเส้นตาย หลังจากนั้นการเปลี่ยนแปลงจะถูกล็อค" },
  "help.faq4q": { en: "How many universities can I apply to?", th: "ฉันสามารถสมัครได้กี่มหาวิทยาลัย?" },
  "help.faq4a": { en: "You may add and apply to multiple programs across different universities. There is no limit, but check each round's rules for restrictions.", th: "คุณสามารถเพิ่มและสมัครได้หลายหลักสูตรในหลายมหาวิทยาลัย ไม่จำกัดจำนวน แต่ตรวจสอบกฎของแต่ละรอบ" },

  // ── Settings Modal ──
  "settings.title": { en: "Account Settings", th: "ตั้งค่าบัญชี" },
  "settings.changeEmail": { en: "Change my email", th: "เปลี่ยนอีเมล" },
  "settings.changePassword": { en: "Change my password", th: "เปลี่ยนรหัสผ่าน" },
  "settings.commPrefs": { en: "Communication preferences", th: "การตั้งค่าการแจ้งเตือน" },
  "settings.deleteAccount": { en: "Delete my account", th: "ลบบัญชีของฉัน" },
} as const;

export type TranslationKey = keyof typeof translations;

export function t(key: TranslationKey, locale: Locale): string {
  return translations[key]?.[locale] ?? key;
}
