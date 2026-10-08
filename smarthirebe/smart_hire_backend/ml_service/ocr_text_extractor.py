# ml_service/ocr_text_extractor.py
import fitz  # PyMuPDF

def extract_text_from_pdf(path: str) -> str:
    """
    Extract text from PDF using PyMuPDF.
    Works for all layouts and is much better than pypdf.
    """
    try:
        doc = fitz.open(path)
        text = []
        for page in doc:
            text.append(page.get_text("text"))
        return "\n".join(text)
    except Exception as e:
        print("OCR PDF ERROR:", e)
        return ""
