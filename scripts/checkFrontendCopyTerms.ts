import { readdir, readFile } from "fs/promises";
import path from "path";

type ViolationRule = {
  id: string;
  pattern: RegExp;
  message: string;
};

const ROOT = process.cwd();
const TARGET_DIRS = [path.join(ROOT, "apps", "web", "app"), path.join(ROOT, "apps", "web", "components")];
const ALLOWED_EXTENSIONS = new Set([".ts", ".tsx"]);
const IGNORED_FILE_SUFFIXES = [".test.ts", ".test.tsx"];

const RULES: ViolationRule[] = [
  {
    id: "run-center-casing",
    pattern: /\brun center\b/g,
    message: "Use `Run Center` with this exact casing."
  },
  {
    id: "evidence-receipts",
    pattern: /\bevidence receipts?\b/gi,
    message: "Use `evidence records` for UI-facing trust artifacts."
  },
  {
    id: "receipt-metadata",
    pattern: /\breceipt metadata\b/gi,
    message: "Use `attestation metadata` when describing attestation fields."
  }
];

type Violation = {
  file: string;
  line: number;
  ruleId: string;
  excerpt: string;
  message: string;
};

async function collectFiles(dir: string): Promise<string[]> {
  const entries = await readdir(dir, { withFileTypes: true });
  const results: string[] = [];
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      results.push(...(await collectFiles(fullPath)));
      continue;
    }
    const extension = path.extname(entry.name);
    if (!ALLOWED_EXTENSIONS.has(extension)) {
      continue;
    }
    if (IGNORED_FILE_SUFFIXES.some((suffix) => entry.name.endsWith(suffix))) {
      continue;
    }
    results.push(fullPath);
  }
  return results;
}

function findLineNumber(content: string, matchIndex: number): number {
  return content.slice(0, matchIndex).split("\n").length;
}

function getLine(content: string, lineNumber: number): string {
  return content.split("\n")[lineNumber - 1]?.trim() || "";
}

async function run(): Promise<void> {
  const files = (await Promise.all(TARGET_DIRS.map((dir) => collectFiles(dir)))).flat();
  const violations: Violation[] = [];

  for (const file of files) {
    const content = await readFile(file, "utf8");
    for (const rule of RULES) {
      rule.pattern.lastIndex = 0;
      let match = rule.pattern.exec(content);
      while (match) {
        const line = findLineNumber(content, match.index);
        violations.push({
          file: path.relative(ROOT, file).replaceAll("\\", "/"),
          line,
          ruleId: rule.id,
          excerpt: getLine(content, line),
          message: rule.message
        });
        match = rule.pattern.exec(content);
      }
    }
  }

  if (violations.length === 0) {
    console.log("frontend copy terminology check passed.");
    return;
  }

  console.error("frontend copy terminology check failed:\n");
  for (const violation of violations) {
    console.error(
      `- ${violation.file}:${violation.line} [${violation.ruleId}] ${violation.message}\n  ${violation.excerpt}`
    );
  }
  process.exit(1);
}

void run();
