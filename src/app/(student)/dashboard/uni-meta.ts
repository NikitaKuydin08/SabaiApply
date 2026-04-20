/**
 * Static overlay of university information not yet represented in the DB schema.
 * Keyed by the exact `name` column in `universities`.
 *
 * When columns for these fields are added to the DB, delete this file and read
 * from the university row instead.
 */

export interface UniversityMeta {
  admissionsEmail?: string;
  admissionsPhone?: string;
  address?: string;
  aboutUrl?: string;
  admissionsUrl?: string;
  financialAidUrl?: string;
  virtualTourUrl?: string;
  campusMapUrl?: string;
  facebookUrl?: string;
  instagramUrl?: string;
  twitterUrl?: string;
  youtubeUrl?: string;
  mediumUrl?: string;
  messengerUrl?: string;
}

const META: Record<string, UniversityMeta> = {
  "King Mongkut's Institute of Technology Ladkrabang (KMITL)": {
    admissionsEmail: "saraban@kmitl.ac.th",
    address: "1 Chalong Krung, 1 Alley, Lat Krabang, Bangkok 10520",
    facebookUrl: "https://www.facebook.com/kmitlofficial",
    instagramUrl: "https://www.instagram.com/kmitlofficial",
    twitterUrl: "https://twitter.com/Kmitlofficial",
    youtubeUrl: "https://www.youtube.com/user/prKMITL",
    messengerUrl: "https://m.me/kmitlofficial",
  },
  "CMKL University": {
    admissionsPhone: "+66 65 878 5000",
    address: "1 Soi Chalongkrung 1, Ladkrabang. Bangkok 10520 Thailand",
    aboutUrl: "https://cmkl.ac.th/about-us",
    campusMapUrl: "https://maps.app.goo.gl/rk3XeoB7ZE8GGbtq5",
    facebookUrl: "https://www.facebook.com/CMKLUniversity/",
    instagramUrl: "https://www.instagram.com/cmkluniversity/",
    youtubeUrl: "https://www.youtube.com/channel/UCwVAV3N5iTM66k9DhFwahrg",
    mediumUrl: "https://medium.com/cmkl-university",
  },
};

export function getUniMeta(name: string): UniversityMeta {
  return META[name] ?? {};
}
