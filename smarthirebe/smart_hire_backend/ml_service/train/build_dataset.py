# ml_service/train/build_dataset.py

import os
import json
import re
from pypdf import PdfReader

DATASET_OUT = "dataset.jsonl"
SAMPLES_DIR = "resume_samples"


def extract_text_pdf(path):
    try:
        reader = PdfReader(path)
        text = "\n".join(page.extract_text() or "" for page in reader.pages)
        return text
    except:
        return ""


def clean_line(line):
    return re.sub(r'\s+', ' ', line).strip()


def label_line(line):
    l = line.lower()

    if any(x in l for x in ["bachelor", "master", "b.tech", "cgpa", "university", "college"]):
        return "EDUCATION"

    if any(x in l for x in ["intern", "experience", "developer", "engineer", "company"]):
        return "EXPERIENCE"

    if any(x in l for x in ["python", "java", "react", "spring", "mongodb", "skills"]):
        return "SKILL"

    if any(x in l for x in ["profile", "summary", "objective"]):
        return "SUMMARY"

    return "OTHER"


def build_dataset():
    out = open(DATASET_OUT, "w", encoding="utf-8")

    for file in os.listdir(SAMPLES_DIR):
        if not file.lower().endswith(".pdf"):
            continue

        full = os.path.join(SAMPLES_DIR, file)
        text = extract_text_pdf(full)
        lines = [clean_line(x) for x in text.split("\n") if len(clean_line(x)) > 3]

        for ln in lines:
            entry = {
                "text": ln,
                "label": label_line(ln)
            }
            out.write(json.dumps(entry) + "\n")

    out.close()
    print("Dataset created:", DATASET_OUT)


if __name__ == "__main__":
    build_dataset()
