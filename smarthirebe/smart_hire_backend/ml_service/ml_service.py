# ml_service/ml_service.py

import os
import re
import joblib

# --------------------------------------------------------------------
# Resolve model + vectorizer paths
# --------------------------------------------------------------------

BASE_DIR = os.path.dirname(os.path.abspath(__file__))

# Primary expected files (based on your folder)
MODEL_PATH = os.path.join(BASE_DIR, "model.pkl")
VECTORIZER_PATH = os.path.join(BASE_DIR, "vectorizer.pkl")

# Fallback (if someone mistakenly placed files in /model/)
MODEL_ALT = os.path.join(BASE_DIR, "model", "model.pkl")
VECT_ALT = os.path.join(BASE_DIR, "model", "vectorizer.pkl")

def resolve_path(primary, fallback):
    if os.path.exists(primary):
        return primary
    if os.path.exists(fallback):
        print(f"[ML-SERVICE] WARNING: Primary path missing. Using fallback: {fallback}")
        return fallback
    raise FileNotFoundError(f"[ML-SERVICE] Could not find: {primary} or {fallback}")

MODEL_PATH = resolve_path(MODEL_PATH, MODEL_ALT)
VECTORIZER_PATH = resolve_path(VECTORIZER_PATH, VECT_ALT)

print("[ML-SERVICE] Loading model from:", MODEL_PATH)
print("[ML-SERVICE] Loading vectorizer from:", VECTORIZER_PATH)

model = joblib.load(MODEL_PATH)
vectorizer = joblib.load(VECTORIZER_PATH)


# --------------------------------------------------------------------
# Predict Section
# --------------------------------------------------------------------
def predict_section(text: str):
    X = vectorizer.transform([text])
    return model.predict(X)[0]


# --------------------------------------------------------------------
# Extract Education Fields
# --------------------------------------------------------------------
def extract_education(text):
    degree = None
    institution = None
    year = None

    # Year
    m = re.search(r"(20\d{2}|19\d{2})", text)
    if m:
        year = m.group(1)

    # Degree
    deg = re.search(
        r"(Bachelor|Master|BE|BTech|B\.Tech|MTech|M\.Tech|BSc|MSc)",
        text,
        re.I
    )
    if deg:
        degree = deg.group(1)

    # Institution
    inst = re.search(
        r"(College|University|Institute|School|Academy|Campus)[^,]+",
        text,
        re.I
    )
    if inst:
        institution = inst.group(0).strip()

    return {
        "degree": degree,
        "institution": institution,
        "year": year,
    }


# --------------------------------------------------------------------
# Extract Experience Fields
# --------------------------------------------------------------------
def extract_experience(text):
    title = None
    company = None
    start = None
    end = None

    # Start date
    m = re.search(
        r"(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z]*\s?\d{4}",
        text,
        re.I
    )
    if m:
        start = m.group(0)

    # End date
    m2 = re.search(r"(Present|Current|Now|\d{4})", text, re.I)
    if m2:
        end = m2.group(0)

    # Company name
    comp = re.search(r"(at\s+)?([A-Z][A-Za-z]+(?:\s+[A-Z][A-Za-z]+)*)", text)
    if comp:
        company = comp.group(2)

    # Title fallback
    title = text[:80]

    return {
        "company": company,
        "title": title,
        "start": start,
        "end": end,
    }
