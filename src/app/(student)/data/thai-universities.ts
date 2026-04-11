// Complete list of Thai universities
// Sources: Wikipedia, MHESI, CUPT

export interface ThaiUniversity {
  id: string;
  name: string;
  name_th: string;
  type: "public" | "private" | "rajabhat" | "rajamangala" | "autonomous" | "institute";
}

export const thaiUniversities: ThaiUniversity[] = [
  // ==========================================
  // AUTONOMOUS UNIVERSITIES
  // ==========================================
  { id: "au-01", name: "Chulalongkorn University", name_th: "จุฬาลงกรณ์มหาวิทยาลัย", type: "autonomous" },
  { id: "au-02", name: "Thammasat University", name_th: "มหาวิทยาลัยธรรมศาสตร์", type: "autonomous" },
  { id: "au-03", name: "Kasetsart University", name_th: "มหาวิทยาลัยเกษตรศาสตร์", type: "autonomous" },
  { id: "au-04", name: "Mahidol University", name_th: "มหาวิทยาลัยมหิดล", type: "autonomous" },
  { id: "au-05", name: "King Mongkut's Institute of Technology Ladkrabang (KMITL)", name_th: "สถาบันเทคโนโลยีพระจอมเกล้าเจ้าคุณทหารลาดกระบัง", type: "autonomous" },
  { id: "au-06", name: "King Mongkut's University of Technology Thonburi (KMUTT)", name_th: "มหาวิทยาลัยเทคโนโลยีพระจอมเกล้าธนบุรี", type: "autonomous" },
  { id: "au-07", name: "King Mongkut's University of Technology North Bangkok (KMUTNB)", name_th: "มหาวิทยาลัยเทคโนโลยีพระจอมเกล้าพระนครเหนือ", type: "autonomous" },
  { id: "au-08", name: "Chiang Mai University", name_th: "มหาวิทยาลัยเชียงใหม่", type: "autonomous" },
  { id: "au-09", name: "Khon Kaen University", name_th: "มหาวิทยาลัยขอนแก่น", type: "autonomous" },
  { id: "au-10", name: "Prince of Songkla University", name_th: "มหาวิทยาลัยสงขลานครินทร์", type: "autonomous" },
  { id: "au-11", name: "Srinakharinwirot University", name_th: "มหาวิทยาลัยศรีนครินทรวิโรฒ", type: "autonomous" },
  { id: "au-12", name: "Silpakorn University", name_th: "มหาวิทยาลัยศิลปากร", type: "autonomous" },
  { id: "au-13", name: "Burapha University", name_th: "มหาวิทยาลัยบูรพา", type: "autonomous" },
  { id: "au-14", name: "Naresuan University", name_th: "มหาวิทยาลัยนเรศวร", type: "autonomous" },
  { id: "au-15", name: "Maejo University", name_th: "มหาวิทยาลัยแม่โจ้", type: "autonomous" },
  { id: "au-16", name: "Mae Fah Luang University", name_th: "มหาวิทยาลัยแม่ฟ้าหลวง", type: "autonomous" },
  { id: "au-17", name: "Thaksin University", name_th: "มหาวิทยาลัยทักษิณ", type: "autonomous" },
  { id: "au-18", name: "Walailak University", name_th: "มหาวิทยาลัยวลัยลักษณ์", type: "autonomous" },
  { id: "au-19", name: "Suranaree University of Technology", name_th: "มหาวิทยาลัยเทคโนโลยีสุรนารี", type: "autonomous" },
  { id: "au-20", name: "Ubon Ratchathani University", name_th: "มหาวิทยาลัยอุบลราชธานี", type: "autonomous" },
  { id: "au-21", name: "University of Phayao", name_th: "มหาวิทยาลัยพะเยา", type: "autonomous" },
  { id: "au-22", name: "Suan Dusit University", name_th: "มหาวิทยาลัยสวนดุสิต", type: "autonomous" },
  { id: "au-23", name: "National Institute of Development Administration (NIDA)", name_th: "สถาบันบัณฑิตพัฒนบริหารศาสตร์", type: "autonomous" },
  { id: "au-24", name: "Navamindradhiraj University", name_th: "มหาวิทยาลัยนวมินทราธิราช", type: "autonomous" },
  { id: "au-25", name: "Chulabhorn Graduate Institute", name_th: "สถาบันบัณฑิตศึกษาจุฬาภรณ์", type: "autonomous" },
  { id: "au-26", name: "Princess Galyani Vadhana Institute of Music", name_th: "สถาบันดนตรีกัลยาณิวัฒนา", type: "autonomous" },
  { id: "au-27", name: "Mahachulalongkornrajavidyalaya University", name_th: "มหาวิทยาลัยมหาจุฬาลงกรณราชวิทยาลัย", type: "autonomous" },
  { id: "au-28", name: "Mahamakut Buddhist University", name_th: "มหาวิทยาลัยมหามกุฏราชวิทยาลัย", type: "autonomous" },
  { id: "au-29", name: "Chitralada Technology Institute", name_th: "สถาบันเทคโนโลยีจิตรลดา", type: "autonomous" },

  // ==========================================
  // PUBLIC UNIVERSITIES (Non-Autonomous)
  // ==========================================
  { id: "pu-01", name: "Mahasarakham University", name_th: "มหาวิทยาลัยมหาสารคาม", type: "public" },
  { id: "pu-02", name: "Ramkhamhaeng University", name_th: "มหาวิทยาลัยรามคำแหง", type: "public" },
  { id: "pu-03", name: "Sukhothai Thammathirat Open University", name_th: "มหาวิทยาลัยสุโขทัยธรรมาธิราช", type: "public" },
  { id: "pu-04", name: "Kalasin University", name_th: "มหาวิทยาลัยกาฬสินธุ์", type: "public" },
  { id: "pu-05", name: "Nakhon Phanom University", name_th: "มหาวิทยาลัยนครพนม", type: "public" },
  { id: "pu-06", name: "Princess of Naradhiwas University", name_th: "มหาวิทยาลัยนราธิวาสราชนครินทร์", type: "public" },
  { id: "pu-07", name: "Pathumwan Institute of Technology", name_th: "สถาบันเทคโนโลยีปทุมวัน", type: "public" },

  // ==========================================
  // RAJABHAT UNIVERSITIES
  // ==========================================
  { id: "rb-01", name: "Suan Sunandha Rajabhat University", name_th: "มหาวิทยาลัยราชภัฏสวนสุนันทา", type: "rajabhat" },
  { id: "rb-02", name: "Phranakhon Rajabhat University", name_th: "มหาวิทยาลัยราชภัฏพระนคร", type: "rajabhat" },
  { id: "rb-03", name: "Chandrakasem Rajabhat University", name_th: "มหาวิทยาลัยราชภัฏจันทรเกษม", type: "rajabhat" },
  { id: "rb-04", name: "Bansomdejchaopraya Rajabhat University", name_th: "มหาวิทยาลัยราชภัฏบ้านสมเด็จเจ้าพระยา", type: "rajabhat" },
  { id: "rb-05", name: "Dhonburi Rajabhat University", name_th: "มหาวิทยาลัยราชภัฏธนบุรี", type: "rajabhat" },
  { id: "rb-06", name: "Valaya Alongkorn Rajabhat University", name_th: "มหาวิทยาลัยราชภัฏวไลยอลงกรณ์", type: "rajabhat" },
  { id: "rb-07", name: "Phranakhon Si Ayutthaya Rajabhat University", name_th: "มหาวิทยาลัยราชภัฏพระนครศรีอยุธยา", type: "rajabhat" },
  { id: "rb-08", name: "Rambhai Barni Rajabhat University", name_th: "มหาวิทยาลัยราชภัฏรำไพพรรณี", type: "rajabhat" },
  { id: "rb-09", name: "Rajanagarindra Rajabhat University", name_th: "มหาวิทยาลัยราชภัฏราชนครินทร์", type: "rajabhat" },
  { id: "rb-10", name: "Thepsatri Rajabhat University", name_th: "มหาวิทยาลัยราชภัฏเทพสตรี", type: "rajabhat" },
  { id: "rb-11", name: "Muban Chombueng Rajabhat University", name_th: "มหาวิทยาลัยราชภัฏหมู่บ้านจอมบึง", type: "rajabhat" },
  { id: "rb-12", name: "Nakhon Pathom Rajabhat University", name_th: "มหาวิทยาลัยราชภัฏนครปฐม", type: "rajabhat" },
  { id: "rb-13", name: "Kanchanaburi Rajabhat University", name_th: "มหาวิทยาลัยราชภัฏกาญจนบุรี", type: "rajabhat" },
  { id: "rb-14", name: "Phetchaburi Rajabhat University", name_th: "มหาวิทยาลัยราชภัฏเพชรบุรี", type: "rajabhat" },
  { id: "rb-15", name: "Phuket Rajabhat University", name_th: "มหาวิทยาลัยราชภัฏภูเก็ต", type: "rajabhat" },
  { id: "rb-16", name: "Nakhon Si Thammarat Rajabhat University", name_th: "มหาวิทยาลัยราชภัฏนครศรีธรรมราช", type: "rajabhat" },
  { id: "rb-17", name: "Songkhla Rajabhat University", name_th: "มหาวิทยาลัยราชภัฏสงขลา", type: "rajabhat" },
  { id: "rb-18", name: "Yala Rajabhat University", name_th: "มหาวิทยาลัยราชภัฏยะลา", type: "rajabhat" },
  { id: "rb-19", name: "Suratthani Rajabhat University", name_th: "มหาวิทยาลัยราชภัฏสุราษฎร์ธานี", type: "rajabhat" },
  { id: "rb-20", name: "Chiang Mai Rajabhat University", name_th: "มหาวิทยาลัยราชภัฏเชียงใหม่", type: "rajabhat" },
  { id: "rb-21", name: "Chiang Rai Rajabhat University", name_th: "มหาวิทยาลัยราชภัฏเชียงราย", type: "rajabhat" },
  { id: "rb-22", name: "Lampang Rajabhat University", name_th: "มหาวิทยาลัยราชภัฏลำปาง", type: "rajabhat" },
  { id: "rb-23", name: "Uttaradit Rajabhat University", name_th: "มหาวิทยาลัยราชภัฏอุตรดิตถ์", type: "rajabhat" },
  { id: "rb-24", name: "Pibulsongkram Rajabhat University", name_th: "มหาวิทยาลัยราชภัฏพิบูลสงคราม", type: "rajabhat" },
  { id: "rb-25", name: "Kamphaeng Phet Rajabhat University", name_th: "มหาวิทยาลัยราชภัฏกำแพงเพชร", type: "rajabhat" },
  { id: "rb-26", name: "Nakhon Sawan Rajabhat University", name_th: "มหาวิทยาลัยราชภัฏนครสวรรค์", type: "rajabhat" },
  { id: "rb-27", name: "Phetchabun Rajabhat University", name_th: "มหาวิทยาลัยราชภัฏเพชรบูรณ์", type: "rajabhat" },
  { id: "rb-28", name: "Loei Rajabhat University", name_th: "มหาวิทยาลัยราชภัฏเลย", type: "rajabhat" },
  { id: "rb-29", name: "Sakon Nakhon Rajabhat University", name_th: "มหาวิทยาลัยราชภัฏสกลนคร", type: "rajabhat" },
  { id: "rb-30", name: "Udon Thani Rajabhat University", name_th: "มหาวิทยาลัยราชภัฏอุดรธานี", type: "rajabhat" },
  { id: "rb-31", name: "Nakhon Ratchasima Rajabhat University", name_th: "มหาวิทยาลัยราชภัฏนครราชสีมา", type: "rajabhat" },
  { id: "rb-32", name: "Buriram Rajabhat University", name_th: "มหาวิทยาลัยราชภัฏบุรีรัมย์", type: "rajabhat" },
  { id: "rb-33", name: "Chaiyaphum Rajabhat University", name_th: "มหาวิทยาลัยราชภัฏชัยภูมิ", type: "rajabhat" },
  { id: "rb-34", name: "Maha Sarakham Rajabhat University", name_th: "มหาวิทยาลัยราชภัฏมหาสารคาม", type: "rajabhat" },
  { id: "rb-35", name: "Roi Et Rajabhat University", name_th: "มหาวิทยาลัยราชภัฏร้อยเอ็ด", type: "rajabhat" },
  { id: "rb-36", name: "Sisaket Rajabhat University", name_th: "มหาวิทยาลัยราชภัฏศรีสะเกษ", type: "rajabhat" },
  { id: "rb-37", name: "Surin Rajabhat University", name_th: "มหาวิทยาลัยราชภัฏสุรินทร์", type: "rajabhat" },
  { id: "rb-38", name: "Ubon Ratchathani Rajabhat University", name_th: "มหาวิทยาลัยราชภัฏอุบลราชธานี", type: "rajabhat" },

  // ==========================================
  // RAJAMANGALA UNIVERSITIES OF TECHNOLOGY
  // ==========================================
  { id: "rm-01", name: "Rajamangala University of Technology Thanyaburi", name_th: "มหาวิทยาลัยเทคโนโลยีราชมงคลธัญบุรี", type: "rajamangala" },
  { id: "rm-02", name: "Rajamangala University of Technology Krungthep", name_th: "มหาวิทยาลัยเทคโนโลยีราชมงคลกรุงเทพ", type: "rajamangala" },
  { id: "rm-03", name: "Rajamangala University of Technology Phra Nakhon", name_th: "มหาวิทยาลัยเทคโนโลยีราชมงคลพระนคร", type: "rajamangala" },
  { id: "rm-04", name: "Rajamangala University of Technology Rattanakosin", name_th: "มหาวิทยาลัยเทคโนโลยีราชมงคลรัตนโกสินทร์", type: "rajamangala" },
  { id: "rm-05", name: "Rajamangala University of Technology Lanna", name_th: "มหาวิทยาลัยเทคโนโลยีราชมงคลล้านนา", type: "rajamangala" },
  { id: "rm-06", name: "Rajamangala University of Technology Isan", name_th: "มหาวิทยาลัยเทคโนโลยีราชมงคลอีสาน", type: "rajamangala" },
  { id: "rm-07", name: "Rajamangala University of Technology Srivijaya", name_th: "มหาวิทยาลัยเทคโนโลยีราชมงคลศรีวิชัย", type: "rajamangala" },
  { id: "rm-08", name: "Rajamangala University of Technology Suvarnabhumi", name_th: "มหาวิทยาลัยเทคโนโลยีราชมงคลสุวรรณภูมิ", type: "rajamangala" },
  { id: "rm-09", name: "Rajamangala University of Technology Tawan-ok", name_th: "มหาวิทยาลัยเทคโนโลยีราชมงคลตะวันออก", type: "rajamangala" },

  // ==========================================
  // PRIVATE UNIVERSITIES
  // ==========================================
  { id: "pr-01", name: "Assumption University (ABAC)", name_th: "มหาวิทยาลัยอัสสัมชัญ", type: "private" },
  { id: "pr-02", name: "Bangkok University", name_th: "มหาวิทยาลัยกรุงเทพ", type: "private" },
  { id: "pr-03", name: "Rangsit University", name_th: "มหาวิทยาลัยรังสิต", type: "private" },
  { id: "pr-04", name: "Sripatum University", name_th: "มหาวิทยาลัยศรีปทุม", type: "private" },
  { id: "pr-05", name: "Dhurakij Pundit University", name_th: "มหาวิทยาลัยธุรกิจบัณฑิตย์", type: "private" },
  { id: "pr-06", name: "University of the Thai Chamber of Commerce (UTCC)", name_th: "มหาวิทยาลัยหอการค้าไทย", type: "private" },
  { id: "pr-07", name: "Huachiew Chalermprakiet University", name_th: "มหาวิทยาลัยหัวเฉียวเฉลิมพระเกียรติ", type: "private" },
  { id: "pr-08", name: "Stamford International University", name_th: "มหาวิทยาลัยนานาชาติสแตมฟอร์ด", type: "private" },
  { id: "pr-09", name: "Webster University Thailand", name_th: "มหาวิทยาลัยเว็บสเตอร์ ประเทศไทย", type: "private" },
  { id: "pr-10", name: "Panyapiwat Institute of Management (PIM)", name_th: "สถาบันการจัดการปัญญาภิวัฒน์", type: "private" },
  { id: "pr-11", name: "Siam University", name_th: "มหาวิทยาลัยสยาม", type: "private" },
  { id: "pr-12", name: "Krirk University", name_th: "มหาวิทยาลัยเกริก", type: "private" },
  { id: "pr-13", name: "Payap University", name_th: "มหาวิทยาลัยพายัพ", type: "private" },
  { id: "pr-14", name: "North-Chiang Mai University", name_th: "มหาวิทยาลัยนอร์ท-เชียงใหม่", type: "private" },
  { id: "pr-15", name: "Kasem Bundit University", name_th: "มหาวิทยาลัยเกษมบัณฑิต", type: "private" },
  { id: "pr-16", name: "Southeast Asia University", name_th: "มหาวิทยาลัยเอเชียอาคเนย์", type: "private" },
  { id: "pr-17", name: "Saint John's University", name_th: "มหาวิทยาลัยเซนต์จอห์น", type: "private" },
  { id: "pr-18", name: "Shinawatra University", name_th: "มหาวิทยาลัยชินวัตร", type: "private" },
  { id: "pr-19", name: "Eastern Asia University", name_th: "มหาวิทยาลัยอีสเทิร์นเอเชีย", type: "private" },
  { id: "pr-20", name: "Rattana Bundit University", name_th: "มหาวิทยาลัยรัตนบัณฑิต", type: "private" },
  { id: "pr-21", name: "Thai-Nichi Institute of Technology (TNI)", name_th: "สถาบันเทคโนโลยีไทย-ญี่ปุ่น", type: "private" },
  { id: "pr-22", name: "CMKL University", name_th: "มหาวิทยาลัยซีเอ็มเคแอล", type: "private" },
  { id: "pr-23", name: "Mahanakorn University of Technology", name_th: "มหาวิทยาลัยเทคโนโลยีมหานคร", type: "private" },
  { id: "pr-24", name: "Asia-Pacific International University", name_th: "มหาวิทยาลัยนานาชาติเอเชีย-แปซิฟิก", type: "private" },
  { id: "pr-25", name: "Asian University", name_th: "มหาวิทยาลัยเอเชียน", type: "private" },
  { id: "pr-26", name: "Bangkokthonburi University", name_th: "มหาวิทยาลัยกรุงเทพธนบุรี", type: "private" },
  { id: "pr-27", name: "Christian University of Thailand", name_th: "มหาวิทยาลัยคริสเตียน", type: "private" },
  { id: "pr-28", name: "Chaopraya University", name_th: "มหาวิทยาลัยเจ้าพระยา", type: "private" },
  { id: "pr-29", name: "Hatyai University", name_th: "มหาวิทยาลัยหาดใหญ่", type: "private" },
  { id: "pr-30", name: "North Eastern University", name_th: "มหาวิทยาลัยภาคตะวันออกเฉียงเหนือ", type: "private" },
  { id: "pr-31", name: "Pathumthani University", name_th: "มหาวิทยาลัยปทุมธานี", type: "private" },
  { id: "pr-32", name: "Ratchathani University", name_th: "มหาวิทยาลัยราชธานี", type: "private" },
  { id: "pr-33", name: "The Far Eastern University", name_th: "มหาวิทยาลัยฟาร์อีสเทอร์น", type: "private" },
  { id: "pr-34", name: "Vongchavalitkul University", name_th: "มหาวิทยาลัยวงษ์ชวลิตกุล", type: "private" },
  { id: "pr-35", name: "Western University", name_th: "มหาวิทยาลัยเวสเทิร์น", type: "private" },
  { id: "pr-36", name: "Fatoni University", name_th: "มหาวิทยาลัยฟาฏอนี", type: "private" },
  { id: "pr-37", name: "Nation University", name_th: "มหาวิทยาลัยเนชั่น", type: "private" },
  { id: "pr-38", name: "Thonburi University", name_th: "มหาวิทยาลัยธนบุรี", type: "private" },
  { id: "pr-39", name: "North Bangkok University", name_th: "มหาวิทยาลัยนอร์ทกรุงเทพ", type: "private" },
  { id: "pr-40", name: "The Eastern University of Management and Technology", name_th: "มหาวิทยาลัยการจัดการและเทคโนโลยีอีสเทิร์น", type: "private" },
  { id: "pr-41", name: "The University of Central Thailand", name_th: "มหาวิทยาลัยเซ็นทรัลไทย", type: "private" },

  // ==========================================
  // INTERGOVERNMENTAL / SPECIAL INSTITUTES
  // ==========================================
  { id: "in-01", name: "Asian Institute of Technology (AIT)", name_th: "สถาบันเทคโนโลยีแห่งเอเชีย", type: "institute" },
  { id: "in-02", name: "Amata University", name_th: "มหาวิทยาลัยอมตะ", type: "institute" },
  { id: "in-03", name: "Bunditpatanasilpa Institute", name_th: "สถาบันบัณฑิตพัฒนศิลป์", type: "institute" },
  { id: "in-04", name: "Thailand National Sports University", name_th: "มหาวิทยาลัยการกีฬาแห่งชาติ", type: "institute" },
];

export function searchUniversities(query: string): ThaiUniversity[] {
  if (!query.trim()) return thaiUniversities;

  const q = query.toLowerCase().trim();
  return thaiUniversities.filter(
    (uni) =>
      uni.name.toLowerCase().includes(q) ||
      uni.name_th.includes(query),
  );
}
