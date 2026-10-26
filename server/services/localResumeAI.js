/**
 * Local resume NLP engine. No external LLM/API is called.
 * The ATS quality classifier is a small logistic-regression model trained at
 * startup on hand-labelled example feature vectors. It is a lightweight demo
 * model, not a substitute for a large language model or a production ATS.
 */

const ACTION_VERBS = [
  'built', 'created', 'developed', 'designed', 'implemented', 'improved',
  'increased', 'reduced', 'led', 'managed', 'optimized', 'automated',
  'delivered', 'launched', 'maintained', 'analyzed', 'collaborated', 'tested',
  'deployed', 'streamlined', 'engineered', 'resolved', 'integrated'
];
const TECH_TERMS = [
  'javascript', 'typescript', 'react', 'node', 'express', 'java', 'python',
  'c++', 'sql', 'mysql', 'mongodb', 'aws', 'azure', 'gcp', 'docker', 'git',
  'api', 'rest', 'spring', 'html', 'css', 'data structures', 'algorithms',
  'testing', 'agile', 'linux', 'cloud', 'communication', 'leadership'
];
const METRIC_RE = /\b\d+(?:\.\d+)?\s?(?:%|percent|x|users|customers|clients|projects|hours|days|weeks|months|years|ms|seconds|minutes|\$|₹|lpa|k)\b/i;
const EMAIL_RE = /[\w.+-]+@[\w.-]+\.[A-Za-z]{2,}/;
const PHONE_RE = /(?:\+?\d[\d ()-]{7,}\d)/;

const wordList = (text) => (String(text || '').toLowerCase().match(/[a-z+#.]+/g) || []);
const countTerms = (text, terms) => {
  const lower = String(text || '').toLowerCase();
  return terms.reduce((n, term) => n + (lower.includes(term) ? 1 : 0), 0);
};
const clamp = (n, min = 0, max = 100) => Math.max(min, Math.min(max, Math.round(n)));
const clean = (value) => String(value || '').replace(/\s+/g, ' ').trim();
const sentence = (text) => clean(text).replace(/[.!?]+$/, '');

function extractFeatures(text) {
  const lower = String(text || '').toLowerCase();
  const words = wordList(lower);
  const lines = String(text || '').split(/\r?\n/).map(clean).filter(Boolean);
  const summary = /professional summary|summary|objective|profile/.test(lower);
  const skills = /skills|technical skills|core competencies/.test(lower);
  const experience = /experience|employment|work history|internship/.test(lower);
  const education = /education|university|college|bachelor|master|degree/.test(lower);
  const projects = /projects|project experience/.test(lower);
  const contact = EMAIL_RE.test(text) && PHONE_RE.test(text);
  const actionCount = countTerms(lower, ACTION_VERBS);
  const techCount = countTerms(lower, TECH_TERMS);
  const metrics = (String(text || '').match(/\b\d+(?:\.\d+)?\s?(?:%|percent|users|customers|clients|projects|hours|days|weeks|months|years|ms|seconds|minutes|₹|\$|lpa|k)\b/gi) || []).length;
  const length = words.length;
  return [
    Math.min(length / 500, 1), summary ? 1 : 0, skills ? 1 : 0,
    experience ? 1 : 0, education ? 1 : 0, projects ? 1 : 0,
    contact ? 1 : 0, Math.min(actionCount / 10, 1), Math.min(techCount / 10, 1),
    Math.min(metrics / 5, 1), Math.min(lines.length / 25, 1)
  ];
}

// Small labelled training set: feature vectors map to low/high resume-readiness.
// The model learns weights with logistic regression gradient descent.
const TRAINING_EXAMPLES = [
  { x: [0.15,0,0,0,0,0,0,0,0,0,0.1], y: 0 },
  { x: [0.25,1,0,0,1,0,1,0.1,0.1,0,0.2], y: 0 },
  { x: [0.5,1,1,1,1,1,1,0.2,0.3,0,0.5], y: 0 },
  { x: [0.6,1,1,1,1,1,1,0.8,0.8,0.8,0.8], y: 1 },
  { x: [0.8,1,1,1,1,1,1,1,0.9,1,1], y: 1 },
  { x: [0.4,0,1,1,1,0,0,0.2,0.4,0.2,0.4], y: 0 },
  { x: [0.7,1,1,1,1,1,1,0.6,0.7,0.4,0.7], y: 1 },
  { x: [0.3,1,1,0,1,1,1,0.3,0.5,0.2,0.4], y: 0 },
  { x: [0.9,1,1,1,1,1,1,0.9,0.8,0.8,0.9], y: 1 },
  { x: [0.2,0,0,0,1,0,1,0,0,0,0.2], y: 0 },
  { x: [0.55,1,1,1,1,1,1,0.7,0.6,0.6,0.7], y: 1 },
  { x: [0.45,1,1,1,1,0,1,0.3,0.4,0,0.5], y: 0 },
  { x: [0.75,1,1,1,1,1,1,0.8,0.9,0.8,0.8], y: 1 },
  { x: [0.35,0,1,1,0,0,1,0.2,0.3,0,0.3], y: 0 },
  { x: [0.65,1,1,1,1,1,1,0.7,0.8,0.6,0.8], y: 1 }
];

function trainClassifier() {
  const dimensions = TRAINING_EXAMPLES[0].x.length;
  const weights = Array(dimensions + 1).fill(0);
  const sigmoid = (z) => 1 / (1 + Math.exp(-Math.max(-20, Math.min(20, z))));
  const learningRate = 0.35;
  for (let epoch = 0; epoch < 1800; epoch++) {
    const gradients = Array(dimensions + 1).fill(0);
    for (const sample of TRAINING_EXAMPLES) {
      const z = weights[0] + sample.x.reduce((sum, v, i) => sum + v * weights[i + 1], 0);
      const error = sigmoid(z) - sample.y;
      gradients[0] += error;
      sample.x.forEach((v, i) => { gradients[i + 1] += error * v; });
    }
    weights.forEach((_, i) => { weights[i] -= learningRate * gradients[i] / TRAINING_EXAMPLES.length; });
  }
  return (features) => {
    const z = weights[0] + features.reduce((sum, v, i) => sum + v * weights[i + 1], 0);
    return sigmoid(z);
  };
}
const predictResumeReadiness = trainClassifier();

export function enhanceSummary(input) {
  const original = sentence(input);
  if (!original) return '';
  const hasGoal = /seeking|looking for|aiming to|interested in|aspiring/i.test(original);
  const hasSkill = /skills?|experienced|proficient|knowledge|background|speciali[sz]/i.test(original);
  let result = original.charAt(0).toUpperCase() + original.slice(1);
  if (!hasSkill) result += ', with a focus on relevant skills, practical problem-solving, and continuous learning';
  if (!hasGoal) result += '. Seeking opportunities to apply these strengths, contribute to team goals, and grow professionally';
  return result.replace(/\s+/g, ' ').replace(/[.!?]*$/, '.');
}

export function enhanceJobDescription(input) {
  const original = sentence(input);
  if (!original) return '';
  let result = original.charAt(0).toUpperCase() + original.slice(1);
  if (/^responsible for\b/i.test(result)) result = `Handled ${result.replace(/^responsible for\s*/i, '')}`;
  else if (/^worked on\b/i.test(result)) result = `Developed and maintained ${result.replace(/^worked on\s*/i, '')}`;
  else if (!new RegExp(`^(${ACTION_VERBS.join('|')})\\b`, 'i').test(original)) result = `Contributed to work involving ${result.charAt(0).toLowerCase()}${result.slice(1)}`;
  if (!METRIC_RE.test(result)) result += ', with a focus on quality, efficiency, and reliable delivery';
  return result.replace(/\s+/g, ' ').replace(/[.!?]*$/, '.');
}

function extractSection(text, headings) {
  const lines = String(text || '').split(/\r?\n/);
  const start = lines.findIndex(line => headings.some(h => new RegExp(`^\\s*${h}\\s*:?\\s*$`, 'i').test(line)));
  if (start < 0) return '';
  const nextHeading = /^(professional summary|summary|objective|profile|skills|technical skills|experience|work experience|employment|education|projects|certifications|achievements|contact)$/i;
  const section = [];
  for (let i = start + 1; i < lines.length; i++) {
    if (nextHeading.test(clean(lines[i]))) break;
    section.push(clean(lines[i]));
  }
  return section.filter(Boolean).join(' ');
}

function parseResumeText(text) {
  const raw = String(text || '');
  const lines = raw.split(/\r?\n/).map(clean).filter(Boolean);
  const email = raw.match(EMAIL_RE)?.[0] || '';
  const phone = raw.match(PHONE_RE)?.[0] || '';
  const linkedIn = raw.match(/(?:https?:\/\/)?(?:www\.)?linkedin\.com\/[\w/-]+/i)?.[0] || '';
  const website = raw.match(/https?:\/\/[^\s]+/i)?.[0] || '';
  const name = lines.find(line => line.length > 2 && line.length < 60 && !/@|https?:\/\/|\d{3,}/.test(line) && !/resume|curriculum vitae/i.test(line)) || '';
  const skillText = extractSection(raw, ['skills', 'technical skills', 'core competencies']);
  const skills = [...new Set((skillText.match(/[A-Za-z][A-Za-z+#. /-]{1,30}/g) || [])
    .map(s => clean(s).replace(/[•,;|]+$/, ''))
    .filter(s => s && s.length < 32 && !/^(technical skills|core competencies)$/i.test(s)))].slice(0, 30);
  const summary = extractSection(raw, ['professional summary', 'summary', 'objective', 'profile']);
  const educationText = extractSection(raw, ['education', 'academic background']);
  const experienceText = extractSection(raw, ['experience', 'work experience', 'employment', 'internship']);
  const projectText = extractSection(raw, ['projects', 'project experience']);

  const education = educationText ? [{
    institution: (educationText.match(/(?:university|college|institute|school|chitkara)[^,.;\n]*/i) || [])[0] || '',
    degree: (educationText.match(/(?:B\.?Tech|B\.?E\.?|Bachelor(?:'s)?|Master(?:'s)?|M\.?Tech|MCA|BCA|BSc|MSc)[^,.;\n]*/i) || [])[0] || '',
    field: (educationText.match(/(?:computer science|information technology|software engineering|data science|electronics)[^,.;\n]*/i) || [])[0] || '',
    graduation_date: (educationText.match(/\b(?:19|20)\d{2}\b/) || [])[0] || '',
    gpa: (educationText.match(/(?:CGPA|GPA|grade point average)\s*[:=-]?\s*[\d.]+/i) || [])[0] || ''
  }] : [];
  const experience = experienceText ? [{
    company: '', position: '', start_date: '', end_date: '', description: experienceText, is_current: /present|current|ongoing/i.test(experienceText)
  }] : [];
  const project = projectText ? [{
    name: (projectText.split(/[.!\n]/).map(clean).find(Boolean) || 'Resume Project').slice(0, 100),
    type: '', description: projectText, projectLink: website, githubLink: (raw.match(/https?:\/\/github\.com\/[^\s)]+/i) || [])[0] || ''
  }] : [];
  return {
    professional_summary: summary,
    skills,
    personal_info: {
      image: '', full_name: name, profession: '', email, phone, location: '', linkedin: linkedIn, website
    },
    experience, education, project
  };
}

export function extractResumeData(text) {
  return parseResumeText(text);
}

export function analyzeATS(resume) {
  const personalInfo = resume.personal_info || {};
  const experience = resume.experience || [];
  const education = resume.education || [];
  const projects = resume.project || [];
  const skills = resume.skills || [];
  const fullText = [
    personalInfo.full_name, personalInfo.profession, personalInfo.email, personalInfo.phone,
    resume.professional_summary, skills.join(' '),
    experience.map(e => `${e.position} ${e.company} ${e.description}`).join(' '),
    education.map(e => `${e.institution} ${e.degree} ${e.field} ${e.graduation_date} ${e.gpa}`).join(' '),
    projects.map(p => `${p.name} ${p.type} ${p.description}`).join(' ')
  ].join('\n');
  const features = extractFeatures(fullText);
  const readiness = predictResumeReadiness(features);
  const formatting = clamp(45 + (features[10] * 25) + (features[1] ? 15 : 0) + (features[2] ? 15 : 0));
  const keywordDensity = clamp(35 + features[8] * 45 + Math.min(skills.length, 10) * 2);
  const summaryStrength = clamp((resume.professional_summary || '').length > 80 ? 78 : (resume.professional_summary || '').length > 25 ? 60 : 35);
  const actionVerbs = clamp(35 + features[7] * 60);
  const measurableAchievements = clamp(30 + features[9] * 65);
  const atsScore = clamp(25 + readiness * 55 + (formatting + keywordDensity + summaryStrength + actionVerbs + measurableAchievements) / 5 * 0.2);
  const positives = [];
  const improvements = [];
  if (personalInfo.email) positives.push('Contact email is present and can help recruiters reach you.'); else improvements.push('Add a professional email address in the contact section.');
  if (skills.length >= 5) positives.push('The resume includes a useful skills section.'); else improvements.push('Add a focused skills section with relevant tools, technologies, and job-related keywords.');
  if (resume.professional_summary && resume.professional_summary.length > 80) positives.push('The professional summary gives recruiters context about your profile.'); else improvements.push('Write a concise 2–3 line professional summary tailored to the role.');
  if (experience.length || projects.length) positives.push('Experience or project content gives recruiters evidence of practical work.'); else improvements.push('Add projects, internships, or experience that demonstrate practical skills.');
  if (features[7] >= 0.3) positives.push('Action-oriented language is used in parts of the resume.'); else improvements.push('Start experience and project bullets with action verbs such as Built, Developed, Implemented, or Improved.');
  if (features[9] >= 0.2) positives.push('Some measurable outcomes are included.'); else improvements.push('Add honest numbers where possible, such as users served, time saved, test coverage, or project scale.');
  if (education.length) positives.push('Education details are included.'); else improvements.push('Include your degree, institution, field of study, and expected graduation date.');
  const suggestedKeywords = [...new Set(TECH_TERMS.filter(term => !fullText.toLowerCase().includes(term)))].slice(0, 8);
  return {
    atsScore,
    criteriaRating: { formatting, keywordDensity, summaryStrength, actionVerbs, measurableAchievements },
    positives: positives.slice(0, 5),
    improvements: improvements.slice(0, 6),
    suggestedKeywords
  };
}
