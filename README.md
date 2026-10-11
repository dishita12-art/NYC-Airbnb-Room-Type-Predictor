# NYC Room Type Predictor

A machine learning project that predicts the **room type** of a New York Airbnb listing (Entire home/apt, Private room, or Shared room) from its location, price, booking rules, reviews and host activity.

It includes:

- a trained scikit-learn pipeline (`model_pipeline.pkl`)
- a **FastAPI** backend that serves predictions
- a dark-theme web UI built with plain HTML, CSS and JavaScript
- a **Google Colab notebook** showing how the model was built

[![Open In Colab](https://colab.research.google.com/assets/colab-badge.svg)](https://colab.research.google.com/github/YOUR-USERNAME/YOUR-REPO/blob/main/notebooks/YOUR_NOTEBOOK.ipynb)



## Features

- Pick a borough and neighbourhood, then place the listing on an interactive map
- Adjust price, availability, minimum nights, reviews and host listings
- See the predicted room type with a confidence ring and probability bars
- Live mode that updates the prediction as you edit
- Example presets, a random listing button and recent prediction history
- Client-side validation that mirrors the backend rules

## Project structure

```
.
├── main.py               # FastAPI app (GET / and POST /predict)
├── model_pipeline.pkl    # Trained preprocessing + RandomForest pipeline
├── requirements.txt      # Python dependencies
├── index.html            # Web UI
├── style.css
├── script.js
└── notebooks/
    └── YOUR_NOTEBOOK.ipynb   # Colab notebook (training and evaluation)
```

## The model

| | |
|---|---|
| Task | Multiclass classification |
| Classes | Entire home/apt, Private room, Shared room |
| Classifier | `RandomForestClassifier` (200 trees, max depth 20, balanced class weights) |
| Numeric features | price, minimum_nights, number_of_reviews, reviews_per_month, calculated_host_listings_count, availability_365, latitude, longitude (median-imputed, standardised) |
| Categorical features | neighbourhood_group, neighbourhood (most-frequent imputed, one-hot encoded) |

Add your evaluation results here, for example accuracy and per-class F1 from the notebook.

## Getting started

### 1. Install

```bash
python -m venv .venv
# Windows
.venv\Scripts\activate
# macOS / Linux
source .venv/bin/activate

pip install -r requirements.txt
```

`scikit-learn` is pinned to `1.6.1` because that is the version the pipeline was saved with. Other versions may fail to load it or behave differently.

### 2. Run the API

```bash
uvicorn main:app --reload
```

The API runs at `http://127.0.0.1:8000`. Interactive docs are at `http://127.0.0.1:8000/docs`.

### 3. Open the UI

Open `index.html` in your browser, or serve it locally:

```bash
python -m http.server 5500
```

Then visit `http://localhost:5500`. If your API runs somewhere else, click the status pill at the top right and change the base URL.

## API

### `POST /predict`

Request body:

```json
{
  "neighbourhood_group": "Manhattan",
  "neighbourhood": "Midtown",
  "latitude": 40.7549,
  "longitude": -73.984,
  "price": 240,
  "minimum_nights": 3,
  "number_of_reviews": 85,
  "reviews_per_month": 2.1,
  "calculated_host_listings_count": 1,
  "availability_365": 180
}
```

Response:

```json
{
  "Predicted_room_type": "Entire home/apt",
  "Probability": [0.836, 0.132, 0.032]
}
```

`Probability` follows the class order: Entire home/apt, Private room, Shared room.

| Field | Rule |
|---|---|
| latitude | -90 to 90 |
| longitude | -180 to 180 |
| price | greater than 0 |
| minimum_nights | integer, 1 to 365 |
| number_of_reviews | integer, 0 or more |
| reviews_per_month | 0 or more |
| calculated_host_listings_count | integer, 0 or more |
| availability_365 | integer, 0 to 365 |

## Notes

- Only load `.pkl` files you trust. Pickle files can run code when loaded.
- The map picker is a stylised grid, not a real map. It sets latitude and longitude only; the neighbourhood comes from the dropdown.

## Tech stack

Python, FastAPI, Pydantic, scikit-learn, pandas, HTML, CSS, JavaScript

## License

Add a license of your choice (for example MIT).
