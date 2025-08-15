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
python manage.py createsuperuser -> give admin username and password
```

### API Endpoints
- `POST /api/register/` — body: `{ "username": "...", "email": "...", "password": "..." }`
- `POST /api/login/` — body: `{ "username": "...", "password": "..." }` → returns `access`, `refresh`
- `POST /api/upload-csv/` — form-data: `file=<csv>` (JWT required). Validates 100–200 rows.
- `GET /api/processed-data/` — returns latest upload’s rows for user (JWT required)
- `GET /api/upload-summary/` — returns stats & average consumption on latest upload (JWT required)

## Quick Start (Frontend)
 - npm install
 - npm run dev
 this will run the frontend app in [http:](http://127.0.0.1:5173/)
