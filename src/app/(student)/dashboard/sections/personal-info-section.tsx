"use client";

import { useState, useMemo, useRef, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import type { StudentProfile } from "@/types/database";
import { Search, ChevronDown } from "lucide-react";
import SectionPanel from "./section-panel";
import { useLocale } from "@/lib/i18n/context";
import type { TranslationKey } from "@/lib/i18n/translations";

interface Props {
  profile: StudentProfile | null;
  userId: string;
  onClose: () => void;
  userEmail: string;
  inline?: boolean;
  onSaved?: () => void;
}

const PREFIX_OPTIONS = ["Mr.", "Ms.", "Mrs.", "Master", "Miss"] as const;
const ID_TYPE_OPTIONS = ["Thai ID", "Passport", "G-Code"] as const;
const GENDER_OPTIONS = ["Male", "Female", "Other", "Prefer not to say"] as const;
const RELIGION_OPTIONS = ["Buddhism", "Islam", "Christianity", "Hinduism", "Other"] as const;

const PHONE_CODES = [
  "+66", "+1", "+7", "+20", "+27", "+30", "+31", "+32", "+33", "+34",
  "+36", "+39", "+40", "+41", "+43", "+44", "+45", "+46", "+47", "+48",
  "+49", "+51", "+52", "+53", "+54", "+55", "+56", "+57", "+58", "+60",
  "+61", "+62", "+63", "+64", "+65", "+66", "+81", "+82", "+84", "+86",
  "+90", "+91", "+92", "+93", "+94", "+95", "+98", "+212", "+213", "+216",
  "+218", "+220", "+234", "+249", "+251", "+254", "+255", "+256", "+260",
  "+263", "+351", "+352", "+353", "+354", "+355", "+356", "+357", "+358",
  "+370", "+371", "+372", "+373", "+374", "+375", "+380", "+381", "+382",
  "+383", "+385", "+386", "+420", "+421", "+852", "+853", "+855", "+856",
  "+880", "+886", "+960", "+961", "+962", "+963", "+964", "+965", "+966",
  "+968", "+970", "+971", "+972", "+973", "+974", "+975", "+976", "+977",
  "+992", "+993", "+994", "+995", "+996", "+998",
].filter((v, i, a) => a.indexOf(v) === i).sort((a, b) => {
  const na = parseInt(a.replace("+", ""));
  const nb = parseInt(b.replace("+", ""));
  return na - nb;
});

const COUNTRIES = [
  "Afghanistan", "Albania", "Algeria", "Andorra", "Angola", "Argentina", "Armenia",
  "Australia", "Austria", "Azerbaijan", "Bahrain", "Bangladesh", "Belarus", "Belgium",
  "Bhutan", "Bolivia", "Bosnia and Herzegovina", "Brazil", "Brunei", "Bulgaria",
  "Cambodia", "Cameroon", "Canada", "Chile", "China", "Colombia", "Costa Rica",
  "Croatia", "Cuba", "Cyprus", "Czech Republic", "Denmark", "Dominican Republic",
  "Ecuador", "Egypt", "El Salvador", "Estonia", "Ethiopia", "Finland", "France",
  "Georgia", "Germany", "Ghana", "Greece", "Guatemala", "Honduras", "Hong Kong",
  "Hungary", "Iceland", "India", "Indonesia", "Iran", "Iraq", "Ireland", "Israel",
  "Italy", "Jamaica", "Japan", "Jordan", "Kazakhstan", "Kenya", "Kuwait", "Laos",
  "Latvia", "Lebanon", "Libya", "Lithuania", "Luxembourg", "Macau", "Malaysia",
  "Maldives", "Mexico", "Mongolia", "Morocco", "Myanmar", "Nepal", "Netherlands",
  "New Zealand", "Nigeria", "North Korea", "Norway", "Oman", "Pakistan", "Palestine",
  "Panama", "Paraguay", "Peru", "Philippines", "Poland", "Portugal", "Qatar",
  "Romania", "Russia", "Saudi Arabia", "Serbia", "Singapore", "Slovakia", "Slovenia",
  "South Africa", "South Korea", "Spain", "Sri Lanka", "Sudan", "Sweden",
  "Switzerland", "Syria", "Taiwan", "Tanzania", "Thailand", "Turkey", "UAE",
  "Uganda", "Ukraine", "United Kingdom", "United States", "Uruguay", "Uzbekistan",
  "Venezuela", "Vietnam", "Yemen", "Zimbabwe",
];

const THAI_PROVINCES = [
  "Bangkok", "Amnat Charoen", "Ang Thong", "Bueng Kan", "Buri Ram",
  "Chachoengsao", "Chai Nat", "Chaiyaphum", "Chanthaburi", "Chiang Mai",
  "Chiang Rai", "Chon Buri", "Chumphon", "Kalasin", "Kamphaeng Phet",
  "Kanchanaburi", "Khon Kaen", "Krabi", "Lampang", "Lamphun",
  "Loei", "Lop Buri", "Mae Hong Son", "Maha Sarakham", "Mukdahan",
  "Nakhon Nayok", "Nakhon Pathom", "Nakhon Phanom", "Nakhon Ratchasima",
  "Nakhon Sawan", "Nakhon Si Thammarat", "Nan", "Narathiwat", "Nong Bua Lam Phu",
  "Nong Khai", "Nonthaburi", "Pathum Thani", "Pattani", "Phang Nga",
  "Phatthalung", "Phayao", "Phetchabun", "Phetchaburi", "Phichit",
  "Phitsanulok", "Phra Nakhon Si Ayutthaya", "Phrae", "Phuket",
  "Prachin Buri", "Prachuap Khiri Khan", "Ranong", "Ratchaburi",
  "Rayong", "Roi Et", "Sa Kaeo", "Sakon Nakhon", "Samut Prakan",
  "Samut Sakhon", "Samut Songkhram", "Saraburi", "Satun", "Si Sa Ket",
  "Sing Buri", "Songkhla", "Sukhothai", "Suphan Buri", "Surat Thani",
  "Surin", "Tak", "Trang", "Trat", "Ubon Ratchathani",
  "Udon Thani", "Uthai Thani", "Uttaradit", "Yala", "Yasothon",
];

// Parse structured address from JSON string
interface StructuredAddress {
  country: string;
  province: string;
  city: string;
  zipcode: string;
  addressLine: string;
}

function parseAddress(addr: string | null): StructuredAddress {
  if (!addr) return { country: "Thailand", province: "", city: "", zipcode: "", addressLine: "" };
  try {
    const parsed = JSON.parse(addr);
    return {
      country: parsed.country || "Thailand",
      province: parsed.province || "",
      city: parsed.city || "",
      zipcode: parsed.zipcode || "",
      addressLine: parsed.addressLine || "",
    };
  } catch {
    // Legacy plain text address
    return { country: "Thailand", province: "", city: "", zipcode: "", addressLine: addr };
  }
}

// Parse phone into code + number
function parsePhone(phone: string | null): { code: string; number: string } {
  if (!phone) return { code: "+66", number: "" };
  const match = phone.match(/^(\+\d{1,4})\s*(.*)$/);
  if (match) return { code: match[1], number: match[2] };
  return { code: "+66", number: phone };
}

export default function PersonalInfoSection({ profile, userId, onClose, userEmail, inline, onSaved }: Props) {
  const { t } = useLocale();
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const formRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (error) {
      formRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  }, [error]);

  const [prefix, setPrefix] = useState(profile?.prefix || "");
  const [idType, setIdType] = useState(profile?.id_type || "Thai ID");
  const [idNumber, setIdNumber] = useState(profile?.id_number || "");
  const [firstName, setFirstName] = useState(profile?.first_name || "");
  const [lastName, setLastName] = useState(profile?.last_name || "");
  const [firstNameTh, setFirstNameTh] = useState(profile?.first_name_th || "");
  const [lastNameTh, setLastNameTh] = useState(profile?.last_name_th || "");
  const [dob, setDob] = useState(profile?.dob || "");
  const [nationality, setNationality] = useState(profile?.nationality || "");
  const [gender, setGender] = useState(profile?.gender || "");
  const parsedPhone = parsePhone(profile?.phone ?? null);
  const [phoneCode, setPhoneCode] = useState(parsedPhone.code);
  const [phoneNumber, setPhoneNumber] = useState(parsedPhone.number);
  const [lineId, setLineId] = useState(profile?.line_id || "");
  const [religion, setReligion] = useState(profile?.religion || "");
  const [formerName, setFormerName] = useState(profile?.former_name || "");
  const [nickname, setNickname] = useState(profile?.nickname || "");
  const [firstLanguage, setFirstLanguage] = useState(profile?.first_language || "");
  const [languageAtHome, setLanguageAtHome] = useState(profile?.language_at_home || "");
  const [sameMailingAddress, setSameMailingAddress] = useState(profile?.mailing_address ? false : true);

  const parsedAddr = parseAddress(profile?.address ?? null);
  const parsedMailing = parseAddress(profile?.mailing_address ?? null);
  const [mailCountry, setMailCountry] = useState(parsedMailing.country);
  const [mailProvince, setMailProvince] = useState(parsedMailing.province);
  const [mailCity, setMailCity] = useState(parsedMailing.city);
  const [mailZipcode, setMailZipcode] = useState(parsedMailing.zipcode);
  const [mailLine, setMailLine] = useState(parsedMailing.addressLine);
  const [addrCountry, setAddrCountry] = useState(parsedAddr.country);
  const [addrProvince, setAddrProvince] = useState(parsedAddr.province);
  const [addrCity, setAddrCity] = useState(parsedAddr.city);
  const [addrZipcode, setAddrZipcode] = useState(parsedAddr.zipcode);
  const [addrLine, setAddrLine] = useState(parsedAddr.addressLine);

  async function handleSave() {

    // Validation
    if (!firstName || !lastName) {
      setError(t("form.validation.nameRequired"));
      return;
    }
    
    if (!idNumber) { setError(t("form.validation.idRequired")); return; }
    
    if (idType === "Thai ID") {

        if (!/^\d{13}$/.test(idNumber)) {
            setError(t("form.validation.thaiIdDigits"));
            return;
        }

        let sum = 0;

        for (let i = 0; i < 12; i++) {
            sum += parseInt(idNumber[i], 10) * (13 - i);
        }

        const checkDigit = (11 - (sum % 11)) % 10;

        if (checkDigit !== parseInt(idNumber[12], 10)) {
            setError(t("form.validation.invalidThaiId"));
            return;
        }

    }

    if (!dob) { setError(t("form.validation.dobRequired")); return; }
    if (!nationality) { setError(t("form.validation.nationalityRequired")); return; }
    if (!gender) { setError(t("form.validation.genderRequired")); return; }
    if (!phoneNumber) { setError(t("form.validation.phoneRequired")); return; }
    if (!addrLine) { setError(t("form.validation.addressRequired")); return; }

    setSaving(true);
    setError(null);

    const supabase = createClient();

    const addressJson = JSON.stringify({
      country: addrCountry,
      province: addrProvince,
      city: addrCity,
      zipcode: addrZipcode,
      addressLine: addrLine,
    });

    const mailingJson = sameMailingAddress ? null : JSON.stringify({
      country: mailCountry,
      province: mailProvince,
      city: mailCity,
      zipcode: mailZipcode,
      addressLine: mailLine,
    });

    const data = {
      prefix: prefix || null,
      id_type: idType || null,
      id_number: idNumber || null,
      first_name: firstName,
      last_name: lastName,
      first_name_th: firstNameTh || null,
      last_name_th: lastNameTh || null,
      dob: dob || null,
      nationality: nationality,
      gender: gender,
      phone: `${phoneCode} ${phoneNumber}`,
      line_id: lineId || null,
      contact_email: userEmail,
      address: addressJson,
      religion: religion || null,
      former_name: formerName || null,
      nickname: nickname || null,
      mailing_address: mailingJson,
      first_language: firstLanguage || null,
      language_at_home: languageAtHome || null,
    };

    if (profile) {
      const { error: err } = await supabase
        .from("student_profiles")
        .update(data)
        .eq("id", profile.id);
      if (err) { setError(err.message); setSaving(false); return; }
    } else {
      const { error: err } = await supabase
        .from("student_profiles")
        .insert({ ...data, user_id: userId });
      if (err) { setError(err.message); setSaving(false); return; }
    }

    if (onSaved) {
      setSaving(false);
      onSaved();
    } else {
      window.location.reload();
    }
  }

  const inputCls =
    "w-full rounded-lg border border-[#e0e0e0] px-4 py-3 text-sm outline-none focus:border-[#F4C430] focus:ring-2 focus:ring-[#F4C430]/20";
  const labelCls = "mb-1.5 block text-sm font-medium text-[#1a1a1a]";
  const requiredStar = <span className="text-red-500 ml-0.5">*</span>;

  const PREFIX_MAP: Record<string, TranslationKey> = {
    "Mr.": "form.prefix.mr",
    "Ms.": "form.prefix.ms",
    "Mrs.": "form.prefix.mrs",
    "Master": "form.prefix.master",
    "Miss": "form.prefix.miss",
  };

  const ID_TYPE_MAP: Record<string, TranslationKey> = {
    "Thai ID": "form.idType.thai",
    "Passport": "form.idType.passport",
    "G-Code": "form.idType.gcode",
  };

  const GENDER_MAP: Record<string, TranslationKey> = {
    "Male": "form.gender.male",
    "Female": "form.gender.female",
    "Other": "form.gender.other",
    "Prefer not to say": "form.gender.preferNotToSay",
  };

  const RELIGION_MAP: Record<string, TranslationKey> = {
    "Buddhism": "form.religion.buddhism",
    "Islam": "form.religion.islam",
    "Christianity": "form.religion.christianity",
    "Hinduism": "form.religion.hinduism",
    "Other": "form.religion.other",
  };

  const formContent = (
      <div ref={formRef} className="space-y-8">
        {error && (
          <div className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-600">{error}</div>
        )}

        {/* Identity */}
        <fieldset>
          <legend className="mb-4 text-base font-semibold text-[#1a1a1a]">{t("form.identity")}</legend>
          <div className="space-y-4">
            <div>
              <label className={labelCls}>{t("form.prefix")}</label>
              <div className="flex gap-2 flex-wrap">
                {PREFIX_OPTIONS.map((p) => (
                  <button
                    key={p}
                    type="button"
                    onClick={() => setPrefix(p)}
                    className={`rounded-full border px-4 py-2 text-sm font-medium transition-colors ${
                      prefix === p
                        ? "border-[#F4C430] bg-[#FFF3D0] text-[#1a1a1a]"
                        : "border-[#e0e0e0] text-[#666] hover:border-[#ccc]"
                    }`}
                  >
                    {PREFIX_MAP[p] ? t(PREFIX_MAP[p]) : p}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className={labelCls}>{t("form.idType")} {requiredStar}</label>
              <div className="flex gap-2">
                {ID_TYPE_OPTIONS.map((type) => (
                  <button
                    key={type}
                    type="button"
                    onClick={() => setIdType(type)}
                    className={`rounded-lg border px-4 py-2.5 text-sm font-medium transition-colors ${
                      idType === type
                        ? "border-[#F4C430] bg-[#FFF3D0] text-[#1a1a1a]"
                        : "border-[#e0e0e0] text-[#666] hover:border-[#ccc]"
                    }`}
                  >
                    {ID_TYPE_MAP[type] ? t(ID_TYPE_MAP[type]) : type}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className={labelCls}>{t("form.idNumber")} {requiredStar}</label>
              <input
                type="text"
                value={idNumber}
                onChange={(e) => setIdNumber(e.target.value)}
                placeholder={
                  idType === "Thai ID" ? t("form.ph.idNumber.thai") :
                  idType === "Passport" ? t("form.ph.idNumber.passport") :
                  t("form.ph.idNumber.gcode")
                }
                className={inputCls}
              />
            </div>
          </div>
        </fieldset>

        {/* Name (English) */}
        <fieldset>
          <legend className="mb-4 text-base font-semibold text-[#1a1a1a]">{t("form.nameEN")}</legend>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={labelCls}>{t("form.firstName")} {requiredStar}</label>
              <input type="text" value={firstName} onChange={(e) => setFirstName(e.target.value)} placeholder={t("form.ph.firstName")} className={inputCls} />
            </div>
            <div>
              <label className={labelCls}>{t("form.lastName")} {requiredStar}</label>
              <input type="text" value={lastName} onChange={(e) => setLastName(e.target.value)} placeholder={t("form.ph.lastName")} className={inputCls} />
            </div>
          </div>
        </fieldset>

        {/* Name (Thai) */}
        <fieldset>
          <legend className="mb-4 text-base font-semibold text-[#1a1a1a]">{t("form.nameTH")}</legend>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={labelCls}>{t("form.firstName")}</label>
              <input type="text" value={firstNameTh} onChange={(e) => setFirstNameTh(e.target.value)} placeholder={t("form.firstName")} className={inputCls} />
            </div>
            <div>
              <label className={labelCls}>{t("form.lastName")}</label>
              <input type="text" value={lastNameTh} onChange={(e) => setLastNameTh(e.target.value)} placeholder={t("form.lastName")} className={inputCls} />
            </div>
          </div>
        </fieldset>

        {/* Personal */}
        <fieldset>
          <legend className="mb-4 text-base font-semibold text-[#1a1a1a]">{t("form.personalDetails")}</legend>
          <div className="space-y-4">
            <div>
              <label className={labelCls}>{t("form.dob")} {requiredStar}</label>
              <input type="date" value={dob} onChange={(e) => setDob(e.target.value)} className={inputCls} />
            </div>
            <div>
              <label className={labelCls}>{t("form.nationality")} {requiredStar}</label>
              <SearchableSelect
                value={nationality}
                onChange={setNationality}
                options={COUNTRIES}
                placeholder={t("form.ph.nationality")}
              />
            </div>
            <div>
              <label className={labelCls}>{t("form.gender")} {requiredStar}</label>
              <div className="flex gap-2 flex-wrap">
                {GENDER_OPTIONS.map((g) => (
                  <button
                    key={g}
                    type="button"
                    onClick={() => setGender(g)}
                    className={`rounded-full border px-4 py-2 text-sm font-medium transition-colors ${
                      gender === g
                        ? "border-[#F4C430] bg-[#FFF3D0] text-[#1a1a1a]"
                        : "border-[#e0e0e0] text-[#666] hover:border-[#ccc]"
                    }`}
                  >
                    {GENDER_MAP[g] ? t(GENDER_MAP[g]) : g}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </fieldset>

        {/* Contact */}
        <fieldset>
          <legend className="mb-4 text-base font-semibold text-[#1a1a1a]">{t("form.contact")}</legend>
          <div className="space-y-4">
            <div>
              <label className={labelCls}>{t("form.phone")} {requiredStar}</label>
              <div className="flex gap-2">
                <div className="w-[160px] shrink-0">
                  <PhoneCodeSelect value={phoneCode} onChange={setPhoneCode} />
                </div>
                <input
                  type="tel"
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                  placeholder={t("form.ph.phoneNumber")}
                  className={inputCls}
                />
              </div>
            </div>
            <div>
              <label className={labelCls}>{t("form.lineId")} <span className="text-xs text-[#999] ml-1">{t("form.optional")}</span></label>
              <input type="text" value={lineId} onChange={(e) => setLineId(e.target.value)} placeholder={t("form.lineId")} className={inputCls} />
            </div>
            <div>
              <label className={labelCls}>{t("form.contactEmail")}</label>
              <input type="email" value={userEmail} disabled className={`${inputCls} bg-[#f5f5f5] text-[#999]`} />
              <p className="mt-1 text-xs text-[#999]">{t("form.registeredEmail")}</p>
            </div>
          </div>
        </fieldset>

        {/* Address */}
        <fieldset>
          <legend className="mb-4 text-base font-semibold text-[#1a1a1a]">{t("form.address")}</legend>
          <div className="space-y-4">
            <div>
              <label className={labelCls}>{t("form.country")}</label>
              <SearchableSelect
                value={addrCountry}
                onChange={(v) => { setAddrCountry(v); if (v !== "Thailand") { setAddrProvince(""); } }}
                options={COUNTRIES}
                placeholder={t("form.ph.country")}
              />
            </div>

            {addrCountry === "Thailand" ? (
              <>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className={labelCls}>{t("form.province")} {requiredStar}</label>
                    <SearchableSelect
                      value={addrProvince}
                      onChange={setAddrProvince}
                      options={THAI_PROVINCES}
                      placeholder={t("form.ph.province")}
                    />
                  </div>
                  <div>
                    <label className={labelCls}>{t("form.cityDistrict")} {requiredStar}</label>
                    <input type="text" value={addrCity} onChange={(e) => setAddrCity(e.target.value)} placeholder={t("form.ph.cityDistrict")} className={inputCls} />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className={labelCls}>{t("form.zipCode")} {requiredStar}</label>
                    <input type="text" value={addrZipcode} onChange={(e) => setAddrZipcode(e.target.value)} placeholder={t("form.ph.zipCode")} className={inputCls} maxLength={5} />
                  </div>
                </div>
                <div>
                  <label className={labelCls}>{t("form.addressLine")} {requiredStar}</label>
                  <textarea
                    value={addrLine}
                    onChange={(e) => setAddrLine(e.target.value)}
                    rows={2}
                    placeholder={t("form.ph.addressLine")}
                    className={inputCls}
                  />
                </div>
              </>
            ) : (
              <div>
                <label className={labelCls}>{t("form.fullAddress")} {requiredStar}</label>
                <textarea
                  value={addrLine}
                  onChange={(e) => setAddrLine(e.target.value)}
                  rows={3}
                  placeholder={t("form.ph.fullAddress")}
                  className={inputCls}
                />
              </div>
            )}
          </div>
        </fieldset>

        {/* Mailing Address */}
        <fieldset>
          <legend className="mb-4 text-base font-semibold text-[#1a1a1a]">{t("form.mailingAddress")}</legend>
          <div className="space-y-4">
            <label className="flex items-center gap-3 text-sm font-medium text-[#1a1a1a]">
              <input type="checkbox" checked={sameMailingAddress} onChange={(e) => setSameMailingAddress(e.target.checked)} className="h-4 w-4 accent-[#F4C430]" />
              {t("form.sameAsPermanent")}
            </label>
            {!sameMailingAddress && (
              <>
                <div>
                  <label className={labelCls}>{t("form.country")}</label>
                  <SearchableSelect value={mailCountry} onChange={(v) => { setMailCountry(v); if (v !== "Thailand") setMailProvince(""); }} options={COUNTRIES} placeholder={t("form.ph.country")} />
                </div>
                {mailCountry === "Thailand" ? (
                  <>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className={labelCls}>{t("form.province")}</label>
                        <SearchableSelect value={mailProvince} onChange={setMailProvince} options={THAI_PROVINCES} placeholder={t("form.ph.province")} />
                      </div>
                      <div>
                        <label className={labelCls}>{t("form.cityDistrict")}</label>
                        <input type="text" value={mailCity} onChange={(e) => setMailCity(e.target.value)} placeholder={t("form.ph.cityDistrict")} className={inputCls} />
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className={labelCls}>{t("form.zipCode")}</label>
                        <input type="text" value={mailZipcode} onChange={(e) => setMailZipcode(e.target.value)} placeholder={t("form.ph.zipCode")} className={inputCls} maxLength={5} />
                      </div>
                    </div>
                    <div>
                      <label className={labelCls}>{t("form.addressLine")}</label>
                      <textarea value={mailLine} onChange={(e) => setMailLine(e.target.value)} rows={2} placeholder={t("form.ph.addressLine")} className={inputCls} />
                    </div>
                  </>
                ) : (
                  <div>
                    <label className={labelCls}>{t("form.fullAddress")}</label>
                    <textarea value={mailLine} onChange={(e) => setMailLine(e.target.value)} rows={3} placeholder={t("form.ph.fullMailingAddress")} className={inputCls} />
                  </div>
                )}
              </>
            )}
          </div>
        </fieldset>

        {/* Additional Information */}
        <fieldset>
          <legend className="mb-4 text-base font-semibold text-[#1a1a1a]">{t("form.additionalInfo")}</legend>
          <div className="space-y-4">
            <div>
              <label className={labelCls}>{t("form.religion")} <span className="ml-1 text-xs font-normal text-[#999]">{t("form.optional")}</span></label>
              <div className="flex gap-2 flex-wrap">
                {RELIGION_OPTIONS.map((r) => (
                  <button key={r} type="button" onClick={() => setReligion(r)} className={`rounded-full border px-3 py-1.5 text-sm font-medium transition-colors ${religion === r ? "border-[#F4C430] bg-[#FFF3D0] text-[#1a1a1a]" : "border-[#e0e0e0] text-[#666] hover:border-[#ccc]"}`}>
                    {RELIGION_MAP[r] ? t(RELIGION_MAP[r]) : r}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <label className={labelCls}>{t("form.formerName")} <span className="ml-1 text-xs font-normal text-[#999]">{t("form.ifChanged")}</span></label>
              <input type="text" value={formerName} onChange={(e) => setFormerName(e.target.value)} placeholder={t("form.ph.formerName")} className={inputCls} />
            </div>
            <div>
              <label className={labelCls}>{t("form.nickname")} <span className="ml-1 text-xs font-normal text-[#999]">{t("form.optional")}</span></label>
              <input type="text" value={nickname} onChange={(e) => setNickname(e.target.value)} placeholder={t("form.ph.nickname")} className={inputCls} />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className={labelCls}>{t("form.firstLanguage")} <span className="ml-1 text-xs font-normal text-[#999]">{t("form.ifNotThaiEnglish")}</span></label>
                <input type="text" value={firstLanguage} onChange={(e) => setFirstLanguage(e.target.value)} placeholder={t("form.ph.firstLanguage")} className={inputCls} />
              </div>
              <div>
                <label className={labelCls}>{t("form.languageAtHome")}</label>
                <input type="text" value={languageAtHome} onChange={(e) => setLanguageAtHome(e.target.value)} placeholder={t("form.ph.languageAtHome")} className={inputCls} />
              </div>
            </div>
          </div>
        </fieldset>
      </div>
  );

  if (inline) {
    return (
      <div>
        {formContent}
        <div className="mt-6">
          <button onClick={handleSave} disabled={saving} className="rounded-lg bg-[#F4C430] px-6 py-3 text-base font-semibold text-[#1a1a1a] transition-colors hover:bg-[#e6b82a] disabled:opacity-50">
            {saving ? t("form.saving") : t("form.continue")}
          </button>
        </div>
      </div>
    );
  }

  return (
    <SectionPanel title={t("form.personalInfo")} onClose={onClose} onSave={handleSave} saving={saving} saveLabel={t("form.continue")}>
      {formContent}
    </SectionPanel>
  );
}

/* ── Searchable Select Component ── */

function SearchableSelect({ value, onChange, options, placeholder }: {
  value: string;
  onChange: (v: string) => void;
  options: string[];
  placeholder: string;
}) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const { t } = useLocale();

  const filtered = useMemo(() => {
    if (!search) return options;
    const q = search.toLowerCase();
    return options.filter((o) => o.toLowerCase().includes(q));
  }, [search, options]);

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="flex w-full items-center justify-between rounded-lg border border-[#e0e0e0] px-4 py-3 text-left text-sm outline-none focus:border-[#F4C430] focus:ring-2 focus:ring-[#F4C430]/20"
      >
        <span className={value ? "text-[#1a1a1a]" : "text-[#999]"}>
          {value || placeholder}
        </span>
        <ChevronDown size={16} className={`text-[#999] transition-transform ${open ? "rotate-180" : ""}`} />
      </button>

      {open && (
        <>
          <div className="fixed inset-0 z-10" onClick={() => { setOpen(false); setSearch(""); }} />
          <div className="absolute left-0 right-0 top-full z-20 mt-1 rounded-lg border border-[#e8e8e8] bg-white shadow-lg">
            {/* Search input */}
            <div className="border-b border-[#f0f0f0] px-3 py-2">
              <div className="relative">
                <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#999]" />
                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder={t("form.searchSelect")}
                  autoFocus
                  className="w-full rounded-md border border-[#e0e0e0] py-1.5 pl-8 pr-3 text-sm outline-none focus:border-[#F4C430]"
                />
              </div>
            </div>
            {/* Options list */}
            <div className="max-h-[200px] overflow-y-auto py-1">
              {filtered.length === 0 ? (
                <p className="px-4 py-2 text-sm text-[#999]">{t("form.noResults")}</p>
              ) : (
                filtered.map((option) => (
                  <button
                    key={option}
                    type="button"
                    onClick={() => { onChange(option); setOpen(false); setSearch(""); }}
                    className={`flex w-full px-4 py-2 text-left text-sm transition-colors ${
                      value === option ? "bg-[#FFF3D0] font-medium text-[#1a1a1a]" : "text-[#444] hover:bg-[#f5f5f5]"
                    }`}
                  >
                    {option}
                  </button>
                ))
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}

/* ── Phone Code Searchable Select ── */

function PhoneCodeSelect({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const { t } = useLocale();

  const filtered = useMemo(() => {
    if (!search) return PHONE_CODES;
    return PHONE_CODES.filter((code) => code.includes(search));
  }, [search]);

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="flex w-full items-center justify-between rounded-lg border border-[#e0e0e0] px-3 py-3 text-left text-sm outline-none focus:border-[#F4C430] focus:ring-2 focus:ring-[#F4C430]/20"
      >
        <span className="text-[#1a1a1a]">{value}</span>
        <ChevronDown size={14} className={`text-[#999] transition-transform ${open ? "rotate-180" : ""}`} />
      </button>

      {open && (
        <>
          <div className="fixed inset-0 z-10" onClick={() => { setOpen(false); setSearch(""); }} />
          <div className="absolute left-0 top-full z-20 mt-1 w-[200px] rounded-lg border border-[#e8e8e8] bg-white shadow-lg">
            <div className="border-b border-[#f0f0f0] px-3 py-2">
              <div className="relative">
                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="e.g. +66"
                  autoFocus
                  className="w-full rounded-md border border-[#e0e0e0] px-3 py-1.5 text-sm outline-none focus:border-[#F4C430]"
                />
              </div>
            </div>
            <div className="max-h-[200px] overflow-y-auto py-1">
              {filtered.length === 0 ? (
                <p className="px-4 py-2 text-sm text-[#999]">{t("form.noResults")}</p>
              ) : (
                filtered.map((code) => (
                  <button
                    key={code}
                    type="button"
                    onClick={() => { onChange(code); setOpen(false); setSearch(""); }}
                    className={`flex w-full px-4 py-2 text-left text-sm font-medium transition-colors ${
                      value === code ? "bg-[#FFF3D0] text-[#1a1a1a]" : "text-[#444] hover:bg-[#f5f5f5]"
                    }`}
                  >
                    {code}
                  </button>
                ))
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
