import re
import io
import os
from flask import Flask, request, jsonify
from werkzeug.utils import secure_filename
from pypdf import PdfReader
import docx

# config
UPLOAD_DIR = os.path.join(os.getcwd(), 'parser_uploads')
os.makedirs(UPLOAD_DIR, exist_ok=True)
ALLOWED_EXT = {'.pdf', '.docx', '.txt'}

# load skills list
SKILLS_FILE = os.path.join(os.path.dirname(__file__), 'skills.txt')
with open(SKILLS_FILE, encoding='utf-8') as f:
    SKILLS = {line.strip().lower() for line in f if line.strip()}

app = Flask(__name__)


def extract_text_from_pdf(path):
    try:
        reader = PdfReader(path)
        text = []
        for page in reader.pages:
            txt = page.extract_text()
            if txt:
                text.append(txt)
        # keep newlines for line-based logic
        return "\n".join(text)
    except Exception as e:
        print("PDF parse error:", e)
        return ""


def extract_text_from_docx(path):
    try:
        doc = docx.Document(path)
        texts = [p.text for p in doc.paragraphs if p.text]
        return "\n".join(texts)
    except Exception as e:
        print("DOCX parse error:", e)
        return ""


def extract_text_from_txt(path):
    try:
        with open(path, 'r', encoding='utf-8', errors='ignore') as f:
            return f.read()
    except Exception as e:
        print("TXT parse error:", e)
        return ""


def normalize_whitespace(s):
    # only when we *want* flat text
    return re.sub(r'\s+', ' ', s).strip()


# simple regex extractors
EMAIL_RE = re.compile(r'[\w\.-]+@[\w\.-]+\.\w+')
PHONE_RE = re.compile(
    r'(\+?\d{1,3}[\s-]?)?(?:\(?\d{2,4}\)?[\s-]?)?\d{3,4}[\s-]?\d{3,4}'
)

DEGREE_KEYWORDS = [
    'bachelor', 'master', 'b\.tech', 'btech', 'mtech', 'b\.e', 'm\.e',
    'phd', 'graduat', 'degree', 'associate', 'diploma', 'msc',
    'bachelor of', 'master of'
]


def extract_emails(text):
    return list(set(EMAIL_RE.findall(text)))


def extract_phones(text):
    cleaned = []
    for match in PHONE_RE.finditer(text):
        num = match.group(0)
        num_clean = re.sub(r'[^\d+]', '', num)
        if 7 <= len(re.sub(r'\D', '', num_clean)) <= 15:
            cleaned.append(num_clean)
    out = []
    seen = set()
    for c in cleaned:
        if c not in seen:
            seen.add(c)
            out.append(c)
    return out


def extract_skills(flat_text):
    text_lower = flat_text.lower()
    found = set()
    for skill in SKILLS:
        pattern = r'\b' + re.escape(skill) + r'\b'
        if re.search(pattern, text_lower):
            found.add(skill)
    return sorted(found)


def extract_summary(text_with_lines):
    sections = re.split(r'\n\s*\n', text_with_lines)

    summary_block = None
    summary_idx = -1

    for i, sec in enumerate(sections[:10]):
        if re.search(r'\b(summary|objective|profile|about me)\b', sec, re.I):
            summary_block = sec
            summary_idx = i
            break

    if summary_block is None:
        return ""

    lines = summary_block.splitlines()
    body_lines = []
    dropped = False
    for ln in lines:
        if (not dropped) and re.search(
            r'\b(summary|objective|profile|about me)\b', ln, re.I
        ):
            dropped = True
            continue
        body_lines.append(ln)

    if not body_lines and summary_idx + 1 < len(sections):
        body_lines = sections[summary_idx + 1].splitlines()

    body_text = "\n".join(l.strip() for l in body_lines if l.strip())
    if not body_text:
        return ""

    heading_re = re.compile(
        r'^(SKILL[S]?|EDUCATION|EXPERIENCE|PROJECTS?|ACHIEVEMENTS|CERTIFICATIONS?)\b.*$',
        re.M,
    )
    split_result = heading_re.split(body_text)
    main_part = split_result[0].strip()

    if not main_part:
        return ""

    main_part = re.sub(r'\s+', ' ', main_part).strip()
    sentences = re.split(r'(?<=[.!?])\s+', main_part)
    summary = " ".join(sentences[:3]).strip()
    return summary


def extract_education(text_with_lines):
    edu = []
    lines = [ln.strip() for ln in text_with_lines.splitlines() if ln.strip()]
    for ln in lines:
        low = ln.lower()
        if any(k in low for k in DEGREE_KEYWORDS) or re.search(
            r'\b(20\d{2}|19\d{2})\b', ln
        ):
            edu.append(ln)

    seen = set()
    out = []
    for e in edu:
        if e not in seen:
            seen.add(e)
            out.append(e)

    m = re.search(r'Bachelor of [^\n]+', text_with_lines, re.I)
    if m:
        be_line = m.group(0).strip()
        if be_line not in out:
            out.insert(0, be_line)

    return out[:8]


# 🔥 NEW: more robust experience extractor
def extract_experience(text_with_lines):
    """
    Extract experience blocks like:
      - SDE Intern July 2025–Current
        PreSecure Solutions (Internship)
      - Technical Lead Oct 2024–Current
        Qwerty Student Technical Club (Team Member)

    and stop before PROJECTS / EDUCATION / SKILLS etc.
    """
    lines = [ln.strip() for ln in text_with_lines.splitlines() if ln.strip()]
    if not lines:
        return []

    # 1) find "EXPERIENCE" section
    start_idx = 0
    for i, ln in enumerate(lines):
        if re.search(r'\b(work experience|professional experience|experience)\b', ln, re.I):
            start_idx = i + 1  # skip heading line itself
            break

    jobs = []
    cur = []

    for ln in lines[start_idx:]:

        # 2) stop when we hit another big section
        if re.match(
            r'^(KEY PROJECTS?|PROJECTS?|EDUCATION|SKILLS?|CERTIFICATIONS?|ACHIEVEMENTS?)\b',
            ln,
            re.I,
        ):
            break

        # 3) Detect a *new* job line: contains job word + a year
        is_job_start = bool(
            re.search(r'\b(intern|developer|engineer|lead|manager|analyst|consultant)\b', ln, re.I)
            and re.search(r'\b(19|20)\d{2}\b', ln)
        )

        if is_job_start:
            # flush previous job
            if cur:
                jobs.append(" ".join(cur).strip())
                cur = []
            cur.append(ln)
        else:
            # continuation bullet / company / description
            if cur:
                cur.append(ln)

    if cur:
        jobs.append(" ".join(cur).strip())

    # de-dupe and cap
    out = []
    seen = set()
    for j in jobs:
        if j and j not in seen:
            seen.add(j)
            out.append(j)

    return out[:8]


def guess_name(text_with_lines, email_list):
    if email_list:
        local = email_list[0].split('@')[0]
        parts = re.split(r'[._\-]', local)
        possible = ' '.join([p.capitalize() for p in parts if len(p) > 1])
        if 2 <= len(parts) <= 3:
            return possible

    lines = [ln.strip() for ln in text_with_lines.splitlines() if ln.strip()]
    for ln in lines[:8]:
        words = ln.split()
        if 1 < len(words) <= 4 and all(w[0].isupper() for w in words if w):
            if re.search(r'\b(resume|curriculum|cv|profile)\b', ln, re.I):
                continue
            return ln.strip()
    return ""


@app.route('/parse_resume', methods=['POST'])
def parse_resume():
    if 'resume' not in request.files:
        return jsonify({'error': 'no file part named resume'}), 400
    f = request.files['resume']
    filename = secure_filename(f.filename)
    if not filename:
        return jsonify({'error': 'no filename'}), 400
    ext = os.path.splitext(filename)[1].lower()
    if ext not in ALLOWED_EXT:
        return jsonify({'error': f'filetype not allowed: {ext}'}), 400

    save_path = os.path.join(UPLOAD_DIR, f"{int(os.times()[4])}_{filename}")
    f.save(save_path)

    text_with_lines = ""
    if ext == '.pdf':
        text_with_lines = extract_text_from_pdf(save_path)
    elif ext == '.docx':
        text_with_lines = extract_text_from_docx(save_path)
    elif ext == '.txt':
        text_with_lines = extract_text_from_txt(save_path)

    flat_text = normalize_whitespace(text_with_lines)

    emails = extract_emails(flat_text)
    phones = extract_phones(flat_text)
    skills = extract_skills(flat_text)
    summary = extract_summary(text_with_lines)
    education = extract_education(text_with_lines)
    experience = extract_experience(text_with_lines)
    full_name = guess_name(text_with_lines, emails)

    result = {
        'fullName': full_name,
        'email': emails[0] if emails else None,
        'phone': phones[0] if phones else None,
        'skills': skills,
        'summary': summary,
        'education': education,
        'experience': experience,
        'rawText': text_with_lines,
    }

    return jsonify(result), 200


if __name__ == '__main__':
    app.run(host='0.0.0.0', port=7000, debug=False)
