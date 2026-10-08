import os
from pypdf import PdfReader

SOURCE = "raw_pdfs/"
TARGET = "data/resumes/"

os.makedirs(TARGET, exist_ok=True)

for file in os.listdir(SOURCE):
    if file.lower().endswith(".pdf"):
        path = os.path.join(SOURCE, file)
        reader = PdfReader(path)
        text = ""
        for page in reader.pages:
            text += page.extract_text() + "\n"

        out_name = file.replace(".pdf", ".txt")
        with open(os.path.join(TARGET, out_name), "w", encoding="utf-8") as f:
            f.write(text)

        print("Extracted →", out_name)
