import xgboost as xgb
import numpy as np
import json

# synthetic data for training
X = np.array([
    [8, 1, 1000],  # skills, exp_years, text_length
    [4, 0.5, 600],
    [12, 2, 1500]
])

y = np.array([85, 60, 92])

model = xgb.XGBRegressor()
model.fit(X, y)

model.save_model("model/xgb_ats.json")

print("Model saved!")
