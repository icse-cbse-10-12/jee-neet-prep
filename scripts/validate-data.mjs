import fs from 'node:fs';
import path from 'node:path';
import process from 'node:process';

const root = process.cwd();
const expected = {
  'biology.json': { type: 'campaign', key: 'chapters', groups: 32, questions: 448 },
  'chemistry-campaign.json': { type: 'campaign', key: 'chapters', groups: 10, questions: 280 },
  'chemistry-mcqs.json': { type: 'modules', key: 'modules', groups: 17, questions: 1700 },
  'maths.json': { type: 'modules', key: 'modules', groups: 30, questions: 3000 },
  'physics.json': { type: 'campaign', key: 'chapters', groups: 28, questions: 498 },
};
const errors = [];
const warnings = [];
const say = (kind, message) => console.log(`[${kind}] ${message}`);

function collectQuestions(value, location, out) {
  if (Array.isArray(value)) {
    value.forEach((item, index) => collectQuestions(item, `${location}[${index}]`, out));
  } else if (value && typeof value === 'object') {
    if (Object.prototype.hasOwnProperty.call(value, 'question')) out.push({ question: value, location });
    for (const [key, child] of Object.entries(value)) {
      if (child && typeof child === 'object') collectQuestions(child, `${location}.${key}`, out);
    }
  }
}

for (const [file, spec] of Object.entries(expected)) {
  const fullPath = path.join(root, 'data', file);
  if (!fs.existsSync(fullPath)) { errors.push(`Missing data file: data/${file}`); continue; }
  let data;
  try { data = JSON.parse(fs.readFileSync(fullPath, 'utf8')); }
  catch (error) { errors.push(`Invalid JSON in data/${file}: ${error.message}`); continue; }
  if (data.type !== spec.type) errors.push(`data/${file}: expected type '${spec.type}', got '${data.type}'`);
  if (!Array.isArray(data[spec.key])) errors.push(`data/${file}: expected '${spec.key}' array`);
  else if (data[spec.key].length !== spec.groups) errors.push(`data/${file}: expected ${spec.groups} ${spec.key}, got ${data[spec.key].length}`);
  const records = [];
  collectQuestions(data, `data/${file}`, records);
  if (records.length !== spec.questions) errors.push(`data/${file}: expected ${spec.questions} question records, got ${records.length}`);
  let duplicateChoices = 0;
  const questionTextCounts = new Map();
  for (const { question: q, location } of records) {
    if (typeof q.question !== 'string' || !q.question.trim()) errors.push(`${location}: missing question text`);
    if (!Array.isArray(q.options) || q.options.length < 2) errors.push(`${location}: expected at least two answer options`);
    else {
      const normalized = q.options.map(option => String(option).trim().replace(/\s+/g, ' ').toLocaleLowerCase());
      if (new Set(normalized).size !== normalized.length) duplicateChoices++;
      if (!Number.isInteger(q.answerIndex) || q.answerIndex < 0 || q.answerIndex >= q.options.length) errors.push(`${location}: answerIndex is outside the options array`);
    }
    if (typeof q.explanation !== 'string' || !q.explanation.trim()) warnings.push(`${location}: no explanation text`);
    const normalizedQuestion = String(q.question ?? '').trim().replace(/\s+/g, ' ').toLocaleLowerCase();
    if (normalizedQuestion) questionTextCounts.set(normalizedQuestion, (questionTextCounts.get(normalizedQuestion) ?? 0) + 1);
  }
  const repeatedQuestionTexts = [...questionTextCounts.values()].reduce((n, count) => n + Math.max(0, count - 1), 0);
  say('PASS', `data/${file}: JSON valid; ${data[spec.key].length} groups; ${records.length} question records`);
  if (duplicateChoices) warnings.push(`data/${file}: ${duplicateChoices} question(s) contain duplicate answer options`);
  if (repeatedQuestionTexts) warnings.push(`data/${file}: ${repeatedQuestionTexts} repeated question-text occurrence(s); may be intentional, review before changing`);
}

for (const htmlFile of ['index.html', 'study.html']) {
  const fullPath = path.join(root, htmlFile);
  if (!fs.existsSync(fullPath)) { errors.push(`Missing page: ${htmlFile}`); continue; }
  const html = fs.readFileSync(fullPath, 'utf8');
  for (const match of html.matchAll(/(?:href|src)=["']([^"']+)["']/gi)) {
    const ref = match[1];
    if (/^(?:https?:|mailto:|tel:|#|javascript:)/i.test(ref)) continue;
    const local = ref.split(/[?#]/, 1)[0];
    if (!local || local === './' || local === '/') continue;
    if (!fs.existsSync(path.resolve(root, local))) errors.push(`${htmlFile}: broken local reference '${ref}'`);
  }
  say('PASS', `${htmlFile}: page exists and local href/src references resolve`);
}

const home = fs.readFileSync(path.join(root, 'index.html'), 'utf8');
const app = fs.readFileSync(path.join(root, 'assets/app.js'), 'utf8');
for (const match of home.matchAll(/study\.html\?subject=([a-z-]+)/g)) {
  const key = match[1];
  if (!new RegExp(`^[\\s\\S]*?["']${key}["']\\s*:\\s*\\{`, 'm').test(app)) errors.push(`index.html links to unknown subject key '${key}'`);
}
say('INFO', 'Duplicate answer choices and repeated question text are warnings, not automatic edits: changing educational distractors without source verification could introduce errors.');
for (const warning of warnings) say('WARN', warning);
for (const error of errors) say('FAIL', error);
console.log(`\nValidation summary: ${Object.keys(expected).length} data files checked; ${errors.length} errors; ${warnings.length} warnings.`);
if (errors.length) process.exitCode = 1;
