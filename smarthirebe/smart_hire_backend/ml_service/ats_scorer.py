# ml_service/ats_scorer.py
import re

def compute_ats_score(resume_text: str, job_description: str) -> dict:
    resume_text = resume_text.lower()
    jd = job_description.lower()

    resume_tokens = set(re.split(r"[^\w]+", resume_text))
    jd_tokens = set(re.split(r"[^\w]+", jd))

    overlap = resume_tokens & jd_tokens
    score = int((len(overlap) / max(len(jd_tokens), 1)) * 100)

    top_matches = list(overlap)[:10]

    return {
        "ats_score": score,
        "matched_keywords": top_matches
    }
