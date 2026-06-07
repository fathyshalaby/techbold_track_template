#!/usr/bin/env bash
set -euo pipefail

ROOT="$(git rev-parse --show-toplevel 2>/dev/null || pwd)"
REPORT="$ROOT/.planning/audits/00-MECHANICAL-SCAN.md"
SELF="scripts/audit-v1-skeleton.sh"

cd "$ROOT"
mkdir -p "$(dirname "$REPORT")"

timestamp="$(date -u +"%Y-%m-%dT%H:%M:%SZ")"

tracked_files() {
  git ls-files | grep -v -F "$SELF" | grep -v -F ".planning/audits/00-MECHANICAL-SCAN.md" || true
}

tracked_text_files() {
  tracked_files | while IFS= read -r file; do
    [ -f "$file" ] || continue
    if grep -Iq . "$file" 2>/dev/null; then
      printf '%s\n' "$file"
    fi
  done
}

section() {
  printf '\n## %s\n\n' "$1" >> "$REPORT"
}

empty_or_list() {
  local content="$1"
  local empty_message="$2"
  if [ -n "$content" ]; then
    printf '%s\n' "$content" >> "$REPORT"
  else
    printf '%s\n' "$empty_message" >> "$REPORT"
  fi
}

grep_tracked() {
  local pattern="$1"
  local files
  files="$(tracked_text_files)"
  if [ -z "$files" ]; then
    return 0
  fi
  printf '%s\n' "$files" | xargs grep -nI -E "$pattern" 2>/dev/null || true
}

grep_tracked_i() {
  local pattern="$1"
  local files
  files="$(tracked_text_files)"
  if [ -z "$files" ]; then
    return 0
  fi
  printf '%s\n' "$files" | xargs grep -nI -i -E "$pattern" 2>/dev/null || true
}

list_matching_files() {
  local pattern="$1"
  tracked_files | grep -E "$pattern" || true
}

package_scripts() {
  node <<'NODE'
const fs = require('fs');
const { execSync } = require('child_process');

const files = execSync('git ls-files', { encoding: 'utf8' })
  .trim()
  .split('\n')
  .filter(Boolean)
  .filter((file) => file.endsWith('package.json'));

if (files.length === 0) {
  process.exit(0);
}

for (const file of files) {
  const raw = fs.readFileSync(file, 'utf8');
  const pkg = JSON.parse(raw);
  const scripts = pkg.scripts || {};
  console.log(`### ${file}`);
  const names = Object.keys(scripts);
  if (names.length === 0) {
    console.log('- No scripts');
    continue;
  }
  for (const name of names.sort()) {
    console.log(`- ${name}: \`${scripts[name]}\``);
  }
}
NODE
}

ignored_summary() {
  local count
  count="$(git ls-files --others --ignored --exclude-standard | wc -l | tr -d ' ')"
  printf 'Ignored files: %s\n' "$count"
  git ls-files --others --ignored --exclude-standard | sed -n '1,80p'
}

untracked_summary() {
  local count
  count="$(git ls-files --others --exclude-standard | wc -l | tr -d ' ')"
  printf 'Untracked files: %s\n' "$count"
  git ls-files --others --exclude-standard | sed -n '1,120p'
}

{
  printf '# v1.1 Skeleton Rescue Mechanical Scan\n\n'
  printf '**Generated:** %s\n' "$timestamp"
  printf '**Scope:** report-only mechanical scan for v1.1 skeleton rescue\n'
  printf '**Production changes:** none\n'
} > "$REPORT"

section "Empty Tracked Files"
empty_files="$(
  tracked_files | while IFS= read -r file; do
    [ -f "$file" ] || continue
    [ ! -s "$file" ] && printf '%s\n' "$file"
  done || true
)"
empty_or_list "$empty_files" "None found."

section "TODO, FIXME, HACK, XXX"
todo_hits="$(grep_tracked '\b(TODO|FIXME|HACK|XXX)\b')"
empty_or_list "$todo_hits" "None found."

section "Placeholders And Stub Markers"
placeholder_hits="$(grep_tracked_i '(placeholder|stub|not implemented|throw new Error|return null|return undefined)')"
empty_or_list "$placeholder_hits" "None found."

section "TypeScript And Lint Suppressions"
suppression_hits="$(grep_tracked '(@ts-ignore|eslint-disable)')"
empty_or_list "$suppression_hits" "None found."

section "Console Logs And Debuggers"
debug_hits="$(grep_tracked '(console\.log|debugger)')"
empty_or_list "$debug_hits" "None found."

section "Em Dash Characters"
em_dash_hits="$(grep_tracked '—')"
empty_or_list "$em_dash_hits" "None found."

section "Package Manager Files"
pm_files="$(
  {
    list_matching_files '(^|/)(package-lock\.json|npm-shrinkwrap\.json|yarn\.lock|pnpm-lock\.yaml|bun\.lockb?|pnpm-workspace\.yaml|\.npmrc|\.yarnrc|\.yarnrc\.yml)$'
    git ls-files --others --exclude-standard | grep -E '(^|/)(package-lock\.json|npm-shrinkwrap\.json|yarn\.lock|pnpm-lock\.yaml|bun\.lockb?|pnpm-workspace\.yaml|\.npmrc|\.yarnrc|\.yarnrc\.yml)$' || true
  } | sort -u
)"
empty_or_list "$pm_files" "None found."

section "Package Scripts"
scripts_output="$(package_scripts)"
empty_or_list "$scripts_output" "No package.json files found."

section "TypeScript Config Files"
tsconfig_files="$(list_matching_files '(^|/)tsconfig[^/]*\.json$')"
empty_or_list "$tsconfig_files" "None found."

section "Test Config Files"
test_config_files="$(list_matching_files '(^|/)(vitest|jest|playwright|cypress|karma|mocha)\.config\.[^/]+$')"
empty_or_list "$test_config_files" "None found."

section "CI Files"
ci_files="$(
  {
    list_matching_files '^\.github/workflows/.*\.(yml|yaml)$'
    list_matching_files '(^|/)(\.gitlab-ci\.yml|circle\.yml|Jenkinsfile|azure-pipelines\.ya?ml|bitbucket-pipelines\.ya?ml)$'
  } | sort -u
)"
empty_or_list "$ci_files" "None found."

section "Ignored And Untracked Summary"
{
  printf '### Ignored\n\n'
  ignored_summary
  printf '\n### Untracked\n\n'
  untracked_summary
} >> "$REPORT"

printf 'Wrote %s\n' "$REPORT"
