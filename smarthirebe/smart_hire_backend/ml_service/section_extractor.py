# ml_service/section_extractor.py
import re

EMAIL_RE = re.compile(r'[\w\.-]+@[\w\.-]+\.\w+')
PHONE_RE = re.compile(r'\+?\d[\d\-\s]{7,15}\d')

SECTION_HEADERS = [
    "education", "experience", "professional experience",
    "skills", "projects", "summary", "profile",
]

def clean(text: str) -> str:
    return re.sub(r'\s+', ' ', text).strip()

def extract_email(text: str):
    match = EMAIL_RE.findall(text)
    return match[0] if match else ""

def extract_phone(text: str):
    match = PHONE_RE.findall(text)
    return match[0].strip() if match else ""

def extract_name(text: str, email: str):
    """
    Heuristic: name is the first line with 2–4 capitalized words.
    """
    lines = [l.strip() for l in text.split("\n") if l.strip()]
    for line in lines[:7]:
        words = line.split()
        if 2 <= len(words) <= 4 and all(w[0].isupper() for w in words if w.isalpha()):
            # Avoid section headers
            if not re.search(r'(resume|cv|profile|summary)', line, re.I):
                return line
    # fallback: use email local part
    if email:
        local = email.split("@")[0]
        parts = re.split(r"[._\-]", local)
        return " ".join(p.capitalize() for p in parts if len(p) > 1)
    return ""

def split_sections(text: str):
    """
    Split resume into sections based on headers.
    Returns dict: { section_name: text }
    """
    sections = {}
    text_lines = text.split("\n")
    current = None
    buffer = []

    def push():
        nonlocal current, buffer
        if current:
            sections[current] = "\n".join(buffer).strip()
        buffer = []

    for line in text_lines:
        line_clean = line.strip().lower()
        if any(h in line_clean for h in SECTION_HEADERS):
            push()
            current = next(h for h in SECTION_HEADERS if h in line_clean)
        else:
            buffer.append(line)
    push()

    return sections

def extract_skills(section_text: str):
    tokens = [t.strip().lower() for t in re.split(r"[,\n;•]", section_text)]
    return [t for t in tokens if 1 < len(t) <= 40]

def extract_education(section_text: str):
    lines = [l.strip() for l in section_text.split("\n") if l.strip()]
    out = []
    for l in lines:
        yr = re.findall(r"(19|20)\d{2}", l)
        out.append({
            "degree": l.split("|")[0],
            "institution": "",
            "year": yr[-1] if yr else ""
        })
    return out

def extract_experience(section_text: str):
    blocks = re.split(r"\n{2,}", section_text)
    out = []
    for b in blocks:
        yr = re.findall(r"(19|20)\d{2}", b)
        out.append({
            "company": "",
            "title": b[:50],
            "start": yr[0] if yr else "",
            "end": yr[-1] if len(yr) > 1 else "",
            "description": b,
        })
    return out

def extract_summary(section_text: str):
    s = clean(section_text)
    return " ".join(s.split(".")[:2])  # first 2 sentences
