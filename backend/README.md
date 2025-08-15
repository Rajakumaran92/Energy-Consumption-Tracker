# Energy Consumption Tracker

Full-stack mini app (Django DRF + React) for uploading CSVs and visualizing energy data.

## Quick Start (Backend)
```bash
cd backend
python -m venv .venv && source .venv/bin/activate  # Windows: .venv\Scripts\activate
pip install -r requirements.txt

# Django setup
python manage.py migrate
python manage.py runserver 8000
```

### API Endpoints
- `POST /api/register/` — body: `{ "username": "...", "email": "...", "password": "..." }`
- `POST /api/login/` — body: `{ "username": "...", "password": "..." }` → returns `access`, `refresh`
- `POST /api/upload-csv/` — form-data: `file=<csv>` (JWT required). Validates 100–200 rows.
- `GET /api/processed-data/` — returns latest upload’s rows for user (JWT required)
- `GET /api/upload-summary/` — returns stats & average consumption on latest upload (JWT required)

## Quick Start (Frontend)
A lightweight React (CDN) app that talks to the backend. No bundler required.

```bash
cd frontend
python -m http.server 5173
# open http://localhost:5173 in your browser
```

Update `API_BASE` in `src/config.js` if your backend runs on another host/port.

## Sample CSV
A sample CSV with 150 rows is included at `sample_data/sample.csv` (headerless):
```
name,city,energy_consumption,date,price
John,New York,50.5,2025-03-01,25.25
...
```

## Notes
- Default DB is SQLite (file-based). Switch to MySQL/PostgreSQL via `DATABASES` in `settings.py`.
- CORS is open in dev. Tighten in production.
