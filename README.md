# NYC Room Type Predictor

A machine learning project that predicts the **room type** of a New York Airbnb listing (Entire home/apt, Private room, or Shared room) from its location, price, booking rules, reviews and host activity.

**Live demo:** https://dishita12-art.github.io/NYC-Airbnb-Room-Type-Predictor/
**API docs:** https://nyc-airbnb-room-type-predictor-3ryw.onrender.com/docs

[![Open In Colab](https://colab.research.google.com/assets/colab-badge.svg)](https://colab.research.google.com/github/dishita12-art/NYC-Airbnb-Room-Type-Predictor/blob/main/Nyc_airbnb_roomtype_classification.ipynb)

> The API runs on a free Render plan, which sleeps when idle. The first prediction after a break can take up to a minute while the server wakes up.

## What's inside

- A trained scikit-learn pipeline (`model_pipeline.pkl`)
- A **FastAPI** backend that serves predictions (deployed on Render)
- A dark-theme web UI built with plain HTML, CSS and JavaScript (deployed on GitHub Pages)
- A **Google Colab notebook** showing how the model was built

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
├── main.py                                  # FastAPI app (GET / and POST /predict)
├── model_pipeline.pkl                       # Trained preprocessing + RandomForest pipeline
├── requirements.txt                         # Python dependencies
├── index.html                               # Web UI
├── style.css
├── script.js
└── Nyc_airbnb_roomtype_classification.ipynb # Colab notebook (training and evaluation)
```

## The model

| | |
|---|---|
| Task | Multiclass classification |
| Classes | Entire home/apt, Private room, Shared room |
| Classifier | `RandomForestClassifier` (200 trees, max depth 20, balanced class weights) |
| Numeric features | price, minimum_nights, number_of_reviews, reviews_per_month, calculated_host_listings_count, availability_365, latitude, longitude (median-imputed, standardised) |
| Categorical features | neighbourhood_group, neighbourhood (most-frequent imputed, one-hot encoded) |
| Accuracy | Accuracy : 85% |

## Run it locally

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

### 2. Start the API

```bash
uvicorn main:app --reload
```

The API runs at `http://127.0.0.1:8000`, with interactive docs at `http://127.0.0.1:8000/docs`.

### 3. Open the UI

Open `index.html` in your browser. To use your local API, click the status pill at the top right and set the base URL to `http://127.0.0.1:8000`.

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

## Deployment

| Part | Platform | Notes |
|---|---|---|
| Backend | Render (web service) | Build: `pip install -r requirements.txt`. Start: `uvicorn main:app --host 0.0.0.0 --port $PORT`. Set `PYTHON_VERSION` to `3.12.8`. |
| Frontend | GitHub Pages | Served from the `main` branch, root folder. |

## Notes

- Only load `.pkl` files you trust. Pickle files can run code when loaded.
- The map picker is a stylised grid, not a real map. It sets latitude and longitude only; the neighbourhood comes from the dropdown.

## Tech stack

Python, FastAPI, Pydantic, scikit-learn, pandas, HTML, CSS, JavaScript

## Author

Dishita ([@dishita12-art](https://github.com/dishita12-art))
