import os
import json
import joblib
import re
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.linear_model import LogisticRegression

DATA_DIR = os.path.join(os.getcwd(), "data")
RESUME_DIR = os.path.join(DATA_DIR, "resumes")
LABELS_FILE = os.path.join(DATA_DIR, "labels.json")
MODEL_DIR = os.path.join(os.getcwd(), "model")

os.makedirs(MODEL_DIR, exist_ok=True)

SECTION_LABELS = ["summary", "experience", "education", "skills", "other"]

def load_dataset():
    with open(LABELS_FILE, "r") as f:
        labels = json.load(f)

    texts = []
    y = []

    for file in os.listdir(RESUME_DIR):
        if file.endswith(".txt"):
            resume_name = file.replace(".txt", "")
            text_path = os.path.join(RESUME_DIR, file)

            with open(text_path, "r", encoding="utf-8", errors="ignore") as f:
                raw = f.read()

            lines = [ln.strip() for ln in raw.split("\n") if ln.strip()]

            # supervised assignment
            curr_labels = labels.get(resume_name, {})

            education_lines = curr_labels.get("education", [])
            experience_lines = curr_labels.get("experience", [])
            skills_lines = curr_labels.get("skills", [])
            summary = curr_labels.get("summary", "")

            for ln in lines:
                ln_lower = ln.lower()

                if summary and summary.lower() in ln_lower:
                    y.append("summary")
                elif any(ed.lower() in ln_lower for ed in education_lines):
                    y.append("education")
                elif any(ex.lower() in ln_lower for ex in experience_lines):
                    y.append("experience")
                elif any(sk.lower() in ln_lower for sk in skills_lines):
                    y.append("skills")
                else:
                    y.append("other")

                texts.append(ln)

    return texts, y


def train_model():
    print("Loading dataset...")
    X, y = load_dataset()
    print(f"Samples: {len(X)}")

    vectorizer = TfidfVectorizer(max_features=5000, stop_words="english")
    X_vec = vectorizer.fit_transform(X)

    clf = LogisticRegression(max_iter=300)
    clf.fit(X_vec, y)

    joblib.dump(vectorizer, os.path.join(MODEL_DIR, "vectorizer.pkl"))
    joblib.dump(clf, os.path.join(MODEL_DIR, "classifier.pkl"))

    print("Training complete. Models saved.")


if __name__ == "__main__":
    train_model()
