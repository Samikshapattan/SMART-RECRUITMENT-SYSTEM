# ml_service/train.py
import os
import glob
import re
import joblib

from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.linear_model import LogisticRegression


# ─────────────────────────────────────────────────────────────
# PATHS
# ─────────────────────────────────────────────────────────────
BASE_DIR = os.path.dirname(__file__)
DATA_DIR = os.path.join(BASE_DIR, "data", "resumes")
MODEL_DIR = os.path.join(BASE_DIR, "model")
os.makedirs(MODEL_DIR, exist_ok=True)


# ─────────────────────────────────────────────────────────────
# HELPERS
# ─────────────────────────────────────────────────────────────
def clean_text(text: str) -> str:
    """
    Basic cleanup: collapse whitespace, strip.
    """
    if not text:
        return ""
    text = re.sub(r"\s+", " ", text)
    return text.strip()


def ocr_pdf(pdf_path: str) -> str:
    """
    OCR a PDF → text using pdf2image + pytesseract.
    NOTE: requires:
      pip install pdf2image pytesseract pillow
      and OS-level Tesseract & poppler installed.
    """
    from pdf2image import convert_from_path
    import pytesseract

    print(f"[OCR] Converting {pdf_path} ...")
    pages = convert_from_path(pdf_path)
    texts = []

    for i, page in enumerate(pages):
        txt = pytesseract.image_to_string(page)
        if txt:
            texts.append(txt)
        else:
            print(f"[OCR] Page {i+1} produced empty text for {os.path.basename(pdf_path)}")

    full = "\n".join(texts)
    return clean_text(full)


def infer_label_from_filename_or_content(path: str, text: str) -> str:
    """
    Tiny heuristic labeler just for demonstration.
    You can tell your guide:
      - This creates weak labels automatically based on skills.
      - Then we train a LogisticRegression model on top.
    """

    t = text.lower()

    # Simple buckets – tweak as you like
    if "spring boot" in t or re.search(r"\bjava\b", t):
        return "java_backend"
    if "react" in t or "javascript" in t:
        return "frontend"
    if "machine learning" in t or "data science" in t or "pandas" in t:
        return "ml_data"

    # fallback
    return "other"


def load_texts_and_labels():
    texts = []
    labels = []

    # 1) Try .txt files first
    txt_paths = glob.glob(os.path.join(DATA_DIR, "*.txt"))
    for p in txt_paths:
        with open(p, "r", encoding="utf-8", errors="ignore") as f:
            raw = f.read()
        text = clean_text(raw)
        if not text:
            print(f"[WARN] Empty .txt file skipped: {p}")
            continue

        label = infer_label_from_filename_or_content(p, text)
        texts.append(text)
        labels.append(label)
        print(f"[TXT] Loaded {os.path.basename(p)} → label={label}")

    # 2) If we still have no texts, OCR all PDFs
    if not texts:
        print("[INFO] No non-empty .txt resumes found. Falling back to OCR on PDFs...")
        pdf_paths = glob.glob(os.path.join(DATA_DIR, "*.pdf"))
        for p in pdf_paths:
            try:
                text = ocr_pdf(p)
            except Exception as e:
                print(f"[WARN] OCR failed for {p}: {e}")
                continue

            if not text:
                print(f"[WARN] OCR produced empty text. Skipping: {p}")
                continue

            label = infer_label_from_filename_or_content(p, text)
            texts.append(text)
            labels.append(label)
            print(f"[PDF] OCR'd {os.path.basename(p)} → label={label}")

    if not texts:
        raise RuntimeError(
            "No training texts found.\n"
            "Put some .txt or .pdf resumes into ml_service/data/resumes/"
        )

    print(f"[INFO] Loaded {len(texts)} resumes for training.")
    return texts, labels


# ─────────────────────────────────────────────────────────────
# MAIN TRAIN FUNCTION
# ─────────────────────────────────────────────────────────────
def main():
    texts, labels = load_texts_and_labels()

    # TF-IDF over resumes
    vectorizer = TfidfVectorizer(
        max_features=5000,
        ngram_range=(1, 2),
        stop_words="english"
    )

    X = vectorizer.fit_transform(texts)

    # Simple multi-class classifier
    clf = LogisticRegression(
        max_iter=2000,
        n_jobs=-1
    )
    clf.fit(X, labels)

    joblib.dump(vectorizer, os.path.join(MODEL_DIR, "vectorizer.pkl"))
    joblib.dump(clf, os.path.join(MODEL_DIR, "model.pkl"))
    print(f"[OK] Saved vectorizer + model to {MODEL_DIR}")


if __name__ == "__main__":
    main()
