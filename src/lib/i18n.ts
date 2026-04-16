// Simple i18n for SabaiApply admin pages
// Add more keys as pages are built

export type Locale = "th" | "en";

const translations = {
  // Common
  "sign_in": { th: "เข้าสู่ระบบ", en: "Sign In" },
  "sign_out": { th: "ออกจากระบบ", en: "Sign Out" },
  "signing_in": { th: "กำลังเข้าสู่ระบบ...", en: "Signing in..." },
  "save": { th: "บันทึก", en: "Save" },
  "saving": { th: "กำลังบันทึก...", en: "Saving..." },
  "cancel": { th: "ยกเลิก", en: "Cancel" },
  "edit": { th: "แก้ไข", en: "Edit" },
  "delete": { th: "ลบ", en: "Delete" },
  "copy": { th: "คัดลอก", en: "Copy" },
  "email": { th: "อีเมล", en: "Email" },
  "password": { th: "รหัสผ่าน", en: "Password" },
  "confirm_password": { th: "ยืนยันรหัสผ่าน", en: "Confirm Password" },
  "full_name": { th: "ชื่อ-นามสกุล", en: "Full Name" },
  "loading": { th: "กำลังโหลด...", en: "Loading..." },
  "admin_portal": { th: "ระบบจัดการ", en: "Admin Portal" },
  "admin_access_invite_only": { th: "การเข้าถึงระบบจัดการต้องได้รับเชิญเท่านั้น", en: "Admin access is invite-only." },

  // Login
  "faculty_admin_portal": { th: "ระบบจัดการสำหรับคณะ", en: "Faculty Admin Portal" },
  "forgot_password": { th: "ลืมรหัสผ่าน?", en: "Forgot password?" },
  "enter_password": { th: "กรอกรหัสผ่าน", en: "Enter your password" },
  "min_6_chars": { th: "อย่างน้อย 6 ตัวอักษร", en: "At least 6 characters" },
  "passwords_not_match": { th: "รหัสผ่านไม่ตรงกัน", en: "Passwords do not match." },
  "password_too_short": { th: "รหัสผ่านต้องมีอย่างน้อย 6 ตัวอักษร", en: "Password must be at least 6 characters." },
  "no_admin_access": { th: "บัญชีนี้ไม่มีสิทธิ์เข้าถึงระบบจัดการ", en: "This account does not have admin access." },

  // Forgot / Reset Password
  "forgot_password_title": { th: "ลืมรหัสผ่าน", en: "Forgot Password" },
  "forgot_password_desc": { th: "กรอกอีเมลของคุณ แล้วเราจะส่งลิงก์รีเซ็ตให้", en: "Enter your email and we'll send you a reset link." },
  "send_reset_link": { th: "ส่งลิงก์รีเซ็ต", en: "Send Reset Link" },
  "sending": { th: "กำลังส่ง...", en: "Sending..." },
  "check_email": { th: "ตรวจสอบอีเมลของคุณ", en: "Check Your Email" },
  "reset_link_sent": { th: "เราส่งลิงก์รีเซ็ตรหัสผ่านไปที่", en: "We sent a password reset link to" },
  "back_to_login": { th: "กลับไปหน้าเข้าสู่ระบบ", en: "Back to Login" },
  "set_new_password": { th: "ตั้งรหัสผ่านใหม่", en: "Set New Password" },
  "new_password": { th: "รหัสผ่านใหม่", en: "New Password" },
  "confirm_new_password": { th: "ยืนยันรหัสผ่านใหม่", en: "Confirm New Password" },
  "update_password": { th: "อัปเดตรหัสผ่าน", en: "Update Password" },
  "updating": { th: "กำลังอัปเดต...", en: "Updating..." },

  // Invite
  "setup_account": { th: "ตั้งค่าบัญชีผู้ดูแล", en: "Set up your admin account" },
  "create_account": { th: "สร้างบัญชี", en: "Create Account" },
  "creating_account": { th: "กำลังสร้างบัญชี...", en: "Creating account..." },
  "invalid_invite": { th: "ลิงก์เชิญไม่ถูกต้อง", en: "Invalid Invite" },
  "invite_already_used": { th: "ลิงก์เชิญนี้ถูกใช้แล้ว", en: "This invite has already been used." },
  "invite_expired": { th: "ลิงก์เชิญหมดอายุแล้ว กรุณาขอลิงก์ใหม่จากผู้ดูแล", en: "This invite has expired. Please ask your admin to send a new one." },
  "invite_invalid": { th: "ลิงก์เชิญไม่ถูกต้อง", en: "This invite link is invalid." },
  "go_to_login": { th: "ไปหน้าเข้าสู่ระบบ", en: "Go to Login" },

  // Sidebar
  "dashboard": { th: "แดชบอร์ด", en: "Dashboard" },
  "university_setup": { th: "ตั้งค่ามหาวิทยาลัย", en: "University Setup" },
  "programs": { th: "หลักสูตร", en: "Programs" },
  "applications": { th: "ใบสมัคร", en: "Applications" },
  "interviews": { th: "สัมภาษณ์", en: "Interviews" },
  "results": { th: "ผลการคัดเลือก", en: "Results" },
  "team": { th: "ทีมงาน", en: "Team" },

  // Dashboard
  "welcome_back": { th: "ยินดีต้อนรับกลับ", en: "Welcome back" },
  "total_applications": { th: "ใบสมัครทั้งหมด", en: "Total Applications" },
  "pending_review": { th: "รอการตรวจสอบ", en: "Pending Review" },

  // University Setup
  "configure_uni": { th: "กำหนดค่ามหาวิทยาลัยและคณะ", en: "Configure your university and faculties" },
  "university_profile": { th: "ข้อมูลมหาวิทยาลัย", en: "University Profile" },
  "university_name": { th: "ชื่อมหาวิทยาลัย", en: "University Name" },
  "search_uni": { th: "ค้นหาชื่อภาษาไทยหรืออังกฤษ...", en: "Search by English or Thai name..." },
  "website": { th: "เว็บไซต์", en: "Website" },
  "update_university": { th: "อัปเดตมหาวิทยาลัย", en: "Update University" },
  "save_university": { th: "บันทึกมหาวิทยาลัย", en: "Save University" },
  "faculties": { th: "คณะ", en: "Faculties" },
  "add_faculty": { th: "+ เพิ่มคณะ", en: "+ Add Faculty" },
  "faculty_name_en": { th: "ชื่อคณะ (อังกฤษ)", en: "Faculty Name (English)" },
  "faculty_name_th": { th: "ชื่อคณะ (ไทย)", en: "Faculty Name (Thai)" },
  "no_faculties": { th: "ยังไม่มีคณะ คลิก \"+ เพิ่มคณะ\" เพื่อเริ่มต้น", en: "No faculties added yet. Click \"+ Add Faculty\" to get started." },
  "add_faculty_btn": { th: "เพิ่มคณะ", en: "Add Faculty" },
  "update_faculty": { th: "อัปเดตคณะ", en: "Update Faculty" },
  "select_uni": { th: "กรุณาเลือกมหาวิทยาลัยจากรายการ", en: "Please select a university from the dropdown list." },
  "delete_faculty_confirm": { th: "ลบ \"{{name}}\"? การดำเนินการนี้จะลบหลักสูตรทั้งหมดภายใต้คณะนี้ด้วย", en: "Delete \"{{name}}\"? This will also delete all programs under it." },

  // Team
  "invite_admins": { th: "เชิญผู้ดูแลคณะเข้าสู่แพลตฟอร์ม", en: "Invite faculty admins to the platform" },
  "send_invite": { th: "ส่งคำเชิญ", en: "Send Invite" },
  "email_address": { th: "ที่อยู่อีเมล", en: "Email Address" },
  "faculty_optional": { th: "คณะ (ไม่บังคับ)", en: "Faculty (Optional)" },
  "no_specific_faculty": { th: "ไม่ระบุคณะ", en: "No specific faculty" },
  "share_invite_link": { th: "แชร์ลิงก์เชิญนี้:", en: "Share this invite link:" },
  "sent_invites": { th: "คำเชิญที่ส่งแล้ว", en: "Sent Invites" },
  "no_invites": { th: "ยังไม่มีคำเชิญที่ส่ง", en: "No invites sent yet." },
  "status": { th: "สถานะ", en: "Status" },
  "sent": { th: "ส่งเมื่อ", en: "Sent" },
  "accepted": { th: "ยอมรับแล้ว", en: "Accepted" },
  "expired": { th: "หมดอายุ", en: "Expired" },
  "pending": { th: "รอดำเนินการ", en: "Pending" },
  "already_pending": { th: "อีเมลนี้มีคำเชิญที่รอดำเนินการอยู่แล้ว", en: "This email already has a pending invite." },
  "invite_created": { th: "สร้างคำเชิญสำหรับ", en: "Invite created for" },
} as const;

type TranslationKey = keyof typeof translations;

export function t(key: TranslationKey, locale: Locale): string {
  return translations[key]?.[locale] ?? key;
}

// For template strings like "Delete {{name}}?"
export function tReplace(key: TranslationKey, locale: Locale, replacements: Record<string, string>): string {
  let result = t(key, locale);
  for (const [k, v] of Object.entries(replacements)) {
    result = result.replace(`{{${k}}}`, v);
  }
  return result;
}
