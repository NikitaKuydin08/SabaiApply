export interface ScoreReq { type: string; min: number }
export interface DocReq { type: string; required: boolean }
export interface CustomQuestion { question: string; type: string; required: boolean }
export interface RubricItem { criterion: string; weight: number; max_score: number }

export interface ScreeningResult {
  level: "green" | "yellow" | "red" | "unknown";
  issues: Array<{ severity: "warn" | "fail"; message: string }>;
}

export interface ProgramRequirements {
  min_gpa: number | null;
  required_scores: ScoreReq[];
  required_documents: DocReq[];
}

interface StudentData {
  gpa: number | null;
  scores: Array<{ score_type: string; score_value: number }>;
  documents: Array<{ doc_type: string }>;
}

export function screenApplication(student: StudentData, reqs: ProgramRequirements | null): ScreeningResult {
  if (!reqs) return { level: "unknown", issues: [] };

  const issues: ScreeningResult["issues"] = [];

  if (reqs.min_gpa != null && reqs.min_gpa > 0) {
    if (student.gpa == null) {
      issues.push({ severity: "fail", message: `Missing GPA (requires ≥ ${reqs.min_gpa.toFixed(2)})` });
    } else if (student.gpa < reqs.min_gpa) {
      const diff = reqs.min_gpa - student.gpa;
      if (diff <= 0.2) issues.push({ severity: "warn", message: `GPA ${student.gpa.toFixed(2)} is just below required ${reqs.min_gpa.toFixed(2)}` });
      else issues.push({ severity: "fail", message: `GPA ${student.gpa.toFixed(2)} below required ${reqs.min_gpa.toFixed(2)}` });
    }
  }

  for (const req of reqs.required_scores ?? []) {
    const studentScores = student.scores.filter((s) => s.score_type === req.type);
    if (studentScores.length === 0) {
      issues.push({ severity: "fail", message: `Missing ${req.type} (requires ≥ ${req.min})` });
      continue;
    }
    const best = Math.max(...studentScores.map((s) => s.score_value));
    if (best < req.min) {
      issues.push({ severity: "fail", message: `${req.type} ${best} below required ${req.min}` });
    }
  }

  const submittedDocs = new Set(student.documents.map((d) => d.doc_type));
  for (const doc of reqs.required_documents ?? []) {
    if (doc.required && !submittedDocs.has(doc.type)) {
      issues.push({ severity: "fail", message: `Missing document: ${doc.type}` });
    }
  }

  const hasFail = issues.some((i) => i.severity === "fail");
  const hasWarn = issues.some((i) => i.severity === "warn");
  return {
    level: hasFail ? "red" : hasWarn ? "yellow" : "green",
    issues,
  };
}