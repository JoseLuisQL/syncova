import { readFileSync, writeFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { DtcgEmitterHandler, lint } from '@google/design.md/linter';

const rootDir = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const designPath = resolve(rootDir, 'DESIGN.md');
const tailwindThemePath = resolve(rootDir, 'src/styles/designMdTailwindTheme.json');
const args = new Set(process.argv.slice(2));

const report = lint(readFileSync(designPath, 'utf8'));

for (const finding of report.findings) {
  const prefix = finding.path ? `${finding.severity}: ${finding.path}` : finding.severity;
  console.log(`${prefix} - ${finding.message}`);
}

if (report.summary.errors > 0) {
  process.exitCode = 1;
  process.exit();
}

if (!report.tailwindConfig.success) {
  console.error(report.tailwindConfig.error.message);
  process.exitCode = 1;
  process.exit();
}

const tailwindTheme = report.tailwindConfig.data.theme.extend;

if (args.has('--print-tailwind')) {
  console.log(JSON.stringify({ theme: { extend: tailwindTheme } }, null, 2));
  process.exit();
}

if (args.has('--print-dtcg')) {
  const result = new DtcgEmitterHandler().execute(report.designSystem);

  if (!result.success) {
    console.error(result.error.message);
    process.exitCode = 1;
    process.exit();
  }

  console.log(JSON.stringify(result.data, null, 2));
  process.exit();
}

if (!args.has('--check')) {
  writeFileSync(tailwindThemePath, `${JSON.stringify(tailwindTheme, null, 2)}\n`);
  console.log(`Synced ${tailwindThemePath}`);
}

console.log(
  `DESIGN.md OK: ${report.summary.errors} errors, ${report.summary.warnings} warnings, ${report.summary.infos} info`
);
