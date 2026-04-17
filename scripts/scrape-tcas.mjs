#!/usr/bin/env node
/**
 * Scrape TCAS course data for specific universities and output
 * seed-ready JSON for the SabaiApply database.
 *
 * Usage:
 *   node scripts/scrape-tcas.mjs
 *
 * Output:
 *   scripts/seed-data/kmitl.json
 *   scripts/seed-data/cmkl.json (if found)
 */
import { writeFileSync, mkdirSync } from "fs";
import { execSync } from "child_process";

const COURSES_URL =
  "https://my-tcas.s3.ap-southeast-1.amazonaws.com/mytcas/courses.json";

// University IDs to scrape (from TCAS)
// KMITL = 016, CMKL doesn't appear to have its own TCAS ID (it's under KMITL or separate)
const TARGET_UNIVERSITIES = {
  "016": "kmitl",
};

async function main() {
  console.log("Downloading TCAS courses database...");

  // Download and decompress
  const raw = execSync(`curl -s --compressed "${COURSES_URL}?ts=${Date.now()}"`, {
    maxBuffer: 50 * 1024 * 1024,
  });
  const allCourses = JSON.parse(raw.toString());
  console.log(`Total programs in TCAS: ${allCourses.length}`);

  mkdirSync("scripts/seed-data", { recursive: true });

  for (const [uniId, filename] of Object.entries(TARGET_UNIVERSITIES)) {
    const programs = allCourses.filter((c) => c.university_id === uniId);
    console.log(`\n=== ${programs[0]?.university_name_en || uniId} ===`);
    console.log(`Programs found: ${programs.length}`);

    // Build university object
    const university = {
      name: programs[0]?.university_name_en,
      name_th: programs[0]?.university_name_th,
      website: getWebsite(uniId),
    };

    // Group by faculty
    const facultyMap = new Map();
    for (const p of programs) {
      const key = p.faculty_id;
      if (!facultyMap.has(key)) {
        facultyMap.set(key, {
          faculty_id: p.faculty_id,
          name: p.faculty_name_en,
          name_th: p.faculty_name_th,
          programs: [],
        });
      }

      // Parse tuition from cost string
      const tuition = parseTuition(p.cost);

      facultyMap.get(key).programs.push({
        program_id_tcas: p.program_id,
        name: p.program_name_en,
        name_th: p.program_name_th,
        degree_type: parseDegreeType(p.program_name_en, p.program_type_name_th),
        is_international: p.program_type_name_th?.includes("นานาชาติ") || false,
        program_type: p.program_type_name_th,
        tuition_per_semester: tuition,
        tuition_raw: p.cost,
        seats_round_1: null, // Not in this dataset — need admission announcements
        number_acceptance_mko2: p.number_acceptance_mko2,
        field: p.field_name_en,
        field_th: p.field_name_th,
        group_field: p.group_field_th,
        graduate_rate: p.graduate_rate,
      });
    }

    // Build output
    const faculties = [...facultyMap.values()];
    faculties.sort((a, b) => a.faculty_id.localeCompare(b.faculty_id));

    const output = {
      _meta: {
        source: "TCAS69 (mytcas.com)",
        scraped_at: new Date().toISOString(),
        total_faculties: faculties.length,
        total_programs: programs.length,
      },
      university,
      faculties,
    };

    const outPath = `scripts/seed-data/${filename}.json`;
    writeFileSync(outPath, JSON.stringify(output, null, 2));
    console.log(`Written to ${outPath}`);

    // Print summary
    for (const f of faculties) {
      console.log(`  ${f.name_th} (${f.name}) — ${f.programs.length} programs`);
    }
  }

  console.log("\nDone!");
}

function parseTuition(costStr) {
  if (!costStr) return null;
  // Try to extract first number from cost string
  const match = costStr.match(/([\d,]+)\s*(ต่อภาคการศึกษา|บาท)/);
  if (match) {
    return parseInt(match[1].replace(/,/g, ""), 10);
  }
  // Try "ภาคการศึกษาละ X บาท"
  const match2 = costStr.match(/ภาคการศึกษาละ\s*([\d,]+)\s*บาท/);
  if (match2) {
    return parseInt(match2[1].replace(/,/g, ""), 10);
  }
  return null;
}

function parseDegreeType(nameEn, typeNameTh) {
  if (!nameEn) return "bachelor";
  const n = nameEn.toLowerCase();
  if (n.includes("doctor") || n.includes("ph.d")) return "doctorate";
  if (n.includes("master") || n.includes("m.sc") || n.includes("m.eng")) return "master";
  return "bachelor";
}

function getWebsite(uniId) {
  const map = {
    "016": "https://www.kmitl.ac.th",
  };
  return map[uniId] || null;
}

main().catch(console.error);
