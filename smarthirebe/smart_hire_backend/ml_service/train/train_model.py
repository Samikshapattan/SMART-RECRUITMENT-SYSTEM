# ml_service/train/train_model.py

import json
import joblib
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.linear_model import LogisticRegression

DATASET = "dataset.jsonl"
MODEL_OUT = "model.pkl"
VECT_OUT = "vectorizer.pkl"

texts = []
labels = []

with open(DATASET, encoding="utf-8") as f:
    for line in f:
        j = json.loads(line)
        texts.append(j["text"])
        labels.append(j["label"])

vectorizer = TfidfVectorizer(max_features=6000, ngram_range=(1,2))
X = vectorizer.fit_transform(texts)

model = LogisticRegression(max_iter=300)
model.fit(X, labels)

joblib.dump(model, MODEL_OUT)
joblib.dump(vectorizer, VECT_OUT)

print("Model + vectorizer saved!")
