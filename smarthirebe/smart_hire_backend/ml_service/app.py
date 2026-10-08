# ml_service/app.py

from fastapi import FastAPI
from pydantic import BaseModel
from typing import Optional
from ml_service import predict_section, extract_education, extract_experience

app = FastAPI()

class WorkerRequest(BaseModel):
    text: str
    structured: Optional[dict] = None


@app.post("/ml/predict")
def ml_predict(req: WorkerRequest):

    raw_text = req.text or ""
    lines = raw_text.split("\n")

    sections = []      # <-- strings ONLY
    education = []
    experience = []
    skills = []

    for ln in lines:
        ln = ln.strip()
        if not ln:
            continue

        label = predict_section(ln)

        # Append only the raw line text
        # (Worker.js expects this to be a string)
        sections.append(ln)

        if label == "EDUCATION":
            education.append(extract_education(ln))

        elif label == "EXPERIENCE":
            experience.append(extract_experience(ln))

        elif label == "SKILL":
            skills.append(ln)

    return {
        "version": "ml-v1",
        "sections": sections,        # FIXED → list of strings
        "education": education,
        "experience": experience,
        "skills": skills,
        "fullName": None,
        "summary": None,
        "identity": {},
        "phone": None,
        "embeddings": [],
        "atsScore": 0
    }
