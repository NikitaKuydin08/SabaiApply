// Complete list of Thai universities
// Sources: Wikipedia, MHESI, CUPT

export interface ThaiUniversity {
  name: string;
  name_th: string;
  type: "public" | "private" | "rajabhat" | "rajamangala" | "autonomous" | "institute";
}

export const thaiUniversities: ThaiUniversity[] = [
  // ==========================================
  // AUTONOMOUS UNIVERSITIES
  // ==========================================
  { name: "Chulalongkorn University", name_th: "จุฬาลงกรณ์มหาวิทยาลัย", type: "autonomous" },
  { name: "Thammasat University", name_th: "มหาวิทยาลัยธรรมศาสตร์", type: "autonomous" },
  { name: "Kasetsart University", name_th: "มหาวิทยาลัยเกษตรศาสตร์", type: "autonomous" },
  { name: "Mahidol University", name_th: "มหาวิทยาลัยมหิดล", type: "autonomous" },
  { name: "King Mongkut's Institute of Technology Ladkrabang (KMITL)", name_th: "สถาบันเทคโนโลยีพระจอมเกล้าเจ้าคุณทหารลาดกระบัง", type: "autonomous" },
  { name: "King Mongkut's University of Technology Thonburi (KMUTT)", name_th: "มหาวิทยาลัยเทคโนโลยีพระจอมเกล้าธนบุรี", type: "autonomous" },
  { name: "King Mongkut's University of Technology North Bangkok (KMUTNB)", name_th: "มหาวิทยาลัยเทคโนโลยีพระจอมเกล้าพระนครเหนือ", type: "autonomous" },
  { name: "Chiang Mai University", name_th: "มหาวิทยาลัยเชียงใหม่", type: "autonomous" },
  { name: "Khon Kaen University", name_th: "มหาวิทยาลัยขอนแก่น", type: "autonomous" },
  { name: "Prince of Songkla University", name_th: "มหาวิทยาลัยสงขลานครินทร์", type: "autonomous" },
  { name: "Srinakharinwirot University", name_th: "มหาวิทยาลัยศรีนครินทรวิโรฒ", type: "autonomous" },
  { name: "Silpakorn University", name_th: "มหาวิทยาลัยศิลปากร", type: "autonomous" },
  { name: "Burapha University", name_th: "มหาวิทยาลัยบูรพา", type: "autonomous" },
  { name: "Naresuan University", name_th: "มหาวิทยาลัยนเรศวร", type: "autonomous" },
  { name: "Maejo University", name_th: "มหาวิทยาลัยแม่โจ้", type: "autonomous" },
  { name: "Mae Fah Luang University", name_th: "มหาวิทยาลัยแม่ฟ้าหลวง", type: "autonomous" },
  { name: "Thaksin University", name_th: "มหาวิทยาลัยทักษิณ", type: "autonomous" },
  { name: "Walailak University", name_th: "มหาวิทยาลัยวลัยลักษณ์", type: "autonomous" },
  { name: "Suranaree University of Technology", name_th: "มหาวิทยาลัยเทคโนโลยีสุรนารี", type: "autonomous" },
  { name: "Ubon Ratchathani University", name_th: "มหาวิทยาลัยอุบลราชธานี", type: "autonomous" },
  { name: "University of Phayao", name_th: "มหาวิทยาลัยพะเยา", type: "autonomous" },
  { name: "Suan Dusit University", name_th: "มหาวิทยาลัยสวนดุสิต", type: "autonomous" },
  { name: "National Institute of Development Administration (NIDA)", name_th: "สถาบันบัณฑิตพัฒนบริหารศาสตร์", type: "autonomous" },
  { name: "Navamindradhiraj University", name_th: "มหาวิทยาลัยนวมินทราธิราช", type: "autonomous" },
  { name: "Chulabhorn Graduate Institute", name_th: "สถาบันบัณฑิตศึกษาจุฬาภรณ์", type: "autonomous" },
  { name: "Princess Galyani Vadhana Institute of Music", name_th: "สถาบันดนตรีกัลยาณิวัฒนา", type: "autonomous" },
  { name: "Mahachulalongkornrajavidyalaya University", name_th: "มหาวิทยาลัยมหาจุฬาลงกรณราชวิทยาลัย", type: "autonomous" },
  { name: "Mahamakut Buddhist University", name_th: "มหาวิทยาลัยมหามกุฏราชวิทยาลัย", type: "autonomous" },
  { name: "Chitralada Technology Institute", name_th: "สถาบันเทคโนโลยีจิตรลดา", type: "autonomous" },

  // ==========================================
  // PUBLIC UNIVERSITIES (Non-Autonomous)
  // ==========================================
  { name: "Mahasarakham University", name_th: "มหาวิทยาลัยมหาสารคาม", type: "public" },
  { name: "Ramkhamhaeng University", name_th: "มหาวิทยาลัยรามคำแหง", type: "public" },
  { name: "Sukhothai Thammathirat Open University", name_th: "มหาวิทยาลัยสุโขทัยธรรมาธิราช", type: "public" },
  { name: "Kalasin University", name_th: "มหาวิทยาลัยกาฬสินธุ์", type: "public" },
  { name: "Nakhon Phanom University", name_th: "มหาวิทยาลัยนครพนม", type: "public" },
  { name: "Princess of Naradhiwas University", name_th: "มหาวิทยาลัยนราธิวาสราชนครินทร์", type: "public" },
  { name: "Pathumwan Institute of Technology", name_th: "สถาบันเทคโนโลยีปทุมวัน", type: "public" },

  // ==========================================
  // RAJABHAT UNIVERSITIES (38+)
  // ==========================================
  { name: "Suan Sunandha Rajabhat University", name_th: "มหาวิทยาลัยราชภัฏสวนสุนันทา", type: "rajabhat" },
  { name: "Phranakhon Rajabhat University", name_th: "มหาวิทยาลัยราชภัฏพระนคร", type: "rajabhat" },
  { name: "Chandrakasem Rajabhat University", name_th: "มหาวิทยาลัยราชภัฏจันทรเกษม", type: "rajabhat" },
  { name: "Bansomdejchaopraya Rajabhat University", name_th: "มหาวิทยาลัยราชภัฏบ้านสมเด็จเจ้าพระยา", type: "rajabhat" },
  { name: "Dhonburi Rajabhat University", name_th: "มหาวิทยาลัยราชภัฏธนบุรี", type: "rajabhat" },
  { name: "Valaya Alongkorn Rajabhat University", name_th: "มหาวิทยาลัยราชภัฏวไลยอลงกรณ์", type: "rajabhat" },
  { name: "Phranakhon Si Ayutthaya Rajabhat University", name_th: "มหาวิทยาลัยราชภัฏพระนครศรีอยุธยา", type: "rajabhat" },
  { name: "Rambhai Barni Rajabhat University", name_th: "มหาวิทยาลัยราชภัฏรำไพพรรณี", type: "rajabhat" },
  { name: "Rajanagarindra Rajabhat University", name_th: "มหาวิทยาลัยราชภัฏราชนครินทร์", type: "rajabhat" },
  { name: "Thepsatri Rajabhat University", name_th: "มหาวิทยาลัยราชภัฏเทพสตรี", type: "rajabhat" },
  { name: "Muban Chombueng Rajabhat University", name_th: "มหาวิทยาลัยราชภัฏหมู่บ้านจอมบึง", type: "rajabhat" },
  { name: "Nakhon Pathom Rajabhat University", name_th: "มหาวิทยาลัยราชภัฏนครปฐม", type: "rajabhat" },
  { name: "Kanchanaburi Rajabhat University", name_th: "มหาวิทยาลัยราชภัฏกาญจนบุรี", type: "rajabhat" },
  { name: "Phetchaburi Rajabhat University", name_th: "มหาวิทยาลัยราชภัฏเพชรบุรี", type: "rajabhat" },
  { name: "Phuket Rajabhat University", name_th: "มหาวิทยาลัยราชภัฏภูเก็ต", type: "rajabhat" },
  { name: "Nakhon Si Thammarat Rajabhat University", name_th: "มหาวิทยาลัยราชภัฏนครศรีธรรมราช", type: "rajabhat" },
  { name: "Songkhla Rajabhat University", name_th: "มหาวิทยาลัยราชภัฏสงขลา", type: "rajabhat" },
  { name: "Yala Rajabhat University", name_th: "มหาวิทยาลัยราชภัฏยะลา", type: "rajabhat" },
  { name: "Suratthani Rajabhat University", name_th: "มหาวิทยาลัยราชภัฏสุราษฎร์ธานี", type: "rajabhat" },
  { name: "Chiang Mai Rajabhat University", name_th: "มหาวิทยาลัยราชภัฏเชียงใหม่", type: "rajabhat" },
  { name: "Chiang Rai Rajabhat University", name_th: "มหาวิทยาลัยราชภัฏเชียงราย", type: "rajabhat" },
  { name: "Lampang Rajabhat University", name_th: "มหาวิทยาลัยราชภัฏลำปาง", type: "rajabhat" },
  { name: "Uttaradit Rajabhat University", name_th: "มหาวิทยาลัยราชภัฏอุตรดิตถ์", type: "rajabhat" },
  { name: "Pibulsongkram Rajabhat University", name_th: "มหาวิทยาลัยราชภัฏพิบูลสงคราม", type: "rajabhat" },
  { name: "Kamphaeng Phet Rajabhat University", name_th: "มหาวิทยาลัยราชภัฏกำแพงเพชร", type: "rajabhat" },
  { name: "Nakhon Sawan Rajabhat University", name_th: "มหาวิทยาลัยราชภัฏนครสวรรค์", type: "rajabhat" },
  { name: "Phetchabun Rajabhat University", name_th: "มหาวิทยาลัยราชภัฏเพชรบูรณ์", type: "rajabhat" },
  { name: "Loei Rajabhat University", name_th: "มหาวิทยาลัยราชภัฏเลย", type: "rajabhat" },
  { name: "Sakon Nakhon Rajabhat University", name_th: "มหาวิทยาลัยราชภัฏสกลนคร", type: "rajabhat" },
  { name: "Udon Thani Rajabhat University", name_th: "มหาวิทยาลัยราชภัฏอุดรธานี", type: "rajabhat" },
  { name: "Nakhon Ratchasima Rajabhat University", name_th: "มหาวิทยาลัยราชภัฏนครราชสีมา", type: "rajabhat" },
  { name: "Buriram Rajabhat University", name_th: "มหาวิทยาลัยราชภัฏบุรีรัมย์", type: "rajabhat" },
  { name: "Chaiyaphum Rajabhat University", name_th: "มหาวิทยาลัยราชภัฏชัยภูมิ", type: "rajabhat" },
  { name: "Maha Sarakham Rajabhat University", name_th: "มหาวิทยาลัยราชภัฏมหาสารคาม", type: "rajabhat" },
  { name: "Roi Et Rajabhat University", name_th: "มหาวิทยาลัยราชภัฏร้อยเอ็ด", type: "rajabhat" },
  { name: "Sisaket Rajabhat University", name_th: "มหาวิทยาลัยราชภัฏศรีสะเกษ", type: "rajabhat" },
  { name: "Surin Rajabhat University", name_th: "มหาวิทยาลัยราชภัฏสุรินทร์", type: "rajabhat" },
  { name: "Ubon Ratchathani Rajabhat University", name_th: "มหาวิทยาลัยราชภัฏอุบลราชธานี", type: "rajabhat" },

  // ==========================================
  // RAJAMANGALA UNIVERSITIES OF TECHNOLOGY (9)
  // ==========================================
  { name: "Rajamangala University of Technology Thanyaburi", name_th: "มหาวิทยาลัยเทคโนโลยีราชมงคลธัญบุรี", type: "rajamangala" },
  { name: "Rajamangala University of Technology Krungthep", name_th: "มหาวิทยาลัยเทคโนโลยีราชมงคลกรุงเทพ", type: "rajamangala" },
  { name: "Rajamangala University of Technology Phra Nakhon", name_th: "มหาวิทยาลัยเทคโนโลยีราชมงคลพระนคร", type: "rajamangala" },
  { name: "Rajamangala University of Technology Rattanakosin", name_th: "มหาวิทยาลัยเทคโนโลยีราชมงคลรัตนโกสินทร์", type: "rajamangala" },
  { name: "Rajamangala University of Technology Lanna", name_th: "มหาวิทยาลัยเทคโนโลยีราชมงคลล้านนา", type: "rajamangala" },
  { name: "Rajamangala University of Technology Isan", name_th: "มหาวิทยาลัยเทคโนโลยีราชมงคลอีสาน", type: "rajamangala" },
  { name: "Rajamangala University of Technology Srivijaya", name_th: "มหาวิทยาลัยเทคโนโลยีราชมงคลศรีวิชัย", type: "rajamangala" },
  { name: "Rajamangala University of Technology Suvarnabhumi", name_th: "มหาวิทยาลัยเทคโนโลยีราชมงคลสุวรรณภูมิ", type: "rajamangala" },
  { name: "Rajamangala University of Technology Tawan-ok", name_th: "มหาวิทยาลัยเทคโนโลยีราชมงคลตะวันออก", type: "rajamangala" },

  // ==========================================
  // PRIVATE UNIVERSITIES
  // ==========================================
  { name: "Assumption University (ABAC)", name_th: "มหาวิทยาลัยอัสสัมชัญ", type: "private" },
  { name: "Bangkok University", name_th: "มหาวิทยาลัยกรุงเทพ", type: "private" },
  { name: "Rangsit University", name_th: "มหาวิทยาลัยรังสิต", type: "private" },
  { name: "Sripatum University", name_th: "มหาวิทยาลัยศรีปทุม", type: "private" },
  { name: "Dhurakij Pundit University", name_th: "มหาวิทยาลัยธุรกิจบัณฑิตย์", type: "private" },
  { name: "University of the Thai Chamber of Commerce (UTCC)", name_th: "มหาวิทยาลัยหอการค้าไทย", type: "private" },
  { name: "Huachiew Chalermprakiet University", name_th: "มหาวิทยาลัยหัวเฉียวเฉลิมพระเกียรติ", type: "private" },
  { name: "Stamford International University", name_th: "มหาวิทยาลัยนานาชาติแสตมฟอร์ด", type: "private" },
  { name: "Webster University Thailand", name_th: "มหาวิทยาลัยเว็บสเตอร์ ประเทศไทย", type: "private" },
  { name: "Panyapiwat Institute of Management (PIM)", name_th: "สถาบันการจัดการปัญญาภิวัฒน์", type: "private" },
  { name: "Siam University", name_th: "มหาวิทยาลัยสยาม", type: "private" },
  { name: "Krirk University", name_th: "มหาวิทยาลัยเกริก", type: "private" },
  { name: "Payap University", name_th: "มหาวิทยาลัยพายัพ", type: "private" },
  { name: "North-Chiang Mai University", name_th: "มหาวิทยาลัยนอร์ท-เชียงใหม่", type: "private" },
  { name: "Kasem Bundit University", name_th: "มหาวิทยาลัยเกษมบัณฑิต", type: "private" },
  { name: "Southeast Asia University", name_th: "มหาวิทยาลัยเอเชียอาคเนย์", type: "private" },
  { name: "Saint John's University", name_th: "มหาวิทยาลัยเซนต์จอห์น", type: "private" },
  { name: "Shinawatra University", name_th: "มหาวิทยาลัยชินวัตร", type: "private" },
  { name: "Eastern Asia University", name_th: "มหาวิทยาลัยอีสเทิร์นเอเชีย", type: "private" },
  { name: "Rattana Bundit University", name_th: "มหาวิทยาลัยรัตนบัณฑิต", type: "private" },
  { name: "Thai-Nichi Institute of Technology (TNI)", name_th: "สถาบันเทคโนโลยีไทย-ญี่ปุ่น", type: "private" },
  { name: "CMKL University", name_th: "มหาวิทยาลัยซีเอ็มเคแอล", type: "private" },
  { name: "Mahanakorn University of Technology", name_th: "มหาวิทยาลัยเทคโนโลยีมหานคร", type: "private" },
  { name: "Asia-Pacific International University", name_th: "มหาวิทยาลัยนานาชาติเอเชีย-แปซิฟิก", type: "private" },
  { name: "Asian University", name_th: "มหาวิทยาลัยเอเชียน", type: "private" },
  { name: "Bangkokthonburi University", name_th: "มหาวิทยาลัยกรุงเทพธนบุรี", type: "private" },
  { name: "Christian University of Thailand", name_th: "มหาวิทยาลัยคริสเตียน", type: "private" },
  { name: "Chaopraya University", name_th: "มหาวิทยาลัยเจ้าพระยา", type: "private" },
  { name: "Hatyai University", name_th: "มหาวิทยาลัยหาดใหญ่", type: "private" },
  { name: "North Eastern University", name_th: "มหาวิทยาลัยภาคตะวันออกเฉียงเหนือ", type: "private" },
  { name: "Pathumthani University", name_th: "มหาวิทยาลัยปทุมธานี", type: "private" },
  { name: "Ratchathani University", name_th: "มหาวิทยาลัยราชธานี", type: "private" },
  { name: "The Far Eastern University", name_th: "มหาวิทยาลัยฟาร์อีสเทอร์น", type: "private" },
  { name: "Vongchavalitkul University", name_th: "มหาวิทยาลัยวงษ์ชวลิตกุล", type: "private" },
  { name: "Western University", name_th: "มหาวิทยาลัยเวสเทิร์น", type: "private" },
  { name: "Fatoni University", name_th: "มหาวิทยาลัยฟาฏอนี", type: "private" },
  { name: "Nation University", name_th: "มหาวิทยาลัยเนชั่น", type: "private" },
  { name: "Thonburi University", name_th: "มหาวิทยาลัยธนบุรี", type: "private" },
  { name: "North Bangkok University", name_th: "มหาวิทยาลัยนอร์ทกรุงเทพ", type: "private" },
  { name: "The Eastern University of Management and Technology", name_th: "มหาวิทยาลัยการจัดการและเทคโนโลยีอีสเทิร์น", type: "private" },
  { name: "The University of Central Thailand", name_th: "มหาวิทยาลัยเซ็นทรัลไทย", type: "private" },

  // ==========================================
  // INTERGOVERNMENTAL / SPECIAL INSTITUTES
  // ==========================================
  { name: "Asian Institute of Technology (AIT)", name_th: "สถาบันเทคโนโลยีแห่งเอเชีย", type: "institute" },
  { name: "Amata University", name_th: "มหาวิทยาลัยอมตะ", type: "institute" },
  { name: "Bunditpatanasilpa Institute", name_th: "สถาบันบัณฑิตพัฒนศิลป์", type: "institute" },
  { name: "Thailand National Sports University", name_th: "มหาวิทยาลัยการกีฬาแห่งชาติ", type: "institute" },
];

export function searchUniversities(query: string): ThaiUniversity[] {
  if (!query.trim()) return thaiUniversities;

  const q = query.toLowerCase().trim();
  return thaiUniversities.filter(
    (uni) =>
      uni.name.toLowerCase().includes(q) ||
      uni.name_th.includes(query)
  );
}
