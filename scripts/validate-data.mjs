import fs from 'node:fs';
import path from 'node:path';
import process from 'node:process';

const root = process.cwd();
const expected = {
  'biology.json': { type: 'campaign', key: 'chapters', groups: 32, questions: 448, subject: 'biology' },
  'chemistry-campaign.json': { type: 'campaign', key: 'chapters', groups: 10, questions: 280, subject: 'chemistry-campaign' },
  'chemistry-mcqs.json': { type: 'modules', key: 'modules', groups: 17, questions: 1700, subject: 'chemistry-mcqs' },
  'maths.json': { type: 'modules', key: 'modules', groups: 30, questions: 3000, subject: 'maths' },
  'physics.json': { type: 'campaign', key: 'chapters', groups: 28, questions: 498, subject: 'physics' },
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

function checkUniqueIds(html, file) {
  const seen = new Set();
  for (const match of html.matchAll(/\bid=["']([^"']+)["']/gi)) {
    if (seen.has(match[1])) errors.push(`${file}: duplicate HTML id '${match[1]}'`);
    seen.add(match[1]);
  }
}

function checkLocalReference(ref, file, label = 'reference') {
  if (/^(?:https?:|mailto:|tel:|#|javascript:|data:)/i.test(ref)) return;
  const local = ref.split(/[?#]/, 1)[0];
  if (!local || local === './' || local === '/') return;
  if (!fs.existsSync(path.resolve(root, local))) errors.push(`${file}: broken local ${label} '${ref}'`);
}

for (const [file, spec] of Object.entries(expected)) {
  const fullPath = path.join(root, 'data', file);
  if (!fs.existsSync(fullPath)) { errors.push(`Missing data file: data/${file}`); continue; }
  let data;
  try { data = JSON.parse(fs.readFileSync(fullPath, 'utf8')); }
  catch (error) { errors.push(`Invalid JSON in data/${file}: ${error.message}`); continue; }

  if (data.subject !== spec.subject) errors.push(`data/${file}: expected subject '${spec.subject}', got '${data.subject}'`);
  if (data.type !== spec.type) errors.push(`data/${file}: expected type '${spec.type}', got '${data.type}'`);
  if (!Array.isArray(data[spec.key])) errors.push(`data/${file}: expected '${spec.key}' array`);
  else if (data[spec.key].length !== spec.groups) errors.push(`data/${file}: expected ${spec.groups} ${spec.key}, got ${data[spec.key].length}`);

  const groups = Array.isArray(data[spec.key]) ? data[spec.key] : [];
  const groupIds = new Set();
  for (const [index, group] of groups.entries()) {
    const location = `data/${file}.${spec.key}[${index}]`;
    if (!group || typeof group !== 'object' || Array.isArray(group)) {
      errors.push(`${location}: expected an object`);
      continue;
    }
    if (typeof group.id !== 'string' && typeof group.id !== 'number') errors.push(`${location}: missing group id`);
    else if (groupIds.has(String(group.id))) errors.push(`${location}: duplicate group id '${group.id}'`);
    else groupIds.add(String(group.id));

    if (spec.type === 'campaign') {
      if (!Array.isArray(group.quests)) errors.push(`${location}: expected quests array`);
      if (!Array.isArray(group.practiceSets)) errors.push(`${location}: expected practiceSets array`);
      for (const [setIndex, set] of (group.practiceSets || []).entries()) {
        if (!set || typeof set.name !== 'string') errors.push(`${location}.practiceSets[${setIndex}]: missing set name`);
        if (!Array.isArray(set?.questions)) errors.push(`${location}.practiceSets[${setIndex}]: expected questions array`);
      }
    } else {
      if (!Array.isArray(group.questions)) errors.push(`${location}: expected questions array`);
      if (group.mindmap !== undefined && group.mindmap !== null &&
          (!Array.isArray(group.mindmap.branches) || group.mindmap.branches.some(b => !Array.isArray(b.items)))) {
        errors.push(`${location}: mindmap branches must be an array and each branch must contain an items array`);
      }
      if (group.notes !== undefined && (!Array.isArray(group.notes) || group.notes.some(n => !Array.isArray(n.points)))) {
        errors.push(`${location}: notes must be an array and each note must contain a points array`);
      }
    }
  }

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
  say('PASS', `data/${file}: JSON valid; ${groups.length} groups; ${records.length} question records`);
  if (duplicateChoices) warnings.push(`data/${file}: ${duplicateChoices} question(s) contain duplicate answer options`);
  if (repeatedQuestionTexts) warnings.push(`data/${file}: ${repeatedQuestionTexts} repeated question-text occurrence(s); review before changing`);
}

for (const htmlFile of ['index.html', 'study.html']) {
  const fullPath = path.join(root, htmlFile);
  if (!fs.existsSync(fullPath)) { errors.push(`Missing page: ${htmlFile}`); continue; }
  const html = fs.readFileSync(fullPath, 'utf8');
  checkUniqueIds(html, htmlFile);
  for (const match of html.matchAll(/(?:href|src)=["']([^"']+)["']/gi)) checkLocalReference(match[1], htmlFile, 'href/src');
  for (const socialUrl of ['https://t.me/masterclass11nd12', 'https://www.youtube.com/@MasterClass11and12']) {
    if (!html.includes(socialUrl)) errors.push(`${htmlFile}: missing expected MasterClass social link ${socialUrl}`);
  }
  say('PASS', `${htmlFile}: local href/src references, ids, and social links checked`);
}

const home = fs.readFileSync(path.join(root, 'index.html'), 'utf8');
const appPath = path.join(root, 'assets/app.js');
if (!fs.existsSync(appPath)) errors.push('Missing application script: assets/app.js');
const app = fs.existsSync(appPath) ? fs.readFileSync(appPath, 'utf8') : '';
const linkedSubjects = [...home.matchAll(/study\.html\?subject=([a-z-]+)/g)].map(match => match[1]);
const configuredSubjects = [...app.matchAll(/^\s*"([a-z-]+)"\s*:\s*\{[^\n]*file:"([^"]+\.json)"/gm)];
const subjectMap = new Map(configuredSubjects.map(match => [match[1], match[2]]));
for (const key of linkedSubjects) {
  if (!subjectMap.has(key)) errors.push(`index.html links to unknown subject key '${key}'`);
}
for (const [key, dataFile] of subjectMap) {
  if (!fs.existsSync(path.resolve(root, dataFile))) errors.push(`assets/app.js subject '${key}' references missing data file '${dataFile}'`);
  if (!linkedSubjects.includes(key)) warnings.push(`assets/app.js defines subject '${key}' but index.html has no card link for it`);
}
for (const match of app.matchAll(/fetch\(\s*["']([^"']+)["']\s*\)/g)) checkLocalReference(match[1], 'assets/app.js', 'fetch target');

const readmePath = path.join(root, 'README.md');
if (fs.existsSync(readmePath)) {
  const readme = fs.readFileSync(readmePath, 'utf8');
  for (const match of readme.matchAll(/\]\(([^)]+)\)/g)) {
    const ref = match[1].trim();
    if (!ref.includes('://') && !ref.startsWith('#') && !ref.startsWith('mailto:')) checkLocalReference(ref, 'README.md', 'Markdown link');
  }
  for (const socialUrl of ['https://t.me/masterclass11nd12', 'https://www.youtube.com/@MasterClass11and12']) {
    if (!readme.includes(socialUrl)) errors.push(`README.md: missing expected MasterClass social link ${socialUrl}`);
  }
  say('PASS', 'README.md: local Markdown links and social links checked');
}

const brandingFiles = ['index.html', 'study.html', 'assets/app.js', 'assets/styles.css', 'README.md', 'LICENSE'];
for (const file of brandingFiles) {
  const fullPath = path.join(root, file);
  if (!fs.existsSync(fullPath)) continue;
  const content = fs.readFileSync(fullPath, 'utf8');
  if (/ICSE\s*MasterClass|ICSEMasterClass|ISC\s*MasterClass/i.test(content)) errors.push(`${file}: legacy brand text remains in user-facing project files`);
}
say('INFO', 'Remote URL availability and academic correctness require separate checks; this validator checks local structure, not the truth of every answer.');
say('INFO', 'Duplicate answer choices and repeated question text are warnings for human review, not automatic edits.');

for (const warning of warnings) say('WARN', warning);
for (const error of errors) say('FAIL', error);
console.log(`\nValidation summary: ${Object.keys(expected).length} data files checked; ${errors.length} errors; ${warnings.length} warnings.`);
if (errors.length) process.exitCode = 1;
