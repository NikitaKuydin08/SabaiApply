#!/usr/bin/env node
/**
 * Seed KMITL university, faculties, and programs into Supabase.
 *
 * Usage:
 *   node scripts/seed-kmitl.mjs
 *
 * Requires: NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY in .env.local
 * Also requires a service role key for inserting without RLS restrictions.
 * If you don't have a service role key, set SUPABASE_SERVICE_ROLE_KEY in .env.local
 * or use the anon key (requires RLS to allow inserts for your admin user).
 */
import { createClient } from "@supabase/supabase-js";
import { readFileSync } from "fs";
import { config } from "dotenv";

// Load .env.local
config({ path: ".env.local" });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey =
  process.env.SUPABASE_SERVICE_ROLE_KEY ||
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error("Missing SUPABASE env vars in .env.local");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function seed() {
  const data = JSON.parse(readFileSync("scripts/seed-data/kmitl.json", "utf-8"));
  const { university, faculties } = data;

  console.log(`Seeding ${university.name}...`);
  console.log(`  ${faculties.length} faculties, ${faculties.reduce((s, f) => s + f.programs.length, 0)} programs`);

  // 1. Upsert university
  // Check if already exists by name
  const { data: existingUni } = await supabase
    .from("universities")
    .select("id")
    .eq("name", university.name)
    .single();

  let universityId;

  if (existingUni) {
    universityId = existingUni.id;
    console.log(`  University already exists (${universityId}), updating...`);
    await supabase
      .from("universities")
      .update({
        name_th: university.name_th,
        website: university.website,
      })
      .eq("id", universityId);
  } else {
    const { data: newUni, error: uniErr } = await supabase
      .from("universities")
      .insert({
        name: university.name,
        name_th: university.name_th,
        website: university.website,
      })
      .select("id")
      .single();

    if (uniErr) {
      console.error("Failed to insert university:", uniErr.message);
      process.exit(1);
    }
    universityId = newUni.id;
    console.log(`  Created university (${universityId})`);
  }

  // 2. Seed faculties and programs
  let totalPrograms = 0;

  for (const faculty of faculties) {
    // Check if faculty exists
    const { data: existingFac } = await supabase
      .from("faculties")
      .select("id")
      .eq("university_id", universityId)
      .eq("name", faculty.name)
      .single();

    let facultyId;

    if (existingFac) {
      facultyId = existingFac.id;
      await supabase
        .from("faculties")
        .update({ name_th: faculty.name_th })
        .eq("id", facultyId);
    } else {
      const { data: newFac, error: facErr } = await supabase
        .from("faculties")
        .insert({
          university_id: universityId,
          name: faculty.name,
          name_th: faculty.name_th,
        })
        .select("id")
        .single();

      if (facErr) {
        console.error(`  Failed to insert faculty ${faculty.name}:`, facErr.message);
        continue;
      }
      facultyId = newFac.id;
    }

    // 3. Seed programs for this faculty
    for (const prog of faculty.programs) {
      // Check if program already exists
      const { data: existingProg } = await supabase
        .from("programs")
        .select("id")
        .eq("faculty_id", facultyId)
        .eq("name", prog.name)
        .single();

      const programData = {
        faculty_id: facultyId,
        name: prog.name,
        name_th: prog.name_th,
        degree_type: prog.degree_type,
        is_international: prog.is_international,
        tuition_per_semester: prog.tuition_per_semester,
        description: `${prog.field_th} (${prog.field}) — ${prog.program_type}`,
        seats_round_1: prog.seats_round_1,
      };

      if (existingProg) {
        await supabase
          .from("programs")
          .update(programData)
          .eq("id", existingProg.id);
      } else {
        const { error: progErr } = await supabase
          .from("programs")
          .insert(programData);

        if (progErr) {
          console.error(`    Failed: ${prog.name} — ${progErr.message}`);
          continue;
        }
      }
      totalPrograms++;
    }

    console.log(`  ✓ ${faculty.name} — ${faculty.programs.length} programs`);
  }

  console.log(`\nDone! Seeded ${totalPrograms} programs across ${faculties.length} faculties.`);
}

seed().catch(console.error);
